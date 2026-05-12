import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Mail,
  Star,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import api from "@/lib/api";

// ── Tipos ──────────────────────────────────────────────────────────────────

type Tipo = "sugerencia" | "reclamo";
type Estado = "pendiente" | "leido" | "resuelto";

export interface Sugerencia {
  _id: string;
  tipo: Tipo;
  nombre: string;
  email: string;
  categoria: string;
  mensaje: string;
  valoracion?: number;
  estado: Estado;
  creadoEn: string;
}

// ── API ────────────────────────────────────────────────────────────────────

async function getSugerencias(): Promise<Sugerencia[]> {
  const { data } = await api.get<Sugerencia[]>("/admin/sugerencias");
  return data;
}

async function marcarLeido(id: string): Promise<Sugerencia> {
  const { data } = await api.put<Sugerencia>(`/admin/sugerencias/${id}/leido`);
  return data;
}

async function marcarResuelto(id: string): Promise<Sugerencia> {
  const { data } = await api.put<Sugerencia>(`/admin/sugerencias/${id}/resuelto`);
  return data;
}

// ── Hook de datos (exportado para el counter del tab) ─────────────────────

export function useSugerencias() {
  return useQuery<Sugerencia[]>({
    queryKey: ["admin", "sugerencias"],
    queryFn: getSugerencias,
    staleTime: 1000 * 30,
    retry: 1,
  });
}

// ── Componente principal ───────────────────────────────────────────────────

type FiltroTipo = "todas" | Tipo;
type FiltroEstado = "todos" | Estado;

export function SugerenciasTab() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useSugerencias();

  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todas");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");

  const leido = useMutation({
    mutationFn: marcarLeido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sugerencias"] });
      toast.success("Marcado como leído");
    },
    onError: () => toast.error("No se pudo actualizar"),
  });

  const resuelto = useMutation({
    mutationFn: marcarResuelto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sugerencias"] });
      toast.success("Marcado como resuelto");
    },
    onError: () => toast.error("No se pudo actualizar"),
  });

  if (isLoading) return <LoadingState message="Cargando mensajes..." />;

  const filtrados = items.filter((i) => {
    const okTipo = filtroTipo === "todas" || i.tipo === filtroTipo;
    const okEstado = filtroEstado === "todos" || i.estado === filtroEstado;
    return okTipo && okEstado;
  });

  const pendientes = items.filter((i) => i.estado === "pendiente").length;
  const sugerencias = items.filter((i) => i.tipo === "sugerencia").length;
  const reclamos = items.filter((i) => i.tipo === "reclamo").length;

  return (
    <div className="space-y-5">
      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Sin leer" value={pendientes} urgent={pendientes > 0} />
        <MiniStat label="Sugerencias" value={sugerencias} />
        <MiniStat label="Reclamos" value={reclamos} urgent={reclamos > 0} />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(["todas", "sugerencia", "reclamo"] as FiltroTipo[]).map((t) => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 ${
              filtroTipo === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {t === "todas" ? "Todos" : t === "sugerencia" ? "Sugerencias" : "Reclamos"}
          </button>
        ))}

        <div className="w-px bg-border mx-1" />

        {(["todos", "pendiente", "leido", "resuelto"] as FiltroEstado[]).map((e) => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 ${
              filtroEstado === e
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {e === "todos" ? "Todos" : e === "pendiente" ? "Sin leer" : e === "leido" ? "Leídos" : "Resueltos"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-500" />
            <p className="font-medium text-card-foreground">
              {items.length === 0 ? "Sin mensajes recibidos" : "Sin resultados para este filtro"}
            </p>
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? "Cuando una usuaria envíe una sugerencia o reclamo aparecerá aquí."
                : "Prueba con otro filtro."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map((item) => (
            <SugerenciaCard
              key={item._id}
              item={item}
              onLeido={() => leido.mutate(item._id)}
              onResuelto={() => resuelto.mutate(item._id)}
              loading={leido.isPending || resuelto.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tarjeta individual ────────────────────────────────────────────────────

function SugerenciaCard({
  item,
  onLeido,
  onResuelto,
  loading,
}: {
  item: Sugerencia;
  onLeido: () => void;
  onResuelto: () => void;
  loading: boolean;
}) {
  const esSugerencia = item.tipo === "sugerencia";
  const esResuelto = item.estado === "resuelto";
  const esPendiente = item.estado === "pendiente";

  const fecha = new Date(item.creadoEn).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className={`border-l-4 transition-colors ${
        esResuelto
          ? "border-l-green-400 opacity-70"
          : esSugerencia
          ? "border-l-amber-400"
          : "border-l-destructive"
      } ${esPendiente ? "shadow-sm" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {esSugerencia ? (
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            )}
            <CardTitle className="text-sm font-semibold text-card-foreground">
              {item.nombre}
            </CardTitle>
            {esPendiente && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Sin leer" />
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <EstadoBadge estado={item.estado} />
            <TipoBadge tipo={item.tipo} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {item.email}
          </span>
          {item.categoria && <span>· {item.categoria}</span>}
          <span>· {fecha}</span>
        </div>

        {/* Valoración (solo sugerencias) */}
        {esSugerencia && item.valoracion != null && item.valoracion > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className="h-3.5 w-3.5"
                fill={item.valoracion! >= n ? "#d97706" : "none"}
                stroke={item.valoracion! >= n ? "#d97706" : "#cbd5e1"}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">experiencia actual</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-card-foreground leading-relaxed bg-muted/40 rounded-lg px-4 py-3 italic">
          "{item.mensaje}"
        </p>

        {!esResuelto && (
          <div className="flex gap-2">
            {esPendiente && (
              <Button
                size="sm"
                variant="outline"
                onClick={onLeido}
                disabled={loading}
                className="gap-1.5"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                Marcar leído
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onResuelto}
              disabled={loading}
              className="gap-1.5 border-green-500/40 text-green-700 hover:bg-green-500/5"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Marcar resuelto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Helpers visuales ──────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: Estado }) {
  if (estado === "resuelto")
    return (
      <Badge className="bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/20 text-xs">
        Resuelto
      </Badge>
    );
  if (estado === "leido")
    return (
      <Badge variant="secondary" className="text-xs">
        Leído
      </Badge>
    );
  return (
    <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 text-xs">
      Sin leer
    </Badge>
  );
}

function TipoBadge({ tipo }: { tipo: Tipo }) {
  return tipo === "sugerencia" ? (
    <Badge className="bg-amber-500/15 text-amber-700 border border-amber-400/30 hover:bg-amber-500/20 text-xs">
      Sugerencia
    </Badge>
  ) : (
    <Badge variant="destructive" className="text-xs opacity-90">
      Reclamo
    </Badge>
  );
}

function MiniStat({
  label,
  value,
  urgent,
}: {
  label: string;
  value: number;
  urgent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-3 text-center transition-colors ${
        urgent && value > 0
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card"
      }`}
    >
      <p
        className={`text-2xl font-bold font-display ${
          urgent && value > 0 ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
