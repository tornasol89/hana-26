import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { UsuariaCard } from "@/features/admin/components/UsuariaCard";
import { useAdminUsuarias } from "@/features/admin/hooks";

export function VerificacionTab() {
  const { data: usuarias, isLoading, isError, refetch } = useAdminUsuarias();

  // Pendientes = todas las que NO están aprobadas
  const pendientes = useMemo(() => {
    if (!usuarias) return [];
    return usuarias.filter((u) => u.estadoVerificacion !== "aprobado");
  }, [usuarias]);

  if (isLoading) return <LoadingState message="Cargando verificaciones..." />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <ErrorState
            title="No pudimos cargar las verificaciones"
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Usuarias que aún no fueron aprobadas. Click en cada una para ver foto y
        documentos.
      </p>

      {pendientes.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={ShieldCheck}
              title="Todo verificado"
              description="No hay usuarias pendientes de verificación."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm font-medium text-card-foreground">
            {pendientes.length}{" "}
            {pendientes.length === 1 ? "pendiente" : "pendientes"}
          </p>
          <div className="space-y-3">
            {pendientes.map((u) => (
              <UsuariaCard key={u._id} usuaria={u} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}