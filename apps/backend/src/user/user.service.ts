import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateManagerUserDto } from './dto/updatemanagerUser.dto';

const PASSWORD_SALT_ROUNDS = 10;

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  hiredAt: true,
  isActive: true,
  managerId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function computeSeniority(hiredAt: Date | null): number | null {
  if (!hiredAt) {
    return null;
  }

  const now = new Date();
  let months =
    (now.getFullYear() - hiredAt.getFullYear()) * 12 +
    (now.getMonth() - hiredAt.getMonth());
  if (now.getDate() < hiredAt.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}

function withSeniority<T extends { hiredAt: Date | null }>(user: T) {
  return { ...user, seniority: computeSeniority(user.hiredAt) };
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
          phone: dto.phone,
          role: dto.role,
          hiredAt: dto.hiredAt ? new Date(dto.hiredAt) : new Date(),
          managerId: dto.managerId,
        },
        select: userSelect,
      });
      return withSeniority(user);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(`User already exist`);
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ select: userSelect });
    return users.map(withSeniority);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return withSeniority(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelect,
    });
    return withSeniority(user);
  }

  async updateManager(id: string, dto: UpdateManagerUserDto) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelect,
    });
    return withSeniority(user);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
