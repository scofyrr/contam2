import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Loader2,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { cn } from "@/lib/utils";
import { ModalLiquidacion } from "@/modules/tesoreria/components/ModalLiquidacion";
import {
  useCuentasBancarias,
  useComprobantesPendientes,
  useMovimientosCaja,
  useResumenCaja,
} from "@/modules/tesoreria/hooks/useTesoreria";
import { fetchContribuyenteIdByRucTes } from "@/modules/tesoreria/services/tesoreriaService";
import type { CuentaBancaria, TipoCuentaBancaria } from "@/modules/tesoreria/types/tesoreria";
import {
  MEDIOS_PAGO_TABLA1,
  TIPO_CUENTA_BANCARIA_COLORS,
  TIPO_CUENTA_BANCARIA_LABELS,
} from "@/modules/tesoreria/types/tesoreria";
import { StepGuardBanner } from "@/modules/workflow/components/StepGuardBanner";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function defaultPeriodo(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatSoles(amount: number, mounted: boolean, moneda = "PEN"): string {
  if (!mounted) return "—";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
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

function labelMedioPago(codigo: string): string {
  return MEDIOS_PAGO_TABLA1.find((m) => m.codigo === codigo)?.label ?? codigo;
}

function CuentaCard({
  cuenta,
  mounted,
  selected,
  onSelect,
}: {
  cuenta: CuentaBancaria;
  mounted: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        GLASS,
        "p-4 text-left transition-all hover:border-emerald-500/40 w-full",
        selected && "ring-2 ring-emerald-500/50 border-emerald-500/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{cuenta.nombreCuenta}</p>
          <p className="text-xs text-slate-500">{cuenta.banco}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("text-[10px]", TIPO_CUENTA_BANCARIA_COLORS[cuenta.tipoCuenta as TipoCuentaBancaria])}
        >
          {TIPO_CUENTA_BANCARIA_LABELS[cuenta.tipoCuenta as TipoCuentaBancaria]}
        </Badge>
      </div>
      <p className="text-2xl font-semibold tabular-nums mt-3">
        {formatSoles(cuenta.saldoActual, mounted, cuenta.moneda)}
      </p>
      <div className="flex gap-2 mt-2 text-[10px] text-slate-500">
        <span>{cuenta.moneda}</span>
        <span>·</span>
        <span>PCGE {cuenta.cuentaPcgeCodigo}</span>
        <span>·</span>
        <span>{cuenta.numeroCuenta}</span>
      </div>
    </button>
  );
}

export function TesoreriaHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [cuentaFiltro, setCuentaFiltro] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);

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
    if (!selectedRuc && options.length > 0) setSelectedRuc(options[0].ruc);
  }, [options, selectedRuc]);

  const contribuyente = useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc],
  );

  const { data: resolvedId } = useQuery({
    queryKey: ["contribuyente-id-tes", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucTes(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 60_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;

  const cuentasQuery = useCuentasBancarias(contribuyenteId);
  const cuentaIdFilter = cuentaFiltro === "all" ? undefined : cuentaFiltro;
  const movimientosQuery = useMovimientosCaja(contribuyenteId, periodo, cuentaIdFilter);
  const pendientesQuery = useComprobantesPendientes(contribuyenteId, periodo);
  const resumenQuery = useResumenCaja(
    contribuyenteId,
    periodo,
    cuentasQuery.data ?? [],
    movimientosQuery.data,
  );

  const cuentas = cuentasQuery.data ?? [];
  const movimientos = movimientosQuery.data ?? [];
  const pendientes = pendientesQuery.data?.length ?? 0;

  return (
    <div className="min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <Wallet className="size-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Tesorería & Libro Caja
            </h1>
            <p className="text-sm text-slate-400">
              Formato SUNAT 010100 · Liquidaciones atómicas · Caja, bancos y detracciones BN
            </p>
          </div>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          disabled={!contribuyenteId || pendientes === 0}
          className="bg-emerald-600 hover:bg-emerald-500 gap-2"
        >
          <Banknote className="size-4" />
          Liquidar comprobante
          {pendientes > 0 ? (
            <Badge variant="secondary" className="ml-1 bg-emerald-950 text-emerald-300">
              {pendientes}
            </Badge>
          ) : null}
        </Button>
      </header>

      <StepGuardBanner
        contribuyenteId={contribuyenteId}
        periodo={periodo}
        vista="tesoreria"
      />

      <div className={cn(GLASS, "p-4 flex flex-wrap gap-4 items-end")}>
        <div className="space-y-1.5 min-w-[240px] lg:flex-1">
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
            maxLength={6}
          />
        </div>
        <div className="space-y-1.5 min-w-[180px]">
          <Label className="text-slate-400 text-xs">Filtrar cuenta</Label>
          <Select value={cuentaFiltro} onValueChange={setCuentaFiltro}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Todas las cuentas</SelectItem>
              {cuentas.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombreCuenta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!contribuyenteId ? (
        <div className={cn(GLASS, "p-4 text-sm text-amber-300/90 border-amber-500/30")}>
          Seleccione un contribuyente para gestionar tesorería y libro caja.
        </div>
      ) : null}

      {contribuyenteId && cuentasQuery.isLoading ? (
        <div className="flex justify-center py-8 text-slate-400">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cuentas.map((c) => (
            <CuentaCard
              key={c.id}
              cuenta={c}
              mounted={mounted}
              selected={cuentaFiltro === c.id}
              onSelect={() => setCuentaFiltro(cuentaFiltro === c.id ? "all" : c.id)}
            />
          ))}
          {cuentas.length === 0 && contribuyenteId ? (
            <div className={cn(GLASS, "p-4 col-span-full text-sm text-slate-500 text-center")}>
              Sin cuentas bancarias. Ejecute la migración Módulo 6 o cree una cuenta.
            </div>
          ) : null}
        </div>
      )}

      {resumenQuery.data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={cn(GLASS, "p-4 flex items-center gap-3")}>
            <ArrowUpCircle className="size-8 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Ingresos periodo</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatSoles(resumenQuery.data.totalIngresos, mounted)}
              </p>
            </div>
          </div>
          <div className={cn(GLASS, "p-4 flex items-center gap-3")}>
            <ArrowDownCircle className="size-8 text-red-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Egresos periodo</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatSoles(resumenQuery.data.totalEgresos, mounted)}
              </p>
            </div>
          </div>
          <div className={cn(GLASS, "p-4 flex items-center gap-3")}>
            <Wallet className="size-8 text-sky-400" />
            <div>
              <p className="text-xs text-slate-500 uppercase">Saldo cuentas</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatSoles(resumenQuery.data.saldoCuentas, mounted)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn(GLASS, "p-4")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Libro Caja y Bancos — Formato 010100
          </h2>
          <Badge variant="outline" className="text-[10px] border-slate-600">
            {movimientos.length} movimientos
          </Badge>
        </div>

        {movimientosQuery.isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="size-6 animate-spin mr-2" />
            Cargando movimientos…
          </div>
        ) : movimientos.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No hay movimientos en el periodo. Use &quot;Liquidar comprobante&quot; para registrar
            pagos/cobros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Corr.</TableHead>
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400">Medio Pago</TableHead>
                  <TableHead className="text-slate-400">RUC / Razón Social</TableHead>
                  <TableHead className="text-slate-400">Glosa</TableHead>
                  <TableHead className="text-slate-400 text-right">Ingreso</TableHead>
                  <TableHead className="text-slate-400 text-right">Egreso</TableHead>
                  <TableHead className="text-slate-400 text-right">Saldo Acum.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((m) => (
                  <TableRow key={m.id} className="border-slate-800/60 hover:bg-slate-800/40">
                    <TableCell className="font-mono text-xs">
                      {m.numeroCorrelativoCaja ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{formatFecha(m.fechaOperacion, mounted)}</TableCell>
                    <TableCell className="text-xs">{labelMedioPago(m.medioPagoTabla1)}</TableCell>
                    <TableCell className="max-w-[160px]">
                      <p className="font-mono text-xs">{m.rucDniContraparte ?? "—"}</p>
                      <p className="text-xs text-slate-500 truncate" title={m.razonSocialContraparte ?? ""}>
                        {m.razonSocialContraparte ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm max-w-[180px] truncate" title={m.glosa}>
                      {m.glosa}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-emerald-400">
                      {m.ingreso > 0 ? formatSoles(m.ingreso, mounted) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-red-400">
                      {m.egreso > 0 ? formatSoles(m.egreso, mounted) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {m.saldoAcumulado != null ? formatSoles(m.saldoAcumulado, mounted) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {contribuyenteId ? (
        <ModalLiquidacion
          open={modalOpen}
          onOpenChange={setModalOpen}
          contribuyenteId={contribuyenteId}
          periodo={periodo}
          cuentas={cuentas}
          mounted={mounted}
        />
      ) : null}
    </div>
  );
}
