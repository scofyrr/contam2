import { L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { P as Progress } from "./progress-q5m-49Oz.js";
import { S as Skeleton } from "./skeleton-DUGbHj_6.js";
import { l as useWidgetDashboard, d as useFacturacionMensualPersonal, T as Target } from "./contador-dashboard-premium-Bi3oSjGA.js";
import { a as DashboardSection, f as formatSoles } from "./use-admin-metrics-Bi0FrkKI.js";
import { S as Sparkles } from "./sparkles-DaRa_-zS.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./router-DdOnzL1Y.js";
import "./index-CwvZaaA2.js";
import "./utils-8RO4xBwZ.js";
import "./button-CUz5JvIg.js";
import "./use-estudio-config-DAiXXr79.js";
import "./useQuery-yGnE4xdj.js";
import "./triangle-alert-D9VCCoSc.js";
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
function diasRestantesMes() {
  const now = /* @__PURE__ */ new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.getDate() - now.getDate();
}
function MetaMensualWidget() {
  const { contenido, umbrales, refreshInterval } = useWidgetDashboard();
  const facturacion = useFacturacionMensualPersonal(true, refreshInterval);
  if (!contenido.meta_mensual_activa || contenido.meta_mensual_monto <= 0) {
    return null;
  }
  const meta = contenido.meta_mensual_monto;
  const actual = facturacion.data ?? 0;
  const porcentaje = meta > 0 ? Math.min(100, actual / meta * 100) : 0;
  const restante = Math.max(0, meta - actual);
  const color = porcentaje >= umbrales.efectividad_excelente ? "#00C897" : porcentaje >= umbrales.efectividad_meta ? "#00D4FF" : porcentaje >= 70 ? "#F0A500" : "#FF5E7A";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSection, { title: "Meta mensual", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "size-4 text-[#C8A95A]" }), children: facturacion.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 rounded-lg bg-white/5" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#E8EDF5] font-medium", children: [
        formatSoles(actual),
        " de ",
        formatSoles(meta)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums font-semibold", style: { color }, children: [
        porcentaje.toFixed(0),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: porcentaje, className: "h-2.5", style: { ["--progress-color"]: color } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4]", children: [
      "Restan ",
      formatSoles(restante),
      " · Quedan ",
      diasRestantesMes(),
      " días",
      porcentaje >= 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 ml-2 text-[#00C897]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5" }),
        " Meta alcanzada"
      ] }),
      porcentaje >= umbrales.efectividad_meta && porcentaje < 100 && " · ⭐ Vas por buen camino"
    ] })
  ] }) });
}
export {
  MetaMensualWidget,
  MetaMensualWidget as default
};
