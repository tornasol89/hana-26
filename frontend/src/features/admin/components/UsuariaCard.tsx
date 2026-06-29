import { useState } from "react";
import { ChevronDown, IdCard, ImageOff, MapPin, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { UsuariaActions } from "./UsuariaActions";
import type { EstadoVerificacion, UsuariaAdmin } from "../types";

const VERIFICACION_LABEL: Record<EstadoVerificacion, string> = {
  sin_enviar: "Sin enviar",
  enviado: "En revisión",
  aprobado: "Verificada",
  rechazado: "Rechazada",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const VERIFICACION_VARIANT: Record<EstadoVerificacion, BadgeVariant> = {
  sin_enviar: "outline",
  enviado: "secondary",
  aprobado: "default",
  rechazado: "destructive",
};

interface Props {
  usuaria: UsuariaAdmin;
}

export function UsuariaCard({ usuaria }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const nombreCompleto = `${usuaria.nombre} ${usuaria.apellido}`.trim();
  const iniciales =
    `${usuaria.nombre?.[0] ?? ""}${usuaria.apellido?.[0] ?? ""}`.toUpperCase() || "?";

  const estado = (usuaria.estadoVerificacion ?? "sin_enviar") as EstadoVerificacion;
  const desactivada = usuaria.activa === false;

  return (
    <>
      <Card className={desactivada ? "opacity-60" : ""}>
        <CardContent className="p-4">
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="w-full text-left flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={usuaria.foto ?? undefined} alt={nombreCompleto} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {iniciales}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-card-foreground truncate">
                    {nombreCompleto}
                  </p>
                  {desactivada && (
                    <Badge variant="outline" className="text-destructive">
                      Desactivada
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {usuaria.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={usuaria.tipo === "trabajadora" ? "default" : "secondary"}
                className="capitalize"
              >
                {usuaria.tipo}
              </Badge>
              <Badge variant={VERIFICACION_VARIANT[estado]}>
                {VERIFICACION_LABEL[estado]}
              </Badge>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-5">
              {/* Foto + datos */}
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => usuaria.foto && setZoomedImage(usuaria.foto)}
                  disabled={!usuaria.foto}
                  className="shrink-0"
                >
                  <Avatar className="h-16 w-16 cursor-zoom-in">
                    <AvatarImage src={usuaria.foto ?? undefined} alt={nombreCompleto} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {iniciales}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex-1 min-w-0 space-y-1.5 text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Datos personales
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <p className="text-muted-foreground">
                      RUT:{" "}
                      <span className="text-card-foreground font-medium">
                        {usuaria.rut || "—"}
                      </span>
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="text-card-foreground font-medium truncate">
                        {[usuaria.comuna, usuaria.region].filter(Boolean).join(", ") ||
                          "Sin ubicación"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cédula */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5" />
                  Cédula de identidad
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <CarnetThumb
                    label="Frente"
                    url={usuaria.carnetFrenteUrl}
                    onZoom={setZoomedImage}
                  />
                  <CarnetThumb
                    label="Dorso"
                    url={usuaria.carnetDorsoUrl}
                    onZoom={setZoomedImage}
                  />
                </div>
              </div>

              {/* Estado verificación */}
              {estado === "aprobado" && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-500/5 rounded-lg p-3 border border-green-500/30">
                  <ShieldCheck className="h-4 w-4" />
                  Cuenta verificada por el equipo Hana
                </div>
              )}

              {/* Acciones */}
              <UsuariaActions usuaria={usuaria} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Dialog open={!!zoomedImage} onOpenChange={(o) => !o && setZoomedImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">Vista ampliada</DialogTitle>
          {zoomedImage && (
            <img
              src={zoomedImage}
              alt="Vista ampliada"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CarnetThumb({
  label,
  url,
  onZoom,
}: {
  label: string;
  url?: string;
  onZoom: (url: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {url ? (
        <button
          type="button"
          onClick={() => onZoom(url)}
          className="block w-full overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-colors"
        >
          <img
            src={url}
            alt={`Cédula ${label}`}
            className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
          />
        </button>
      ) : (
        <div className="h-32 rounded-lg border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
          <ImageOff className="h-5 w-5" />
          <span className="text-xs">No subido</span>
        </div>
      )}
    </div>
  );
}