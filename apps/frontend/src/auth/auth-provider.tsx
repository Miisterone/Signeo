import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseFrontendClient } from '../../lib/supabase/client'
import type { AuthContextValue, SignInCredentials, SignUpCredentials } from '../interfaces/auth.model'

const supabase = getSupabaseFrontendClient()

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? undefined)
      setIsInitializing(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? undefined)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user,
      isAuthenticated: session !== undefined,
      isInitializing,
      signIn: async ({ email, password }: SignInCredentials) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          throw error
        }
        setSession(data.session ?? undefined)
      },
      signUp: async ({ email, password }: SignUpCredentials) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          throw error
        }
        setSession(data.session ?? undefined)
        return { needsEmailConfirmation: data.session === null }
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
          throw error
        }
        setSession(undefined)
      },
    }),
    [session, isInitializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('Error useAuth()')
  }

  return context
}