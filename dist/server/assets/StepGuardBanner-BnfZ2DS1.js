import { L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { L as Link } from "./router-B2oVQHub.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { C as ClientOnly } from "./ClientOnly-BXVVj31g.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { u as useWorkflowWizard, A as ALERTA_SEVERIDAD_COLORS, a as ArrowRight } from "./workflow-K_cfdnqh.js";
import { S as ShieldAlert } from "./shield-alert-D2lRuoSc.js";
import { T as TriangleAlert } from "./triangle-alert-C9v1hrNU.js";
import { I as Info } from "./info-PkWkoNZu.js";
const VISTA_PASO_REQUERIDO = {
  workflow: 1,
  contabilidad: 3,
  "libro-diario": 3,
  tesoreria: 4,
  "libro-mayor": 5
};
function severidadIcon(severidad) {
  if (severidad === "BLOQUEANTE") return ShieldAlert;
  if (severidad === "ADVERTENCIA") return TriangleAlert;
  return Info;
}
function filtrarAlertasParaVista(alertas, vista, pasoSugerido) {
  const pasoRequerido = VISTA_PASO_REQUERIDO[vista];
  return alertas.filter((alerta) => {
    if (alerta.severidad === "INFO" && vista !== "workflow") return false;
    if (vista === "libro-mayor") {
      return alerta.pasoRelacionado < 5 && (alerta.severidad === "BLOQUEANTE" || alerta.severidad === "ADVERTENCIA" || alerta.pasoRelacionado <= 3);
    }
    if (vista === "contabilidad" || vista === "libro-diario") {
      return alerta.pasoRelacionado <= 3 || alerta.id === "diario-descuadrado";
    }
    if (vista === "tesoreria") {
      return alerta.pasoRelacionado >= 3 && alerta.pasoRelacionado <= 4;
    }
    return alerta.pasoRelacionado <= pasoRequerido || alerta.pasoRelacionado === pasoSugerido;
  });
}
function StepGuardBannerInner({
  contribuyenteId,
  periodo,
  vista,
  className
}) {
  const { estado, isLoading } = useWorkflowWizard(contribuyenteId, periodo);
  if (isLoading || !estado) return null;
  const alertas = filtrarAlertasParaVista(estado.alertas, vista, estado.pasoSugerido).filter(
    (a) => a.severidad !== "INFO" || vista === "workflow"
  );
  if (alertas.length === 0) return null;
  const principal = alertas.find((a) => a.severidad === "BLOQUEANTE") ?? alertas.find((a) => a.severidad === "ADVERTENCIA") ?? alertas[0];
  const Icon = severidadIcon(principal.severidad);
  const colorClass = ALERTA_SEVERIDAD_COLORS[principal.severidad];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 backdrop-blur-md",
        colorClass,
        className
      ),
      role: "alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5 shrink-0 mt-0.5", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: principal.severidad === "BLOQUEANTE" ? "Atención requerida antes de continuar" : "Recomendación del asistente de flujo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90", children: principal.mensaje }),
            alertas.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-70", children: [
              "+",
              alertas.length - 1,
              " alerta(s) adicional(es) en este periodo"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              asChild: true,
              size: "sm",
              variant: principal.severidad === "BLOQUEANTE" ? "destructive" : "secondary",
              className: "gap-1.5",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: principal.accionRuta, children: [
                principal.accionTexto,
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3.5" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", className: "border-current/30 bg-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/workflow", children: "Ver checklist completo" }) })
        ] })
      ]
    }
  );
}
function StepGuardBanner(props) {
  if (!props.contribuyenteId || !props.periodo?.replace(/\D/g, "").slice(0, 6)) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepGuardBannerInner, { ...props }) });
}
export {
  StepGuardBanner as S
};
