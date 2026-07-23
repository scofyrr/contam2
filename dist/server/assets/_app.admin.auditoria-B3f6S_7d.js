import { U as reactExports, L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { as as useSession, ar as useQueryClient, aj as toast } from "./router-B2fOVgbK.js";
import { B as Badge } from "./badge-yaC6QAMb.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle } from "./dialog-BvZLNj9g.js";
import { D as DropdownMenu, e as DropdownMenuTrigger, a as DropdownMenuContent, b as DropdownMenuItem } from "./dropdown-menu-DeulaLXn.js";
import { I as Input } from "./input-CVw-0GOD.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-DBf2jt_8.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { u as useQuery } from "./useQuery-BWRVlDqX.js";
import { u as useMutation } from "./useMutation-BW7ClUbS.js";
import { a as auditoriaService } from "./auditoria-service-_uxRL405.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { S as Shield } from "./shield-BMvb8sMw.js";
import { L as LoaderCircle } from "./loader-circle-DUOoJQci.js";
import { R as RefreshCw } from "./refresh-cw-CZupm7dT.js";
import { D as Download } from "./download-BejVGX4c.js";
import { S as Search } from "./search-Jjuvdmyj.js";
import { T as TriangleAlert } from "./triangle-alert-n38mPMK9.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, g as Tooltip, B as Bar, a as Cell } from "./generateCategoricalChart-Bx15tFyN.js";
import { B as BarChart } from "./BarChart-Ddr6dQRV.js";
import { C as CartesianGrid } from "./CartesianGrid-DXjk64D3.js";
import { a as PieChart, P as Pie } from "./PieChart-BGRPAhXi.js";
import { L as LineChart } from "./LineChart-BBmmIqo0.js";
import { L as Line } from "./Line-ClKEnyq8.js";
import { C as ChevronDown } from "./chevron-up-kSt2_UA7.js";
import { C as ChevronRight } from "./chevron-right-BUCAQpLv.js";
import { E as Eye } from "./eye-C4ug0RW_.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CWutStw1.js";
import "./index-M3oW48Eb.js";
import "./Combination-D4Tn14OX.js";
import "./index-Bkm5nwUb.js";
import "./x-B5oN35Uv.js";
import "./index-CG6nsUgb.js";
import "./circle-CDAFw6RI.js";
import "./index-DkWXu2TP.js";
function useAuditoriaRegistros(filters) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["auditoria", "registros", filters],
    queryFn: () => auditoriaService.buscarRegistros(filters),
    staleTime: 3e4,
    enabled: !!user?.id
  });
}
function useAuditoriaDashboard() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["auditoria", "dashboard"],
    queryFn: () => auditoriaService.obtenerDashboardStats(),
    refetchInterval: 3e4,
    staleTime: 15e3,
    enabled: !!user?.id
  });
}
function useAuditoriaResumen() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["auditoria", "resumen"],
    queryFn: () => auditoriaService.obtenerResumenActividad(24),
    refetchInterval: 5 * 6e4,
    enabled: !!user?.id
  });
}
function useAlertasAuditoria(noResueltas = true) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["auditoria", "alertas", noResueltas],
    queryFn: () => auditoriaService.obtenerAlertas(noResueltas),
    refetchInterval: 2 * 6e4,
    enabled: !!user?.id
  });
}
function useEjecutarDeteccionPatrones() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => auditoriaService.ejecutarDeteccionPatrones(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["auditoria", "alertas"] });
      await qc.invalidateQueries({ queryKey: ["auditoria", "dashboard"] });
    }
  });
}
function useResolverAlerta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertaId) => auditoriaService.resolverAlerta(alertaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["auditoria"] });
    }
  });
}
function filtersLabel(filters) {
  const lines = [];
  if (filters.modulo) lines.push(`Módulo: ${filters.modulo}`);
  if (filters.accion) lines.push(`Acción: ${filters.accion}`);
  if (filters.ruc) lines.push(`RUC: ${filters.ruc}`);
  if (filters.periodo) lines.push(`Período: ${filters.periodo}`);
  if (filters.severity) lines.push(`Severidad: ${filters.severity}`);
  if (filters.fechaDesde) lines.push(`Desde: ${filters.fechaDesde}`);
  if (filters.fechaHasta) lines.push(`Hasta: ${filters.fechaHasta}`);
  if (filters.busqueda) lines.push(`Búsqueda: ${filters.busqueda}`);
  return lines;
}
async function exportarAuditoriaPDF(filters) {
  const { data } = await auditoriaService.buscarRegistros({ ...filters, limit: 500 });
  const { jsPDF } = await import("./jspdf.es.min-W2W0Fm1x.js").then((n) => n.j);
  const autoTable = (await import("./jspdf.plugin.autotable-Do1qGbTG.js")).default;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Reporte de Auditoría — CONTAM", 14, 16);
  doc.setFontSize(9);
  doc.text(`Generado: ${(/* @__PURE__ */ new Date()).toLocaleString("es-PE")}`, 14, 24);
  let y = 30;
  for (const line of filtersLabel(filters)) {
    doc.text(line, 14, y);
    y += 5;
  }
  autoTable(doc, {
    startY: y + 4,
    head: [["Fecha", "Usuario", "Severidad", "Acción", "Módulo", "Tabla", "RUC"]],
    body: data.map((r) => [
      new Date(r.createdAt).toLocaleString("es-PE"),
      r.usuarioEmail ?? "—",
      r.severity,
      r.accion,
      r.modulo,
      r.tablaAfectada,
      r.rucAfectado ?? "—"
    ]),
    styles: { fontSize: 7 },
    foot: [[`Total registros: ${data.length}`, "", "", "", "", "", ""]]
  });
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pages}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 8);
  }
  return doc.output("blob");
}
async function exportarAuditoriaCSV(filters) {
  const { data } = await auditoriaService.buscarRegistros({ ...filters, limit: 5e3 });
  const headers = ["id", "fecha", "usuario", "severidad", "accion", "modulo", "tabla", "registro_id", "ruc", "periodo"];
  const rows = data.map(
    (r) => [
      r.id,
      r.createdAt,
      r.usuarioEmail ?? "",
      r.severity,
      r.accion,
      r.modulo,
      r.tablaAfectada,
      r.registroId,
      r.rucAfectado ?? "",
      r.periodoAfectado ?? ""
    ].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
  );
  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...rows].join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}
