import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";
import { AuthLayout } from "../../components/auth-layout";
import { TextField } from "../../components/text-field";
import { Button } from "../../components/button";
import { FormError } from "../../components/form-error";

export function ResetPasswordPage() {
  const supabase = getSupabaseFrontendClient();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) {
        throw error;
      }
      setIsSent(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "L'envoi de l'e-mail a échoué",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entrez votre e-mail et nous vous enverrons un lien pour définir un nouveau mot de passe."
    >
      {isSent ? (
        <div className="space-y-4">
          <p className="rounded-md border border-line bg-card px-3 py-2 text-sm text-body">
            Si un compte est associé à {email}, un e-mail avec les instructions
            vient d'être envoyé.
          </p>
          <p className="text-sm">
            <Link
              className="font-semibold hover:underline"
              to="/auth/login"
              search={{ redirect: "/dashboard" }}
            >
              Retour à la connexion
            </Link>
          </p>
        </div>
      ) : (
        <form
          onSubmit={resetPassword}
          aria-label="Réinitialisation du mot de passe"
          className="space-y-4"
        >
          <TextField
            id="email"
            label="E-mail"
            type="email"
            value={email}
            required
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />

          <FormError message={errorMessage} />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours…" : "Envoyer le lien"}
          </Button>

          <p className="text-sm">
            <Link
              className="font-semibold hover:underline"
              to="/auth/login"
              search={{ redirect: "/dashboard" }}
            >
              Retour à la connexion
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
