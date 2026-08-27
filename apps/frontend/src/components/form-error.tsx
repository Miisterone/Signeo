interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="rounded-md bg-red-pale px-3 py-2 text-sm text-red">
      {message}
    </p>
  );
}
