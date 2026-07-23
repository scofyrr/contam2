import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { l as useWidgetDashboard, h as usePersonalMetrics, F as Flame, g as getEfectividadColor } from "./contador-dashboard-premium-DdsDsuUk.js";
import { D as DashboardKpiCard } from "./use-admin-metrics-DcSELLQl.js";
import { a as useAlertSystem } from "./use-alert-system-DAoaTQ3o.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-OKRTDzrH.js";
import "./index-CWutStw1.js";
import "./utils-8RO4xBwZ.js";
import "./use-estudio-config-DxZZzsuV.js";
import "./useQuery-BWRVlDqX.js";
import "./router-B2fOVgbK.js";
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
