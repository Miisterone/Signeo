import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../../generated/prisma/enums';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock } };

  function createContext(user: { sub?: string } | undefined): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    prisma = { user: { findUnique: jest.fn() } };
    guard = new RolesGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );
  });

  it('no roles required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(createContext({ sub: 'user-1' })),
    ).resolves.toBe(true);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('no authenticated user', async () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    await expect(guard.canActivate(createContext(undefined))).resolves.toBe(
      false,
    );
  });

  it('role matches the database role', async () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    prisma.user.findUnique.mockResolvedValue({
      role: Role.ADMIN,
      isActive: true,
    });

    await expect(
      guard.canActivate(createContext({ sub: 'user-1' })),
    ).resolves.toBe(true);
  });

  it('role does not match the database role', async () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    prisma.user.findUnique.mockResolvedValue({
      role: Role.AGENT,
      isActive: true,
    });

    await expect(
      guard.canActivate(createContext({ sub: 'user-1' })),
    ).resolves.toBe(false);
  });

  it('inactive user is rejected', async () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    prisma.user.findUnique.mockResolvedValue({
      role: Role.ADMIN,
      isActive: false,
    });

    await expect(
      guard.canActivate(createContext({ sub: 'user-1' })),
    ).resolves.toBe(false);
  });

  it('unknown user is rejected', async () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ sub: 'ghost' })),
    ).resolves.toBe(false);
  });
});
