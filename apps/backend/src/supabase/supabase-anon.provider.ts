import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_ANON = Symbol('SUPABASE_ANON');

/** Supabase client using the public anon key, for password sign-in. */
export const supabaseAnonProvider: Provider<SupabaseClient> = {
  provide: SUPABASE_ANON,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_ANON_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    ),
};
