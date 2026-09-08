import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "../interfaces/user";
import { getUser, updateUser } from "../api/users";

export const userKeys = {
  detail: (id: string | undefined) => ["users", id] as const,
};

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id),
    enabled: !!id,
    queryFn: () =>
      id
        ? getUser(id)
        : Promise.reject(new Error("Identifiant utilisateur manquant")),
  });
}

export function useUpdateUser(id: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<User>) =>
      id
        ? updateUser(id, patch)
        : Promise.reject(new Error("Identifiant utilisateur manquant")),
    onSuccess: (updated) => queryClient.setQueryData(userKeys.detail(id), updated),
  });
}
