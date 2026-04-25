import type { Message } from "../types";

interface Props {
  message: Message;
  esMio: boolean;
}

export function MessageBubble({ message, esMio }: Props) {
  const hora = new Date(message.createdAt).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex flex-col ${esMio ? "items-end" : "items-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
          esMio
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border text-card-foreground rounded-bl-sm"
        }`}
      >
        {message.texto}
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 px-1">{hora}</span>
    </div>
  );
}