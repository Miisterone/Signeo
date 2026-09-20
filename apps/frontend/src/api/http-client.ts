import { getSupabaseFrontendClient } from "../../lib/supabase/client";

const API_URL = import.meta.env.VITE_API_URL;
const supabase = getSupabaseFrontendClient();

function buildHeaders(options: RequestInit, token?: string): Headers {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function readErrorMessage(response: Response): Promise<string> {
  const body: { message?: string | string[] } = await response
    .json()
    .catch(() => ({}));

  if (Array.isArray(body.message)) {
    return body.message.join(", ");
  }

  return body.message ?? `HTTP ${response.status}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options, data.session?.access_token),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}