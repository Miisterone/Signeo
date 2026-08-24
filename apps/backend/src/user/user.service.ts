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
  role: true,
  seniority: true,
  hiredAt: true,
  isActive: true,
  managerId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError
  );
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const date = Date.now();

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
          role: dto.role,
          seniority: 0,
          hiredAt: new Date(date).toLocaleDateString('fr-FR'),
          managerId: dto.managerId,
        },
        select: userSelect,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(
          `User already exist`,
        );
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.user.findMany({ select: userSelect });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelect,
    });
  }

  async updateManager(id: string, dto: UpdateManagerUserDto){
    await this.findOne(id);
    return this.prisma.user.update({
      where: {id},
      data: dto,
      select: userSelect,
    })
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
