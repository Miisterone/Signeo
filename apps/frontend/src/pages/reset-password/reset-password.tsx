import { useState, type FormEvent } from "react";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";
import { Link } from "@tanstack/react-router";

export function ResetPasswordPage() {
  const supabase = getSupabaseFrontendClient();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    setIsSubmitting(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Reset password failed",
      );
    }
  };

  return (
    <>
      <h1>Reset Password</h1>
      <form onSubmit={resetPassword}>
        <input
          type="email"
          value={email}
          autoComplete="email"
          placeholder="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}

        <button type="submit" disabled={isSubmitting}>
          Valider
        </button>
        <p>
          <Link to="/auth/login" search={{ redirect: '/dashboard' }}>S'inscrire</Link>
        </p>
      </form>
    </>
  );
}
