import { Star } from "lucide-react"; // sumar Star al import de lucide si ya existe
import { ResenasTab } from "./ResenasTab";
import { Briefcase } from "lucide-react"; // ya puede estar el import de lucide, agrega Briefcase
import { MisServiciosTab } from "./MisServiciosTab";
import { Navigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export default function MiPerfil() {
  const { user } = useAuth();
  const uploadPhoto = useUploadPhoto();
  const { data: reservas = [] } = useMyBookings();

  if (!user) return <Navigate to="/login" replace />;

  const iniciales = `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase();
  const esTrabajadora = user.tipo === "trabajadora";
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

                  <Badge variant="secondary" className="gap-1">
                    🌸 {esTrabajadora ? "Trabajadora" : "Clienta"}
                  </Badge>

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
                    {enRevision
                      ? "Verificación en proceso"
                      : "Verificación de identidad pendiente"}
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

        <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className={`grid w-full ${esTrabajadora ? "grid-cols-5" : "grid-cols-3"}`}>
                <TabsTrigger value="perfil">
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                </TabsTrigger>
                {esTrabajadora && (
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
            {esTrabajadora && (
            <TabsTrigger value="resenas">
                <Star className="h-4 w-4 mr-2" />
                Reseñas
            </TabsTrigger>
            )}
        </TabsList>

        <TabsContent value="perfil">
            <PerfilTab user={user} reservas={reservas} />
        </TabsContent>

        {esTrabajadora && (
            <TabsContent value="servicios">
                <MisServiciosTab />
            </TabsContent>
        )}

        <TabsContent value="verificacion">
            <VerificacionTab user={user} />
         </TabsContent>

        <TabsContent value="reservas">
            <ReservasTab esTrabajadora={esTrabajadora} />
        </TabsContent>
        {esTrabajadora && (
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