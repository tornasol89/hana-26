import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { ResenasTab } from "./ResenasTab";
import { Briefcase } from "lucide-react";
import { MisServiciosTab } from "./MisServiciosTab";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Images,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarUploader } from "@/features/profile/components/AvatarUploader";
import { useUploadPhoto } from "@/features/auth/hooks";
import { useMyBookings } from "@/features/bookings/hooks";
import { PerfilTab } from "./PerfilTab";
import { VerificacionTab } from "./VerificacionTab";
import { ReservasTab } from "./ReservasTab";
import { PortafolioTab } from "./PortafolioTab";
import { RespaldoPendiente } from "@/features/portfolio/components/RespaldoPendiente";

export default function MiPerfil() {
  const { user } = useAuth();
  const uploadPhoto = useUploadPhoto();
  const [searchParams] = useSearchParams();
  const reservaDestacada = searchParams.get("reserva") ?? undefined;

  // Todos los hooks ANTES del early return (Rules of Hooks)
  const tieneRolClienta =
    user?.tipo === "clienta" || !!user?.rolesAdicionales?.includes("clienta");
  const tieneRolTrabajadora =
    user?.tipo === "trabajadora" || !!user?.rolesAdicionales?.includes("trabajadora");
  const perfilDual = tieneRolClienta && tieneRolTrabajadora;

  const [modoPerfil, setModoPerfil] = useState<"clienta" | "trabajadora">(
    user?.tipo === "trabajadora" ? "trabajadora" : "clienta"
  );

  const tabInicial = searchParams.get("tab") ?? "perfil";
  const [activeTab, setActiveTab] = useState(tabInicial);

  function cambiarTab(tab: string) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Sincroniza el modo cuando el user llega tarde (race condition post-registro)
  useEffect(() => {
    if (user && !perfilDual) {
      setModoPerfil(user.tipo === "trabajadora" ? "trabajadora" : "clienta");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const modoActivo = (perfilDual ? modoPerfil : (user?.tipo ?? "clienta")) as "clienta" | "trabajadora";
  const esTrabajadoraActiva = modoActivo === "trabajadora";
  const esClientaActiva = modoActivo === "clienta";

  const { data: reservas = [] } = useMyBookings(modoActivo);

  if (!user) return <Navigate to="/login" replace />;

  const iniciales = `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase();
  const verificada = user.estadoVerificacion === "aprobado";
  const enRevision = user.estadoVerificacion === "enviado";

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <AvatarUploader
                src={user.foto}
                fallback={iniciales}
                uploading={uploadPhoto.isPending}
                onFileSelected={(file) => uploadPhoto.mutate(file)}
              />

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-card-foreground">
                  {user.nombre} {user.apellido}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                  {verificada ? (
                    <Badge className="gap-1 bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/20">
                      <ShieldCheck className="h-3 w-3" /> Verificada
                    </Badge>
                  ) : enRevision ? (
                    <Badge variant="outline" className="gap-1 border-amber-400/50 text-amber-600">
                      <Clock className="h-3 w-3" /> En revisiÃ³n
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-destructive/40 text-destructive">
                      <ShieldAlert className="h-3 w-3" /> Sin verificar
                    </Badge>
                  )}

                  {/* Badges de roles â€” uno o ambos */}
                  {tieneRolTrabajadora && (
                    <Badge variant="secondary" className="gap-1">
                      ðŸŒ¸ Trabajadora
                    </Badge>
                  )}
                  {tieneRolClienta && (
                    <Badge variant="secondary" className="gap-1">
                      ðŸŒ¸ Clienta
                    </Badge>
                  )}

                  {user.region && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" /> {user.region}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {!verificada && (
              <div
                className={`mt-6 rounded-xl p-4 flex items-center gap-3 ${
                  enRevision
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-destructive/5 border border-destructive/20"
                }`}
              >
                {enRevision ? (
                  <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
                )}
                <div>
                  <p
                    className={`font-medium text-sm ${
                      enRevision ? "text-amber-900" : "text-destructive"
                    }`}
                  >
                    {enRevision ? "VerificaciÃ³n en proceso" : "VerificaciÃ³n de identidad pendiente"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {enRevision
                      ? "Tu documento fue recibido. Te avisaremos en 24â€“48 hrs."
                      : "Sube tu cÃ©dula de identidad para contratar o publicar servicios."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banner dashboard trabajadora */}
        {esTrabajadoraActiva && (
          <Link to="/dashboard-trabajadora" className="block mb-5">
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a0533] via-[#2d0f52] to-[#1e0b3a] border border-primary/30 shadow-lg px-6 py-5"
            >
              {/* Orbes decorativos */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-primary/20 blur-xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-display font-bold text-white text-base">Panel de trabajadora</p>
                      <span className="inline-flex items-center gap-1 bg-accent/20 border border-accent/30 rounded-full px-2 py-0.5">
                        <Sparkles className="h-2.5 w-2.5 text-accent" />
                        <span className="text-[10px] font-semibold text-accent">Nuevo</span>
                      </span>
                    </div>
                    <p className="text-xs text-white/55">Tendencias del mercado Â· consejos Â· guÃ­a de tarifas</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="hidden sm:block text-xs text-white/50 font-medium">Ver panel</span>
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ChevronRight className="h-4 w-4 text-white/70" />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Selector de modo para perfiles duales */}
        {perfilDual && (
          <div className="flex gap-2 mb-4 p-1 bg-muted rounded-xl w-fit mx-auto">
            <Button
              variant={modoPerfil === "trabajadora" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg px-5"
              onClick={() => setModoPerfil("trabajadora")}
            >
              ðŸŒ¸ Perfil trabajadora
            </Button>
            <Button
              variant={modoPerfil === "clienta" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg px-5"
              onClick={() => setModoPerfil("clienta")}
            >
              ðŸŒ¸ Perfil clienta
            </Button>
          </div>
        )}

        {/* Respaldos pendientes (solo visible en modo clienta) */}
        {esClientaActiva && <RespaldoPendiente />}

        <Tabs
          key={modoActivo}
          value={activeTab}
          onValueChange={cambiarTab}
          className="space-y-6"
        >
          {/* Tabs custom */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <TabItem value="perfil" active={activeTab} onClick={cambiarTab}
              icon={User} label="Perfil" color="#7c3aed" bg="#f5f3ff" />
            {esTrabajadoraActiva && (
              <TabItem value="servicios" active={activeTab} onClick={cambiarTab}
                icon={Briefcase} label="Mis servicios" color="#b45309" bg="#fffbeb" />
            )}
            <TabItem value="verificacion" active={activeTab} onClick={cambiarTab}
              icon={Shield} label="VerificaciÃ³n" color="#be123c" bg="#fff1f2" />
            <TabItem value="reservas" active={activeTab} onClick={cambiarTab}
              icon={Calendar} label="Reservas" color="#9333ea" bg="#faf5ff"
              badge={reservas.length > 0 ? reservas.length : undefined} />
            {esTrabajadoraActiva && (
              <TabItem value="portafolio" active={activeTab} onClick={cambiarTab}
                icon={Images} label="Portafolio" color="#7c3aed" bg="#f5f3ff" />
            )}
            {esTrabajadoraActiva && (
              <TabItem value="resenas" active={activeTab} onClick={cambiarTab}
                icon={Star} label="ReseÃ±as" color="#b45309" bg="#fffbeb" />
            )}
          </div>

          <TabsContent value="perfil">
            <PerfilTab user={user} reservas={reservas} modoActivo={modoActivo} />
          </TabsContent>

          {esTrabajadoraActiva && (
            <TabsContent value="servicios">
              <MisServiciosTab />
            </TabsContent>
          )}

          <TabsContent value="verificacion">
            <VerificacionTab user={user} />
          </TabsContent>

          <TabsContent value="reservas">
            <ReservasTab
              esTrabajadora={esTrabajadoraActiva}
              modo={modoActivo}
              reservaDestacada={reservaDestacada}
            />
          </TabsContent>

          {esTrabajadoraActiva && (
            <TabsContent value="portafolio">
              <PortafolioTab />
            </TabsContent>
          )}

          {esTrabajadoraActiva && (
            <TabsContent value="resenas">
              <ResenasTab />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// â”€â”€ Tab item custom â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TabItem({
  value,
  active,
  onClick,
  icon: Icon,
  label,
  color,
  bg,
  badge,
}: {
  value: string;
  active: string;
  onClick: (v: string) => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
  bg: string;
  badge?: number;
}) {
  const isActive = active === value;
  return (
    <motion.button
      type="button"
      onClick={() => onClick(value)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 shrink-0"
      style={{
        backgroundColor: isActive ? bg : "transparent",
        borderColor: isActive ? color : "#e2e8f0",
        color: isActive ? color : "#64748b",
        boxShadow: isActive ? `0 2px 12px ${color}25` : "none",
      }}
    >
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: isActive ? color + "20" : "#f1f5f9" }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: isActive ? color : "#94a3b8" }} />
      </div>
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-white"
          style={{ backgroundColor: color }}
        >
          {badge}
        </span>
      )}
    </motion.button>
  );
}

