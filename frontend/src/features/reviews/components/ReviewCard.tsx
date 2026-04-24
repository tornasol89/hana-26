import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Review } from "../types";

interface Props {
  review: Review;
}

export function ReviewCard({ review }: Props) {
  const nombreAutor = `${review.autor?.nombre ?? ""} ${review.autor?.apellido ?? ""}`.trim();
  const iniciales = `${review.autor?.nombre?.[0] ?? ""}${review.autor?.apellido?.[0] ?? ""}`.toUpperCase();
  const fecha = new Date(review.createdAt).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.autor?.foto ?? undefined} alt={nombreAutor} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {iniciales || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm text-card-foreground">{nombreAutor}</p>
              <p className="text-xs text-muted-foreground">{fecha}</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i <= review.estrellas
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {review.comentario && (
          <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
            "{review.comentario}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}