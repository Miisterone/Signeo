import { useState } from "react";
import type { FormEvent } from "react";
import { getRouteApi, Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../auth/auth-context";
import { AuthLayout } from "../../components/auth-layout";
import { TextField } from "../../components/text-field";
import { PasswordField } from "../../components/password-field";
import { Button } from "../../components/button";
import { FormError } from "../../components/form-error";

const routeApi = getRouteApi("/auth/login");

export function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { redirect } = routeApi.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      await router.invalidate();
      await router.navigate({ to: redirect });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Connexion impossible",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Connectez-vous à <br />
          <span className="text-red">Signeo</span>
        </>
      }
    >
      <form onSubmit={handleSubmit} aria-label="Connexion" className="space-y-4">
        <TextField
          id="email"
          label="E-mail"
          type="email"
          value={email}
          required
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />

        <PasswordField
          id="password"
          label="Mot de passe"
          value={password}
          required
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="text-sm">
          <Link
            className="font-semibold hover:underline"
            to="/auth/reset-password"
            search={{ redirect: "/dashboard" }}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <FormError message={errorMessage} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Connexion en cours…" : "Se connecter"}
        </Button>
      </form>
    </AuthLayout>
  );
}
