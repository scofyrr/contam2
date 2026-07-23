import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { aq as useQueryClient, ai as toast } from "./router-B2oVQHub.js";
import { u as useMutation } from "./useMutation-DD5rBZOv.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { F as FormularioTarea } from "./FormularioTarea-CpJ9j136.js";
import { c as crearTarea } from "./tareas-service-D-yCbpRg.js";
import { P as Plus } from "./plus-C29oSYCs.js";
function NuevaTareaButton({
  moduloOrigen = "general",
  ruc,
  entidad,
  tramite,
  titulo,
  problema,
  referenciaId,
  variant = "outline",
  size = "sm",
  label = "Nueva tarea",
  iconOnly = false
}) {
  const [open, setOpen] = reactExports.useState(false);
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: crearTarea,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      toast.success("Tarea registrada");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message)
  });
  const defaults = {
    modulo_origen: moduloOrigen,
    ruc: ruc ?? "",
    entidad: entidad ?? (moduloOrigen === "sire" ? "SIRE" : moduloOrigen === "caja" ? "Caja" : "Contabilidad"),
    tramite: tramite ?? titulo ?? "",
    problema: problema ?? ""
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant, size: iconOnly ? "icon" : size, onClick: () => setOpen(true), title: iconOnly ? label : void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: iconOnly ? "size-4" : "size-4 mr-1" }),
      !iconOnly && label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormularioTarea,
      {
        open,
        onOpenChange: setOpen,
        defaults,
        loading: create.isPending,
        onSubmit: (values) => create.mutate({
          ...values,
          referencia_id: referenciaId ?? void 0
        })
      }
    )
  ] });
}
export {
  NuevaTareaButton as N
};
