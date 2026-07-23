import { L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { l as useWidgetDashboard, h as usePersonalMetrics, F as Flame, g as getEfectividadColor } from "./contador-dashboard-premium-Bi3oSjGA.js";
import { D as DashboardKpiCard } from "./use-admin-metrics-Bi0FrkKI.js";
import { a as useAlertSystem } from "./use-alert-system-CNGxyNGL.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-CUz5JvIg.js";
import "./index-CwvZaaA2.js";
import "./utils-8RO4xBwZ.js";
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
const KPI_DEFS = {
  clientes: {
    label: "Clientes asignados",
    getValue: (m) => m.clientesAsignados,
    getColor: () => "#60A5FA"
  },
  tareas: {
    label: "Tareas pendientes",
    getValue: (m) => m.tareasPendientes,
    getSublabel: (m) => m.tareasVencidas ? `${m.tareasVencidas} vencidas 🔴` : void 0,
    getColor: () => "#00D4FF"
  },
  vencidas: {
    label: "Tareas vencidas",
    getValue: (m) => m.tareasVencidas,
    getColor: (m) => m.tareasVencidas ? "var(--color-urgencia-vencida, #FF0000)" : "#00C897",
    pulse: (m) => m.tareasVencidas > 0,
    onClick: true
  },
  efectividad: {
    label: "Efectividad",
    getValue: (m) => `${m.efectividad}%`,
    getSublabel: (m, umbrales) => m.efectividad >= umbrales.efectividad_excelente ? "⭐ Excelente" : void 0,
    getColor: (m, _a, umbrales) => getEfectividadColor(m.efectividad, umbrales)
  },
  racha: {
    label: "Días productivos",
    getValue: (m) => m.rachaDiasProductivos,
    getSublabel: () => "🔥 racha actual",
    getColor: () => "var(--color-urgencia-hoy, #FF6B00)"
  },
  facturacion: {
    label: "Asientos del mes",
    getValue: (m) => m.asientosDelMes,
    getColor: () => "#C8A95A"
  }
};
function KpiCardsWidget() {
  const { umbrales, colores, kpisVisibles, refreshInterval } = useWidgetDashboard();
  const metrics = usePersonalMetrics(true, refreshInterval);
  const { setFabDrawerOpen } = useAlertSystem();
  const m = metrics.data;
  const visible = kpisVisibles.filter((id) => KPI_DEFS[id]);
  if (!visible.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4", children: [
    visible.map((id) => {
      const def = KPI_DEFS[id];
      const umbralesLocal = umbrales;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        DashboardKpiCard,
        {
          label: def.label,
          value: m ? def.getValue(m) : "—",
          sublabel: m && def.getSublabel ? def.getSublabel(m, umbralesLocal) : void 0,
          accentColor: m ? def.getColor(m, colores.acento, umbralesLocal) : colores.acento,
          loading: metrics.isLoading,
          pulse: m && def.pulse ? def.pulse(m) : false,
          onClick: def.onClick ? () => setFabDrawerOpen(true) : void 0
        },
        id
      );
    }),
    visible.includes("racha") && m && m.rachaDiasProductivos > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { "aria-hidden": true }) })
  ] });
}
export {
  KpiCardsWidget,
  KpiCardsWidget as default
};
