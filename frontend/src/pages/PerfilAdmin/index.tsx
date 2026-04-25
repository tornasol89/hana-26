import { useState } from "react";
import { LayoutDashboard, ShieldAlert, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats } from "@/features/admin/hooks";
import { PanelTab } from "./PanelTab";
import { UsuariosTab } from "./UsuariosTab";
import { VerificacionTab } from "./VerificacionTab";

type TabId = "panel" | "usuarios" | "verificacion";

export default function PerfilAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("panel");

  // Solo lo usamos para mostrar el badge "(N)" en el tab
  const { data: stats } = useAdminStats();

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="panel">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Panel
            </TabsTrigger>
            <TabsTrigger value="usuarios">
              <Users className="h-4 w-4 mr-2" />
              Usuarias{stats ? ` (${stats.totalUsuarias})` : ""}
            </TabsTrigger>
            <TabsTrigger value="verificacion">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Verificación
              {stats && stats.pendientesVerif > 0
                ? ` (${stats.pendientesVerif})`
                : ""}
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
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}