async function exportarAuditoriaExcel(filters) {
  const { data } = await auditoriaService.buscarRegistros({ ...filters, limit: 5e3 });
  const XLSX = await import("./xlsx-D6h3nj8f.js");
  const sheet = XLSX.utils.json_to_sheet(
    data.map((r) => ({
      ID: r.id,
      Fecha: r.createdAt,
      Usuario: r.usuarioEmail,
      Severidad: r.severity,
      Accion: r.accion,
      Modulo: r.modulo,
      Tabla: r.tablaAfectada,
      Registro: r.registroId,
      RUC: r.rucAfectado,
      Periodo: r.periodoAfectado
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Auditoria");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
async function exportarAuditoria(filters, formato) {
  if (formato === "PDF") return exportarAuditoriaPDF(filters);
  if (formato === "CSV") return exportarAuditoriaCSV(filters);
  return exportarAuditoriaExcel(filters);
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
async function descargarAuditoria(filters, formato) {
  const blob = await exportarAuditoria(filters, formato);
  const ext = formato === "PDF" ? "pdf" : formato === "CSV" ? "csv" : "xlsx";
  downloadBlob(blob, `CONTAM_Auditoria_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.${ext}`);
}
const MODULOS = ["SIRE", "DIARIO", "CAJA", "PCGE", "CONTRIBUYENTES", "TAREAS", "CONFIGURACION", "SEGURIDAD"];
const ACCIONES = ["CREAR", "MODIFICAR", "ELIMINAR"];
const SEVERIDADES = ["INFO", "WARNING", "ERROR", "CRITICAL"];
const ACCION_COLOR = {
  CREAR: "#00C897",
  MODIFICAR: "#00C8FF",
  ELIMINAR: "#FF5E7A",
  APROBAR: "#9B87F5"
};
const PIE_COLORS = ["#00C897", "#00C8FF", "#FF5E7A", "#9B87F5", "#F0A500", "#8899B4"];
function KpiMonitor({
  label,
  value,
  tone,
  pulse
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl p-4 relative overflow-hidden", children: [
    pulse ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 right-2 size-2 rounded-full bg-[#FF5E7A] animate-pulse" }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-[#8899B4]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl font-semibold mt-1", style: { color: tone ?? "#E8EDF5" }, children: value })
  ] });
}
function SeverityBadge({ severity }) {
  const map = {
    INFO: "bg-[#00C897]/20 text-[#00C897] border-[#00C897]/30",
    WARNING: "bg-[#F0A500]/20 text-[#F0A500] border-[#F0A500]/30",
    ERROR: "bg-[#FF5E7A]/20 text-[#FF5E7A] border-[#FF5E7A]/30",
    CRITICAL: "bg-[#FF5E7A]/30 text-[#FF5E7A] border-[#FF5E7A]/50 animate-pulse"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-[10px] font-mono", map[severity] ?? map.INFO), children: severity });
}
function DiffModal({
  registro,
  open,
  onClose
}) {
  if (!registro) return null;
  const entries = Object.entries(registro.diffJsonb ?? {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl bg-[#0D1525] border-white/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-[#E8EDF5]", children: "Comparación de cambios" }) }),
    entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs text-[#8899B4] overflow-auto max-h-96 p-3 rounded-lg bg-black/30", children: JSON.stringify(registro.detalleJsonb ?? {}, null, 2) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#FF5E7A] mb-2 font-medium", children: "VALORES ANTERIORES" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: entries.map(([key, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-[#FF5E7A]/10 border border-[#FF5E7A]/20 p-2 text-xs font-mono", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#8899B4]", children: [
            key,
            ": "
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#E8EDF5]", children: JSON.stringify(val.old) })
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#00C897] mb-2 font-medium", children: "VALORES NUEVOS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: entries.map(([key, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-[#00C897]/10 border border-[#00C897]/20 p-2 text-xs font-mono", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#8899B4]", children: [
            key,
            ": "
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#E8EDF5]", children: JSON.stringify(val.new) })
        ] }, key)) })
      ] })
    ] })
  ] }) });
}
function RegistroCard({
  registro,
  expanded,
  onToggle,
  onDiff
}) {
  const accionColor = ACCION_COLOR[registro.accion] ?? "#8899B4";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden",
      style: { borderLeftWidth: 3, borderLeftColor: accionColor },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onToggle, className: "w-full text-left p-3 hover:bg-white/[0.02]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SeverityBadge, { severity: String(registro.severity) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-[#8899B4]", children: new Date(registro.createdAt).toLocaleTimeString("es-PE") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-[#E8EDF5] truncate", children: registro.usuarioEmail ?? "Sistema" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", style: { color: accionColor, borderColor: `${accionColor}40` }, children: registro.accion }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] border-white/10 text-[#00C8FF]", children: registro.modulo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4] mt-1", children: [
            registro.accion,
            " en ",
            registro.tablaAfectada,
            registro.rucAfectado ? ` · RUC ${registro.rucAfectado}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-2 text-[#8899B4]", children: [
            expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", children: [
              "Registro: ",
              registro.registroId.slice(0, 12),
              "…"
            ] })
          ] })
        ] }),
        expanded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-3 border-t border-white/[0.05] pt-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs border-white/10", onClick: onDiff, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3 mr-1" }),
            "Ver diff"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-[10px] font-mono text-[#8899B4] bg-black/20 rounded-lg p-2 overflow-auto max-h-40", children: JSON.stringify(registro.detalleJsonb ?? {}, null, 2) })
        ] }) : null
      ]
    }
  );
}
function AuditoriaPremiumPanel() {
  const [filters, setFilters] = reactExports.useState({ pagina: 1, limit: 50 });
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [diffRegistro, setDiffRegistro] = reactExports.useState(null);
  const [showAlerts, setShowAlerts] = reactExports.useState(true);
  const dashboard = useAuditoriaDashboard();
  const registros = useAuditoriaRegistros(filters);
  const resumen = useAuditoriaResumen();
  const alertas = useAlertasAuditoria(true);
  const detectMut = useEjecutarDeteccionPatrones();
  const resolveMut = useResolverAlerta();
  const chartModulo = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const r of resumen.data ?? []) {
      map.set(r.modulo, (map.get(r.modulo) ?? 0) + r.totalOperaciones);
    }
    return [...map.entries()].map(([modulo, total]) => ({ modulo, total }));
  }, [resumen.data]);
  const chartAccion = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const r of resumen.data ?? []) {
      map.set(r.accion, (map.get(r.accion) ?? 0) + r.totalOperaciones);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [resumen.data]);
  const hourlyData = reactExports.useMemo(() => {
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
  const handleExport = async (formato) => {
    try {
      await descargarAuditoria(filters, formato);
      toast.success(`Exportación ${formato} completada`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al exportar");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[calc(100vh-8rem)] rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#060B14] to-[#080E1E] p-4 md:p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-[#00C8FF]/20 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-xl text-[#E8EDF5] flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-5 text-[#00C8FF]" }),
          "Centro de Control de Auditoría"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-1", children: "Monitoreo regulatorio · Actualización cada 30s" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "border-white/10",
            disabled: detectMut.isPending,
            onClick: async () => {
              const n = await detectMut.mutateAsync();
              toast.success(`${n.length} alerta(s) generada(s)`);
            },
            children: [
              detectMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4 mr-1" }),
              "Detectar patrones"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-[#C8A44D] text-black hover:bg-[#C8A44D]/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4 mr-1" }),
            "Exportar"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => void handleExport("PDF"), children: "PDF formal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => void handleExport("CSV"), children: "CSV (UTF-8)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => void handleExport("EXCEL"), children: "Excel" })
          ] })
        ] })
      ] })
    ] }),
    dashboard.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 rounded-xl" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiMonitor, { label: "Acciones hoy", value: dashboard.data?.accionesHoy ?? 0, tone: "#00C897" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiMonitor, { label: "Usuarios activos", value: dashboard.data?.usuariosActivos ?? 0, tone: "#00C8FF" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiMonitor,
        {
          label: "Alertas activas",
          value: dashboard.data?.alertasActivas ?? 0,
          tone: "#FF5E7A",
          pulse: (dashboard.data?.alertasActivas ?? 0) > 0
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiMonitor, { label: "Módulos activos", value: dashboard.data?.modulosActivos ?? 0, tone: "#9B87F5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiMonitor, { label: "Sistema", value: estadoLabel, tone: estadoColor })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[180px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8899B4]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Buscar en registros...",
            className: "pl-9 bg-white/[0.03] border-white/[0.08]",
            onChange: (e) => setFilters((f) => ({ ...f, busqueda: e.target.value, pagina: 1 }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: (v) => setFilters((f) => ({ ...f, modulo: v === "ALL" ? void 0 : v, pagina: 1 })), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px] bg-white/[0.03] border-white/[0.08]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Módulo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ALL", children: "Todos" }),
          MODULOS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: (v) => setFilters((f) => ({ ...f, accion: v === "ALL" ? void 0 : v, pagina: 1 })), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px] bg-white/[0.03] border-white/[0.08]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Acción" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ALL", children: "Todas" }),
          ACCIONES.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: a }, a))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: (v) => setFilters((f) => ({ ...f, severity: v === "ALL" ? void 0 : v, pagina: 1 })), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[130px] bg-white/[0.03] border-white/[0.08]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Severidad" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ALL", children: "Todas" }),
          SEVERIDADES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-[#8899B4] uppercase tracking-wider", children: [
          "Registros (",
          registros.data?.total ?? 0,
          ")"
        ] }),
        registros.isLoading ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-xl" }, i)) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          (registros.data?.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            RegistroCard,
            {
              registro: r,
              expanded: expandedId === r.id,
              onToggle: () => setExpandedId(expandedId === r.id ? null : r.id),
              onDiff: () => setDiffRegistro(r)
            },
            r.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                disabled: (filters.pagina ?? 1) <= 1,
                onClick: () => setFilters((f) => ({ ...f, pagina: Math.max((f.pagina ?? 1) - 1, 1) })),
                children: "Anterior"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[#8899B4] self-center", children: [
              "Pág. ",
              filters.pagina ?? 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setFilters((f) => ({ ...f, pagina: (f.pagina ?? 1) + 1 })),
                children: "Siguiente"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        showAlerts ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-[#E8EDF5] flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4 text-[#F0A500]" }),
              "Alertas (",
              alertas.data?.length ?? 0,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs", onClick: () => setShowAlerts(false), children: "Ocultar" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: (alertas.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: "Sin alertas activas" }) : (alertas.data ?? []).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg border border-white/[0.06] p-2 text-xs",
              style: { borderLeftWidth: 3, borderLeftColor: a.severidad === "CRITICAL" || a.severidad === "ERROR" ? "#FF5E7A" : "#F0A500" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-[#E8EDF5]", children: a.titulo }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] mt-0.5", children: a.descripcion }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-6 mt-1 text-[#00C897] px-0",
                    disabled: resolveMut.isPending,
                    onClick: async () => {
                      await resolveMut.mutateAsync(a.id);
                      toast.success("Alerta resuelta");
                    },
                    children: "Resolver"
                  }
                )
              ]
            },
            a.id
          )) })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[#8899B4] mb-2", children: "Actividad por módulo (24h)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 140, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartModulo, layout: "vertical", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "#1A2740", horizontal: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", stroke: "#8899B4", tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "modulo", stroke: "#8899B4", tick: { fontSize: 9 }, width: 70 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #ffffff10" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "total", fill: "#00C8FF", radius: 4 })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[#8899B4] mb-2", children: "Por tipo de acción" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 120, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: chartAccion, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 45, label: false, children: chartAccion.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #ffffff10" } })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[#8899B4] mb-2", children: "Actividad por hora" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 100, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: hourlyData, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "ops", stroke: "#00C897", strokeWidth: 2, dot: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "hora", stroke: "#8899B4", tick: { fontSize: 8 }, interval: 3 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #ffffff10" } })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DiffModal, { registro: diffRegistro, open: !!diffRegistro, onClose: () => setDiffRegistro(null) })
  ] });
}
function AdminAuditoriaPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuditoriaPremiumPanel, {});
}
export {
  AdminAuditoriaPage as component
};
