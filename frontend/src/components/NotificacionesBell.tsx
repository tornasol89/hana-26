import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  MessageCircle,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotificaciones,
  type Notificacion,
  type TipoNotificacion,
} from "@/features/notifications/hooks";

const ICON: Record<TipoNotificacion, React.ReactNode> = {
  disputa:          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
  nueva_solicitud:  <CheckCircle   className="h-4 w-4 text-primary shrink-0" />,
  confirmar_inicio: <PlayCircle    className="h-4 w-4 text-primary shrink-0" />,
  confirmar_fin:    <StopCircle    className="h-4 w-4 text-amber-600 shrink-0" />,
  mensajes:         <MessageCircle className="h-4 w-4 text-primary shrink-0" />,
};

export function NotificacionesBell() {
  const [open, setOpen] = useState(false);
  const notificaciones = useNotificaciones();
  const navigate = useNavigate();
  const count = notificaciones.length;

  function handleClick(n: Notificacion) {
    setOpen(false);
    navigate(`/mi-perfil?tab=reservas&reserva=${n.bookingId}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-accent/50 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5 text-foreground/80" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white leading-none">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-lg"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-card-foreground">
            Notificaciones
          </p>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">
              {count} pendiente{count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {count === 0 ? (
          <div className="px-4 py-8 text-center space-y-1">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium text-card-foreground">
              Todo al día
            </p>
            <p className="text-xs text-muted-foreground">
              No tienes notificaciones pendientes.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="divide-y divide-border">
              {notificaciones.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"
                >
                  <span className="mt-0.5">{ICON[n.tipo]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground leading-snug">
                      {n.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {n.descripcion}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-t border-border px-4 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => { setOpen(false); navigate("/mi-perfil?tab=reservas"); }}
          >
            Ver mis reservas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
