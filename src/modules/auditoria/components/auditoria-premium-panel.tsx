import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAlertasAuditoria,
  useAuditoriaDashboard,
  useAuditoriaRegistros,
  useAuditoriaResumen,
  useEjecutarDeteccionPatrones,
  useResolverAlerta,
} from "@/hooks/use-auditoria-premium";
import { descargarAuditoria } from "@/modules/auditoria/services/auditoria-export-service";
import type { AuditoriaFilters, AuditoriaRegistro } from "@/modules/auditoria/types/auditoria";
import { cn } from "@/lib/utils";

const MODULOS = ["SIRE", "DIARIO", "CAJA", "PCGE", "CONTRIBUYENTES", "TAREAS", "CONFIGURACION", "SEGURIDAD"];
const ACCIONES = ["CREAR", "MODIFICAR", "ELIMINAR"];
const SEVERIDADES = ["INFO", "WARNING", "ERROR", "CRITICAL"];

const ACCION_COLOR: Record<string, string> = {
  CREAR: "#00C897",
  MODIFICAR: "#00C8FF",
  ELIMINAR: "#FF5E7A",
  APROBAR: "#9B87F5",
};

const PIE_COLORS = ["#00C897", "#00C8FF", "#FF5E7A", "#9B87F5", "#F0A500", "#8899B4"];

function KpiMonitor({
  label,
  value,
  tone,
  pulse,
}: {
  label: string;
  value: string | number;
  tone?: string;
  pulse?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl p-4 relative overflow-hidden">
      {pulse ? <span className="absolute top-2 right-2 size-2 rounded-full bg-[#FF5E7A] animate-pulse" /> : null}
      <p className="text-[10px] uppercase tracking-wider text-[#8899B4]">{label}</p>
      <p className="font-mono text-2xl font-semibold mt-1" style={{ color: tone ?? "#E8EDF5" }}>
        {value}
      </p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    INFO: "bg-[#00C897]/20 text-[#00C897] border-[#00C897]/30",
    WARNING: "bg-[#F0A500]/20 text-[#F0A500] border-[#F0A500]/30",
    ERROR: "bg-[#FF5E7A]/20 text-[#FF5E7A] border-[#FF5E7A]/30",
    CRITICAL: "bg-[#FF5E7A]/30 text-[#FF5E7A] border-[#FF5E7A]/50 animate-pulse",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-mono", map[severity] ?? map.INFO)}>
      {severity}
    </Badge>
  );
}

