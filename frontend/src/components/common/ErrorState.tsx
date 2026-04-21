import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Algo salió mal",
  description = "No pudimos cargar la información. Intenta de nuevo en unos segundos.",
  onRetry,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}>
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="font-medium text-card-foreground">{title}</p>
      <p className="text-sm text-muted-foreground text-center max-w-md">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}