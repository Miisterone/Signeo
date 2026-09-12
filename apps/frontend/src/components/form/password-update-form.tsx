import { useState } from "react";
import type { FormEvent } from "react";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";
import { PasswordField } from "./password-field";
import { PasswordStrength } from "./password-strength";
import { Button } from "../ui/button";
import { FormError } from "../ui/form-error";

interface PasswordUpdateFormProps {
  idPrefix: string;
  submitLabel: string;
  pendingLabel: string;
  onSuccess?: () => void;
  requireCurrentPassword?: boolean;
  userEmail?: string;
}

export function PasswordUpdateForm({
  idPrefix,
  submitLabel,
  pendingLabel,
  onSuccess,
  requireCurrentPassword = false,
  userEmail,
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

    const trimmedEmail = userEmail?.trim() ?? "";
    if (requireCurrentPassword && trimmedEmail === "") {
      setErrorMessage(
        "Impossible de vérifier votre identité. Reconnectez-vous puis réessayez.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (requireCurrentPassword) {
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: currentPassword,
        });
        if (reauthError) {
          throw new Error("Mot de passe actuel incorrect.");
        }
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      // Kick the other devices out after a password change.
      await supabase.auth.signOut({ scope: "others" }).catch(() => undefined);

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setIsSubmitting(false);
      onSuccess?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "La mise à jour du mot de passe a échoué",
      );
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
