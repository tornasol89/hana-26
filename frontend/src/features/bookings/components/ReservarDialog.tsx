import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking } from "../hooks";
import { BookingForm } from "./BookingForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabajadoraId: string;
  trabajadoraNombre: string;
  categoriaDefault?: string;
}

export function ReservarDialog({
  open,
  onOpenChange,
  trabajadoraId,
  trabajadoraNombre,
  categoriaDefault,
}: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const createBooking = useCreateBooking();

  // Si por alguna razón abren el dialog sin sesión, redirigimos
  if (!isAuthenticated) {
    onOpenChange(false);
    toast.error("Debes iniciar sesión para reservar");
    navigate("/login");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Reservar servicio</DialogTitle>
          <DialogDescription>con {trabajadoraNombre}</DialogDescription>
        </DialogHeader>

        <BookingForm
          trabajadoraId={trabajadoraId}
          categoriaDefault={categoriaDefault}
          isSubmitting={createBooking.isPending}
          onSubmit={(payload) => {
            createBooking.mutate(payload, {
              onSuccess: () => {
                onOpenChange(false);
                // Redirigimos al tab Reservas de MiPerfil
                navigate("/mi-perfil");
              },
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}