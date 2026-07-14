import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Search,
  Zap,
  Wallet,
  CheckCircle,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useUiPreferences } from "@/hooks/use-ui-preferences";
import { useTraceabilityChain } from "@/modules/contabilidad/asientos/services/asiento-traceability-service";
import {
  exportTraceabilityCsv,
  exportTraceabilityJson,
  exportTraceabilityPdf,
} from "@/modules/contabilidad/asientos/services/traceability-export";
import type {
  IntegrityIssue,
  TraceabilityNode,
  TraceabilityNodeType,
} from "@/modules/contabilidad/asientos/types/traceability";

const NODE_COLORS: Record<TraceabilityNodeType, string> = {
  SIRE_REGISTRO: "#00D4FF",
  PROVISION: "#C8A95A",
  MOVIMIENTO_CAJA: "#00C897",
  CANCELACION: "#FF6B6B",
  CENTRALIZACION: "#9B87F5",
  REVERSION: "#F0A500",
};

const NODE_ICONS: Record<TraceabilityNodeType, typeof FileText> = {
  SIRE_REGISTRO: FileText,
  PROVISION: Zap,
  MOVIMIENTO_CAJA: Wallet,
  CANCELACION: CheckCircle,
  CENTRALIZACION: BarChart3,
  REVERSION: RotateCcw,
};

