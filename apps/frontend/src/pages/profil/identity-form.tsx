import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";
import type { UserPatch } from "../../api/users";
import type { User } from "../../interfaces/user";
import { useUpdateUser } from "../../hooks/use-user";
import { Card } from "../../components/ui/card";

const inputClass =
  "w-full rounded-md border border-line-strong bg-card px-3 py-2 text-sm text-heading outline-none transition-colors hover:border-heading focus:border-red";

interface IdentityFormValues {
  name: string;
  email: string;
  phone: string;
}

function toForm(user: User): IdentityFormValues {
  return { name: user.name ?? "", email: user.email, phone: user.phone ?? "" };
}

function EditableRow({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[10rem_1fr] items-center gap-4 py-2.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-heading">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Mount with `key={user.id}`: the form state is initialised from `user`. */
export function IdentityForm({ user }: { user: User }) {
  const supabase = getSupabaseFrontendClient();
  const updateUser = useUpdateUser(user.id);

  const [form, setForm] = useState(() => toForm(user));
  const [emailNotice, setEmailNotice] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();

  const initial = toForm(user);
  const dirty =
    form.name !== initial.name ||
    form.email !== initial.email ||
    form.phone !== initial.phone;
  const invalid = form.name.trim() === "" || form.email.trim() === "";
  const saved = updateUser.isSuccess && !dirty;

  const update =
    (field: keyof IdentityFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dirty || invalid) return;

    setEmailNotice(undefined);
    setEmailError(undefined);

    const patch: UserPatch = {};
    if (form.name !== initial.name) patch.name = form.name;
    if (form.phone !== initial.phone) patch.phone = form.phone;

    if (form.email !== initial.email) {
      const { error } = await supabase.auth.updateUser({ email: form.email });
      if (error) {
        setEmailError(error.message);
        return;
      }
      // The backend picks up the new email once it is confirmed in Supabase.
      setEmailNotice(
        "Un e-mail de confirmation vous a été envoyé. La nouvelle adresse sera active après validation.",
      );
    }

    if (Object.keys(patch).length === 0) {
      setForm((previous) => ({ ...previous, email: initial.email }));
      return;
    }

    updateUser.mutate(patch, {
      onSuccess: (updated) => setForm(toForm(updated)),
    });
  };

  const status = invalid
    ? { text: "Nom et e-mail obligatoires.", className: "text-danger" }
    : saved
      ? { text: "✓ Enregistré", className: "text-success" }
      : dirty
        ? { text: "Modifications non enregistrées", className: "text-subtle" }
        : null;

  const footer = (
    <>
      {status && (
        <p
          role={invalid ? "alert" : undefined}
          className={`mr-auto text-sm ${status.className}`}
        >
          {status.text}
        </p>
      )}
      {dirty && !updateUser.isPending && (
        <button
          type="button"
          onClick={() => setForm(initial)}
          className="text-sm font-semibold text-subtle transition-colors hover:text-heading"
        >
          Annuler
        </button>
      )}
      <button
        type="submit"
        disabled={updateUser.isPending || invalid || !dirty}
        className="rounded-md bg-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-dark active:bg-red-darker disabled:cursor-not-allowed disabled:opacity-60"
      >
        {updateUser.isPending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card id="card-identity" title="Identité" footer={footer}>
        <div className="space-y-1">
          <EditableRow htmlFor="profil-name" label="Nom">
            <input
              id="profil-name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              className={inputClass}
            />
          </EditableRow>
          <EditableRow htmlFor="profil-email" label="E-mail">
            <input
              id="profil-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              className={inputClass}
            />
          </EditableRow>
          <EditableRow htmlFor="profil-phone" label="Téléphone">
            <input
              id="profil-phone"
              type="tel"
              autoComplete="tel"
              placeholder="—"
              value={form.phone}
              onChange={update("phone")}
              className={inputClass}
            />
          </EditableRow>
        </div>

        {updateUser.error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {updateUser.error.message}
          </p>
        )}

        {emailError && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {emailError}
          </p>
        )}

        {emailNotice && (
          <p role="status" className="mt-3 text-sm text-subtle">
            {emailNotice}
          </p>
        )}
      </Card>
    </form>
  );
}
