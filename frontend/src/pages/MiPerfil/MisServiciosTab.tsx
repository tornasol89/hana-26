import { Briefcase, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { WorkerProfileForm } from "@/features/workers/components/WorkerProfileForm";
import {
  useCreateWorkerProfile,
  useMyWorkerProfile,
  useUpdateWorkerProfile,
} from "@/features/workers/hooks";
import { useAuth } from "@/contexts/AuthContext";

export function MisServiciosTab() {
  const { user } = useAuth();
  const { data: perfil, isLoading, isError } = useMyWorkerProfile();
  const createProfile = useCreateWorkerProfile();
  const updateProfile = useUpdateWorkerProfile();

  if (isLoading) return <LoadingState message="Cargando tu perfil profesional..." />;

  const verificada = user?.estadoVerificacion === "aprobado";

  return (
    <div className="space-y-6">
      {!verificada && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-amber-900">
              Tu cuenta aún no está verificada
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Podés crear tu perfil profesional, pero no vas a aparecer en
              búsquedas hasta que el equipo Hana valide tu identidad.
            </p>
          </div>
        </div>
      )}

      {!perfil && !isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-5 w-5 text-primary" />
              Crea tu perfil profesional
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Completá estos datos para aparecer en el buscador de Hana.
            </p>
          </CardHeader>
          <CardContent>
            <WorkerProfileForm
              onSubmit={(payload) => createProfile.mutate(payload)}
              isSubmitting={createProfile.isPending}
              submitLabel="Crear perfil profesional"
            />
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Briefcase}
              title="No pudimos cargar tu perfil profesional"
              description="Intentá recargar la página o verificá tu conexión."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tu perfil profesional</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mantén esta información actualizada para atraer más clientas.
            </p>
          </CardHeader>
          <CardContent>
            <WorkerProfileForm
              initialData={perfil}
              onSubmit={(payload) => updateProfile.mutate(payload)}
              isSubmitting={updateProfile.isPending}
              submitLabel="Guardar cambios"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}