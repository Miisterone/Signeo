import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getUser, updateUser, type UserPatch } from "../api/users";

export const userKeys = {
  detail: (id: string | undefined) => ["users", id] as const,
};

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: id ? () => getUser(id) : skipToken,
  });
}

export function useUpdateUser(id: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UserPatch) =>
      id
        ? updateUser(id, patch)
        : Promise.reject(new Error("Identifiant utilisateur manquant")),
    onSuccess: (updated) => queryClient.setQueryData(userKeys.detail(id), updated),
  });
}
