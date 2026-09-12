import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseFrontendClient } from "../../lib/supabase/client";
import type { AuthContextValue, SignInCredentials } from "../interfaces/auth";
import { AuthContext } from "./auth-context";

const supabase = getSupabaseFrontendClient();

const MUST_REAUTH_KEY = "signeo:must-reauth";

function readMustReauth(): boolean {
  try {
    return localStorage.getItem(MUST_REAUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);
  const [mustReauth, setMustReauth] = useState<boolean>(readMustReauth);

  const requireReauth = useCallback(() => {
    try {
      localStorage.setItem(MUST_REAUTH_KEY, "1");
    } catch {
      // storage unavailable
    }
    setMustReauth(true);
  }, []);

  const clearMustReauth = useCallback(() => {
    try {
      localStorage.removeItem(MUST_REAUTH_KEY);
    } catch {
      // ignore
    }
    setMustReauth(false);
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session ?? undefined))
      .catch(() => setSession(undefined))
      .finally(() => setIsInitializing(false));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? undefined);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== undefined,
      isInitializing,
      mustReauth,
      signIn: async ({ email, password }: SignInCredentials) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw error;
        }
        setSession(data.session ?? undefined);
        clearMustReauth();
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        setSession(undefined);
        clearMustReauth();
      },
      requireReauth,
    }),
    [session, isInitializing, mustReauth, requireReauth, clearMustReauth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
