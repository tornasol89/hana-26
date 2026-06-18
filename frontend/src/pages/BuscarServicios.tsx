import { useMemo, useState } from "react";
import fotoPerfilDefault from "@/assets/foto_perfil.jpg";
import { useNavigate } from "react-router-dom";
import ThreeDPhotoCarousel, { type WorkerCarouselItem } from "@/components/ui/three-d-carousel";
import {
  Star,
  MapPin,
  Search,
  Shield,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Users,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
import { CategoriaSubcategoriaPicker } from "@/features/workers/components/CategoriaSubcategoriaPicker";
import { REGIONES_CHILE } from "@/config/constants";
import type { WorkerProfile } from "@/features/workers/types";
import {
  Expandable,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable";

const TODAS = "todas";

type Orden = "relevancia" | "evaluadas" | "tarifa_asc" | "tarifa_desc";

const ORDEN_OPTS: { value: Orden; label: string }[] = [
  { value: "evaluadas",   label: "⭐ Mejor evaluadas" },
  { value: "relevancia",  label: "Relevancia" },
  { value: "tarifa_asc",  label: "↑ Menor tarifa" },
  { value: "tarifa_desc", label: "↓ Mayor tarifa" },
];

// Paleta de colores para categorías (cicla por índice)
const CAT_PALETTES = [
  { bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd" },
  { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  { bg: "#fff1f2", color: "#be123c", border: "#fda4af" },
  { bg: "#faf5ff", color: "#9333ea", border: "#d8b4fe" },
];

const BuscarServicios = () => {
  const [search, setSearch]       = useState("");
  const [categoria, setCategoria] = useState(TODAS);
  const [subcategoria, setSubcategoria] = useState(TODAS);
  const [region, setRegion]       = useState(TODAS);
  const [orden, setOrden]         = useState<Orden>("relevancia");

  const navigate = useNavigate();

  const { data: workers, isLoading, isError, error, refetch } = useWorkers({
    categoria:    categoria    === TODAS ? undefined : categoria,
    subcategoria: subcategoria === TODAS ? undefined : subcategoria,
    region:       region       === TODAS ? undefined : region,
  });

  const filtered = useMemo(() => {
    if (!workers) return [];
    const term = search.trim().toLowerCase();
    let result = term
      ? workers.filter((w) => {
          const nombre = `${w.usuario?.nombre ?? ""} ${w.usuario?.apellido ?? ""}`.toLowerCase();
          return nombre.includes(term);
        })
      : [...workers];

    if (orden === "evaluadas")   result.sort((a, b) => (b.promedio ?? 0) - (a.promedio ?? 0));
    if (orden === "tarifa_asc")  result.sort((a, b) => a.tarifaHora - b.tarifaHora);
    if (orden === "tarifa_desc") result.sort((a, b) => b.tarifaHora - a.tarifaHora);
    return result;
  }, [workers, search, orden]);

  const topWorkers = useMemo<WorkerCarouselItem[]>(() => {
    if (orden !== "evaluadas" || !filtered.length) return [];
    return filtered.slice(0, 12).map((w) => ({
      id: w._id,
      url: w.usuario?.foto || fotoPerfilDefault,
      label: `${w.usuario?.nombre ?? ""} ${w.usuario?.apellido ?? ""}`.trim() || "Profesional",
      sublabel: w.subcategoria || w.categoria || undefined,
    }));
  }, [orden, filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-[#1a0533] via-[#2d0f52] to-[#160c2e] overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute top-[35%] left-[6%] w-28 h-28 rounded-full bg-white/5 blur-2xl animate-float pointer-events-none" />
        <div className="absolute top-[20%] right-[8%] w-20 h-20 rounded-full bg-accent/10 blur-2xl animate-float pointer-events-none" style={{ animationDelay: "1s" }} />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">
                Profesionales verificadas
              </span>
            </div>

            <h1 className="font-display leading-none mb-3">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">
                Buscar Servicios
              </span>
              <span className="block text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-black italic text-white leading-none">
                Encuentra
              </span>
              <span className="block text-xl md:text-2xl font-bold mt-2 bg-gradient-to-r from-violet-300 via-fuchsia-100 to-amber-200 bg-clip-text text-transparent">
                a tu profesional ideal
              </span>
            </h1>
            <p className="text-white/50 text-sm max-w-sm mx-auto mt-3 leading-relaxed">
              Mujeres verificadas, con experiencia comprobada y reseñas reales de otras clientas.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              { num: "500+", label: "profesionales" },
              { num: "100%", label: "verificadas" },
              { num: "4.9★", label: "valoración media" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl font-bold text-white">{num}</p>
                <p className="text-white/45 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Filtros flotantes ── */}
      <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card rounded-2xl shadow-lg border border-border p-5 space-y-4"
        >
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>

          {/* Categoría + Región */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <CategoriaSubcategoriaPicker
                categoria={categoria}
                subcategoria={subcategoria}
                onCategoriaChange={setCategoria}
                onSubcategoriaChange={setSubcategoria}
                emptyValue={TODAS}
                layout="horizontal"
              />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-11 rounded-xl">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todas las regiones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas las regiones</SelectItem>
                {REGIONES_CHILE.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ordenar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Ordenar:
            </div>
            {ORDEN_OPTS.map((o) => (
              <button
                key={o.value}
                onClick={() => setOrden(o.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200 ${
                  orden === o.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Resultados ── */}
      <div className="container mx-auto px-4 max-w-4xl py-10">

        {/* Cargando */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Buscando profesionales...</p>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <p className="font-semibold text-card-foreground">No pudimos cargar las profesionales</p>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {error instanceof Error ? error.message : "Intenta de nuevo en unos segundos."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
          </div>
        )}

        {/* Vacío */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-card-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground text-center">
              Prueba ajustando la categoría, región o el nombre.
            </p>
          </div>
        )}

        {/* Resultados */}
        {!isLoading && !isError && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {filtered.length === 1 ? "1 profesional encontrada" : `${filtered.length} profesionales encontradas`}
                </h2>
                {(categoria !== TODAS || region !== TODAS) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[categoria !== TODAS && categoria, region !== TODAS && region].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>

            {/* Carrusel "Mejor evaluadas" */}
            <AnimatePresence>
              {orden === "evaluadas" && topWorkers.length > 0 && (
                <motion.div
                  key="carousel-evaluadas"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-10 rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-[#1a0533]/5 via-background to-[#160c2e]/5 shadow-sm"
                >
                  <div className="px-6 pt-6 pb-2 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-2">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">Mejor evaluadas</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gira el carrusel · haz click en una foto para ver el perfil
                    </p>
                  </div>
                  <ThreeDPhotoCarousel
                    workers={topWorkers}
                    onWorkerClick={(id) => navigate(`/worker/${id}`)}
                    compact
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((w, i) => (
                <motion.div
                  key={w._id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <WorkerCard
                    worker={w}
                    paletteIndex={i}
                    onClick={() => navigate(`/worker/${w._id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

// ── WorkerCard ─────────────────────────────────────────────────────────────

function WorkerCard({
  worker,
  paletteIndex,
  onClick,
}: {
  worker: WorkerProfile;
  paletteIndex: number;
  onClick: () => void;
}) {
  const nombreCompleto = `${worker.usuario?.nombre ?? ""} ${worker.usuario?.apellido ?? ""}`.trim();
  const tieneFoto  = !!worker.usuario?.foto;
  const palette    = CAT_PALETTES[paletteIndex % CAT_PALETTES.length];
  const tarifaTexto = worker.tarifaHora > 0
    ? `$${worker.tarifaHora.toLocaleString("es-CL")}/hr`
    : "A convenir";

  return (
    <Expandable className="group rounded-2xl border-2 border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {({ isExpanded }) => (
        <>
          <ExpandableTrigger className="cursor-pointer">
            {/* Área visual superior */}
            <div className="relative h-44 overflow-hidden">
              {tieneFoto ? (
                <img
                  src={worker.usuario.foto!}
                  alt={nombreCompleto}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <img
                  src={fotoPerfilDefault}
                  alt={nombreCompleto}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              )}

              {/* Badges */}
              <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                {worker.promedio && worker.promedio > 0 ? (
                  <>
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="text-xs font-bold text-card-foreground">{worker.promedio.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="text-xs font-medium text-muted-foreground">Nueva</span>
                  </>
                )}
              </div>

              {worker.usuario?.verificada && (
                <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                  <Shield className="h-3 w-3 text-primary-foreground" />
                  <span className="text-xs font-semibold text-primary-foreground">Verificada</span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* Info principal */}
            <div className="px-5 pt-4 pb-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-card-foreground text-base leading-tight truncate">
                    {nombreCompleto || "Sin nombre"}
                  </h3>
                  <p
                    className="text-xs font-semibold mt-0.5 truncate"
                    style={{ color: palette.color }}
                  >
                    {worker.subcategoria || worker.categoria}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-base text-card-foreground">{tarifaTexto}</p>
                </div>
              </div>
            </div>

            {/* Toggle */}
            <div className="px-5 pb-3 pt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.div>
              <span>{isExpanded ? "Ocultar" : "Ver detalles"}</span>
            </div>
          </ExpandableTrigger>

          {/* Contenido expandible */}
          <ExpandableContent preset="slide-up">
            <div
              className="mx-4 mb-4 rounded-xl p-4 space-y-3"
              style={{ backgroundColor: palette.bg, border: `1px solid ${palette.border}` }}
            >
              {worker.descripcion && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {worker.descripcion}
                </p>
              )}

              {(worker.usuario?.comuna || worker.usuario?.region) && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: palette.color }}>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate font-medium">
                    {[worker.usuario?.comuna, worker.usuario?.region].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              {worker.nivelExperiencia && (
                <p className="text-xs text-muted-foreground">
                  Experiencia: <span className="font-semibold text-card-foreground">{worker.nivelExperiencia}</span>
                </p>
              )}

              <Button
                variant="hero"
                size="sm"
                className="w-full gap-1.5 mt-1"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
              >
                Ver perfil completo
                <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </ExpandableContent>
        </>
      )}
    </Expandable>
  );
}

export default BuscarServicios;
