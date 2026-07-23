import { L as jsxRuntimeExports, U as reactExports } from "./server-Bo29azLP.js";
import { ac as supabase, ar as useQueryClient, aj as toast, x as formatSupabaseError, L as Link } from "./router-B2fOVgbK.js";
import { u as useMutation } from "./useMutation-BW7ClUbS.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { F as FieldHelper } from "./field-helper-BvfRNaAW.js";
import { I as Input } from "./input-CVw-0GOD.js";
import { L as Label } from "./label-DrIl1YMr.js";
import { B as Badge } from "./badge-yaC6QAMb.js";
import { u as useQuery } from "./useQuery-BWRVlDqX.js";
import { S as Save } from "./save-BH6o-scK.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-BjHsyqGX.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, c as DialogFooter } from "./dialog-BvZLNj9g.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-B9UO78R2.js";
import { u as upsertPcgeCuenta, s as setPcgeActivo, f as fetchPcgeCuentas, b as buildPcgeTree, j as useCuentaDetalle, i as getNivelNombre, h as getColorNivel, e as formatCuentaPcge, n as normalizePcgeCode, c as computeNivelFromCodigo, v as validatePCGEHierarchy, a as computePadreCodigo, g as generarCodigoPcgeHijo, k as usePcgeCuentas } from "./pcge-service-ByOdw3ht.js";
import { P as Plus } from "./plus-BZJzn-4g.js";
import { P as Pencil } from "./pencil-DwmoUqpy.js";
import { a as createLucideIcon } from "./index-CWutStw1.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { C as ChevronDown } from "./chevron-up-kSt2_UA7.js";
import { C as ChevronRight } from "./chevron-right-BUCAQpLv.js";
import { F as FileText } from "./file-text-C6WtH0h-.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { P as PremiumEmptyState } from "./premium-empty-state-Cve2OItO.js";
import { S as Search } from "./search-Jjuvdmyj.js";
import { C as CircleAlert } from "./circle-alert-Cna6VmV6.js";
import { R as ResponsiveContainer } from "./generateCategoricalChart-Bx15tFyN.js";
import { A as AreaChart } from "./AreaChart-DjUf8R99.js";
import { A as Area } from "./Area-CNet8Ygk.js";
import { B as BookOpen } from "./book-open-DuhpnH3U.js";
import { D as Download } from "./download-BejVGX4c.js";
import { h as useForm, u, F as Form, b as FormField, c as FormItem, d as FormLabel, a as FormControl, e as FormMessage, o as objectType, f as booleanType, s as stringType } from "./form-CUh1Vx2p.js";
import { S as Switch } from "./switch-pNzoGnQj.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-DBf2jt_8.js";
import { C as Check } from "./Combination-D4Tn14OX.js";
import { X } from "./x-B5oN35Uv.js";
import { L as LoaderCircle } from "./loader-circle-DUOoJQci.js";
import { L as Landmark } from "./landmark-Bx7N_VPd.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./info-CGwkGZ-6.js";
import "./index-CG6nsUgb.js";
import "./index-Bkm5nwUb.js";
import "./index-M3oW48Eb.js";
import "./index-DkWXu2TP.js";
const __iconNode$3 = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const Folder = createLucideIcon("folder", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
      key: "gugj83"
    }
  ]
];
const Table2 = createLucideIcon("table-2", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "9", cy: "12", r: "3", key: "u3jwor" }],
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "7", key: "g7kal2" }]
];
const ToggleLeft = createLucideIcon("toggle-left", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "15", cy: "12", r: "3", key: "1afu0r" }],
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "7", key: "g7kal2" }]
];
const ToggleRight = createLucideIcon("toggle-right", __iconNode);
const DEFAULT_CONFIG_CONTABLE = {
  id: 1,
  cuenta_caja_default: "101101",
  cuenta_cxc_default: "121201",
  cuenta_cxp_default: "421201",
  created_at: (/* @__PURE__ */ new Date(0)).toISOString(),
  updated_at: (/* @__PURE__ */ new Date(0)).toISOString()
};
function isMissingConfigError(error) {
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return code === "PGRST116" || code === "PGRST205" || code === "42P01" || msg.includes("404") || msg.includes("not found") || msg.includes("does not exist");
}
async function fetchConfigContable() {
  const { data, error } = await supabase.from("config_contable").select("id, cuenta_caja_default, cuenta_cxc_default, cuenta_cxp_default, created_at, updated_at").eq("id", 1).maybeSingle();
  if (error) {
    if (isMissingConfigError(error)) {
      return DEFAULT_CONFIG_CONTABLE;
    }
    throw error;
  }
  if (!data) {
    return DEFAULT_CONFIG_CONTABLE;
  }
  return data;
}
async function updateConfigContable(patch) {
  const { error } = await supabase.from("config_contable").upsert(
    {
      id: 1,
      ...patch
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}
function useConfigContable() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["config", "contable"],
    queryFn: fetchConfigContable
  });
  const update = useMutation({
    mutationFn: updateConfigContable,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["config", "contable"] });
    }
  });
  return { query, update };
}
function ConfigContableCard() {
  const { query, update } = useConfigContable();
  const cfg = query.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card shadow-sm p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Cuentas por defecto (cancelaciones)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Se usan al generar el asiento de cobro/pago desde SIRE. Puedes ajustarlas sin tocar código." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-blue-500/40 text-blue-700", children: "Configuración" })
    ] }),
    query.isLoading || !cfg ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-6 text-center", children: "Cargando configuración…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        className: "grid md:grid-cols-3 gap-3",
        onSubmit: async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const cuenta_caja_default = String(fd.get("cuenta_caja_default") ?? "").trim();
          const cuenta_cxc_default = String(fd.get("cuenta_cxc_default") ?? "").trim();
          const cuenta_cxp_default = String(fd.get("cuenta_cxp_default") ?? "").trim();
          try {
            await update.mutateAsync({ cuenta_caja_default, cuenta_cxc_default, cuenta_cxp_default });
            toast.success("Configuración guardada");
          } catch (err) {
            toast.error(err?.message ?? "No se pudo guardar");
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cuenta Caja (10)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { name: "cuenta_caja_default", defaultValue: cfg.cuenta_caja_default, className: "font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Cuenta PCGE Clase 10 usada por defecto al liquidar cobros/pagos en caja." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cuenta por cobrar (12)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { name: "cuenta_cxc_default", defaultValue: cfg.cuenta_cxc_default, className: "font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Cuenta de clientes (ej. 121201) para cancelaciones de ventas." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cuenta por pagar (42)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { name: "cuenta_cxp_default", defaultValue: cfg.cuenta_cxp_default, className: "font-mono" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Cuenta de proveedores (ej. 421201) para cancelaciones de compras." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: update.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 mr-2" }),
            "Guardar"
          ] }) })
        ]
      }
    )
  ] });
}
function usePcge() {
  const qc = useQueryClient();
  const cuentasQuery = useQuery({
    queryKey: ["pcge", "cuentas"],
    queryFn: fetchPcgeCuentas
  });
  const upsert = useMutation({
    mutationFn: upsertPcgeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pcge", "cuentas"] });
    }
  });
  const setActivo = useMutation({
    mutationFn: ({ codigo_cuenta, activo }) => setPcgeActivo(codigo_cuenta, activo),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pcge", "cuentas"] });
    }
  });
  return { cuentasQuery, upsert, setActivo };
}
function PcgeForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
  loading
}) {
  const [codigoCuenta, setCodigoCuenta] = reactExports.useState(initial?.codigo_cuenta ?? "");
  const [nombreCuenta, setNombreCuenta] = reactExports.useState(initial?.nombre_cuenta ?? "");
  const [tipoCuenta, setTipoCuenta] = reactExports.useState(initial?.tipo_cuenta ?? "");
  const [nivel, setNivel] = reactExports.useState(initial?.nivel != null ? String(initial.nivel) : "");
  const [naturaleza, setNaturaleza] = reactExports.useState(initial?.naturaleza ?? "");
  const [aplicaPara, setAplicaPara] = reactExports.useState(initial?.aplica_para ?? "");
  const [palabrasClave, setPalabrasClave] = reactExports.useState(initial?.palabras_clave ?? "");
  const [activo, setActivo] = reactExports.useState(initial?.activo ?? true);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial?.codigo_cuenta ? "Editar cuenta" : "Nueva cuenta" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { variant: "info", children: "Mantenga códigos alineados al PCGE peruano. Las cuentas activas aparecen en selectores del Libro Diario y Caja." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Código de cuenta (PK)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: codigoCuenta,
            onChange: (e) => setCodigoCuenta(e.target.value),
            placeholder: "Ej: 101101, 121201 (sin puntos)",
            disabled: !!initial?.codigo_cuenta
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Código numérico secuencial sin puntos (ej. 101101 Caja, 121201 Facturas por cobrar)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Nombre de cuenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: nombreCuenta,
            onChange: (e) => setNombreCuenta(e.target.value),
            placeholder: "Ej: Caja, IGV por pagar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Denominación descriptiva visible en reportes y comboboxes contables." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-lg border p-3 bg-muted/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "text-sm font-medium cursor-pointer", children: "Campos opcionales (estructura SUNAT)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tipo de cuenta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tipoCuenta, onChange: (e) => setTipoCuenta(e.target.value), placeholder: "Activo, Pasivo, etc." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Nivel (opcional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: nivel, onChange: (e) => setNivel(e.target.value.replace(/\D/g, "")), placeholder: "Auto si vacío" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Naturaleza" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: naturaleza, onChange: (e) => setNaturaleza(e.target.value), placeholder: "Deudora / Acreedora" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Aplica para" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: aplicaPara, onChange: (e) => setAplicaPara(e.target.value), placeholder: "Ventas, Compras, Caja…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Palabras clave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: palabrasClave, onChange: (e) => setPalabrasClave(e.target.value), placeholder: "Separadas por coma" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3 bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Estado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Si se desactiva, ya no aparece en selectores del Libro Diario." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setActivo((v) => !v), children: activo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRight, { className: "size-4 mr-2" }),
          " Activa"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleLeft, { className: "size-4 mr-2" }),
          " Inactiva"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        disabled: loading,
        onClick: () => onSubmit({
          id: initial?.id,
          codigo_cuenta: codigoCuenta,
          nombre_cuenta: nombreCuenta,
          activo,
          tipo_cuenta: tipoCuenta.trim() || null,
          nivel: nivel.trim() ? Number(nivel) : null,
          naturaleza: naturaleza.trim() || null,
          aplica_para: aplicaPara.trim() || null,
          palabras_clave: palabrasClave.trim() || null
        }),
        children: "Guardar"
      }
    ) })
  ] }) });
}
function PcgeTable() {
  const { cuentasQuery, upsert, setActivo } = usePcge();
  const [q, setQ] = reactExports.useState("");
  const [openNew, setOpenNew] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const cuentas = cuentasQuery.data ?? [];
  const filtered = reactExports.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cuentas;
    return cuentas.filter(
      (c) => `${c.codigo_cuenta} ${c.nombre_cuenta}`.toLowerCase().includes(needle)
    );
  }, [cuentas, q]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Plan de Cuentas (PCGE)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Tabla oficial ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: "plan_contable_pcge" }),
          " · clave",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: "codigo_cuenta" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            className: "w-64",
            placeholder: "Buscar por código o nombre…",
            value: q,
            onChange: (e) => setQ(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpenNew(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
          " Nueva"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4", children: cuentasQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-10 text-center", children: "Cargando plan de cuentas…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-32", children: "Código" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Nombre" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24 text-center", children: "Nivel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-center", children: "Estado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-40 text-right", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-sm text-muted-foreground py-10", children: "Sin resultados." }) }) : filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: c.codigo_cuenta }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.nombre_cuenta }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: c.nivel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: c.activo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-emerald-500/50 text-emerald-700", children: "Activa" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-amber-500/50 text-amber-800", children: "Inactiva" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setEditing(c), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4 mr-2" }),
            " Editar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: async () => {
                try {
                  await setActivo.mutateAsync({
                    codigo_cuenta: c.codigo_cuenta,
                    activo: !c.activo
                  });
                  toast.success(c.activo ? "Cuenta desactivada" : "Cuenta activada");
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "No se pudo actualizar";
                  toast.error(msg);
                }
              },
              children: c.activo ? "Desactivar" : "Activar"
            }
          )
        ] }) })
      ] }, c.id ?? c.codigo_cuenta)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PcgeForm,
      {
        open: openNew,
        onOpenChange: setOpenNew,
        initial: null,
        loading: upsert.isPending,
        onSubmit: async (v) => {
          try {
            await upsert.mutateAsync(v);
            toast.success("Cuenta guardada");
            setOpenNew(false);
          } catch (e) {
            toast.error(formatSupabaseError(e));
          }
        }
      },
      "new"
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PcgeForm,
      {
        open: !!editing,
        onOpenChange: (v) => !v && setEditing(null),
        initial: editing,
        loading: upsert.isPending,
        onSubmit: async (v) => {
          try {
            await upsert.mutateAsync(v);
            toast.success("Cuenta actualizada");
            setEditing(null);
          } catch (e) {
            toast.error(formatSupabaseError(e));
          }
        }
      },
      editing?.codigo_cuenta ?? "edit"
    )
  ] });
}
function TreeNode({
  node,
  depth,
  selectedCodigo,
  onSelect,
  onAddChild,
  expanded,
  toggle
}) {
  const hasChildren = node.hijos.length > 0;
  const isOpen = expanded.has(node.codigo_cuenta);
  const selected = selectedCodigo === node.codigo_cuenta;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-1 py-1 px-2 rounded-md text-sm hover:bg-muted/60",
          selected && "bg-primary/10 ring-1 ring-primary/30"
        ),
        style: { paddingLeft: `${depth * 16 + 8}px` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "size-5 shrink-0 grid place-items-center text-muted-foreground",
              onClick: () => hasChildren && toggle(node.codigo_cuenta),
              "aria-label": isOpen ? "Contraer" : "Expandir",
              children: hasChildren ? isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-4" })
            }
          ),
          node.es_agrupador ? /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "size-4 text-amber-600 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4 text-blue-600 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "flex-1 text-left min-w-0",
              onClick: () => onSelect?.(node),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium", children: node.codigo_cuenta }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-2 truncate", children: node.nombre_cuenta })
              ]
            }
          ),
          !node.activo && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs shrink-0", children: "Inactiva" }),
          onAddChild && node.es_agrupador && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-7 text-xs shrink-0",
              onClick: () => onAddChild(node),
              children: "+ Hijo"
            }
          )
        ]
      }
    ),
    hasChildren && isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: node.hijos.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      TreeNode,
      {
        node: h,
        depth: depth + 1,
        selectedCodigo,
        onSelect,
        onAddChild,
        expanded,
        toggle
      },
      h.codigo_cuenta
    )) })
  ] });
}
function ArbolPCGE({ cuentas, selectedCodigo, onSelect, onAddChild }) {
  const [busqueda, setBusqueda] = reactExports.useState("");
  const [expanded, setExpanded] = reactExports.useState(() => /* @__PURE__ */ new Set(["1", "2", "6", "7"]));
  const tree = reactExports.useMemo(() => buildPcgeTree(cuentas), [cuentas]);
  const filteredTree = reactExports.useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return tree;
    const matching = cuentas.filter(
      (c) => c.codigo_cuenta.includes(q) || c.nombre_cuenta.toLowerCase().includes(q)
    );
    return buildPcgeTree(matching);
  }, [tree, cuentas, busqueda]);
  const toggle = (code) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Buscar código o nombre…",
          value: busqueda,
          onChange: (e) => setBusqueda(e.target.value),
          className: "h-9"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Estructura secuencial sin puntos · Niveles: 1, 2, 3, 4, 6 y 8 dígitos" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[520px] overflow-y-auto p-2", children: filteredTree.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "Sin cuentas PCGE" }) : filteredTree.map((node) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      TreeNode,
      {
        node,
        depth: 0,
        selectedCodigo,
        onSelect,
        onAddChild,
        expanded,
        toggle
      },
      node.codigo_cuenta
    )) })
  ] });
}
function NivelIcon({ nivel, className }) {
  const props = { className: cn("size-4 shrink-0", className), viewBox: "0 0 16 16", fill: "none" };
  switch (nivel) {
    case 1:
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, stroke: "currentColor", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 14V6l6-4 6 4v8H2z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 14V9h4v5" })
      ] });
    case 2:
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, stroke: "currentColor", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "4", width: "5", height: "4", rx: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "9", width: "5", height: "4", rx: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "6", width: "5", height: "5", rx: "0.5" })
      ] });
    case 3:
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, stroke: "currentColor", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 2h8v12H4z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 5h4M6 8h4M6 11h2" })
      ] });
    case 4:
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, stroke: "currentColor", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 2h6v12H5z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 6h2M7 9h2" })
      ] });
    case 5:
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, stroke: "currentColor", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 5h10v6H3z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 7h6" })
      ] });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { ...props, stroke: "currentColor", strokeWidth: "1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "8", cy: "8", r: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 2v2M8 12v2M2 8h2M12 8h2" })
      ] });
  }
}
function countDescendants(node) {
  return node.hijos.reduce((acc, h) => acc + 1 + countDescendants(h), 0);
}
function TreeNodeRow({
  node,
  depth,
  expanded,
  toggle,
  selectedCodigo,
  highlight,
  onSelect,
  focusedCodigo,
  registerRef
}) {
  const hasChildren = node.hijos.length > 0;
  const isOpen = expanded.has(node.codigo_cuenta);
  const selected = selectedCodigo === node.codigo_cuenta;
  const focused = focusedCodigo === node.codigo_cuenta;
  const childCount = countDescendants(node);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        role: "treeitem",
        "aria-expanded": hasChildren ? isOpen : void 0,
        "aria-selected": selected,
        "aria-level": depth + 1,
        className: "relative",
        style: { paddingLeft: depth * 24 },
        children: [
          depth > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "absolute left-0 top-0 h-full w-6 text-[#1A2F4A] pointer-events-none",
              "aria-hidden": true,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  d: `M12 0 Q 0 12, 12 24`,
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "1"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              ref: (el) => registerRef(node.codigo_cuenta, el),
              className: cn(
                "group w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left transition-all duration-200",
                "hover:bg-white/[0.03] border-l-2 border-transparent",
                selected && "bg-premium-gold/5 border-l-premium-gold",
                focused && "ring-2 ring-premium-gold/50 ring-offset-0",
                highlight && "bg-premium-gold/10"
              ),
              onClick: () => onSelect?.(node),
              children: [
                hasChildren ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    role: "presentation",
                    className: cn(
                      "size-5 grid place-items-center text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-90"
                    ),
                    onClick: (e) => {
                      e.stopPropagation();
                      toggle(node.codigo_cuenta);
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4", strokeWidth: 1.5 })
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  NivelIcon,
                  {
                    nivel: node.nivel,
                    className: depth === 0 ? "text-premium-gold" : "text-muted-foreground"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm text-premium-cyan font-medium", children: node.codigo_cuenta }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground truncate flex-1", children: node.nombre_cuenta }),
                !node.es_agrupador && node.nivel >= 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "success", className: "text-[9px] px-1.5 py-0 rounded-full border-0", children: "OPER" }),
                hasChildren && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums shrink-0 count-up", children: [
                  "[",
                  childCount,
                  " cuentas]"
                ] })
              ]
            }
          )
        ]
      }
    ),
    hasChildren && isOpen && node.hijos.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      TreeNodeRow,
      {
        node: h,
        depth: depth + 1,
        expanded,
        toggle,
        selectedCodigo,
        highlight,
        onSelect,
        focusedCodigo,
        registerRef
      },
      h.codigo_cuenta
    ))
  ] });
}
function DetailPanel({
  codigo,
  onEdit,
  onAddChild
}) {
  const { data: detalle, isLoading } = useCuentaDetalle(codigo);
  if (isLoading || !detalle) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-32 bg-white/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full bg-white/10" })
    ] });
  }
  const chartData = detalle.estadisticas.actividad_mensual.map((a) => ({
    mes: a.mes.slice(4),
    count: a.count
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-5 slide-right h-full overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-gradient-to-br from-premium-gold/10 to-transparent p-4 border border-premium-gold/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl text-premium-cyan", children: detalle.codigo_cuenta }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-foreground mt-1", children: detalle.nombre_cuenta }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: cn("mt-2 border", getColorNivel(detalle.nivel)), children: [
        "Nivel ",
        detalle.nivel,
        " — ",
        getNivelNombre(detalle.nivel)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Naturaleza" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: cn(
              "mt-1",
              detalle.naturaleza === "deudora" ? "border-blue-500/30 bg-blue-500/10" : "border-destructive/30 bg-destructive/10"
            ),
            children: detalle.naturaleza === "deudora" ? "D — Deudora" : "A — Acreedora"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Estado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "size-2 rounded-full",
                detalle.activo ? "bg-success" : "bg-muted-foreground"
              )
            }
          ),
          detalle.activo ? "Activa" : "Inactiva"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Último movimiento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs", children: detalle.estadisticas.ultimo_movimiento ? new Date(detalle.estadisticas.ultimo_movimiento).toLocaleDateString("es-PE") : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Asientos este mes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-bold tabular-nums count-up", children: detalle.estadisticas.asientos_mes })
      ] })
    ] }),
    chartData.some((d) => d.count > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: chartData, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "pcge-act", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#00D4FF", stopOpacity: 0.3 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#00D4FF", stopOpacity: 0 })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "count", stroke: "#00D4FF", fill: "url(#pcge-act)" })
    ] }) }) }),
    detalle.hijos_directos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground mb-2", children: "Hijos directos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-32 overflow-y-auto rounded-lg border border-border/40 divide-y divide-border/30", children: detalle.hijos_directos.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 text-xs font-mono hover:bg-white/[0.03]", children: formatCuentaPcge(h) }, h.codigo_cuenta)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-2", children: [
      onEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "border-premium-gold/30 hover:bg-premium-gold/10",
          onClick: () => onEdit(detalle),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-3.5 mr-1" }),
            "Editar"
          ]
        }
      ),
      onAddChild && detalle.es_agrupador && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          className: "bg-gradient-to-r from-premium-gold/20 to-transparent border border-premium-gold/30",
          onClick: () => onAddChild(detalle),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5 mr-1" }),
            "Añadir Hijo"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "border-premium-cyan/30", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/libro-diario", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-3.5 mr-1" }),
        "Ver en Diario"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3.5 mr-1" }),
        "Exportar"
      ] })
    ] })
  ] });
}
function flattenVisible(nodes, expanded, acc = []) {
  for (const n of nodes) {
    acc.push(n);
    if (n.hijos.length && expanded.has(n.codigo_cuenta)) {
      flattenVisible(n.hijos, expanded, acc);
    }
  }
  return acc;
}
function PcgeTreePremium({
  cuentas,
  loading,
  error,
  onRetry,
  selectedCodigo,
  onSelect,
  onEdit,
  onAddChild
}) {
  const [busqueda, setBusqueda] = reactExports.useState("");
  const [expanded, setExpanded] = reactExports.useState(() => /* @__PURE__ */ new Set(["1", "2", "6", "7", "10"]));
  const [focusedCodigo, setFocusedCodigo] = reactExports.useState(null);
  const [isSearching, startSearchTransition] = reactExports.useTransition();
  const deferredSearch = reactExports.useDeferredValue(busqueda);
  const searchRef = reactExports.useRef(null);
  const nodeRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const tree = reactExports.useMemo(() => buildPcgeTree(cuentas), [cuentas]);
  const matchCodes = reactExports.useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      cuentas.filter(
        (c) => c.codigo_cuenta.includes(q) || c.nombre_cuenta.toLowerCase().includes(q)
      ).map((c) => c.codigo_cuenta)
    );
  }, [cuentas, deferredSearch]);
  const filteredTree = reactExports.useMemo(() => {
    if (!matchCodes) return tree;
    const matching = cuentas.filter((c) => matchCodes.has(c.codigo_cuenta));
    return buildPcgeTree(matching);
  }, [tree, cuentas, matchCodes]);
  const visibleFlat = reactExports.useMemo(
    () => flattenVisible(filteredTree, expanded),
    [filteredTree, expanded]
  );
  const toggle = reactExports.useCallback((code) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);
  const registerRef = reactExports.useCallback((code, el) => {
    if (el) nodeRefs.current.set(code, el);
    else nodeRefs.current.delete(code);
  }, []);
  reactExports.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const handleTreeKeyDown = (e) => {
    if (!visibleFlat.length) return;
    const idx = focusedCodigo ? visibleFlat.findIndex((n) => n.codigo_cuenta === focusedCodigo) : -1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = visibleFlat[Math.min(idx + 1, visibleFlat.length - 1)];
      setFocusedCodigo(next.codigo_cuenta);
      nodeRefs.current.get(next.codigo_cuenta)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = visibleFlat[Math.max(idx - 1, 0)];
      setFocusedCodigo(next.codigo_cuenta);
      nodeRefs.current.get(next.codigo_cuenta)?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const node = visibleFlat[idx >= 0 ? idx : 0];
      if (node?.hijos.length) toggle(node.codigo_cuenta);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const node = visibleFlat[idx >= 0 ? idx : 0];
      if (node) toggle(node.codigo_cuenta);
    } else if (e.key === "Enter" && idx >= 0) {
      e.preventDefault();
      onSelect?.(visibleFlat[idx]);
    }
  };
  const selected = cuentas.find((c) => c.codigo_cuenta === selectedCodigo);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative rounded-2xl overflow-hidden border border-[#1A2F4A]/50 bg-[#0A1628]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
      style: {
        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 12px)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-6 pt-6 pb-4 border-b border-[#1A2F4A]/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl text-premium-gold", children: "Plan Contable General Empresarial" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-light", children: "PCGE — CONASEV" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-px bg-gradient-to-r from-premium-gold/60 via-premium-gold/20 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Search,
              {
                className: cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
                  isSearching && "animate-pulse"
                ),
                strokeWidth: 1.5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                ref: searchRef,
                placeholder: "Buscar cuenta… (Ctrl+K)",
                value: busqueda,
                onChange: (e) => startSearchTransition(() => setBusqueda(e.target.value)),
                className: "pl-10 bg-[#0F1D32] border-[#1A2F4A] focus-visible:ring-premium-gold/40 font-mono"
              }
            ),
            busqueda !== deferredSearch && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse", children: "buscando..." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_340px] min-h-[560px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              role: "tree",
              "aria-label": "Árbol PCGE",
              tabIndex: 0,
              onKeyDown: handleTreeKeyDown,
              className: "max-h-[600px] overflow-y-auto p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-premium-gold/40",
              children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 p-4", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 bg-white/5 shimmer", style: { marginLeft: i % 3 * 24 } }, i)) }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 m-4 rounded-xl border border-destructive/40 bg-destructive/5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-8 text-destructive mb-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error.message }),
                onRetry && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: onRetry, children: "Reintentar" })
              ] }) : filteredTree.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                PremiumEmptyState,
                {
                  icon: Search,
                  title: busqueda ? "Sin resultados" : "No se encontraron cuentas",
                  description: busqueda ? `No hay cuentas que coincidan con "${busqueda}"` : "El plan contable está vacío. Cree la primera cuenta."
                }
              ) : filteredTree.map((node) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                TreeNodeRow,
                {
                  node,
                  depth: 0,
                  expanded,
                  toggle,
                  selectedCodigo,
                  highlight: matchCodes?.has(node.codigo_cuenta),
                  onSelect,
                  focusedCodigo,
                  registerRef
                },
                node.codigo_cuenta
              ))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "border-t lg:border-t-0 lg:border-l border-[#1A2F4A]/50 bg-[#0F1D32]/40 min-h-[280px]", children: selectedCodigo && selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(DetailPanel, { codigo: selectedCodigo, onEdit, onAddChild }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground text-sm", children: "Seleccione una cuenta del árbol para ver el detalle" }) })
        ] })
      ]
    }
  );
}
const schema = objectType({
  codigo_cuenta: stringType().min(1, "Código requerido").refine((v) => /^\d+$/.test(normalizePcgeCode(v)), "Solo dígitos, sin puntos"),
  nombre_cuenta: stringType().min(2, "Nombre requerido"),
  naturaleza: stringType().optional(),
  tipo_cuenta: stringType().optional(),
  activo: booleanType(),
  es_agrupador: booleanType()
});
function FormularioCuentaPCGE({
  open,
  onOpenChange,
  initial,
  padreCodigo,
  loading,
  onSubmit
}) {
  const form = useForm({
    resolver: u(schema),
    defaultValues: {
      codigo_cuenta: "",
      nombre_cuenta: "",
      naturaleza: "deudora",
      tipo_cuenta: "",
      activo: true,
      es_agrupador: false
    }
  });
  reactExports.useEffect(() => {
    if (!open) return;
    form.reset({
      codigo_cuenta: initial?.codigo_cuenta ?? padreCodigo ?? "",
      nombre_cuenta: initial?.nombre_cuenta ?? "",
      naturaleza: initial?.naturaleza ?? "deudora",
      tipo_cuenta: initial?.tipo_cuenta ?? "",
      activo: initial?.activo ?? true,
      es_agrupador: initial?.es_agrupador ?? false
    });
  }, [open, initial, padreCodigo, form]);
  const codigo = normalizePcgeCode(form.watch("codigo_cuenta"));
  const nivel = codigo ? computeNivelFromCodigo(codigo) : null;
  const validation = codigo ? validatePCGEHierarchy(codigo, padreCodigo ?? computePadreCodigo(codigo)) : null;
  const [generating, setGenerating] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg glass-surface border-white/10 sm:rounded-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial?.codigo_cuenta ? "Editar cuenta PCGE" : "Nueva cuenta PCGE" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        className: "grid gap-4",
        onSubmit: form.handleSubmit((values) => {
          const code = normalizePcgeCode(values.codigo_cuenta);
          onSubmit({
            ...values,
            codigo_cuenta: code,
            nivel: computeNivelFromCodigo(code),
            padre_codigo: computePadreCodigo(code)
          });
        }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormField,
            {
              control: form.control,
              name: "codigo_cuenta",
              render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Código de cuenta" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      ...field,
                      className: "font-mono",
                      placeholder: "Ej: 101101 (sin puntos)",
                      disabled: !!initial?.codigo_cuenta,
                      onChange: (e) => field.onChange(normalizePcgeCode(e.target.value))
                    }
                  ) }),
                  !initial?.codigo_cuenta && padreCodigo && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      disabled: generating,
                      className: "shrink-0 border-premium-gold/30",
                      onClick: async () => {
                        setGenerating(true);
                        try {
                          const hijo = await generarCodigoPcgeHijo(padreCodigo);
                          field.onChange(hijo);
                        } finally {
                          setGenerating(false);
                        }
                      },
                      children: "Auto"
                    }
                  ),
                  validation && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid place-items-center", children: validation.valid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-5 text-success fade-in" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5 text-destructive fade-in" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(FieldHelper, { children: [
                  "Nivel ",
                  nivel ?? "—",
                  " · Padre: ",
                  codigo ? computePadreCodigo(codigo) ?? "raíz" : "—"
                ] }),
                validation && !validation.valid && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: validation.errors[0] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormField,
            {
              control: form.control,
              name: "nombre_cuenta",
              render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Nombre de cuenta" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, placeholder: "Denominación según PCGE" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormField,
              {
                control: form.control,
                name: "naturaleza",
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Naturaleza" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "deudora", children: "Deudora" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "acreedora", children: "Acreedora" })
                    ] })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormField,
              {
                control: form.control,
                name: "tipo_cuenta",
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Tipo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field, placeholder: "Opcional" }) })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormField,
              {
                control: form.control,
                name: "activo",
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.value, onCheckedChange: field.onChange }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { className: "!mt-0", children: "Activa" })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormField,
              {
                control: form.control,
                name: "es_agrupador",
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.value, onCheckedChange: field.onChange }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { className: "!mt-0", children: "Agrupador" })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border/60 bg-muted/20 p-3 text-sm fade-in", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider mb-1", children: "Vista previa en jerarquía" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-premium-cyan", children: [
              codigo || "——",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "-" }),
              " ",
              form.watch("nombre_cuenta") || "Denominación"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading || validation != null && !validation.valid, className: "hover-lift", children: [
            loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }),
            "Guardar cuenta"
          ] }) })
        ]
      }
    ) })
  ] }) });
}
function PcgePage() {
  const qc = useQueryClient();
  const [selected, setSelected] = reactExports.useState(null);
  const [openForm, setOpenForm] = reactExports.useState(false);
  const [padreCodigo, setPadreCodigo] = reactExports.useState(null);
  const [editInitial, setEditInitial] = reactExports.useState(null);
  const cuentasQuery = usePcgeCuentas();
  const saveMutation = useMutation({
    mutationFn: upsertPcgeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["pcge"]
      });
      toast.success("Cuenta PCGE guardada");
      setOpenForm(false);
      setEditInitial(null);
      setPadreCodigo(null);
    },
    onError: (e) => toast.error(e.message)
  });
  const toggleActivo = useMutation({
    mutationFn: ({
      codigo,
      activo
    }) => setPcgeActivo(codigo, activo),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["pcge"]
      });
    }
  });
  const openNewChild = async (padre) => {
    try {
      const hijo = await generarCodigoPcgeHijo(padre.codigo_cuenta);
      setPadreCodigo(padre.codigo_cuenta);
      setEditInitial({
        codigo_cuenta: hijo,
        padre_codigo: padre.codigo_cuenta,
        es_agrupador: false
      });
      setOpenForm(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar código hijo");
    }
  };
  const cuentas = cuentasQuery.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1400px] mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "size-8 text-primary" }),
          "Plan de Cuentas (PCGE)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Códigos secuenciales sin puntos · Resolución CONASEV / PCGE Perú 2026" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-blue-500/40 text-blue-700", children: [
        cuentas.length,
        " cuentas"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "explorador", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "explorador", children: "Explorador premium" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "arbol", children: "Árbol clásico" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "tabla", children: "Tabla editable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "config", children: "Configuración" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "explorador", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PcgeTreePremium, { cuentas, loading: cuentasQuery.isLoading, error: cuentasQuery.error instanceof Error ? cuentasQuery.error : null, onRetry: () => void cuentasQuery.refetch(), selectedCodigo: selected?.codigo_cuenta, onSelect: setSelected, onEdit: (c) => {
        setEditInitial(c);
        setOpenForm(true);
      }, onAddChild: openNewChild }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "arbol", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_320px] gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArbolPCGE, { cuentas, selectedCodigo: selected?.codigo_cuenta, onSelect: setSelected, onAddChild: openNewChild }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Cuenta seleccionada" }),
          selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-lg", children: selected.codigo_cuenta }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: selected.nombre_cuenta }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Nivel ",
              selected.nivel,
              " · ",
              selected.es_agrupador ? "Agrupador" : "Operativa"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                setEditInitial(selected);
                setOpenForm(true);
              }, children: "Editar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", onClick: () => toggleActivo.mutate({
                codigo: selected.codigo_cuenta,
                activo: !selected.activo
              }), children: selected.activo ? "Desactivar" : "Activar" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Seleccione una cuenta del árbol." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full", onClick: () => {
            setEditInitial(null);
            setPadreCodigo(null);
            setOpenForm(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
            "Nueva cuenta raíz"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "tabla", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Table2, { className: "size-4" }),
          "Vista tabular legacy con búsqueda y alta rápida"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PcgeTable, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "config", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigContableCard, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormularioCuentaPCGE, { open: openForm, onOpenChange: setOpenForm, initial: editInitial, padreCodigo, loading: saveMutation.isPending, onSubmit: (values) => saveMutation.mutate({
      codigo_cuenta: values.codigo_cuenta,
      nombre_cuenta: values.nombre_cuenta,
      nivel: values.nivel,
      padre_codigo: values.padre_codigo,
      es_agrupador: values.es_agrupador,
      activo: values.activo,
      naturaleza: values.naturaleza,
      tipo_cuenta: values.tipo_cuenta
    }) })
  ] });
}
export {
  PcgePage as component
};
