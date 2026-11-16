import type { Session } from "@supabase/supabase-js";
import { getSupabaseFrontendClient } from "../../lib/supabase/client";
import type { AuthContextValue, SignInCredentials } from "../interfaces/auth";
import { apiFetch } from "../api/http-client";

const supabase = getSupabaseFrontendClient();

const MUST_REAUTH_KEY = "signeo:must-reauth";

function readMustReauth(): boolean {
  try {
    return localStorage.getItem(MUST_REAUTH_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMustReauth(value: boolean) {
  try {
    if (value) localStorage.setItem(MUST_REAUTH_KEY, "1");
    else localStorage.removeItem(MUST_REAUTH_KEY);
  } catch {
    // storage unavailable
  }
}

interface AuthState {
  session?: Session;
  isInitializing: boolean;
  mustReauth: boolean;
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
    mustReauth: state.mustReauth,
    signIn,
    signOut,
    requireReauth,
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

  writeMustReauth(false);
  setState({ session: data.session ?? undefined, mustReauth: false });
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  writeMustReauth(false);
  setState({ session: undefined, mustReauth: false });
}

function requireReauth() {
  writeMustReauth(true);
  setState({ mustReauth: true });
}

snapshot = buildSnapshot({
  session: undefined,
  isInitializing: true,
  mustReauth: readMustReauth(),
});

supabase.auth
  .getSession()
  .then(({ data }) => setState({ session: data.session ?? undefined }))
  .catch(() => setState({ session: undefined }))
  .finally(() => setState({ isInitializing: false }));

supabase.auth.onAuthStateChange((_event, nextSession) => {
  setState({ session: nextSession ?? undefined });
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
