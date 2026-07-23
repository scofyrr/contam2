import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  CheckCircle2,
  Loader2,
  Scale,
  Search,
  AlertTriangle,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import {
  useBalanceComprobacion,
  useLibroMayorF61,
} from "@/modules/libro-mayor/hooks/useLibroMayor";
import { fetchContribuyenteIdByRucLm } from "@/modules/libro-mayor/services/libroMayorService";
import type {
  CuentaMayorizada,
  FilaBalanceComprobacion,
  NivelCuentaPcge,
} from "@/modules/libro-mayor/types/libroMayor";
import {
  CODIGO_LIBRO_MAYOR_TABLA8,
  NATURALEZA_SALDO_COLORS,
  NATURALEZA_SALDO_LABELS,
  NIVELES_CUENTA_PCGE,
} from "@/modules/libro-mayor/types/libroMayor";
import { PdfDownloadButton } from "@/modules/pdf/components/PdfDownloadButton";
import { Formato61PdfDocument } from "@/modules/pdf/templates/Formato61Pdf";
import {
  buildPdfFileName,
  buildVerificationCode,
  type PdfReportMeta,
} from "@/modules/pdf/types/pdfReport";
import { buildQrPayload, generateQrDataUrl } from "@/modules/pdf/utils/qrCode";
import { StepGuardBanner } from "@/modules/workflow/components/StepGuardBanner";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

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

