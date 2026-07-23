import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { L as Link } from "./router-B2fOVgbK.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { l as useWidgetDashboard } from "./contador-dashboard-premium-DdsDsuUk.js";
import { a as DashboardSection } from "./use-admin-metrics-DcSELLQl.js";
import { L as Link2 } from "./link-2-CJp-d4Df.js";
import { L as LayoutDashboard } from "./layout-dashboard-BpRzHhJr.js";
import { F as FileSpreadsheet } from "./file-spreadsheet-XtgtSkqf.js";
import { C as ClipboardList } from "./clipboard-list-NC5QH_4W.js";
import { B as BookOpen } from "./book-open-DuhpnH3U.js";
import { W as Wallet } from "./wallet-ipKTTbZm.js";
import { a as createLucideIcon } from "./index-CWutStw1.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-DxZZzsuV.js";
import "./useQuery-BWRVlDqX.js";
import "./triangle-alert-n38mPMK9.js";
import "./skeleton-BhOkZDr2.js";
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
const __iconNode$1 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M9 15h6", key: "cctwl0" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }]
];
const FilePlus = createLucideIcon("file-plus", __iconNode$1);
const __iconNode = [
  [
    "path",
    { d: "M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344", key: "2acyp4" }
  ],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const SquareCheckBig = createLucideIcon("square-check-big", __iconNode);
const ICON_MAP = {
  FilePlus,
  CheckSquare: SquareCheckBig,
  Wallet,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  Link: Link2
};
function resolveIcon(name) {
  return ICON_MAP[name] ?? Link2;
}
function EnlacesRapidosWidget() {
  const { contenido, colores } = useWidgetDashboard();
  const enlaces = contenido.enlaces_rapidos ?? [];
  if (enlaces.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Enlaces rápidos", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "size-4", style: { color: colores.acento } }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: enlaces.map((e) => {
    const Icon = resolveIcon(e.icono);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: "justify-start rounded-xl border-white/10 h-9 text-xs",
        asChild: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: e.url, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3.5 mr-2", style: { color: colores.acento } }),
          e.label
        ] })
      },
      `${e.url}-${e.label}`
    );
  }) }) });
}
export {
  EnlacesRapidosWidget,
  EnlacesRapidosWidget as default
};
