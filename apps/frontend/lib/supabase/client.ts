import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | undefined

export function getSupabaseFrontendClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is missing')
  }

  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is missing')
  }

  if (!cachedClient) {
    cachedClient = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
    )
  }

  return cachedClient
}