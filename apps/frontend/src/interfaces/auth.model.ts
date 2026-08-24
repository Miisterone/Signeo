import type { Session, User } from '@supabase/supabase-js'

export interface SignInCredentials {
  readonly email: string
  readonly password: string
}

export interface SignUpCredentials {
  readonly email: string
  readonly password: string
}

export interface SignUpResult {
  readonly needsEmailConfirmation: boolean
}

export interface AuthContextValue {
  readonly session?: Session
  readonly user?: User
  readonly isAuthenticated: boolean
  readonly isInitializing: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<SignUpResult>
  signOut: () => Promise<void>
}