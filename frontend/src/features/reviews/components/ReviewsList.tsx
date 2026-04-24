import { Star } from "lucide-react";
import type { ReviewsResumen } from "../types";
import { ReviewCard } from "./ReviewCard";

interface Props {
  data: ReviewsResumen;
}

export function ReviewsList({ data }: Props) {
  return (
    <div className="space-y-4">
      {/* Resumen arriba */}
      {data.total > 0 && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Calificación promedio
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basado en {data.total} {data.total === 1 ? "reseña" : "reseñas"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold font-display text-primary">
              {data.promedio.toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= Math.round(data.promedio)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de reviews */}
      <div className="space-y-3">
        {data.reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
}