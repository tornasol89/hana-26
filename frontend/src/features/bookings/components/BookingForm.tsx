import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { REGIONES_CHILE, COMUNAS_POR_REGION } from "@/config/constants";
import type { CreateBookingPayload } from "../api";

const HORAS_DISPONIBLES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

interface Props {
  trabajadoraId: string;
  categoriaDefault?: string;
  onSubmit: (payload: CreateBookingPayload) => void;
  isSubmitting: boolean;
  horasOcupadas?: string[];
}

export function BookingForm({
  trabajadoraId,
  categoriaDefault = "",
  onSubmit,
  isSubmitting,
  horasOcupadas = [],
}: Props) {
  const [servicio, setServicio] = useState(categoriaDefault);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [regionServicio, setRegionServicio] = useState("");
  const [comunaServicio, setComunaServicio] = useState("");
  const [direccionServicio, setDireccionServicio] = useState("");

  const comunasDisponibles = regionServicio
    ? (COMUNAS_POR_REGION[regionServicio] ?? [])
    : [];

  function handleRegionChange(region: string) {
    setRegionServicio(region);
    setComunaServicio(""); // resetear comuna al cambiar región
  }

  // Rango de fechas permitido: hoy hasta +30 días
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];
  const max30 = new Date();
  max30.setDate(max30.getDate() + 30);
  const max30Str = max30.toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!servicio.trim() || servicio.trim().length < 5) {
      toast.error("Describe el tipo de servicio (al menos 5 caracteres)");
      return;
    }
    if (!fecha) {
      toast.error("Selecciona una fecha");
      return;
    }
    if (!hora) {
      toast.error("Selecciona una hora");
      return;
    }
    if (!regionServicio) {
      toast.error("Selecciona la región donde se realizará el servicio");
      return;
    }
    if (!comunaServicio) {
      toast.error("Selecciona la comuna donde se realizará el servicio");
      return;
    }

    const fechaCompleta = new Date(`${fecha}T${hora}:00`);

    onSubmit({
      trabajadora: trabajadoraId,
      servicio: servicio.trim(),
      fecha: fechaCompleta.toISOString(),
      notas: notas.trim() || undefined,
      regionServicio,
      comunaServicio,
      direccionServicio: direccionServicio.trim() || undefined,
    });
  }

  const formularioCompleto =
    servicio.trim().length >= 5 &&
    !!fecha &&
    !!hora &&
    !!regionServicio &&
    !!comunaServicio;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Tipo de servicio */}
      <div className="space-y-2">
        <Label htmlFor="servicio">
          Tipo de servicio <span className="text-destructive">*</span>
        </Label>
        <Input
          id="servicio"
          placeholder="Ej: Limpieza profunda, Cuidado de adulta mayor..."
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          disabled={isSubmitting}
          maxLength={100}
          required
        />
        <p className="text-xs text-muted-foreground">
          {servicio.length}/100 caracteres
        </p>
      </div>

      {/* Fecha */}
      <div className="space-y-2">
        <Label htmlFor="fecha">
          Fecha <span className="text-destructive">*</span>{" "}
          <span className="text-muted-foreground text-xs">(hasta 30 días)</span>
        </Label>
        <Input
          id="fecha"
          type="date"
          min={hoyStr}
          max={max30Str}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Hora */}
      <div className="space-y-2">
        <Label>
          Hora disponible <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {HORAS_DISPONIBLES.map((h) => {
            const ocupada = horasOcupadas.includes(h);
            const seleccionada = hora === h;

            return (
              <button
                key={h}
                type="button"
                onClick={() => setHora(h)}
                disabled={ocupada || isSubmitting}
                className={`
                  py-2 px-3 rounded-lg border text-sm font-medium transition-all
                  ${
                    seleccionada
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-card-foreground"
                  }
                  ${ocupada ? "opacity-40 cursor-not-allowed line-through" : ""}
                  disabled:cursor-not-allowed
                `}
                title={ocupada ? "Hora ocupada" : undefined}
              >
                {h}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notas">
          Notas adicionales{" "}
          <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Textarea
          id="notas"
          placeholder="Describe lo que necesitas con más detalle..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          disabled={isSubmitting}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {notas.length}/500 caracteres
        </p>
      </div>

      {/* Región del servicio */}
      <div className="space-y-2">
        <Label htmlFor="regionServicio">
          Región del servicio <span className="text-destructive">*</span>
        </Label>
        <Select
          value={regionServicio}
          onValueChange={handleRegionChange}
          disabled={isSubmitting}
        >
          <SelectTrigger id="regionServicio">
            <SelectValue placeholder="Selecciona la región" />
          </SelectTrigger>
          <SelectContent>
            {REGIONES_CHILE.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comuna del servicio — solo aparece tras elegir región */}
      <div className="space-y-2">
        <Label htmlFor="comunaServicio">
          Comuna del servicio <span className="text-destructive">*</span>
        </Label>
        <Select
          value={comunaServicio}
          onValueChange={setComunaServicio}
          disabled={isSubmitting || !regionServicio}
        >
          <SelectTrigger id="comunaServicio">
            <SelectValue
              placeholder={
                regionServicio
                  ? "Selecciona la comuna"
                  : "Primero elige una región"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {comunasDisponibles.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dirección del servicio */}
      <div className="space-y-2">
        <Label htmlFor="direccionServicio">
          Dirección{" "}
          <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Input
          id="direccionServicio"
          placeholder="Ej: Av. Providencia 1234, depto 5"
          value={direccionServicio}
          onChange={(e) => setDireccionServicio(e.target.value)}
          disabled={isSubmitting}
          maxLength={200}
        />
      </div>

      <Button
        type="submit"
        variant="hero"
        className="w-full"
        size="lg"
        disabled={isSubmitting || !formularioCompleto}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando reserva...
          </>
        ) : (
          "Confirmar reserva"
        )}
      </Button>
    </form>
  );
}
