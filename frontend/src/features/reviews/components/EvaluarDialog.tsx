import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "../hooks";
import { StarRating } from "./StarRating";
import type { CreateReviewPayload } from "../api";

interface Destinataria {
  _id: string;
  nombre: string;
  apellido: string;
  foto?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservaId: string;
  servicio: string;
  destinataria: Destinataria;
  tipo: "clienta_a_trabajadora" | "trabajadora_a_clienta";
}

interface MetricaConfig {
  key: keyof NonNullable<CreateReviewPayload["metricas"]>;
  label: string;
}

const METRICAS_TRABAJADORA: MetricaConfig[] = [
  { key: "puntualidad", label: "Puntualidad" },
  { key: "calidad", label: "Calidad" },
  { key: "comunicacion", label: "Comunicación" },
  { key: "confiabilidad", label: "Confiabilidad" },
  { key: "precio", label: "Precio justo" },
];

const METRICAS_CLIENTA: MetricaConfig[] = [
  { key: "puntualidad", label: "Puntualidad" },
  { key: "comunicacion", label: "Comunicación" },
  { key: "confiabilidad", label: "Respeto" },
];

const METRICAS_INICIALES = {
  puntualidad: 0,
  confiabilidad: 0,
  calidad: 0,
  comunicacion: 0,
  precio: 0,
};

type MetricasState = typeof METRICAS_INICIALES;

export function EvaluarDialog({
  open,
  onOpenChange,
  reservaId,
  servicio,
  destinataria,
  tipo,
}: Props) {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [metricas, setMetricas] = useState<MetricasState>(METRICAS_INICIALES);

  const createReview = useCreateReview();

  const esTrabajadora = tipo === "clienta_a_trabajadora";
  const listadoMetricas = esTrabajadora ? METRICAS_TRABAJADORA : METRICAS_CLIENTA;

  const nombreCompleto = `${destinataria.nombre} ${destinataria.apellido ?? ""}`.trim();
  const iniciales = `${destinataria.nombre?.[0] ?? ""}${
    destinataria.apellido?.[0] ?? ""
  }`.toUpperCase();

  function resetForm() {
    setEstrellas(0);
    setComentario("");
    setMetricas(METRICAS_INICIALES);
  }

  function handleClose(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (estrellas === 0) return;

    // Solo enviamos métricas que el usuario realmente seteó (> 0)
    // Como el backend guarda solo lo que le pasamos, omitimos las en 0.
    const metricasFiltradas = Object.fromEntries(
      Object.entries(metricas).filter(([, v]) => v > 0)
    );

    const payload: CreateReviewPayload = {
      reserva: reservaId,
      destinataria: destinataria._id,
      tipo,
      estrellas,
      comentario: comentario.trim() || undefined,
      metricas:
        Object.keys(metricasFiltradas).length > 0 ? metricasFiltradas : undefined,
    };

    createReview.mutate(payload, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {esTrabajadora ? "Evaluar profesional" : "Evaluar clienta"}
          </DialogTitle>
          <DialogDescription>{servicio}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Avatar destinataria */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage
                src={destinataria.foto ?? undefined}
                alt={nombreCompleto}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {iniciales || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm text-card-foreground truncate">
                {nombreCompleto}
              </p>
              <p className="text-xs text-muted-foreground">
                {esTrabajadora ? "Profesional" : "Clienta"}
              </p>
            </div>
          </div>

          {/* Calificación general */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Calificación general <span className="text-destructive">*</span>
            </Label>
            <StarRating
              value={estrellas}
              onChange={setEstrellas}
              size="lg"
              disabled={createReview.isPending}
            />
            {estrellas === 0 && (
              <p className="text-xs text-muted-foreground">
                Selecciona al menos una estrella
              </p>
            )}
          </div>

          {/* Métricas detalladas */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Detalles <span className="text-muted-foreground/60">(opcional)</span>
            </Label>
            <div className="space-y-2.5">
              {listadoMetricas.map((m) => (
                <div
                  key={m.key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-card-foreground">{m.label}</span>
                  <StarRating
                    value={metricas[m.key]}
                    onChange={(v) =>
                      setMetricas((prev) => ({ ...prev, [m.key]: v }))
                    }
                    size="sm"
                    disabled={createReview.isPending}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label
              htmlFor="comentario"
              className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Comentario{" "}
              <span className="text-muted-foreground/60">(opcional)</span>
            </Label>
            <Textarea
              id="comentario"
              placeholder={
                esTrabajadora
                  ? "Cómo fue tu experiencia con esta profesional..."
                  : "Cómo fue trabajar con esta clienta..."
              }
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={createReview.isPending}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comentario.length}/500
            </p>
          </div>

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            size="lg"
            disabled={createReview.isPending || estrellas === 0}
          >
            {createReview.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar evaluación"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}