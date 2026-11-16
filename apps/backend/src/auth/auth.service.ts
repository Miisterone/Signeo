import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { LoginUserDto } from '../dto/auth/loginUser.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_ANON_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }

  async login(dto: LoginUserDto, ip: string) {
    const attemptCount = await this.prisma.loginAttempt.findUnique({
      where: { email: dto.email },
    });

    if (
      attemptCount?.blocked_until &&
      attemptCount.blocked_until > new Date()
    ) {
      throw new HttpException(
        'Too many login attempts, please try again in 15 minutes',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      if (error.status === 500) {
        throw new InternalServerErrorException('Internal server error');
      }

      const blockExpired = attemptCount?.blocked_until != null;
      const nextAttempt = blockExpired ? 1 : (attemptCount?.attempt ?? 0) + 1;

      await this.prisma.loginAttempt.upsert({
        where: { email: dto.email },
        create: {
          email: dto.email,
          attempt: nextAttempt,
          ip,
        },
        update: {
          ip,
          attempt: blockExpired ? 1 : { increment: 1 },
          last_attempt: new Date(),
          blocked_until:
            nextAttempt >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });

      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.loginAttempt.upsert({
      where: { email: dto.email },
      create: {
        email: dto.email,
        ip,
        last_login: new Date(),
      },
      update: {
        ip,
        attempt: 0,
        blocked_until: null,
        last_login: new Date(),
      },
    });

    return {
      user: data.user,
      session: data.session,
    };
  }
}
