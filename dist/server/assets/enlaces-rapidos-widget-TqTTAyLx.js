import { L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { L as Link } from "./router-BRL0s0LD.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { l as useWidgetDashboard } from "./contador-dashboard-premium-BbOb-YY5.js";
import { a as DashboardSection } from "./use-admin-metrics-D4IAiCAl.js";
import { L as Link2 } from "./link-2-DCqYm80m.js";
import { L as LayoutDashboard } from "./layout-dashboard-DAAZoQnq.js";
import { F as FileSpreadsheet } from "./file-spreadsheet-CREGzpL3.js";
import { C as ClipboardList } from "./clipboard-list-CdNQqCZk.js";
import { B as BookOpen } from "./book-open-D_6jk-4j.js";
import { W as Wallet } from "./wallet-DnE4-A4K.js";
import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-a6Rlcfnu.js";
import "./useQuery-CNpr8Hir.js";
import "./triangle-alert-B4GeD7-7.js";
import "./skeleton-wfCnfyZT.js";
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
