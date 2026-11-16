import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { supabaseAdminProvider } from '../supabase/supabase-admin.provider';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, supabaseAdminProvider],
  exports: [UserService],
})
export class UserModule {}
