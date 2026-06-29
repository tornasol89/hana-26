import {
  Briefcase,
  Calendar,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
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

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-amber-500",
  aceptada: "bg-blue-500",
  rechazada: "bg-red-500",
  completada: "bg-green-500",
  cancelada: "bg-white/20",
};

function DarkCard({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 ${className}`}
      style={glow ? { boxShadow: "0 0 24px rgba(124,58,237,0.1)" } : undefined}
    >
      {children}
    </div>
  );
}

function KPI({
  icon: Icon,
  value,
  label,
  color = "text-violet-300",
  delay = 0,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <DarkCard className="text-center space-y-2 hover:border-violet-500/30 transition-colors duration-300">
        <Icon className={`h-5 w-5 mx-auto ${color}`} />
        <p className={`text-3xl font-bold font-mono tabular-nums ${color}`}>{value}</p>
        <p className="text-[10px] text-white/30 uppercase tracking-widest">{label}</p>
      </DarkCard>
    </motion.div>
  );
}

export function PanelTab({ onNavigate }: Props) {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useAdminStats();

  const updatedStr = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  if (isLoading) return (
    <div className="py-16 flex justify-center">
      <LoadingState message="Cargando estadísticas..." />
    </div>
  );

  if (isError || !data) {
    return (
      <DarkCard>
        <ErrorState
          title="No pudimos cargar las estadísticas"
          description="Intentá de nuevo en unos segundos."
          onRetry={() => refetch()}
        />
      </DarkCard>
    );
  }

  const completadas = data.reservasPorEstado.find((r) => r._id === "completada")?.count ?? 0;
  const totalReservasEstado = data.reservasPorEstado.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-5">
      {/* Header con refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">
          &gt; dashboard.stats
        </h2>
        <div className="flex items-center gap-3">
          {updatedStr && (
            <span className="text-[10px] font-mono text-white/25">
              Actualizado: {updatedStr}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-mono"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "actualizando..." : "refrescar"}
          </button>
        </div>
      </div>

      {/* KPIs principales */}
      <div>
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-3 ml-1">// usuarias</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Users} value={data.totalUsuarias} label="Total usuarias" delay={0} />
          <KPI icon={UsersRound} value={data.totalClientas} label="Clientas" color="text-amber-400" delay={0.05} />
          <KPI icon={Briefcase} value={data.totalTrabajadoras} label="Trabajadoras" delay={0.1} />
          <KPI
            icon={ShieldAlert}
            value={data.pendientesVerif}
            label="Pend. verificación"
            color={data.pendientesVerif > 0 ? "text-red-400" : "text-green-400"}
            delay={0.15}
          />
        </div>
      </div>

      {/* Reservas */}
      <div>
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-3 ml-1">// reservas</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KPI icon={Calendar} value={data.totalReservas} label="Total reservas" delay={0.2} />
          <KPI icon={TrendingUp} value={data.reservasUltimos30} label="Últimos 30 días" delay={0.25} />
          <KPI icon={CheckCircle} value={completadas} label="Completadas" color="text-green-400" delay={0.3} />
        </div>
      </div>

      {/* Rankings + estados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estados de reservas con barras */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <DarkCard glow>
            <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
              &gt; reservas.por_estado
            </h3>
            {data.reservasPorEstado.length === 0 ? (
              <p className="text-sm text-white/20 italic">Sin reservas registradas</p>
            ) : (
              <div className="space-y-3">
                {data.reservasPorEstado.map((r) => {
                  const pct = totalReservasEstado > 0 ? Math.round((r.count / totalReservasEstado) * 100) : 0;
                  return (
                    <div key={r._id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/60 capitalize">
                          {ESTADO_LABEL[r._id] ?? r._id}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/30 font-mono">{pct}%</span>
                          <span className="text-sm font-bold font-mono text-violet-300">{r.count}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${ESTADO_COLOR[r._id] ?? "bg-violet-500"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DarkCard>
        </motion.div>

        {/* Acciones rápidas */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <DarkCard>
            <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
              &gt; acciones_rápidas
            </h3>
            <div className="space-y-2">
              {[
                { label: `Ver todas las usuarias (${data.totalUsuarias})`, tab: "usuarios" as const, icon: Users },
                { label: `Revisar verificaciones (${data.pendientesVerif})`, tab: "verificacion" as const, icon: ShieldAlert, alert: data.pendientesVerif > 0 },
                { label: "Ver sugerencias y reclamos", tab: "sugerencias" as const, icon: MessageSquare },
              ].map((a) => (
                <button
                  key={a.tab}
                  onClick={() => onNavigate(a.tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                    ${a.alert
                      ? "bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
                      : "bg-white/[0.04] border border-white/[0.07] text-white/60 hover:bg-white/[0.07] hover:text-white/90"
                    }`}
                >
                  <a.icon className="h-4 w-4 shrink-0" />
                  {a.label}
                </button>
              ))}
            </div>
          </DarkCard>
        </motion.div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "categorias.trabajadoras", items: data.categoriasTrabajadoras, empty: "Sin trabajadoras" },
          { title: "regiones.demanda", items: data.regionesDemanda, empty: "Sin clientas" },
        ].map((list, li) => (
          <motion.div key={list.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + li * 0.05 }}>
            <DarkCard>
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
                &gt; {list.title}
              </h3>
              {list.items.length === 0 ? (
                <p className="text-sm text-white/20 italic">{list.empty}</p>
              ) : (
                <div className="space-y-2">
                  {list.items.slice(0, 5).map((item, i) => {
                    const max = list.items[0]?.count ?? 1;
                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-white/20 w-4 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-xs text-white/60 flex-1 truncate capitalize">{item._id}</span>
                        <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-violet-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / max) * 100}%` }}
                            transition={{ duration: 0.7, delay: 0.5 + i * 0.05 }}
                          />
                        </div>
                        <span className="text-xs font-bold font-mono text-violet-300 w-6 text-right">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </DarkCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
