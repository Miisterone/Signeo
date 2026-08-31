interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TANSTACK_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}