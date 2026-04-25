import { useState } from "react";
import { Check, Loader2, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useDesactivarUsuaria, useVerificarUsuaria } from "../hooks";
import type { UsuariaAdmin } from "../types";

interface Props {
  usuaria: UsuariaAdmin;
}

export function UsuariaActions({ usuaria }: Props) {
  const [confirmDesactivar, setConfirmDesactivar] = useState(false);

  const verificar = useVerificarUsuaria();
  const desactivar = useDesactivarUsuaria();

  const aprobado = usuaria.estadoVerificacion === "aprobado";
  const rechazado = usuaria.estadoVerificacion === "rechazado";
  const cuentaActiva = usuaria.activa !== false;

  const isPending = verificar.isPending || desactivar.isPending;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!aprobado && (
          <Button
            variant="default"
            size="sm"
            onClick={() => verificar.mutate({ id: usuaria._id, decision: "aprobado" })}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {verificar.isPending && verificar.variables?.decision === "aprobado" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Aprobar verificación
          </Button>
        )}

        {!rechazado && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => verificar.mutate({ id: usuaria._id, decision: "rechazado" })}
            disabled={isPending}
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
          >
            {verificar.isPending && verificar.variables?.decision === "rechazado" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {aprobado ? "Revocar verificación" : "Rechazar"}
          </Button>
        )}

        {cuentaActiva && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDesactivar(true)}
            disabled={isPending}
            className="text-muted-foreground"
          >
            <UserX className="h-4 w-4" />
            Desactivar cuenta
          </Button>
        )}
      </div>

      <AlertDialog open={confirmDesactivar} onOpenChange={setConfirmDesactivar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar esta cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              {usuaria.nombre} {usuaria.apellido} no podrá ingresar a Hana hasta que
              reactives la cuenta. Sus datos quedan guardados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={desactivar.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                desactivar.mutate(usuaria._id, {
                  onSuccess: () => setConfirmDesactivar(false),
                });
              }}
              disabled={desactivar.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {desactivar.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Desactivando...
                </>
              ) : (
                "Sí, desactivar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}