import { L as jsxRuntimeExports, U as reactExports } from "./server-C-mhO3-H.js";
import { L as Label } from "./label-gGZxLhmE.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-CQ8u9WfV.js";
import { m as useContribuyentes } from "./use-contribuyentes-RfU6S4og.js";
import { B as Badge } from "./badge-CC3AGnGW.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { B as Building2 } from "./building-2-CmiHWfC1.js";
import { a as createLucideIcon } from "./index-BCXce4eP.js";
import { S as ShieldAlert } from "./shield-alert-DhpaJisv.js";
import { S as Shield } from "./shield-5qqZO4k4.js";
import { C as CircleCheck } from "./circle-check-Dtnm8Yzb.js";
import { B as Button } from "./button-CL2ribwv.js";
import { P as Progress } from "./progress-o_Jb0X7-.js";
import { L as LoaderCircle } from "./loader-circle-D1aoR-eb.js";
import { T as TriangleAlert } from "./triangle-alert-DNyNSMGi.js";
import { R as RefreshCw } from "./refresh-cw-C-qHpEi1.js";
import { B as BookOpen } from "./book-open-CGYoIsaj.js";
import { S as Scale } from "./scale-Ca3znwPN.js";
import { I as Info } from "./info-DIRMoZrE.js";
import { u as useQuery } from "./useQuery-0d8p6ted.js";
import { ac as supabase, ad as throwIfSupabaseError } from "./router-CQNpPKTf.js";
import { C as CircleAlert } from "./circle-alert-2akrATqN.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BTHtlONk.js";
import "./Combination-0mr5ceEx.js";
import "./chevron-up-0ttd7T5h.js";
import "./contribuyentes-service-ZRfErUKW.js";
import "./http-client-BAKcXjQw.js";
const __iconNode$2 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode);
const GLASS$1 = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
function useClientMounted$1() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function formatDate(iso, mounted) {
  if (!iso || !mounted) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Lima"
    }).format(new Date(iso.includes("T") ? iso : `${iso}T12:00:00`));
  } catch {
    return iso;
  }
}
function CondicionDomicilioBadge({ condicion }) {
  const normalized = (condicion ?? "").toUpperCase();
  const habido = normalized.includes("HABIDO") && !normalized.includes("NO");
  if (!condicion) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-slate-600 text-slate-400", children: "Sin condición" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Badge,
    {
      variant: "outline",
      className: cn(
        "font-semibold tracking-wide",
        habido ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-red-500/50 bg-red-500/15 text-red-300"
      ),
      children: habido ? "HABIDO" : "NO HABIDO"
    }
  );
}
function RegimenBadge({ regimen }) {
  if (!regimen) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-slate-600 text-slate-400", children: "Régimen N/D" });
  }
  const colors = {
    NRUS: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    RER: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    RMT: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    RG: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
  };
  const labels = {
    NRUS: "Nuevo RUS",
    RER: "RER",
    RMT: "RMT",
    RG: "Régimen General"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("font-medium", colors[regimen]), children: labels[regimen] });
}
function EstadoContribuyenteBadge({ estado }) {
  const u = (estado ?? "").toUpperCase();
  const activo = u.includes("ACTIV") && !u.includes("INACTIV");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Badge,
    {
      variant: "outline",
      className: cn(
        activo ? "border-emerald-500/40 text-emerald-300" : "border-slate-500/40 text-slate-400"
      ),
      children: estado ?? "Sin estado SUNAT"
    }
  );
}
function FichaRucCard({ contribuyente, className }) {
  const mounted = useClientMounted$1();
  const ubicacion = [contribuyente.distrito, contribuyente.provincia, contribuyente.departamento].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: cn(GLASS$1, "overflow-hidden", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "border-b border-slate-800/80 bg-gradient-to-r from-emerald-950/40 to-slate-900/40 px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-emerald-400/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-widest", children: "Ficha RUC — Profiling" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold leading-tight text-slate-50 sm:text-2xl", children: contribuyente.razonSocial }),
          contribuyente.nombreComercial && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: contribuyente.nombreComercial })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-emerald-400/80", children: "RUC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-lg font-bold text-emerald-300", children: contribuyente.ruc })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CondicionDomicilioBadge, { condicion: contribuyente.condicionDomicilio }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EstadoContribuyenteBadge, { estado: contribuyente.estadoContribuyente }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RegimenBadge, { regimen: contribuyente.codigoRegimen }),
        contribuyente.esBuenContribuyente && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-emerald-400/40 text-emerald-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mr-1 size-3" }),
          " Buen Contribuyente"
        ] }),
        contribuyente.esAgenteRetencion && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-amber-400/40 text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mr-1 size-3" }),
          " Agente Retención"
        ] }),
        contribuyente.esAgentePercepcion && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-orange-400/40 text-orange-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "mr-1 size-3" }),
          " Agente Percepción"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoTile,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4 text-emerald-400" }),
          label: "Domicilio fiscal",
          value: contribuyente.direccionFiscal ?? "—",
          sub: ubicacion || void 0
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoTile,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-4 text-emerald-400" }),
          label: "Inicio actividades",
          value: formatDate(contribuyente.fechaInicioActividades, mounted)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoTile,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 text-emerald-400" }),
          label: "Actividad principal",
          value: contribuyente.actividadEconomicaPrincipal ?? "—"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoTile,
        {
          label: "Sistema emisión",
          value: contribuyente.sistemaEmision ?? "—"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoTile,
        {
          label: "Sistema contabilidad",
          value: contribuyente.sistemaContabilidad ?? "—"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoTile,
        {
          label: "Ubigeo",
          value: contribuyente.ubigeo ?? "—"
        }
      )
    ] }),
    (contribuyente.anexos.length > 0 || contribuyente.representantes.length > 0 || contribuyente.tributos.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "grid gap-4 border-t border-slate-800/80 px-6 py-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CountPill, { label: "Anexos", count: contribuyente.anexos.length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CountPill, { label: "Representantes", count: contribuyente.representantes.length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CountPill, { label: "Tributos", count: contribuyente.tributos.length })
    ] })
  ] });
}
function InfoTile({
  icon,
  label,
  value,
  sub
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-800/60 bg-slate-950/40 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium uppercase tracking-wide text-slate-500", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-200", children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: sub })
  ] });
}
function CountPill({ label, count }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/30 px-4 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold text-emerald-400", children: count })
  ] });
}
function FichaRucCardSkeleton({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS$1, "animate-pulse p-6", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 h-6 w-1/3 rounded bg-slate-800" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 h-8 w-2/3 rounded bg-slate-800" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 h-4 w-1/2 rounded bg-slate-800" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 rounded-xl bg-slate-800/80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 rounded-xl bg-slate-800/80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 rounded-xl bg-slate-800/80" })
    ] })
  ] });
}
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
function useClientMounted() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function formatSoles(amount, mounted) {
  if (!mounted) return "S/ —";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0
  }).format(amount);
}
function formatUit(value, mounted) {
  if (!mounted) return "— UIT";
  return `${value.toLocaleString("es-PE", { maximumFractionDigits: 2 })} UIT`;
}
function formatoLabel(formato) {
  switch (formato) {
    case "FORMATO_5_2_SIMPLIFICADO":
      return "Formato 5.2 — Libro Diario Simplificado";
    case "FORMATO_5_1_DIARIO":
      return "Formato 5.1 — Libro Diario Completo";
    case "NO_APLICA":
      return "No aplica (Régimen simplificado)";
    default:
      return formato;
  }
}
function formatoBadgeClass(formato) {
  switch (formato) {
    case "FORMATO_5_2_SIMPLIFICADO":
      return "border-emerald-500/50 bg-emerald-500/15 text-emerald-300";
    case "FORMATO_5_1_DIARIO":
      return "border-sky-500/50 bg-sky-500/15 text-sky-300";
    case "NO_APLICA":
      return "border-slate-500/50 bg-slate-500/15 text-slate-400";
    default:
      return "border-slate-600 text-slate-300";
  }
}
function UmbralBar({ label, value, max, threshold, mounted, accentClass }) {
  const pct = mounted ? Math.min(100, value / max * 100) : 0;
  const thresholdPct = threshold / max * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-slate-400", children: mounted ? `${threshold} UIT` : "— UIT" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: pct, className: cn("h-2.5 bg-slate-800/80", accentClass) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-0 h-2.5 w-0.5 bg-white/60",
          style: { left: `${thresholdPct}%` },
          title: `Umbral ${threshold} UIT`
        }
      )
    ] })
  ] });
}
function LibrosObligadosWidget({
  profiling,
  isLoading,
  isError,
  errorMessage,
  onRefresh,
  isRefreshing,
  className
}) {
  const mounted = useClientMounted();
  const maxUit = profiling?.umbralesUit.completo ?? 1700;
  const ingresosUit = profiling?.ingresosBrutosUit ?? 0;
  const librosDestacados = reactExports.useMemo(
    () => profiling?.librosObligados.filter((l) => l.destacado) ?? [],
    [profiling?.librosObligados]
  );
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "flex items-center justify-center gap-3 p-12", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin text-emerald-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-400", children: "Evaluando libros obligados SUNAT…" })
    ] });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-6", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 text-red-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 size-5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Error al evaluar profiling" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-400", children: errorMessage ?? "Intente nuevamente." })
        ] })
      ] }),
      onRefresh && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "mt-4 border-slate-700 text-slate-300",
          onClick: onRefresh,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 size-4" }),
            " Reintentar"
          ]
        }
      )
    ] });
  }
  if (!profiling) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-8 text-center text-slate-500", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "mx-auto mb-3 size-8 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Seleccione un contribuyente para evaluar libros obligados." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn(GLASS, "overflow-hidden", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "size-5 text-emerald-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-100", children: "Libros Obligatorios SUNAT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
            "Ejercicio ",
            profiling.ejercicio,
            " · Tabla 8 PLE"
          ] })
        ] })
      ] }),
      onRefresh && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "text-slate-400 hover:text-emerald-300",
          onClick: onRefresh,
          disabled: isRefreshing,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("mr-2 size-4", isRefreshing && "animate-spin") }),
            "Actualizar"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs uppercase tracking-wider text-emerald-400/80", children: "Formato Libro Diario aplicable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: cn("text-sm font-medium", formatoBadgeClass(profiling.formatoLibroDiario)),
            children: formatoLabel(profiling.formatoLibroDiario)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            label: "Ingresos brutos",
            value: formatSoles(profiling.ingresosBrutosSoles, mounted),
            sub: `Ejercicio ${profiling.ejercicio}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            label: "Valor UIT",
            value: mounted ? `S/ ${profiling.uitMonto.toLocaleString("es-PE")}` : "S/ —",
            sub: "Parámetro SUNAT"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            label: "Total en UIT",
            value: formatUit(profiling.ingresosBrutosUit, mounted),
            sub: "Ingresos / UIT",
            highlight: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-slate-800/60 bg-slate-950/30 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-slate-500", children: "Progreso vs umbrales UIT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          UmbralBar,
          {
            label: "Límite Diario Simplificado (5.2)",
            value: ingresosUit,
            max: maxUit,
            threshold: profiling.umbralesUit.simplificado,
            mounted,
            accentClass: "[&>div]:bg-emerald-500"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          UmbralBar,
          {
            label: "Umbral intermedio",
            value: ingresosUit,
            max: maxUit,
            threshold: profiling.umbralesUit.intermedio,
            mounted,
            accentClass: "[&>div]:bg-amber-500"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          UmbralBar,
          {
            label: "Umbral empresa mediana/grande",
            value: ingresosUit,
            max: maxUit,
            threshold: profiling.umbralesUit.completo,
            mounted,
            accentClass: "[&>div]:bg-violet-500"
          }
        )
      ] }),
      librosDestacados.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 inline size-4" }),
        "Libro diario destacado:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: librosDestacados.map((l) => l.nombre).join(", ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: profiling.librosObligados.map((libro) => /* @__PURE__ */ jsxRuntimeExports.jsx(LibroCard, { libro, mounted }, `${libro.codigo}-${libro.nombre}`)) })
    ] })
  ] });
}
function MetricCard({
  label,
  value,
  sub,
  highlight
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "rounded-xl border p-4",
        highlight ? "border-emerald-500/30 bg-emerald-500/10" : "border-slate-800/60 bg-slate-950/40"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase tracking-wide text-slate-500", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: cn(
              "mt-1 text-lg font-bold",
              highlight ? "text-emerald-300" : "text-slate-100"
            ),
            children: value
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: sub })
      ]
    }
  );
}
function LibroCard({
  libro,
  mounted
}) {
  const isInfo = libro.codigo.startsWith("NOTA_") || libro.codigo === "INFO";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "rounded-xl border p-4 transition-colors",
        libro.destacado ? "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20" : isInfo ? "border-slate-700/50 bg-slate-950/20" : "border-slate-800/60 bg-slate-950/40 hover:border-slate-700"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              isInfo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "size-4 shrink-0 text-slate-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-4 shrink-0 text-emerald-400/80" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium text-slate-200", children: libro.nombre })
            ] }),
            libro.descripcion && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs leading-relaxed text-slate-500", children: libro.descripcion })
          ] }),
          mounted && !isInfo && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: cn(
                "shrink-0 font-mono text-[10px]",
                libro.obligatorio ? "border-emerald-500/40 text-emerald-400" : "border-slate-600 text-slate-500"
              ),
              children: libro.codigo
            }
          )
        ] }),
        libro.formatoPle && mounted && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-[10px] uppercase tracking-wider text-slate-600", children: [
          "PLE Formato ",
          libro.formatoPle
        ] })
      ]
    }
  );
}
const db = supabase;
function mapAnexo(row) {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    codigoAnexo: row.codigo_anexo,
    tipoEstablecimiento: row.tipo_establecimiento,
    direccion: row.direccion,
    departamento: row.departamento,
    provincia: row.provincia,
    distrito: row.distrito,
    estado: row.estado
  };
}
function mapRepresentante(row) {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    tipoDocumento: row.tipo_documento,
    numeroDocumento: row.numero_documento,
    nombreCompleto: row.nombre_completo,
    cargo: row.cargo,
    fechaDesde: row.fecha_desde,
    estado: row.estado
  };
}
function mapTributo(row) {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    codigoTributo: row.codigo_tributo,
    descripcionTributo: row.descripcion_tributo,
    fechaAfectacion: row.fecha_afectacion,
    estado: row.estado
  };
}
function mapIngresos(row) {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    ejercicio: row.ejercicio,
    ingresosBrutosSoles: Number(row.ingresos_brutos_soles),
    uitMonto: Number(row.uit_monto),
    ingresosBrutosUit: Number(row.ingresos_brutos_uit)
  };
}
function mapContribuyente(row, anexos, representantes, tributos, ingresos) {
  return {
    id: row.id,
    estudioId: row.estudio_id,
    ruc: row.ruc,
    razonSocial: row.razon_social,
    nombreComercial: row.nombre_comercial,
    estadoContribuyente: row.estado_contribuyente,
    condicionDomicilio: row.condicion_domicilio,
    codigoRegimen: row.codigo_regimen,
    direccionFiscal: row.direccion_fiscal,
    ubigeo: row.ubigeo,
    departamento: row.departamento,
    provincia: row.provincia,
    distrito: row.distrito,
    sistemaEmision: row.sistema_emision,
    sistemaContabilidad: row.sistema_contabilidad,
    actividadEconomicaPrincipal: row.actividad_economica_principal,
    fechaInicioActividades: row.fecha_inicio_actividades,
    esAgenteRetencion: row.es_agente_retencion,
    esAgentePercepcion: row.es_agente_percepcion,
    esBuenContribuyente: row.es_buen_contribuyente,
    estado: row.estado,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    anexos,
    representantes,
    tributos,
    ingresosAnuales: ingresos
  };
}
function mapProfilingResult(row) {
  const libros = (row.libros_obligados ?? []).map((l) => ({
    codigo: l.codigo,
    nombre: l.nombre,
    obligatorio: l.obligatorio,
    formatoPle: l.formato_ple,
    descripcion: l.descripcion,
    destacado: l.destacado
  }));
  return {
    contribuyenteId: row.contribuyente_id,
    ruc: row.ruc,
    razonSocial: row.razon_social,
    ejercicio: row.ejercicio,
    codigoRegimen: row.codigo_regimen,
    estadoContribuyente: row.estado_contribuyente,
    condicionDomicilio: row.condicion_domicilio,
    ingresosBrutosSoles: Number(row.ingresos_brutos_soles ?? 0),
    uitMonto: Number(row.uit_monto),
    ingresosBrutosUit: Number(row.ingresos_brutos_uit ?? 0),
    formatoLibroDiario: row.formato_libro_diario,
    umbralesUit: row.umbrales_uit ?? { simplificado: 300, intermedio: 500, completo: 1700 },
    librosObligados: libros,
    evaluadoAt: row.evaluado_at
  };
}
async function fetchProfilingRuc(contribuyenteId, ejercicio) {
  const { data, error } = await db.rpc("fn_evaluar_libros_obligados", {
    p_contribuyente_id: contribuyenteId,
    p_ejercicio: ejercicio
  });
  throwIfSupabaseError(error, "Error al evaluar libros obligados");
  if (!data) {
    throw new Error("La evaluación de profiling no devolvió resultados");
  }
  return mapProfilingResult(data);
}
async function fetchContribuyenteById(contribuyenteId) {
  const { data: row, error } = await supabase.from("contribuyentes").select("*").eq("id", contribuyenteId).maybeSingle();
  throwIfSupabaseError(error, "Error al cargar contribuyente");
  if (!row) return null;
  const typedRow = row;
  const [anexosRes, reprRes, tribRes, ingRes] = await Promise.all([
    db.from("contribuyente_anexos").select("*").eq("contribuyente_id", contribuyenteId).order("codigo_anexo"),
    db.from("contribuyente_representantes").select("*").eq("contribuyente_id", contribuyenteId).order("nombre_completo"),
    db.from("contribuyente_tributos").select("*").eq("contribuyente_id", contribuyenteId).order("codigo_tributo"),
    db.from("contribuyente_ingresos_anuales").select("*").eq("contribuyente_id", contribuyenteId).order("ejercicio", { ascending: false })
  ]);
  throwIfSupabaseError(anexosRes.error, "Error al cargar anexos");
  throwIfSupabaseError(reprRes.error, "Error al cargar representantes");
  throwIfSupabaseError(tribRes.error, "Error al cargar tributos");
  throwIfSupabaseError(ingRes.error, "Error al cargar ingresos anuales");
  return mapContribuyente(
    typedRow,
    (anexosRes.data ?? []).map((r) => mapAnexo(r)),
    (reprRes.data ?? []).map((r) => mapRepresentante(r)),
    (tribRes.data ?? []).map((r) => mapTributo(r)),
    (ingRes.data ?? []).map((r) => mapIngresos(r))
  );
}
async function fetchContribuyenteByRuc(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  if (clean.length !== 11) return null;
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente por RUC");
  if (!data?.id) return null;
  return fetchContribuyenteById(data.id);
}
function mapEstudio(row) {
  return {
    id: row.id,
    ruc: row.ruc,
    razonSocial: row.razon_social,
    nombreComercial: row.nombre_comercial,
    estado: row.estado,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
async function fetchEstudiosForCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await db.from("estudio_usuarios").select(
    "id, estudio_id, user_id, rol, activo, estudios_contables(id, ruc, razon_social, nombre_comercial, estado, created_at, updated_at)"
  ).eq("user_id", user.id).eq("activo", true);
  throwIfSupabaseError(error, "Error al cargar estudios del usuario");
  return (data ?? []).map((row) => {
    const estudioRaw = row.estudios_contables;
    const estudioRow = Array.isArray(estudioRaw) ? estudioRaw[0] : estudioRaw;
    return {
      id: row.id,
      estudioId: row.estudio_id,
      userId: row.user_id,
      rol: row.rol,
      activo: row.activo,
      estudio: estudioRow ? mapEstudio(estudioRow) : void 0
    };
  });
}
const profilingQueryKeys = {
  all: ["profiling"],
  contribuyente: (id) => ["profiling", "contribuyente", id],
  contribuyenteRuc: (ruc) => ["profiling", "contribuyente-ruc", ruc],
  evaluacion: (contribuyenteId, ejercicio) => ["profiling", "evaluacion", contribuyenteId, ejercicio],
  estudios: () => ["profiling", "estudios"],
  uit: (ejercicio) => ["profiling", "uit", ejercicio]
};
function useEstudiosUsuario() {
  return useQuery({
    queryKey: profilingQueryKeys.estudios(),
    queryFn: fetchEstudiosForCurrentUser,
    staleTime: 10 * 6e4
  });
}
function useContribuyenteByRucProfiling(ruc) {
  return useQuery({
    queryKey: profilingQueryKeys.contribuyenteRuc(ruc),
    queryFn: () => fetchContribuyenteByRuc(ruc),
    enabled: !!ruc?.trim() && ruc.replace(/\D/g, "").length === 11,
    staleTime: 5 * 6e4
  });
}
function useProfilingRuc(contribuyenteId, ejercicio) {
  return useQuery({
    queryKey: profilingQueryKeys.evaluacion(contribuyenteId, ejercicio),
    queryFn: () => fetchProfilingRuc(contribuyenteId, ejercicio),
    enabled: !!contribuyenteId?.trim() && ejercicio >= 2e3,
    staleTime: 2 * 6e4,
    refetchOnWindowFocus: true
  });
}
const EJERCICIOS = [2026, 2025, 2024, 2023];
function ProfilingPage() {
  const {
    contribuyentes,
    loading: loadingContribuyentes
  } = useContribuyentes();
  const {
    data: estudios,
    isLoading: loadingEstudios
  } = useEstudiosUsuario();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [ejercicio, setEjercicio] = reactExports.useState(2026);
  const options = reactExports.useMemo(() => contribuyentes.filter((c) => c.ruc?.trim()).map((c) => ({
    ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
    label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`
  })), [contribuyentes]);
  const {
    data: contribuyente,
    isLoading: loadingContrib,
    isError: errorContrib,
    error: contribError
  } = useContribuyenteByRucProfiling(selectedRuc || null);
  const {
    data: profiling,
    isLoading: loadingProfiling,
    isError: errorProfiling,
    error: profilingError,
    refetch: refetchProfiling,
    isFetching: fetchingProfiling
  } = useProfilingRuc(contribuyente?.id ?? null, ejercicio);
  const estudioActivo = estudios?.[0]?.estudio;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-4 md:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Profiling RUC & Libros Obligatorios" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Evaluación multi-tenant de régimen tributario, ingresos en UIT y libros contables SUNAT (Tabla 8)." }),
      estudioActivo && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Estudio: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-emerald-600", children: estudioActivo.razonSocial }),
        " · ",
        "RUC estudio ",
        estudioActivo.ruc
      ] }),
      loadingEstudios && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 animate-spin" }),
        " Cargando membresía de estudio…"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[280px] flex-1 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profiling-ruc", children: "Contribuyente (RUC)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedRuc || void 0, onValueChange: setSelectedRuc, disabled: loadingContribuyentes, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "profiling-ruc", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione un contribuyente…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.ruc, children: o.label }, o.ruc)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-40 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profiling-ejercicio", children: "Ejercicio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(ejercicio), onValueChange: (v) => setEjercicio(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "profiling-ejercicio", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EJERCICIOS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] })
      ] })
    ] }),
    !selectedRuc && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground", children: "Seleccione un contribuyente para ver la ficha RUC enriquecida y la evaluación de libros obligados." }),
    selectedRuc && loadingContrib && /* @__PURE__ */ jsxRuntimeExports.jsx(FichaRucCardSkeleton, {}),
    selectedRuc && errorContrib && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 size-5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No se pudo cargar el contribuyente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-80", children: contribError?.message ?? "Verifique permisos RLS y membresía de estudio." })
      ] })
    ] }),
    contribuyente && /* @__PURE__ */ jsxRuntimeExports.jsx(FichaRucCard, { contribuyente }),
    selectedRuc && contribuyente && /* @__PURE__ */ jsxRuntimeExports.jsx(LibrosObligadosWidget, { profiling, isLoading: loadingProfiling, isError: errorProfiling, errorMessage: profilingError?.message, onRefresh: () => void refetchProfiling(), isRefreshing: fetchingProfiling })
  ] });
}
export {
  ProfilingPage as component
};
