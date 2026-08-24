import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
  ],
  controllers: [],
  providers: [RolesGuard],
})
export class AppModule {}
