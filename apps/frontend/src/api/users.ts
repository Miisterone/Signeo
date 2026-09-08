import type { User } from "../interfaces/user";
import { apiFetch } from "./http-client";

export const getUser = (id: string): Promise<User> =>
  apiFetch<User>(`/users/${id}`);

export const updateUser = (id: string, patch: Partial<User>): Promise<User> =>
  apiFetch<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
