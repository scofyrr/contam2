import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Database, TrendingDown, TrendingUp, Wallet, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardCharts } from "@/components/dashboard-charts";
import { ChartExportPanel } from "@/components/chart-export-panel";
import { fetchLibroDiario, fetchRegistrosSire } from "@/lib/sire-data";
import { getSireReadSource } from "@/lib/feature-flags";
import { computeCharts, computeKpis, computeKpisByRuc } from "@/lib/stats-service";
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
  const iconWrap =
    tone === "gain"
      ? "bg-gain-subtle text-gain"
      : tone === "loss"
        ? "bg-loss-subtle text-loss"
        : "bg-neutral-subtle text-premium-cyan";

  const trendBadge =
    tone === "gain" ? (
      <Badge variant="success" className="gap-0.5 rounded-full border-0">
        <TrendingUp className="size-3" />
        Ingresos
      </Badge>
    ) : tone === "loss" ? (
      <Badge variant="destructive" className="gap-0.5 rounded-full border-0">
        <TrendingDown className="size-3" />
        Egresos
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-0.5 rounded-full">
        Neutro
      </Badge>
    );

  return (
    <div className="surface-panel p-6 hover-lift fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground count-up">
              {value}
            </p>
            {trendBadge}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground/80">{subtitle}</p>}
        </div>
        <div className={cn("rounded-xl p-3 shrink-0", iconWrap)}>
          <Icon className="size-5" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

function RegistrosPreviewTable({ rows }: { rows: RegistroSire[] }) {
  const preview = rows.slice(0, 12);
  if (preview.length === 0) return null;

  return (
    <div className="surface-panel overflow-hidden mb-6 slide-right">
      <div className="px-6 py-5 border-b border-border/60">
        <h2 className="text-base font-semibold text-foreground">Vista registros SIRE</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Misma fuente que el módulo Registros SIRE — {rows.length} filas
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
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
              <TableRow key={r.id} className="border-border/40">
                <TableCell className="font-mono text-xs">{r.periodo}</TableCell>
                <TableCell>
                  <Badge
                    variant={r.tipo === "VENTA" ? "success" : "destructive"}
                    className="rounded-full border-0"
                  >
                    {r.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[180px] truncate">{r.nombre_contraparte}</TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums font-medium",
                    r.tipo === "VENTA" ? "text-gain" : "text-loss",
                  )}
                >
                  {formatMoney(Number(r.bi_grav ?? 0))}
                </TableCell>
                <TableCell className="text-right tabular-nums text-premium-cyan">
                  {formatMoney(Number(r.igv_grav ?? 0))}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold text-foreground">
                  {formatMoney(Number(r.importe_total))}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      r.estado_validacion === "validado"
                        ? "success"
                        : r.estado_validacion === "pendiente"
                          ? "warning"
                          : "secondary"
                    }
                    className="rounded-full border-0 capitalize"
                  >
                    {r.estado_validacion ?? "pendiente"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DashboardEstadisticasPage() {
  const [periodoDesde, setPeriodoDesde] = useState("");
  const [periodoHasta, setPeriodoHasta] = useState("");
  const [rucFiltro, setRucFiltro] = useState("");
  const [modo, setModo] = useState<"total" | "individual">("total");

  const filters = useMemo(
    () => ({
      periodoDesde: periodoDesde || undefined,
      periodoHasta: periodoHasta || undefined,
      ruc: rucFiltro.trim() || undefined,
    }),
    [periodoDesde, periodoHasta, rucFiltro],
  );

  const registrosQuery = useQuery({
    queryKey: ["dashboard_registros_sire", filters],
    queryFn: () => fetchRegistrosSire(filters),
  });

  const libroQuery = useQuery({
    queryKey: ["dashboard_libro_diario", filters],
    queryFn: () => fetchLibroDiario(filters),
  });

  const registros = registrosQuery.data ?? [];
  const libro = libroQuery.data ?? [];

  const periodoLabel =
    periodoDesde && periodoHasta
      ? `${periodoDesde}–${periodoHasta}`
      : periodoDesde || periodoHasta || null;

  const kpis: KpisResponse = useMemo(
    () => computeKpis(registros, periodoLabel),
    [registros, periodoLabel],
  );

  const charts = useMemo(
    () => computeCharts(registros, periodoLabel),
    [registros, periodoLabel],
  );

  const kpisPorEntidad = useMemo(
    () => (modo === "individual" ? computeKpisByRuc(registros, periodoLabel) : []),
    [modo, registros, periodoLabel],
  );

  const loading = registrosQuery.isLoading || libroQuery.isLoading;

  const exportPack = useMemo(
    () => ({
      titulo: "CONTAM_Dashboard",
      periodo: periodoLabel ?? undefined,
      registros,
      libro,
      kpis,
      charts,
    }),
    [periodoLabel, registros, libro, kpis, charts],
  );

  const ratioTone =
    kpis.ratioIgv > 0 ? "gain" : kpis.ratioIgv < 0 ? "loss" : "neutral";

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-6 fade-in">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-premium-medium">
              <BarChart3 className="size-6" strokeWidth={1.5} />
            </span>
            Dashboard Estadístico
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
            <Database className="size-3.5 text-muted-foreground/70" strokeWidth={1.5} />
            Conectado a{" "}
            <code className="text-xs glass-surface px-2 py-0.5 rounded-md font-mono">
              {getSireReadSource()}
            </code>
            {libro.length > 0 && (
              <>
                {" "}
                y{" "}
                <code className="text-xs glass-surface px-2 py-0.5 rounded-md font-mono">
                  libro diario
                </code>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success" className="rounded-full border-0">
              {registros.length} registros
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {libro.length} líneas diario
            </Badge>
          </div>
        </div>

        <div className="surface-panel p-5 flex flex-wrap gap-4 items-end">
          <div className="w-36 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Periodo desde (AAAAMM)
            </Label>
            <Input
              placeholder="202601"
              value={periodoDesde}
              onChange={(e) => setPeriodoDesde(formatPeriodoInput(e.target.value))}
            />
          </div>
          <div className="w-36 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Periodo hasta (AAAAMM)
            </Label>
            <Input
              placeholder="202612"
              value={periodoHasta}
              onChange={(e) => setPeriodoHasta(formatPeriodoInput(e.target.value))}
            />
          </div>
          <div className="w-44 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">RUC contribuyente</Label>
            <Input
              placeholder="Todos"
              value={rucFiltro}
              onChange={(e) => setRucFiltro(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="font-mono"
            />
          </div>
          <div className="w-44 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Modo análisis</Label>
            <Select value={modo} onValueChange={(v) => setModo(v as "total" | "individual")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Comparativo total</SelectItem>
                <SelectItem value="individual">Individual por entidad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <ChartExportPanel pack={exportPack} disabled={loading} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {modo === "individual" && kpisPorEntidad.length > 0 && (
        <div className="surface-panel overflow-hidden slide-right">
          <div className="px-6 py-5 border-b border-border/60">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" strokeWidth={1.5} />
              Reporte individual por entidad
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead>RUC</TableHead>
                  <TableHead>Razón social</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Compras</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                  <TableHead className="text-right">Ratio IGV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpisPorEntidad.map((e) => (
                  <TableRow key={e.ruc} className="border-border/40">
                    <TableCell className="font-mono text-xs">{e.ruc}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{e.razonSocial}</TableCell>
                    <TableCell className="text-right tabular-nums text-gain font-medium">
                      {formatMoney(e.kpis.ventasTotales)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-loss font-medium">
                      {formatMoney(e.kpis.comprasTotales)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-foreground">
                      {formatMoney(e.kpis.utilidadNeta)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-premium-cyan font-medium">
                      {formatMoney(e.kpis.ratioIgv)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <DashboardCharts charts={charts} loading={loading} filtroPeriodo={periodoLabel ?? ""} />
    </div>
  );
}
