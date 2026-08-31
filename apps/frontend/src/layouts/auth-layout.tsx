import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-2 text-center text-xl sm:text-2xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 text-center text-sm text-subtle">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">{children}</div>
    </main>
  );
}
