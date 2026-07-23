import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Calculator,
  Landmark,
  Loader2,
  Plus,
  Search,
  TableProperties,
  Trash2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { cn } from "@/lib/utils";
import {
  useCrearAsientoManual,
  useLibroDiarioF51,
  useLibroDiarioSimplificadoF52,
  usePlanCuentasPCGE,
} from "@/modules/contabilidad/hooks/useContabilidad";
import { fetchContribuyenteIdByRucCont } from "@/modules/contabilidad/services/contabilidadService";
import type {
  AsientoLinea,
  Formato51Row,
  Formato52MatrizRow,
  TipoCuentaPcge,
} from "@/modules/contabilidad/types/contabilidad";
import {
  TABLA9_COLUMNAS,
  TIPO_CUENTA_COLORS,
} from "@/modules/contabilidad/types/contabilidad";
import { validarPartidaDoble } from "@/modules/contabilidad/utils/asientosGenerator";
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

function groupByCuo(filas: Formato51Row[]): Map<string, Formato51Row[]> {
  const map = new Map<string, Formato51Row[]>();
  for (const f of filas) {
    const list = map.get(f.cuo) ?? [];
    list.push(f);
    map.set(f.cuo, list);
  }
  return map;
}

function TablaFormato51({
  filas,
  loading,
  mounted,
  totalDebe,
  totalHaber,
  cuadrado,
}: {
  filas: Formato51Row[];
  loading: boolean;
  mounted: boolean;
  totalDebe: number;
  totalHaber: number;
  cuadrado: boolean;
}) {
  const grouped = useMemo(() => groupByCuo(filas), [filas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="size-6 animate-spin mr-2" />
        Cargando Libro Diario Formato 5.1…
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm">
        No hay asientos con CUO para este periodo. Genere asientos desde Compras/Ventas o registre uno manual.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">CUO</TableHead>
              <TableHead className="text-slate-400">Fecha</TableHead>
              <TableHead className="text-slate-400">Glosa</TableHead>
              <TableHead className="text-slate-400">Libro T8</TableHead>
              <TableHead className="text-slate-400">Sustento</TableHead>
              <TableHead className="text-slate-400">Cuenta</TableHead>
              <TableHead className="text-slate-400">Denominación</TableHead>
              <TableHead className="text-slate-400 text-right">Debe</TableHead>
              <TableHead className="text-slate-400 text-right">Haber</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(grouped.entries()).map(([cuo, lineas]) =>
              lineas.map((row, idx) => (
                <TableRow
                  key={`${cuo}-${row.correlativoLinea}-${idx}`}
                  className={cn(
                    "border-slate-800/60 hover:bg-slate-800/40",
                    idx === 0 && "border-t-2 border-t-emerald-500/20",
                  )}
                >
                  <TableCell className="font-mono text-xs text-emerald-400">
                    {idx === 0 ? cuo : ""}
                  </TableCell>
                  <TableCell className="text-sm">
                    {idx === 0 ? formatFecha(row.fechaOperacion, mounted) : ""}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate" title={row.glosa}>
                    {idx === 0 ? row.glosa : lineaGlosa(row)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {idx === 0 ? row.codigoLibroTabla8 : ""}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {idx === 0 ? (row.numeroDocumentoSustentatorio ?? "—") : ""}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.cuentaCodigo}</TableCell>
                  <TableCell className="text-xs text-slate-400">{row.cuentaDenominacion}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {row.debe > 0 ? formatSoles(row.debe, mounted) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {row.haber > 0 ? formatSoles(row.haber, mounted) : "—"}
                  </TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4",
          cuadrado ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5",
        )}
      >
        <div className="flex gap-6 text-sm">
          <span>
            Total Debe:{" "}
            <strong className="tabular-nums">{formatSoles(totalDebe, mounted)}</strong>
          </span>
          <span>
            Total Haber:{" "}
            <strong className="tabular-nums">{formatSoles(totalHaber, mounted)}</strong>
          </span>
        </div>
        <Badge variant="outline" className={cuadrado ? "text-emerald-300" : "text-red-300"}>
          {cuadrado ? "Partida doble cuadrada ✓" : "Descuadre detectado"}
        </Badge>
      </div>
    </div>
  );
}

function lineaGlosa(row: Formato51Row): string {
  return row.glosa.length > 40 ? row.glosa.slice(0, 40) + "…" : row.glosa;
}

function MatrizBloque({
  titulo,
  columnas,
  filas,
  getVal,
  mounted,
  accent,
}: {
  titulo: string;
  columnas: readonly string[];
  filas: Formato52MatrizRow[];
  getVal: (f: Formato52MatrizRow, col: string) => number;
  mounted: boolean;
  accent: string;
}) {
  const hasData = filas.some((f) => columnas.some((c) => getVal(f, c) !== 0));
  if (!hasData) return null;

  return (
    <div className={cn(GLASS, "p-4 space-y-3")}>
      <h3 className={cn("text-sm font-semibold uppercase tracking-wider", accent)}>{titulo}</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 sticky left-0 bg-slate-900/95">Fecha</TableHead>
              {columnas.map((c) => (
                <TableHead key={c} className="text-slate-400 text-right font-mono text-xs">
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((f) => {
              const rowHas = columnas.some((c) => getVal(f, c) !== 0);
              if (!rowHas) return null;
              return (
                <TableRow key={f.fechaOperacion} className="border-slate-800/60">
                  <TableCell className="sticky left-0 bg-slate-900/95 text-sm">
                    {formatFecha(f.fechaOperacion, mounted)}
                  </TableCell>
                  {columnas.map((c) => {
                    const v = getVal(f, c);
                    return (
                      <TableCell key={c} className="text-right tabular-nums text-xs">
                        {v !== 0 ? formatSoles(v, mounted) : "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TablaFormato52({
  filas,
  loading,
  mounted,
}: {
  filas: Formato52MatrizRow[];
  loading: boolean;
  mounted: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="size-6 animate-spin mr-2" />
        Cargando Diario Simplificado Formato 5.2…
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm">
        Sin movimientos agregados para el periodo en formato matricial Tabla 9.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MatrizBloque
        titulo="Activo (Tabla 9)"
        columnas={TABLA9_COLUMNAS.activo}
        filas={filas}
        getVal={(f, c) => f.activo[c] ?? 0}
        mounted={mounted}
        accent="text-emerald-400"
      />
      <MatrizBloque
        titulo="Pasivo (Tabla 9)"
        columnas={TABLA9_COLUMNAS.pasivo}
        filas={filas}
        getVal={(f, c) => f.pasivo[c] ?? 0}
        mounted={mounted}
        accent="text-red-400"
      />
      <MatrizBloque
        titulo="Patrimonio (Tabla 9)"
        columnas={TABLA9_COLUMNAS.patrimonio}
        filas={filas}
        getVal={(f, c) => f.patrimonio[c] ?? 0}
        mounted={mounted}
        accent="text-sky-400"
      />
      <MatrizBloque
        titulo="Gastos (Tabla 9)"
        columnas={TABLA9_COLUMNAS.gastos}
        filas={filas}
        getVal={(f, c) => f.gastos[c] ?? 0}
        mounted={mounted}
        accent="text-amber-400"
      />
      <MatrizBloque
        titulo="Ingresos (Tabla 9)"
        columnas={TABLA9_COLUMNAS.ingresos}
        filas={filas}
        getVal={(f, c) => f.ingresos[c] ?? 0}
        mounted={mounted}
        accent="text-violet-400"
      />
    </div>
  );
}

function TablaPcge({
  cuentas,
  loading,
  busqueda,
  onBusqueda,
}: {
  cuentas: ReturnType<typeof usePlanCuentasPCGE>["data"];
  loading: boolean;
  busqueda: string;
  onBusqueda: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 size-4 text-slate-500" />
        <Input
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          className="pl-9 bg-slate-800/50 border-slate-700"
          placeholder="Buscar por código o denominación…"
        />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="size-5 animate-spin mr-2" />
          Cargando PCGE…
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent sticky top-0 bg-slate-900/95">
                <TableHead className="text-slate-400">Código</TableHead>
                <TableHead className="text-slate-400">Denominación</TableHead>
                <TableHead className="text-slate-400">Elemento</TableHead>
                <TableHead className="text-slate-400">Nivel</TableHead>
                <TableHead className="text-slate-400">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(cuentas ?? []).map((c) => (
                <TableRow key={c.codigo} className="border-slate-800/60 hover:bg-slate-800/40">
                  <TableCell className="font-mono text-sm">{c.codigo}</TableCell>
                  <TableCell className="text-sm">{c.denominacion}</TableCell>
                  <TableCell className="text-center text-sm">{c.elemento}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      N{c.nivel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", TIPO_CUENTA_COLORS[c.tipoCuenta as TipoCuentaPcge])}
                    >
                      {c.tipoCuenta}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function FormularioAsientoManual({
  contribuyenteId,
  periodo,
  mounted,
}: {
  contribuyenteId: string;
  periodo: string;
  mounted: boolean;
}) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [glosa, setGlosa] = useState("");
  const [lineas, setLineas] = useState<AsientoLinea[]>([
    {
      correlativoLinea: 1,
      cuentaCodigo: "6011",
      cuentaDenominacion: "Mercaderías",
      glosa: "",
      debe: 0,
      haber: 0,
    },
    {
      correlativoLinea: 2,
      cuentaCodigo: "4212",
      cuentaDenominacion: "Facturas por pagar",
      glosa: "",
      debe: 0,
      haber: 0,
    },
  ]);

  const mutation = useCrearAsientoManual(contribuyenteId, periodo);
  const validacion = validarPartidaDoble(lineas);

  const addLinea = () => {
    setLineas((prev) => [
      ...prev,
      {
        correlativoLinea: prev.length + 1,
        cuentaCodigo: "",
        cuentaDenominacion: "",
        glosa: "",
        debe: 0,
        haber: 0,
      },
    ]);
  };

  const removeLinea = (idx: number) => {
    setLineas((prev) =>
      prev.filter((_, i) => i !== idx).map((l, i) => ({ ...l, correlativoLinea: i + 1 })),
    );
  };

  const updateLinea = (idx: number, patch: Partial<AsientoLinea>) => {
    setLineas((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const handleSubmit = () => {
    if (!validacion.cuadrado) return;
    mutation.mutate({
      contribuyenteId,
      periodo,
      fechaOperacion: fecha,
      glosa: glosa || "Asiento manual",
      codigoLibroTabla8: "050100",
      lineas,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Fecha operación</Label>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-slate-400 text-xs">Glosa general</Label>
          <Textarea
            value={glosa}
            onChange={(e) => setGlosa(e.target.value)}
            className="bg-slate-800/50 border-slate-700 min-h-[60px]"
            placeholder="Descripción de la operación…"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 w-10">#</TableHead>
              <TableHead className="text-slate-400">Cuenta PCGE</TableHead>
              <TableHead className="text-slate-400">Denominación</TableHead>
              <TableHead className="text-slate-400 text-right">Debe</TableHead>
              <TableHead className="text-slate-400 text-right">Haber</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineas.map((l, idx) => (
              <TableRow key={idx} className="border-slate-800/60">
                <TableCell className="text-slate-500 text-xs">{l.correlativoLinea}</TableCell>
                <TableCell>
                  <Input
                    value={l.cuentaCodigo}
                    onChange={(e) => updateLinea(idx, { cuentaCodigo: e.target.value })}
                    className="font-mono bg-slate-800/50 border-slate-700 h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={l.cuentaDenominacion}
                    onChange={(e) => updateLinea(idx, { cuentaDenominacion: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={l.debe || ""}
                    onChange={(e) =>
                      updateLinea(idx, { debe: Number(e.target.value) || 0, haber: 0 })
                    }
                    className="text-right tabular-nums bg-slate-800/50 border-slate-700 h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={l.haber || ""}
                    onChange={(e) =>
                      updateLinea(idx, { haber: Number(e.target.value) || 0, debe: 0 })
                    }
                    className="text-right tabular-nums bg-slate-800/50 border-slate-700 h-8"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-slate-500 hover:text-red-400"
                    onClick={() => removeLinea(idx)}
                    disabled={lineas.length <= 2}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button type="button" variant="outline" size="sm" onClick={addLinea} className="gap-2">
          <Plus className="size-4" />
          Agregar línea
        </Button>
        <div className="flex items-center gap-4 text-sm">
          <span>Debe: {formatSoles(validacion.totalDebe, mounted)}</span>
          <span>Haber: {formatSoles(validacion.totalHaber, mounted)}</span>
          <Badge variant="outline" className={validacion.cuadrado ? "text-emerald-300" : "text-red-300"}>
            {validacion.cuadrado ? "Cuadrado" : `Diff ${validacion.diferencia.toFixed(2)}`}
          </Badge>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!validacion.cuadrado || mutation.isPending || lineas.some((l) => !l.cuentaCodigo)}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          {mutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Registrar asiento
        </Button>
      </div>
    </div>
  );
}

export function ContabilidadHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [tab, setTab] = useState<"f51" | "f52" | "pcge" | "manual">("f51");
  const [busquedaPcge, setBusquedaPcge] = useState("");

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
    queryKey: ["contribuyente-id-cont", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucCont(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 60_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;

  const f51Query = useLibroDiarioF51(contribuyenteId, periodo, tab === "f51");
  const f52Query = useLibroDiarioSimplificadoF52(contribuyenteId, periodo, tab === "f52");
  const pcgeQuery = usePlanCuentasPCGE(busquedaPcge || undefined);

  return (
    <div className="min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <BookOpen className="size-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Contabilidad General & Libros SUNAT
            </h1>
            <p className="text-sm text-slate-400">
              PCGE · Formato 5.1 Libro Diario · Formato 5.2 Diario Simplificado (Tabla 9)
            </p>
          </div>
        </div>
      </header>

      <StepGuardBanner
        contribuyenteId={contribuyenteId}
        periodo={periodo}
        vista="contabilidad"
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
      </div>

      {!contribuyenteId && tab !== "pcge" ? (
        <div className={cn(GLASS, "p-4 text-sm text-amber-300/90 border-amber-500/30")}>
          Seleccione un contribuyente para consultar libros diarios o registrar asientos.
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-slate-800/60 border border-slate-700/80 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger
            value="f51"
            className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-300 gap-2"
          >
            <BookOpen className="size-4" />
            Libro Diario (F5.1)
          </TabsTrigger>
          <TabsTrigger
            value="f52"
            className="data-[state=active]:bg-sky-600/20 data-[state=active]:text-sky-300 gap-2"
          >
            <TableProperties className="size-4" />
            Diario Simplificado (F5.2)
          </TabsTrigger>
          <TabsTrigger
            value="pcge"
            className="data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300 gap-2"
          >
            <Landmark className="size-4" />
            Plan de Cuentas (PCGE)
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-300 gap-2"
          >
            <Calculator className="size-4" />
            Nuevo Asiento Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="f51" className="mt-4">
          <div className={cn(GLASS, "p-4")}>
            <TablaFormato51
              filas={f51Query.data?.filas ?? []}
              loading={f51Query.isLoading}
              mounted={mounted}
              totalDebe={f51Query.data?.totalDebe ?? 0}
              totalHaber={f51Query.data?.totalHaber ?? 0}
              cuadrado={f51Query.data?.cuadrado ?? false}
            />
          </div>
        </TabsContent>

        <TabsContent value="f52" className="mt-4">
          <TablaFormato52
            filas={f52Query.data?.filas ?? []}
            loading={f52Query.isLoading}
            mounted={mounted}
          />
        </TabsContent>

        <TabsContent value="pcge" className="mt-4">
          <div className={cn(GLASS, "p-4")}>
            <TablaPcge
              cuentas={pcgeQuery.data}
              loading={pcgeQuery.isLoading}
              busqueda={busquedaPcge}
              onBusqueda={setBusquedaPcge}
            />
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <div className={cn(GLASS, "p-4")}>
            {contribuyenteId ? (
              <FormularioAsientoManual
                contribuyenteId={contribuyenteId}
                periodo={periodo}
                mounted={mounted}
              />
            ) : (
              <p className="text-slate-500 text-sm py-8 text-center">
                Seleccione contribuyente para registrar asientos manuales.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
