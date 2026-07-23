import { L as jsxRuntimeExports, U as reactExports } from "./server-C-mhO3-H.js";
import { ar as useQueryClient, aj as toast, x as formatSupabaseError, al as upsertRegistroSire, o as deleteRegistroSire, L as Link, u as fetchRegistrosSireRows, P as mapRegistroFromDb } from "./router-CQNpPKTf.js";
import { u as useQuery } from "./useQuery-0d8p6ted.js";
import { u as useMutation } from "./useMutation-CKvbLsfn.js";
import { B as Button } from "./button-CL2ribwv.js";
import { I as Input } from "./input-DUU4eM58.js";
import { L as Label } from "./label-gGZxLhmE.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent, d as DialogHeader, e as DialogTitle, c as DialogFooter } from "./dialog-Dc200DvG.js";
import { A as AlertDialog, h as AlertDialogTrigger, c as AlertDialogContent, f as AlertDialogHeader, g as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, b as AlertDialogCancel, a as AlertDialogAction } from "./alert-dialog-u2raCetg.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-CQ8u9WfV.js";
import { C as Checkbox } from "./checkbox-EDeUtXNj.js";
import { E as ExportButtons } from "./export-buttons-CR2Z8Sw2.js";
import { N as NuevaTareaButton } from "./NuevaTareaButton-CJm6jQvi.js";
import { F as FieldHelper } from "./field-helper-CZvLpZIa.js";
import { d as exportRegistrosExcel } from "./export-service-CHdCILtJ.js";
import { g as generarCancelacionCaja, r as revertirCancelacion } from "./asiento-cancelacion-XeIcRgjx.js";
import { P as Plus } from "./plus-hhv-7k2K.js";
import { S as Search } from "./search-BtuCzAtg.js";
import { R as RotateCcw } from "./rotate-ccw-DPtbLIfM.js";
import { a as createLucideIcon } from "./index-BCXce4eP.js";
import { G as GitBranch } from "./git-branch-vA2gbaqF.js";
import { C as CircleCheck } from "./circle-check-Dtnm8Yzb.js";
import { C as Circle } from "./circle-Dw7bLpiL.js";
import { P as Pencil } from "./pencil-BQPAh-Li.js";
import { T as Trash2 } from "./trash-2-rcDS-drK.js";
import { C as CircleAlert } from "./circle-alert-2akrATqN.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-8RO4xBwZ.js";
import "./index-DFMAIghZ.js";
import "./Combination-0mr5ceEx.js";
import "./index-BtZSYFDf.js";
import "./x-PTE7pfQq.js";
import "./index-BTHtlONk.js";
import "./chevron-up-0ttd7T5h.js";
import "./dropdown-menu-TDkRGDsQ.js";
import "./index-Cls-RASW.js";
import "./chevron-right-B3IcY8Nq.js";
import "./loader-circle-D1aoR-eb.js";
import "./upload-DYDStTmx.js";
import "./file-spreadsheet-X5P97eTk.js";
import "./file-text-CtZVMHg4.js";
import "./download-C2e4ds-t.js";
import "./FormularioTarea-BCy70H9n.js";
import "./form-CjTJw2ZH.js";
import "./textarea-CO3yCNXA.js";
import "./switch-DFor-phQ.js";
import "./tareas-service-YuWHZuEd.js";
import "./info-DIRMoZrE.js";
const __iconNode = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
];
const Settings2 = createLucideIcon("settings-2", __iconNode);
const SIRE_FIELD_HELP = {
  ruc: "RUC del contribuyente emisor (11 dígitos). Debe existir en el módulo Contribuyentes.",
  razon_social: "Denominación o razón social tal como figura en SUNAT para el RUC indicado.",
  periodo: "Periodo tributario en formato AAAAMM (ej. 202506 = junio 2026).",
  cod_tipo_cdp: "Código SUNAT del comprobante: 01 Factura, 03 Boleta, 07 NC, 08 ND, etc.",
  serie_cdp: "Serie del comprobante según formato SUNAT (ej. F001, B001).",
  nro_cdp_inicial: "Número correlativo inicial del comprobante. Use N° Final solo para rangos.",
  tipo_doc_contraparte: "Tipo de documento del proveedor/cliente: 6=RUC, 1=DNI, 0=No domiciliado.",
  nro_doc_contraparte: "Número de documento de identidad de la contraparte comercial.",
  nombre_contraparte: "Nombre o razón social del proveedor (compras) o cliente (ventas).",
  importe_total: "Importe total del comprobante en la moneda indicada, incluyendo IGV si aplica.",
  cod_moneda: "Moneda de la operación: PEN (soles), USD o EUR según el comprobante."
};
function SireFieldHelper({ field, errors }) {
  const help = SIRE_FIELD_HELP[field];
  const hasError = errors.includes(field);
  if (hasError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(FieldHelper, { variant: "error", children: [
      "Campo obligatorio para el registro SIRE. ",
      help
    ] });
  }
  if (!help) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { className: "mt-0.5", children: help });
}
const SIRE_SECTION_HELP = {
  contribuyente: "Identifique al contribuyente cuyo RUC reportará este comprobante en RVIE o RCE.",
  documento: "Datos del comprobante de pago según estructura extendida SUNAT (35 columnas).",
  contraparte: "Proveedor en compras o cliente en ventas. Requerido para trazabilidad fiscal.",
  montos: "Valores monetarios del comprobante. El importe total debe cuadrar con base imponible + IGV."
};
const TIPOS_CDP = [
  { c: "01", l: "01 - Factura" },
  { c: "03", l: "03 - Boleta de Venta" },
  { c: "07", l: "07 - Nota de Crédito" },
  { c: "08", l: "08 - Nota de Débito" },
  { c: "12", l: "12 - Ticket" },
  { c: "00", l: "00 - Otros" }
];
const TIPOS_DOC = [
  { c: "0", l: "0 - No domiciliado" },
  { c: "1", l: "1 - DNI" },
  { c: "4", l: "4 - C.Ext." },
  { c: "6", l: "6 - RUC" },
  { c: "7", l: "7 - Pasaporte" }
];
const MONEDAS = ["PEN", "USD", "EUR"];
const REQUIRED_FIELDS = [
  "ruc",
  "razon_social",
  "periodo",
  "cod_tipo_cdp",
  "serie_cdp",
  "nro_cdp_inicial",
  "tipo_doc_contraparte",
  "nro_doc_contraparte",
  "nombre_contraparte",
  "importe_total",
  "cod_moneda"
];
const ALL_COLUMNS = [
  { id: "ruc", header: "RUC *", accessorKey: "ruc", visible: true },
  { id: "razon_social", header: "RAZON SOCIAL *", accessorKey: "razon_social", visible: true },
  { id: "periodo", header: "PERIODO *", accessorKey: "periodo", visible: true },
  { id: "car_sunat", header: "CAR SUNAT", accessorKey: "car_sunat", visible: true },
  { id: "fecha_emision", header: "FECHA EMISIÓN CDP", accessorKey: "fecha_emision", visible: true },
  { id: "fecha_vencimiento", header: "FECHA VENCIMIENTO CDP", accessorKey: "fecha_vencimiento", visible: true },
  { id: "cod_tipo_cdp", header: "COD. TIPO CDP *", accessorKey: "cod_tipo_cdp", visible: true },
  { id: "serie_cdp", header: "SERIE CDP *", accessorKey: "serie_cdp", visible: true },
  { id: "anio_dam_dsi", header: "AÑO DAM O DSI", accessorKey: "anio_dam_dsi", visible: true },
  { id: "nro_cdp_inicial", header: "NRO CDP INICIAL *", accessorKey: "nro_cdp_inicial", visible: true },
  { id: "nro_cdp_final", header: "NRO CDP FINAL", accessorKey: "nro_cdp_final", visible: true },
  { id: "tipo_doc_contraparte", header: "TIPO DOC PROVEEDOR *", accessorKey: "tipo_doc_contraparte", visible: true },
  { id: "nro_doc_contraparte", header: "NRO DOC PROVEEDOR *", accessorKey: "nro_doc_contraparte", visible: true },
  { id: "nombre_contraparte", header: "NOMBRES/RAZÓN SOCIAL *", accessorKey: "nombre_contraparte", visible: true },
  { id: "bi_adq_grav", header: "BI ADQ. GRAV.", accessorKey: "bi_adq_grav", visible: true, isNumeric: true },
  { id: "igv_adq_grav", header: "IGV ADQ. GRAV.", accessorKey: "igv_adq_grav", visible: true, isNumeric: true },
  { id: "bi_adq_grav_y_no_grav", header: "BI ADQ. GRAV. Y NO GRAV.", accessorKey: "bi_adq_grav_y_no_grav", visible: false, isNumeric: true },
  { id: "igv_adq_grav_y_no_grav", header: "IGV ADQ. GRAV. Y NO GRAV.", accessorKey: "igv_adq_grav_y_no_grav", visible: false, isNumeric: true },
  { id: "bi_adq_no_grav", header: "BI ADQ. NO GRAV.", accessorKey: "bi_adq_no_grav", visible: false, isNumeric: true },
  { id: "igv_adq_no_grav", header: "IGV ADQ. NO GRAV.", accessorKey: "igv_adq_no_grav", visible: false, isNumeric: true },
  { id: "valor_adq_no_grav", header: "VALOR ADQ. NO GRAV.", accessorKey: "valor_adq_no_grav", visible: false, isNumeric: true },
  { id: "isc", header: "ISC", accessorKey: "isc", visible: false, isNumeric: true },
  { id: "icbper", header: "ICBPER", accessorKey: "icbper", visible: false, isNumeric: true },
  { id: "otros_tributos", header: "OTROS TRIBUTOS Y CARGOS", accessorKey: "otros_tributos", visible: false, isNumeric: true },
  { id: "importe_total", header: "IMPORTE TOTAL CDP *", accessorKey: "importe_total", visible: true, isNumeric: true },
  { id: "cod_moneda", header: "CÓD. MONEDA *", accessorKey: "cod_moneda", visible: true },
  { id: "tipo_cambio", header: "TIPO DE CAMBIO", accessorKey: "tipo_cambio", visible: false, isNumeric: true },
  { id: "fecha_emision_mod", header: "FECHA EMISIÓN DOC MODIFICADO", accessorKey: "fecha_emision_mod", visible: false },
  { id: "tipo_cdp_mod", header: "TIPO CDP MODIFICADO", accessorKey: "tipo_cdp_mod", visible: false },
  { id: "serie_cdp_mod", header: "SERIE CDP MODIFICADO", accessorKey: "serie_cdp_mod", visible: false },
  { id: "cod_dam_dsi", header: "COD. DAM O DSI", accessorKey: "cod_dam_dsi", visible: false },
  { id: "nro_cdp_mod", header: "NRO CDP MODIFICADO", accessorKey: "nro_cdp_mod", visible: false },
  { id: "clasificacion_bienes_serv", header: "CLASIFICACION DE BIENES Y SERVICIOS", accessorKey: "clasificacion_bienes_serv", visible: false },
  { id: "id_proyecto", header: "ID PROYECTO", accessorKey: "id_proyecto", visible: false },
  { id: "operadores", header: "OPERADORES", accessorKey: "operadores", visible: false },
  { id: "porcentaje_participacion", header: "% PARTICIPACION", accessorKey: "porcentaje_participacion", visible: false, isNumeric: true },
  { id: "impuesto_materia_beneficio", header: "IMPUESTO MATERIA DE BENEFICIO", accessorKey: "impuesto_materia_beneficio", visible: false },
  { id: "car_orig_indicador", header: "CAR ORIG/INDICADOR", accessorKey: "car_orig_indicador", visible: false }
];
const empty = () => ({
  id: void 0,
  tipo: "VENTA",
  ruc: "",
  razon_social: "",
  periodo: (/* @__PURE__ */ new Date()).toISOString().slice(0, 7).replace("-", ""),
  car_sunat: "",
  fecha_emision: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  fecha_vencimiento: "",
  cod_tipo_cdp: "01",
  serie_cdp: "",
  anio_dam_dsi: "",
  nro_cdp_inicial: "",
  nro_cdp_final: "",
  tipo_doc_contraparte: "6",
  nro_doc_contraparte: "",
  nombre_contraparte: "",
  bi_adq_grav: 0,
  igv_adq_grav: 0,
  bi_adq_grav_y_no_grav: 0,
  igv_adq_grav_y_no_grav: 0,
  bi_adq_no_grav: 0,
  igv_adq_no_grav: 0,
  valor_adq_no_grav: 0,
  isc: 0,
  icbper: 0,
  otros_tributos: 0,
  importe_total: 0,
  cod_moneda: "PEN",
  tipo_cambio: 1,
  fecha_emision_mod: "",
  tipo_cdp_mod: "",
  serie_cdp_mod: "",
  cod_dam_dsi: "",
  nro_cdp_mod: "",
  clasificacion_bienes_serv: "",
  id_proyecto: "",
  operadores: "",
  porcentaje_participacion: 0,
  impuesto_materia_beneficio: "",
  car_orig_indicador: "",
  estado_validacion: "pendiente",
  estado_cobro: "pendiente",
  estado_pago: "pendiente",
  campos_38_41: {},
  campos_libres: {}
});
function validateRequiredFields(reg) {
  const missing = [];
  REQUIRED_FIELDS.forEach((field) => {
    const value = reg[field];
    if (!value || typeof value === "string" && value.trim() === "") {
      missing.push(field);
    }
  });
  return missing;
}
function sanitizeRegistro(reg) {
  const vacio = empty();
  const sanitized = {
    ...vacio,
    ...reg
  };
  Object.keys(vacio).forEach((key) => {
    if (sanitized[key] === void 0 || sanitized[key] === null) {
      sanitized[key] = vacio[key];
    }
  });
  return sanitized;
}
function SireRegistrosPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = reactExports.useState({
    tipo: "TODOS",
    periodo: "",
    ruc: "",
    contraparte: "",
    cod_tipo_cdp: "TODOS",
    q: ""
  });
  const [openForm, setOpenForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [columns, setColumns] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sire_columns_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return ALL_COLUMNS;
        }
      }
    }
    return ALL_COLUMNS;
  });
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sire_columns_v2", JSON.stringify(columns));
    }
  }, [columns]);
  const toggleColumn = (columnId) => {
    setColumns((prev) => prev.map(
      (col) => col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };
  const resetColumns = () => {
    setColumns(ALL_COLUMNS);
  };
  const visibleColumns = columns.filter((col) => col.visible);
  const query = useQuery({
    queryKey: ["registros_sire", filters],
    queryFn: async () => {
      const data = await fetchRegistrosSireRows({
        tipo: filters.tipo,
        periodo: filters.periodo,
        ruc: filters.ruc,
        contraparte: filters.contraparte,
        cod_tipo_cdp: filters.cod_tipo_cdp,
        q: filters.q,
        limit: 500
      });
      return data.map((row) => mapRegistroFromDb(row));
    }
  });
  const totals = reactExports.useMemo(() => {
    const rows = query.data ?? [];
    const f = (k) => rows.reduce((s, r) => s + Number(r[k] ?? 0), 0);
    return {
      count: rows.length,
      bi: f("bi_adq_grav") + f("bi_adq_grav_y_no_grav") + f("bi_adq_no_grav"),
      igv: f("igv_adq_grav") + f("igv_adq_grav_y_no_grav") + f("igv_adq_no_grav"),
      total: f("importe_total")
    };
  }, [query.data]);
  const upsert = useMutation({
    mutationFn: async (r) => {
      const missingFields = validateRequiredFields(r);
      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((f) => {
          const col = ALL_COLUMNS.find((c) => c.accessorKey === f);
          return col ? col.header : f;
        }).join(", ");
        throw new Error(`Campos obligatorios faltantes: ${fieldNames}`);
      }
      await upsertRegistroSire(r);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros_sire"] });
      setOpenForm(false);
      setEditing(null);
      toast.success("Registro guardado");
    },
    onError: (e) => {
      console.error("Error al guardar:", e);
      toast.error(formatSupabaseError(e));
    }
  });
  const del = useMutation({
    mutationFn: async (id) => {
      await deleteRegistroSire(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registros_sire"] });
      toast.success("Eliminado");
    },
    onError: (e) => toast.error(e.message)
  });
  const marcarCobroPago = useMutation({
    mutationFn: async (registroId) => {
      await generarCancelacionCaja({ registroSireId: registroId });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["registros_sire"] });
    }
  });
  const revertirPago = useMutation({
    mutationFn: async (registroId) => {
      await revertirCancelacion(registroId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["registros_sire"] });
      await qc.invalidateQueries({ queryKey: ["caja"] });
      await qc.invalidateQueries({ queryKey: ["cancelaciones"] });
      toast.success("Pago/cobro revertido — el comprobante vuelve a estado Pendiente");
    },
    onError: (e) => toast.error(e.message ?? "No se pudo revertir")
  });
  const formatValue = (value, isNumeric) => {
    if (value === null || value === void 0) return "-";
    if (isNumeric && typeof value === "number") return value.toFixed(2);
    return value;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1600px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6 flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Registros SIRE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Formato SUNAT completo - Los campos marcados con * son obligatorios" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NuevaTareaButton,
          {
            moduloOrigen: "sire",
            ruc: filters.ruc || void 0,
            entidad: "SIRE",
            tramite: "Revisión de registros SIRE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ExportButtons,
          {
            compact: true,
            disabled: query.isLoading || (query.data ?? []).length === 0,
            onExportExcel: async () => exportRegistrosExcel(query.data ?? [], filters.periodo || void 0)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: openForm, onOpenChange: (o) => {
          setOpenForm(o);
          if (!o) setEditing(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setEditing(sanitizeRegistro(empty())), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
            "Nuevo registro"
          ] }) }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
            RegistroForm,
            {
              value: editing,
              onChange: setEditing,
              onSubmit: () => upsert.mutate(editing),
              saving: upsert.isPending
            },
            editing.id || "new"
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 mb-4 grid grid-cols-2 md:grid-cols-6 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filters.tipo, onValueChange: (v) => setFilters({ ...filters, tipo: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "TODOS", children: "Todos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "VENTA", children: "Ventas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "COMPRA", children: "Compras" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Periodo (AAAAMM)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: filters.periodo, onChange: (e) => setFilters({ ...filters, periodo: e.target.value }), placeholder: "202601", className: "font-mono" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "RUC contribuyente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: filters.ruc, onChange: (e) => setFilters({ ...filters, ruc: e.target.value }), className: "font-mono" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "RUC/DNI contraparte" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: filters.contraparte, onChange: (e) => setFilters({ ...filters, contraparte: e.target.value }), className: "font-mono" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tipo CDP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filters.cod_tipo_cdp, onValueChange: (v) => setFilters({ ...filters, cod_tipo_cdp: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "TODOS", children: "Todos" }),
            TIPOS_CDP.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.c, children: t.l }, t.c))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Buscar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 absolute left-2 top-2.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: filters.q, onChange: (e) => setFilters({ ...filters, q: e.target.value }), className: "pl-8", placeholder: "Razón social, serie…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: () => setFilters({ tipo: "TODOS", periodo: "", ruc: "", contraparte: "", cod_tipo_cdp: "TODOS", q: "" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "size-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Registros" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xl font-semibold", children: String(totals.count) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Base Imponible" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xl font-semibold font-mono", children: totals.bi.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "IGV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xl font-semibold font-mono", children: totals.igv.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Importe Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xl font-semibold font-mono", children: totals.total.toFixed(2) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "size-4 inline mr-2" }),
        "Personalizar columnas (",
        visibleColumns.length,
        "/",
        columns.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-3 border rounded-lg bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "Selecciona las columnas a mostrar:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: resetColumns, children: "Restablecer" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto", children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: col.visible,
              onCheckedChange: () => toggleColumn(col.id)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: col.header })
        ] }, col.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        visibleColumns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left whitespace-nowrap", children: col.header }, col.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-center whitespace-nowrap", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: visibleColumns.length + 1, className: "p-8 text-center text-muted-foreground", children: "Cargando…" }) }) : query.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: visibleColumns.length + 1, className: "p-8 text-center text-destructive", children: query.error.message }) }) : (query.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: visibleColumns.length + 1, className: "p-8 text-center text-muted-foreground", children: "Sin registros para los filtros aplicados." }) }) : (query.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t hover:bg-muted/30", children: [
        visibleColumns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: col.isNumeric ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-right block", children: formatValue(r[col.accessorKey], true) }) : formatValue(r[col.accessorKey], false) }, col.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-center whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            NuevaTareaButton,
            {
              iconOnly: true,
              size: "icon",
              variant: "ghost",
              label: "Crear tarea",
              moduloOrigen: "sire",
              ruc: r.ruc,
              entidad: r.nombre_contraparte ?? r.razon_social ?? "SIRE",
              titulo: `Revisar ${r.cod_tipo_cdp}-${r.serie_cdp}-${r.nro_cdp_inicial}`,
              tramite: `Revisar ${r.cod_tipo_cdp}-${r.serie_cdp}-${r.nro_cdp_inicial}`,
              referenciaId: r.id
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Ver trazabilidad contable", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/trazabilidad/$sireRegistroId", params: { sireRegistroId: r.id }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "size-4 text-[#00D4FF]" }) }) }),
          (() => {
            const rTipo = String(r.tipo || "").trim().toUpperCase();
            const isPaid = rTipo === "VENTA" ? String(r.estado_cobro || "").trim().toLowerCase() === "cobrado" : String(r.estado_pago || "").trim().toLowerCase() === "pagado";
            const label = rTipo === "VENTA" ? "cobro" : "pago";
            const labelCap = rTipo === "VENTA" ? "Cobro" : "Pago";
            if (isPaid) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    title: `${labelCap} registrado — clic para deshacer`,
                    disabled: revertirPago.isPending,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 text-emerald-600" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
                      "¿Deshacer ",
                      label,
                      "?"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                      "Se eliminará el asiento de cancelación y el movimiento de caja. El comprobante volverá a estado",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pendiente" }),
                      ". Esta acción no se puede deshacer automáticamente."
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      AlertDialogAction,
                      {
                        className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                        onClick: () => revertirPago.mutate(r.id),
                        children: [
                          "Sí, deshacer ",
                          label
                        ]
                      }
                    )
                  ] })
                ] })
              ] });
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                title: `Marcar como ${label}ado`,
                onClick: async () => {
                  try {
                    await marcarCobroPago.mutateAsync(r.id);
                    toast.success(
                      r.tipo === "VENTA" ? "Cobro registrado en caja" : "Pago registrado en caja"
                    );
                  } catch (e) {
                    toast.error(e?.message ?? "No se pudo generar la cancelación");
                  }
                },
                disabled: marcarCobroPago.isPending,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "size-4 text-muted-foreground" })
              }
            );
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              onClick: () => {
                setEditing(sanitizeRegistro(r));
                setOpenForm(true);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              onClick: () => {
                if (confirm("¿Eliminar registro?")) del.mutate(r.id);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 text-destructive" })
            }
          )
        ] })
      ] }, r.id)) })
    ] }) }) })
  ] });
}
function RegistroForm({ value, onChange, onSubmit, saving }) {
  const [errors, setErrors] = reactExports.useState([]);
  const set = (k, v) => onChange({ ...value, [k]: v });
  const setNum = (k, v) => {
    const num = v === "" ? 0 : parseFloat(v);
    set(k, isNaN(num) ? 0 : num);
  };
  const handleSubmit = () => {
    const missingFields = validateRequiredFields(value);
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((f) => {
        const col = ALL_COLUMNS.find((c) => c.accessorKey === f);
        return col ? col.header.replace(" *", "") : f;
      });
      setErrors(fieldNames);
      toast.error(`Complete los campos obligatorios: ${fieldNames.join(", ")}`);
      return;
    }
    setErrors([]);
    onSubmit();
  };
  const getFieldClass = (fieldName) => {
    return errors.includes(fieldName) ? "border-red-500 focus:ring-red-500" : "";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        value.id ? "Editar" : "Nuevo",
        " registro SIRE"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground mt-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-4" }),
        "Los campos marcados con ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 font-bold", children: "*" }),
        " son obligatorios"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/20 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-1", children: "Datos del Contribuyente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { className: "mb-3", children: SIRE_SECTION_HELP.contribuyente }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "RUC ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.ruc || "",
                onChange: (e) => set("ruc", e.target.value),
                maxLength: 11,
                className: `font-mono ${getFieldClass("ruc")}`,
                placeholder: "20XXXXXXXXX"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "ruc", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Razón Social ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.razon_social || "",
                onChange: (e) => set("razon_social", e.target.value),
                className: getFieldClass("razon_social"),
                placeholder: "Nombre o razón social del contribuyente"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "razon_social", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Periodo ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.periodo || "",
                onChange: (e) => set("periodo", e.target.value),
                placeholder: "AAAAMM",
                className: `font-mono ${getFieldClass("periodo")}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "periodo", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "CAR SUNAT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.car_sunat || "",
                onChange: (e) => set("car_sunat", e.target.value),
                className: "font-mono",
                placeholder: "Opcional"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/20 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-1", children: "Documento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { className: "mb-3", children: SIRE_SECTION_HELP.documento }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Cód. Tipo CDP ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.cod_tipo_cdp || "01", onValueChange: (v) => set("cod_tipo_cdp", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: getFieldClass("cod_tipo_cdp"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIPOS_CDP.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.c, children: t.l }, t.c)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "cod_tipo_cdp", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Serie CDP ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.serie_cdp || "",
                onChange: (e) => set("serie_cdp", e.target.value),
                className: `font-mono ${getFieldClass("serie_cdp")}`,
                placeholder: "Ej: F001"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "serie_cdp", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "N° Inicial ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.nro_cdp_inicial || "",
                onChange: (e) => set("nro_cdp_inicial", e.target.value),
                className: `font-mono ${getFieldClass("nro_cdp_inicial")}`,
                placeholder: "Número inicial"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "nro_cdp_inicial", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "N° Final" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.nro_cdp_final || "",
                onChange: (e) => set("nro_cdp_final", e.target.value),
                className: "font-mono",
                placeholder: "Opcional"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Año DAM/DSI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.anio_dam_dsi || "",
                onChange: (e) => set("anio_dam_dsi", e.target.value),
                placeholder: "AAAA",
                className: "font-mono"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Fecha Emisión" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: value.fecha_emision || "",
                onChange: (e) => set("fecha_emision", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Fecha Vencimiento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: value.fecha_vencimiento || "",
                onChange: (e) => set("fecha_vencimiento", e.target.value)
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/20 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-1", children: "Contraparte (Proveedor/Cliente)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { className: "mb-3", children: SIRE_SECTION_HELP.contraparte }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Tipo Doc. ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.tipo_doc_contraparte || "6", onValueChange: (v) => set("tipo_doc_contraparte", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: getFieldClass("tipo_doc_contraparte"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIPOS_DOC.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.c, children: t.l }, t.c)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "tipo_doc_contraparte", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "N° Documento ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.nro_doc_contraparte || "",
                onChange: (e) => set("nro_doc_contraparte", e.target.value),
                className: `font-mono ${getFieldClass("nro_doc_contraparte")}`,
                placeholder: "RUC, DNI o documento"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "nro_doc_contraparte", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Nombres/Razón Social ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: value.nombre_contraparte || "",
                onChange: (e) => set("nombre_contraparte", e.target.value),
                className: getFieldClass("nombre_contraparte"),
                placeholder: "Nombre o razón social de la contraparte"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "nombre_contraparte", errors })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/20 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-1", children: "Valores Monetarios" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { className: "mb-3", children: SIRE_SECTION_HELP.montos }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "BI Adq. Grav." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: value.bi_adq_grav ?? 0,
                onChange: (e) => setNum("bi_adq_grav", e.target.value),
                className: "font-mono",
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "IGV Adq. Grav." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: value.igv_adq_grav ?? 0,
                onChange: (e) => setNum("igv_adq_grav", e.target.value),
                className: "font-mono",
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Importe Total ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: value.importe_total ?? 0,
                onChange: (e) => setNum("importe_total", e.target.value),
                className: `font-mono ${getFieldClass("importe_total")}`,
                placeholder: "0.00"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "importe_total", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
              "Moneda ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.cod_moneda || "PEN", onValueChange: (v) => set("cod_moneda", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: getFieldClass("cod_moneda"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MONEDAS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SireFieldHelper, { field: "cod_moneda", errors })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tipo Cambio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.001",
                value: value.tipo_cambio ?? 1,
                onChange: (e) => setNum("tipo_cambio", e.target.value),
                className: "font-mono",
                placeholder: "1.000"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "bg-muted/20 p-4 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "text-sm font-semibold cursor-pointer", children: "Campos Opcionales (Click para expandir)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-2", children: "Base Imponible e IGV Adicionales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "BI Grav. y No Grav." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.bi_adq_grav_y_no_grav ?? 0, onChange: (e) => setNum("bi_adq_grav_y_no_grav", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "IGV Grav. y No Grav." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.igv_adq_grav_y_no_grav ?? 0, onChange: (e) => setNum("igv_adq_grav_y_no_grav", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "BI No Grav." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.bi_adq_no_grav ?? 0, onChange: (e) => setNum("bi_adq_no_grav", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "IGV No Grav." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.igv_adq_no_grav ?? 0, onChange: (e) => setNum("igv_adq_no_grav", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Valor No Grav." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.valor_adq_no_grav ?? 0, onChange: (e) => setNum("valor_adq_no_grav", e.target.value), className: "font-mono" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-2", children: "Otros Tributos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "ISC" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.isc ?? 0, onChange: (e) => setNum("isc", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "ICBPER" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.icbper ?? 0, onChange: (e) => setNum("icbper", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Otros Tributos" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.otros_tributos ?? 0, onChange: (e) => setNum("otros_tributos", e.target.value), className: "font-mono" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-2", children: "Documento Modificado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "F. Emisión Mod." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: value.fecha_emision_mod || "", onChange: (e) => set("fecha_emision_mod", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tipo CDP Mod." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.tipo_cdp_mod || "01", onValueChange: (v) => set("tipo_cdp_mod", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIPOS_CDP.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.c, children: t.l }, t.c)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Serie CDP Mod." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.serie_cdp_mod || "", onChange: (e) => set("serie_cdp_mod", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "N° CDP Mod." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.nro_cdp_mod || "", onChange: (e) => set("nro_cdp_mod", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "COD DAM/DSI" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.cod_dam_dsi || "", onChange: (e) => set("cod_dam_dsi", e.target.value) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-2", children: "Clasificación y Proyecto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clasificación de Bienes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.clasificacion_bienes_serv || "", onChange: (e) => set("clasificacion_bienes_serv", e.target.value), placeholder: "BIEN" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "ID Proyecto" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.id_proyecto || "", onChange: (e) => set("id_proyecto", e.target.value), placeholder: "123456789" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-2", children: "Operadores e Impuestos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Operadores" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.operadores || "", onChange: (e) => set("operadores", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "% Participación" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: value.porcentaje_participacion ?? 0, onChange: (e) => setNum("porcentaje_participacion", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Impuesto Materia Beneficio" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.impuesto_materia_beneficio || "", onChange: (e) => set("impuesto_materia_beneficio", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "CAR ORIG/Indicador" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.car_orig_indicador || "", onChange: (e) => set("car_orig_indicador", e.target.value) })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: saving, children: saving ? "Guardando..." : "Guardar registro" }) })
  ] });
}
const SplitComponent = SireRegistrosPage;
export {
  SplitComponent as component
};
