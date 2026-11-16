import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/users/createUser.dto';
import { UpdateUserDto } from '../dto/users/updateUser.dto';
import { UpdateManagerUserDto } from '../dto/users/updatemanagerUser.dto';
import { SUPABASE_ADMIN } from '../supabase/supabase-admin.provider';

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

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

function mapPrismaError(error: unknown): never {
  if (hasPrismaCode(error, 'P2002')) {
    throw new ConflictException('Email already in use');
  }
  if (hasPrismaCode(error, 'P2003')) {
    throw new BadRequestException('Manager not found');
  }
  throw error;
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
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
  ) {}

  async create(dto: CreateUserDto) {
    
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });
    if (error || !data.user) {
      if (error?.status === 422) {
        throw new ConflictException('Email already in use');
      }
      throw error ?? new Error('Supabase user creation failed');
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          id: data.user.id,
          email: dto.email,
          name: dto.name,
          phone: dto.phone,
          role: dto.role,
          isActive: dto.isActive ?? true,
          hiredAt: dto.hiredAt ? new Date(dto.hiredAt) : new Date(),
          managerId: dto.managerId,
        },
        select: userSelect,
      });
      return withSeniority(user);
    } catch (error) {
      await this.supabase.auth.admin.deleteUser(data.user.id);
      mapPrismaError(error);
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
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: dto,
        select: userSelect,
      });
      return withSeniority(user);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async updateManager(id: string, dto: UpdateManagerUserDto) {
    await this.findOne(id);
    if (dto.managerId !== null) {
      await this.assertNoHierarchyCycle(id, dto.managerId);
    }
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { managerId: dto.managerId },
        select: userSelect,
      });
      return withSeniority(user);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error && error.status !== 404) {
      throw error;
    }
  }

  private async assertNoHierarchyCycle(id: string, managerId: string) {
    let current: string | null = managerId;
    const seen = new Set<string>();
    while (current && !seen.has(current)) {
      if (current === id) {
        throw new BadRequestException(
          'A user cannot be managed by themselves or one of their reports',
        );
      }
      seen.add(current);
      const next: { managerId: string | null } | null =
        await this.prisma.user.findUnique({
          where: { id: current },
          select: { managerId: true },
        });
      if (!next) {
        throw new BadRequestException('Manager not found');
      }
      current = next.managerId;
    }
  }
}