const ESTADO_BADGE: Record<string, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  PROVISIONADO: { label: "Provisionado", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  PAGADO: { label: "Pagado", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  COBRADO: { label: "Cobrado", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  PARCIAL: { label: "Parcial", className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  ANULADO: { label: "Anulado", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

function formatMoney(n: number, moneda = "PEN") {
  const sym = moneda === "USD" ? "$" : moneda === "EUR" ? "€" : "S/";
  return `${sym} ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function LineasTable({ lineas }: { lineas: NonNullable<TraceabilityNode["metadata"]["lineasContables"]> }) {
  const debe = lineas.reduce((s, l) => s + l.debe, 0);
  const haber = lineas.reduce((s, l) => s + l.haber, 0);
  const diff = Math.abs(debe - haber);
  const cuadra = diff <= 0.001;

  return (
    <div className="rounded-lg border border-white/[0.05] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/[0.05] text-[#8899B4] uppercase tracking-wider">
            <th className="px-3 py-2 text-left">Cuenta</th>
            <th className="px-3 py-2 text-right">Debe</th>
            <th className="px-3 py-2 text-right">Haber</th>
          </tr>
        </thead>
        <tbody>
          {lineas.map((l, i) => (
            <tr key={l.cuentaCodigo + i} className={cn("border-t border-white/[0.03]", i % 2 && "bg-white/[0.01]")}>
              <td className="px-3 py-2">
                <span className="font-mono">{l.cuentaCodigo}</span>
                <span className="text-[#8899B4] ml-2">{l.cuentaDenominacion}</span>
              </td>
              <td className="px-3 py-2 text-right font-mono text-[#00D4FF] tabular-nums">
                {l.debe > 0 ? l.debe.toFixed(2) : "—"}
              </td>
              <td className="px-3 py-2 text-right font-mono text-[#FF6B6B] tabular-nums">
                {l.haber > 0 ? l.haber.toFixed(2) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-[#C8A95A]/50">
            <td className="px-3 py-2 font-medium">Totales</td>
            <td className="px-3 py-2 text-right font-mono text-[#00D4FF]">{debe.toFixed(2)}</td>
            <td className="px-3 py-2 text-right font-mono text-[#FF6B6B]">{haber.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="px-3 py-1.5 text-right text-[10px]">
              Diferencia:{" "}
              <span className={cn("font-mono", cuadra ? "text-emerald-400" : "text-red-400")}>
                {diff.toFixed(2)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function NodeDetailPanel({
  node,
  darkMode,
  onNavigateNode,
}: {
  node: TraceabilityNode;
  darkMode: boolean;
  onNavigateNode?: (id: string) => void;
}) {
  const color = NODE_COLORS[node.type];
  const link = node.metadata.linkNavegacion;

  return (
    <div
      className={cn(
        "rounded-xl border backdrop-blur-md overflow-hidden animate-in slide-in-from-right-4 duration-300",
        darkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200",
      )}
      style={{ borderTopWidth: 3, borderTopColor: color }}
      role="region"
      aria-label={`Detalle: ${node.titulo}`}
    >
      <div className="p-4 border-b border-white/[0.05]">
        <p className="text-xs uppercase tracking-wider" style={{ color }}>
          {node.type.replace(/_/g, " ")}
        </p>
        <h3 className="text-lg font-semibold mt-1">{node.titulo}</h3>
        <p className="text-sm text-[#8899B4] mt-1">{node.descripcion}</p>
        <p className="font-mono text-xl mt-2 tabular-nums">{formatMoney(node.monto, node.moneda)}</p>
      </div>

      <div className="p-4 space-y-4 text-sm">
        {node.type === "SIRE_REGISTRO" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[#8899B4] text-xs">Contraparte</p>
              <p>{node.metadata.nombreContraparte ?? "—"}</p>
            </div>
            <div>
              <p className="text-[#8899B4] text-xs">RUC</p>
              <p className="font-mono">{node.metadata.rucContraparte ?? "—"}</p>
            </div>
            <div>
              <p className="text-[#8899B4] text-xs">Comprobante</p>
              <p className="font-mono">
                {node.metadata.tipoComprobante}-{node.metadata.serie}-{node.metadata.numero}
              </p>
            </div>
          </div>
        )}

        {(node.type === "PROVISION" || node.type === "CANCELACION") && node.metadata.lineasContables && (
          <>
            <p className="text-xs text-[#8899B4]">
              Asiento: <span className="font-mono text-[#E8EDF5]">{node.metadata.asientoId?.slice(0, 8)}</span>
            </p>
            <LineasTable lineas={node.metadata.lineasContables} />
          </>
        )}

        {node.type === "MOVIMIENTO_CAJA" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[#8899B4] text-xs">Cuenta financiera</p>
              <p className="font-mono">{node.metadata.cuentaFinanciera}</p>
            </div>
            <div>
              <p className="text-[#8899B4] text-xs">Tipo</p>
              <Badge
                className={
                  node.metadata.tipoMovimiento === "INGRESO"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }
              >
                {node.metadata.tipoMovimiento}
              </Badge>
            </div>
            <div>
              <p className="text-[#8899B4] text-xs">Origen</p>
              <p>{node.metadata.origenDocumento}</p>
            </div>
          </div>
        )}

        {node.type === "CENTRALIZACION" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[#8899B4] text-xs">Movimientos agrupados</p>
              <p>{node.metadata.cantidadMovimientos}</p>
            </div>
            <div>
              <p className="text-[#8899B4] text-xs">Período</p>
              <p className="font-mono">{node.metadata.periodoCentralizado}</p>
            </div>
          </div>
        )}

        {node.nodosParalelos?.length ? (
          <div>
            <p className="text-xs text-[#8899B4] mb-2">Nodos relacionados</p>
            <div className="flex flex-wrap gap-1">
              {node.nodosParalelos.map((id) => (
                <Button key={id} variant="outline" size="sm" className="h-7 text-xs" onClick={() => onNavigateNode?.(id)}>
                  {id.slice(0, 12)}…
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {link ? (
          <Button variant="outline" size="sm" asChild>
            <a href={link}>
              <ExternalLink className="size-3.5 mr-1" />
              Ir al módulo
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function MiniGraph({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: TraceabilityNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const w = 200;
  const h = Math.min(150, nodes.length * 28 + 20);
  const step = nodes.length > 1 ? (h - 40) / (nodes.length - 1) : 0;

  return (
    <svg
      width={w}
      height={h}
      className="rounded-lg border border-white/[0.05] bg-white/[0.02]"
      role="img"
      aria-label="Mini mapa de trazabilidad"
    >
      {nodes.map((n, i) => {
        const y = 20 + i * step;
        const x = 30;
        const selected = n.id === selectedId;
        return (
          <g key={n.id}>
            {i > 0 && (
              <line x1={x} y1={20 + (i - 1) * step + 6} x2={x} y2={y - 6} stroke="#1A2540" strokeWidth={1.5} />
            )}
            <circle
              cx={x}
              cy={y}
              r={selected ? 8 : 6}
              fill={NODE_COLORS[n.type]}
              opacity={selected ? 1 : 0.7}
              className="cursor-pointer"
              onClick={() => onSelect(n.id)}
              style={selected ? { filter: `drop-shadow(0 0 6px ${NODE_COLORS[n.type]})` } : undefined}
            />
            <text x={x + 14} y={y + 4} fill="#8899B4" fontSize={8} className="pointer-events-none">
              {n.titulo.slice(0, 18)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function IntegritySection({
  issues,
  onNavigateNode,
}: {
  issues: IntegrityIssue[];
  onNavigateNode: (id: string) => void;
}) {
  const [ignored, setIgnored] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("traceability-ignored-issues");
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const visible = issues.filter((i) => !ignored.has(i.id));
  if (!visible.length) return null;

  const maxSev = visible.some((i) => i.severidad === "CRITICAL")
    ? "CRITICAL"
    : visible.some((i) => i.severidad === "ERROR")
      ? "ERROR"
      : "WARNING";

  const ignoreIssue = (id: string) => {
    const next = new Set(ignored);
    next.add(id);
    setIgnored(next);
    localStorage.setItem("traceability-ignored-issues", JSON.stringify([...next]));
  };

  return (
    <Collapsible defaultOpen={maxSev !== "INFO"}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full rounded-xl border p-4 flex items-center justify-between text-left transition-colors",
            maxSev === "CRITICAL" || maxSev === "ERROR"
              ? "border-red-500/30 bg-red-500/5"
              : "border-amber-500/30 bg-amber-500/5",
          )}
        >
          <span className="flex items-center gap-2 text-sm">
            <AlertTriangle className="size-4 text-amber-400" />
            {visible.length} problema{visible.length !== 1 ? "s" : ""} de integridad detectado
            {visible.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown className="size-4 text-[#8899B4]" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {visible.map((issue) => (
          <div key={issue.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="outline" className="text-[10px] mb-1">
                  {issue.severidad}
                </Badge>
                <p className="font-medium">{issue.descripcion}</p>
                <p className="text-xs text-[#8899B4] mt-1">{issue.detalle}</p>
                {issue.sugerenciaCorreccion ? (
                  <p className="text-xs text-[#C8A95A] mt-1">{issue.sugerenciaCorreccion}</p>
                ) : null}
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0" onClick={() => ignoreIssue(issue.id)}>
                Ignorar
              </Button>
            </div>
            {issue.nodosAfectados.length ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {issue.nodosAfectados.map((nid) => (
                  <Button key={nid} variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => onNavigateNode(nid)}>
                    Nodo {nid.slice(0, 8)}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function TimelineSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={cn("space-y-6 p-6", darkMode ? "bg-[#070C1B]" : "bg-[#F8FAFC]")}>
      <Skeleton className={cn("h-24 rounded-xl", darkMode ? "bg-white/5" : "bg-slate-200")} />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className={cn("size-4 rounded-full shrink-0", darkMode ? "bg-white/10" : "bg-slate-300")} />
              <Skeleton className={cn("h-16 flex-1 rounded-xl", darkMode ? "bg-white/5" : "bg-slate-200")} />
            </div>
          ))}
        </div>
        <Skeleton className={cn("h-64 rounded-xl", darkMode ? "bg-white/5" : "bg-slate-200")} />
      </div>
    </div>
  );
}

export default function AsientoTraceabilityViewerPremium({
  sireRegistroId,
  compact = false,
}: {
  sireRegistroId: string;
  compact?: boolean;
}) {
  const { darkMode } = useUiPreferences();
  const { data: chain, isLoading, isError, error, refetch, isFetching } = useTraceabilityChain(sireRegistroId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const selectedNode = useMemo(() => {
    if (!chain) return null;
    return chain.nodos.find((n) => n.id === selectedId) ?? chain.nodos[0] ?? null;
  }, [chain, selectedId]);

  useEffect(() => {
    if (chain?.nodos.length && !selectedId) {
      setSelectedId(chain.nodos[0].id);
    }
  }, [chain, selectedId]);

  const selectNode = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (!reducedMotion) {
        document.getElementById(`trace-node-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [reducedMotion],
  );

  const bgMain = darkMode ? "bg-[#070C1B] text-[#E8EDF5]" : "bg-[#F8FAFC] text-[#1E293B]";
  const bgTimeline = darkMode ? "bg-[#0A1020]" : "bg-[#E2E8F0]/30";
  const muted = darkMode ? "text-[#8899B4]" : "text-slate-500";

  if (isLoading) return <TimelineSkeleton darkMode={darkMode} />;

  if (isError || !chain) {
    return (
      <div className={cn("p-8 text-center rounded-xl border", bgMain)}>
        <AlertTriangle className="size-10 mx-auto text-amber-400 mb-3" />
        <h3 className="font-semibold">Comprobante no encontrado</h3>
        <p className={cn("text-sm mt-2", muted)}>
          {(error as Error)?.message ?? "No se pudo construir la cadena de trazabilidad"}
        </p>
        <p className={cn("text-xs mt-4", muted)}>
          Verifique el ID en Registros SIRE o sincronice con Sync SIRE.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="size-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  const origin = chain.nodoOrigen;
  const estadoBadge = ESTADO_BADGE[chain.resumen.estadoActual] ?? ESTADO_BADGE.PENDIENTE;

  return (
    <div className={cn("min-h-full", bgMain, compact ? "p-4" : "p-6 lg:p-8")} role="main" aria-label="Trazabilidad contable">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="size-5 text-[#C8A95A]" aria-hidden />
          <h1 className="text-xl font-semibold">Trazabilidad Contable</h1>
          {isFetching ? <RefreshCw className="size-4 animate-spin text-[#8899B4]" aria-label="Actualizando" /> : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-white/10">
              <Download className="size-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                void exportTraceabilityPdf(chain, "auditoria").catch(() => toast.error("Error al exportar PDF"));
                toast.success("PDF de auditoría generado");
              }}
            >
              PDF Auditoría
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void exportTraceabilityPdf(chain, "ejecutivo").catch(() => toast.error("Error al exportar PDF"));
                toast.success("PDF ejecutivo generado");
              }}
            >
              PDF Ejecutivo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                exportTraceabilityCsv(chain);
                toast.success("CSV exportado");
              }}
            >
              CSV Líneas Contables
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                exportTraceabilityJson(chain);
                toast.success("JSON exportado");
              }}
            >
              JSON Completo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Comprobante card */}
      <div
        className={cn(
          "rounded-xl border backdrop-blur-lg p-5 mb-6",
          darkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm",
        )}
      >
        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div>
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30 mb-2">
              {origin.metadata.tipoComprobante}
            </Badge>
            <p className="text-2xl font-mono font-semibold">
              {origin.metadata.serie}-{origin.metadata.numero}
            </p>
          </div>
          <div className={cn("text-sm", muted)}>
            <p>{origin.metadata.nombreContraparte}</p>
            <p className="font-mono">RUC {origin.metadata.rucContraparte ?? chain.ruc}</p>
            <p>Período {chain.periodo}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono font-bold tabular-nums">{formatMoney(chain.resumen.montoOriginal, origin.moneda)}</p>
            <Badge className={cn("mt-2", estadoBadge.className)}>{estadoBadge.label}</Badge>
          </div>
        </div>
        <div
          className="h-px mt-4 bg-gradient-to-r from-[#00D4FF] via-[#C8A95A] to-transparent"
          aria-hidden
        />
      </div>

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Monto Total", value: formatMoney(chain.resumen.montoOriginal), border: "#C8A95A", icon: "💰" },
          { label: "Tiempo", value: `${chain.resumen.diasTranscurridos} días`, border: "#00D4FF", icon: "⏱️" },
          { label: "Completado", value: `${chain.resumen.porcentajeCompletado}%`, border: "#00C897", icon: "📊", progress: chain.resumen.porcentajeCompletado },
          { label: "Estado", value: chain.resumen.estadoActual, border: "#9B87F5", icon: "🟢" },
        ].map((m) => (
          <div
            key={m.label}
            className={cn(
              "rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]",
              darkMode ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]" : "bg-white border-slate-200",
            )}
            style={{ borderBottomWidth: 2, borderBottomColor: m.border }}
          >
            <p className={cn("text-xs", muted)}>
              {m.icon} {m.label}
            </p>
            <p className="text-lg font-semibold mt-1 tabular-nums">{m.value}</p>
            {"progress" in m && m.progress !== undefined ? (
              <Progress value={m.progress} className="h-1.5 mt-2" />
            ) : null}
          </div>
        ))}
      </div>

      {/* Timeline + detail */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div
          ref={timelineRef}
          className={cn("lg:col-span-2 rounded-xl border p-4 relative", bgTimeline, darkMode ? "border-white/[0.05]" : "border-slate-200")}
          role="list"
          aria-label="Línea de tiempo"
        >
          <div className="flex justify-between mb-4">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => selectNode(chain.nodos[0].id)}>
              <ChevronUp className="size-3 mr-1" />
              Inicio
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => selectNode(chain.nodos[chain.nodos.length - 1].id)}
            >
              Final
              <ChevronDown className="size-3 ml-1" />
            </Button>
          </div>

          <div className="relative pl-6 space-y-4">
            <div
              className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#1A2540]"
              aria-hidden
            />
            {chain.nodos.map((node, idx) => {
              const Icon = NODE_ICONS[node.type];
              const color = NODE_COLORS[node.type];
              const selected = node.id === selectedId;
              return (
                <div
                  key={node.id}
                  id={`trace-node-${node.id}`}
                  role="listitem"
                  className="relative flex gap-3 group"
                  style={{ animationDelay: reducedMotion ? undefined : `${idx * 150}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => selectNode(node.id)}
                    className={cn(
                      "relative z-10 shrink-0 rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A95A]",
                      selected ? "size-5" : "size-4",
                    )}
                    style={{
                      borderColor: color,
                      background: `radial-gradient(circle, ${color}88, ${color}44)`,
                      boxShadow: selected ? `0 0 12px ${color}66` : undefined,
                    }}
                    aria-label={`${node.titulo}, ${node.fechaFormateada}`}
                    aria-current={selected ? "step" : undefined}
                  >
                    <Icon className="size-2.5 absolute inset-0 m-auto text-white" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectNode(node.id)}
                    className={cn(
                      "flex-1 text-left rounded-lg border p-3 transition-all duration-300",
                      darkMode ? "bg-white/[0.03] border-white/[0.05]" : "bg-white border-slate-200",
                      "hover:-translate-y-0.5 group-hover:border-l-4",
                      selected && "ring-1",
                    )}
                    style={{
                      borderLeftColor: selected ? color : undefined,
                      boxShadow: selected ? `0 0 20px ${color}22` : undefined,
                    }}
                  >
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className={cn("text-[10px]", muted)}>{node.fechaFormateada}</p>
                        <p className="text-sm font-semibold">{node.titulo}</p>
                      </div>
                      <p className="font-mono text-sm tabular-nums shrink-0">{formatMoney(node.monto, node.moneda)}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] mt-1 border-white/10">
                      {node.estado}
                    </Badge>
                  </button>
                </div>
              );
            })}
          </div>

          {chain.nodos.length > 5 && !compact ? (
            <div className="hidden xl:block absolute -right-[220px] top-4">
              <MiniGraph nodes={chain.nodos} selectedId={selectedId ?? ""} onSelect={selectNode} />
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          {selectedNode ? (
            <NodeDetailPanel node={selectedNode} darkMode={darkMode} onNavigateNode={selectNode} />
          ) : null}
        </div>
      </div>

      {/* Integridad */}
      {chain.resumen.erroresDetectados.length ? (
        <div className="mt-6">
          <IntegritySection issues={chain.resumen.erroresDetectados} onNavigateNode={selectNode} />
        </div>
      ) : null}

      <p className={cn("text-[10px] mt-6 text-center", muted)}>
        Consulta en {chain.metadata.tiempoConstruccion}ms · Fuentes: {chain.metadata.fuentesConsultadas.join(", ")}
      </p>
    </div>
  );
}
