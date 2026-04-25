import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Star,
  X,
} from "lucide-react";
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
import { EvaluarDialog } from "@/features/reviews/components/EvaluarDialog";
import { useHasReviewedBooking } from "@/features/reviews/hooks";
import { ChatDialog } from "@/features/messages/components/ChatDialog";
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
  const [confirmRechazoOpen, setConfirmRechazoOpen] = useState(false);
  const [evaluarOpen, setEvaluarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const accept = useAcceptBooking();
  const reject = useRejectBooking();
  const complete = useCompleteBooking();

  const estado = booking.estado as EstadoBooking;

  // Solo consultamos "ya evaluó" si está completada
  const { data: revisionData } = useHasReviewedBooking(
    estado === "completada" ? booking._id : undefined
  );
  const yaEvaluo = revisionData?.yaEvaluo ?? false;

  // Otra persona del chat (depende de quién está logueada)
  const otraPersona = getOtraPersona(booking, esTrabajadora);
  const puedeChatear =
    (estado === "aceptada" || estado === "completada") && otraPersona !== null;

  // ─── Estado pendiente: solo trabajadora puede aceptar/rechazar ───
  if (estado === "pendiente") {
    if (!esTrabajadora) return null;
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
            onClick={() => setConfirmRechazoOpen(true)}
            disabled={accept.isPending || reject.isPending}
          >
            <X className="h-4 w-4" /> Rechazar
          </Button>
        </div>

        <AlertDialog open={confirmRechazoOpen} onOpenChange={setConfirmRechazoOpen}>
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
                    onSuccess: () => setConfirmRechazoOpen(false),
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

  // ─── Estado aceptada: chat para ambos + completar para trabajadora ───
  if (estado === "aceptada") {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {puedeChatear && otraPersona && (
            <Button variant="outline" size="sm" onClick={() => setChatOpen(true)}>
              <MessageCircle className="h-4 w-4" /> Chat
            </Button>
          )}

          {esTrabajadora && (
            <Button
              variant="default"
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
          )}
        </div>

        {puedeChatear && otraPersona && (
          <ChatDialog
            open={chatOpen}
            onOpenChange={setChatOpen}
            bookingId={booking._id}
            servicio={booking.servicio}
            estadoReserva="aceptada"
            otraPersona={otraPersona}
          />
        )}
      </>
    );
  }

  // ─── Estado completada: chat + evaluar (si aún no evaluó) ───
  if (estado === "completada") {
    const destinataria = otraPersona;

    return (
      <>
        <div className="flex flex-wrap gap-2">
          {puedeChatear && otraPersona && (
            <Button variant="outline" size="sm" onClick={() => setChatOpen(true)}>
              <MessageCircle className="h-4 w-4" /> Chat
            </Button>
          )}

          {!yaEvaluo && destinataria && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setEvaluarOpen(true)}
            >
              <Star className="h-4 w-4" />
              {esTrabajadora ? "Evaluar clienta" : "Evaluar profesional"}
            </Button>
          )}
        </div>

        {puedeChatear && otraPersona && (
          <ChatDialog
            open={chatOpen}
            onOpenChange={setChatOpen}
            bookingId={booking._id}
            servicio={booking.servicio}
            estadoReserva="completada"
            otraPersona={otraPersona}
          />
        )}

        {!yaEvaluo && destinataria && (
          <EvaluarDialog
            open={evaluarOpen}
            onOpenChange={setEvaluarOpen}
            reservaId={booking._id}
            servicio={booking.servicio}
            destinataria={destinataria}
            tipo={
              esTrabajadora
                ? "trabajadora_a_clienta"
                : "clienta_a_trabajadora"
            }
          />
        )}
      </>
    );
  }

  // rechazada / cancelada → sin acciones
  return null;
}

// ─── Helper: extraer info de la otra persona del chat/evaluación ───

interface OtraPersona {
  _id: string;
  nombre: string;
  apellido: string;
  foto?: string | null;
}

function getOtraPersona(
  booking: Booking,
  esTrabajadora: boolean
): OtraPersona | null {
  if (esTrabajadora) {
    if (!booking.clienta) return null;
    return {
      _id: booking.clienta._id,
      nombre: booking.clienta.nombre,
      apellido: booking.clienta.apellido,
      foto: booking.clienta.foto,
    };
  }

  if (
    typeof booking.trabajadora === "object" &&
    booking.trabajadora?.usuario
  ) {
    const u = booking.trabajadora.usuario;
    return {
      _id: u._id,
      nombre: u.nombre,
      apellido: u.apellido,
      foto: u.foto,
    };
  }

  return null;
}