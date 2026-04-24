import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Search,
  Filter,
  Shield,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkers } from "@/features/workers/hooks";
import type { WorkerProfile } from "@/features/workers/types";

const categorias = [
  "Todas",
  "Limpieza",
  "Cuidado de Adultos",
  "Cuidado Infantil",
  "Cocina",
  "Lavado y Planchado",
  "Asistencia del Hogar",
];

const regiones = [
  "Todas",
  "Metropolitana de Santiago",
  "Valparaíso",
  "Biobío",
  "La Araucanía",
  "O'Higgins",
];

const BuscarServicios = () => {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [region, setRegion] = useState("Todas");

  const navigate = useNavigate();

  // El hook se re-ejecuta automáticamente cuando cambian categoría o región.
  // La búsqueda por nombre se hace en cliente porque el backend no la soporta.
  const { data: workers, isLoading, isError, error, refetch } = useWorkers({
    categoria,
    region,
  });

  const filtered = useMemo(() => {
    if (!workers) return [];
    const term = search.trim().toLowerCase();
    if (!term) return workers;
    return workers.filter((w) => {
      const nombre = `${w.usuario?.nombre ?? ""} ${w.usuario?.apellido ?? ""}`.toLowerCase();
      return nombre.includes(term);
    });
  }, [workers, search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        {/* Header */}
        <div className="bg-gradient-hero py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground mb-2">
              Buscar Profesionales
            </h1>
            <p className="text-primary-foreground/80">
              Encuentra trabajadoras verificadas cerca de ti
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-card rounded-xl shadow-soft p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="md:w-52">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="md:w-52">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Región" />
              </SelectTrigger>
              <SelectContent>
                {regiones.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultados */}
        <div className="container mx-auto px-4 mt-8">
          {/* Estado: cargando */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando profesionales...</p>
            </div>
          )}

          {/* Estado: error */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-card-foreground font-medium">
                No pudimos cargar las profesionales
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {error instanceof Error ? error.message : "Intenta de nuevo en unos segundos."}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {/* Estado: vacío */}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="text-card-foreground font-medium">
                No hay profesionales con esos filtros
              </p>
              <p className="text-sm text-muted-foreground">
                Probá ajustando la categoría, la región o el nombre.
              </p>
            </div>
          )}

          {/* Estado: con resultados */}
          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filtered.length} {filtered.length === 1 ? "profesional encontrada" : "profesionales encontradas"}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((w) => (
                  <WorkerCard
                    key={w._id}
                    worker={w}
                    onClick={() => navigate(`/worker/${w._id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

/**
 * Card individual de trabajadora.
 * Mientras no tengamos rating/reviews en el listado, mostramos "Nueva" en vez del badge de rating.
 */
function WorkerCard({
  worker,
  onClick,
}: {
  worker: WorkerProfile;
  onClick: () => void;
}) {
  const nombreCompleto = `${worker.usuario?.nombre ?? ""} ${worker.usuario?.apellido ?? ""}`.trim();
  const foto = worker.usuario?.foto || "/placeholder.svg";

  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-soft transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={foto}
          alt={nombreCompleto || "Trabajadora"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />

        {/* Badge de rating - por ahora placeholder porque el backend
            no devuelve rating en el listado */}
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="text-xs font-medium text-muted-foreground">Nueva</span>
        </div>

        {worker.usuario?.verificada && (
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1">
            <Shield className="h-3 w-3 text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">Verificada</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-card-foreground text-lg truncate">
              {nombreCompleto || "Sin nombre"}
            </h3>
            <p className="text-sm text-primary font-medium">{worker.categoria}</p>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="text-lg font-bold text-card-foreground">
              ${worker.tarifaHora.toLocaleString("es-CL")}
            </p>
            <p className="text-xs text-muted-foreground">por hora</p>
          </div>
        </div>

        {worker.descripcion && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {worker.descripcion}
          </p>
        )}

        <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">
            {worker.usuario?.comuna}
            {worker.usuario?.comuna && worker.usuario?.region ? ", " : ""}
            {worker.usuario?.region}
          </span>
        </div>

        <Button
          variant="hero"
          className="w-full mt-4 group/btn"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Ver Perfil
          <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

export default BuscarServicios;