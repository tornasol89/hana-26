import { Search, Sparkles } from "lucide-react";
import type { UserType } from "@/features/auth/types";

const TIPOS: {
  value: UserType;
  label: string;
  desc: string;
  Icon: React.ElementType;
}[] = [
  { value: "clienta", label: "Soy Clienta", desc: "Busco servicios", Icon: Search },
  {
    value: "trabajadora",
    label: "Soy Trabajadora",
    desc: "Ofrezco servicios",
    Icon: Sparkles,
  },
];

interface Props {
  value: UserType;
  onChange: (value: UserType) => void;
  disabled?: boolean;
}

export function TipoCuentaSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {TIPOS.map(({ value: v, label, desc, Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          disabled={disabled}
          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
            value === v
              ? "border-primary bg-purple-light shadow-soft"
              : "border-border hover:border-primary/40 hover:bg-purple-light/40"
          }`}
        >
          <Icon
            className={`h-4 w-4 mb-2 ${
              value === v ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <p className="font-semibold text-sm text-card-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </button>
      ))}
    </div>
  );
}