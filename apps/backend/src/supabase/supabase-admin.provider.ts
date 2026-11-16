import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_ADMIN = Symbol('SUPABASE_ADMIN');

export const supabaseAdminProvider: Provider<SupabaseClient> = {
  provide: SUPABASE_ADMIN,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    ),
};
