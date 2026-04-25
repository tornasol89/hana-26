import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "lg";
  disabled?: boolean;
}

export function StarRating({ value, onChange, size = "lg", disabled = false }: Props) {
  const [hover, setHover] = useState(0);

  const iconSize = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const gapSize = size === "lg" ? "gap-1.5" : "gap-1";

  return (
    <div className={`flex ${gapSize}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const activa = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            onMouseEnter={() => !disabled && setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`transition-transform ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-110"
            }`}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`${iconSize} ${
                activa
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}