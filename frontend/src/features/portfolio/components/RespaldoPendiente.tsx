import { ShieldCheck, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParaRespaldar, useRespaldarPortfolio } from "../hooks";
import type { PortfolioItem } from "../types";

export function RespaldoPendiente() {
  const { data: items = [], isLoading } = useParaRespaldar();
  const respaldar = useRespaldarPortfolio();

  if (isLoading || items.length === 0) return null;

  function getNombreTrabajadora(item: PortfolioItem) {
    if (typeof item.trabajadora === "object" && item.trabajadora.usuario) {
      const u = item.trabajadora.usuario;
      return `${u.nombre} ${u.apellido ?? ""}`.trim();
    }
    return "Trabajadora";
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-primary" />
          Trabajos pendientes de respaldo
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Estas profesionales han vinculado fotos de su portafolio a servicios que realizaron contigo.
          Tu respaldo añade un sello de credibilidad a su trabajo.
        </p>

        {items.map((item) => (
          <div key={item._id} className="flex gap-3 items-start">
            <img
              src={item.fotoUrl}
              alt={item.titulo}
              className="h-20 w-28 object-cover rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-card-foreground line-clamp-1">
                {item.titulo}
              </p>
              {item.descripcion && (
                <p className="text-xs text-muted-foreground line-clamp-2">{item.descripcion}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Por{" "}
                <span className="font-medium text-card-foreground">
                  {getNombreTrabajadora(item)}
                </span>
                {item.reserva && (
                  <> · {(item.reserva as any).servicio}</>
                )}
              </p>
              <Button
                size="sm"
                variant="default"
                className="gap-1.5 h-8 text-xs"
                disabled={respaldar.isPending}
                onClick={() => respaldar.mutate(item._id)}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Respaldar este trabajo
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
