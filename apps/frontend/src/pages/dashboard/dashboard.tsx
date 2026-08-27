import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../auth/auth-context";
import { FormError } from "../../components/form-error";

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setErrorMessage(undefined);

    try {
      await signOut();
      await router.invalidate();
      await navigate({ to: "/auth/login", search: { redirect: "/dashboard" } });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Déconnexion impossible",
      );
      setIsSigningOut(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl">Tableau de bord</h1>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-md border border-line-dark bg-card px-3 py-1.5 text-sm font-semibold text-heading transition-colors hover:border-red hover:text-red disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </header>

      {errorMessage ? (
        <div className="mt-8">
          <FormError message={errorMessage} />
        </div>
      ) : null}

      <section className="mt-8 p-6">
        <h2 className="text-sm font-medium text-heading">Compte</h2>
        <p className="mt-1 text-sm text-subtle">
          Connecté en tant que{" "}
          <span className="text-body">{user?.email}</span>
        </p>
      </section>
    </main>
  );
}
