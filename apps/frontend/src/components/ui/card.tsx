import type { ReactNode } from "react";

interface CardProps {
  id: string;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Card({ id, title, footer, children }: CardProps) {
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
