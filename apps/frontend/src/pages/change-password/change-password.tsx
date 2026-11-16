import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../auth/auth-context";
import { PasswordUpdateForm } from "../../components/form/password-update-form";

export function ChangePasswordPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <div className="space-y-2">
        <Link
          to="/profil"
          className="text-sm font-semibold text-subtle transition-colors hover:text-heading"
        >
          <p>{"<-"} Retour au profil</p>
        </Link>
        <h1 className="pt-2 text-xl font-semibold text-heading">
          Modifier le mot de passe
        </h1>
      </div>

      <div className="max-w-sm">
        <PasswordUpdateForm
          idPrefix="change-password"
          requireCurrentPassword
          submitLabel="Enregistrer le nouveau mot de passe"
          pendingLabel="Enregistrement…"
          onSuccess={async () => {
            await signOut().catch(() => undefined);
            await router.navigate({
              to: "/auth/login",
              search: { reason: "password-changed" },
            });
          }}
        />
      </div>
    </div>
  );
}
