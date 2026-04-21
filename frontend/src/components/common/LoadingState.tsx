import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Cargando...", className = "" }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}>
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}