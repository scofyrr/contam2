import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CloudDownload,
  FileText,
  Loader2,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { cn } from "@/lib/utils";
import {
  useDescargarTxtSire,
  useSireComprobantesPeriodo,
  useSireResumenPeriodo,
  useSireSync,
} from "@/modules/sire/hooks/useSireSync";
import { fetchContribuyenteIdByRuc } from "@/modules/sire/services/sireService";
import { SireSyncStatusBadge } from "@/modules/sire/components/SireSyncStatusBadge";
import type {
  SireComprobanteModel,
  SireOrigenRegistro,
  SireTipoRegistro,
} from "@/modules/sire/types/sire-core";
import { labelTipoRegistro } from "@/modules/sire/utils/sireTxtGenerator";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function defaultPeriodo(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

function formatSoles(amount: number, mounted: boolean): string {
  if (!mounted) return "S/ —";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatFecha(fecha: string | null, mounted: boolean): string {
  if (!fecha || !mounted) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(fecha.includes("T") ? fecha : `${fecha}T12:00:00`));
  } catch {
    return fecha;
  }
}

function OrigenBadge({ origen }: { origen: SireOrigenRegistro }) {
  const map: Record<SireOrigenRegistro, string> = {
    SUNAT_PROPUESTA: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    AJUSTE_POSTERIOR: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    REEMPLAZO: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  };
  const labels: Record<SireOrigenRegistro, string> = {
    SUNAT_PROPUESTA: "Propuesta SUNAT",
    AJUSTE_POSTERIOR: "Ajuste",
    REEMPLAZO: "Reemplazo",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px]", map[origen])}>
      {labels[origen]}
    </Badge>
  );
}

function KpiGlassCard({
  label,
  value,
  icon,
  accent = "emerald",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "emerald" | "sky" | "amber";
}) {
  const accentClass =
    accent === "sky"
      ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
      : accent === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

  return (
    <div className={cn(GLASS, "p-5", accentClass.split(" ")[0], "border")}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className={accentClass.split(" ").slice(1).join(" ")}>{icon}</span>
      </div>
      <p className={cn("text-2xl font-bold", accentClass.split(" ")[2])}>{value}</p>
    </div>
  );
}

export interface SireDashboardHubProps {
  className?: string;
}

