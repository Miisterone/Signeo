import { BadRequestException, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('AuthService.changePassword', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock };
    loginAttempt: { findUnique: jest.Mock; upsert: jest.Mock };
  };
  let signInWithPassword: jest.Mock;
  let updateUserById: jest.Mock;

  const dto = { currentPassword: 'old-password', newPassword: 'new-password' };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ email: 'joris@signo.com' }),
      },
      loginAttempt: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
      },
    };
    signInWithPassword = jest.fn().mockResolvedValue({ data: {}, error: null });
    updateUserById = jest.fn().mockResolvedValue({ error: null });

    service = new AuthService(
      prisma as unknown as PrismaService,
      { auth: { signInWithPassword } } as unknown as SupabaseClient,
      { auth: { admin: { updateUserById } } } as unknown as SupabaseClient,
    );
  });

  it('updates the password when the current one is correct', async () => {
    await service.changePassword('user-1', dto, '1.2.3.4');

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'joris@signo.com',
      password: 'old-password',
    });
    expect(updateUserById).toHaveBeenCalledWith('user-1', {
      password: 'new-password',
    });
  });

  it('rejects a wrong current password and counts the attempt', async () => {
    signInWithPassword.mockResolvedValue({
      data: {},
      error: { status: 400, message: 'Invalid login credentials' },
    });

    await expect(
      service.changePassword('user-1', dto, '1.2.3.4'),
    ).rejects.toThrow(BadRequestException);
    expect(updateUserById).not.toHaveBeenCalled();
    const [upsertArgs] = prisma.loginAttempt.upsert.mock.calls[0] as [
      { update: { attempt: number } },
    ];
    expect(upsertArgs.update.attempt).toBe(1);
  });

  it('refuses when the account is blocked', async () => {
    prisma.loginAttempt.findUnique.mockResolvedValue({
      attempt: 5,
      blocked_until: new Date(Date.now() + 60_000),
    });

    await expect(
      service.changePassword('user-1', dto, '1.2.3.4'),
    ).rejects.toThrow(HttpException);
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
  });
});
