import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/common/LoadingState";
import api from "@/lib/api";
import type { Booking } from "@/features/bookings/types";

async function getDisputas(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>("/admin/disputas");
  return data;
}

async function resolverDisputa(
  id: string,
  accion: string,
  nota?: string
): Promise<Booking> {
  const { data } = await api.put<Booking>(`/admin/bookings/${id}/resolver-disputa`, {
    accion,
    nota,
  });
  return data;
}

export function DisputasTab() {
  const queryClient = useQueryClient();
  const { data: disputas = [], isLoading } = useQuery({
    queryKey: ["admin", "disputas"],
    queryFn: getDisputas,
    staleTime: 1000 * 30,
  });

  const resolver = useMutation({
    mutationFn: ({
      id,
      accion,
      nota,
    }: {
      id: string;
      accion: string;
      nota?: string;
    }) => resolverDisputa(id, accion, nota),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputas"] });
      toast.success("Disputa resuelta");
    },
    onError: () => toast.error("No se pudo resolver la disputa"),
  });

  if (isLoading) return <LoadingState message="Cargando disputas..." />;

  if (disputas.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 mx-auto text-green-500" />
          <p className="font-medium text-card-foreground">Sin disputas activas</p>
          <p className="text-sm text-muted-foreground">
            Todas las reservas están en orden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {disputas.length} disputa{disputas.length !== 1 ? "s" : ""} activa
        {disputas.length !== 1 ? "s" : ""}. Revisa ambas versiones antes de
        resolver.
      </p>

      {disputas.map((d) => (
        <DisputaCard key={d._id} disputa={d} resolver={resolver} />
      ))}
    </div>
  );
}

// ── Tarjeta individual de disputa ─────────────────────────────────────────────

interface ResolverMutation {
  mutate: (vars: { id: string; accion: string; nota?: string }) => void;
  isPending: boolean;
}

function DisputaCard({
  disputa,
  resolver,
}: {
  disputa: Booking;
  resolver: ResolverMutation;
}) {
  const [nota, setNota] = useState("");

  const fase = disputa.disputa?.fase;
  const trabajadoraNombre = (() => {
    if (typeof disputa.trabajadora === "object" && disputa.trabajadora?.usuario) {
      const u = disputa.trabajadora.usuario;
      return `${u.nombre} ${u.apellido ?? ""}`.trim();
    }
    return "Trabajadora";
  })();
  const clientaNombre = disputa.clienta
    ? `${disputa.clienta.nombre} ${disputa.clienta.apellido ?? ""}`.trim()
    : "Clienta";

  const motivoTrabajadora = disputa.disputa?.motivoTrabajadora?.trim();
  const motivoClienta     = disputa.disputa?.motivoClienta?.trim();

  const creadaEn = disputa.disputa?.creadaEn
    ? new Date(disputa.disputa.creadaEn).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  function accion(a: string) {
    resolver.mutate({ id: disputa._id, accion: a, nota: nota.trim() || undefined });
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              {disputa.servicio}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {trabajadoraNombre} ↔ {clientaNombre}
              {creadaEn && <> · Disputa abierta: {creadaEn}</>}
            </p>
          </div>
          <Badge variant="destructive" className="shrink-0">
            {fase === "inicio" ? "Inicio" : "Fin"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Versiones */}
        <div className="grid sm:grid-cols-2 gap-3">
          <VersionBox
            label={`Versión de ${trabajadoraNombre}`}
            motivo={motivoTrabajadora}
          />
          <VersionBox
            label={`Versión de ${clientaNombre}`}
            motivo={motivoClienta}
          />
        </div>

        {/* Nota admin */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Nota interna (opcional)
          </p>
          <Textarea
            placeholder="Registra tu razonamiento para la resolución..."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            maxLength={300}
            disabled={resolver.isPending}
          />
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-2">
          {fase === "inicio" && (
            <Button
              size="sm"
              variant="default"
              className="col-span-2"
              onClick={() => accion("confirmar_inicio")}
              disabled={resolver.isPending}
            >
              {resolver.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirmar que el servicio sí inició → pasar a En curso
            </Button>
          )}

          {fase === "fin" && (
            <Button
              size="sm"
              variant="default"
              className="col-span-2"
              onClick={() => accion("confirmar_fin")}
              disabled={resolver.isPending}
            >
              {resolver.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirmar que el servicio terminó → pasar a Completada
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => accion("reactivar")}
            disabled={resolver.isPending}
          >
            <RotateCcw className="h-4 w-4" />
            Reactivar sin resolver
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => accion("cancelar")}
            disabled={resolver.isPending}
          >
            <XCircle className="h-4 w-4" />
            Cancelar reserva
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VersionBox({
  label,
  motivo,
}: {
  label: string;
  motivo: string | undefined;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      {motivo ? (
        <p className="text-sm text-card-foreground italic">"{motivo}"</p>
      ) : (
        <p className="text-xs text-muted-foreground italic">Aún no ha respondido</p>
      )}
    </div>
  );
}
