import { useRouter } from "@tanstack/react-router";
import { AuthLayout } from "../../layouts/auth-layout";
import { PasswordUpdateForm } from "../../components/form/password-update-form";

export function UpdatePasswordPage() {
  const router = useRouter();

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe pour votre compte."
    >
      <PasswordUpdateForm
        idPrefix="reset"
        submitLabel="Mettre à jour le mot de passe"
        pendingLabel="Mise à jour…"
        onSuccess={() => router.navigate({ to: "/auth/login" })}
      />
    </AuthLayout>
  );
}
