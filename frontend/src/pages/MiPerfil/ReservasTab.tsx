import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { BookingsList } from "@/features/bookings/components/BookingsList";
import { useMyBookings } from "@/features/bookings/hooks";

interface Props {
  esTrabajadora: boolean;
}

export function ReservasTab({ esTrabajadora }: Props) {
  const { data: reservas = [], isLoading, isError, refetch } = useMyBookings();

  if (isLoading) return <LoadingState message="Cargando tus reservas..." />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            No pudimos cargar tus reservas.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (reservas.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <EmptyState
            icon={Calendar}
            title="Aún no tienes reservas"
            description={
              esTrabajadora
                ? "Cuando recibas solicitudes aparecerán aquí."
                : "Busca una profesional y agenda tu primer servicio."
            }
            action={
              !esTrabajadora && (
                <Button asChild variant="hero">
                  <Link to="/buscar">Buscar servicios</Link>
                </Button>
              )
            }
          />
        </CardContent>
      </Card>
    );
  }

  return <BookingsList bookings={reservas} esTrabajadora={esTrabajadora} />;
}