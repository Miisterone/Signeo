import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  canActivate(context: ExecutionContext): boolean {
    const { user, params } = context.switchToHttp().getRequest<{
      user?: { sub: string; role: Role };
      params: { id?: string };
    }>();

    if (!user || !params.id) {
      return false;
    }

    return user.sub === params.id || user.role === Role.ADMIN;
  }
}
