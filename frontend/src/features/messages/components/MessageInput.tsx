import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSend: (texto: string) => void;
  isPending: boolean;
}

export function MessageInput({ onSend, isPending }: Props) {
  const [texto, setTexto] = useState("");

  function handleSend() {
    const t = texto.trim();
    if (!t || isPending) return;
    onSend(t);
    setTexto("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border bg-card">
      <Textarea
        placeholder="Escribe un mensaje..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        maxLength={1000}
        rows={1}
        className="min-h-[40px] max-h-[100px] resize-none"
      />
      <Button
        onClick={handleSend}
        disabled={!texto.trim() || isPending}
        size="icon"
        className="shrink-0"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}