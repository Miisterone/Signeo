import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { getSupabaseFrontendClient } from "../../../lib/supabase/client";
import { useAuth } from "../../auth/auth-context";
import type { User } from "../../interfaces/user";
import { useUser, useUpdateUser } from "../../hooks/useUser";
import { Modal } from "../../components/ui/modal";
import { IdCard } from "lucide-react";

const editableInputClass =
  "w-full rounded-md border border-line-strong bg-card px-3 py-2 text-sm text-heading outline-none transition-colors hover:border-heading focus:border-red";

function formatSeniority(totalMonths: number | null): string {
  if (totalMonths == null) return "—";
  if (totalMonths < 1) return "Moins d'un mois";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mois`);
  return parts.join(" et ");
}

function Card({
  id,
  title,
  footer,
  children,
}: {
  id: string;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="overflow-hidden rounded-xl border border-line bg-card"
    >
      <h2
        id={id}
        className="border-b border-line px-5 py-3.5 text-sm font-semibold text-heading"
      >
        {title}
      </h2>
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3">
          {footer}
        </div>
      )}
    </section>
  );
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

export function ProfilPage() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const supabase = getSupabaseFrontendClient();

  const { data: user, isLoading, error } = useUser(userId);
  const { data: manager } = useUser(user?.managerId ?? undefined);
  const updateUser = useUpdateUser(userId);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [managerOpen, setManagerOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const initialized = useRef(false);

  useEffect(() => {
    if (user && !initialized.current) {
      setForm({
        name: user.name ?? "",
        email: user.email,
        phone: user.phone ?? "",
      });
      initialized.current = true;
    }
  }, [user]);

  if (isLoading)
    return <div className="p-6 text-sm text-subtle">Chargement…</div>;

  if (error)
    return (
      <div className="p-6 text-sm text-danger">{(error as Error).message}</div>
    );

  if (!user) return null;

  const currentUser = user;

  const dirty =
    form.name !== (currentUser.name ?? "") ||
    form.email !== currentUser.email ||
    form.phone !== (currentUser.phone ?? "");

  const invalid = form.name.trim() === "" || form.email.trim() === "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dirty || invalid) return;

    setEmailNotice(undefined);
    setEmailError(undefined);

    const patch: Partial<User> = {};
    if (form.name !== (currentUser.name ?? "")) patch.name = form.name;
    if (form.phone !== (currentUser.phone ?? "")) patch.phone = form.phone;

    if (form.email !== currentUser.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: form.email,
      });
      if (authError) {
        setEmailError(authError.message);
        return;
      }
      patch.email = form.email;
      setEmailNotice(
        "Un e-mail de confirmation vous a été envoyé. La nouvelle adresse sera active après validation.",
      );
    }

    if (Object.keys(patch).length === 0) return;

    updateUser.mutate(patch, {
      onSuccess: (updated) =>
        setForm({
          name: updated.name ?? "",
          email: updated.email,
          phone: updated.phone ?? "",
        }),
    });
  };

  const handleReset = () =>
    setForm({
      name: currentUser.name ?? "",
      email: currentUser.email,
      phone: currentUser.phone ?? "",
    });

  const readOnlyRows: { label: string; value: ReactNode }[] = [
    {
      label: "Embauché le",
      value: currentUser.hiredAt
        ? new Date(currentUser.hiredAt).toLocaleDateString("fr-FR")
        : "—",
    },
    { label: "Ancienneté", value: formatSeniority(currentUser.seniority) },
    { label: "Rôle", value: currentUser.role },
    {
      label: "Manager",
      value: manager ? (
        <span className="flex items-center gap-2">
          {manager.name}
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="rounded text-sm font-semibold text-red underline underline-offset-2 transition-colors hover:text-red-dark hover:cursor-pointer pl-2"
          >
            <IdCard />
          </button>
        </span>
      ) : (
        "—"
      ),
    },
  ];

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <h1 className="text-xl font-semibold text-heading">Profil</h1>

      <form onSubmit={handleSubmit}>
        <Card
          id="card-identity"
          title="Identité"
          footer={
            <>
              {(invalid || dirty || updateUser.isSuccess) && (
                <p
                  role={invalid ? "alert" : undefined}
                  className={
                    invalid
                      ? "mr-auto text-sm text-danger"
                      : updateUser.isSuccess && !dirty
                        ? "mr-auto text-sm text-success"
                        : "mr-auto text-sm text-subtle"
                  }
                >
                  {invalid
                    ? "Nom et e-mail obligatoires."
                    : updateUser.isSuccess && !dirty
                      ? "✓ Enregistré"
                      : "Modifications non enregistrées"}
                </p>
              )}
              {dirty && !updateUser.isPending && (
                <button
                  type="button"
                  onClick={handleReset}
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
          }
        >
          <div className="space-y-1">
            <EditableRow htmlFor="profil-name" label="Nom">
              <input
                id="profil-name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                className={editableInputClass}
              />
            </EditableRow>
            <EditableRow htmlFor="profil-email" label="E-mail">
              <input
                id="profil-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                className={editableInputClass}
              />
            </EditableRow>
            <EditableRow htmlFor="profil-phone" label="Téléphone">
              <input
                id="profil-phone"
                type="tel"
                autoComplete="tel"
                placeholder="—"
                value={form.phone}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    phone: event.target.value,
                  }))
                }
                className={editableInputClass}
              />
            </EditableRow>
          </div>

          {updateUser.isError && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {(updateUser.error as Error).message}
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

      <Card id="card-job" title="Poste">
        <dl className="divide-y divide-line">
          {readOnlyRows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[10rem_1fr] gap-4 py-2.5 first:pt-0 last:pb-0"
            >
              <dt className="text-sm text-subtle">{row.label}</dt>
              <dd className="text-sm text-heading">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card id="card-security" title="Sécurité">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-heading">Mot de passe</p>
            <p className="text-sm text-subtle">••••••••</p>
          </div>
          <Link
            to="/profil/update-password"
            className="shrink-0 rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-heading"
          >
            Modifier
          </Link>
        </div>
      </Card>

      <Modal
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        title="Manager"
      >
        {manager && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-subtle">Nom</dt>
              <dd className="text-heading">{manager.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">E-mail</dt>
              <dd>
                <a
                  href={`mailto:${manager.email}`}
                  className="text-heading underline-offset-2 hover:underline"
                >
                  {manager.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Téléphone</dt>
              <dd className="text-heading">
                {manager.phone ? (
                  <a
                    href={`tel:${manager.phone}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {manager.phone}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Rôle</dt>
              <dd className="text-heading">{manager.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Embauché le</dt>
              <dd className="text-heading">
                {manager.hiredAt
                  ? new Date(manager.hiredAt).toLocaleDateString("fr-FR")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Ancienneté</dt>
              <dd className="text-heading">
                {formatSeniority(manager.seniority)}
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
