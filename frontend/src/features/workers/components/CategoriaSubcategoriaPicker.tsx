import { Filter, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CATEGORIAS_SERVICIO,
  getSubcategorias,
} from "@/config/constants";

interface Props {
  /** Valor de categoría actual */
  categoria: string;
  /** Valor de subcategoría actual */
  subcategoria: string;
  /** Callback cuando cambia la categoría (la subcategoría se limpia automáticamente) */
  onCategoriaChange: (categoria: string) => void;
  /** Callback cuando cambia la subcategoría */
  onSubcategoriaChange: (subcategoria: string) => void;
  /** Valor que representa "sin filtro" en los Selects. Si se provee, agrega esa opción al inicio */
  emptyValue?: string;
  /** Etiqueta para la opción "vacía" (ej. "Todas las categorías") */
  emptyLabelCategoria?: string;
  emptyLabelSubcategoria?: string;
  /** Mostrar labels arriba de los Selects (usar en forms, no en filtros inline) */
  showLabels?: boolean;
  /** Marcar categoría como required (visual con asterisco rojo) */
  requiredCategoria?: boolean;
  /** Deshabilitar mientras submit en curso */
  disabled?: boolean;
  /** Layout: 'horizontal' para filtros inline, 'vertical' para forms */
  layout?: "horizontal" | "vertical";
}

/**
 * Selector combinado de Categoría + Subcategoría.
 *
 * Maneja la relación: al cambiar la categoría, la subcategoría se resetea.
 * El Select de subcategoría se deshabilita si no hay categoría elegida.
 *
 * Usado tanto en BuscarServicios (con emptyValue="todas") como en
 * WorkerProfileForm (sin emptyValue, las opciones son obligatorias).
 */
export function CategoriaSubcategoriaPicker({
  categoria,
  subcategoria,
  onCategoriaChange,
  onSubcategoriaChange,
  emptyValue,
  emptyLabelCategoria = "Todas las categorías",
  emptyLabelSubcategoria = "Todas las especialidades",
  showLabels = false,
  requiredCategoria = false,
  disabled = false,
  layout = "vertical",
}: Props) {
  // Subcategorías disponibles para la categoría elegida
  // Si emptyValue está activo y la categoría es el centinela "vacío", no hay opciones
  const sinCategoria = !categoria || categoria === emptyValue;
  const subcategoriasDisponibles = sinCategoria ? [] : getSubcategorias(categoria);
  const subcategoriaDisabled = disabled || subcategoriasDisponibles.length === 0;

  // Cuando cambia la categoría, resetear la subcategoría
  function handleCategoriaChange(value: string) {
    onCategoriaChange(value);
    onSubcategoriaChange(emptyValue ?? "");
  }

  const containerClass =
    layout === "horizontal"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
      : "space-y-4";

  return (
    <div className={containerClass}>
      {/* CATEGORÍA */}
      <div className={showLabels ? "space-y-2" : ""}>
        {showLabels && (
          <Label htmlFor="picker-categoria">
            Categoría
            {requiredCategoria && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Select
          value={categoria || ""}
          onValueChange={handleCategoriaChange}
          disabled={disabled}
        >
          <SelectTrigger id="picker-categoria">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {emptyValue !== undefined && (
              <SelectItem value={emptyValue}>{emptyLabelCategoria}</SelectItem>
            )}
            {CATEGORIAS_SERVICIO.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SUBCATEGORÍA */}
      <div className={showLabels ? "space-y-2" : ""}>
        {showLabels && (
          <Label htmlFor="picker-subcategoria">
            Especialidad{" "}
            <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
        )}
        <Select
          value={subcategoria || ""}
          onValueChange={onSubcategoriaChange}
          disabled={subcategoriaDisabled}
        >
          <SelectTrigger id="picker-subcategoria">
            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue
              placeholder={
                sinCategoria
                  ? "Primero elegí categoría"
                  : "Especialidad"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {emptyValue !== undefined && (
              <SelectItem value={emptyValue}>{emptyLabelSubcategoria}</SelectItem>
            )}
            {subcategoriasDisponibles.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}