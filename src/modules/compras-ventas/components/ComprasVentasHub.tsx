import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Receipt,
  Scale,
  Search,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { cn } from "@/lib/utils";
import {
  useActualizarDestinoIgv,
  useCompras,
  useResumenFiscalPeriodo,
  useVentas,
} from "@/modules/compras-ventas/hooks/useComprasVentas";
import { fetchContribuyenteIdByRucCv } from "@/modules/compras-ventas/services/comprasVentasService";
import type { CompraRce, DestinoIgv, VentaRvie } from "@/modules/compras-ventas/types/comprasVentas";
import {
  DESTINO_IGV_COLORS,
  DESTINO_IGV_LABELS,
} from "@/modules/compras-ventas/types/comprasVentas";
import { labelTipoOperacionVenta } from "@/modules/compras-ventas/utils/taxClassifier";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

const DESTINOS: DestinoIgv[] = [
  "DESTINO_1_GRAVADO",
  "DESTINO_2_MIXTO",
  "DESTINO_3_NO_GRAVADO",
  "SIN_CREDITO_FISCAL",
];

const DESTINO_EMOJI: Record<DestinoIgv, string> = {
  DESTINO_1_GRAVADO: "🟢",
  DESTINO_2_MIXTO: "🟡",
  DESTINO_3_NO_GRAVADO: "🔴",
  SIN_CREDITO_FISCAL: "⚪",
};

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function defaultPeriodo(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
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

function formatComprobante(serie: string | null, numero: string): string {
  return `${serie ?? "—"}-${numero}`;
}

function KpiGlassCard({
  label,
  value,
  icon,
  accent = "emerald",
  sub,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "emerald" | "sky" | "amber" | "red";
  sub?: string;
}) {
  const accentClass =
    accent === "sky"
      ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
      : accent === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : accent === "red"
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

  return (
    <div className={cn(GLASS, "p-4 flex flex-col gap-2")}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
        <div className={cn("rounded-lg border p-2", accentClass)}>{icon}</div>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {sub ? <p className="text-[11px] text-slate-500">{sub}</p> : null}
    </div>
  );
}

function DestinoIgvSelector({
  compra,
  contribuyenteId,
  periodo,
  mounted,
}: {
  compra: CompraRce;
  contribuyenteId: string;
  periodo: string;
  mounted: boolean;
}) {
  const mutation = useActualizarDestinoIgv(contribuyenteId, periodo);

  if (!mounted) {
    return (
      <Badge variant="outline" className={DESTINO_IGV_COLORS[compra.destinoIgv]}>
        {DESTINO_EMOJI[compra.destinoIgv]} …
      </Badge>
    );
  }

  return (
    <Select
      value={compra.destinoIgv}
      disabled={mutation.isPending}
      onValueChange={(v) =>
        mutation.mutate({ compraId: compra.id, nuevoDestino: v as DestinoIgv })
      }
    >
      <SelectTrigger
        className={cn(
          "h-8 w-[200px] text-xs border",
          DESTINO_IGV_COLORS[compra.destinoIgv],
        )}
      >
        <SelectValue>
          {DESTINO_EMOJI[compra.destinoIgv]} {DESTINO_IGV_LABELS[compra.destinoIgv].split("—")[0].trim()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-slate-700">
        {DESTINOS.map((d) => (
          <SelectItem key={d} value={d} className="text-xs">
            {DESTINO_EMOJI[d]} {DESTINO_IGV_LABELS[d]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TablaCompras({
  compras,
  loading,
  mounted,
  contribuyenteId,
  periodo,
}: {
  compras: CompraRce[];
  loading: boolean;
  mounted: boolean;
  contribuyenteId: string;
  periodo: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="size-6 animate-spin mr-2" />
        Cargando compras RCE…
      </div>
    );
  }

  if (compras.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm">
        No hay compras registradas para este periodo. Sincronice SIRE o importe comprobantes.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Fecha</TableHead>
            <TableHead className="text-slate-400">Comprobante</TableHead>
            <TableHead className="text-slate-400">RUC Proveedor</TableHead>
            <TableHead className="text-slate-400">Razón Social</TableHead>
            <TableHead className="text-slate-400">Destino IGV</TableHead>
            <TableHead className="text-slate-400 text-right">Base</TableHead>
            <TableHead className="text-slate-400 text-right">IGV</TableHead>
            <TableHead className="text-slate-400 text-right">Detracción</TableHead>
            <TableHead className="text-slate-400 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compras.map((c) => (
            <TableRow key={c.id} className="border-slate-800/60 hover:bg-slate-800/40">
              <TableCell className="text-sm">{formatFecha(c.fechaEmision, mounted)}</TableCell>
              <TableCell className="font-mono text-xs">
                {formatComprobante(c.serie, c.numero)}
              </TableCell>
              <TableCell className="font-mono text-xs">{c.rucProveedor ?? "—"}</TableCell>
              <TableCell className="max-w-[180px] truncate text-sm" title={c.razonSocialProveedor ?? ""}>
                {c.razonSocialProveedor ?? "—"}
              </TableCell>
              <TableCell>
                <DestinoIgvSelector
                  compra={c}
                  contribuyenteId={contribuyenteId}
                  periodo={periodo}
                  mounted={mounted}
                />
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {formatSoles(c.baseImponible, mounted)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {formatSoles(c.igv, mounted)}
              </TableCell>
              <TableCell className="text-right">
                {c.detraccion.tieneDetraccion ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px]"
                  >
                    {formatSoles(c.detraccion.monto, mounted)}
                  </Badge>
                ) : (
                  <span className="text-slate-600 text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium text-sm">
                {formatSoles(c.total, mounted)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TablaVentas({
  ventas,
  loading,
  mounted,
}: {
  ventas: VentaRvie[];
  loading: boolean;
  mounted: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="size-6 animate-spin mr-2" />
        Cargando ventas RVIE…
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm">
        No hay ventas registradas para este periodo.
      </div>
    );
  }

  const tipoColor: Record<string, string> = {
    GRAVADA: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    EXONERADA: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    INAFECTA: "border-slate-500/40 bg-slate-500/10 text-slate-300",
    EXPORTACION: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    MIXTA: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Fecha</TableHead>
            <TableHead className="text-slate-400">Comprobante</TableHead>
            <TableHead className="text-slate-400">RUC Cliente</TableHead>
            <TableHead className="text-slate-400">Razón Social</TableHead>
            <TableHead className="text-slate-400">Tipo Operación</TableHead>
            <TableHead className="text-slate-400 text-right">Base</TableHead>
            <TableHead className="text-slate-400 text-right">IGV</TableHead>
            <TableHead className="text-slate-400 text-right">Perc./Ret.</TableHead>
            <TableHead className="text-slate-400 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((v) => {
            const base =
              v.baseImponibleGravada + v.valorExonerado + v.valorInafecto + v.exportacion;
            const percRet =
              (v.percepcion.tienePercepcion ? v.percepcion.monto : 0) +
              (v.retencion.tieneRetencion ? v.retencion.monto : 0);

            return (
              <TableRow key={v.id} className="border-slate-800/60 hover:bg-slate-800/40">
                <TableCell className="text-sm">{formatFecha(v.fechaEmision, mounted)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {formatComprobante(v.serie, v.numero)}
                </TableCell>
                <TableCell className="font-mono text-xs">{v.rucCliente ?? "—"}</TableCell>
                <TableCell className="max-w-[180px] truncate text-sm" title={v.razonSocialCliente ?? ""}>
                  {v.razonSocialCliente ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[10px]", tipoColor[v.tipoOperacion])}>
                    {labelTipoOperacionVenta(v.tipoOperacion)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {formatSoles(base, mounted)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {formatSoles(v.igv, mounted)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {percRet > 0 ? formatSoles(percRet, mounted) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-sm">
                  {formatSoles(v.total, mounted)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function ComprasVentasHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [tab, setTab] = useState<"compras" | "ventas">("compras");
  const [busqueda, setBusqueda] = useState("");
  const [filtroDestino, setFiltroDestino] = useState<DestinoIgv | "ALL">("ALL");

  const options = useMemo(
    () =>
      contribuyentes
        .filter((c) => c.ruc?.trim())
        .map((c) => ({
          ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
          label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`,
        })),
    [contribuyentes],
  );

  useEffect(() => {
    if (!selectedRuc && options.length > 0) {
      setSelectedRuc(options[0].ruc);
    }
  }, [options, selectedRuc]);

  const contribuyente = useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc],
  );

  const { data: resolvedContribuyenteId } = useQuery({
    queryKey: ["contribuyente-id-by-ruc-cv", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucCv(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 60_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedContribuyenteId ?? null;

  const filtrosCompras = useMemo(
    () => ({
      busqueda: busqueda || undefined,
      destinoIgv: filtroDestino === "ALL" ? undefined : filtroDestino,
    }),
    [busqueda, filtroDestino],
  );

  const filtrosVentas = useMemo(
    () => ({
      busqueda: busqueda || undefined,
    }),
    [busqueda],
  );

  const comprasQuery = useCompras(
    contribuyenteId,
    periodo,
    filtrosCompras,
    tab === "compras",
  );
  const ventasQuery = useVentas(contribuyenteId, periodo, filtrosVentas, tab === "ventas");
  const resumenQuery = useResumenFiscalPeriodo(contribuyenteId, periodo);

  const resumen = resumenQuery.data;
  const saldoLabel =
    resumen && resumen.saldoFavorEstimado > 0
      ? "Saldo a favor estimado"
      : "IGV por pagar estimado";
  const saldoValor =
    resumen && resumen.saldoFavorEstimado > 0
      ? resumen.saldoFavorEstimado
      : (resumen?.igvAPagarEstimado ?? 0);

  return (
    <div className="min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <Receipt className="size-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Compras & Ventas Fiscal
            </h1>
            <p className="text-sm text-slate-400">
              RCE 130400 · RVIE 140400 — Clasificación IGV, detracciones y resumen tributario
            </p>
          </div>
        </div>
      </header>

      <div className={cn(GLASS, "p-4 flex flex-wrap gap-4 items-end")}>
        <div className="space-y-1.5 min-w-[200px] lg:col-span-2">
          <Label className="text-slate-400 text-xs">Contribuyente</Label>
          <Select
            value={selectedRuc || undefined}
            onValueChange={setSelectedRuc}
            disabled={loadingContrib}
          >
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Seleccione RUC…" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {options.map((o) => (
                <SelectItem key={o.ruc} value={o.ruc}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Periodo (YYYYMM)</Label>
          <Input
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-32 bg-slate-800/50 border-slate-700 font-mono"
            placeholder="202607"
            maxLength={6}
          />
        </div>
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <Label className="text-slate-400 text-xs">Buscar RUC / Razón Social</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-slate-500" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700"
              placeholder="Buscar…"
            />
          </div>
        </div>
        {tab === "compras" ? (
          <div className="space-y-1.5 min-w-[180px]">
            <Label className="text-slate-400 text-xs">Destino IGV</Label>
            <Select
              value={filtroDestino}
              onValueChange={(v) => setFiltroDestino(v as DestinoIgv | "ALL")}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="ALL">Todos</SelectItem>
                {DESTINOS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DESTINO_EMOJI[d]} {DESTINO_IGV_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiGlassCard
          label="Débito Fiscal (IGV Ventas)"
          value={
            resumenQuery.isLoading
              ? "…"
              : formatSoles(resumen?.debitoFiscalIgvVentas ?? 0, mounted)
          }
          icon={<TrendingUp className="size-4" />}
          accent="sky"
          sub={`${resumen?.cantidadVentas ?? 0} comprobantes RVIE`}
        />
        <KpiGlassCard
          label="Crédito Fiscal Destino 1"
          value={
            resumenQuery.isLoading
              ? "…"
              : formatSoles(resumen?.creditoFiscalDestino1 ?? 0, mounted)
          }
          icon={<ArrowDownCircle className="size-4" />}
          accent="emerald"
        />
        <KpiGlassCard
          label="Crédito Fiscal Prorrata (D2)"
          value={
            resumenQuery.isLoading
              ? "…"
              : formatSoles(resumen?.creditoFiscalDestino2Prorrata ?? 0, mounted)
          }
          icon={<Scale className="size-4" />}
          accent="amber"
        />
        <KpiGlassCard
          label={saldoLabel}
          value={resumenQuery.isLoading ? "…" : formatSoles(saldoValor, mounted)}
          icon={
            resumen && resumen.saldoFavorEstimado > 0 ? (
              <TrendingDown className="size-4" />
            ) : (
              <ArrowUpCircle className="size-4" />
            )
          }
          accent={resumen && resumen.saldoFavorEstimado > 0 ? "emerald" : "red"}
          sub={`${resumen?.cantidadCompras ?? 0} compras · CF total ${mounted ? formatSoles(resumen?.creditoFiscalTotal ?? 0, true) : "—"}`}
        />
      </div>

      {!contribuyenteId ? (
        <div className={cn(GLASS, "p-4 text-sm text-amber-300/90 border-amber-500/30")}>
          Seleccione un contribuyente para ver compras, ventas y el resumen fiscal del periodo.
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as "compras" | "ventas")}>
        <TabsList className="bg-slate-800/60 border border-slate-700/80">
          <TabsTrigger
            value="compras"
            className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-300 gap-2"
          >
            <ShoppingCart className="size-4" />
            Compras (RCE 130400)
          </TabsTrigger>
          <TabsTrigger
            value="ventas"
            className="data-[state=active]:bg-sky-600/20 data-[state=active]:text-sky-300 gap-2"
          >
            <TrendingUp className="size-4" />
            Ventas (RVIE 140400)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compras" className="mt-4">
          <div className={cn(GLASS, "p-4")}>
            <TablaCompras
              compras={comprasQuery.data ?? []}
              loading={comprasQuery.isLoading}
              mounted={mounted}
              contribuyenteId={contribuyenteId ?? ""}
              periodo={periodo}
            />
          </div>
        </TabsContent>

        <TabsContent value="ventas" className="mt-4">
          <div className={cn(GLASS, "p-4")}>
            <TablaVentas
              ventas={ventasQuery.data ?? []}
              loading={ventasQuery.isLoading}
              mounted={mounted}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
