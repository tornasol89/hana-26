import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarkRead, useMessages, useSendMessage } from "../hooks";
import { MessageInput } from "./MessageInput";
import { MessagesList } from "./MessagesList";

interface OtraPersona {
  _id: string;
  nombre: string;
  apellido: string;
  foto?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  servicio: string;
  estadoReserva: "aceptada" | "en_curso" | "en_disputa" | "completada";
  otraPersona: OtraPersona;
}

export function ChatDialog({
  open,
  onOpenChange,
  bookingId,
  servicio,
  estadoReserva,
  otraPersona,
}: Props) {
  const { data: messages, isLoading } = useMessages(bookingId, open);
  const sendMessage = useSendMessage(bookingId);
  useMarkRead(bookingId, open);

  const nombreCompleto = `${otraPersona.nombre} ${otraPersona.apellido ?? ""}`.trim();
  const iniciales = `${otraPersona.nombre?.[0] ?? ""}${
    otraPersona.apellido?.[0] ?? ""
  }`.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 h-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otraPersona.foto ?? undefined} alt={nombreCompleto} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {iniciales || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <DialogTitle className="text-base truncate">
                {nombreCompleto}
              </DialogTitle>
              <DialogDescription className="text-xs truncate">
                {servicio}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Banner de estado */}
        <div className="px-4 py-2 bg-muted/40 border-b border-border text-center shrink-0">
          <Badge variant="secondary" className="text-xs">
            Chat habilitado · Reserva {estadoReserva}
          </Badge>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
          <MessagesList messages={messages} isLoading={isLoading} />
        </div>

        {/* Input */}
        <MessageInput
          onSend={(texto) => sendMessage.mutate(texto)}
          isPending={sendMessage.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}