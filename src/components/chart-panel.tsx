import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartPanelProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  height?: string;
};

/** Contenedor exportable para captura PDF y estilo uniforme */
export function ChartPanel({
  id,
  title,
  description,
  children,
  className,
  height = "h-[320px]",
}: ChartPanelProps) {
  return (
    <Card
      id={id}
      data-export-chart={id}
      className={cn("overflow-hidden shadow-sm", className)}
    >
      <CardHeader className="pb-2 bg-muted/30 border-b">
        <CardTitle className="text-base font-semibold" data-chart-title>
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn("pt-4", height)}>{children}</CardContent>
    </Card>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function formatAxisMoney(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toFixed(0);
}

export const moneyTooltipFormatter = (value: number) =>
  `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
