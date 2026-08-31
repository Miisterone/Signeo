import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Calendar,
  FileText,
  House,
  LogOut,
  Users,
  UsersRound,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../auth/auth-context";
import { FormError } from "../ui/form-error";

export function SideBar() {
  const { signOut } = useAuth();
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
      await router.navigate({
        to: "/auth/login",
        search: { redirect: "/dashboard" },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Déconnexion impossible",
      );
      setIsSigningOut(false);
    }
  };

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r border-line bg-card">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
        <span className="text-2xl font-medium text-red">Signeo</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-6 last:mb-0">
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-subtle">
            Pilotage
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                to="/dashboard"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm"
                activeProps={{ className: "bg-red-pale font-medium text-red-dark" }}
                inactiveProps={{
                  className: "text-body hover:bg-page hover:text-heading",
                }}
              >
                <House size={18} strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1 text-left">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/interventions"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm"
                activeProps={{ className: "bg-red-pale font-medium text-red-dark" }}
                inactiveProps={{
                  className: "text-body hover:bg-page hover:text-heading",
                }}
              >
                <FileText size={18} strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1 text-left">Interventions</span>
              </Link>
            </li>
            <li>
              <Link
                to="/calendrier"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm"
                activeProps={{ className: "bg-red-pale font-medium text-red-dark" }}
                inactiveProps={{
                  className: "text-body hover:bg-page hover:text-heading",
                }}
              >
                <Calendar size={18} strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1 text-left">Calendrier</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-6 last:mb-0">
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-subtle">
            Organisation
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                to="/clients"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm"
                activeProps={{ className: "bg-red-pale font-medium text-red-dark" }}
                inactiveProps={{
                  className: "text-body hover:bg-page hover:text-heading",
                }}
              >
                <Users size={18} strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1 text-left">Clients</span>
              </Link>
            </li>
            <li>
              <Link
                to="/equipe"
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm"
                activeProps={{ className: "bg-red-pale font-medium text-red-dark" }}
                inactiveProps={{
                  className: "text-body hover:bg-page hover:text-heading",
                }}
              >
                <UsersRound size={18} strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1 text-left">Mon équipe</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="shrink-0 border-t border-line px-3 py-3">
        {errorMessage ? (
          <div className="px-2 pb-3">
            <FormError message={errorMessage} />
          </div>
        ) : null}

        <Link
          to="/profil"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm"
          activeProps={{ className: "bg-red-pale font-medium text-red-dark" }}
          inactiveProps={{
            className: "text-body hover:bg-page hover:text-heading",
          }}
        >
          <UserRound size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1 text-left">Profil</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          aria-busy={isSigningOut}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-body hover:bg-page hover:text-heading disabled:cursor-not-allowed disabled:text-subtle"
        >
          <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="flex-1 text-left">
            {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
          </span>
        </button>
      </div>
    </aside>
  );
}