function DiffModal({
  registro,
  open,
  onClose,
}: {
  registro: AuditoriaRegistro | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!registro) return null;
  const entries = Object.entries(registro.diffJsonb ?? {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#0D1525] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-[#E8EDF5]">Comparación de cambios</DialogTitle>
        </DialogHeader>
        {entries.length === 0 ? (
          <pre className="text-xs text-[#8899B4] overflow-auto max-h-96 p-3 rounded-lg bg-black/30">
            {JSON.stringify(registro.detalleJsonb ?? {}, null, 2)}
          </pre>
        ) : (
          <div className="grid md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
            <div>
              <p className="text-xs text-[#FF5E7A] mb-2 font-medium">VALORES ANTERIORES</p>
              <div className="space-y-2">
                {entries.map(([key, val]) => (
                  <div key={key} className="rounded-lg bg-[#FF5E7A]/10 border border-[#FF5E7A]/20 p-2 text-xs font-mono">
                    <span className="text-[#8899B4]">{key}: </span>
                    <span className="text-[#E8EDF5]">{JSON.stringify(val.old)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#00C897] mb-2 font-medium">VALORES NUEVOS</p>
              <div className="space-y-2">
                {entries.map(([key, val]) => (
                  <div key={key} className="rounded-lg bg-[#00C897]/10 border border-[#00C897]/20 p-2 text-xs font-mono">
                    <span className="text-[#8899B4]">{key}: </span>
                    <span className="text-[#E8EDF5]">{JSON.stringify(val.new)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RegistroCard({
  registro,
  expanded,
  onToggle,
  onDiff,
}: {
  registro: AuditoriaRegistro;
  expanded: boolean;
  onToggle: () => void;
  onDiff: () => void;
}) {
  const accionColor = ACCION_COLOR[registro.accion] ?? "#8899B4";

  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: accionColor }}
    >
      <button type="button" onClick={onToggle} className="w-full text-left p-3 hover:bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={String(registro.severity)} />
          <span className="font-mono text-xs text-[#8899B4]">
            {new Date(registro.createdAt).toLocaleTimeString("es-PE")}
          </span>
          <span className="text-sm text-[#E8EDF5] truncate">{registro.usuarioEmail ?? "Sistema"}</span>
          <Badge variant="outline" className="text-[10px]" style={{ color: accionColor, borderColor: `${accionColor}40` }}>
            {registro.accion}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-white/10 text-[#00C8FF]">
            {registro.modulo}
          </Badge>
        </div>
        <p className="text-xs text-[#8899B4] mt-1">
          {registro.accion} en {registro.tablaAfectada}
          {registro.rucAfectado ? ` · RUC ${registro.rucAfectado}` : ""}
        </p>
        <div className="flex items-center gap-1 mt-2 text-[#8899B4]">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          <span className="text-[10px]">Registro: {registro.registroId.slice(0, 12)}…</span>
        </div>
      </button>
      {expanded ? (
        <div className="px-3 pb-3 border-t border-white/[0.05] pt-2 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="h-7 text-xs border-white/10" onClick={onDiff}>
              <Eye className="size-3 mr-1" />
              Ver diff
            </Button>
          </div>
          <pre className="text-[10px] font-mono text-[#8899B4] bg-black/20 rounded-lg p-2 overflow-auto max-h-40">
            {JSON.stringify(registro.detalleJsonb ?? {}, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export function AuditoriaPremiumPanel() {
  const [filters, setFilters] = useState<AuditoriaFilters>({ pagina: 1, limit: 50 });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [diffRegistro, setDiffRegistro] = useState<AuditoriaRegistro | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);

  const dashboard = useAuditoriaDashboard();
  const registros = useAuditoriaRegistros(filters);
  const resumen = useAuditoriaResumen();
  const alertas = useAlertasAuditoria(true);
  const detectMut = useEjecutarDeteccionPatrones();
  const resolveMut = useResolverAlerta();

  const chartModulo = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of resumen.data ?? []) {
      map.set(r.modulo, (map.get(r.modulo) ?? 0) + r.totalOperaciones);
    }
    return [...map.entries()].map(([modulo, total]) => ({ modulo, total }));
  }, [resumen.data]);

  const chartAccion = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of resumen.data ?? []) {
      map.set(r.accion, (map.get(r.accion) ?? 0) + r.totalOperaciones);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [resumen.data]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hora: `${String(i).padStart(2, "0")}:00`, ops: 0 }));
    for (const r of registros.data?.data ?? []) {
      const h = new Date(r.createdAt).getHours();
      hours[h].ops += 1;
    }
    return hours;
  }, [registros.data]);

  const estado = dashboard.data?.estadoSistema ?? "NORMAL";
  const estadoLabel = estado === "CRITICO" ? "🔴 Crítico" : estado === "ATENCION" ? "🟡 Atención" : "🟢 Normal";
  const estadoColor = estado === "CRITICO" ? "#FF5E7A" : estado === "ATENCION" ? "#F0A500" : "#00C897";

  const handleExport = async (formato: "PDF" | "CSV" | "EXCEL") => {
    try {
      await descargarAuditoria(filters, formato);
      toast.success(`Exportación ${formato} completada`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al exportar");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#060B14] to-[#080E1E] p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#00C8FF]/20 pb-4">
        <div>
          <h1 className="font-display text-xl text-[#E8EDF5] flex items-center gap-2">
            <Shield className="size-5 text-[#00C8FF]" />
            Centro de Control de Auditoría
          </h1>
          <p className="text-xs text-[#8899B4] mt-1">
            Monitoreo regulatorio · Actualización cada 30s
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10"
            disabled={detectMut.isPending}
            onClick={async () => {
              const n = await detectMut.mutateAsync();
              toast.success(`${n.length} alerta(s) generada(s)`);
            }}
          >
            {detectMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4 mr-1" />}
            Detectar patrones
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-[#C8A44D] text-black hover:bg-[#C8A44D]/90">
                <Download className="size-4 mr-1" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => void handleExport("PDF")}>PDF formal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleExport("CSV")}>CSV (UTF-8)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleExport("EXCEL")}>Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {dashboard.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiMonitor label="Acciones hoy" value={dashboard.data?.accionesHoy ?? 0} tone="#00C897" />
          <KpiMonitor label="Usuarios activos" value={dashboard.data?.usuariosActivos ?? 0} tone="#00C8FF" />
          <KpiMonitor
            label="Alertas activas"
            value={dashboard.data?.alertasActivas ?? 0}
            tone="#FF5E7A"
            pulse={(dashboard.data?.alertasActivas ?? 0) > 0}
          />
          <KpiMonitor label="Módulos activos" value={dashboard.data?.modulosActivos ?? 0} tone="#9B87F5" />
          <KpiMonitor label="Sistema" value={estadoLabel} tone={estadoColor} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8899B4]" />
          <Input
            placeholder="Buscar en registros..."
            className="pl-9 bg-white/[0.03] border-white/[0.08]"
            onChange={(e) => setFilters((f) => ({ ...f, busqueda: e.target.value, pagina: 1 }))}
          />
        </div>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, modulo: v === "ALL" ? undefined : v, pagina: 1 }))}>
          <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/[0.08]">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {MODULOS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, accion: v === "ALL" ? undefined : v, pagina: 1 }))}>
          <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/[0.08]">
            <SelectValue placeholder="Acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {ACCIONES.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, severity: v === "ALL" ? undefined : v, pagina: 1 }))}>
          <SelectTrigger className="w-[130px] bg-white/[0.03] border-white/[0.08]">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            {SEVERIDADES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-medium text-[#8899B4] uppercase tracking-wider">
            Registros ({registros.data?.total ?? 0})
          </p>
          {registros.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              {(registros.data?.data ?? []).map((r) => (
                <RegistroCard
                  key={r.id}
                  registro={r}
                  expanded={expandedId === r.id}
                  onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  onDiff={() => setDiffRegistro(r)}
                />
              ))}
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={(filters.pagina ?? 1) <= 1}
                  onClick={() => setFilters((f) => ({ ...f, pagina: Math.max((f.pagina ?? 1) - 1, 1) }))}
                >
                  Anterior
                </Button>
                <span className="text-xs text-[#8899B4] self-center">Pág. {filters.pagina ?? 1}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilters((f) => ({ ...f, pagina: (f.pagina ?? 1) + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {showAlerts ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#E8EDF5] flex items-center gap-1">
                  <AlertTriangle className="size-4 text-[#F0A500]" />
                  Alertas ({alertas.data?.length ?? 0})
                </p>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowAlerts(false)}>
                  Ocultar
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(alertas.data ?? []).length === 0 ? (
                  <p className="text-xs text-[#8899B4]">Sin alertas activas</p>
                ) : (
                  (alertas.data ?? []).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border border-white/[0.06] p-2 text-xs"
                      style={{ borderLeftWidth: 3, borderLeftColor: a.severidad === "CRITICAL" || a.severidad === "ERROR" ? "#FF5E7A" : "#F0A500" }}
                    >
                      <p className="font-medium text-[#E8EDF5]">{a.titulo}</p>
                      <p className="text-[#8899B4] mt-0.5">{a.descripcion}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 mt-1 text-[#00C897] px-0"
                        disabled={resolveMut.isPending}
                        onClick={async () => {
                          await resolveMut.mutateAsync(a.id);
                          toast.success("Alerta resuelta");
                        }}
                      >
                        Resolver
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-xs font-medium text-[#8899B4] mb-2">Actividad por módulo (24h)</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartModulo} layout="vertical">
                <CartesianGrid stroke="#1A2740" horizontal={false} />
                <XAxis type="number" stroke="#8899B4" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="modulo" stroke="#8899B4" tick={{ fontSize: 9 }} width={70} />
                <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #ffffff10" }} />
                <Bar dataKey="total" fill="#00C8FF" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-xs font-medium text-[#8899B4] mb-2">Por tipo de acción</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={chartAccion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} label={false}>
                  {chartAccion.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #ffffff10" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-xs font-medium text-[#8899B4] mb-2">Actividad por hora</p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={hourlyData}>
                <Line type="monotone" dataKey="ops" stroke="#00C897" strokeWidth={2} dot={false} />
                <XAxis dataKey="hora" stroke="#8899B4" tick={{ fontSize: 8 }} interval={3} />
                <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #ffffff10" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <DiffModal registro={diffRegistro} open={!!diffRegistro} onClose={() => setDiffRegistro(null)} />
    </div>
  );
}
