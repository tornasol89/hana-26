import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
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
import { useCreatePortfolioItem } from "../hooks";
import type { Booking } from "@/features/bookings/types";

interface Props {
  reservasCompletadas: Booking[];
  onCancel: () => void;
}

export function PortfolioUploadForm({ reservasCompletadas, onCancel }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [reservaId, setReservaId] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const create = useCreatePortfolioItem();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    create.mutate(
      {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        foto: file,
        reservaId: reservaId || undefined,
      },
      { onSuccess: onCancel }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Zona de carga de imagen */}
      <div
        className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        style={{ aspectRatio: "4/3" }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-muted-foreground">
            <ImagePlus className="h-10 w-10" />
            <p className="text-sm font-medium">Haz clic para subir una foto</p>
            <p className="text-xs">JPG o PNG, máx. 5 MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
      />

      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="titulo-port">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="titulo-port"
          placeholder="Ej: Limpieza profunda de cocina"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={100}
          disabled={create.isPending}
          required
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label htmlFor="desc-port">
          Descripción{" "}
          <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Textarea
          id="desc-port"
          placeholder="Cuéntanos sobre este trabajo..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={300}
          rows={2}
          disabled={create.isPending}
        />
        <p className="text-xs text-muted-foreground">{descripcion.length}/300</p>
      </div>

      {/* Vincular reserva completada (para que la clienta pueda respaldar) */}
      {reservasCompletadas.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="reserva-port">
            Vincular a un servicio{" "}
            <span className="text-muted-foreground text-xs">(permite que la clienta respalde)</span>
          </Label>
          <Select
            value={reservaId}
            onValueChange={(v) => setReservaId(v === "none" ? "" : v)}
            disabled={create.isPending}
          >
            <SelectTrigger id="reserva-port">
              <SelectValue placeholder="Ninguno (sin respaldo)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin vincular</SelectItem>
              {reservasCompletadas.map((r) => {
                const clientaNombre =
                  typeof r.clienta === "object" && r.clienta
                    ? `${r.clienta.nombre} ${r.clienta.apellido ?? ""}`.trim()
                    : "Clienta";
                return (
                  <SelectItem key={r._id} value={r._id}>
                    {r.servicio} · {clientaNombre}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {reservaId && (
            <p className="text-xs text-primary">
              La clienta de ese servicio podrá respaldar esta foto dándole mayor credibilidad.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          variant="hero"
          disabled={create.isPending || !file || !titulo.trim()}
          className="flex-1"
        >
          {create.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            "Agregar al portafolio"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={create.isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
