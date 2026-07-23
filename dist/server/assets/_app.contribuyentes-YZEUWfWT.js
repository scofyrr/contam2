import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { m as useContribuyentes, n as useContribuyentesKpis, e as emptyContribuyente, o as validateRuc, k as formatRequestError } from "./use-contribuyentes-CgGZLenc.js";
import { b as bulkUpsertContribuyentes, r as rucExists } from "./contribuyentes-service-DhFtq9J9.js";
import { g as getDataSourceLabel } from "./http-client-BVL7nK2k.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { I as Input } from "./input-Dd5Cl0P5.js";
import { L as Label } from "./label-RwV7o-pk.js";
import { C as Checkbox } from "./checkbox-CNiijA0r.js";
import { C as Card, c as CardHeader, d as CardTitle, a as CardContent } from "./card-679iFC_6.js";
import { B as Badge } from "./badge-R7vlE0zl.js";
import { A as Alert, b as AlertTitle, a as AlertDescription } from "./alert-DS0sEyNh.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent, d as DialogHeader, e as DialogTitle, c as DialogFooter } from "./dialog-BIzYKlAi.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BAtobcg4.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-D2g8SVZq.js";
import { ai as toast } from "./router-B2oVQHub.js";
import { E as ExportButtons } from "./export-buttons-YH6vOOK6.js";
import { e as exportContribuyentesExcel } from "./export-service-CEsx-YlQ.js";
import { L as LoaderCircle } from "./loader-circle-D9KbOhZE.js";
import { B as Building2 } from "./building-2-v1OgJ2ot.js";
import { P as Plus } from "./plus-C29oSYCs.js";
import { U as Users } from "./users-CtoptpTo.js";
import { P as Pencil } from "./pencil-mXRRBJOY.js";
import { T as Trash2 } from "./trash-2-CC6UBID0.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CE2u8TBR.js";
import "./utils-8RO4xBwZ.js";
import "./Combination-zo30HTiN.js";
import "./index-CRO2D6uM.js";
import "./index-CLwIwY0T.js";
import "./index-Dvhuoo-C.js";
import "./x-BCtce-HD.js";
import "./chevron-up-CdlYVDxF.js";
import "./dropdown-menu-DldiR_jM.js";
import "./index-D5JWF47-.js";
import "./chevron-right-CCfweRox.js";
import "./circle-BhXUi8Gc.js";
import "./upload-Ba8QS2Mm.js";
import "./file-spreadsheet-yyFcmmNN.js";
import "./file-text-CB40SY06.js";
import "./download-DVSNCLip.js";
async function parseExcelToRows(file) {
  const XLSX = await import("./xlsx-D6h3nj8f.js");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("El archivo Excel no contiene hojas");
  const sheet = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
function validateImportColumns(rows, requiredColumns) {
  if (rows.length === 0) {
    return { ok: false, missing: requiredColumns, headers: [], rows: [] };
  }
  const headers = Object.keys(rows[0] ?? {});
  const normalizedHeaders = new Set(headers.map((h) => h.trim().toLowerCase()));
  const missing = requiredColumns.filter(
    (col) => !normalizedHeaders.has(col.trim().toLowerCase())
  );
  return { ok: missing.length === 0, missing, headers, rows };
}
const CONTRIBUYENTES_IMPORT_COLUMNS = [
  "ruc",
  "razon_social",
  "estado",
  "cat1ra",
  "cat2da",
  "cat3ra"
];
async function readImportFile(file) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    return parseExcelToRows(file);
  }
  if (ext === "csv") {
    const text = await file.text();
    const XLSX = await import("./xlsx-D6h3nj8f.js");
    const wb = XLSX.read(text, { type: "string" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }
  throw new Error("Formato no soportado. Use Excel (.xlsx) o CSV exportado por CONTAM.");
}
const CATEGORIAS = [{
  key: "cat1ra",
  label: "1RA CATEGORIA"
}, {
  key: "cat2da",
  label: "2DA CATEGORIA"
}, {
  key: "cat3ra",
  label: "3RA CATEGORIA"
}, {
  key: "cat4taRetenciones",
  label: "4TA CATEG. RETENCIONES"
}, {
  key: "cat4taCtaPropia",
  label: "4TA CATEG.-CTA.PROPIA"
}, {
  key: "cat5ta",
  label: "5TA CATEGORIA"
}];
function CredPair({
  label,
  usuario,
  clave,
  onUsuario,
  onClave
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 bg-muted/20 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-800", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Usuario" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: usuario, onChange: (e) => onUsuario(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clave" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: clave, onChange: (e) => onClave(e.target.value) })
      ] })
    ] })
  ] });
}
function estadoBadge(estado) {
  if (estado === "ACTIVO") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-600 hover:bg-emerald-600", children: "Activo" });
  if (estado === "INACTIVO") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-blue-600 hover:bg-blue-600", children: "Inactivo" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-600 hover:bg-red-600", children: "De baja" });
}
function ContribuyentesPage() {
  const {
    loading,
    error,
    contribuyentes,
    upsertContribuyente,
    removeContribuyente,
    refresh
  } = useContribuyentes();
  const kpis = useContribuyentesKpis(contribuyentes);
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(emptyContribuyente());
  const [isEdit, setIsEdit] = reactExports.useState(false);
  const [q, setQ] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [deletingRuc, setDeletingRuc] = reactExports.useState(null);
  const filtered = reactExports.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return contribuyentes;
    return contribuyentes.filter((c) => c.ruc.includes(term) || c.razonSocial.toLowerCase().includes(term));
  }, [contribuyentes, q]);
  const openNew = () => {
    setForm(emptyContribuyente());
    setIsEdit(false);
    setOpen(true);
  };
  const openEdit = (c) => {
    setForm({
      ...c
    });
    setIsEdit(true);
    setOpen(true);
  };
  const save = async () => {
    const cleanRuc = form.ruc.replace(/\D/g, "").slice(0, 11);
    const rucErr = validateRuc(cleanRuc);
    if (rucErr) {
      toast.error(rucErr);
      return;
    }
    if (!form.razonSocial.trim()) {
      toast.error("Razón Social es obligatoria");
      return;
    }
    setSaving(true);
    try {
      if (!isEdit) {
        const exists = await rucExists(cleanRuc);
        if (exists) {
          toast.error(`El RUC ${cleanRuc} ya está registrado`);
          return;
        }
      }
      await upsertContribuyente({
        ...form,
        ruc: cleanRuc
      });
      toast.success(isEdit ? "Contribuyente actualizado" : "Contribuyente registrado");
      setOpen(false);
    } catch (e) {
      const msg = formatRequestError(e, "No se pudo guardar el contribuyente");
      if (msg.includes("duplicate") || msg.includes("23505") || msg.includes("409")) {
        toast.error("El RUC ya existe en la base de datos");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (ruc) => {
    if (!confirm(`¿Eliminar contribuyente ${ruc}?`)) return;
    setDeletingRuc(ruc);
    try {
      await removeContribuyente(ruc);
      toast.success("Contribuyente eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    } finally {
      setDeletingRuc(null);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-10 animate-spin text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Cargando contribuyentes (",
        getDataSourceLabel(),
        ")…"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1400px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6 flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-8 text-primary" }),
          "Contribuyentes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1 text-sm", children: [
          "Maestro de clientes sincronizado con Supabase · tabla",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: "contribuyentes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExportButtons, { compact: true, disabled: contribuyentes.length === 0, onExportExcel: async () => exportContribuyentesExcel(contribuyentes), onImportExcel: async (file) => {
          const rows = await readImportFile(file);
          const validation = validateImportColumns(rows, CONTRIBUYENTES_IMPORT_COLUMNS);
          if (!validation.ok) {
            throw new Error(`Columnas faltantes: ${validation.missing.join(", ")}. Use la plantilla de exportación CONTAM.`);
          }
          const mapped = rows.map((row) => ({
            ...emptyContribuyente(),
            ruc: String(row.ruc ?? "").replace(/\D/g, "").slice(0, 11),
            razonSocial: String(row.razon_social ?? ""),
            estado: String(row.estado ?? "ACTIVO"),
            cat1ra: Boolean(row.cat1ra),
            cat2da: Boolean(row.cat2da),
            cat3ra: Boolean(row.cat3ra),
            cat4taRetenciones: Boolean(row.cat4ta_retenciones),
            cat4taCtaPropia: Boolean(row.cat4ta_cta_propia),
            cat5ta: Boolean(row.cat5ta)
          }));
          await bulkUpsertContribuyentes(mapped);
          await refresh();
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
            "Nuevo contribuyente"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? "Editar contribuyente" : "Registrar contribuyente" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "RUC * (11 dígitos)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ruc, disabled: isEdit, maxLength: 11, onChange: (e) => setForm({
                    ...form,
                    ruc: e.target.value.replace(/\D/g, "").slice(0, 11)
                  }) }),
                  !isEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Debe ser único en el sistema." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estado del cliente" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.estado, onValueChange: (v) => setForm({
                    ...form,
                    estado: v
                  }), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ACTIVO", children: "Activo" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "INACTIVO", children: "Inactivo" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "DE_BAJA", children: "De baja" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Razón Social *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.razonSocial, onChange: (e) => setForm({
                    ...form,
                    razonSocial: e.target.value
                  }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Otros" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.otros, onChange: (e) => setForm({
                    ...form,
                    otros: e.target.value
                  }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha V. Declaración" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fechaVencimientoDeclaracion, onChange: (e) => setForm({
                    ...form,
                    fechaVencimientoDeclaracion: e.target.value
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mb-3", children: "Registro de categorías" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-2", children: CATEGORIAS.map(({
                  key,
                  label
                }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form[key], onCheckedChange: (v) => setForm({
                    ...form,
                    [key]: !!v
                  }) }),
                  label
                ] }, key)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Central de credenciales" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CredPair, { label: "CLAVE SOL", usuario: form.claveSol.usuario, clave: form.claveSol.clave, onUsuario: (v) => setForm({
                  ...form,
                  claveSol: {
                    ...form.claveSol,
                    usuario: v
                  }
                }), onClave: (v) => setForm({
                  ...form,
                  claveSol: {
                    ...form.claveSol,
                    clave: v
                  }
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CredPair, { label: "AFP NET", usuario: form.afpNet.usuario, clave: form.afpNet.clave, onUsuario: (v) => setForm({
                  ...form,
                  afpNet: {
                    ...form.afpNet,
                    usuario: v
                  }
                }), onClave: (v) => setForm({
                  ...form,
                  afpNet: {
                    ...form.afpNet,
                    clave: v
                  }
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CredPair, { label: "VALIDEZ CPE", usuario: form.validezCpe.usuario, clave: form.validezCpe.clave, onUsuario: (v) => setForm({
                  ...form,
                  validezCpe: {
                    ...form.validezCpe,
                    usuario: v
                  }
                }), onClave: (v) => setForm({
                  ...form,
                  validezCpe: {
                    ...form.validezCpe,
                    clave: v
                  }
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CredPair, { label: "CLAVES SIRE", usuario: form.clavesSire.usuario, clave: form.clavesSire.clave, onUsuario: (v) => setForm({
                  ...form,
                  clavesSire: {
                    ...form.clavesSire,
                    usuario: v
                  }
                }), onClave: (v) => setForm({
                  ...form,
                  clavesSire: {
                    ...form.clavesSire,
                    clave: v
                  }
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), disabled: saving, children: "Cancelar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void save(), disabled: saving, children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }),
                "Guardando…"
              ] }) : "Guardar" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Error de conexión" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => void refresh(), children: "Reintentar" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-blue-200/60 bg-blue-50/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-blue-700" }),
          "Total contribuyentes"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-blue-800", children: kpis.total }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-emerald-200/60 bg-emerald-50/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Activos" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-emerald-700", children: kpis.activos }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-blue-200/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Inactivos" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-blue-700", children: kpis.inactivos }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-2 border-red-200/60 bg-red-50/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "De baja" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-red-700", children: kpis.deBaja }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Buscar por RUC o razón social" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "20123456789…", value: q, onChange: (e) => setQ(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "RUC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Razón social" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Estado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Venc. declaración" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Categorías" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "No hay contribuyentes. Registre el primero con el botón superior." }) }) : filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono font-medium", children: c.ruc }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-xs truncate", children: c.razonSocial }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: estadoBadge(c.estado) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: c.fechaVencimientoDeclaracion || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: CATEGORIAS.filter((cat) => c[cat.key]).map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: cat.label.split(" ")[0] }, cat.key)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-red-600", disabled: deletingRuc === c.ruc, onClick: () => void handleDelete(c.ruc), children: deletingRuc === c.ruc ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] })
      ] }, c.ruc)) })
    ] }) })
  ] });
}
export {
  ContribuyentesPage as component
};
