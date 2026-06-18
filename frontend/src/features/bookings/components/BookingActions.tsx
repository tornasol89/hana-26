import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2,
  MessageCircle,
  PlayCircle,
  Star,
  StopCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  useConfirmarFin,
  useConfirmarInicio,
  useDisputar,
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
  const [disputaForm, setDisputaForm] = useState<"inicio" | "fin" | null>(null);
  const [motivoDisputa, setMotivoDisputa] = useState("");

  const accept = useAcceptBooking();
  const reject = useRejectBooking();
  const confirmarInicio = useConfirmarInicio();
  const confirmarFin = useConfirmarFin();
  const disputar = useDisputar();

  const estado = booking.estado as EstadoBooking;

  const { data: revisionData } = useHasReviewedBooking(
    estado === "completada" ? booking._id : undefined
  );
  const yaEvaluo = revisionData?.yaEvaluo ?? false;

  const otraPersona = getOtraPersona(booking, esTrabajadora);
  const puedeChatear =
    ["aceptada", "en_curso", "en_disputa", "completada"].includes(estado) &&
    otraPersona !== null;

  // ── Determinar qué confirmaciones ya tiene la parte logueada ──────────────
  const rol = esTrabajadora ? "trabajadora" : "clienta";
  const yaConfirmoInicio = Boolean(booking.inicioConfirmadoPor?.[rol]);
  const yaConfirmoFin    = Boolean(booking.finConfirmadoPor?.[rol]);
  const otraParteConfirmoInicio = Boolean(
    booking.inicioConfirmadoPor?.[esTrabajadora ? "clienta" : "trabajadora"]
  );
  const otraParteConfirmoFin = Boolean(
    booking.finConfirmadoPor?.[esTrabajadora ? "clienta" : "trabajadora"]
  );

  // ── Ya envió motivo de disputa ──────────────────────────────────────────────
  const miMotivoDisputa = esTrabajadora
    ? booking.disputa?.motivoTrabajadora
    : booking.disputa?.motivoClienta;
  const yaEnvioMotivo = Boolean(miMotivoDisputa?.trim());

  function handleDisputar() {
    if (!motivoDisputa.trim()) return;
    disputar.mutate(
      { id: booking._id, fase: disputaForm!, motivo: motivoDisputa },
      {
        onSuccess: () => {
          setDisputaForm(null);
          setMotivoDisputa("");
        },
      }
    );
  }

  // ── PENDIENTE: trabajadora acepta/rechaza ──────────────────────────────────
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
              <><Loader2 className="h-4 w-4 animate-spin" /> Aceptando...</>
            ) : (
              <><Check className="h-4 w-4" /> Aceptar</>
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
                La clienta será notificada. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={reject.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  reject.mutate(booking._id, {
                    onSuccess: () => setConfirmRechazoOpen(false),
                  })
                }
                disabled={reject.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {reject.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Rechazando...</>
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

  // ── ACEPTADA: ambas partes confirman inicio ────────────────────────────────
  if (estado === "aceptada") {
    const trackerInicio = {
      trabajadora: Boolean(booking.inicioConfirmadoPor?.trabajadora),
      clienta:     Boolean(booking.inicioConfirmadoPor?.clienta),
    };

    return (
      <div className="space-y-3">
        <ChatButton show={puedeChatear && !!otraPersona} onClick={() => setChatOpen(true)} />

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" /> ¿El servicio ya comenzó?
          </p>

          {/* Tracker visual de quién confirmó */}
          <ConfirmTracker
            labelA="Trabajadora"
            labelB="Clienta"
            confirmadoA={trackerInicio.trabajadora}
            confirmadoB={trackerInicio.clienta}
          />

          {yaConfirmoInicio ? (
            <p className="text-xs text-green-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ya confirmaste — esperando que la otra parte confirme
            </p>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="w-full"
              onClick={() => confirmarInicio.mutate(booking._id)}
              disabled={confirmarInicio.isPending}
            >
              {confirmarInicio.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</>
              ) : (
                <><PlayCircle className="h-4 w-4" /> Confirmar que el servicio inició</>
              )}
            </Button>
          )}

          {!yaEnvioMotivo && (
            disputaForm === "inicio" ? (
              <DisputaForm
                motivo={motivoDisputa}
                onChange={setMotivoDisputa}
                onSubmit={handleDisputar}
                onCancel={() => { setDisputaForm(null); setMotivoDisputa(""); }}
                isPending={disputar.isPending}
                label="Explica qué pasó con el inicio del servicio"
              />
            ) : (
              <button
                type="button"
                className="text-xs text-destructive underline underline-offset-2"
                onClick={() => setDisputaForm("inicio")}
              >
                El servicio no inició / hubo un problema
              </button>
            )
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
      </div>
    );
  }

  // ── EN_CURSO: ambas partes confirman fin ───────────────────────────────────
  if (estado === "en_curso") {
    const trackerFin = {
      trabajadora: Boolean(booking.finConfirmadoPor?.trabajadora),
      clienta:     Boolean(booking.finConfirmadoPor?.clienta),
    };

    return (
      <div className="space-y-3">
        <ChatButton show={puedeChatear && !!otraPersona} onClick={() => setChatOpen(true)} />

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
            <StopCircle className="h-3.5 w-3.5" /> ¿El servicio ya terminó?
          </p>

          <ConfirmTracker
            labelA="Trabajadora"
            labelB="Clienta"
            confirmadoA={trackerFin.trabajadora}
            confirmadoB={trackerFin.clienta}
          />

          {yaConfirmoFin ? (
            <p className="text-xs text-green-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ya confirmaste — esperando que la otra parte confirme
            </p>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="w-full"
              onClick={() => confirmarFin.mutate(booking._id)}
              disabled={confirmarFin.isPending}
            >
              {confirmarFin.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</>
              ) : (
                <><StopCircle className="h-4 w-4" /> Confirmar que el servicio terminó</>
              )}
            </Button>
          )}

          {!yaEnvioMotivo && (
            disputaForm === "fin" ? (
              <DisputaForm
                motivo={motivoDisputa}
                onChange={setMotivoDisputa}
                onSubmit={handleDisputar}
                onCancel={() => { setDisputaForm(null); setMotivoDisputa(""); }}
                isPending={disputar.isPending}
                label="Explica qué pasó con el fin del servicio"
              />
            ) : (
              <button
                type="button"
                className="text-xs text-destructive underline underline-offset-2"
                onClick={() => setDisputaForm("fin")}
              >
                El servicio no terminó / hubo un problema
              </button>
            )
          )}
        </div>

        {puedeChatear && otraPersona && (
          <ChatDialog
            open={chatOpen}
            onOpenChange={setChatOpen}
            bookingId={booking._id}
            servicio={booking.servicio}
            estadoReserva="en_curso"
            otraPersona={otraPersona}
          />
        )}
      </div>
    );
  }

  // ── EN_DISPUTA: panel de disputa ───────────────────────────────────────────
  if (estado === "en_disputa") {
    const fase = booking.disputa?.fase;
    const motivoTrabajadora = booking.disputa?.motivoTrabajadora?.trim();
    const motivoClienta = booking.disputa?.motivoClienta?.trim();
    const confirmacionesPendientes = fase === "inicio"
      ? { yo: yaConfirmoInicio, otraParte: otraParteConfirmoInicio }
      : { yo: yaConfirmoFin, otraParte: otraParteConfirmoFin };

    return (
      <div className="space-y-3">
        <ChatButton show={puedeChatear && !!otraPersona} onClick={() => setChatOpen(true)} />

        {/* Panel de disputa */}
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-3">
          <p className="text-xs font-semibold text-destructive uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Disputa abierta — {fase === "inicio" ? "inicio del servicio" : "fin del servicio"}
          </p>

          {/* Versión trabajadora */}
          {motivoTrabajadora && (
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Versión de la trabajadora:</p>
              <p className="text-sm text-card-foreground italic">"{motivoTrabajadora}"</p>
            </div>
          )}

          {/* Versión clienta */}
          {motivoClienta && (
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Versión de la clienta:</p>
              <p className="text-sm text-card-foreground italic">"{motivoClienta}"</p>
            </div>
          )}

          {/* Agregar mi versión si aún no lo hice */}
          {!yaEnvioMotivo && (
            disputaForm ? (
              <DisputaForm
                motivo={motivoDisputa}
                onChange={setMotivoDisputa}
                onSubmit={handleDisputar}
                onCancel={() => { setDisputaForm(null); setMotivoDisputa(""); }}
                isPending={disputar.isPending}
                label="Agrega tu versión de lo ocurrido"
              />
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/5"
                onClick={() => setDisputaForm(fase ?? "inicio")}
              >
                <AlertTriangle className="h-4 w-4" /> Agregar mi versión
              </Button>
            )
          )}

          {/* Aun así puede confirmar para resolver */}
          <div className="pt-1 border-t border-destructive/20">
            <p className="text-xs text-muted-foreground mb-2">
              Si llegaron a un acuerdo, pueden confirmar igualmente para cerrar la disputa:
            </p>
            {fase === "inicio" && (
              confirmacionesPendientes.yo ? (
                <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ya confirmaste — esperando a la otra parte
                </p>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  className="w-full"
                  onClick={() => confirmarInicio.mutate(booking._id)}
                  disabled={confirmarInicio.isPending}
                >
                  {confirmarInicio.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</>
                  ) : (
                    <><PlayCircle className="h-4 w-4" /> Confirmar que el servicio sí inició</>
                  )}
                </Button>
              )
            )}
            {fase === "fin" && (
              confirmacionesPendientes.yo ? (
                <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ya confirmaste — esperando a la otra parte
                </p>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  className="w-full"
                  onClick={() => confirmarFin.mutate(booking._id)}
                  disabled={confirmarFin.isPending}
                >
                  {confirmarFin.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</>
                  ) : (
                    <><StopCircle className="h-4 w-4" /> Confirmar que el servicio sí terminó</>
                  )}
                </Button>
              )
            )}
          </div>
        </div>

        {puedeChatear && otraPersona && (
          <ChatDialog
            open={chatOpen}
            onOpenChange={setChatOpen}
            bookingId={booking._id}
            servicio={booking.servicio}
            estadoReserva="en_disputa"
            otraPersona={otraPersona}
          />
        )}
      </div>
    );
  }

  // ── COMPLETADA: chat + evaluar ─────────────────────────────────────────────
  if (estado === "completada") {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <ChatButton show={puedeChatear && !!otraPersona} onClick={() => setChatOpen(true)} />

          {!yaEvaluo && otraPersona && (
            <Button variant="default" size="sm" onClick={() => setEvaluarOpen(true)}>
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

        {!yaEvaluo && otraPersona && (
          <EvaluarDialog
            open={evaluarOpen}
            onOpenChange={setEvaluarOpen}
            reservaId={booking._id}
            servicio={booking.servicio}
            destinataria={otraPersona}
            tipo={esTrabajadora ? "trabajadora_a_clienta" : "clienta_a_trabajadora"}
          />
        )}
      </>
    );
  }

  return null;
}

// ── Subcomponentes ─────────────────────────────────────────────────────────────

function ConfirmTracker({
  labelA,
  labelB,
  confirmadoA,
  confirmadoB,
}: {
  labelA: string;
  labelB: string;
  confirmadoA: boolean;
  confirmadoB: boolean;
}) {
  return (
    <div className="flex gap-3">
      {[
        { label: labelA, ok: confirmadoA },
        { label: labelB, ok: confirmadoB },
      ].map(({ label, ok }) => (
        <div
          key={label}
          className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
            ok
              ? "border-green-500/40 bg-green-500/10 text-green-700"
              : "border-border bg-muted/50 text-muted-foreground"
          }`}
        >
          {ok ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-current shrink-0" />
          )}
          {label}
        </div>
      ))}
    </div>
  );
}

function ChatButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <MessageCircle className="h-4 w-4" /> Chat
    </Button>
  );
}

interface DisputaFormProps {
  motivo: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  label?: string;
}

function DisputaForm({ motivo, onChange, onSubmit, onCancel, isPending, label }: DisputaFormProps) {
  return (
    <div className="space-y-2 pt-1">
      {label && <p className="text-xs font-medium text-card-foreground">{label}</p>}
      <Textarea
        placeholder="Explica qué pasó con detalle..."
        value={motivo}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={500}
        disabled={isPending}
        className="text-sm"
      />
      <p className="text-xs text-muted-foreground text-right">{motivo.length}/500</p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          className="flex-1"
          onClick={onSubmit}
          disabled={isPending || !motivo.trim()}
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
          ) : (
            <><AlertTriangle className="h-4 w-4" /> Reportar</>
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────

interface OtraPersona {
  _id: string;
  nombre: string;
  apellido: string;
  foto?: string | null;
}

function getOtraPersona(booking: Booking, esTrabajadora: boolean): OtraPersona | null {
  if (esTrabajadora) {
    if (!booking.clienta) return null;
    return {
      _id: booking.clienta._id,
      nombre: booking.clienta.nombre,
      apellido: booking.clienta.apellido,
      foto: booking.clienta.foto,
    };
  }
  if (typeof booking.trabajadora === "object" && booking.trabajadora?.usuario) {
    const u = booking.trabajadora.usuario;
    return { _id: u._id, nombre: u.nombre, apellido: u.apellido, foto: u.foto };
  }
  return null;
}
