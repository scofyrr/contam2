import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { h as useForm, u, F as Form, b as FormField, c as FormItem, d as FormLabel, a as FormControl, e as FormMessage, o as objectType, f as booleanType, s as stringType, g as enumType } from "./form-t0HAEuz2.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, c as DialogFooter } from "./dialog-BIzYKlAi.js";
import { I as Input } from "./input-Dd5Cl0P5.js";
import { T as Textarea } from "./textarea-DrawpDgB.js";
import { S as Switch } from "./switch-IOC3J6ru.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BAtobcg4.js";
import { F as FieldHelper } from "./field-helper-UTMa-c_C.js";
import { L as LoaderCircle } from "./loader-circle-D9KbOhZE.js";
const schema = objectType({
  entidad: stringType().min(2, "Entidad requerida"),
  tramite: stringType().min(2, "Trámite requerido"),
  titulo: stringType().optional(),
  descripcion: stringType().optional(),
  ruc: stringType().optional(),
  fecha_tramitar: stringType().optional(),
  plazo_vencimiento: stringType().optional(),
  problema: stringType().optional(),
  prioridad: enumType(["baja", "media", "alta", "urgente"]),
  modulo_origen: enumType(["general", "sire", "asientos", "caja", "pcge", "contribuyentes"]),
  asignado_a: stringType().optional(),
  critica: booleanType()
});
function FormularioTarea({
  open,
  onOpenChange,
  initial,
  defaults,
  loading,
  onSubmit
}) {
  const form = useForm({
    resolver: u(schema),
    defaultValues: {
      entidad: "",
      tramite: "",
      prioridad: "media",
      modulo_origen: "general",
      critica: false
    }
  });
  reactExports.useEffect(() => {
    if (!open) return;
    form.reset({
      entidad: initial?.entidad ?? defaults?.entidad ?? "",
      tramite: initial?.tramite ?? defaults?.tramite ?? "",
      titulo: initial?.titulo ?? defaults?.titulo ?? "",
      descripcion: initial?.descripcion ?? defaults?.descripcion ?? "",
      ruc: initial?.ruc ?? defaults?.ruc ?? "",
      fecha_tramitar: initial?.fecha_tramitar ?? defaults?.fecha_tramitar ?? "",
      plazo_vencimiento: initial?.plazo_vencimiento ?? defaults?.plazo_vencimiento ?? "",
      problema: initial?.problema ?? defaults?.problema ?? "",
      prioridad: initial?.prioridad ?? defaults?.prioridad ?? "media",
      modulo_origen: initial?.modulo_origen ?? defaults?.modulo_origen ?? "general",
      asignado_a: initial?.asignado_a ?? defaults?.asignado_a ?? "",
      critica: initial?.critica ?? defaults?.critica ?? false
    });
  }, [open, initial, defaults, form]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial?.id ? "Editar tarea" : "Nueva tarea pendiente" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "grid gap-3", onSubmit: form.handleSubmit(onSubmit), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "entidad",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Entidad" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, placeholder: "SUNAT, Cliente, Interno…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "modulo_origen",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Módulo origen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "general", children: "General" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sire", children: "SIRE" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "asientos", children: "Asientos" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "caja", children: "Caja" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pcge", children: "PCGE" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "contribuyentes", children: "Contribuyentes" })
                ] })
              ] })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "tramite",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Trámite / título" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, placeholder: "Descripción breve del trámite" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "problema",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Problema detectado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { ...field, rows: 2, placeholder: "Detalle del problema a resolver" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Visible en el panel de notificaciones y listado de tareas." })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "ruc",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "RUC (opcional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, className: "font-mono", maxLength: 11, placeholder: "20123456789" }) })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "prioridad",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Prioridad" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "baja", children: "Baja" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "media", children: "Media" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alta", children: "Alta" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgente", children: "Urgente" })
                ] })
              ] })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "fecha_tramitar",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Fecha a tramitar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", ...field }) })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "plazo_vencimiento",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Plazo vencimiento" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", ...field }) })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "asignado_a",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Asignado a" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, placeholder: "Responsable interno" }) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "critica",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.value, onCheckedChange: field.onChange }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { className: "!mt-0", children: "Marcar como crítica" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }),
        "Guardar tarea"
      ] }) })
    ] }) })
  ] }) });
}
export {
  FormularioTarea as F
};
