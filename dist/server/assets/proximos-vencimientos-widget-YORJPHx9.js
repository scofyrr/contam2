import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { L as Link } from "./router-B2fOVgbK.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { l as useWidgetDashboard, i as useProximosVencimientos } from "./contador-dashboard-premium-DdsDsuUk.js";
import { a as DashboardSection } from "./use-admin-metrics-DcSELLQl.js";
import { a as createLucideIcon } from "./index-CWutStw1.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./button-OKRTDzrH.js";
import "./use-estudio-config-DxZZzsuV.js";
import "./useQuery-BWRVlDqX.js";
import "./triangle-alert-n38mPMK9.js";
import "./progress-C9Z_U5y-.js";
import "./sparkles-DUxBT6bb.js";
import "./refresh-cw-CZupm7dT.js";
import "./trending-up-H7BEnUdg.js";
import "./trending-down-B-hiFKmE.js";
import "./auditoria-service-_uxRL405.js";
import "./rbac-admin-service-DF1ibFFl.js";
import "./notification-dual-service-Bq0t1Kn4.js";
import "./notification-service-C10oxyNg.js";
import "./tareas-service-Co1DUort.js";
import "./contribuyentes-service-BLWdN8Z5.js";
import "./http-client-B_ATtUrg.js";
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
