import { useState } from "react";
import { ImagePlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { useMisItemsPortafolio } from "@/features/portfolio/hooks";
import { PortfolioGrid } from "@/features/portfolio/components/PortfolioGrid";
import { PortfolioUploadForm } from "@/features/portfolio/components/PortfolioUploadForm";
import { useMyBookings } from "@/features/bookings/hooks";
import type { Booking } from "@/features/bookings/types";

export function PortafolioTab() {
  const [subiendo, setSubiendo] = useState(false);
  const { data: items = [], isLoading } = useMisItemsPortafolio();
  const { data: todasLasReservas = [] } = useMyBookings("trabajadora");

  const reservasCompletadas = todasLasReservas.filter(
    (r: Booking) => r.estado === "completada"
  );

  const respaldadas = items.filter((i) => i.respaldada).length;

  if (isLoading) return <LoadingState message="Cargando portafolio..." />;

  return (
    <div className="space-y-4">
      {/* Cabecera con stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-display text-primary">{items.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Fotos subidas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-display text-green-600">{respaldadas}</div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-600" /> Respaldadas
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulario de subida */}
      {subiendo ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nueva foto de portafolio</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioUploadForm
              reservasCompletadas={reservasCompletadas}
              onCancel={() => setSubiendo(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed gap-2"
          onClick={() => setSubiendo(true)}
        >
          <ImagePlus className="h-4 w-4" />
          Agregar foto al portafolio
        </Button>
      )}

      {/* Grid de fotos */}
      {items.length === 0 && !subiendo ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-medium text-card-foreground">Tu portafolio está vacío</p>
            <p className="text-xs text-muted-foreground">
              Sube fotos de tus trabajos para mostrar tu experiencia.
              Cuando las vincules a una reserva completada, la clienta podrá
              respaldarlas dándoles mayor credibilidad.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mis trabajos</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioGrid items={items} editable />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
