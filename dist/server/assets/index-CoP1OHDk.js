import { L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { as as useSession, N as Navigate } from "./router-B2fOVgbK.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function IndexRedirect() {
  const {
    session,
    loading
  } = useSession();
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-muted-foreground text-sm", children: "Cargando…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: session ? "/sire-registros" : "/login" });
}
export {
  IndexRedirect as component
};
