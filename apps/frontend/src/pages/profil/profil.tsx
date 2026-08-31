import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/auth-context";
import type { User } from "../../interfaces/user";

export function ProfilPage() {
  const { session } = useAuth();
  const token = session?.access_token;
  const userId = session?.user.id;

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User> => {
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      return res.json();
    },
  });

  const { data: manager } = useQuery({
      queryKey: ["users", user?.managerId],
      enabled: !!token && !!user?.managerId,
      queryFn: async (): Promise<User> => {
        const res = await fetch(`http://localhost:3000/users/${user!.managerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
    });

  if (isLoading) return <div className="p-6">Chargement…</div>;
  if (error)
    return <div className="p-6">Erreur : {(error as Error).message}</div>;
  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-heading">Profil</h1>
      <br></br>
      <p>Email: {user.email}</p>
      <br></br>
      <p>Nom: {user.name}</p>
      <br></br>
      <p>Rôle: {user.role}</p>
      <br></br>
      <p>Ancienneté: {user.seniority}</p>
      <br></br>
      <p>Embaucher à : {user.hiredAt ? new Date(user.hiredAt).toLocaleDateString("fr-FR") : ""}</p>
      <br></br>
      <p>Manager: {manager?.name}</p>
    </div>
  );
}
