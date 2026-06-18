import { Briefcase, Reply, DollarSign, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  serviciosCompletados: number;
  tasaRespuesta: number;
  tarifaHora: number;
  cantidadResenas: number;
}

function formatearTarifa(tarifa: number): string {
  if (!tarifa || tarifa <= 0) return "A convenir";
  return `$${tarifa.toLocaleString("es-CL")}/hr`;
}

export function WorkerStats({
  serviciosCompletados,
  tasaRespuesta,
  tarifaHora,
  cantidadResenas,
}: Props) {
  const stats = [
    {
      icon: Briefcase,
      label: "Servicios completados",
      value: serviciosCompletados.toString(),
    },
    {
      icon: Reply,
      label: "Tasa de respuesta",
      value: `${tasaRespuesta}%`,
    },
    {
      icon: DollarSign,
      label: "Tarifa",
      value: formatearTarifa(tarifaHora),
    },
    {
      icon: Star,
      label: "Reseñas",
      value: cantidadResenas.toString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 text-center space-y-2">
            <stat.icon className="h-5 w-5 text-primary mx-auto" />
            <p className="text-lg font-bold font-display text-card-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {stat.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}