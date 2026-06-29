import { useState, useEffect } from "react";
import {
  AlertTriangle,
  LayoutDashboard,
  MessageSquare,
  ShieldAlert,
  Users,
  Terminal,
} from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats } from "@/features/admin/hooks";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PanelTab } from "./PanelTab";
import { UsuariosTab } from "./UsuariosTab";
import { VerificacionTab } from "./VerificacionTab";
import { DisputasTab } from "./DisputasTab";
import { SugerenciasTab, useSugerencias } from "./SugerenciasTab";

type TabId = "panel" | "usuarios" | "verificacion" | "disputas" | "sugerencias";

export default function PerfilAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("panel");
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: stats } = useAdminStats();

  const { data: disputas = [] } = useQuery({
    queryKey: ["admin", "disputas"],
    queryFn: async () => {
      const { data } = await api.get("/admin/disputas");
      return data as unknown[];
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });

  const { data: sugerencias = [] } = useSugerencias();
  const sugerenciasSinLeer = sugerencias.filter((s) => s.estado === "pendiente").length;

  if (!user) return null;

  const nombreCompleto = `${user.nombre} ${user.apellido ?? ""}`.trim();
  const iniciales =
    `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase() || "A";

  const horaStr = ahora.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const fechaStr = ahora.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-[#07041a]">
      <Navbar />

      {/* Glow decorativo */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[400px] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/3 right-0 w-[400px] h-[300px] rounded-full bg-purple-900/15 blur-[100px] pointer-events-none" />

      <div className="pt-24 pb-12 container mx-auto px-4 max-w-6xl space-y-5 relative z-10">

        {/* Barra de estado en tiempo real */}
        <motion.div
          className="flex items-center justify-between px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-green-400 font-mono tracking-widest uppercase">Sistema en línea</span>
          </div>
          <div className="flex items-center gap-3">
            <Terminal className="h-3 w-3 text-white/20" />
            <span className="text-xs text-white/30 font-mono capitalize">{fechaStr}</span>
            <span className="text-xs text-violet-400 font-mono tabular-nums">{horaStr}</span>
          </div>
        </motion.div>

        {/* Hero admin */}
        <motion.div
          className="rounded-2xl bg-white/[0.04] border border-white/[0.09] p-6 md:p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ boxShadow: "0 0 40px rgba(124,58,237,0.08)" }}
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-16 w-16 border border-violet-500/40">
                <AvatarFallback className="bg-violet-900/60 text-violet-200 text-xl font-bold">
                  {iniciales}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-[#07041a]" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold font-display text-white truncate">
                {nombreCompleto}
              </h1>
              <p className="text-xs text-white/40 font-mono truncate mt-0.5">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/15 border border-violet-500/30 text-violet-300 rounded-lg text-xs font-semibold">
                <ShieldAlert className="h-3 w-3" />
                Administradora del sistema
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Usuarias", val: stats?.totalUsuarias ?? "—" },
                { label: "Trabajadoras", val: stats?.totalTrabajadoras ?? "—" },
                { label: "Pendientes", val: stats?.pendientesVerif ?? "—" },
              ].map((s) => (
                <div key={s.label} className="px-4 border-l border-white/[0.07] first:border-0">
                  <p className="text-2xl font-bold font-mono text-violet-300">{s.val}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabId)}
            className="space-y-5"
          >
            <TabsList className="grid w-full grid-cols-5 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
              {[
                {
                  value: "panel",
                  icon: LayoutDashboard,
                  label: "Panel",
                  badge: null,
                },
                {
                  value: "usuarios",
                  icon: Users,
                  label: `Usuarias${stats ? ` (${stats.totalUsuarias})` : ""}`,
                  badge: null,
                },
                {
                  value: "verificacion",
                  icon: ShieldAlert,
                  label: "Verificación",
                  badge: stats && stats.pendientesVerif > 0 ? stats.pendientesVerif : null,
                  badgeColor: "bg-amber-500",
                },
                {
                  value: "disputas",
                  icon: AlertTriangle,
                  label: "Disputas",
                  badge: disputas.length > 0 ? disputas.length : null,
                  badgeColor: "bg-red-500",
                },
                {
                  value: "sugerencias",
                  icon: MessageSquare,
                  label: "Mensajes",
                  badge: sugerenciasSinLeer > 0 ? sugerenciasSinLeer : null,
                  badgeColor: "bg-violet-500",
                },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative flex items-center gap-1.5 text-white/40 data-[state=active]:text-violet-200 data-[state=active]:bg-violet-600/25 data-[state=active]:shadow-none rounded-lg text-xs font-medium transition-all"
                >
                  <tab.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && (
                    <span className={`${tab.badgeColor ?? "bg-violet-500"} text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ml-0.5`}>
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="panel">
              <PanelTab onNavigate={setActiveTab} />
            </TabsContent>
            <TabsContent value="usuarios">
              <UsuariosTab />
            </TabsContent>
            <TabsContent value="verificacion">
              <VerificacionTab />
            </TabsContent>
            <TabsContent value="disputas">
              <DisputasTab />
            </TabsContent>
            <TabsContent value="sugerencias">
              <SugerenciasTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
