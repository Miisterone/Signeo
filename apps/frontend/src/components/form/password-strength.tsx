interface Criterion {
  label: string;
  met: boolean;
}

interface Strength {
  score: number;
  label: string;
  criteria: Criterion[];
}

const LABELS = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];

function getPasswordStrength(password: string): Strength {
  const criteria: Criterion[] = [
    { label: "Au moins 8 caractères", met: password.length >= 8 },
    {
      label: "Minuscule et majuscule",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "Un chiffre", met: /\d/.test(password) },
    { label: "Un caractère spécial", met: /[^A-Za-z0-9]/.test(password) },
  ];

  let score = criteria.filter((criterion) => criterion.met).length;
  // Under 8 chars, keep the score low even if the other rules pass.
  if (password.length < 8) score = Math.min(score, 1);

  return { score, label: LABELS[score], criteria };
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, criteria } = getPasswordStrength(password);
  const strong = score >= 3;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index < score
                  ? strong
                    ? "bg-success"
                    : "bg-danger"
                  : "bg-line"
              }`}
            />
          ))}
        </div>
        <span
          aria-live="polite"
          className={`shrink-0 text-xs font-semibold ${
            strong ? "text-success" : "text-danger"
          }`}
        >
          {label}
        </span>
      </div>

      <ul className="space-y-1">
        {criteria.map((criterion) => (
          <li
            key={criterion.label}
            className={`flex items-center gap-1.5 text-xs ${
              criterion.met ? "text-success" : "text-subtle"
            }`}
          >
            <span aria-hidden="true">{criterion.met ? "✓" : "✗"}</span>
            {criterion.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
