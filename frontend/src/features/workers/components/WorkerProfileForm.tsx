import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MODALIDADES,
  NIVELES_EXPERIENCIA,
} from "@/config/constants";
import { CategoriaSubcategoriaPicker } from "./CategoriaSubcategoriaPicker";
import type { WorkerProfile, WorkerProfileInput } from "../types";
import { toast } from "sonner";

interface Props {
  initialData?: WorkerProfile;
  onSubmit: (payload: WorkerProfileInput) => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function WorkerProfileForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "Guardar",
}: Props) {
  const [form, setForm] = useState<WorkerProfileInput>({
    categoria: initialData?.categoria ?? "",
    subcategoria: initialData?.subcategoria ?? "",
    descripcion: initialData?.descripcion ?? "",
    tarifaHora: initialData?.tarifaHora ?? 0,
    modalidad: initialData?.modalidad ?? "",
    nivelExperiencia: initialData?.nivelExperiencia ?? "",
    disponible: initialData?.disponible ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoria) {
      toast.error("Selecciona una categoría");
      return;
    }
    if (!form.tarifaHora || form.tarifaHora <= 0) {
      toast.error("Indica una tarifa por hora válida");
      return;
    }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Categoría + Especialidad — componente reusable */}
      <CategoriaSubcategoriaPicker
        categoria={form.categoria}
        subcategoria={form.subcategoria}
        onCategoriaChange={(v) =>
          setForm((p) => ({ ...p, categoria: v, subcategoria: "" }))
        }
        onSubcategoriaChange={(v) => setForm((p) => ({ ...p, subcategoria: v }))}
        showLabels
        requiredCategoria
        disabled={isSubmitting}
      />

      <div className="space-y-2">
        <Label htmlFor="descripcion">
          Descripción <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Textarea
          id="descripcion"
          placeholder="Contanos sobre tu experiencia, qué te diferencia, qué herramientas traes..."
          value={form.descripcion}
          onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
          disabled={isSubmitting}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Las clientas leen esto antes de contactarte.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tarifaHora">
            Tarifa por hora (CLP) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tarifaHora"
            type="number"
            min="0"
            step="500"
            placeholder="8000"
            value={form.tarifaHora || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, tarifaHora: Number(e.target.value) }))
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modalidad">Modalidad</Label>
          <Select
            value={form.modalidad}
            onValueChange={(v) => setForm((p) => ({ ...p, modalidad: v }))}
            disabled={isSubmitting}
          >
            <SelectTrigger id="modalidad">
              <SelectValue placeholder="¿Cómo trabajas?" />
            </SelectTrigger>
            <SelectContent>
              {MODALIDADES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nivelExperiencia">Nivel de experiencia</Label>
        <Select
          value={form.nivelExperiencia}
          onValueChange={(v) => setForm((p) => ({ ...p, nivelExperiencia: v }))}
          disabled={isSubmitting}
        >
          <SelectTrigger id="nivelExperiencia">
            <SelectValue placeholder="¿Hace cuánto trabajás en esto?" />
          </SelectTrigger>
          <SelectContent>
            {NIVELES_EXPERIENCIA.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <Label htmlFor="disponible" className="text-sm font-medium">
            Disponible para nuevas reservas
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Si está apagado no vas a aparecer en las búsquedas.
          </p>
        </div>
        <Switch
          id="disponible"
          checked={form.disponible}
          onCheckedChange={(checked) => setForm((p) => ({ ...p, disponible: checked }))}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}