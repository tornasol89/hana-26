import { useState } from "react";
import { AlertTriangle, LayoutDashboard, MessageSquare, ShieldAlert, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  const { data: stats } = useAdminStats();

  // Conteo de disputas activas para el badge del tab
  const { data: disputas = [] } = useQuery({
    queryKey: ["admin", "disputas"],
    queryFn: async () => {
      const { data } = await api.get("/admin/disputas");
      return data as unknown[];
    },
    staleTime: 1000 * 30,
  });

  // Conteo de sugerencias/reclamos sin leer para el badge del tab
  const { data: sugerencias = [] } = useSugerencias();
  const sugerenciasSinLeer = sugerencias.filter((s) => s.estado === "pendiente").length;

  if (!user) return null;

  const nombreCompleto = `${user.nombre} ${user.apellido ?? ""}`.trim();
  const iniciales =
    `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-5xl space-y-6">
        {/* Hero */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-primary/40">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {iniciales}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-card-foreground truncate">
                  {nombreCompleto}
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                  <ShieldAlert className="h-3 w-3" />
                  Administradora del sistema
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabId)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="panel">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Panel
            </TabsTrigger>
            <TabsTrigger value="usuarios">
              <Users className="h-4 w-4 mr-1" />
              Usuarias{stats ? ` (${stats.totalUsuarias})` : ""}
            </TabsTrigger>
            <TabsTrigger value="verificacion">
              <ShieldAlert className="h-4 w-4 mr-1" />
              Verificación
              {stats && stats.pendientesVerif > 0
                ? ` (${stats.pendientesVerif})`
                : ""}
            </TabsTrigger>
            <TabsTrigger value="disputas" className="relative">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Disputas
              {disputas.length > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {disputas.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sugerencias" className="relative">
              <MessageSquare className="h-4 w-4 mr-1" />
              Mensajes
              {sugerenciasSinLeer > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {sugerenciasSinLeer}
                </span>
              )}
            </TabsTrigger>
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
      </div>

      <Footer />
    </div>
  );
}
