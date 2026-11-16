import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { supabaseAnonProvider } from '../supabase/supabase-anon.provider';
import { supabaseAdminProvider } from '../supabase/supabase-admin.provider';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [
    SupabaseStrategy,
    AuthService,
    supabaseAnonProvider,
    supabaseAdminProvider,
  ],
  controllers: [AuthController],
  exports: [PassportModule],
})
export class AuthModule {}