export function SireDashboardHub({ className }: SireDashboardHubProps) {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();

  const [selectedRuc, setSelectedRuc] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [tipoRegistro, setTipoRegistro] = useState<SireTipoRegistro>("RVIE");

  const contribuyente = useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc],
  );

  const { data: resolvedContribuyenteId } = useQuery({
    queryKey: ["contribuyente-id-by-ruc", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRuc(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 60_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedContribuyenteId ?? null;

  const options = useMemo(
    () =>
      contribuyentes
        .filter((c) => c.ruc?.trim())
        .map((c) => ({
          ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
          label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`,
          id: c.id,
        })),
    [contribuyentes],
  );

  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

  const {
    data: resumen,
    isLoading: loadingResumen,
    refetch: refetchResumen,
    isFetching: fetchingResumen,
  } = useSireResumenPeriodo(contribuyenteId, periodoClean, !!contribuyenteId);

  const {
    data: comprobantes = [],
    isLoading: loadingComprobantes,
    refetch: refetchComprobantes,
  } = useSireComprobantesPeriodo(contribuyenteId, periodoClean, tipoRegistro, !!contribuyenteId);

  const syncMutation = useSireSync();
  const downloadMutation = useDescargarTxtSire();

  const metricasActuales =
    tipoRegistro === "RVIE" ? resumen?.rvie : resumen?.rce;

  const handleSync = () => {
    if (!contribuyenteId) return;
    syncMutation.mutate(
      {
        contribuyenteId,
        periodo: periodoClean,
        tipoRegistro,
      },
      {
        onSuccess: async () => {
          await refetchResumen();
          await refetchComprobantes();
        },
      },
    );
  };

  const handleDescargarTxt = (sinMovimiento: boolean) => {
    if (!selectedRuc) return;
    downloadMutation.mutate({
      ruc: selectedRuc,
      periodo: periodoClean,
      tipoRegistro,
      comprobantes: sinMovimiento ? [] : comprobantes,
      sinMovimiento,
    });
  };

  const periodosOptions = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      list.push(`${y}${m}`);
    }
    return list;
  }, []);

  return (
    <div className={cn("min-h-full space-y-6 p-4 md:p-6", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SIRE Core — Hub de Sincronización
          </h1>
          <p className="text-sm text-muted-foreground">
            RVIE (140400) · RCE (130400) · Propuesta SUNAT · Archivos planos sin movimiento
          </p>
        </div>
        <SireSyncStatusBadge contribuyenteId={contribuyenteId} periodo={periodoClean} />
      </header>

      {/* Barra de control */}
      <div className={cn(GLASS, "p-4 md:p-5")}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div className="space-y-2 lg:col-span-2">
            <Label className="text-slate-400">Contribuyente</Label>
            <Select
              value={selectedRuc || undefined}
              onValueChange={setSelectedRuc}
              disabled={loadingContrib}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950/50 text-slate-100">
                <SelectValue placeholder="Seleccione RUC…" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.ruc} value={o.ruc}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Periodo (YYYYMM)</Label>
            <Select value={periodoClean} onValueChange={setPeriodo}>
              <SelectTrigger className="border-slate-700 bg-slate-950/50 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodosOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.slice(0, 4)}-{p.slice(4, 6)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Registro SIRE</Label>
            <Select
              value={tipoRegistro}
              onValueChange={(v) => setTipoRegistro(v as SireTipoRegistro)}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950/50 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RVIE">{labelTipoRegistro("RVIE")}</SelectItem>
                <SelectItem value="RCE">{labelTipoRegistro("RCE")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={handleSync}
            disabled={!contribuyenteId || syncMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sincronizando…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Sincronizar propuesta SUNAT
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="border-slate-700 text-slate-300"
            disabled={!contribuyenteId || fetchingResumen}
            onClick={() => void refetchResumen()}
          >
            <CloudDownload className="mr-2 size-4" />
            Refrescar resumen
          </Button>
        </div>
      </div>

      {!contribuyenteId && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Seleccione un contribuyente para sincronizar registros SIRE del periodo.
        </div>
      )}

      {contribuyenteId && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiGlassCard
              label="Base imponible"
              value={
                loadingResumen
                  ? "…"
                  : formatSoles(metricasActuales?.baseImponible ?? 0, mounted)
              }
              icon={<TrendingUp className="size-5" />}
              accent="emerald"
            />
            <KpiGlassCard
              label="IGV / IPM"
              value={
                loadingResumen ? "…" : formatSoles(metricasActuales?.igv ?? 0, mounted)
              }
              icon={<ShoppingCart className="size-5" />}
              accent="sky"
            />
            <KpiGlassCard
              label="Total facturado"
              value={
                loadingResumen ? "…" : formatSoles(metricasActuales?.total ?? 0, mounted)
              }
              icon={<FileText className="size-5" />}
              accent="amber"
            />
            <KpiGlassCard
              label="Comprobantes"
              value={
                loadingResumen
                  ? "…"
                  : String(metricasActuales?.cantidadComprobantes ?? 0)
              }
              icon={<FileText className="size-5" />}
            />
          </div>

          {resumen && resumen.inconsistencias.total > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">Inconsistencias detectadas</p>
                <p className="text-sm opacity-90">
                  {resumen.inconsistencias.alertas} alerta(s) ·{" "}
                  {resumen.inconsistencias.erroresBloqueantes} error(es) bloqueante(s)
                </p>
              </div>
            </div>
          )}

          {/* Tabla comprobantes */}
          <div className={cn(GLASS, "overflow-hidden")}>
            <div className="border-b border-slate-800/80 px-6 py-4">
              <h2 className="font-semibold text-slate-100">
                Comprobantes propuestos — {labelTipoRegistro(tipoRegistro)}
              </h2>
              <p className="text-xs text-slate-500">
                Periodo {periodoClean.slice(0, 4)}-{periodoClean.slice(4, 6)}
                {resumen?.fechaSincronizacion && mounted && (
                  <> · Última sync: {formatFecha(resumen.fechaSincronizacion, mounted)}</>
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Fecha</TableHead>
                    <TableHead className="text-slate-400">Tipo</TableHead>
                    <TableHead className="text-slate-400">Serie-Número</TableHead>
                    <TableHead className="text-slate-400">RUC emisor</TableHead>
                    <TableHead className="text-slate-400">Contraparte</TableHead>
                    <TableHead className="text-right text-slate-400">Base</TableHead>
                    <TableHead className="text-right text-slate-400">IGV</TableHead>
                    <TableHead className="text-right text-slate-400">Total</TableHead>
                    <TableHead className="text-slate-400">Origen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingComprobantes && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-12 text-center text-slate-500">
                        <Loader2 className="mx-auto mb-2 size-6 animate-spin text-emerald-400" />
                        Cargando comprobantes…
                      </TableCell>
                    </TableRow>
                  )}

                  {!loadingComprobantes && comprobantes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-12 text-center text-slate-500">
                        Sin comprobantes para este periodo. Sincronice la propuesta SUNAT o
                        genere archivo sin movimiento.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loadingComprobantes &&
                    comprobantes.map((c: SireComprobanteModel) => (
                      <TableRow
                        key={c.id}
                        className="border-slate-800/60 hover:bg-slate-800/30"
                      >
                        <TableCell className="text-slate-300">
                          {formatFecha(c.fechaEmision, mounted)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-400">
                          {c.tipoComprobante}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-200">
                          {c.serie}-{c.numero}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-emerald-400/90">
                          {c.rucContraparte ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-slate-400">
                          {c.razonSocialContraparte ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
                          {formatSoles(c.baseImponibleGravada, mounted)}
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
                          {formatSoles(c.igvIpm, mounted)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-300">
                          {formatSoles(c.totalComprobante, mounted)}
                        </TableCell>
                        <TableCell>
                          <OrigenBadge origen={c.origen} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Sin movimiento */}
          <div className={cn(GLASS, "p-6")}>
            <h3 className="mb-1 font-semibold text-slate-100">
              Declaración sin movimiento
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              Genere el archivo plano `.txt` normativo SUNAT cuando el periodo no registre
              operaciones de {tipoRegistro === "RVIE" ? "ventas" : "compras"}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-emerald-600/40 text-emerald-300 hover:bg-emerald-500/10"
                disabled={!selectedRuc || downloadMutation.isPending}
                onClick={() => handleDescargarTxt(true)}
              >
                {downloadMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 size-4" />
                )}
                Descargar TXT sin movimiento
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300"
                disabled={!selectedRuc || comprobantes.length === 0 || downloadMutation.isPending}
                onClick={() => handleDescargarTxt(false)}
              >
                <FileText className="mr-2 size-4" />
                Descargar TXT con comprobantes ({comprobantes.length})
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
