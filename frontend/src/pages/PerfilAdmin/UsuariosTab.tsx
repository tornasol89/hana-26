import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { UsuariaCard } from "@/features/admin/components/UsuariaCard";
import { useAdminUsuarias } from "@/features/admin/hooks";
import type { UserType } from "@/features/auth/types";

type FiltroTipo = "todas" | UserType;

const FILTROS: { id: FiltroTipo; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "clienta", label: "Clientas" },
  { id: "trabajadora", label: "Trabajadoras" },
];

export function UsuariosTab() {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todas");
  const [busqueda, setBusqueda] = useState("");

  const { data: usuarias, isLoading, isError, refetch } = useAdminUsuarias();

  const filtradas = useMemo(() => {
    if (!usuarias) return [];
    const term = busqueda.trim().toLowerCase();

    return usuarias.filter((u) => {
      if (filtroTipo !== "todas" && u.tipo !== filtroTipo) return false;
      if (!term) return true;
      const haystack = `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [usuarias, filtroTipo, busqueda]);

  if (isLoading) return <LoadingState message="Cargando usuarias..." />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <ErrorState
            title="No pudimos cargar las usuarias"
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Button
            key={f.id}
            variant={filtroTipo === f.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroTipo(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Resultado */}
      <p className="text-sm text-muted-foreground">
        {filtradas.length} {filtradas.length === 1 ? "usuaria" : "usuarias"}
      </p>

      {filtradas.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Users}
              title="Sin resultados"
              description="Probá ajustando los filtros o la búsqueda."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtradas.map((u) => (
            <UsuariaCard key={u._id} usuaria={u} />
          ))}
        </div>
      )}
    </div>
  );
}