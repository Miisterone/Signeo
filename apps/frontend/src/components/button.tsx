import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  return (
    <button
      className="w-full rounded-md bg-red px-3 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-dark active:bg-red-darker disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    />
  );
}
