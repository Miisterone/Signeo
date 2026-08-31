import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export function TextField({ id, label, ...props }: TextFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm leading-6 font-medium text-heading"
      >
        {label}
      </label>
      <input
        id={id}
        className="mt-2 block w-full rounded-md border border-line-dark bg-card px-3 py-1.5 text-base text-heading outline-none placeholder:text-subtle focus:border-red sm:text-sm sm:leading-6"
        {...props}
      />
    </div>
  );
}
