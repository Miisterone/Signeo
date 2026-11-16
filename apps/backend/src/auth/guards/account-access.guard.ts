import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params, method } = context.switchToHttp().getRequest<{
      user?: { sub: string; role: Role };
      params: { id?: string };
      method: string;
    }>();

    if (!user || !params.id) {
      return false;
    }

    if (user.sub === params.id || user.role === Role.ADMIN) {
      return true;
    }

    if (method !== 'GET') {
      return false;
    }

    const self = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { managerId: true },
    });
    return self?.managerId === params.id;
  }
}
