import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { ai as toast } from "./router-B2oVQHub.js";
import { B as Badge } from "./badge-R7vlE0zl.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { D as DropdownMenu, e as DropdownMenuTrigger, a as DropdownMenuContent, b as DropdownMenuItem } from "./dropdown-menu-DldiR_jM.js";
import { P as Progress } from "./progress-CZqzYq6n.js";
import { S as Skeleton } from "./skeleton-BkQkQtWf.js";
import { C as Collapsible, b as CollapsibleTrigger, a as CollapsibleContent } from "./collapsible-D6gKcIxR.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { u as useUiPreferences, E as ExternalLink } from "./use-ui-preferences-Ca8ZvpEG.js";
import { u as useTraceabilityChain } from "./asiento-traceability-service-DSKGLNeL.js";
import { T as TriangleAlert } from "./triangle-alert-C9v1hrNU.js";
import { R as RefreshCw } from "./refresh-cw-Yr6mvBQG.js";
import { S as Search } from "./search-CYPX3dQn.js";
import { D as Download } from "./download-DVSNCLip.js";
import { a as ChevronUp, C as ChevronDown } from "./chevron-up-CdlYVDxF.js";
import { R as RotateCcw } from "./rotate-ccw-Dx8IZWvr.js";
import { C as ChartColumn } from "./chart-column-Brju0F3H.js";
import { a as createLucideIcon } from "./index-CE2u8TBR.js";
import { W as Wallet } from "./wallet-CSrOfDFg.js";
import { Z as Zap } from "./zap-CuymLXG_.js";
import { F as FileText } from "./file-text-CB40SY06.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Combination-zo30HTiN.js";
import "./index-CLwIwY0T.js";
import "./index-D5JWF47-.js";
import "./chevron-right-CCfweRox.js";
import "./circle-BhXUi8Gc.js";
import "./index-DDULANn3.js";
import "./useQuery-GwWd8T8C.js";
import "./sire-sync-service-FZz5qvf6.js";
import "./useMutation-DD5rBZOv.js";
import "./pcge-service-BYlxIcvs.js";
const __iconNode = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode);
function hashSimulado(chain) {
  const raw = `${chain.id}-${chain.metadata.fechaConsulta}-${chain.nodos.length}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h << 5) - h + raw.charCodeAt(i);
  return Math.abs(h).toString(16).padStart(8, "0").toUpperCase();
}
async function exportTraceabilityPdf(chain, mode = "auditoria") {
  const { jsPDF } = await import("./jspdf.es.min-BHyzubRe.js").then((n) => n.j);
  const autoTable = (await import("./jspdf.plugin.autotable-Do1qGbTG.js")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const origin = chain.nodoOrigen;
  doc.setFillColor(7, 12, 27);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(200, 169, 90);
  doc.setFontSize(14);
  doc.text("CONTAM — Trazabilidad Contable", 14, 12);
  doc.setFontSize(9);
  doc.setTextColor(232, 237, 245);
  doc.text(`${origin.metadata.serie ?? ""}-${origin.metadata.numero ?? ""} · RUC ${chain.ruc}`, 14, 20);
  doc.setTextColor(0);
  let y = 36;
  doc.setFontSize(11);
  doc.text(`Estado: ${chain.resumen.estadoActual}`, 14, y);
  y += 6;
  doc.text(`Monto original: S/ ${chain.resumen.montoOriginal.toFixed(2)}`, 14, y);
  y += 6;
  doc.text(`Completado: ${chain.resumen.porcentajeCompletado}% · ${chain.resumen.diasTranscurridos} días`, 14, y);
  y += 10;
  if (mode === "ejecutivo") {
    autoTable(doc, {
      startY: y,
      head: [["Nodo", "Fecha", "Monto", "Estado"]],
      body: chain.nodos.map((n) => [n.titulo, n.fechaFormateada, n.monto.toFixed(2), n.estado]),
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 169, 90] }
    });
  } else {
    for (const node of chain.nodos) {
      if (y > 250) {
        doc.addPage();
        y = 14;
      }
      doc.setFontSize(10);
      doc.setTextColor(0, 180, 255);
      doc.text(`${node.titulo} — ${node.fechaFormateada}`, 14, y);
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(80);
      doc.text(node.descripcion.slice(0, 90), 14, y);
      y += 5;
      doc.setTextColor(0);
      doc.text(`Monto: S/ ${node.monto.toFixed(2)} · ${node.estado}`, 14, y);
      y += 4;
      const lineas = node.metadata.lineasContables ?? [];
      if (lineas.length) {
        autoTable(doc, {
          startY: y,
          head: [["Cuenta", "Denominación", "Debe", "Haber"]],
          body: lineas.map((l) => [
            l.cuentaCodigo,
            l.cuentaDenominacion.slice(0, 30),
            l.debe > 0 ? l.debe.toFixed(2) : "",
            l.haber > 0 ? l.haber.toFixed(2) : ""
          ]),
          theme: "striped",
          styles: { fontSize: 7 },
          headStyles: { fillColor: [26, 37, 64] }
        });
        y = doc.lastAutoTable?.finalY ?? y;
        y += 6;
      } else {
        y += 4;
      }
    }
    if (chain.resumen.erroresDetectados.length) {
      if (y > 240) {
        doc.addPage();
        y = 14;
      }
      doc.setFontSize(10);
      doc.setTextColor(255, 107, 107);
      doc.text("Problemas de integridad", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Severidad", "Descripción", "Detalle"]],
        body: chain.resumen.erroresDetectados.map((e) => [e.severidad, e.descripcion, e.detalle.slice(0, 60)]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [255, 107, 107] }
      });
      y = doc.lastAutoTable?.finalY ?? y;
    }
  }
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(
    `Generado: ${(/* @__PURE__ */ new Date()).toLocaleString("es-PE")} · Hash: ${hashSimulado(chain)} · ${chain.metadata.tiempoConstruccion}ms`,
    14,
    pageH - 8
  );
  doc.save(`trazabilidad_${chain.id.slice(0, 8)}_${mode}.pdf`);
}
function exportTraceabilityCsv(chain) {
  const rows = [["Nodo", "Tipo", "Fecha", "Cuenta", "Denominación", "Debe", "Haber"]];
  for (const node of chain.nodos) {
    const lineas = node.metadata.lineasContables ?? [];
    if (!lineas.length) {
      rows.push([node.titulo, node.type, node.fechaFormateada, "", "", "", String(node.monto)]);
    } else {
      for (const l of lineas) {
        rows.push([
          node.titulo,
          node.type,
          node.fechaFormateada,
          l.cuentaCodigo,
          l.cuentaDenominacion,
          String(l.debe),
          String(l.haber)
        ]);
      }
    }
  }
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trazabilidad_${chain.id.slice(0, 8)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function exportTraceabilityJson(chain) {
  const blob = new Blob([JSON.stringify(chain, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trazabilidad_${chain.id.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
const NODE_COLORS = {
  SIRE_REGISTRO: "#00D4FF",
  PROVISION: "#C8A95A",
  MOVIMIENTO_CAJA: "#00C897",
  CANCELACION: "#FF6B6B",
  CENTRALIZACION: "#9B87F5",
  REVERSION: "#F0A500"
};
const NODE_ICONS = {
  SIRE_REGISTRO: FileText,
  PROVISION: Zap,
  MOVIMIENTO_CAJA: Wallet,
  CANCELACION: CircleCheckBig,
  CENTRALIZACION: ChartColumn,
  REVERSION: RotateCcw
};
const ESTADO_BADGE = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  PROVISIONADO: { label: "Provisionado", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  PAGADO: { label: "Pagado", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  COBRADO: { label: "Cobrado", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  PARCIAL: { label: "Parcial", className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  ANULADO: { label: "Anulado", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
};
function formatMoney(n, moneda = "PEN") {
  const sym = moneda === "USD" ? "$" : moneda === "EUR" ? "€" : "S/";
  return `${sym} ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function LineasTable({ lineas }) {
  const debe = lineas.reduce((s, l) => s + l.debe, 0);
  const haber = lineas.reduce((s, l) => s + l.haber, 0);
  const diff = Math.abs(debe - haber);
  const cuadra = diff <= 1e-3;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-white/[0.05] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-white/[0.05] text-[#8899B4] uppercase tracking-wider", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Cuenta" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Debe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Haber" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: lineas.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: cn("border-t border-white/[0.03]", i % 2 && "bg-white/[0.01]"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: l.cuentaCodigo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#8899B4] ml-2", children: l.cuentaDenominacion })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-mono text-[#00D4FF] tabular-nums", children: l.debe > 0 ? l.debe.toFixed(2) : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-mono text-[#FF6B6B] tabular-nums", children: l.haber > 0 ? l.haber.toFixed(2) : "—" })
    ] }, l.cuentaCodigo + i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("tfoot", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-[#C8A95A]/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: "Totales" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-mono text-[#00D4FF]", children: debe.toFixed(2) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-mono text-[#FF6B6B]", children: haber.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 3, className: "px-3 py-1.5 text-right text-[10px]", children: [
        "Diferencia:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-mono", cuadra ? "text-emerald-400" : "text-red-400"), children: diff.toFixed(2) })
      ] }) })
    ] })
  ] }) });
}
function NodeDetailPanel({
  node,
  darkMode,
  onNavigateNode
}) {
  const color = NODE_COLORS[node.type];
  const link = node.metadata.linkNavegacion;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "rounded-xl border backdrop-blur-md overflow-hidden animate-in slide-in-from-right-4 duration-300",
        darkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200"
      ),
      style: { borderTopWidth: 3, borderTopColor: color },
      role: "region",
      "aria-label": `Detalle: ${node.titulo}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-white/[0.05]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider", style: { color }, children: node.type.replace(/_/g, " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mt-1", children: node.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] mt-1", children: node.descripcion }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xl mt-2 tabular-nums", children: formatMoney(node.monto, node.moneda) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4 text-sm", children: [
          node.type === "SIRE_REGISTRO" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "Contraparte" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: node.metadata.nombreContraparte ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "RUC" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono", children: node.metadata.rucContraparte ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "Comprobante" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono", children: [
                node.metadata.tipoComprobante,
                "-",
                node.metadata.serie,
                "-",
                node.metadata.numero
              ] })
            ] })
          ] }),
          (node.type === "PROVISION" || node.type === "CANCELACION") && node.metadata.lineasContables && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4]", children: [
              "Asiento: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[#E8EDF5]", children: node.metadata.asientoId?.slice(0, 8) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(LineasTable, { lineas: node.metadata.lineasContables })
          ] }),
          node.type === "MOVIMIENTO_CAJA" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "Cuenta financiera" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono", children: node.metadata.cuentaFinanciera })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "Tipo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  className: node.metadata.tipoMovimiento === "INGRESO" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400",
                  children: node.metadata.tipoMovimiento
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "Origen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: node.metadata.origenDocumento })
            ] })
          ] }),
          node.type === "CENTRALIZACION" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "Movimientos agrupados" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: node.metadata.cantidadMovimientos })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-xs", children: "Período" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono", children: node.metadata.periodoCentralizado })
            ] })
          ] }),
          node.nodosParalelos?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mb-2", children: "Nodos relacionados" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: node.nodosParalelos.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", onClick: () => onNavigateNode?.(id), children: [
              id.slice(0, 12),
              "…"
            ] }, id)) })
          ] }) : null,
          link ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: link, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3.5 mr-1" }),
            "Ir al módulo"
          ] }) }) : null
        ] })
      ]
    }
  );
}
function MiniGraph({
  nodes,
  selectedId,
  onSelect
}) {
  const w = 200;
  const h = Math.min(150, nodes.length * 28 + 20);
  const step = nodes.length > 1 ? (h - 40) / (nodes.length - 1) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      width: w,
      height: h,
      className: "rounded-lg border border-white/[0.05] bg-white/[0.02]",
      role: "img",
      "aria-label": "Mini mapa de trazabilidad",
      children: nodes.map((n, i) => {
        const y = 20 + i * step;
        const x = 30;
        const selected = n.id === selectedId;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          i > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: x, y1: 20 + (i - 1) * step + 6, x2: x, y2: y - 6, stroke: "#1A2540", strokeWidth: 1.5 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "circle",
            {
              cx: x,
              cy: y,
              r: selected ? 8 : 6,
              fill: NODE_COLORS[n.type],
              opacity: selected ? 1 : 0.7,
              className: "cursor-pointer",
              onClick: () => onSelect(n.id),
              style: selected ? { filter: `drop-shadow(0 0 6px ${NODE_COLORS[n.type]})` } : void 0
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: x + 14, y: y + 4, fill: "#8899B4", fontSize: 8, className: "pointer-events-none", children: n.titulo.slice(0, 18) })
        ] }, n.id);
      })
    }
  );
}
function IntegritySection({
  issues,
  onNavigateNode
}) {
  const [ignored, setIgnored] = reactExports.useState(() => {
    try {
      const raw = localStorage.getItem("traceability-ignored-issues");
      return raw ? new Set(JSON.parse(raw)) : /* @__PURE__ */ new Set();
    } catch {
      return /* @__PURE__ */ new Set();
    }
  });
  const visible = issues.filter((i) => !ignored.has(i.id));
  if (!visible.length) return null;
  const maxSev = visible.some((i) => i.severidad === "CRITICAL") ? "CRITICAL" : visible.some((i) => i.severidad === "ERROR") ? "ERROR" : "WARNING";
  const ignoreIssue = (id) => {
    const next = new Set(ignored);
    next.add(id);
    setIgnored(next);
    localStorage.setItem("traceability-ignored-issues", JSON.stringify([...next]));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible, { defaultOpen: maxSev !== "INFO", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: cn(
          "w-full rounded-xl border p-4 flex items-center justify-between text-left transition-colors",
          maxSev === "CRITICAL" || maxSev === "ERROR" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4 text-amber-400" }),
            visible.length,
            " problema",
            visible.length !== 1 ? "s" : "",
            " de integridad detectado",
            visible.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4 text-[#8899B4]" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { className: "mt-2 space-y-2", children: visible.map((issue) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] mb-1", children: issue.severidad }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: issue.descripcion }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-1", children: issue.detalle }),
          issue.sugerenciaCorreccion ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#C8A95A] mt-1", children: issue.sugerenciaCorreccion }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs shrink-0", onClick: () => ignoreIssue(issue.id), children: "Ignorar" })
      ] }),
      issue.nodosAfectados.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: issue.nodosAfectados.map((nid) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-6 text-[10px]", onClick: () => onNavigateNode(nid), children: [
        "Nodo ",
        nid.slice(0, 8)
      ] }, nid)) }) : null
    ] }, issue.id)) })
  ] });
}
function TimelineSkeleton({ darkMode }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-6 p-6", darkMode ? "bg-[#070C1B]" : "bg-[#F8FAFC]"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: cn("h-24 rounded-xl", darkMode ? "bg-white/5" : "bg-slate-200") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: cn("size-4 rounded-full shrink-0", darkMode ? "bg-white/10" : "bg-slate-300") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: cn("h-16 flex-1 rounded-xl", darkMode ? "bg-white/5" : "bg-slate-200") })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: cn("h-64 rounded-xl", darkMode ? "bg-white/5" : "bg-slate-200") })
    ] })
  ] });
}
function AsientoTraceabilityViewerPremium({
  sireRegistroId,
  compact = false
}) {
  const { darkMode } = useUiPreferences();
  const { data: chain, isLoading, isError, error, refetch, isFetching } = useTraceabilityChain(sireRegistroId);
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const timelineRef = reactExports.useRef(null);
  const reducedMotion = reactExports.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const selectedNode = reactExports.useMemo(() => {
    if (!chain) return null;
    return chain.nodos.find((n) => n.id === selectedId) ?? chain.nodos[0] ?? null;
  }, [chain, selectedId]);
  reactExports.useEffect(() => {
    if (chain?.nodos.length && !selectedId) {
      setSelectedId(chain.nodos[0].id);
    }
  }, [chain, selectedId]);
  const selectNode = reactExports.useCallback(
    (id) => {
      setSelectedId(id);
      if (!reducedMotion) {
        document.getElementById(`trace-node-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [reducedMotion]
  );
  const bgMain = darkMode ? "bg-[#070C1B] text-[#E8EDF5]" : "bg-[#F8FAFC] text-[#1E293B]";
  const bgTimeline = darkMode ? "bg-[#0A1020]" : "bg-[#E2E8F0]/30";
  const muted = darkMode ? "text-[#8899B4]" : "text-slate-500";
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineSkeleton, { darkMode });
  if (isError || !chain) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("p-8 text-center rounded-xl border", bgMain), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-10 mx-auto text-amber-400 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Comprobante no encontrado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm mt-2", muted), children: error?.message ?? "No se pudo construir la cadena de trazabilidad" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-xs mt-4", muted), children: "Verifique el ID en Registros SIRE o sincronice con Sync SIRE." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "mt-4", onClick: () => refetch(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4 mr-2" }),
        "Reintentar"
      ] })
    ] });
  }
  const origin = chain.nodoOrigen;
  const estadoBadge = ESTADO_BADGE[chain.resumen.estadoActual] ?? ESTADO_BADGE.PENDIENTE;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("min-h-full", bgMain, compact ? "p-4" : "p-6 lg:p-8"), role: "main", "aria-label": "Trazabilidad contable", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-5 text-[#C8A95A]", "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Trazabilidad Contable" }),
        isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4 animate-spin text-[#8899B4]", "aria-label": "Actualizando" }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4 mr-2" }),
          "Exportar"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DropdownMenuItem,
            {
              onClick: () => {
                void exportTraceabilityPdf(chain, "auditoria").catch(() => toast.error("Error al exportar PDF"));
                toast.success("PDF de auditoría generado");
              },
              children: "PDF Auditoría"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DropdownMenuItem,
            {
              onClick: () => {
                void exportTraceabilityPdf(chain, "ejecutivo").catch(() => toast.error("Error al exportar PDF"));
                toast.success("PDF ejecutivo generado");
              },
              children: "PDF Ejecutivo"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DropdownMenuItem,
            {
              onClick: () => {
                exportTraceabilityCsv(chain);
                toast.success("CSV exportado");
              },
              children: "CSV Líneas Contables"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DropdownMenuItem,
            {
              onClick: () => {
                exportTraceabilityJson(chain);
                toast.success("JSON exportado");
              },
              children: "JSON Completo"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "rounded-xl border backdrop-blur-lg p-5 mb-6",
          darkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-4 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30 mb-2", children: origin.metadata.tipoComprobante }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-mono font-semibold", children: [
                origin.metadata.serie,
                "-",
                origin.metadata.numero
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("text-sm", muted), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: origin.metadata.nombreContraparte }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono", children: [
                "RUC ",
                origin.metadata.rucContraparte ?? chain.ruc
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Período ",
                chain.periodo
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-mono font-bold tabular-nums", children: formatMoney(chain.resumen.montoOriginal, origin.moneda) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cn("mt-2", estadoBadge.className), children: estadoBadge.label })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-px mt-4 bg-gradient-to-r from-[#00D4FF] via-[#C8A95A] to-transparent",
              "aria-hidden": true
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6", children: [
      { label: "Monto Total", value: formatMoney(chain.resumen.montoOriginal), border: "#C8A95A", icon: "💰" },
      { label: "Tiempo", value: `${chain.resumen.diasTranscurridos} días`, border: "#00D4FF", icon: "⏱️" },
      { label: "Completado", value: `${chain.resumen.porcentajeCompletado}%`, border: "#00C897", icon: "📊", progress: chain.resumen.porcentajeCompletado },
      { label: "Estado", value: chain.resumen.estadoActual, border: "#9B87F5", icon: "🟢" }
    ].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]",
          darkMode ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]" : "bg-white border-slate-200"
        ),
        style: { borderBottomWidth: 2, borderBottomColor: m.border },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-xs", muted), children: [
            m.icon,
            " ",
            m.label
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold mt-1 tabular-nums", children: m.value }),
          "progress" in m && m.progress !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: m.progress, className: "h-1.5 mt-2" }) : null
        ]
      },
      m.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-5 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          ref: timelineRef,
          className: cn("lg:col-span-2 rounded-xl border p-4 relative", bgTimeline, darkMode ? "border-white/[0.05]" : "border-slate-200"),
          role: "list",
          "aria-label": "Línea de tiempo",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs", onClick: () => selectNode(chain.nodos[0].id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "size-3 mr-1" }),
                "Inicio"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 text-xs",
                  onClick: () => selectNode(chain.nodos[chain.nodos.length - 1].id),
                  children: [
                    "Final",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3 ml-1" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pl-6 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#1A2540]",
                  "aria-hidden": true
                }
              ),
              chain.nodos.map((node, idx) => {
                const Icon = NODE_ICONS[node.type];
                const color = NODE_COLORS[node.type];
                const selected = node.id === selectedId;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    id: `trace-node-${node.id}`,
                    role: "listitem",
                    className: "relative flex gap-3 group",
                    style: { animationDelay: reducedMotion ? void 0 : `${idx * 150}ms` },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => selectNode(node.id),
                          className: cn(
                            "relative z-10 shrink-0 rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A95A]",
                            selected ? "size-5" : "size-4"
                          ),
                          style: {
                            borderColor: color,
                            background: `radial-gradient(circle, ${color}88, ${color}44)`,
                            boxShadow: selected ? `0 0 12px ${color}66` : void 0
                          },
                          "aria-label": `${node.titulo}, ${node.fechaFormateada}`,
                          "aria-current": selected ? "step" : void 0,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-2.5 absolute inset-0 m-auto text-white", "aria-hidden": true })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => selectNode(node.id),
                          className: cn(
                            "flex-1 text-left rounded-lg border p-3 transition-all duration-300",
                            darkMode ? "bg-white/[0.03] border-white/[0.05]" : "bg-white border-slate-200",
                            "hover:-translate-y-0.5 group-hover:border-l-4",
                            selected && "ring-1"
                          ),
                          style: {
                            borderLeftColor: selected ? color : void 0,
                            boxShadow: selected ? `0 0 20px ${color}22` : void 0
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-[10px]", muted), children: node.fechaFormateada }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: node.titulo })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm tabular-nums shrink-0", children: formatMoney(node.monto, node.moneda) })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[9px] mt-1 border-white/10", children: node.estado })
                          ]
                        }
                      )
                    ]
                  },
                  node.id
                );
              })
            ] }),
            chain.nodos.length > 5 && !compact ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden xl:block absolute -right-[220px] top-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MiniGraph, { nodes: chain.nodos, selectedId: selectedId ?? "", onSelect: selectNode }) }) : null
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3", children: selectedNode ? /* @__PURE__ */ jsxRuntimeExports.jsx(NodeDetailPanel, { node: selectedNode, darkMode, onNavigateNode: selectNode }) : null })
    ] }),
    chain.resumen.erroresDetectados.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegritySection, { issues: chain.resumen.erroresDetectados, onNavigateNode: selectNode }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-[10px] mt-6 text-center", muted), children: [
      "Consulta en ",
      chain.metadata.tiempoConstruccion,
      "ms · Fuentes: ",
      chain.metadata.fuentesConsultadas.join(", ")
    ] })
  ] });
}
export {
  AsientoTraceabilityViewerPremium as default
};
