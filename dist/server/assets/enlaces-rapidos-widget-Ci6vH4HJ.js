import { L as jsxRuntimeExports } from "./server-B74aIV_r.js";
import { L as Link } from "./router-CrYSg7RR.js";
import { B as Button } from "./button-DcgiDsFB.js";
import { l as useWidgetDashboard } from "./contador-dashboard-premium-BKE6RJ8a.js";
import { a as DashboardSection } from "./use-admin-metrics-C2x2ge2y.js";
import { L as Link2 } from "./link-2-BrIGok-G.js";
import { L as LayoutDashboard } from "./layout-dashboard-PmxHr8aY.js";
import { F as FileSpreadsheet } from "./file-spreadsheet-BLb6EhdA.js";
import { C as ClipboardList } from "./clipboard-list-CuSEgXep.js";
import { B as BookOpen } from "./book-open-DELGb90i.js";
import { W as Wallet } from "./wallet-D2Fh-mBW.js";
import { a as createLucideIcon } from "./index-50tj4GHC.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-CTHvZg_s.js";
import "./useQuery-BketnMI0.js";
import "./triangle-alert-DsyoFUlL.js";
import "./skeleton-BCPdwz-t.js";
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
