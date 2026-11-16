import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
}

export function PasswordField({ id, label, ...props }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = showPassword ? EyeOff : Eye;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm leading-6 font-semibold text-heading"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className="block w-full rounded-md border border-line-dark bg-card px-3 py-1.5 pr-10 text-base text-heading outline-none placeholder:text-subtle focus:border-red sm:text-sm"
          {...props}
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
          <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
