import {
  Briefcase,
  Calendar,
  CheckCircle,
  MessageSquare,
  ShieldAlert,
  Users,
  UsersRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { StatKPI } from "@/features/admin/components/StatKPI";
import { TopList } from "@/features/admin/components/TopList";
import { useAdminStats } from "@/features/admin/hooks";

interface Props {
  onNavigate: (tab: "panel" | "usuarios" | "verificacion" | "disputas" | "sugerencias") => void;
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendientes",
  aceptada: "Aceptadas",
  rechazada: "Rechazadas",
  completada: "Completadas",
  cancelada: "Canceladas",
};

export function PanelTab({ onNavigate }: Props) {
  const { data, isLoading, isError, refetch } = useAdminStats();

  if (isLoading) return <LoadingState message="Cargando estadísticas..." />;
  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-8">
          <ErrorState
            title="No pudimos cargar las estadísticas"
            description="Intentá de nuevo en unos segundos."
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  const completadas =
    data.reservasPorEstado.find((r) => r._id === "completada")?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div>
        <h2 className="text-lg font-semibold font-display mb-3">Resumen general</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatKPI
            icon={Users}
            value={data.totalUsuarias}
            label="Usuarias totales"
            variant="primary"
          />
          <StatKPI
            icon={UsersRound}
            value={data.totalClientas}
            label="Clientas"
            variant="amber"
          />
          <StatKPI
            icon={Briefcase}
            value={data.totalTrabajadoras}
            label="Trabajadoras"
            variant="primary"
          />
          <StatKPI
            icon={ShieldAlert}
            value={data.pendientesVerif}
            label="Pend. verificación"
            variant={data.pendientesVerif > 0 ? "destructive" : "success"}
          />
        </div>
      </div>

      {/* Reservas */}
      <div>
        <h2 className="text-lg font-semibold font-display mb-3">Actividad de reservas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatKPI icon={Calendar} value={data.totalReservas} label="Total reservas" />
          <StatKPI
            icon={Calendar}
            value={data.reservasUltimos30}
            label="Últimos 30 días"
            variant="primary"
          />
          <StatKPI
            icon={CheckCircle}
            value={completadas}
            label="Completadas"
            variant="success"
          />
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopList
          title="Categorías con más trabajadoras"
          items={data.categoriasTrabajadoras}
          emptyMessage="Sin trabajadoras registradas"
        />
        <TopList
          title="Regiones con más clientas"
          items={data.regionesDemanda}
          emptyMessage="Sin clientas registradas"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reservas por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {data.reservasPorEstado.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin reservas</p>
            ) : (
              <div className="space-y-2">
                {data.reservasPorEstado.map((r) => (
                  <div
                    key={r._id}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm capitalize text-card-foreground">
                      {ESTADO_LABEL[r._id] ?? r._id}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigate("usuarios")}
            >
              <Users className="h-4 w-4" />
              Ver todas las usuarias ({data.totalUsuarias})
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigate("verificacion")}
            >
              <ShieldAlert className="h-4 w-4" />
              Revisar verificaciones ({data.pendientesVerif})
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigate("sugerencias")}
            >
              <MessageSquare className="h-4 w-4" />
              Ver sugerencias y reclamos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}