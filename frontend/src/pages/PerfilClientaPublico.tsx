import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MessageSquare, ShieldAlert, ShieldCheck, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/common/LoadingState";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authApi } from "@/features/auth/api";
import { useUserReviews } from "@/features/reviews/hooks";
import { ReviewCard } from "@/features/reviews/components/ReviewCard";

export default function PerfilClientaPublico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: clienta, isLoading, isError } = useQuery({
    queryKey: ["clienta-publica", id],
    queryFn: () => authApi.getClientaPublico(id!),
    enabled: !!id,
  });

  const { data: resumenResenas } = useUserReviews(id);

  const iniciales = clienta
    ? `${(clienta as any).nombre?.[0] ?? ""}${(clienta as any).apellido?.[0] ?? ""}`.toUpperCase()
    : "?";

  const promedio = resumenResenas?.promedio ?? 0;
  const totalResenas = resumenResenas?.total ?? 0;
  const reviews = resumenResenas?.reviews ?? [];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4 max-w-lg">
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        {isLoading && <LoadingState message="Cargando perfil..." />}

        {isError && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se pudo cargar el perfil de la clienta.
              </p>
            </CardContent>
          </Card>
        )}

        {clienta && (
          <div className="space-y-4">
            {/* Tarjeta principal */}
            <Card>
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={(clienta as any).foto ?? undefined}
                    alt={(clienta as any).nombre}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <h1 className="text-xl font-bold font-display text-card-foreground">
                    {(clienta as any).nombre} {(clienta as any).apellido}
                  </h1>

                  {/* ValoraciÃ³n general */}
                  {totalResenas > 0 && (
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-sm text-card-foreground">
                        {promedio.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({totalResenas} {totalResenas === 1 ? "reseÃ±a" : "reseÃ±as"})
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    {(clienta as any).verificada ? (
                      <Badge className="gap-1 bg-green-500/15 text-green-700 border border-green-500/30">
                        <ShieldCheck className="h-3 w-3" /> Verificada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <ShieldAlert className="h-3 w-3" /> Sin verificar
                      </Badge>
                    )}

                    {(clienta as any).region && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" /> {(clienta as any).region}
                      </Badge>
                    )}

                    {(clienta as any).comuna && (
                      <Badge variant="outline">
                        {(clienta as any).comuna}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="w-full border-t border-border pt-4 space-y-0">
                  {[
                    {
                      label: "Miembro desde",
                      valor: (clienta as any).createdAt
                        ? new Date((clienta as any).createdAt).toLocaleDateString("es-CL", {
                            month: "long",
                            year: "numeric",
                          })
                        : "â€”",
                    },
                    { label: "RegiÃ³n", valor: (clienta as any).region || "â€”" },
                    { label: "Comuna", valor: (clienta as any).comuna || "â€”" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-medium text-card-foreground">{row.valor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SecciÃ³n de reseÃ±as */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    ReseÃ±as recibidas
                  </span>
                  {totalResenas > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">{promedio.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        / 5 Â· {totalResenas} {totalResenas === 1 ? "reseÃ±a" : "reseÃ±as"}
                      </span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {totalResenas === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Esta clienta aÃºn no tiene reseÃ±as.
                  </p>
                ) : (
                  <>
                    {/* Promedio visual */}
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i <= Math.round(promedio)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} />
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

