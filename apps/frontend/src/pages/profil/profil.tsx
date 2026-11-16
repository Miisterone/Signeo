import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { IdCard } from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { useUser } from "../../hooks/useUser";
import { Card } from "../../components/ui/card";
import { Modal } from "../../components/ui/modal";
import { IdentityForm } from "./identity-form";
import { DetailList } from "../../components/ui/detail-list";
import { userDetailRows } from "./user-details";

export function ProfilPage() {
  const { session } = useAuth();
  const { data: user, isLoading, error } = useUser(session?.user.id);
  const { data: manager } = useUser(user?.managerId ?? undefined);
  const [managerOpen, setManagerOpen] = useState(false);

  if (isLoading)
    return <div className="p-6 text-sm text-subtle">Chargement…</div>;

  if (error)
    return <div className="p-6 text-sm text-danger">{error.message}</div>;

  if (!user) return null;

  const managerRow = {
    label: "Manager",
    value: manager ? (
      <span className="flex items-center gap-2">
        {manager.name}
        <button
          type="button"
          onClick={() => setManagerOpen(true)}
          aria-label="Voir la fiche du manager"
          className="rounded pl-2 text-sm font-semibold text-red underline underline-offset-2 transition-colors hover:cursor-pointer hover:text-red-dark"
        >
          <IdCard />
        </button>
      </span>
    ) : (
      "—"
    ),
  };

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <h1 className="text-xl font-semibold text-heading">Profil</h1>

      <IdentityForm key={user.id} user={user} />

      <Card id="card-job" title="Poste">
        <DetailList rows={[...userDetailRows(user), managerRow]} />
      </Card>

      <Card id="card-security" title="Sécurité">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-heading">Mot de passe</p>
            <p className="text-sm text-subtle">••••••••</p>
          </div>
          <Link
            to="/profil/update-password"
            className="shrink-0 rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-heading"
          >
            Modifier
          </Link>
        </div>
      </Card>

      <Modal
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        title="Manager"
      >
        {manager && (
          <DetailList rows={userDetailRows(manager, { contact: true })} />
        )}
      </Modal>
    </div>
  );
}
