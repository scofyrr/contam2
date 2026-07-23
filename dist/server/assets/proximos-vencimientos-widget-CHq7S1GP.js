import { L as jsxRuntimeExports } from "./server-B74aIV_r.js";
import { L as Link } from "./router-CrYSg7RR.js";
import { S as Skeleton } from "./skeleton-BCPdwz-t.js";
import { l as useWidgetDashboard, i as useProximosVencimientos } from "./contador-dashboard-premium-BKE6RJ8a.js";
import { a as DashboardSection } from "./use-admin-metrics-C2x2ge2y.js";
import { a as createLucideIcon } from "./index-50tj4GHC.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-DcgiDsFB.js";
import "./use-estudio-config-CTHvZg_s.js";
import "./useQuery-BketnMI0.js";
import "./triangle-alert-DsyoFUlL.js";
import "./progress-BgqTlH6N.js";
import "./sparkles-BG2_2TAg.js";
import "./refresh-cw-CQGTOcHK.js";
import "./trending-up-BeTy1HU5.js";
import "./trending-down-CXAeYcRI.js";
import "./auditoria-service-B0t2KH0O.js";
import "./rbac-admin-service-BrIYuoJa.js";
import "./notification-dual-service-C572NNAf.js";
import "./notification-service-DZ9Ax7yo.js";
import "./tareas-service-DWgOEbIt.js";
import "./contribuyentes-service-DF9FvpdK.js";
import "./http-client-i97I_bRM.js";
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
