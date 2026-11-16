import { useRouter } from "@tanstack/react-router";
import { useAuth } from "../../auth/auth-context";
import { AuthLayout } from "../../layouts/auth-layout";
import { PasswordUpdateForm } from "../../components/form/password-update-form";

export function UpdatePasswordPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe pour votre compte."
    >
      <PasswordUpdateForm
        idPrefix="reset"
        submitLabel="Mettre à jour le mot de passe"
        pendingLabel="Mise à jour…"
        onSuccess={async () => {
          await signOut().catch(() => undefined);
          await router.navigate({ to: "/auth/login" });
        }}
      />
    </AuthLayout>
  );
}
