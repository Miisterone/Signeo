import { useState } from "react";
import type { FormEvent } from "react";
import { getRouteApi, Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../auth/auth-provider";

const routeApi = getRouteApi("/auth/login");

export function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { redirect } = routeApi.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      await router.invalidate();
      await router.navigate({ to: redirect });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Connexion impossible",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-2 text-center text-xl sm:text-2xl">
          Connectez-vous à <br />
          <span className="text-red">Signeo</span>
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} aria-label="Connexion">
          <div>
            <label
              htmlFor="email"
              className="block text-sm leading-6 font-medium text-heading"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              required
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 block w-full rounded-md border border-line-dark bg-card px-3 py-1.5 text-base text-heading outline-none placeholder:text-subtle focus:border-red sm:text-sm sm:leading-6"
            />
          </div>

          <div className="pt-2">
            <label
              htmlFor="password"
              className="block text-sm leading-6 font-medium text-heading"
            >
              Mot de passe
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                required
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                className="block w-full rounded-md border border-line-dark bg-card px-3 py-1.5 pr-10 text-base text-heading outline-none placeholder:text-subtle focus:border-red sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute inset-y-0 right-0 flex items-center px-3 text-subtle hover:text-heading"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.774 3.162 10.066 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-sm pt-2">
            <Link
              className="font-semibold hover:underline"
              to="/auth/reset-password"
              search={{ redirect: "/dashboard" }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-md bg-red-pale px-3 py-2 text-sm text-red"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-red px-3 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-dark active:bg-red-darker"
            >
              {isSubmitting ? "Connexion en cours…" : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
