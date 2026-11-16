import type { User } from "../interfaces/user";
import { apiFetch } from "./http-client";

export const getUser = (id: string): Promise<User> =>
  apiFetch<User>(`/users/${id}`);

export type UserPatch = Partial<Pick<User, "name" | "phone">>;

export const updateUser = (id: string, patch: UserPatch): Promise<User> =>
  apiFetch<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
