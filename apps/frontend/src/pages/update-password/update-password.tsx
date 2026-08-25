import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";

export function UpdatePasswordPage() {
  const supabase = getSupabaseFrontendClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: confirmPassword });
      if (error) {
        throw error;
      }
      await router.navigate({ to: "/auth/login", search: { redirect: "/dashboard" } });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Update Password Failed",
      );
    }
  };

  return (
    <>
      <h1>Update Password</h1>
      <form onSubmit={resetPassword}>
        <input
          type="password"
          value={password}
          autoComplete="new-password"
          placeholder="password"
          onChange={(event) => setPassword(event.target.value)}
        />

        <input
          type="confirmPassword"
          value={confirmPassword}
          autoComplete="new-password"
          placeholder="Confirm password"
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}

        <button type="submit" disabled={isSubmitting}>
          Valider
        </button>
      </form>
    </>
  );
}
