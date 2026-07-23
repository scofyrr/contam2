import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { l as useWidgetDashboard, c as useClientesAsignados } from "./contador-dashboard-premium-BbOb-YY5.js";
import { a as DashboardSection } from "./use-admin-metrics-D4IAiCAl.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { U as Users } from "./users-BtKe7stZ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-CAvVOLL8.js";
import "./index-Do_kSTPt.js";
import "./use-estudio-config-a6Rlcfnu.js";
import "./useQuery-CNpr8Hir.js";
import "./router-BRL0s0LD.js";
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
function ClientesGraficoWidget() {
  const { config, colores, refreshInterval } = useWidgetDashboard();
  const clientes = useClientesAsignados(true, refreshInterval);
  const maxClientes = config.max_clientes_grafico;
  const chart = reactExports.useMemo(
    () => [...clientes.data ?? []].sort((a, b) => b.tareasPendientes - a.tareasPendientes).slice(0, maxClientes).map((c) => ({
      nombre: c.razonSocial.slice(0, 12),
      tareas: c.tareasPendientes,
      alertas: c.alertas
    })),
    [clientes.data, maxClientes]
  );
  const maxTareas = Math.max(...chart.map((c) => c.tareas), 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DashboardSection, { title: "Mis clientes", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-[#60A5FA]" }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: chart.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-24 truncate text-[#E8EDF5] text-xs", children: c.nombre }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "h-full rounded-full",
            c.alertas > 2 ? "bg-red-500" : c.alertas > 0 ? "bg-amber-500" : "bg-emerald-500"
          ),
          style: { width: `${c.tareas / maxTareas * 100}%`, backgroundColor: c.alertas > 0 ? colores.urgencia_vencida : void 0 }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-[#8899B4] w-6 text-right", children: c.tareas })
    ] }, c.nombre)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-[#8899B4] mt-3", children: [
      "Clientes con alertas: ",
      clientes.data?.filter((c) => c.alertas > 0).length ?? 0,
      " 🔴"
    ] })
  ] });
}
export {
  ClientesGraficoWidget,
  ClientesGraficoWidget as default
};
