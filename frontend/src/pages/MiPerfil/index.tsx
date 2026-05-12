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
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-4xl">
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
                      <Clock className="h-3 w-3" /> En revisión
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-destructive/40 text-destructive">
                      <ShieldAlert className="h-3 w-3" /> Sin verificar
                    </Badge>
                  )}

                  {/* Badges de roles — uno o ambos */}
                  {tieneRolTrabajadora && (
                    <Badge variant="secondary" className="gap-1">
                      🌸 Trabajadora
                    </Badge>
                  )}
                  {tieneRolClienta && (
                    <Badge variant="secondary" className="gap-1">
                      🌸 Clienta
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
                    {enRevision ? "Verificación en proceso" : "Verificación de identidad pendiente"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {enRevision
                      ? "Tu documento fue recibido. Te avisaremos en 24–48 hrs."
                      : "Sube tu cédula de identidad para contratar o publicar servicios."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banner dashboard trabajadora */}
        {esTrabajadoraActiva && (
          <Link
            to="/dashboard-trabajadora"
            className="group flex items-center justify-between gap-4 mb-4 px-5 py-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/8 border border-primary/20 hover:border-primary/40 hover:shadow-soft transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Panel de trabajadora</p>
                <p className="text-xs text-muted-foreground">Tendencias, consejos de servicio y guía de tarifas</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
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
              🌸 Perfil trabajadora
            </Button>
            <Button
              variant={modoPerfil === "clienta" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg px-5"
              onClick={() => setModoPerfil("clienta")}
            >
              🌸 Perfil clienta
            </Button>
          </div>
        )}

        {/* Respaldos pendientes (solo visible en modo clienta) */}
        {esClientaActiva && <RespaldoPendiente />}

        <Tabs
          key={modoActivo}
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList
            className={`grid w-full ${esTrabajadoraActiva ? "grid-cols-6" : "grid-cols-3"}`}
          >
            <TabsTrigger value="perfil">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            {esTrabajadoraActiva && (
              <TabsTrigger value="servicios">
                <Briefcase className="h-4 w-4 mr-2" />
                Mis servicios
              </TabsTrigger>
            )}
            <TabsTrigger value="verificacion">
              <Shield className="h-4 w-4 mr-2" />
              Verificación
            </TabsTrigger>
            <TabsTrigger value="reservas">
              <Calendar className="h-4 w-4 mr-2" />
              Reservas ({reservas.length})
            </TabsTrigger>
            {esTrabajadoraActiva && (
              <TabsTrigger value="portafolio">
                <Images className="h-4 w-4 mr-2" />
                Portafolio
              </TabsTrigger>
            )}
            {esTrabajadoraActiva && (
              <TabsTrigger value="resenas">
                <Star className="h-4 w-4 mr-2" />
                Reseñas
              </TabsTrigger>
            )}
          </TabsList>

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
