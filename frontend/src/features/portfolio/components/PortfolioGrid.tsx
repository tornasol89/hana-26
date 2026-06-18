import { useState } from "react";
import { ShieldCheck, Trash2, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeletePortfolioItem } from "../hooks";
import type { PortfolioItem } from "../types";

interface Props {
  items: PortfolioItem[];
  /** Si es true muestra botón de eliminar (vista de la propia trabajadora) */
  editable?: boolean;
}

export function PortfolioGrid({ items, editable = false }: Props) {
  const [viendoItem, setViendoItem] = useState<PortfolioItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const deleteItem = useDeletePortfolioItem();

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="relative group rounded-xl overflow-hidden bg-muted cursor-pointer"
            style={{ aspectRatio: "4/3" }}
            onClick={() => setViendoItem(item)}
          >
            <img
              src={item.fotoUrl}
              alt={item.titulo}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Overlay oscuro al hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Badge de respaldo */}
            {item.respaldada && (
              <div className="absolute bottom-1.5 left-1.5">
                <Badge className="gap-1 text-xs bg-green-600/90 text-white border-0 shadow">
                  <ShieldCheck className="h-3 w-3" />
                  Respaldado
                </Badge>
              </div>
            )}

            {/* Botón eliminar (solo editable) */}
            {editable && (
              <button
                type="button"
                className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(item._id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal de detalle */}
      <Dialog open={!!viendoItem} onOpenChange={(o) => !o && setViendoItem(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {viendoItem && (
            <>
              <img
                src={viendoItem.fotoUrl}
                alt={viendoItem.titulo}
                className="w-full object-cover"
                style={{ maxHeight: "55vh" }}
              />
              <div className="p-5 space-y-3">
                <DialogHeader>
                  <DialogTitle className="text-base">{viendoItem.titulo}</DialogTitle>
                </DialogHeader>

                {viendoItem.descripcion && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {viendoItem.descripcion}
                  </p>
                )}

                {viendoItem.respaldada && viendoItem.respaldadaPor ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700">Trabajo respaldado</p>
                      <p className="text-xs text-muted-foreground">
                        {viendoItem.respaldadaPor.nombre} {viendoItem.respaldadaPor.apellido}
                        {viendoItem.respaldadaPor.verificada && " · Clienta verificada"}
                        {viendoItem.fechaRespaldo && (
                          <> · {new Date(viendoItem.fechaRespaldo).toLocaleDateString("es-CL", { month: "long", year: "numeric" })}</>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  viendoItem.reserva && (
                    <p className="text-xs text-muted-foreground italic">
                      Respaldo pendiente de la clienta
                    </p>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente del portafolio. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  deleteItem.mutate(confirmDelete, { onSuccess: () => setConfirmDelete(null) });
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
