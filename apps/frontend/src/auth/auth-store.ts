import type { Session } from "@supabase/supabase-js";
import { getSupabaseFrontendClient } from "../../lib/supabase/client";
import type { AuthContextValue, SignInCredentials } from "../interfaces/auth";
import { apiFetch } from "../api/http-client";

const supabase = getSupabaseFrontendClient();

interface AuthState {
  session?: Session;
  isInitializing: boolean;
}

const listeners = new Set<() => void>();
let snapshot: AuthContextValue;

function setState(patch: Partial<AuthState>) {
  snapshot = buildSnapshot({ ...snapshot, ...patch });
  listeners.forEach((listener) => listener());
}

// Updated synchronously: anything reading the store (router guards included)
// sees the new state immediately, no React render needed.
function buildSnapshot(state: AuthState): AuthContextValue {
  return {
    session: state.session,
    isAuthenticated: state.session !== undefined,
    isInitializing: state.isInitializing,
    signIn,
    signOut,
  };
}

async function signIn({ email, password }: SignInCredentials) {
  const response = await apiFetch<{ session: Session | null }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.session) {
    throw new Error();
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: response.session.access_token,
    refresh_token: response.session.refresh_token,
  });

  if (error) {
    throw error;
  }

  setState({ session: data.session ?? undefined });
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  setState({ session: undefined });
}

snapshot = buildSnapshot({ session: undefined, isInitializing: true });

// Fires INITIAL_SESSION on startup, then on every sign-in/out/refresh.
supabase.auth.onAuthStateChange((_event, nextSession) => {
  setState({ session: nextSession ?? undefined, isInitializing: false });
});

export const authStore = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
