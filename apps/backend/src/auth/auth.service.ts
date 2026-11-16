import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthError, SupabaseClient } from '@supabase/supabase-js';
import { LoginUserDto } from '../dto/auth/loginUser.dto';
import { ChangePasswordDto } from '../dto/auth/changePassword.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SUPABASE_ANON } from '../supabase/supabase-anon.provider';
import { SUPABASE_ADMIN } from '../supabase/supabase-admin.provider';

const MAX_ATTEMPTS = 5;
const BLOCK_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_ANON) private readonly supabase: SupabaseClient,
    @Inject(SUPABASE_ADMIN) private readonly supabaseAdmin: SupabaseClient,
  ) {}

  async login(dto: LoginUserDto, ip: string) {
    const { data, error } = await this.checkPassword(
      dto.email,
      dto.password,
      ip,
    );
    if (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Changes the password of the logged-in user after checking the current
   * one. The check goes through the same lockout as the login, so this
   * route cannot be used to guess a password.
   */
  async changePassword(userId: string, dto: ChangePasswordDto, ip: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const { error } = await this.checkPassword(
      user.email,
      dto.currentPassword,
      ip,
    );
    if (error) {
      throw new BadRequestException('Current password is incorrect');
    }

    const { error: updateError } =
      await this.supabaseAdmin.auth.admin.updateUserById(userId, {
        password: dto.newPassword,
      });
    if (updateError) {
      throw new BadRequestException(updateError.message);
    }
  }

  /**
   * Signs in with Supabase while enforcing the attempt counter: rejects a
   * blocked email, counts failures and resets the counter on success.
   * Returns Supabase's result so the caller picks the HTTP error.
   */
  private async checkPassword(email: string, password: string, ip: string) {
    const attemptCount = await this.prisma.loginAttempt.findUnique({
      where: { email },
    });

    if (
      attemptCount?.blocked_until &&
      attemptCount.blocked_until > new Date()
    ) {
      throw new HttpException(
        `Too many login attempts, please try again in ${BLOCK_MINUTES} minutes`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const result = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (result.error) {
      await this.recordFailure(email, ip, result.error, attemptCount);
      return result;
    }

    await this.prisma.loginAttempt.upsert({
      where: { email },
      create: { email, ip, last_login: new Date() },
      update: { ip, attempt: 0, blocked_until: null, last_login: new Date() },
    });

    return result;
  }

  private async recordFailure(
    email: string,
    ip: string,
    error: AuthError,
    attemptCount: { attempt: number; blocked_until: Date | null } | null,
  ) {
    if (error.status === 500) {
      throw new InternalServerErrorException('Internal server error');
    }

    // A previous block has expired at this point: start counting again.
    const wasBlocked = attemptCount?.blocked_until != null;
    const attempt = wasBlocked ? 1 : (attemptCount?.attempt ?? 0) + 1;
    const blocked_until =
      attempt >= MAX_ATTEMPTS
        ? new Date(Date.now() + BLOCK_MINUTES * 60_000)
        : null;

    await this.prisma.loginAttempt.upsert({
      where: { email },
      create: { email, ip, attempt, blocked_until },
      update: { ip, attempt, blocked_until, last_attempt: new Date() },
    });
  }
}
