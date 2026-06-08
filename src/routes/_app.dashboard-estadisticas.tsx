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
      ? "bg-emerald-50 text-emerald-600"
      : tone === "loss"
        ? "bg-red-50 text-red-600"
        : "bg-blue-50 text-blue-600";

  const trendBadge =
    tone === "gain" ? (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <TrendingUp className="size-3" />
        Ingresos
      </span>
    ) : tone === "loss" ? (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <TrendingDown className="size-3" />
        Egresos
      </span>
    ) : (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        Neutro
      </span>
    );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
            {trendBadge}
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={cn("rounded-xl p-3 shrink-0", iconWrap)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function RegistrosPreviewTable({ rows }: { rows: RegistroSire[] }) {
  const preview = rows.slice(0, 12);
  if (preview.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">Vista registros SIRE</h2>
        <p className="text-xs text-slate-500 mt-1">
          Misma fuente que el módulo Registros SIRE — {rows.length} filas
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6">
                Periodo
              </TableHead>
              <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6">
                Tipo
              </TableHead>
              <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6">
                Contraparte
              </TableHead>
              <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6 text-right">
                Base
              </TableHead>
              <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6 text-right">
                IGV
              </TableHead>
              <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6 text-right">
                Total
              </TableHead>
              <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {preview.map((r) => (
                <TableRow key={r.id} className="bg-white hover:bg-slate-50/80 transition-colors border-none">
                  <TableCell className="font-mono text-xs text-slate-700 py-4 px-6">{r.periodo}</TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium border-0",
                        r.tipo === "VENTA"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          : "bg-red-50 text-red-700 hover:bg-red-50",
                      )}
                    >
                      {r.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-slate-700 py-4 px-6">
                    {r.nombre_contraparte}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums py-4 px-6 font-medium",
                      r.tipo === "VENTA" ? "text-emerald-700" : "text-red-700",
                    )}
                  >
                    {formatMoney(Number(r.bi_grav ?? 0))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-blue-700 py-4 px-6">
                    {formatMoney(Number(r.igv_grav ?? 0))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-slate-900 py-4 px-6">
                    {formatMoney(Number(r.importe_total))}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium border-0",
                        r.estado_validacion === "validado" && "bg-emerald-50 text-emerald-700",
                        r.estado_validacion === "pendiente" && "bg-amber-50 text-amber-700",
                        r.estado_validacion !== "validado" &&
                          r.estado_validacion !== "pendiente" &&
                          "bg-slate-100 text-slate-600",
                      )}
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
    <div className="min-h-full p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6 bg-slate-50">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <h1 className="font-sans text-3xl font-semibold text-slate-800 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <BarChart3 className="size-6" />
            </span>
            Dashboard Estadístico
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-2 flex-wrap">
            <Database className="size-3.5 text-slate-400" />
            Conectado a{" "}
            <code className="text-xs bg-white border border-slate-100 px-2 py-0.5 rounded-md text-slate-600">
              registros_sire
            </code>
            {libro.length > 0 && (
              <>
                {" "}
                y{" "}
                <code className="text-xs bg-white border border-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                  libro diario
                </code>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-0 px-2.5 py-0.5 text-xs font-medium hover:bg-emerald-50">
              {registros.length} registros
            </Badge>
            <Badge className="rounded-full bg-blue-50 text-blue-700 border-0 px-2.5 py-0.5 text-xs font-medium hover:bg-blue-50">
              {libro.length} líneas diario
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-wrap gap-4 items-end">
          <div className="w-36 space-y-1.5">
            <Label className="text-xs font-medium text-slate-500">Periodo desde (AAAAMM)</Label>
            <Input
              placeholder="202601"
              value={periodoDesde}
              onChange={(e) => setPeriodoDesde(formatPeriodoInput(e.target.value))}
              className="border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-36 space-y-1.5">
            <Label className="text-xs font-medium text-slate-500">Periodo hasta (AAAAMM)</Label>
            <Input
              placeholder="202612"
              value={periodoHasta}
              onChange={(e) => setPeriodoHasta(formatPeriodoInput(e.target.value))}
              className="border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-44 space-y-1.5">
            <Label className="text-xs font-medium text-slate-500">RUC contribuyente</Label>
            <Input
              placeholder="Todos"
              value={rucFiltro}
              onChange={(e) => setRucFiltro(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className="font-mono border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
          <div className="w-44 space-y-1.5">
            <Label className="text-xs font-medium text-slate-500">Modo análisis</Label>
            <Select value={modo} onValueChange={(v) => setModo(v as "total" | "individual")}>
              <SelectTrigger className="border-slate-200 bg-slate-50/50">
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
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Users className="size-4 text-slate-500" />
              Reporte individual por entidad
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6">
                    RUC
                  </TableHead>
                  <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6">
                    Razón social
                  </TableHead>
                  <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6 text-right">
                    Ventas
                  </TableHead>
                  <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6 text-right">
                    Compras
                  </TableHead>
                  <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6 text-right">
                    Utilidad
                  </TableHead>
                  <TableHead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 py-4 px-6 text-right">
                    Ratio IGV
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {kpisPorEntidad.map((e) => (
                  <TableRow
                    key={e.ruc}
                    className="bg-white hover:bg-slate-50/80 transition-colors border-none"
                  >
                    <TableCell className="font-mono text-xs text-slate-700 py-4 px-6">{e.ruc}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-700 py-4 px-6">
                      {e.razonSocial}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-emerald-700 py-4 px-6 font-medium">
                      {formatMoney(e.kpis.ventasTotales)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-700 py-4 px-6 font-medium">
                      {formatMoney(e.kpis.comprasTotales)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-slate-900 py-4 px-6">
                      {formatMoney(e.kpis.utilidadNeta)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-blue-700 py-4 px-6 font-medium">
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
