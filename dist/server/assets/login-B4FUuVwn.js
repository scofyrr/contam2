import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { as as useSession, ac as supabase, aj as toast } from "./router-BRL0s0LD.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { F as FieldHelper } from "./field-helper-BdCYJ2np.js";
import { I as Input } from "./input-Buvw7UNv.js";
import { L as Label } from "./label-Dsj3Zaer.js";
import { L as Lock } from "./lock-CvUyHCSL.js";
import { F as FileText } from "./file-text-BTjS5wgu.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Do_kSTPt.js";
import "./utils-8RO4xBwZ.js";
import "./circle-alert-BrgPxe9Y.js";
import "./info-FJkx6LgJ.js";
function LoginPage() {
  const {
    session,
    loading: sessLoading
  } = useSession();
  const [email, setEmail] = reactExports.useState("admin@contam.pe");
  const [password, setPassword] = reactExports.useState("Admin123456!");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const checkLocalStorage = () => {
      const token = localStorage.getItem("sb-auth-token");
      console.log("🔍 [LocalStorage] Token (sb-auth-token):", token ? "✅ Sí" : "❌ No");
    };
    checkLocalStorage();
  }, []);
  reactExports.useEffect(() => {
    if (!sessLoading && session) {
      console.log("✅ Sesión detectada, redirigiendo a /sire-registros");
      window.location.href = "/sire-registros";
    }
  }, [sessLoading, session]);
  if (sessLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Verificando sesión..." })
    ] }) });
  }
  if (session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Redirigiendo al dashboard..." })
    ] }) });
  }
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    console.log("🔐 Intentando login con:", email);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data?.session) {
        console.log("✅ Login exitoso!");
        console.log("📝 Usuario:", data.session.user.email);
        toast.success("Bienvenido a CONTAM");
        window.location.href = "/sire-registros";
      } else {
        console.error("❌ No se recibió sesión");
        toast.error("Error: No se pudo establecer la sesión");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error(error.message);
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen grid lg:grid-cols-2 bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex flex-col justify-between p-12 text-sidebar-foreground fade-in", style: {
      background: "var(--gradient-brand)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 slide-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display font-bold shadow-premium-medium", children: "C" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl font-semibold tracking-tight text-premium-gold", children: "CONTAM" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl font-semibold leading-tight", children: "Sistema Contable Moderno con registros SIRE." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sidebar-foreground/80 leading-relaxed", children: "Gestiona ventas y compras con la estructura extendida SUNAT (35 columnas + campos libres) y filtra por periodo, RUC, tipo CDP y más." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-sidebar-foreground/60", children: "© 2026 CONTAM — Perú" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8 page-enter", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "w-full max-w-sm space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-11 rounded-xl bg-primary text-primary-foreground grid place-items-center mb-3 shadow-premium-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-5", strokeWidth: 1.5 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-semibold", children: "Iniciar sesión" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Usa el administrador por defecto para comenzar." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Correo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Ingrese el correo electrónico registrado en CONTAM (ej. admin@contam.pe)." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Contraseña" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Contraseña de acceso al sistema. Debe tener al menos 8 caracteres con mayúsculas y números." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full", size: "lg", children: loading ? "Ingresando…" : "Entrar al sistema" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border glass-surface p-4 text-xs text-muted-foreground flex gap-2 shadow-premium-subtle", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Credenciales:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "admin@contam.pe / Admin123456!"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  LoginPage as component
};
