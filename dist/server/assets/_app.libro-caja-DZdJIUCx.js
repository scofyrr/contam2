import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { u as useQuery } from "./useQuery-GwWd8T8C.js";
import { aq as useQueryClient, ai as toast, U as normalizeCuentaContable, ah as toAsientoContableInsert, ab as supabase, M as logSupabaseAsientosInsertError, a6 as round2, C as CUENTAS_DEFAULT, A as ASIENTOS_CONTABLES_SELECT, e as Route } from "./router-B2oVQHub.js";
import { u as useMutation } from "./useMutation-DD5rBZOv.js";
import { B as Badge } from "./badge-R7vlE0zl.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { I as Input } from "./input-Dd5Cl0P5.js";
import { L as Label } from "./label-RwV7o-pk.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BAtobcg4.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-D2g8SVZq.js";
import { q as queryKeys, u as upsertCuentaFinanciera, d as desactivarCuentaFinanciera, f as fetchCuentasFinancieras, i as invalidateLibrosContables, M as MEDIOS_PAGO_SUNAT, E as EmpresaPeriodoFilters, R as RequireRucEmptyState } from "./cuentas-financieras-types-DEKfIFQg.js";
import { B as Building2 } from "./building-2-v1OgJ2ot.js";
import { L as LoaderCircle } from "./loader-circle-D9KbOhZE.js";
import { T as Trash2 } from "./trash-2-CC6UBID0.js";
import { P as Plus } from "./plus-C29oSYCs.js";
import { A as AlertDialog, h as AlertDialogTrigger, c as AlertDialogContent, f as AlertDialogHeader, g as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, b as AlertDialogCancel, a as AlertDialogAction } from "./alert-dialog-BocKgvac.js";
import { r as revertirCancelacion } from "./asiento-cancelacion-4iC7JQQw.js";
import { a as createLucideIcon } from "./index-CE2u8TBR.js";
import { F as FieldHelper } from "./field-helper-UTMa-c_C.js";
import { S as Save } from "./save-H8aVsndN.js";
import { N as NuevaTareaButton } from "./NuevaTareaButton-nvdCd55j.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-C5yJfdlB.js";
import { S as Skeleton } from "./skeleton-BkQkQtWf.js";
import { ejecutarCentralizarPeriodo, createMovimientoCaja, fetchMovimientosCaja, updateMovimientoCaja, fetchMovimientosSinCentralizar } from "./caja-service-Camm94UV.js";
import { u as useDjangoApi } from "./http-client-BVL7nK2k.js";
import { E as Eye } from "./eye-BgtFYd0r.js";
import { R as RotateCcw } from "./rotate-ccw-Dx8IZWvr.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { W as Wallet } from "./wallet-CSrOfDFg.js";
import { T as TrendingUp } from "./trending-up-CcZmLxtW.js";
import { T as TrendingDown } from "./trending-down-BmLuyfec.js";
import { R as ResponsiveContainer } from "./generateCategoricalChart-KNjCq9By.js";
import { L as LineChart } from "./LineChart-CXqZZ6kG.js";
import { L as Line } from "./Line-CzmUveWp.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, c as DialogFooter } from "./dialog-BIzYKlAi.js";
import { P as Progress } from "./progress-CZqzYq6n.js";
import { T as Textarea } from "./textarea-DrawpDgB.js";
import { R as RefreshCw } from "./refresh-cw-Yr6mvBQG.js";
import { L as Link2 } from "./link-2-DpTJ_R60.js";
import { C as Check } from "./Combination-zo30HTiN.js";
import { X } from "./x-BCtce-HD.js";
import { T as TriangleAlert } from "./triangle-alert-C9v1hrNU.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CRO2D6uM.js";
import "./chevron-up-CdlYVDxF.js";
import "./user-ybrHQhP7.js";
import "./search-CYPX3dQn.js";
import "./index-Dvhuoo-C.js";
import "./index-CLwIwY0T.js";
import "./circle-alert-DbPjfWqU.js";
import "./info-PkWkoNZu.js";
import "./FormularioTarea-CpJ9j136.js";
import "./form-t0HAEuz2.js";
import "./switch-IOC3J6ru.js";
import "./tareas-service-D-yCbpRg.js";
import "./index-D5JWF47-.js";
const __iconNode$3 = [
  ["path", { d: "M17 7 7 17", key: "15tmo1" }],
  ["path", { d: "M17 17H7V7", key: "1org7z" }]
];
const ArrowDownLeft = createLucideIcon("arrow-down-left", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
];
const ArrowUpRight = createLucideIcon("arrow-up-right", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M12 12v6", key: "3ahymv" }],
  ["path", { d: "m15 15-3-3-3 3", key: "15xj92" }]
];
const FileUp = createLucideIcon("file-up", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode);
function CuentasFinancierasPanel({ ruc }) {
  const qc = useQueryClient();
  const [draft, setDraft] = reactExports.useState({
    nombre: "",
    tipo: "BANCO",
    cuenta_contable: "104101",
    banco: "BCP",
    numero_cuenta: ""
  });
  const query = useQuery({
    queryKey: queryKeys.cuentasFinancieras(ruc),
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: !!ruc
  });
  const saveMutation = useMutation({
    mutationFn: () => upsertCuentaFinanciera({
      ruc,
      nombre: draft.nombre,
      tipo: draft.tipo,
      cuenta_contable: draft.cuenta_contable,
      banco: draft.tipo === "BANCO" ? draft.banco : null,
      numero_cuenta: draft.numero_cuenta || null,
      activo: true
    }),
    onSuccess: () => {
      toast.success("Cuenta financiera guardada");
      setDraft((d) => ({ ...d, nombre: "", numero_cuenta: "" }));
      qc.invalidateQueries({ queryKey: queryKeys.cuentasFinancieras(ruc) });
    },
    onError: (e) => toast.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => desactivarCuentaFinanciera(id),
    onSuccess: () => {
      toast.success("Cuenta desactivada");
      qc.invalidateQueries({ queryKey: queryKeys.cuentasFinancieras(ruc) });
    },
    onError: (e) => toast.error(e.message)
  });
  const rows = query.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-5 text-primary" }),
          "Cuentas financieras (Clase 10)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cajas chicas y cuentas bancarias vinculadas al PCGE" })
      ] }),
      query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 flex justify-center text-muted-foreground gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
        "Cargando…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cuenta PCGE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Banco / N° cuenta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-16" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.nombre }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: c.tipo === "BANCO" ? "Banco" : "Caja chica" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: c.cuenta_contable }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: [c.banco, c.numero_cuenta].filter(Boolean).join(" · ") || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: !c.id.startsWith("local-") && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "size-8 text-destructive",
              onClick: () => deleteMutation.mutate(c.id),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" })
            }
          ) })
        ] }, c.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "BCP Corriente Soles",
            value: draft.nombre,
            onChange: (e) => setDraft((d) => ({ ...d, nombre: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: draft.tipo,
            onValueChange: (v) => setDraft((d) => ({
              ...d,
              tipo: v,
              cuenta_contable: v === "CAJA_CHICA" ? "101101" : "104101"
            })),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "CAJA_CHICA", children: "Caja chica" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "BANCO", children: "Banco" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuenta contable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: draft.cuenta_contable,
            onChange: (e) => setDraft((d) => ({ ...d, cuenta_contable: e.target.value }))
          }
        )
      ] }),
      draft.tipo === "BANCO" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Banco" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: draft.banco,
            onChange: (e) => setDraft((d) => ({ ...d, banco: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "N° cuenta (opcional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: draft.numero_cuenta,
            onChange: (e) => setDraft((d) => ({ ...d, numero_cuenta: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "w-full",
          disabled: !draft.nombre.trim() || saveMutation.isPending,
          onClick: () => saveMutation.mutate(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-1" }),
            "Agregar cuenta"
          ]
        }
      ) })
    ] })
  ] });
}
async function fetchFlujoCajaBancos(params) {
  const ruc = params.ruc.trim();
  if (!ruc) return [];
  let q = supabase.from("asientos_contables").select(ASIENTOS_CONTABLES_SELECT).eq("tipo_libro", "CAJA_BANCOS").eq("ruc_contraparte", ruc).order("fecha_asiento", { ascending: false }).limit(500);
  if (params.periodo?.trim()) q = q.eq("periodo", params.periodo.trim());
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    sire_registro_id: row.sire_registro_id,
    fecha_asiento: String(row.fecha_asiento),
    periodo: String(row.periodo),
    cuenta_contable: String(row.cuenta_contable),
    debe: Number(row.debe ?? 0),
    haber: Number(row.haber ?? 0),
    glosa: row.glosa,
    naturaleza: row.naturaleza === "haber" ? "haber" : "debe",
    origen: String(row.tipo_asiento ?? ""),
    tipo_libro: row.tipo_libro,
    tipo_registro: row.tipo_registro,
    ruc: row.ruc_contraparte,
    serie_cdp: row.serie_cdp,
    nro_cdp_inicial: row.nro_cdp_inicial
  }));
}
async function registrarOperacionDirectaCaja(params) {
  const debe = round2(params.debe);
  const haber = round2(params.haber);
  if (debe <= 0 && haber <= 0) throw new Error("Indique un monto en Debe o Haber.");
  if (debe > 0 && haber > 0) throw new Error("No puede registrar Debe y Haber simultáneos.");
  const cuenta10 = normalizeCuentaContable(params.cuentaFinanciera);
  const cuentaContra = normalizeCuentaContable(params.contrapartida);
  if (!cuenta10) throw new Error("Cuenta financiera inválida.");
  const filas = [];
  if (debe > 0) {
    filas.push(
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuenta10,
        glosa: params.glosa,
        debe,
        haber: 0,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim()
      }),
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuentaContra || CUENTAS_DEFAULT.gastoCompra,
        glosa: params.glosa,
        debe: 0,
        haber: debe,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim()
      })
    );
  } else {
    filas.push(
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuentaContra || CUENTAS_DEFAULT.gastoCompra,
        glosa: params.glosa,
        debe: haber,
        haber: 0,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim()
      }),
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuenta10,
        glosa: params.glosa,
        debe: 0,
        haber,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim()
      })
    );
  }
  const { error } = await supabase.from("asientos_contables").insert(filas);
  if (error) {
    logSupabaseAsientosInsertError(error, filas, "registrarOperacionDirectaCaja");
    throw error;
  }
}
function formatMoney(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function FlujoCajaTable({
  ruc,
  periodo
}) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.libroCajaBancos(ruc, periodo),
    queryFn: () => fetchFlujoCajaBancos({
      ruc,
      periodo
    }),
    enabled: !!ruc
  });
  const anular = useMutation({
    mutationFn: (sireRegistroId) => revertirCancelacion(sireRegistroId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.libroCajaBancos(ruc, periodo) });
      await qc.invalidateQueries({ queryKey: ["registros_sire"] });
      await qc.invalidateQueries({ queryKey: ["cancelaciones"] });
    }
  });
  const rows = query.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card overflow-x-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium", children: "Flujo de efectivo (CAJA_BANCOS)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cancelaciones desde Libro Diario y operaciones directas · solo tipo_libro = CAJA_BANCOS" })
    ] }),
    query.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 flex justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
      "Cargando movimientos…"
    ] }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground text-sm", children: 'No hay movimientos de caja para este periodo. Use "Registrar Pago / Cobro" en el Libro Diario.' }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Glosa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cuenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ingreso" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Egreso" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Origen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Anular" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.map((row) => {
        const ingreso = row.debe > 0 ? row.debe : 0;
        const egreso = row.haber > 0 ? row.haber : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: row.fecha_asiento }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            ingreso > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "size-4 text-emerald-600 shrink-0 mt-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4 text-red-600 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: row.glosa })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: row.cuenta_contable }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-emerald-700", children: ingreso > 0 ? formatMoney(ingreso) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-red-700", children: egreso > 0 ? formatMoney(egreso) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: row.origen === "cancelacion_caja" ? "Cancelación CxP/CxC" : "Directo" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: row.sire_registro_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                title: "Anular este movimiento",
                disabled: anular.isPending,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 text-destructive" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "¿Anular movimiento?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                  "Se eliminará el asiento de cancelación y el movimiento de caja.",
                  " ",
                  "El comprobante SIRE volverá a estado",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pendiente" }),
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancelar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AlertDialogAction,
                  {
                    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    onClick: () => anular.mutate(row.sire_registro_id),
                    children: "Sí, anular"
                  }
                )
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) })
        ] }, row.id);
      }) })
    ] })
  ] });
}
function OperacionDirectaForm({
  ruc,
  periodo
}) {
  const qc = useQueryClient();
  const [fecha, setFecha] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [glosa, setGlosa] = reactExports.useState("");
  const [tipo, setTipo] = reactExports.useState("egreso");
  const [monto, setMonto] = reactExports.useState("");
  const [cuentaFinId, setCuentaFinId] = reactExports.useState("");
  const [contrapartida, setContrapartida] = reactExports.useState("401111");
  const [medioPago, setMedioPago] = reactExports.useState("009");
  const cuentasQuery = useQuery({
    queryKey: queryKeys.cuentasFinancieras(ruc),
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: !!ruc
  });
  const cuentaSel = (cuentasQuery.data ?? []).find((c) => c.id === cuentaFinId) ?? cuentasQuery.data?.[0];
  const mutation = useMutation({
    mutationFn: async () => {
      const val = Number(monto);
      if (!cuentaSel || val <= 0) throw new Error("Indique monto y cuenta financiera.");
      const glosaFull = `${glosa.trim()} · Medio ${medioPago}`;
      await registrarOperacionDirectaCaja({
        ruc,
        periodo: periodo.trim(),
        fecha,
        glosa: glosaFull,
        cuentaFinanciera: cuentaSel.cuenta_contable,
        debe: tipo === "ingreso" ? val : 0,
        haber: tipo === "egreso" ? val : 0,
        contrapartida
      });
    },
    onSuccess: () => {
      toast.success("Operación directa registrada (CAJA_BANCOS)");
      setGlosa("");
      setMonto("");
      invalidateLibrosContables(qc);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Operación directa (sin CPE)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tributos SUNAT, transferencias entre cuentas, gastos de caja chica, planilla neta" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipo, onValueChange: (v) => setTipo(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "egreso", children: "Egreso (salida de caja/banco)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ingreso", children: "Ingreso (entrada a caja/banco)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Egreso = salida de efectivo; Ingreso = entrada. Sin comprobante electrónico vinculado." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fecha, onChange: (e) => setFecha(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Fecha de la operación de tesorería dentro del periodo contable." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto (S/)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0.01,
            step: 0.01,
            value: monto,
            onChange: (e) => setMonto(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Importe en soles de la operación. Debe ser mayor a cero." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Glosa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Pago PDTE mes, transferencia BCP→BBVA…",
            value: glosa,
            onChange: (e) => setGlosa(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Motivo de la operación: tributos, transferencias, gastos de caja chica, etc." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medio de pago" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: medioPago, onValueChange: setMedioPago, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MEDIOS_PAGO_SUNAT.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: m.codigo, children: [
            m.codigo,
            " — ",
            m.label
          ] }, m.codigo)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Código de medio de pago según catálogo SUNAT (Tabla 01)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuenta financiera" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: cuentaFinId || cuentaSel?.id || "",
            onValueChange: setCuentaFinId,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Caja o banco" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (cuentasQuery.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
                c.nombre,
                " (",
                c.cuenta_contable,
                ")"
              ] }, c.id)) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Caja o banco (Clase 10) desde donde sale o entra el efectivo." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuenta contrapartida" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "401111 tributos, 421201…",
            value: contrapartida,
            onChange: (e) => setContrapartida(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Cuenta de contrapartida contable (ej. 401111 tributos, 421201 proveedores)." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        disabled: mutation.isPending || !glosa.trim() || !periodo.trim() || Number(monto) <= 0,
        onClick: () => mutation.mutate(),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 mr-1" }),
          "Registrar operación"
        ]
      }
    )
  ] });
}
async function centralizarPeriodoInteligente(params) {
  const { data, error } = await supabase.rpc("rpc_centralizacion_inteligente", {
    p_ruc: params.ruc.trim(),
    p_periodo: params.periodo.trim(),
    p_cuenta_financiera_id: params.cuentaFinancieraId ?? null,
    p_agrupacion: params.agrupacion ?? "cuenta",
    p_dry_run: params.dryRun ?? true
  });
  if (error) {
    if (params.dryRun !== false) throw error;
    if (useDjangoApi()) throw error;
    const legacy = await ejecutarCentralizarPeriodo({ ruc: params.ruc, periodo: params.periodo });
    return [
      {
        grupoNombre: "Resumen",
        cuentaContable: "—",
        cantidadMovimientos: legacy.movimientosVinculados,
        totalIngresos: 0,
        totalEgresos: 0,
        montoNeto: 0,
        asientoGeneradoId: legacy.asientoReferenciaId
      }
    ];
  }
  return (data ?? []).map((r) => ({
    grupoNombre: String(r.grupo_nombre ?? ""),
    cuentaContable: String(r.cuenta_contable ?? ""),
    cantidadMovimientos: Number(r.cantidad_movimientos ?? 0),
    totalIngresos: Number(r.total_ingresos ?? 0),
    totalEgresos: Number(r.total_egresos ?? 0),
    montoNeto: Number(r.monto_neto ?? 0),
    asientoGeneradoId: r.asiento_generado_id ? String(r.asiento_generado_id) : null
  }));
}
async function decentralizarPeriodo(params) {
  const { data, error } = await supabase.rpc("rpc_descentralizar_periodo", {
    p_ruc: params.ruc.trim(),
    p_periodo: params.periodo.trim(),
    p_cuenta_financiera_id: params.cuentaFinancieraId ?? null
  });
  if (error) throw error;
  return data ?? [];
}
async function obtenerResumenLiquidez(ruc) {
  const { data, error } = await supabase.rpc("rpc_obtener_liquidez_global", {
    p_ruc: ruc?.trim() || null
  });
  if (error || !data?.success) {
    return buildLiquidezFallback(ruc);
  }
  const rows = data.data ?? [];
  return rows.map((r) => {
    const saldo = Number(r.saldo_disponible ?? 0);
    const porCobrar = Number(r.por_cobrar ?? 0);
    const porPagar = Number(r.por_pagar ?? 0);
    const total = Number(r.saldo_total ?? saldo + porCobrar - porPagar);
    const ratio = Number(r.ratio ?? 0);
    return {
      ruc: String(r.ruc ?? ""),
      razonSocial: String(r.razon_social ?? r.ruc ?? ""),
      saldoTotal: total,
      saldoDisponible: saldo,
      porCobrar,
      porPagar,
      ratio,
      estadoSalud: ratio >= 2 ? "SALUDABLE" : ratio >= 1 ? "ATENCION" : "CRITICO",
      variacionMes: 0,
      cuentas: [],
      sparkline: Array.from({ length: 30 }, (_, i) => saldo * (0.9 + i % 5 * 0.02))
    };
  });
}
async function buildLiquidezFallback(ruc) {
  const { fetchMovimientosCaja: fetchMovimientosCaja2 } = await import("./caja-service-Camm94UV.js");
  const { fetchCuentasFinancieras: fetchCuentasFinancieras2 } = await import("./cuentas-financieras-types-DEKfIFQg.js").then((n) => n.c);
  if (ruc?.trim()) {
    const movs = await fetchMovimientosCaja2({ ruc });
    const cuentas = await fetchCuentasFinancieras2(ruc);
    const saldo = movs.reduce((s, m) => s + Number(m.haber ?? 0) - Number(m.debe ?? 0), 0);
    return [
      {
        ruc,
        razonSocial: ruc,
        saldoTotal: saldo,
        saldoDisponible: saldo,
        porCobrar: 0,
        porPagar: 0,
        ratio: 1,
        estadoSalud: saldo > 1e4 ? "SALUDABLE" : saldo > 1e3 ? "ATENCION" : "CRITICO",
        variacionMes: 0,
        cuentas: cuentas.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          saldo: movs.filter((m) => m.cuenta_contable === c.cuenta_contable).reduce((s, m) => s + Number(m.haber ?? 0) - Number(m.debe ?? 0), 0),
          tipo: c.tipo
        })),
        sparkline: Array.from({ length: 30 }, () => saldo / 30)
      }
    ];
  }
  return [];
}
function parseMontoCsv(raw) {
  const s = raw.replace(/[^\d,.-]/g, "").replace(/,/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}
function parseFechaCsv(raw) {
  const t = raw.trim();
  if (!t) return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const dmy = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const ymd = t.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? t : d.toISOString().slice(0, 10);
}
function formatFechaEs(iso) {
  try {
    return (/* @__PURE__ */ new Date(iso + "T12:00:00")).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return iso;
  }
}
function normalizeText(s) {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
const STOP = /* @__PURE__ */ new Set(["de", "la", "el", "en", "por", "para", "con", "del", "los", "las", "y", "a"]);
function tokenSimilarity(a, b) {
  const ta = new Set(normalizeText(a).split(" ").filter((w) => w.length > 2 && !STOP.has(w)));
  const tb = new Set(normalizeText(b).split(" ").filter((w) => w.length > 2 && !STOP.has(w)));
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  for (const t of ta) if (tb.has(t)) common++;
  return common / Math.max(ta.size, tb.size);
}
function levenshteinSimilarity(a, b) {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);
  if (s1 === s2) return 1;
  const m = s1.length;
  const n = s2.length;
  if (!m || !n) return 0;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return 1 - dp[m][n] / Math.max(m, n);
}
function daysDiff(a, b) {
  const da = (/* @__PURE__ */ new Date(a + "T12:00:00")).getTime();
  const db = (/* @__PURE__ */ new Date(b + "T12:00:00")).getTime();
  return Math.abs(Math.round((da - db) / 864e5));
}
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if ((c === "," || c === ";") && !inQ) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}
const DEFAULT_CONCILIACION_CONFIG = {
  toleranciaMonto: 0.01,
  toleranciaDiasExacto: 1,
  toleranciaDiasProbable: 3,
  toleranciaDiasSugerido: 7,
  umbralSimilitudDescripcion: 0.8,
  considerarFinesDeSemana: true,
  considerarFeriados: false,
  autoConfirmarExactos: true
};
const LOCAL_CONC_KEY = "contam-conciliaciones";
function movimientoNeto(m) {
  return Math.round((Number(m.haber ?? 0) - Number(m.debe ?? 0)) * 100) / 100;
}
function toConciliable(m, cuenta) {
  const neto = movimientoNeto(m);
  return {
    id: m.id,
    fecha: String(m.fecha_operacion ?? m.fecha ?? "").slice(0, 10),
    descripcion: m.descripcion ?? m.glosa ?? "",
    monto: neto,
    tipoMovimiento: neto >= 0 ? "INGRESO" : "EGRESO",
    origenDocumento: m.origen_documento ?? m.origen ?? "manual",
    numeroDocumento: m.numero_documento ?? "",
    cuentaFinancieraId: cuenta.id,
    cuentaFinancieraNombre: cuenta.nombre,
    cuentaContable: m.cuenta_contable,
    sireRegistroId: m.registro_sire_id ?? void 0,
    asientoId: m.asiento_id ?? void 0,
    conciliado: false
  };
}
const BANK_HEADERS = {
  BCP: ["fecha", "descripcion", "referencia", "cargo", "abono", "saldo"],
  BBVA: ["fecha", "concepto", "nro_operacion", "debito", "credito", "saldo_contable"],
  INTERBANK: ["fecha", "descripcion", "nro. operacion", "debito", "credito", "saldo"],
  SCOTIABANK: ["fecha", "descripcion", "referencia", "debito", "credito", "saldo"],
  BANCO_NACION: ["fecha", "detalle", "nro_doc", "egreso", "ingreso", "saldo"],
  GENERICO_SUNAT: ["fecha", "descripcion", "referencia", "debe", "haber", "saldo"]
};
function detectBankFormat(headers) {
  const h = headers.map((x) => normalizeText(x));
  for (const [fmt2, cols] of Object.entries(BANK_HEADERS)) {
    const hits = cols.filter((c) => h.some((hh) => hh.includes(c.replace(/_/g, " ").split(" ")[0])));
    if (hits.length >= 3) return fmt2;
  }
  if (h.some((x) => x.includes("cargo")) && h.some((x) => x.includes("abono"))) return "BCP";
  return "GENERICO_SUNAT";
}
function colIndex(headers, ...candidates) {
  const h = headers.map(normalizeText);
  for (const c of candidates) {
    const i = h.findIndex((x) => x.includes(normalizeText(c)));
    if (i >= 0) return i;
  }
  return -1;
}
async function parseBankCSV(csvContent, bankFormat, onProgress) {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  bankFormat ?? detectBankFormat(headers);
  const rows = [];
  const iFecha = colIndex(headers, "fecha");
  const iDesc = colIndex(headers, "descripcion", "concepto", "detalle");
  const iRef = colIndex(headers, "referencia", "nro", "operacion", "doc");
  const iDebe = colIndex(headers, "cargo", "debito", "egreso", "debe");
  const iHaber = colIndex(headers, "abono", "credito", "ingreso", "haber");
  const iSaldo = colIndex(headers, "saldo");
  const chunk = 500;
  for (let start = 1; start < lines.length; start += chunk) {
    const end = Math.min(start + chunk, lines.length);
    for (let li = start; li < end; li++) {
      const cols = splitCsvLine(lines[li]);
      if (cols.every((c) => !c.trim())) continue;
      const fecha = parseFechaCsv(cols[iFecha >= 0 ? iFecha : 0] ?? "");
      const descripcion = cols[iDesc >= 0 ? iDesc : 1] ?? "";
      const referencia = cols[iRef >= 0 ? iRef : 2] ?? "";
      const montoDebe = parseMontoCsv(cols[iDebe >= 0 ? iDebe : 3] ?? "0");
      const montoHaber = parseMontoCsv(cols[iHaber >= 0 ? iHaber : 4] ?? "0");
      const saldo = parseMontoCsv(cols[iSaldo >= 0 ? iSaldo : 5] ?? "0");
      const raw = {};
      headers.forEach((h, idx) => {
        raw[h] = cols[idx] ?? "";
      });
      rows.push({
        id: crypto.randomUUID(),
        fecha,
        fechaFormateada: formatFechaEs(fecha),
        descripcion: descripcion.trim(),
        referencia: referencia.trim(),
        montoDebe,
        montoHaber,
        montoNeto: Math.round((montoHaber - montoDebe) * 100) / 100,
        saldo,
        tipoOperacion: classifyOperacion(descripcion),
        sucursal: "",
        moneda: descripcion.includes("USD") || referencia.includes("USD") ? "USD" : "PEN",
        rawData: raw
      });
    }
    onProgress?.(Math.round(end / lines.length * 100));
    await new Promise((r) => setTimeout(r, 0));
  }
  return rows;
}
function classifyOperacion(desc) {
  const d = desc.toUpperCase();
  if (d.includes("COMISION") || d.includes("COMISIÓN")) return "COMISION";
  if (d.includes("ITF") || d.includes("IMPUESTO")) return "IMPUESTO";
  if (d.includes("TRANSFER")) return "TRANSFERENCIA";
  if (d.includes("CHEQUE")) return "CHEQUE";
  if (d.includes("DEPOS")) return "DEPOSITO";
  return "OTRO";
}
function matchScore(ext, mov, config) {
  const montoExt = ext.montoNeto;
  const montoMov = mov.monto;
  const diffMonto = Math.abs(montoExt - montoMov);
  const diffFecha = daysDiff(ext.fecha, mov.fecha);
  if (diffMonto > config.toleranciaMonto) {
    return { nivel: null, score: 0, diff: { monto: diffMonto } };
  }
  const simDesc = Math.max(tokenSimilarity(ext.descripcion, mov.descripcion), levenshteinSimilarity(ext.descripcion, mov.descripcion));
  if (diffFecha <= config.toleranciaDiasExacto) {
    return { nivel: "EXACTO", score: 100, diff: { monto: diffMonto, fecha: diffFecha } };
  }
  if (diffFecha <= config.toleranciaDiasProbable && simDesc >= config.umbralSimilitudDescripcion) {
    const score = Math.round(60 + 25 * (1 - diffFecha / config.toleranciaDiasProbable) + 15 * simDesc);
    return { nivel: "PROBABLE", score: Math.min(99, score), diff: { monto: diffMonto, fecha: diffFecha, descripcion: ext.descripcion } };
  }
  if (diffFecha <= config.toleranciaDiasSugerido) {
    const score = Math.round(50 + 29 * (1 - diffFecha / config.toleranciaDiasSugerido));
    return { nivel: "SUGERIDO", score: Math.min(79, score), diff: { monto: diffMonto, fecha: diffFecha } };
  }
  return { nivel: null, score: 0, diff: { fecha: diffFecha } };
}
async function executeConciliacion(params) {
  const t0 = performance.now();
  const config = { ...DEFAULT_CONCILIACION_CONFIG, ...params.config };
  const cuentas = await fetchCuentasFinancieras(params.ruc);
  const cuenta = cuentas.find((c) => c.id === params.cuentaFinancieraId);
  if (!cuenta) throw new Error("Cuenta financiera no encontrada");
  const movimientosRaw = await fetchMovimientosCaja({ ruc: params.ruc, periodo: params.periodo });
  const movimientos = movimientosRaw.filter((m) => m.cuenta_contable === cuenta.cuenta_contable).map((m) => toConciliable(m, cuenta));
  const fechas = params.extracto.map((e) => e.fecha).filter(Boolean);
  const minF = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : "";
  const maxF = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : "";
  const movFiltrados = movimientos.filter((m) => {
    if (!minF || !maxF) return true;
    return m.fecha >= minF && m.fecha <= maxF;
  });
  const usedExt = /* @__PURE__ */ new Set();
  const usedMov = /* @__PURE__ */ new Set();
  const partidasConciliadas = [];
  const partidasSugeridas = [];
  const indexByAmount = /* @__PURE__ */ new Map();
  for (const m of movFiltrados) {
    const key = m.monto.toFixed(2);
    const list = indexByAmount.get(key) ?? [];
    list.push(m);
    indexByAmount.set(key, list);
  }
  for (const ext of params.extracto) {
    const key = ext.montoNeto.toFixed(2);
    const candidates = indexByAmount.get(key) ?? movFiltrados.filter((m) => Math.abs(m.monto - ext.montoNeto) <= config.toleranciaMonto);
    let best = null;
    for (const mov of candidates) {
      if (usedMov.has(mov.id)) continue;
      const { nivel, score, diff } = matchScore(ext, mov, config);
      if (!nivel || score <= (best?.score ?? 0)) continue;
      best = { mov, nivel, score, diff };
    }
    if (!best) continue;
    const pair = {
      id: crypto.randomUUID(),
      extractoRow: ext,
      movimientoSistema: best.mov,
      nivelMatch: best.nivel,
      scoreSimilitud: best.score,
      diferencias: best.diff,
      confirmado: best.nivel === "EXACTO" && config.autoConfirmarExactos,
      fechaMatch: (/* @__PURE__ */ new Date()).toISOString()
    };
    usedExt.add(ext.id);
    usedMov.add(best.mov.id);
    if (pair.confirmado) partidasConciliadas.push(pair);
    else partidasSugeridas.push(pair);
  }
  const partidasSoloExtracto = params.extracto.filter((e) => !usedExt.has(e.id));
  const partidasSoloSistema = movFiltrados.filter((m) => !usedMov.has(m.id));
  const totalExtractoIngresos = params.extracto.filter((e) => e.montoNeto > 0).reduce((s, e) => s + e.montoNeto, 0);
  const totalExtractoEgresos = params.extracto.filter((e) => e.montoNeto < 0).reduce((s, e) => s + Math.abs(e.montoNeto), 0);
  const totalSistemaIngresos = movFiltrados.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0);
  const totalSistemaEgresos = movFiltrados.filter((m) => m.monto < 0).reduce((s, m) => s + Math.abs(m.monto), 0);
  const totalPartidas = params.extracto.length + movFiltrados.length;
  const conciliadas = partidasConciliadas.length + partidasSugeridas.filter((p) => p.confirmado).length;
  const result = {
    id: crypto.randomUUID(),
    cuentaFinancieraId: params.cuentaFinancieraId,
    cuentaFinancieraNombre: cuenta.nombre,
    ruc: params.ruc,
    periodo: params.periodo,
    fechaConciliacion: (/* @__PURE__ */ new Date()).toISOString(),
    estado: "EN_PROCESO",
    partidasConciliadas,
    partidasSugeridas,
    partidasSoloExtracto,
    partidasSoloSistema,
    resumen: {
      totalExtractoIngresos: Math.round(totalExtractoIngresos * 100) / 100,
      totalExtractoEgresos: Math.round(totalExtractoEgresos * 100) / 100,
      totalExtractoNeto: Math.round((totalExtractoIngresos - totalExtractoEgresos) * 100) / 100,
      totalSistemaIngresos: Math.round(totalSistemaIngresos * 100) / 100,
      totalSistemaEgresos: Math.round(totalSistemaEgresos * 100) / 100,
      totalSistemaNeto: Math.round((totalSistemaIngresos - totalSistemaEgresos) * 100) / 100,
      diferenciaNeta: Math.round(
        (totalExtractoIngresos - totalExtractoEgresos - (totalSistemaIngresos - totalSistemaEgresos)) * 100
      ) / 100,
      porcentajeConciliacion: totalPartidas ? Math.round(conciliadas * 2 * 100 / totalPartidas) : 0,
      partidasPendientes: partidasSoloExtracto.length + partidasSoloSistema.length + partidasSugeridas.length,
      montoPendienteConciliar: Math.round(
        (partidasSoloExtracto.reduce((s, e) => s + Math.abs(e.montoNeto), 0) + partidasSoloSistema.reduce((s, m) => s + Math.abs(m.monto), 0)) * 100
      ) / 100
    },
    metadata: {
      usuario: "authenticated",
      archivoOriginal: params.archivoOriginal ?? "",
      tiempoProcesamiento: Math.round(performance.now() - t0),
      totalFilasExtracto: params.extracto.length
    }
  };
  await persistConciliacion(result);
  return result;
}
async function persistConciliacion(result) {
  const prev = loadLocalConciliaciones();
  saveLocalConciliaciones([result, ...prev.filter((c) => c.id !== result.id)]);
  const { error } = await supabase.from("conciliaciones_bancarias").insert({
    id: result.id,
    cuenta_financiera_id: result.cuentaFinancieraId,
    ruc: result.ruc,
    periodo: result.periodo,
    estado: result.estado,
    archivo_original: result.metadata.archivoOriginal,
    total_extracto: result.resumen.totalExtractoNeto,
    total_sistema: result.resumen.totalSistemaNeto,
    diferencia_neta: result.resumen.diferenciaNeta,
    porcentaje_conciliacion: result.resumen.porcentajeConciliacion,
    metadata: result
  });
}
function detectarAnomalias(movimientos) {
  const issues = [];
  const montos = movimientos.map((m) => Math.abs(m.monto));
  const mean = montos.reduce((a, b) => a + b, 0) / Math.max(montos.length, 1);
  const std = Math.sqrt(montos.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(montos.length, 1));
  for (let i = 0; i < movimientos.length; i++) {
    for (let j = i + 1; j < movimientos.length; j++) {
      const a = movimientos[i];
      const b = movimientos[j];
      if (a.fecha === b.fecha && Math.abs(a.monto - b.monto) < 0.01 && tokenSimilarity(a.descripcion, b.descripcion) > 0.9) {
        issues.push({
          id: crypto.randomUUID(),
          tipo: "DUPLICADO",
          severidad: "ALTA",
          descripcion: `Posible duplicado: ${a.descripcion.slice(0, 40)}`,
          movimientoIds: [a.id, b.id]
        });
      }
    }
  }
  for (const m of movimientos) {
    if (std > 0 && Math.abs(Math.abs(m.monto) - mean) > 3 * std) {
      issues.push({
        id: crypto.randomUUID(),
        tipo: "MONTO_INUSUAL",
        severidad: "MEDIA",
        descripcion: `Monto atípico: S/ ${Math.abs(m.monto).toFixed(2)}`,
        movimientoIds: [m.id]
      });
    }
    const dow = (/* @__PURE__ */ new Date(m.fecha + "T12:00:00")).getDay();
    if (dow === 0 || dow === 6) {
      issues.push({
        id: crypto.randomUUID(),
        tipo: "HORARIO_NO_LABORAL",
        severidad: "BAJA",
        descripcion: `Movimiento en fin de semana: ${m.fecha}`,
        movimientoIds: [m.id]
      });
    }
  }
  return issues.slice(0, 20);
}
async function confirmarMatch(conciliacionId, matchId, confirmado) {
  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (!conc) return;
  for (const p of [...conc.partidasSugeridas, ...conc.partidasConciliadas]) {
    if (p.id !== matchId) continue;
    p.confirmado = confirmado;
    if (confirmado) {
      if (!conc.partidasConciliadas.some((x) => x.id === matchId)) {
        conc.partidasConciliadas.push(p);
      }
      conc.partidasSugeridas = conc.partidasSugeridas.filter((x) => x.id !== matchId);
      conc.partidasSoloExtracto = conc.partidasSoloExtracto.filter((e) => e.id !== p.extractoRow.id);
      conc.partidasSoloSistema = conc.partidasSoloSistema.filter((m) => m.id !== p.movimientoSistema.id);
    }
  }
  saveLocalConciliaciones(stored);
}
async function crearMatchManual(conciliacionId, extractoRowId, movimientoId) {
  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (!conc) return null;
  const ext = conc.partidasSoloExtracto.find((e) => e.id === extractoRowId) ?? [...conc.partidasSugeridas, ...conc.partidasConciliadas].find((p) => p.extractoRow.id === extractoRowId)?.extractoRow;
  const mov = conc.partidasSoloSistema.find((m) => m.id === movimientoId) ?? [...conc.partidasSugeridas, ...conc.partidasConciliadas].find((p) => p.movimientoSistema.id === movimientoId)?.movimientoSistema;
  if (!ext || !mov) return null;
  const pair = {
    id: crypto.randomUUID(),
    extractoRow: ext,
    movimientoSistema: mov,
    nivelMatch: "MANUAL",
    scoreSimilitud: 100,
    diferencias: { monto: Math.abs(ext.montoNeto - mov.monto), fecha: daysDiff(ext.fecha, mov.fecha) },
    confirmado: true,
    fechaMatch: (/* @__PURE__ */ new Date()).toISOString()
  };
  conc.partidasConciliadas.push(pair);
  conc.partidasSoloExtracto = conc.partidasSoloExtracto.filter((e) => e.id !== extractoRowId);
  conc.partidasSoloSistema = conc.partidasSoloSistema.filter((m) => m.id !== movimientoId);
  conc.partidasSugeridas = conc.partidasSugeridas.filter(
    (p) => p.extractoRow.id !== extractoRowId && p.movimientoSistema.id !== movimientoId
  );
  saveLocalConciliaciones(stored);
  return pair;
}
async function agregarMovimientoDesdeExtracto(conciliacionId, extractoRow, params) {
  const mov = await createMovimientoCaja({
    ruc: params.ruc,
    periodo: params.periodo,
    fecha: extractoRow.fecha,
    fecha_operacion: extractoRow.fecha,
    glosa: extractoRow.descripcion || "Movimiento desde extracto bancario",
    cuenta_contable: params.cuentaContable,
    debe: extractoRow.montoNeto < 0 ? Math.abs(extractoRow.montoNeto) : 0,
    haber: extractoRow.montoNeto >= 0 ? extractoRow.montoNeto : 0,
    origen: "conciliacion",
    numero_documento: extractoRow.referencia,
    registro_sire_id: null,
    asiento_id: null
  });
  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (conc) {
    conc.partidasSoloExtracto = conc.partidasSoloExtracto.filter((e) => e.id !== extractoRow.id);
    saveLocalConciliaciones(stored);
  }
  return mov.id;
}
function loadLocalConciliaciones() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CONC_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveLocalConciliaciones(list) {
  localStorage.setItem(LOCAL_CONC_KEY, JSON.stringify(list.slice(0, 20)));
}
function getConciliacionLocal(conciliacionId) {
  return loadLocalConciliaciones().find((c) => c.id === conciliacionId) ?? null;
}
async function obtenerHistorialConciliaciones(cuentaFinancieraId) {
  const { data, error } = await supabase.from("conciliaciones_bancarias").select("id, fecha_conciliacion, estado, porcentaje_conciliacion, diferencia_neta").eq("cuenta_financiera_id", cuentaFinancieraId).order("fecha_conciliacion", { ascending: false }).limit(20);
  if (!error && data) {
    return data.map((r) => ({
      id: String(r.id),
      fechaConciliacion: String(r.fecha_conciliacion),
      estado: String(r.estado),
      porcentajeConciliacion: Number(r.porcentaje_conciliacion ?? 0),
      diferenciaNeta: Number(r.diferencia_neta ?? 0)
    }));
  }
  const local = loadLocalConciliaciones();
  return local.filter((c) => c.cuentaFinancieraId === cuentaFinancieraId).map((c) => ({
    id: c.id,
    fechaConciliacion: c.fechaConciliacion,
    estado: c.estado,
    porcentajeConciliacion: c.resumen.porcentajeConciliacion,
    diferenciaNeta: c.resumen.diferenciaNeta
  }));
}
async function finalizarConciliacion(conciliacionId) {
  const stored = loadLocalConciliaciones();
  const conc = stored.find((c) => c.id === conciliacionId);
  if (!conc) return null;
  conc.estado = Math.abs(conc.resumen.diferenciaNeta) < 1 ? "COMPLETADA" : "CON_DISCREPANCIAS";
  saveLocalConciliaciones(stored);
  try {
    await supabase.from("conciliaciones_bancarias").update({ estado: conc.estado, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", conciliacionId);
  } catch {
  }
  return conc;
}
const conciliacionBancariaService = {
  parseBankCSV,
  detectBankFormat,
  executeConciliacion,
  detectarAnomalias,
  confirmarMatch,
  crearMatchManual,
  agregarMovimientoDesdeExtracto,
  getConciliacionLocal,
  obtenerHistorialConciliaciones,
  finalizarConciliacion
};
function useLiquidezDashboard(ruc, periodo) {
  return useQuery({
    queryKey: ["caja", "liquidez", ruc ?? "all", periodo ?? null],
    queryFn: () => obtenerResumenLiquidez(ruc),
    staleTime: 6e4
  });
}
function useConciliacionesPendientes(cuentaFinancieraId) {
  return useQuery({
    queryKey: ["caja", "conciliaciones", cuentaFinancieraId ?? null],
    queryFn: () => cuentaFinancieraId ? obtenerHistorialConciliaciones(cuentaFinancieraId) : Promise.resolve([]),
    enabled: !!cuentaFinancieraId
  });
}
function useCentralizarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params) => centralizarPeriodoInteligente(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja"] });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    }
  });
}
function useDescentralizarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: decentralizarPeriodo,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja"] });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    }
  });
}
function useEjecutarConciliacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params) => executeConciliacion(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja", "conciliaciones"] });
    }
  });
}
function useCaja(params) {
  const qc = useQueryClient();
  const ruc = params.ruc?.trim() ?? "";
  const movimientosQuery = useQuery({
    queryKey: [
      "caja",
      "movimientos",
      ruc || null,
      params.periodo ?? null,
      params.tipo_movimiento ?? null,
      params.origen_documento ?? null
    ],
    queryFn: () => fetchMovimientosCaja({
      ruc,
      periodo: params.periodo,
      tipo_movimiento: params.tipo_movimiento,
      origen_documento: params.origen_documento
    }),
    enabled: !!ruc
  });
  const pendientesCentralizarQuery = useQuery({
    queryKey: ["caja", "pendientes_centralizar", ruc || null, params.periodo ?? null],
    queryFn: () => fetchMovimientosSinCentralizar({
      ruc,
      periodo: params.periodo?.trim() ?? ""
    }),
    enabled: !!ruc && !!params.periodo?.trim()
  });
  const create = useMutation({
    mutationFn: createMovimientoCaja,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja", "movimientos"] });
    }
  });
  const update = useMutation({
    mutationFn: ({ id, patch }) => updateMovimientoCaja(id, patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja", "movimientos"] });
    }
  });
  const centralizar = useMutation({
    mutationFn: () => ejecutarCentralizarPeriodo({
      ruc,
      periodo: params.periodo?.trim() ?? ""
    }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja"] });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    }
  });
  return { movimientosQuery, pendientesCentralizarQuery, create, update, centralizar };
}
function fmt$2(n) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}
function CajaCentralizacionPanel({ ruc, periodo }) {
  const [agrupacion, setAgrupacion] = reactExports.useState("cuenta");
  const [preview, setPreview] = reactExports.useState(null);
  const { pendientesCentralizarQuery } = useCaja({ ruc, periodo });
  const centralizar = useCentralizarPeriodo();
  const descentralizar = useDescentralizarPeriodo();
  const runPreview = async () => {
    try {
      const rows = await centralizar.mutateAsync({
        ruc,
        periodo,
        agrupacion,
        dryRun: true
      });
      setPreview(rows);
      if (rows.length === 0) toast.info("No hay movimientos pendientes de centralizar");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en vista previa");
    }
  };
  const ejecutar = async () => {
    try {
      const rows = await centralizar.mutateAsync({
        ruc,
        periodo,
        agrupacion,
        dryRun: false
      });
      setPreview(rows);
      toast.success(`Centralización ejecutada: ${rows.length} grupo(s)`);
      await pendientesCentralizarQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al centralizar");
    }
  };
  const revertir = async () => {
    try {
      await descentralizar.mutateAsync({ ruc, periodo });
      setPreview(null);
      toast.success("Centralización revertida");
      await pendientesCentralizarQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo revertir");
    }
  };
  const pendientes = pendientesCentralizarQuery.data?.length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Centralización inteligente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Agrupe movimientos sin asiento y genere asientos CAJA_BANCOS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        pendientes,
        " pendientes"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: agrupacion, onValueChange: (v) => setAgrupacion(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Agrupación" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cuenta", children: "Por cuenta PCGE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "tipo", children: "Por tipo (ingreso/egreso)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dia", children: "Por día" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "origen", children: "Por origen documento" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: runPreview, disabled: centralizar.isPending, children: [
        centralizar.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }),
        "Vista previa"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: ejecutar, disabled: centralizar.isPending || pendientes === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4" }),
        " Ejecutar"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: revertir, disabled: descentralizar.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "size-4" }),
        " Revertir período"
      ] })
    ] }),
    pendientesCentralizarQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-lg bg-white/5" }) : preview && preview.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Grupo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cuenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Mov." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ingresos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Egresos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Neto" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: preview.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: g.grupoNombre }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: g.cuentaContable }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: g.cantidadMovimientos }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-emerald-600", children: fmt$2(g.totalIngresos) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-red-500", children: fmt$2(g.totalEgresos) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: fmt$2(g.montoNeto) })
      ] }, `${g.grupoNombre}-${i}`)) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "Ejecute vista previa para ver los asientos que se generarían" })
  ] });
}
const SALUD_STYLE = {
  SALUDABLE: { label: "🟢 SALUDABLE", color: "#00C897", glow: "#00C89744" },
  ATENCION: { label: "🟡 ATENCIÓN", color: "#F0A500", glow: "#F0A50044" },
  CRITICO: { label: "🔴 CRÍTICO", color: "#FF5E7A", glow: "#FF5E7A44" }
};
function fmt$1(n) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);
}
function Sparkline({ data }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LineChart, { data: chartData, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "v", stroke: "#00C8FF", strokeWidth: 1.5, dot: false }) }) }) });
}
function EmpresaCard({ emp, onClick }) {
  const salud = SALUD_STYLE[emp.estadoSalud];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "text-left rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-4 transition-all duration-300 hover:scale-[1.03] w-full",
      style: { boxShadow: `0 8px 32px ${salud.glow}` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate text-[#E8EDF5]", children: emp.razonSocial }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#7B8FA8] font-mono", children: emp.ruc })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] shrink-0", style: { color: salud.color }, children: salud.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl font-semibold mt-3 text-[#E8EDF5]", children: fmt$1(emp.saldoTotal) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { data: emp.sparkline }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-1", children: emp.cuentas.slice(0, 3).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-[#7B8FA8]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.nombre }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[#E8EDF5]", children: fmt$1(c.saldo) })
        ] }, c.id)) }),
        emp.variacionMes !== 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            className: cn(
              "text-xs mt-2 flex items-center gap-1",
              emp.variacionMes >= 0 ? "text-[#00C897]" : "text-[#FF5E7A]"
            ),
            children: [
              emp.variacionMes >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-3" }),
              fmt$1(Math.abs(emp.variacionMes)),
              " este mes"
            ]
          }
        ) : null
      ]
    }
  );
}
function LiquidezGlobalBar({ empresas }) {
  const totals = reactExports.useMemo(() => {
    let disp = 0;
    let cxc = 0;
    let cxp = 0;
    for (const e of empresas) {
      disp += e.saldoDisponible;
      cxc += e.porCobrar;
      cxp += e.porPagar;
    }
    const total = disp + cxc;
    const ratio = cxp > 0 ? disp / cxp : disp > 0 ? 99 : 0;
    return { disp, cxc, cxp, total, ratio };
  }, [empresas]);
  const pctDisp = totals.total > 0 ? totals.disp / totals.total * 100 : 60;
  const pctCxc = totals.total > 0 ? totals.cxc / totals.total * 100 : 25;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5 mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold tracking-widest text-[#7B8FA8]", children: "L I Q U I D E Z   G L O B A L" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-lg text-[#E8EDF5]", children: fmt$1(totals.disp + totals.cxc - totals.cxp) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-4 rounded-full overflow-hidden flex bg-[#152238]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[#00C897] transition-all duration-700", style: { width: `${pctDisp}%` } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[#00C8FF] transition-all duration-700", style: { width: `${pctCxc}%` } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[#FF5E7A]/60 flex-1" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs text-[#7B8FA8]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00C897]", children: "●" }),
        " Disponible ",
        fmt$1(totals.disp)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00C8FF]", children: "●" }),
        " Por cobrar ",
        fmt$1(totals.cxc)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FF5E7A]", children: "●" }),
        " Por pagar ",
        fmt$1(totals.cxp)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "Ratio: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-[#E8EDF5]", children: [
          totals.ratio.toFixed(1),
          "x"
        ] })
      ] })
    ] })
  ] });
}
function CajaMultiEmpresaDashboardPremium({
  ruc,
  periodo,
  onSelectRuc
}) {
  const { data, isLoading, isError } = useLiquidezDashboard(ruc, periodo);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-2xl bg-white/5" }, i)) });
  }
  const empresas = data ?? [];
  if (isError || empresas.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-2xl border border-[#152238] p-8 text-center",
        style: { backgroundColor: "#060B14" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-10 mx-auto text-[#7B8FA8] mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#7B8FA8]", children: ruc ? "No hay datos de liquidez para este contribuyente. Ejecute la migración 024 o registre movimientos de caja." : "Seleccione un RUC o configure contribuyentes para ver liquidez multi-empresa." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#152238] p-4 md:p-6", style: { backgroundColor: "#060B14" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2 text-[#E8EDF5]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5 text-[#00C897]" }),
        "Dashboard de Liquidez"
      ] }),
      periodo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[#7B8FA8]", children: [
        "Período ",
        periodo
      ] }) : null
    ] }),
    !ruc && empresas.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidezGlobalBar, { empresas }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: empresas.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsx(EmpresaCard, { emp, onClick: () => onSelectRuc?.(emp.ruc) }, emp.ruc)) })
  ] });
}
const COLORS = {
  bg: "#060E1A",
  muted: "#7B8FA8",
  ok: "#00D68F",
  warn: "#F0A500",
  err: "#FF5E7A",
  bank: "#00C8FF",
  sys: "#9B87F5",
  gold: "#C8A44D"
};
function fmt(n) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}
function MetricCard({
  label,
  value,
  sub,
  accent,
  alert
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border bg-white/[0.02] backdrop-blur-sm border-white/[0.04] p-4 transition-transform hover:scale-[1.02]",
      style: { boxShadow: accent ? `0 0 24px ${accent}22` : void 0 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#7B8FA8]", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl font-semibold mt-1 text-[#E8EDF5]", children: value }),
        sub ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-xs mt-1", alert ? "text-[#FF5E7A]" : "text-[#7B8FA8]"), children: sub }) : null
      ]
    }
  );
}
function RowStatus({ status }) {
  const map = {
    ok: COLORS.ok,
    warn: COLORS.warn,
    err: COLORS.err,
    idle: COLORS.muted
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "inline-block w-1 h-full min-h-[2rem] rounded-full mr-2 shrink-0",
      style: { backgroundColor: map[status] }
    }
  );
}
function ExtractoPanel({
  rows,
  selectedId,
  filter,
  onSelect,
  onDrop,
  loading,
  progress
}) {
  const inputRef = reactExports.useRef(null);
  const filtered = reactExports.useMemo(() => {
    if (filter === "todos") return rows;
    return rows;
  }, [rows, filter]);
  const onDragOver = (e) => {
    e.preventDefault();
  };
  const onDropEv = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onDrop(f);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col h-full rounded-xl border border-[#152238] bg-[#0A1628] overflow-hidden",
      onDragOver,
      onDrop: onDropEv,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-[#152238] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-[#00C8FF]", children: "🏦 EXTRACTO BANCARIO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-[#00C8FF]/40 text-[#00C8FF]", children: "PEN" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => inputRef.current?.click(),
            className: "mx-3 mt-3 mb-2 border border-dashed border-[#00C8FF]/40 rounded-lg p-4 text-center hover:bg-[#00C8FF]/5 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "size-6 mx-auto text-[#00C8FF] mb-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#7B8FA8]", children: "Arrastra CSV del banco o haz clic" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: inputRef,
                  type: "file",
                  accept: ".csv,.txt",
                  className: "hidden",
                  onChange: (e) => {
                    const f = e.target.files?.[0];
                    if (f) onDrop(f);
                  }
                }
              )
            ]
          }
        ),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress ?? 0, className: "h-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#7B8FA8] mt-1", children: [
            "Procesando extracto… ",
            progress ?? 0,
            "%"
          ] })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-2 pb-2 space-y-1 min-h-[280px] max-h-[420px]", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-[#7B8FA8] py-8", children: "Sin filas cargadas" }) : filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onSelect(r.id),
            className: cn(
              "w-full flex items-stretch text-left rounded-lg px-2 py-2 hover:bg-white/[0.04] transition-colors",
              selectedId === r.id && "bg-white/[0.06] ring-1 ring-[#C8A44D]/50"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RowStatus, { status: "idle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#7B8FA8]", children: r.fechaFormateada }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: cn(
                        "font-mono text-sm",
                        r.montoNeto >= 0 ? "text-[#00D68F]" : "text-[#FF5E7A]"
                      ),
                      children: fmt(r.montoNeto)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs truncate text-[#E8EDF5]", children: r.descripcion })
              ] })
            ]
          },
          r.id
        )) })
      ]
    }
  );
}
function SistemaPanel({
  rows,
  selectedId,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full rounded-xl border border-[#152238] bg-[#0A1628] overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-[#152238]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-[#9B87F5]", children: "💻 SISTEMA CONTABLE" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-2 py-2 space-y-1 min-h-[280px] max-h-[420px]", children: rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center text-[#7B8FA8] py-8", children: "Sin movimientos en el período" }) : rows.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => onSelect(m.id),
        className: cn(
          "w-full flex items-stretch text-left rounded-lg px-2 py-2 hover:bg-white/[0.04]",
          selectedId === m.id && "bg-white/[0.06] ring-1 ring-[#C8A44D]/50"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RowStatus, { status: m.conciliado ? "ok" : "idle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#7B8FA8]", children: m.fecha }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "font-mono text-sm",
                    m.monto >= 0 ? "text-[#00D68F]" : "text-[#FF5E7A]"
                  ),
                  children: fmt(m.monto)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs truncate text-[#E8EDF5]", children: m.descripcion }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#7B8FA8]", children: m.origenDocumento })
          ] })
        ]
      },
      m.id
    )) })
  ] });
}
function ConnectionsPanel({ matches }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full rounded-xl border border-[#152238] bg-[#0A1628]/80 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 border-b border-[#152238] text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "size-4 mx-auto text-[#C8A44D]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#7B8FA8] mt-1", children: "Conexiones" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "flex-1 w-full min-h-[120px]", viewBox: "0 0 100 200", preserveAspectRatio: "none", children: matches.slice(0, 8).map((m, i) => {
      const y = 20 + i * 22;
      const stroke = m.nivelMatch === "EXACTO" || m.nivelMatch === "MANUAL" ? COLORS.gold : m.nivelMatch === "PROBABLE" ? COLORS.warn : COLORS.muted;
      const dash = m.nivelMatch === "SUGERIDO" ? "4 4" : void 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: `M 5 ${y} Q 50 ${y + 8} 95 ${y}`,
          fill: "none",
          stroke,
          strokeWidth: m.confirmado ? 3 : 2,
          strokeDasharray: dash,
          opacity: 0.85
        },
        m.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1 max-h-[180px] overflow-y-auto border-t border-[#152238]", children: matches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#7B8FA8] text-center py-4", children: "Sin matches" }) : matches.slice(0, 6).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-md bg-white/[0.03] px-2 py-1.5 text-[10px] border border-white/[0.04]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#C8A44D]", children: m.nivelMatch }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[#E8EDF5]", children: [
              m.scoreSimilitud,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-[#7B8FA8]", children: [
            fmt(m.extractoRow.montoNeto),
            " ⇄ ",
            fmt(m.movimientoSistema.monto)
          ] })
        ]
      },
      m.id
    )) })
  ] });
}
function ConciliacionBancariaPremium({
  ruc,
  periodo
}) {
  const [cuentaId, setCuentaId] = reactExports.useState("");
  const [extracto, setExtracto] = reactExports.useState([]);
  const [result, setResult] = reactExports.useState(null);
  const [selExt, setSelExt] = reactExports.useState(null);
  const [selMov, setSelMov] = reactExports.useState(null);
  const [parseProgress, setParseProgress] = reactExports.useState(0);
  const [parsing, setParsing] = reactExports.useState(false);
  const [finalizeOpen, setFinalizeOpen] = reactExports.useState(false);
  const [notas, setNotas] = reactExports.useState("");
  const cuentasQuery = useQuery({
    queryKey: ["cuentas_financieras", ruc],
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: !!ruc
  });
  const conciliar = useEjecutarConciliacion();
  useConciliacionesPendientes(cuentaId || null);
  const cuenta = cuentasQuery.data?.find((c) => c.id === cuentaId);
  const handleCsv = reactExports.useCallback(async (file) => {
    setParsing(true);
    setParseProgress(0);
    try {
      const text = await file.text();
      const rows = await conciliacionBancariaService.parseBankCSV(text, void 0, setParseProgress);
      setExtracto(rows);
      toast.success(`${rows.length} filas parseadas de ${file.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al parsear CSV");
    } finally {
      setParsing(false);
    }
  }, []);
  const runConciliacion = async () => {
    if (!cuentaId || extracto.length === 0) {
      toast.error("Seleccione cuenta y cargue extracto");
      return;
    }
    const res = await conciliar.mutateAsync({
      cuentaFinancieraId: cuentaId,
      ruc,
      periodo,
      extracto
    });
    setResult(res);
  };
  const allMatches = reactExports.useMemo(() => {
    if (!result) return [];
    return [...result.partidasConciliadas, ...result.partidasSugeridas];
  }, [result]);
  const anomalias = reactExports.useMemo(() => {
    if (!result) return [];
    return detectarAnomalias(result.partidasSoloSistema);
  }, [result]);
  const vincularManual = async () => {
    if (!result || !selExt || !selMov) return;
    const pair = await conciliacionBancariaService.crearMatchManual(result.id, selExt, selMov);
    if (pair) {
      const updated = conciliacionBancariaService.getConciliacionLocal(result.id);
      if (updated) setResult(updated);
      toast.success("Match manual creado");
      setSelExt(null);
      setSelMov(null);
    }
  };
  const confirmar = async (matchId, ok) => {
    if (!result) return;
    await conciliacionBancariaService.confirmarMatch(result.id, matchId, ok);
    const updated = conciliacionBancariaService.getConciliacionLocal(result.id);
    if (updated) setResult(updated);
  };
  const finalizar = async () => {
    if (!result) return;
    const fin = await conciliacionBancariaService.finalizarConciliacion(result.id);
    if (fin) {
      setResult(fin);
      setFinalizeOpen(false);
      toast.success(`Conciliación ${fin.estado === "COMPLETADA" ? "completada" : "con discrepancias"}`);
    }
  };
  if (cuentasQuery.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-xl bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-xl bg-white/5" })
    ] });
  }
  const resumen = result?.resumen;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-2xl border border-[#152238] p-4 md:p-6 space-y-4",
      style: { backgroundColor: COLORS.bg },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-[#E8EDF5]", children: "🏦 Conciliación Bancaria" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#7B8FA8]", children: [
              cuenta?.nombre ?? "Seleccione cuenta",
              " • Período ",
              periodo,
              " •",
              " ",
              result?.estado ?? "EN PROCESO"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: cuentaId,
                onChange: (e) => setCuentaId(e.target.value),
                className: "rounded-lg border border-[#152238] bg-[#0A1628] px-3 py-2 text-sm text-[#E8EDF5]",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Cuenta financiera…" }),
                  (cuentasQuery.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.id, children: [
                    c.nombre,
                    " (",
                    c.cuenta_contable,
                    ")"
                  ] }, c.id))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: runConciliacion,
                disabled: conciliar.isPending || !cuentaId || extracto.length === 0,
                className: "bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/40 hover:bg-[#00C8FF]/30",
                children: [
                  conciliar.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4" }),
                  "Ejecutar matching"
                ]
              }
            )
          ] })
        ] }),
        resumen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              label: "Total Extracto",
              value: fmt(resumen.totalExtractoNeto),
              sub: "Neto período",
              accent: COLORS.bank
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              label: "Total Sistema",
              value: fmt(resumen.totalSistemaNeto),
              sub: "Contabilidad",
              accent: COLORS.sys
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              label: "Diferencia",
              value: fmt(resumen.diferenciaNeta),
              sub: Math.abs(resumen.diferenciaNeta) > 1 ? "⚠ Atención" : "Cuadrado",
              alert: Math.abs(resumen.diferenciaNeta) > 1,
              accent: COLORS.err
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              label: "% Match",
              value: `${resumen.porcentajeConciliacion}%`,
              sub: `${resumen.partidasPendientes} pendientes`,
              accent: COLORS.ok
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[2fr_1fr_2fr] gap-3 min-h-[360px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ExtractoPanel,
            {
              rows: result?.partidasSoloExtracto.length ? [...extracto] : extracto,
              selectedId: selExt,
              filter: "todos",
              onSelect: setSelExt,
              onDrop: handleCsv,
              loading: parsing,
              progress: parseProgress
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectionsPanel, { matches: allMatches }),
            selExt && selMov ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: "bg-[#C8A44D]/20 text-[#C8A44D] border border-[#C8A44D]/40",
                onClick: vincularManual,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "size-4 mr-1" }),
                  " Vincular manualmente"
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center text-[#7B8FA8] px-2", children: "Seleccione fila en extracto y sistema para vincular" }),
            result?.partidasSugeridas.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-[#00D68F]", onClick: () => confirmar(m.id, true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-[#FF5E7A]", onClick: () => confirmar(m.id, false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-[#7B8FA8] self-center truncate flex-1", children: [
                m.nivelMatch,
                " ",
                m.scoreSimilitud,
                "%"
              ] })
            ] }, m.id))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SistemaPanel,
            {
              rows: result?.partidasSoloSistema ?? [],
              selectedId: selMov,
              onSelect: setSelMov
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[#152238] bg-[#0A1628]/60 px-4 py-3 flex flex-wrap items-center gap-4 text-xs text-[#7B8FA8]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#F0A500]", children: [
            "🟡 ",
            result?.partidasSoloExtracto.length ?? 0,
            " solo extracto"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#F0A500]", children: [
            "🟠 ",
            result?.partidasSugeridas.length ?? 0,
            " sugeridos"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#FF5E7A]", children: [
            "🔴 ",
            anomalias.length,
            " anomalías"
          ] }),
          resumen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "📊 Diferencia: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-[#E8EDF5]", children: fmt(resumen.diferenciaNeta) })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "border-[#152238]", disabled: !result, onClick: () => setFinalizeOpen(true), children: "Finalizar conciliación" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: finalizeOpen, onOpenChange: setFinalizeOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-surface border-white/10 sm:max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Finalizar conciliación" }) }),
          result ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Match: ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                result.resumen.porcentajeConciliacion,
                "%"
              ] }),
              " — Diferencia",
              " ",
              fmt(result.resumen.diferenciaNeta)
            ] }),
            Math.abs(result.resumen.diferenciaNeta) >= 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-amber-500 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4 shrink-0" }),
              "Existe diferencia neta. Puede registrar ajuste o dejar como partida conciliatoria."
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                placeholder: "Notas / observaciones",
                value: notas,
                onChange: (e) => setNotas(e.target.value),
                rows: 3
              }
            )
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setFinalizeOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: finalizar, children: "Confirmar" })
          ] })
        ] }) })
      ]
    }
  );
}
function defaultPeriodo() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7).replace("-", "");
}
function LibroCajaPage() {
  const {
    tab
  } = Route.useSearch();
  const [cliente, setCliente] = reactExports.useState(null);
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const rucSelected = cliente?.ruc?.trim() ?? "";
  const periodoFilter = periodo.trim() || null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1400px] mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-2 flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-8 text-primary" }),
          "Libro Caja y Bancos"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Movimientos CAJA_BANCOS sincronizados con el Libro Diario en tiempo real." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-blue-500/40 text-blue-700", children: "RUC obligatorio" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NuevaTareaButton, { moduloOrigen: "caja", ruc: rucSelected || void 0, entidad: "Libro Caja", tramite: "Seguimiento movimientos de caja" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EmpresaPeriodoFilters, { cliente, onClienteChange: setCliente, periodo, onPeriodoChange: setPeriodo, periodoDefault: defaultPeriodo() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: tab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cuentas", children: "A · Cuentas financieras" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "flujo", children: "B · Flujo de efectivo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "operaciones", children: "C · Operaciones directas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "liquidez", children: "D · Liquidez" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "conciliacion", children: "E · Conciliación" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "centralizacion", children: "F · Centralización" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cuentas", className: "mt-4", children: !rucSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Configure cajas chicas y bancos del contribuyente." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CuentasFinancierasPanel, { ruc: rucSelected }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "flujo", className: "mt-4", children: !rucSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "El flujo de caja se filtra por contribuyente." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FlujoCajaTable, { ruc: rucSelected, periodo: periodoFilter }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "operaciones", className: "mt-4", children: !rucSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Registre operaciones monetarias directas." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(OperacionDirectaForm, { ruc: rucSelected, periodo }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "liquidez", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CajaMultiEmpresaDashboardPremium, { ruc: rucSelected || null, periodo: periodoFilter }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "conciliacion", className: "mt-4", children: !rucSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "La conciliación bancaria requiere RUC y período." }) : !periodoFilter ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Indique el período (AAAAMM) para conciliar." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ConciliacionBancariaPremium, { ruc: rucSelected, periodo: periodoFilter }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "centralizacion", className: "mt-4", children: !rucSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Centralice movimientos de caja por contribuyente." }) : !periodoFilter ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Indique el período antes de centralizar." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CajaCentralizacionPanel, { ruc: rucSelected, periodo: periodoFilter }) })
    ] })
  ] });
}
export {
  LibroCajaPage as component
};
