import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [SupabaseStrategy, AuthService],
  controllers: [AuthController],
  exports: [PassportModule],
})
export class AuthModule {}
