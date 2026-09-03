import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { sub?: string; role?: Role };
      params: { id?: string };
    }>();

    const callerId = request.user?.sub;
    const targetId = request.params.id;

    if (!callerId || !targetId) {
      return false;
    }

    if (callerId === targetId) {
      return true;
    }

    const caller = await this.prisma.user.findUnique({
      where: { id: callerId },
      select: { role: true, isActive: true },
    });

    return Boolean(caller?.isActive) && caller?.role === Role.ADMIN;
  }
}
