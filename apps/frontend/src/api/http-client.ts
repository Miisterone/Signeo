import { getSupabaseFrontendClient } from "../../lib/supabase/client";

const API_URL = import.meta.env.VITE_API_URL;

const supabase = getSupabaseFrontendClient();

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Grab the token fresh each call — Supabase may have refreshed an expired JWT.
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body: { message?: string | string[] } = await res
      .json()
      .catch(() => ({}));
    // NestJS returns validation errors as an array; other errors as a plain string.
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message;
    throw new Error(message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
