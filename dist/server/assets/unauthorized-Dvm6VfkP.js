import { L as jsxRuntimeExports } from "./server-C-mhO3-H.js";
import { b as Route, aq as usePermissions, L as Link } from "./router-CQNpPKTf.js";
import { B as Button } from "./button-CL2ribwv.js";
import { L as Lock } from "./lock-BHi0EZQe.js";
import { S as ShieldAlert } from "./shield-alert-DhpaJisv.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BCXce4eP.js";
import "./utils-8RO4xBwZ.js";
function UnauthorizedPage() {
  const {
    permiso,
    from
  } = Route.useSearch();
  const {
    roles,
    loading
  } = usePermissions();
  const sinRoles = !loading && roles.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg w-full text-center space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-32 h-32", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-[#FF5E7A]/20 blur-2xl animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-32 rounded-full border border-[#FF5E7A]/30 bg-white/[0.03] grid place-items-center backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-14 text-[#FF5E7A]", strokeWidth: 1.5 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl text-[#E8EDF5]", children: "Acceso Restringido" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4] text-sm mt-2", children: sinRoles ? "Tu cuenta no tiene roles asignados. Solicita acceso al administrador del estudio." : "No tienes los permisos necesarios para acceder a esta sección." })
    ] }),
    permiso ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[#FF5E7A] text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "size-4" }),
        "Permiso requerido"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[#C8A44D] text-sm mt-2", children: permiso }),
      from ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4] mt-2", children: [
        "Ruta: ",
        from
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "bg-[#C8A44D] text-black hover:bg-[#C8A44D]/90", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard-estadisticas", children: "Volver al inicio" }) }),
      sinRoles ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:admin@estudio.com?subject=Solicitud%20de%20acceso%20CONTAM", children: "Solicitar acceso" }) }) : null
    ] })
  ] }) });
}
export {
  UnauthorizedPage as component
};
