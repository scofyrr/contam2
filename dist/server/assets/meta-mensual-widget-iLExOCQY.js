import { L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { P as Progress } from "./progress-CZqzYq6n.js";
import { S as Skeleton } from "./skeleton-BkQkQtWf.js";
import { l as useWidgetDashboard, d as useFacturacionMensualPersonal, T as Target } from "./contador-dashboard-premium-CecU89id.js";
import { a as DashboardSection, f as formatSoles } from "./use-admin-metrics-ttrbnM7Y.js";
import { S as Sparkles } from "./sparkles-H49z-E_d.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./router-B2oVQHub.js";
import "./index-CE2u8TBR.js";
import "./utils-8RO4xBwZ.js";
import "./button-D82ZRVfS.js";
import "./use-estudio-config-BguEKtAw.js";
import "./useQuery-GwWd8T8C.js";
import "./triangle-alert-C9v1hrNU.js";
import "./refresh-cw-Yr6mvBQG.js";
import "./trending-up-CcZmLxtW.js";
import "./trending-down-BmLuyfec.js";
import "./auditoria-service-COZWF7vw.js";
import "./rbac-admin-service-Cro1Gq2-.js";
import "./notification-dual-service-DJzIwkas.js";
import "./notification-service-teXKFOTF.js";
import "./tareas-service-D-yCbpRg.js";
import "./contribuyentes-service-DhFtq9J9.js";
import "./http-client-BVL7nK2k.js";
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
