import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  icon?: LucideIcon;
  value: number | string;
  label: string;
  variant?: "default" | "primary" | "amber" | "destructive" | "success";
}

const VARIANT_CLASSES: Record<NonNullable<Props["variant"]>, string> = {
  default: "text-card-foreground",
  primary: "text-primary",
  amber: "text-amber-600",
  destructive: "text-destructive",
  success: "text-green-600",
};

export function StatKPI({ icon: Icon, value, label, variant = "default" }: Props) {
  return (
    <Card>
      <CardContent className="p-5 text-center space-y-2">
        {Icon && <Icon className={`h-5 w-5 mx-auto ${VARIANT_CLASSES[variant]}`} />}
        <p className={`text-3xl font-bold font-display ${VARIANT_CLASSES[variant]}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}