import type { ReactNode } from "react";

export interface DetailRow {
  label: string;
  value: ReactNode;
}

export function DetailList({ rows }: { rows: DetailRow[] }) {
  return (
    <dl className="divide-y divide-line">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[10rem_1fr] gap-4 py-2.5 first:pt-0 last:pb-0"
        >
          <dt className="text-sm text-subtle">{row.label}</dt>
          <dd className="text-sm text-heading">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
