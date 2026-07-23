import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { L as Link } from "./router-BRL0s0LD.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { l as useWidgetDashboard, i as useProximosVencimientos } from "./contador-dashboard-premium-BbOb-YY5.js";
import { a as DashboardSection } from "./use-admin-metrics-D4IAiCAl.js";
import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-CAvVOLL8.js";
import "./use-estudio-config-a6Rlcfnu.js";
import "./useQuery-CNpr8Hir.js";
import "./triangle-alert-B4GeD7-7.js";
import "./progress-DofMlWtS.js";
import "./sparkles-Cqd5ml8U.js";
import "./refresh-cw-CZfG2mto.js";
import "./trending-up-BUgChl3g.js";
import "./trending-down-C3E-7TSV.js";
import "./auditoria-service-DMkylvh-.js";
import "./rbac-admin-service-BZuAmbPN.js";
import "./notification-dual-service-CUxPG9KW.js";
import "./notification-service-4RfXiETS.js";
import "./tareas-service-cnCEUa8P.js";
import "./contribuyentes-service-C3l05GhV.js";
import "./http-client-BNGDvc7A.js";
const __iconNode = [
  ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
];
const CalendarClock = createLucideIcon("calendar-clock", __iconNode);
function ProximosVencimientosWidget() {
  const { umbrales, colores, refreshInterval } = useWidgetDashboard();
  const vencimientos = useProximosVencimientos(umbrales.dias_alerta_proxima + 4, true, refreshInterval);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DashboardSection,
    {
      title: "Próximos vencimientos",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "size-4", style: { color: colores.urgencia_semana } }),
      children: vencimientos.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-lg bg-white/5" }) : (vencimientos.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] text-center py-4", children: "Sin vencimientos en los próximos días" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: vencimientos.data?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center justify-between gap-2 text-sm rounded-lg border border-white/[0.06] px-3 py-2",
          style: { borderLeftWidth: 3, borderLeftColor: colores.urgencia_semana },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#E8EDF5] truncate", children: t.titulo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#8899B4]", children: t.plazo_vencimiento })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tareas", className: "text-xs shrink-0", style: { color: colores.acento }, children: "Ver →" })
          ]
        },
        t.id
      )) })
    }
  );
}
export {
  ProximosVencimientosWidget,
  ProximosVencimientosWidget as default
};
