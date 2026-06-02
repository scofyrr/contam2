import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Database, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { ChartExportPanel } from "@/components/chart-export-panel";
import { fetchLibroDiario, fetchRegistrosSire } from "@/lib/sire-data";
import { computeCharts, computeKpis } from "@/lib/stats-service";
import type { KpisResponse, RegistroSire } from "@/lib/sire-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard-estadisticas")({
  component: DashboardEstadisticasPage,
});

function formatPeriodoInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "gain" | "loss" | "neutral";
}) {
  const border =
    tone === "gain"
      ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
      : tone === "loss"
        ? "border-red-500/40 bg-red-50/50 dark:bg-red-950/20"
        : "border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20";

  const valueClass =
    tone === "gain"
      ? "text-emerald-700"
      : tone === "loss"
        ? "text-red-700"
        : "text-blue-700";

  return (
    <Card className={cn("shadow-sm border-2", border)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon
          className={cn(
            "size-4",
            tone === "gain" && "text-emerald-600",
            tone === "loss" && "text-red-600",
            tone === "neutral" && "text-blue-600",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold tabular-nums", valueClass)}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function RegistrosPreviewTable({ rows }: { rows: RegistroSire[] }) {
  const preview = rows.slice(0, 12);
  if (preview.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Vista registros SIRE</CardTitle>
        <p className="text-xs text-muted-foreground">
          Misma fuente que el módulo Registros SIRE — {rows.length} filas
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periodo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Contraparte</TableHead>
              <TableHead className="text-right">Base</TableHead>
              <TableHead className="text-right">IGV</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.periodo}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        r.tipo === "VENTA"
                          ? "bg-emerald-600 hover:bg-emerald-600"
                          : "bg-red-600 hover:bg-red-600",
                      )}
                    >
                      {r.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {r.nombre_contraparte}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      r.tipo === "VENTA" ? "text-emerald-700" : "text-red-700",
                    )}
                  >
                    {formatMoney(Number(r.bi_grav ?? 0))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-blue-700">
                    {formatMoney(Number(r.igv_grav ?? 0))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatMoney(Number(r.importe_total))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        r.estado_validacion === "validado" && "border-emerald-500 text-emerald-700",
                        r.estado_validacion === "pendiente" && "border-blue-500 text-blue-700",
                      )}
                    >
                      {r.estado_validacion ?? "pendiente"}
                    </Badge>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DashboardEstadisticasPage() {
  const [periodo, setPeriodo] = useState("");

  const registrosQuery = useQuery({
    queryKey: ["dashboard_registros_sire", periodo],
    queryFn: () => fetchRegistrosSire(periodo || undefined),
  });

  const libroQuery = useQuery({
    queryKey: ["dashboard_libro_diario", periodo],
    queryFn: () => fetchLibroDiario(periodo || undefined),
  });

  const registros = registrosQuery.data ?? [];
  const libro = libroQuery.data ?? [];

  const kpis: KpisResponse = useMemo(
    () => computeKpis(registros, periodo || null),
    [registros, periodo],
  );

  const charts = useMemo(
    () => computeCharts(registros, periodo || null),
    [registros, periodo],
  );

  const loading = registrosQuery.isLoading || libroQuery.isLoading;

  const exportPack = useMemo(
    () => ({
      titulo: "CONTAM_Dashboard",
      periodo: periodo || undefined,
      registros,
      libro,
      kpis,
      charts,
    }),
    [periodo, registros, libro, kpis, charts],
  );

  const ratioTone =
    kpis.ratioIgv > 0 ? "gain" : kpis.ratioIgv < 0 ? "loss" : "neutral";

  return (
    <div className="p-6 max-w-[1500px] mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <BarChart3 className="size-8 text-primary" />
            Dashboard Estadístico
          </h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2 flex-wrap">
            <Database className="size-3.5" />
            Conectado a <code className="text-xs bg-muted px-1 rounded">registros_sire</code>
            {libro.length > 0 && (
              <>
                {" "}
                y <code className="text-xs bg-muted px-1 rounded">libro diario</code>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="border-emerald-500/50">
              {registros.length} registros
            </Badge>
            <Badge variant="outline" className="border-blue-500/50">
              {libro.length} líneas diario
            </Badge>
          </div>
        </div>

        <div className="w-44">
          <Label className="text-xs">Periodo (AAAAMM)</Label>
          <Input
            placeholder="Todos"
            value={periodo}
            onChange={(e) => setPeriodo(formatPeriodoInput(e.target.value))}
          />
        </div>
      </header>

      <ChartExportPanel pack={exportPack} disabled={loading} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Ventas totales"
          value={`S/ ${formatMoney(kpis.ventasTotales)}`}
          subtitle={`${kpis.countVentas} comprobantes`}
          icon={TrendingUp}
          tone="gain"
        />
        <KpiCard
          title="Compras totales"
          value={`S/ ${formatMoney(kpis.comprasTotales)}`}
          subtitle={`${kpis.countCompras} comprobantes`}
          icon={TrendingDown}
          tone="loss"
        />
        <KpiCard
          title="Utilidad neta"
          value={`S/ ${formatMoney(kpis.utilidadNeta)}`}
          subtitle="Base ventas − base compras"
          icon={Wallet}
          tone={kpis.utilidadNeta >= 0 ? "gain" : "loss"}
        />
        <KpiCard
          title="Ratio IGV"
          value={`S/ ${formatMoney(kpis.ratioIgv)}`}
          subtitle={`V: ${formatMoney(kpis.igvVentas)} | C: ${formatMoney(kpis.igvCompras)}`}
          icon={BarChart3}
          tone={ratioTone}
        />
      </div>

      <RegistrosPreviewTable rows={registros} />

      <DashboardCharts charts={charts} loading={loading} filtroPeriodo={periodo} />
    </div>
  );
}
