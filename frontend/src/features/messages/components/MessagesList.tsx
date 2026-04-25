import { useEffect, useRef } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "../types";

interface Props {
  messages: Message[] | undefined;
  isLoading: boolean;
}

export function MessagesList({ messages, isLoading }: Props) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llegan mensajes nuevos
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Cargando mensajes...</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <MessageCircle className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-card-foreground font-medium">
          Aún no hay mensajes
        </p>
        <p className="text-xs text-muted-foreground">
          ¡Sé la primera en escribir!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {messages.map((msg) => {
        const esMio =
          msg.autor._id === user?.id || msg.autor._id === user?._id;
        return <MessageBubble key={msg._id} message={msg} esMio={esMio} />;
      })}
      <div ref={bottomRef} />
    </div>
  );
}