import { useState } from "react";
import type { FormEvent } from "react";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";
import { PasswordField } from "./password-field";
import { PasswordStrength } from "./password-strength";
import { Button } from "../ui/button";
import { FormError } from "../ui/form-error";
import { ApiError, apiFetch } from "../../api/http-client";

interface PasswordUpdateFormProps {
  idPrefix: string;
  submitLabel: string;
  pendingLabel: string;
  onSuccess?: () => void;
  requireCurrentPassword?: boolean;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "Trop de tentatives. Réessayez dans 15 minutes.";
    }
    if (error.status === 400 && error.message.includes("Current password")) {
      return "Mot de passe actuel incorrect.";
    }
  }
  return error instanceof Error
    ? error.message
    : "La mise à jour du mot de passe a échoué";
}

export function PasswordUpdateForm({
  idPrefix,
  submitLabel,
  pendingLabel,
  onSuccess,
  requireCurrentPassword = false,
}: PasswordUpdateFormProps) {
  const supabase = getSupabaseFrontendClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (requireCurrentPassword) {
        // Checked by the backend, which applies the login lockout.
        await apiFetch<void>("/auth/change-password", {
          method: "POST",
          body: JSON.stringify({ currentPassword, newPassword: password }),
        });
      } else {
        // Recovery flow: the e-mail link already proved the identity.
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          throw error;
        }
      }

      // The pages' onSuccess signs out globally, which also ends the
      // sessions on other devices.
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      onSuccess?.();
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFeedback = () => {
    if (errorMessage) setErrorMessage(undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Modification du mot de passe"
      className="space-y-4"
    >
      {requireCurrentPassword && (
        <PasswordField
          id={`${idPrefix}-current`}
          label="Mot de passe actuel"
          value={currentPassword}
          required
          autoComplete="current-password"
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            clearFeedback();
          }}
        />
      )}

      <div className="space-y-2">
        <PasswordField
          id={`${idPrefix}-password`}
          label="Nouveau mot de passe"
          value={password}
          required
          autoComplete="new-password"
          onChange={(event) => {
            setPassword(event.target.value);
            clearFeedback();
          }}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordField
        id={`${idPrefix}-confirm-password`}
        label="Confirmer le mot de passe"
        value={confirmPassword}
        required
        autoComplete="new-password"
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          clearFeedback();
        }}
      />

      <FormError message={errorMessage} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
