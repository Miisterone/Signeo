import {
  HttpException,
  Injectable,
  UnauthorizedException,
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
      throw new HttpException('Incorrect email or password', 418);
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      const nextAttempt = (attemptCount?.attempt ?? 0) + 1;

      console.log({
        email: dto.email,
        currentAttempt: attemptCount?.attempt,
        nextAttempt,
        supabaseError: error.message,
      });

      await this.prisma.loginAttempt.upsert({
        where: { email: dto.email },
        create: {
          email: dto.email,
          attempt: nextAttempt,
          ip,
        },
        update: {
          ip,
          attempt: { increment: 1 },
          last_attempt: new Date(),
          blocked_until:
            nextAttempt >= 5
              ? new Date(Date.now() + 15 * 60 * 1000)
              : undefined,
        },
      });

      throw new UnauthorizedException('Incorrect email or password');
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
