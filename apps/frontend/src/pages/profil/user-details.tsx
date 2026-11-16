import type { User } from "../../interfaces/user";
import type { DetailRow } from "../../components/ui/detail-list";

export function formatSeniority(totalMonths: number | null): string {
  if (totalMonths == null) return "—";
  if (totalMonths < 1) return "Moins d'un mois";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mois`);
  return parts.join(" et ");
}

export function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";
}

const linkClass = "text-heading underline-offset-2 hover:underline";

/** Rows describing a user's job; `contact` adds name, e-mail and phone. */
export function userDetailRows(
  user: User,
  { contact = false }: { contact?: boolean } = {},
): DetailRow[] {
  const contactRows: DetailRow[] = contact
    ? [
        { label: "Nom", value: user.name },
        {
          label: "E-mail",
          value: (
            <a href={`mailto:${user.email}`} className={linkClass}>
              {user.email}
            </a>
          ),
        },
        {
          label: "Téléphone",
          value: user.phone ? (
            <a href={`tel:${user.phone}`} className={linkClass}>
              {user.phone}
            </a>
          ) : (
            "—"
          ),
        },
      ]
    : [];

  return [
    ...contactRows,
    { label: "Embauché le", value: formatDate(user.hiredAt) },
    { label: "Ancienneté", value: formatSeniority(user.seniority) },
    { label: "Rôle", value: user.role },
  ];
}
