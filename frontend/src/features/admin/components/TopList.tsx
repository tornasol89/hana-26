import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConteoEstado } from "../types";

interface Props {
  title: string;
  items: ConteoEstado[];
  emptyMessage?: string;
  maxItems?: number;
}

export function TopList({
  title,
  items,
  emptyMessage = "Sin datos",
  maxItems = 8,
}: Props) {
  const lista = items.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {lista.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
        ) : (
          <div className="space-y-2">
            {lista.map((item, i) => (
              <div
                key={item._id}
                className="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-card-foreground">
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
                  {item._id}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}