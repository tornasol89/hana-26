import { useState } from "react";
import { Check, Loader2, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAcceptBooking,
  useCompleteBooking,
  useRejectBooking,
} from "../hooks";
import type { Booking, EstadoBooking } from "../types";

interface Props {
  booking: Booking;
  esTrabajadora: boolean;
}

export function BookingActions({ booking, esTrabajadora }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const accept = useAcceptBooking();
  const reject = useRejectBooking();
  const complete = useCompleteBooking();

  // Por ahora solo la trabajadora tiene acciones (Fase C).
 
  if (!esTrabajadora) return null;

  const estado = booking.estado as EstadoBooking;

  if (estado === "pendiente") {
    return (
      <>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => accept.mutate(booking._id)}
            disabled={accept.isPending || reject.isPending}
          >
            {accept.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Aceptando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Aceptar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => setConfirmOpen(true)}
            disabled={accept.isPending || reject.isPending}
          >
            <X className="h-4 w-4" /> Rechazar
          </Button>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Rechazar esta reserva?</AlertDialogTitle>
              <AlertDialogDescription>
                La clienta será notificada de que no aceptaste su solicitud.
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={reject.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  reject.mutate(booking._id, {
                    onSuccess: () => setConfirmOpen(false),
                  });
                }}
                disabled={reject.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {reject.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  "Sí, rechazar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (estado === "aceptada") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => complete.mutate(booking._id)}
        disabled={complete.isPending}
      >
        {complete.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Marcando...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Marcar como completada
          </>
        )}
      </Button>
    );
  }

  // completada / rechazada / cancelada → no hay acciones
  return null;
}