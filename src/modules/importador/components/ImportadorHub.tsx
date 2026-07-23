import { useCallback, useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { descargarPlantillaOficial } from "@/modules/importador/services/excelTemplateService";
import { fetchContribuyenteIdByRucImport } from "@/modules/importador/services/importadorService";
import { useImportador } from "@/modules/importador/hooks/useImportador";
import type { ImportacionTipoLote, PlantillaTipo } from "@/modules/importador/types/importador";
import { isFilaComprobante } from "@/modules/importador/types/importador";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

const ACCEPT = ".pdf,.xlsx,.xls,.csv";

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function defaultPeriodo(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatFileSize(bytes: number, mounted: boolean): string {
  if (!mounted) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSoles(n: number, mounted: boolean): string {
  if (!mounted) return "—";
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

function PlantillaButton({
  label,
  tipo,
  icon,
}: {
  label: string;
  tipo: PlantillaTipo;
  icon: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="border-emerald-600/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-500/10"
      onClick={() => descargarPlantillaOficial(tipo)}
    >
      {icon}
      <span className="ml-2">{label}</span>
      <Download className="ml-2 size-4 opacity-60" />
    </Button>
  );
}

export function ImportadorHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const { state, reset, parseAndValidate, confirmImport } = useImportador();

  const [selectedRuc, setSelectedRuc] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [tipoLote, setTipoLote] = useState<ImportacionTipoLote>("COMPRAS");
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const contribuyente = useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc],
  );

  const { data: resolvedId } = useQuery({
    queryKey: ["contribuyente-id-import", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucImport(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 60_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);

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

  const handleFile = useCallback(
    async (file: File) => {
      if (!contribuyenteId) {
        toast.error("Seleccione un contribuyente antes de importar");
        return;
      }
      setPendingFile(file);
      await parseAndValidate({
        file,
        contribuyenteId,
        periodoActivo: periodoClean,
        tipoLoteOverride: tipoLote,
      });
    },
    [contribuyenteId, parseAndValidate, periodoClean, tipoLote],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  const validos = state.preflight?.validos ?? 0;
  const errores = state.preflight?.errores ?? 0;

  return (
    <TooltipProvider>
      <div className="min-h-full space-y-6 p-4 md:p-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Importador Multiformato CONTAM</h1>
          <p className="text-sm text-muted-foreground">
            PDF (OCR) · Excel · CSV — Pre-flight validator antes de persistir en SIRE
          </p>
        </header>

        {/* Config */}
        <div className={cn(GLASS, "grid gap-4 p-5 md:grid-cols-3")}>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-400">Contribuyente</Label>
            <Select value={selectedRuc || undefined} onValueChange={setSelectedRuc} disabled={loadingContrib}>
              <SelectTrigger className="border-slate-700 bg-slate-950/50">
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
            <Label className="text-slate-400">Periodo contable</Label>
            <Select value={periodoClean} onValueChange={setPeriodo}>
              <SelectTrigger className="border-slate-700 bg-slate-950/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const p = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
                  return (
                    <SelectItem key={p} value={p}>
                      {p.slice(0, 4)}-{p.slice(4, 6)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label className="text-slate-400">Tipo de lote</Label>
            <Select value={tipoLote} onValueChange={(v) => setTipoLote(v as ImportacionTipoLote)}>
              <SelectTrigger className="border-slate-700 bg-slate-950/50 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPRAS">Compras (RCE)</SelectItem>
                <SelectItem value="VENTAS">Ventas (RVIE)</SelectItem>
                <SelectItem value="ASIENTOS_MANUALES">Asientos manuales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Plantillas */}
        <div className={cn(GLASS, "p-5")}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400/90">
            Plantillas oficiales CONTAM
          </h2>
          <div className="flex flex-wrap gap-3">
            <PlantillaButton
              label="Compras"
              tipo="COMPRAS"
              icon={<FileSpreadsheet className="size-4" />}
            />
            <PlantillaButton
              label="Ventas"
              tipo="VENTAS"
              icon={<FileSpreadsheet className="size-4" />}
            />
            <PlantillaButton
              label="Asientos"
              tipo="ASIENTOS"
              icon={<FileSpreadsheet className="size-4" />}
            />
          </div>
        </div>

        {/* Dropzone */}
        <div
          className={cn(
            GLASS,
            "relative border-2 border-dashed p-10 text-center transition-all",
            dragOver
              ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
              : "border-slate-700 hover:border-emerald-600/50",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            type="file"
            accept={ACCEPT}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={onFileInput}
            disabled={!contribuyenteId || state.phase === "parsing" || state.phase === "validating"}
          />
          <Upload
            className={cn(
              "mx-auto mb-4 size-12",
              dragOver ? "text-emerald-400 animate-bounce" : "text-slate-500",
            )}
          />
          <p className="text-lg font-medium text-slate-200">
            Arrastre archivos PDF, Excel o CSV aquí
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Extracción OCR de comprobantes SUNAT · Validación pre-flight automática
          </p>
          {pendingFile && mounted && (
            <p className="mt-3 text-xs text-emerald-400/80">
              {pendingFile.name} · {formatFileSize(pendingFile.size, mounted)}
            </p>
          )}
          {!contribuyenteId && (
            <p className="mt-3 text-xs text-amber-400">Seleccione un contribuyente para habilitar la carga</p>
          )}
        </div>

        {/* Progress */}
        {(state.phase === "parsing" ||
          state.phase === "validating" ||
          state.phase === "uploading" ||
          state.phase === "processing") && (
          <div className={cn(GLASS, "p-4")}>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="size-4 animate-spin text-emerald-400" />
              {state.phase === "parsing" && "Extrayendo datos del archivo…"}
              {state.phase === "validating" && "Ejecutando pre-flight validator…"}
              {state.phase === "uploading" && "Guardando lote en Supabase…"}
              {state.phase === "processing" && "Procesando lote (RPC atómica)…"}
            </div>
            <Progress value={state.progress} className="h-2 [&>div]:bg-emerald-500" />
          </div>
        )}

        {state.error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Error de importación</p>
              <p className="text-sm opacity-90">{state.error}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Preflight table */}
        {state.preflight && state.preflight.filas.length > 0 && (
          <div className={cn(GLASS, "overflow-hidden")}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-4">
              <div>
                <h2 className="font-semibold">Pre-flight Validation</h2>
                <p className="text-xs text-slate-500">
                  {validos} válido(s) · {errores} con error · {state.preflight.total} total
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-slate-400" onClick={reset}>
                  Limpiar
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500"
                  disabled={
                    validos === 0 ||
                    !contribuyenteId ||
                    confirmImport.isPending ||
                    state.phase === "done"
                  }
                  onClick={() => {
                    if (!contribuyenteId) return;
                    confirmImport.mutate({
                      contribuyenteId,
                      periodoActivo: periodoClean,
                    });
                  }}
                >
                  {confirmImport.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 size-4" />
                  )}
                  Importar {validos} registro(s) válido(s)
                  {errores > 0 ? ` (${errores} ignorado(s))` : ""}
                </Button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">#</TableHead>
                    <TableHead className="text-slate-400">Estado</TableHead>
                    <TableHead className="text-slate-400">Detalle</TableHead>
                    <TableHead className="text-slate-400">RUC / Cuenta</TableHead>
                    <TableHead className="text-slate-400">Comprobante</TableHead>
                    <TableHead className="text-right text-slate-400">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.preflight.filas.map((fila) => {
                    const ok = fila.estado === "VALIDO";
                    const comp = isFilaComprobante(fila.datos) ? fila.datos : null;
                    return (
                      <TableRow key={fila.filaNumero} className="border-slate-800/60">
                        <TableCell className="font-mono text-slate-500">{fila.filaNumero}</TableCell>
                        <TableCell>
                          {ok ? (
                            <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">
                              <CheckCircle2 className="mr-1 size-3" /> Válido
                            </Badge>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className="cursor-help bg-red-500/20 text-red-300 hover:bg-red-500/20">
                                  <XCircle className="mr-1 size-3" /> Error
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <ul className="space-y-1 text-xs">
                                  {fila.errores.map((e, i) => (
                                    <li key={i}>
                                      <strong>{e.codigo}:</strong> {e.mensaje}
                                    </li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-slate-400">
                          {comp?.razonSocial ?? ("glosa" in fila.datos ? fila.datos.glosa : "—")}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-emerald-400/90">
                          {comp?.ruc ?? ("cuentaContable" in fila.datos ? fila.datos.cuentaContable : "—")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {comp ? `${comp.serie}-${comp.numero}` : "—"}
                        </TableCell>
                        <TableCell className="text-right text-slate-200">
                          {comp
                            ? formatSoles(comp.total, mounted)
                            : "debe" in fila.datos
                              ? `D:${fila.datos.debe} H:${fila.datos.haber}`
                              : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {state.lastResult && state.phase === "done" && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Importación procesada</p>
              <p className="text-sm">
                {state.lastResult.registrosExitosos} exitoso(s) ·{" "}
                {state.lastResult.registrosConError} error(es) · Estado: {state.lastResult.estado}
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
