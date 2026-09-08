import type { Session } from '@supabase/supabase-js'

export interface SignInCredentials {
  readonly email: string
  readonly password: string
}

export interface AuthContextValue {
  readonly session?: Session
  readonly isAuthenticated: boolean
  readonly isInitializing: boolean
  readonly mustReauth: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
  requireReauth: () => void
}
