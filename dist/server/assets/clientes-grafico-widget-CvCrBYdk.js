import { U as reactExports, L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { l as useWidgetDashboard, c as useClientesAsignados } from "./contador-dashboard-premium-Bi3oSjGA.js";
import { a as DashboardSection } from "./use-admin-metrics-Bi0FrkKI.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { U as Users } from "./users-gh0s0C-z.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-CUz5JvIg.js";
import "./index-CwvZaaA2.js";
import "./use-estudio-config-DAiXXr79.js";
import "./useQuery-yGnE4xdj.js";
import "./router-DdOnzL1Y.js";
import "./triangle-alert-D9VCCoSc.js";
import "./skeleton-DUGbHj_6.js";
import "./progress-q5m-49Oz.js";
import "./sparkles-DaRa_-zS.js";
import "./refresh-cw-B5B5xT1n.js";
import "./trending-up-BOQWNFJ6.js";
import "./trending-down-ToZW-fxx.js";
import "./auditoria-service-CmJN9UP_.js";
import "./rbac-admin-service-DNMsvS9X.js";
import "./notification-dual-service-q2OTmUpN.js";
import "./notification-service-CO-YhtRJ.js";
import "./tareas-service-CDrwsaQ5.js";
import "./contribuyentes-service-D2dNpwbB.js";
import "./http-client-h7UKjZ8s.js";
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
