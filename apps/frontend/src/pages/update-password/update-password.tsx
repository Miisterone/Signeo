import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";
import { AuthLayout } from "../../layouts/auth-layout";
import { PasswordField } from "../../components/form/password-field";
import { Button } from "../../components/ui/button";
import { FormError } from "../../components/ui/form-error";

export function UpdatePasswordPage() {
  const supabase = getSupabaseFrontendClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
      await router.navigate({
        to: "/auth/login",
        search: { redirect: "/dashboard" },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "La mise à jour du mot de passe a échoué",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe pour votre compte."
    >
      <form
        onSubmit={updatePassword}
        aria-label="Nouveau mot de passe"
        className="space-y-4"
      >
        <PasswordField
          id="password"
          label="Mot de passe"
          value={password}
          required
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
        />

        <PasswordField
          id="confirm-password"
          label="Confirmer le mot de passe"
          value={confirmPassword}
          required
          autoComplete="new-password"
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <FormError message={errorMessage} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
        </Button>
      </form>
    </AuthLayout>
  );
}
