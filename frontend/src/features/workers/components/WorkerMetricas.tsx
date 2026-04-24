import { Progress } from "@/components/ui/progress";
import type { MetricasPromedio } from "../types";

interface Props {
  metricas: MetricasPromedio;
}

const LABELS: Record<keyof MetricasPromedio, string> = {
  puntualidad: "Puntualidad",
  confiabilidad: "Confiabilidad",
  calidad: "Calidad del trabajo",
  comunicacion: "Comunicación",
  precio: "Precio justo",
};

export function WorkerMetricas({ metricas }: Props) {
  const keys = Object.keys(LABELS) as (keyof MetricasPromedio)[];

  return (
    <div className="space-y-4">
      {keys.map((key) => {
        const valor = metricas[key] || 0;
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">{LABELS[key]}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {valor}%
              </span>
            </div>
            <Progress value={valor} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}