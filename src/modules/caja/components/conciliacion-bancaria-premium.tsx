import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  FileUp,
  Link2,
  Loader2,
  RefreshCw,
  Unlink,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useConciliacionesPendientes,
  useEjecutarConciliacion,
} from "@/hooks/use-caja-premium";
import { fetchCuentasFinancieras } from "@/lib/cuentas-financieras-service";
import { cn } from "@/lib/utils";
import {
  conciliacionBancariaService,
  detectarAnomalias,
} from "@/modules/caja/services/conciliacion-bancaria-service";
import type {
  BankStatementRow,
  ConciliacionResult,
  MatchedPair,
  MovimientoCajaConciliable,
} from "@/modules/caja/types/conciliacion";
import { useQuery } from "@tanstack/react-query";

const COLORS = {
  bg: "#060E1A",
  panel: "#0A1628",
  border: "#152238",
  text: "#E8EDF5",
  muted: "#7B8FA8",
  ok: "#00D68F",
  warn: "#F0A500",
  err: "#FF5E7A",
  bank: "#00C8FF",
  sys: "#9B87F5",
  gold: "#C8A44D",
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

function MetricCard({
  label,
  value,
  sub,
  accent,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  alert?: boolean;
}) {
  return (
    <div
      className="rounded-xl border bg-white/[0.02] backdrop-blur-sm border-white/[0.04] p-4 transition-transform hover:scale-[1.02]"
      style={{ boxShadow: accent ? `0 0 24px ${accent}22` : undefined }}
    >
      <p className="text-xs text-[#7B8FA8]">{label}</p>
      <p className="font-mono text-2xl font-semibold mt-1 text-[#E8EDF5]">{value}</p>
      {sub ? (
        <p className={cn("text-xs mt-1", alert ? "text-[#FF5E7A]" : "text-[#7B8FA8]")}>{sub}</p>
      ) : null}
    </div>
  );
}

function RowStatus({ status }: { status: "ok" | "warn" | "err" | "idle" }) {
  const map = {
    ok: COLORS.ok,
    warn: COLORS.warn,
    err: COLORS.err,
    idle: COLORS.muted,
  };
  return (
    <span
      className="inline-block w-1 h-full min-h-[2rem] rounded-full mr-2 shrink-0"
      style={{ backgroundColor: map[status] }}
    />
  );
}

function ExtractoPanel({
  rows,
  selectedId,
  filter,
  onSelect,
  onDrop,
  loading,
  progress,
}: {
  rows: BankStatementRow[];
  selectedId: string | null;
  filter: string;
  onSelect: (id: string) => void;
  onDrop: (file: File) => void;
  loading?: boolean;
  progress?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    if (filter === "todos") return rows;
    return rows;
  }, [rows, filter]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDropEv = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onDrop(f);
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl border border-[#152238] bg-[#0A1628] overflow-hidden"
      onDragOver={onDragOver}
      onDrop={onDropEv}
    >
      <div className="px-4 py-3 border-b border-[#152238] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#00C8FF]">🏦 EXTRACTO BANCARIO</h3>
        <Badge variant="outline" className="border-[#00C8FF]/40 text-[#00C8FF]">
          PEN
        </Badge>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mx-3 mt-3 mb-2 border border-dashed border-[#00C8FF]/40 rounded-lg p-4 text-center hover:bg-[#00C8FF]/5 transition-colors"
      >
        <FileUp className="size-6 mx-auto text-[#00C8FF] mb-1" />
        <p className="text-xs text-[#7B8FA8]">Arrastra CSV del banco o haz clic</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onDrop(f);
          }}
        />
      </button>

      {loading ? (
        <div className="px-4 pb-2">
          <Progress value={progress ?? 0} className="h-1" />
          <p className="text-xs text-[#7B8FA8] mt-1">Procesando extracto… {progress ?? 0}%</p>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 min-h-[280px] max-h-[420px]">
        {filtered.length === 0 ? (
          <p className="text-xs text-center text-[#7B8FA8] py-8">Sin filas cargadas</p>
        ) : (
          filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.id)}
              className={cn(
                "w-full flex items-stretch text-left rounded-lg px-2 py-2 hover:bg-white/[0.04] transition-colors",
                selectedId === r.id && "bg-white/[0.06] ring-1 ring-[#C8A44D]/50",
              )}
            >
              <RowStatus status="idle" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-[#7B8FA8]">{r.fechaFormateada}</span>
                  <span
                    className={cn(
                      "font-mono text-sm",
                      r.montoNeto >= 0 ? "text-[#00D68F]" : "text-[#FF5E7A]",
                    )}
                  >
                    {fmt(r.montoNeto)}
                  </span>
                </div>
                <p className="text-xs truncate text-[#E8EDF5]">{r.descripcion}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function SistemaPanel({
  rows,
  selectedId,
  onSelect,
}: {
  rows: MovimientoCajaConciliable[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-[#152238] bg-[#0A1628] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#152238]">
        <h3 className="text-sm font-semibold text-[#9B87F5]">💻 SISTEMA CONTABLE</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 min-h-[280px] max-h-[420px]">
        {rows.length === 0 ? (
          <p className="text-xs text-center text-[#7B8FA8] py-8">Sin movimientos en el período</p>
        ) : (
          rows.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={cn(
                "w-full flex items-stretch text-left rounded-lg px-2 py-2 hover:bg-white/[0.04]",
                selectedId === m.id && "bg-white/[0.06] ring-1 ring-[#C8A44D]/50",
              )}
            >
              <RowStatus status={m.conciliado ? "ok" : "idle"} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-[#7B8FA8]">{m.fecha}</span>
                  <span
                    className={cn(
                      "font-mono text-sm",
                      m.monto >= 0 ? "text-[#00D68F]" : "text-[#FF5E7A]",
                    )}
                  >
                    {fmt(m.monto)}
                  </span>
                </div>
                <p className="text-xs truncate text-[#E8EDF5]">{m.descripcion}</p>
                <p className="text-[10px] text-[#7B8FA8]">{m.origenDocumento}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ConnectionsPanel({ matches }: { matches: MatchedPair[] }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-[#152238] bg-[#0A1628]/80 overflow-hidden">
      <div className="px-3 py-2 border-b border-[#152238] text-center">
        <Link2 className="size-4 mx-auto text-[#C8A44D]" />
        <p className="text-[10px] text-[#7B8FA8] mt-1">Conexiones</p>
      </div>
      <svg className="flex-1 w-full min-h-[120px]" viewBox="0 0 100 200" preserveAspectRatio="none">
        {matches.slice(0, 8).map((m, i) => {
          const y = 20 + i * 22;
          const stroke =
            m.nivelMatch === "EXACTO" || m.nivelMatch === "MANUAL"
              ? COLORS.gold
              : m.nivelMatch === "PROBABLE"
                ? COLORS.warn
                : COLORS.muted;
          const dash = m.nivelMatch === "SUGERIDO" ? "4 4" : undefined;
          return (
            <path
              key={m.id}
              d={`M 5 ${y} Q 50 ${y + 8} 95 ${y}`}
              fill="none"
              stroke={stroke}
              strokeWidth={m.confirmado ? 3 : 2}
              strokeDasharray={dash}
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div className="p-2 space-y-1 max-h-[180px] overflow-y-auto border-t border-[#152238]">
        {matches.length === 0 ? (
          <p className="text-[10px] text-[#7B8FA8] text-center py-4">Sin matches</p>
        ) : (
          matches.slice(0, 6).map((m) => (
            <div
              key={m.id}
              className="rounded-md bg-white/[0.03] px-2 py-1.5 text-[10px] border border-white/[0.04]"
            >
              <div className="flex justify-between">
                <span className="text-[#C8A44D]">{m.nivelMatch}</span>
                <span className="font-mono text-[#E8EDF5]">{m.scoreSimilitud}%</span>
              </div>
              <p className="truncate text-[#7B8FA8]">{fmt(m.extractoRow.montoNeto)} ⇄ {fmt(m.movimientoSistema.monto)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function ConciliacionBancariaPremium({
  ruc,
  periodo,
}: {
  ruc: string;
  periodo: string;
}) {
  const [cuentaId, setCuentaId] = useState<string>("");
  const [extracto, setExtracto] = useState<BankStatementRow[]>([]);
  const [result, setResult] = useState<ConciliacionResult | null>(null);
  const [selExt, setSelExt] = useState<string | null>(null);
  const [selMov, setSelMov] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [notas, setNotas] = useState("");

  const cuentasQuery = useQuery({
    queryKey: ["cuentas_financieras", ruc],
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: !!ruc,
  });

  const conciliar = useEjecutarConciliacion();
  useConciliacionesPendientes(cuentaId || null);

  const cuenta = cuentasQuery.data?.find((c) => c.id === cuentaId);

  const handleCsv = useCallback(async (file: File) => {
    setParsing(true);
    setParseProgress(0);
    try {
      const text = await file.text();
      const rows = await conciliacionBancariaService.parseBankCSV(text, undefined, setParseProgress);
      setExtracto(rows);
      toast.success(`${rows.length} filas parseadas de ${file.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al parsear CSV");
    } finally {
      setParsing(false);
    }
  }, []);

  const runConciliacion = async () => {
    if (!cuentaId || extracto.length === 0) {
      toast.error("Seleccione cuenta y cargue extracto");
      return;
    }
    const res = await conciliar.mutateAsync({
      cuentaFinancieraId: cuentaId,
      ruc,
      periodo,
      extracto,
    });
    setResult(res);
  };

  const allMatches = useMemo(() => {
    if (!result) return [];
    return [...result.partidasConciliadas, ...result.partidasSugeridas];
  }, [result]);

  const anomalias = useMemo(() => {
    if (!result) return [];
    return detectarAnomalias(result.partidasSoloSistema);
  }, [result]);

  const vincularManual = async () => {
    if (!result || !selExt || !selMov) return;
    const pair = await conciliacionBancariaService.crearMatchManual(result.id, selExt, selMov);
    if (pair) {
      const updated = conciliacionBancariaService.getConciliacionLocal(result.id);
      if (updated) setResult(updated);
      toast.success("Match manual creado");
      setSelExt(null);
      setSelMov(null);
    }
  };

  const confirmar = async (matchId: string, ok: boolean) => {
    if (!result) return;
    await conciliacionBancariaService.confirmarMatch(result.id, matchId, ok);
    const updated = conciliacionBancariaService.getConciliacionLocal(result.id);
    if (updated) setResult(updated);
  };

  const finalizar = async () => {
    if (!result) return;
    const fin = await conciliacionBancariaService.finalizarConciliacion(result.id);
    if (fin) {
      setResult(fin);
      setFinalizeOpen(false);
      toast.success(`Conciliación ${fin.estado === "COMPLETADA" ? "completada" : "con discrepancias"}`);
    }
  };

  if (cuentasQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-xl bg-white/5" />
        <Skeleton className="h-96 rounded-xl bg-white/5" />
      </div>
    );
  }

  const resumen = result?.resumen;

  return (
    <div
      className="rounded-2xl border border-[#152238] p-4 md:p-6 space-y-4"
      style={{ backgroundColor: COLORS.bg }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#E8EDF5]">🏦 Conciliación Bancaria</h2>
          <p className="text-xs text-[#7B8FA8]">
            {cuenta?.nombre ?? "Seleccione cuenta"} • Período {periodo} •{" "}
            {result?.estado ?? "EN PROCESO"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={cuentaId}
            onChange={(e) => setCuentaId(e.target.value)}
            className="rounded-lg border border-[#152238] bg-[#0A1628] px-3 py-2 text-sm text-[#E8EDF5]"
          >
            <option value="">Cuenta financiera…</option>
            {(cuentasQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.cuenta_contable})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={runConciliacion}
            disabled={conciliar.isPending || !cuentaId || extracto.length === 0}
            className="bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/40 hover:bg-[#00C8FF]/30"
          >
            {conciliar.isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Ejecutar matching
          </Button>
        </div>
      </header>

      {resumen ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Total Extracto"
            value={fmt(resumen.totalExtractoNeto)}
            sub="Neto período"
            accent={COLORS.bank}
          />
          <MetricCard
            label="Total Sistema"
            value={fmt(resumen.totalSistemaNeto)}
            sub="Contabilidad"
            accent={COLORS.sys}
          />
          <MetricCard
            label="Diferencia"
            value={fmt(resumen.diferenciaNeta)}
            sub={Math.abs(resumen.diferenciaNeta) > 1 ? "⚠ Atención" : "Cuadrado"}
            alert={Math.abs(resumen.diferenciaNeta) > 1}
            accent={COLORS.err}
          />
          <MetricCard
            label="% Match"
            value={`${resumen.porcentajeConciliacion}%`}
            sub={`${resumen.partidasPendientes} pendientes`}
            accent={COLORS.ok}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_2fr] gap-3 min-h-[360px]">
        <ExtractoPanel
          rows={result?.partidasSoloExtracto.length ? [...extracto] : extracto}
          selectedId={selExt}
          filter="todos"
          onSelect={setSelExt}
          onDrop={handleCsv}
          loading={parsing}
          progress={parseProgress}
        />

        <div className="flex flex-col gap-2">
          <ConnectionsPanel matches={allMatches} />
          {selExt && selMov ? (
            <Button
              size="sm"
              className="bg-[#C8A44D]/20 text-[#C8A44D] border border-[#C8A44D]/40"
              onClick={vincularManual}
            >
              <Link2 className="size-4 mr-1" /> Vincular manualmente
            </Button>
          ) : (
            <p className="text-[10px] text-center text-[#7B8FA8] px-2">
              Seleccione fila en extracto y sistema para vincular
            </p>
          )}
          {result?.partidasSugeridas.map((m) => (
            <div key={m.id} className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7 text-[#00D68F]" onClick={() => confirmar(m.id, true)}>
                <Check className="size-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-[#FF5E7A]" onClick={() => confirmar(m.id, false)}>
                <X className="size-3" />
              </Button>
              <span className="text-[10px] text-[#7B8FA8] self-center truncate flex-1">
                {m.nivelMatch} {m.scoreSimilitud}%
              </span>
            </div>
          ))}
        </div>

        <SistemaPanel
          rows={result?.partidasSoloSistema ?? []}
          selectedId={selMov}
          onSelect={setSelMov}
        />
      </div>

      <div className="rounded-xl border border-[#152238] bg-[#0A1628]/60 px-4 py-3 flex flex-wrap items-center gap-4 text-xs text-[#7B8FA8]">
        <span className="text-[#F0A500]">
          🟡 {result?.partidasSoloExtracto.length ?? 0} solo extracto
        </span>
        <span className="text-[#F0A500]">
          🟠 {result?.partidasSugeridas.length ?? 0} sugeridos
        </span>
        <span className="text-[#FF5E7A]">
          🔴 {anomalias.length} anomalías
        </span>
        {resumen ? (
          <span>
            📊 Diferencia: <strong className="text-[#E8EDF5]">{fmt(resumen.diferenciaNeta)}</strong>
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" className="border-[#152238]" disabled={!result} onClick={() => setFinalizeOpen(true)}>
          Finalizar conciliación
        </Button>
      </div>

      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="glass-surface border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar conciliación</DialogTitle>
          </DialogHeader>
          {result ? (
            <div className="space-y-3 text-sm">
              <p>
                Match: <strong>{result.resumen.porcentajeConciliacion}%</strong> — Diferencia{" "}
                {fmt(result.resumen.diferenciaNeta)}
              </p>
              {Math.abs(result.resumen.diferenciaNeta) >= 1 ? (
                <div className="flex items-start gap-2 text-amber-500 text-xs">
                  <AlertTriangle className="size-4 shrink-0" />
                  Existe diferencia neta. Puede registrar ajuste o dejar como partida conciliatoria.
                </div>
              ) : null}
              <Textarea
                placeholder="Notas / observaciones"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFinalizeOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={finalizar}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
