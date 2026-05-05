import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useWorker } from "@/features/workers/hooks";
import { WorkerMetricas } from "@/features/workers/components/WorkerMetricas";
import { WorkerStats } from "@/features/workers/components/WorkerStats";
import { ReviewsList } from "@/features/reviews/components/ReviewsList";
import { ReservarDialog } from "@/features/bookings/components/ReservarDialog";
import { WorkerHero } from "./WorkerHero";

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useWorker(id);

  // ─── Estados ───

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <LoadingState message="Cargando perfil..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !data) {
    const is404 =
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 404;

    return (
      <div className="min-h-screen bg-gradient-warm">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="p-8">
              {is404 ? (
                <EmptyState
                  title="Profesional no encontrada"
                  description="El perfil que intentas ver no existe o fue eliminado."
                  action={
                    <Button asChild variant="hero">
                      <Link to="/buscar">Volver al buscador</Link>
                    </Button>
                  }
                />
              ) : (
                <ErrorState
                  title="No pudimos cargar el perfil"
                  description="Intenta de nuevo en unos segundos."
                  onRetry={() => refetch()}
                />
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const { perfil, reviews, promedio, metricasPromedio, serviciosCompletados, tasaRespuesta, certificadaChilevalora } = data;

  // ─── Lógica de "¿puede reservar?" ───

  // Es el propio perfil de la trabajadora logueada
  const esMiPropioPerfil =
    user &&
    perfil.usuario &&
    (user.id === perfil.usuario._id || user.id === perfil.usuario.id);

  // Solo mostramos el botón si NO es su propio perfil
  const mostrarBotonReservar = !esMiPropioPerfil;

  const nombreCompleto =
    `${perfil.usuario?.nombre ?? ""} ${perfil.usuario?.apellido ?? ""}`.trim() ||
    "Profesional Hana";

  function handleReservarClick() {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para reservar");
      navigate("/login");
      return;
    }
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-4xl space-y-6">
        {/* Botón volver */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        {/* Hero */}
        <WorkerHero
          perfil={perfil}
          promedio={promedio}
          cantidadResenas={reviews.length}
          mostrarBotonReservar={mostrarBotonReservar}
          certificadaChilevalora={certificadaChilevalora ?? false}
          onReservarClick={handleReservarClick}
        />

        {/* Stats */}
        <WorkerStats
          serviciosCompletados={serviciosCompletados}
          tasaRespuesta={tasaRespuesta}
          tarifaHora={perfil.tarifaHora}
          cantidadResenas={reviews.length}
        />

        {/* Sobre el servicio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sobre mi servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {perfil.descripcion?.trim() ||
                "La profesional aún no ha añadido una descripción de su servicio."}
            </p>
          </CardContent>
        </Card>

        {/* Valoraciones detalladas */}
        {reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valoraciones detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkerMetricas metricas={metricasPromedio} />
            </CardContent>
          </Card>
        )}

        {/* Reseñas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Reseñas de clientas
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({reviews.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aún no hay reseñas. ¡Sé la primera en dejarle una opinión!
              </p>
            ) : (
              <ReviewsList data={{ promedio, total: reviews.length, reviews }} />
            )}
          </CardContent>
        </Card>

        {/* Botón volver al final */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Volver al buscador
          </Button>
        </div>
      </div>

      {/* Dialog de reserva */}
      {mostrarBotonReservar && (
        <ReservarDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          trabajadoraId={perfil._id}
          trabajadoraNombre={nombreCompleto}
          categoriaDefault={perfil.categoria}
        />
      )}

      <Footer />
    </div>
  );
}