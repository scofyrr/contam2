import { U as reactExports, L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { as as useSession, aj as toast } from "./router-B2fOVgbK.js";
import { F as FieldHelper } from "./field-helper-BvfRNaAW.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { C as Card, c as CardHeader, d as CardTitle, b as CardDescription, a as CardContent } from "./card-Cbh3F1c-.js";
import { I as Input } from "./input-CVw-0GOD.js";
import { L as Label } from "./label-DrIl1YMr.js";
import { a as createLucideIcon, b as createSlot } from "./index-CWutStw1.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { u as useNotifications } from "./use-notifications-CXXHvjrN.js";
import { C as CircleUser } from "./circle-user-CIosiU44.js";
import { U as User } from "./user-qnZRQgmD.js";
import { S as Save } from "./save-BH6o-scK.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./circle-alert-Cna6VmV6.js";
import "./info-CGwkGZ-6.js";
import "./tareas-service-Co1DUort.js";
import "./notification-service-C10oxyNg.js";
const __iconNode = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
const Mail = createLucideIcon("mail", __iconNode);
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot(`Primitive.${node}`);
  const Node = reactExports.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
var NAME = "Separator";
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { decorative, orientation: orientationProp = DEFAULT_ORIENTATION, ...domProps } = props;
  const orientation = isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
  const ariaOrientation = orientation === "vertical" ? orientation : void 0;
  const semanticProps = decorative ? { role: "none" } : { "aria-orientation": ariaOrientation, role: "separator" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-orientation": orientation,
      ...semanticProps,
      ...domProps,
      ref: forwardedRef
    }
  );
});
Separator$1.displayName = NAME;
function isValidOrientation(orientation) {
  return ORIENTATIONS.includes(orientation);
}
var Root = Separator$1;
const Separator = reactExports.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    ),
    ...props
  }
));
Separator.displayName = Root.displayName;
function MiCuentaPage() {
  const {
    session
  } = useSession();
  const {
    institutionalEmail,
    setInstitutionalEmail
  } = useNotifications();
  const [emailInput, setEmailInput] = reactExports.useState(institutionalEmail);
  const [emailError, setEmailError] = reactExports.useState("");
  const userEmail = session?.user.email ?? "";
  const userName = session?.user.user_metadata?.nombre ?? userEmail.split("@")[0] ?? "Usuario";
  reactExports.useEffect(() => {
    setEmailInput(institutionalEmail);
  }, [institutionalEmail]);
  function validateInstitutionalEmail(value) {
    if (!value.trim()) return "Ingrese su correo institucional para habilitar la sincronización con Gmail.";
    if (!value.includes("@")) return "El correo debe contener el símbolo @ y un dominio válido (ej. usuario@empresa.pe).";
    if (!/\.(pe|com|gob\.pe|edu\.pe)$/i.test(value.split("@")[1] ?? "")) {
      return "Use un dominio institucional válido (.pe, .com, .gob.pe o .edu.pe).";
    }
    return "";
  }
  function handleSaveEmail(e) {
    e.preventDefault();
    const error = validateInstitutionalEmail(emailInput);
    setEmailError(error);
    if (error) return;
    setInstitutionalEmail(emailInput);
    toast.success("Correo institucional guardado. Los mensajes aparecerán en la pestaña Correos.");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[720px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUser, { className: "size-8 text-primary" }),
        "Mi Cuenta"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Configure su perfil y el correo institucional para recibir notificaciones de Gmail." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-4" }),
          "Datos de sesión"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Información asociada a su cuenta de acceso en CONTAM." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre del contador" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: userName, disabled: true, className: "bg-muted/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Nombre registrado en el perfil de autenticación. Para modificarlo, contacte al administrador del sistema." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Correo de acceso" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: userEmail, disabled: true, className: "bg-muted/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Correo utilizado para iniciar sesión en CONTAM. No se usa para la extracción de Gmail institucional." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4" }),
          "Correo institucional (Gmail)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Vincule su bandeja institucional para que CONTAM extraiga mensajes relevantes al proceso contable." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveEmail, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "institutional-email", children: "Correo Gmail institucional" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "institutional-email", type: "email", placeholder: "contador@empresa.pe", value: emailInput, onChange: (e) => {
            setEmailInput(e.target.value);
            if (emailError) setEmailError("");
          }, "aria-invalid": !!emailError }),
          emailError ? /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { variant: "error", children: emailError }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { variant: "info", children: "Ingrese el correo corporativo autorizado. Los mensajes de SUNAT, tesorería y contabilidad se mostrarán en el panel de notificaciones, pestaña «Correos»." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { className: "flex-1", children: institutionalEmail ? `Sincronización activa con: ${institutionalEmail}` : "Sin correo configurado — las notificaciones por correo no estarán disponibles." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 mr-2" }),
            "Guardar correo"
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  MiCuentaPage as component
};