function formatFecha(fecha: string, mounted: boolean): string {
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

function BalanceStatusBand({
  cuadrado,
  totalDebe,
  totalHaber,
  mounted,
}: {
  cuadrado: boolean;
  totalDebe: number;
  totalHaber: number;
  mounted: boolean;
}) {
  const diff = Math.abs(totalDebe - totalHaber);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              GLASS,
              "px-4 py-3 flex items-center gap-3 cursor-default border-l-4",
              cuadrado ? "border-emerald-500/60" : "border-red-500/60",
            )}
          >
            <span className="text-xl" suppressHydrationWarning>
              {mounted ? (cuadrado ? "🟢" : "🔴") : "⚪"}
            </span>
            <div>
              <p
                className={cn(
                  "font-semibold text-sm",
                  cuadrado ? "text-emerald-300" : "text-red-300",
                )}
              >
                {cuadrado ? "MAYOR CUADRADO" : "DESCUADRE DETECTADO"}
              </p>
              <p className="text-xs text-slate-400">
                Debe {formatSoles(totalDebe, mounted)} · Haber {formatSoles(totalHaber, mounted)}
                {!cuadrado && mounted ? ` · Diferencia ${formatSoles(diff, mounted)}` : ""}
              </p>
            </div>
            {cuadrado ? (
              <CheckCircle2 className="size-5 text-emerald-400 ml-auto" />
            ) : (
              <AlertTriangle className="size-5 text-red-400 ml-auto" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-sm">
          {cuadrado
            ? "La suma total del Debe coincide con la suma total del Haber en el periodo seleccionado."
            : `El mayor no cuadra: Total Debe (${formatSoles(totalDebe, mounted)}) ≠ Total Haber (${formatSoles(totalHaber, mounted)}). Revise asientos del Libro Diario (Formato 5.1).`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CuentaMayorAccordion({
  cuenta,
  mounted,
  defaultOpen,
}: {
  cuenta: CuentaMayorizada;
  mounted: boolean;
  defaultOpen?: boolean;
}) {
  const colors = NATURALEZA_SALDO_COLORS[cuenta.naturalezaSaldo];

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? cuenta.codigoCuenta : undefined}
      className={cn(GLASS, "px-2 border-l-2 border-emerald-500/30")}
    >
      <AccordionItem value={cuenta.codigoCuenta} className="border-none">
        <AccordionTrigger className="hover:no-underline py-4 px-2">
          <div className="flex flex-1 items-center justify-between gap-3 text-left mr-2">
            <div className="min-w-0">
              <p className="font-mono font-semibold text-emerald-300">{cuenta.codigoCuenta}</p>
              <p className="text-sm text-slate-300 truncate">{cuenta.denominacion}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge variant="outline" className={cn("text-xs", colors)}>
                {NATURALEZA_SALDO_LABELS[cuenta.naturalezaSaldo]}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                {formatSoles(cuenta.saldoFinal, mounted)}
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
            <div className="glass-card p-2 !rounded-lg">
              <p className="text-slate-500">Saldo inicial</p>
              <p className="font-mono text-slate-200">{formatSoles(cuenta.saldoInicial, mounted)}</p>
            </div>
            <div className="glass-card p-2 !rounded-lg">
              <p className="text-slate-500">Total Debe</p>
              <p className="font-mono text-emerald-300">{formatSoles(cuenta.totalDebe, mounted)}</p>
            </div>
            <div className="glass-card p-2 !rounded-lg">
              <p className="text-slate-500">Total Haber</p>
              <p className="font-mono text-sky-300">{formatSoles(cuenta.totalHaber, mounted)}</p>
            </div>
            <div className="glass-card p-2 !rounded-lg">
              <p className="text-slate-500">Saldo final</p>
              <p className="font-mono text-slate-100">{formatSoles(cuenta.saldoFinal, mounted)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400">CUO Diario</TableHead>
                  <TableHead className="text-slate-400">Glosa</TableHead>
                  <TableHead className="text-slate-400 text-right">Debe</TableHead>
                  <TableHead className="text-slate-400 text-right">Haber</TableHead>
                  <TableHead className="text-slate-400 text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuenta.filas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                      Sin movimientos en el periodo (solo saldo inicial).
                    </TableCell>
                  </TableRow>
                ) : (
                  cuenta.filas.map((fila, idx) => (
                    <TableRow
                      key={`${fila.cuo}-${fila.correlativoLinea}-${idx}`}
                      className={cn(
                        "border-slate-800/80",
                        idx % 2 === 1 && "bg-slate-900/40",
                        "hover:bg-emerald-950/20",
                      )}
                    >
                      <TableCell className="text-slate-300 text-xs">
                        {formatFecha(fila.fechaOperacion, mounted)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {fila.cuo}
                        {fila.correlativoLinea != null
                          ? `-${String(fila.correlativoLinea).padStart(3, "0")}`
                          : ""}
                      </TableCell>
                      <TableCell className="text-slate-200 text-sm max-w-[240px] truncate">
                        {fila.glosa}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-300 text-xs">
                        {fila.debe > 0 ? formatSoles(fila.debe, mounted) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sky-300 text-xs">
                        {fila.haber > 0 ? formatSoles(fila.haber, mounted) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-200 text-xs">
                        {formatSoles(fila.saldoLinea, mounted)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function BalanceComprobacionTable({
  filas,
  mounted,
}: {
  filas: FilaBalanceComprobacion[];
  mounted: boolean;
}) {
  if (filas.length === 0) {
    return (
      <div className={cn(GLASS, "p-8 text-center text-slate-400")}>
        No hay cuentas con movimiento en el periodo.
      </div>
    );
  }

  return (
    <div className={cn(GLASS, "overflow-hidden p-0")}>
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Cuenta</TableHead>
            <TableHead className="text-slate-400">Denominación</TableHead>
            <TableHead className="text-slate-400 text-right">Saldo Inicial</TableHead>
            <TableHead className="text-slate-400 text-right">Debe Mes</TableHead>
            <TableHead className="text-slate-400 text-right">Haber Mes</TableHead>
            <TableHead className="text-slate-400 text-right">Saldo Deudor</TableHead>
            <TableHead className="text-slate-400 text-right">Saldo Acreedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((fila) => (
            <TableRow key={fila.cuentaCodigo} className="border-slate-800/80 hover:bg-slate-900/50">
              <TableCell className="font-mono text-emerald-300 text-sm">{fila.cuentaCodigo}</TableCell>
              <TableCell className="text-slate-200 text-sm max-w-[200px] truncate">
                {fila.cuentaDenominacion}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-slate-400">
                {formatSoles(fila.saldoInicial, mounted)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-emerald-300">
                {formatSoles(fila.sumaDebe, mounted)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-sky-300">
                {formatSoles(fila.sumaHaber, mounted)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-emerald-200">
                {fila.saldoDeudor > 0 ? formatSoles(fila.saldoDeudor, mounted) : "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-sky-200">
                {fila.saldoAcreedor > 0 ? formatSoles(fila.saldoAcreedor, mounted) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function LibroMayorHub() {
  const mounted = useIsMounted();
  const { contribuyentes } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [nivelCuenta, setNivelCuenta] = useState<NivelCuentaPcge>(4);
  const [cuentaFiltro, setCuentaFiltro] = useState("");
  const [vista, setVista] = useState<"mayor" | "balance">("mayor");

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
    queryKey: ["libro-mayor", "contribuyente-id", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucLm(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 120_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;

  const mayorQuery = useLibroMayorF61(
    contribuyenteId,
    periodo,
    nivelCuenta,
    cuentaFiltro,
    vista === "mayor",
  );

  const balanceQuery = useBalanceComprobacion(
    contribuyenteId,
    periodo,
    vista === "balance",
  );

  const mayorData = mayorQuery.data;
  const balanceData = balanceQuery.data;

  const cuentasFiltradas = useMemo(() => {
    if (!mayorData?.cuentas) return [];
    const q = cuentaFiltro.trim().toLowerCase();
    if (!q) return mayorData.cuentas;
    return mayorData.cuentas.filter(
      (c) =>
        c.codigoCuenta.toLowerCase().includes(q) ||
        c.denominacion.toLowerCase().includes(q),
    );
  }, [mayorData?.cuentas, cuentaFiltro]);

  const pdfMeta: PdfReportMeta | null = useMemo(() => {
    if (!mayorData || !contribuyente) return null;
    return {
      contribuyente: {
        ruc: mayorData.ruc || contribuyente.ruc,
        razonSocial: mayorData.razonSocial || contribuyente.razonSocial,
      },
      periodo: mayorData.periodo,
      codigoLibro: CODIGO_LIBRO_MAYOR_TABLA8,
      nombreLibro: "Libro Mayor — Formato 6.1",
      verificationCode: buildVerificationCode("F61", mayorData.ruc, mayorData.periodo),
      generatedAt: mayorData.generadoAt,
    };
  }, [mayorData, contribuyente]);

  const balanceCuadrado = vista === "mayor" ? mayorData?.cuadrado : balanceData?.cuadrado;
  const totalDebe =
    vista === "mayor" ? (mayorData?.totalDebeGeneral ?? 0) : (balanceData?.totalDebe ?? 0);
  const totalHaber =
    vista === "mayor" ? (mayorData?.totalHaberGeneral ?? 0) : (balanceData?.totalHaber ?? 0);

  const loading =
    vista === "mayor" ? mayorQuery.isLoading || mayorQuery.isFetching : balanceQuery.isLoading;

  return (
    <div className="min-h-full p-6 space-y-6 bg-glass-page">
      <StepGuardBanner
        contribuyenteId={contribuyenteId}
        periodo={periodo}
        vista="libro-mayor"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookMarked className="size-7 text-emerald-400" />
            Libro Mayor & Balance de Comprobación
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Formato 6.1 SUNAT (060100) — Mayorización por cuenta PCGE y verificación contable.
          </p>
        </div>
        {contribuyente && (
          <Badge variant="outline" className="border-emerald-600/40 text-emerald-300 w-fit">
            {contribuyente.razonSocial}
          </Badge>
        )}
      </div>

      <div className={cn(GLASS, "p-4 flex flex-wrap items-end gap-4")}>
        {options.length > 0 && (
          <div className="space-y-1 min-w-[220px]">
            <Label className="text-slate-400 text-xs">Contribuyente</Label>
            <Select value={selectedRuc} onValueChange={setSelectedRuc}>
              <SelectTrigger className="glass-input border-slate-700 bg-slate-950/60">
                <SelectValue placeholder="RUC" />
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
        )}

        <div className="space-y-1">
          <Label className="text-slate-400 text-xs">Periodo (YYYYMM)</Label>
          <Input
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-32 glass-input border-slate-700 bg-slate-950/60 font-mono"
            placeholder="202601"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-slate-400 text-xs">Nivel PCGE</Label>
          <Select
            value={String(nivelCuenta)}
            onValueChange={(v) => setNivelCuenta(Number(v) as NivelCuentaPcge)}
          >
            <SelectTrigger className="w-28 glass-input border-slate-700 bg-slate-950/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NIVELES_CUENTA_PCGE.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} dígitos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 flex-1 min-w-[180px]">
          <Label className="text-slate-400 text-xs">Buscar cuenta</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-slate-500" />
            <Input
              value={cuentaFiltro}
              onChange={(e) => setCuentaFiltro(e.target.value)}
              placeholder="Código o nombre…"
              className="pl-9 glass-input border-slate-700 bg-slate-950/60"
            />
          </div>
        </div>

        {pdfMeta && mayorData && vista === "mayor" ? (
          <PdfDownloadButton
            fileName={buildPdfFileName("F61", mayorData.periodo, mayorData.ruc)}
            label="Descargar PDF F6.1"
            buildDocument={(qr) => (
              <Formato61PdfDocument meta={pdfMeta} data={mayorData} qrDataUrl={qr} />
            )}
            prepareQr={async () => {
              const payload = buildQrPayload({
                verificationCode: pdfMeta.verificationCode,
                ruc: pdfMeta.contribuyente.ruc,
                periodo: pdfMeta.periodo,
                codigoLibro: pdfMeta.codigoLibro,
              });
              return generateQrDataUrl(payload);
            }}
            disabled={!mayorData.cuentas.length}
          />
        ) : null}
      </div>

      <BalanceStatusBand
        cuadrado={balanceCuadrado ?? true}
        totalDebe={totalDebe}
        totalHaber={totalHaber}
        mounted={mounted}
      />

      <Tabs value={vista} onValueChange={(v) => setVista(v as "mayor" | "balance")}>
        <TabsList className="bg-slate-900/80 border border-slate-800">
          <TabsTrigger value="mayor" className="data-[state=active]:bg-emerald-900/50 gap-1.5">
            <BookMarked className="size-4" />
            Libro Mayor (6.1)
          </TabsTrigger>
          <TabsTrigger value="balance" className="data-[state=active]:bg-emerald-900/50 gap-1.5">
            <Scale className="size-4" />
            Balance de Comprobación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mayor" className="mt-4 space-y-3">
          {loading ? (
            <div className={cn(GLASS, "p-10 flex justify-center text-slate-400")}>
              <Loader2 className="size-5 animate-spin mr-2" />
              Cargando libro mayor…
            </div>
          ) : cuentasFiltradas.length === 0 ? (
            <div className={cn(GLASS, "p-10 text-center")}>
              <BookMarked className="size-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300">Sin cuentas mayorizadas para el periodo.</p>
              <p className="text-sm text-slate-500 mt-1">
                Registre asientos en Contabilidad / Libro Diario (5.1) primero.
              </p>
            </div>
          ) : (
            cuentasFiltradas.map((cuenta, idx) => (
              <CuentaMayorAccordion
                key={cuenta.codigoCuenta}
                cuenta={cuenta}
                mounted={mounted}
                defaultOpen={idx === 0}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="balance" className="mt-4 space-y-3">
          {balanceQuery.isLoading ? (
            <div className={cn(GLASS, "p-10 flex justify-center text-slate-400")}>
              <Loader2 className="size-5 animate-spin mr-2" />
              Generando balance de comprobación…
            </div>
          ) : (
            <>
              {balanceData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total Debe", value: balanceData.totalDebe, color: "text-emerald-300" },
                    { label: "Total Haber", value: balanceData.totalHaber, color: "text-sky-300" },
                    { label: "Σ Saldo Deudor", value: balanceData.totalSaldoDeudor, color: "text-emerald-200" },
                    { label: "Σ Saldo Acreedor", value: balanceData.totalSaldoAcreedor, color: "text-sky-200" },
                  ].map((kpi) => (
                    <div key={kpi.label} className={cn(GLASS, "p-4 text-center")}>
                      <p className={cn("text-lg font-bold font-mono", kpi.color)} suppressHydrationWarning>
                        {mounted ? formatSoles(kpi.value, true) : "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <BalanceComprobacionTable filas={balanceData?.filas ?? []} mounted={mounted} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
