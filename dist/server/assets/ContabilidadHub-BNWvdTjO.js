import { U as reactExports, L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { u as useQuery } from "./useQuery-yGnE4xdj.js";
import { B as Badge } from "./badge-DnmwkqA1.js";
import { B as Button } from "./button-CUz5JvIg.js";
import { I as Input } from "./input-D7gh_qkE.js";
import { L as Label } from "./label-E-JJzORI.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-D8PPOTXl.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-CwkkZ3JC.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-Bus4Hdpw.js";
import { T as Textarea } from "./textarea-Cuj3KEz6.js";
import { m as useContribuyentes } from "./use-contribuyentes-VbWbyhxv.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { b as useLibroDiarioF51, d as useLibroDiarioSimplificadoF52, e as usePlanCuentasPCGE, T as TABLA9_COLUMNAS, a as TIPO_CUENTA_COLORS, u as useCrearAsientoManual, f as fetchContribuyenteIdByRucCont } from "./useContabilidad-BjqzZMqu.js";
import { S as StepGuardBanner } from "./StepGuardBanner-CvvN-g92.js";
import { B as BookOpen } from "./book-open-DNPuUoqV.js";
import { a as createLucideIcon } from "./index-CwvZaaA2.js";
import { L as Landmark } from "./landmark-Ca6LrNfH.js";
import { L as LoaderCircle } from "./loader-circle-CFK0bbWm.js";
import { S as Search } from "./search-BZAd-x8H.js";
import { T as Trash2 } from "./trash-2-0yvLyvOU.js";
import { P as Plus } from "./plus-Du5GJvsn.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./router-DdOnzL1Y.js";
import "./index-BmgwMWsz.js";
import "./Combination-Cm3gVzC7.js";
import "./chevron-up-CZXHkJii.js";
import "./index-RFvs7CSY.js";
import "./index-q8D09Twd.js";
import "./contribuyentes-service-D2dNpwbB.js";
import "./http-client-h7UKjZ8s.js";
import "./useMutation-CF5vIByn.js";
import "./ClientOnly-BxQ4TsRm.js";
import "./useIsMounted-cZ7hj5Yh.js";
import "./workflow-khpW1_cK.js";
import "./shield-alert-JSQsA_c2.js";
import "./triangle-alert-D9VCCoSc.js";
import "./info-CrkvcwAw.js";
const __iconNode$1 = [
  ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" }],
  ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }],
  ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }]
];
const Calculator = createLucideIcon("calculator", __iconNode$1);
const __iconNode = [
  ["path", { d: "M15 3v18", key: "14nvp0" }],
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M21 9H3", key: "1338ky" }],
  ["path", { d: "M21 15H3", key: "9uk58r" }]
];
const TableProperties = createLucideIcon("table-properties", __iconNode);
function round2(n) {
  return Math.round(n * 100) / 100;
}
function validarPartidaDoble(lineas) {
  const totalDebe = round2(lineas.reduce((s, l) => s + l.debe, 0));
  const totalHaber = round2(lineas.reduce((s, l) => s + l.haber, 0));
  const diferencia = round2(Math.abs(totalDebe - totalHaber));
  return {
    cuadrado: diferencia < 0.01,
    totalDebe,
    totalHaber,
    diferencia
  };
}
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
function useClientMounted() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function defaultPeriodo() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function formatSoles(amount, mounted) {
  if (!mounted) return "S/ —";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2
  }).format(amount);
}
function formatFecha(fecha, mounted) {
  if (!fecha || !mounted) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(fecha.includes("T") ? fecha : `${fecha}T12:00:00`));
  } catch {
    return fecha;
  }
}
function groupByCuo(filas) {
  const map = /* @__PURE__ */ new Map();
  for (const f of filas) {
    const list = map.get(f.cuo) ?? [];
    list.push(f);
    map.set(f.cuo, list);
  }
  return map;
}
function TablaFormato51({
  filas,
  loading,
  mounted,
  totalDebe,
  totalHaber,
  cuadrado
}) {
  const grouped = reactExports.useMemo(() => groupByCuo(filas), [filas]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin mr-2" }),
      "Cargando Libro Diario Formato 5.1…"
    ] });
  }
  if (filas.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-slate-500 text-sm", children: "No hay asientos con CUO para este periodo. Genere asientos desde Compras/Ventas o registre uno manual." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "CUO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Glosa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Libro T8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Sustento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Cuenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Denominación" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Debe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Haber" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Array.from(grouped.entries()).map(
        ([cuo, lineas]) => lineas.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            className: cn(
              "border-slate-800/60 hover:bg-slate-800/40",
              idx === 0 && "border-t-2 border-t-emerald-500/20"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-emerald-400", children: idx === 0 ? cuo : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: idx === 0 ? formatFecha(row.fechaOperacion, mounted) : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm max-w-[200px] truncate", title: row.glosa, children: idx === 0 ? row.glosa : lineaGlosa(row) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: idx === 0 ? row.codigoLibroTabla8 : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: idx === 0 ? row.numeroDocumentoSustentatorio ?? "—" : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: row.cuentaCodigo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-slate-400", children: row.cuentaDenominacion }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm", children: row.debe > 0 ? formatSoles(row.debe, mounted) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm", children: row.haber > 0 ? formatSoles(row.haber, mounted) : "—" })
            ]
          },
          `${cuo}-${row.correlativoLinea}-${idx}`
        ))
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4",
          cuadrado ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Total Debe:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "tabular-nums", children: formatSoles(totalDebe, mounted) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Total Haber:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "tabular-nums", children: formatSoles(totalHaber, mounted) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cuadrado ? "text-emerald-300" : "text-red-300", children: cuadrado ? "Partida doble cuadrada ✓" : "Descuadre detectado" })
        ]
      }
    )
  ] });
}
function lineaGlosa(row) {
  return row.glosa.length > 40 ? row.glosa.slice(0, 40) + "…" : row.glosa;
}
function MatrizBloque({
  titulo,
  columnas,
  filas,
  getVal,
  mounted,
  accent
}) {
  const hasData = filas.some((f) => columnas.some((c) => getVal(f, c) !== 0));
  if (!hasData) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 space-y-3"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: cn("text-sm font-semibold uppercase tracking-wider", accent), children: titulo }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 sticky left-0 bg-slate-900/95", children: "Fecha" }),
        columnas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right font-mono text-xs", children: c }, c))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filas.map((f) => {
        const rowHas = columnas.some((c) => getVal(f, c) !== 0);
        if (!rowHas) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "sticky left-0 bg-slate-900/95 text-sm", children: formatFecha(f.fechaOperacion, mounted) }),
          columnas.map((c) => {
            const v = getVal(f, c);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-xs", children: v !== 0 ? formatSoles(v, mounted) : "—" }, c);
          })
        ] }, f.fechaOperacion);
      }) })
    ] }) })
  ] });
}
function TablaFormato52({
  filas,
  loading,
  mounted
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin mr-2" }),
      "Cargando Diario Simplificado Formato 5.2…"
    ] });
  }
  if (filas.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-slate-500 text-sm", children: "Sin movimientos agregados para el periodo en formato matricial Tabla 9." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MatrizBloque,
      {
        titulo: "Activo (Tabla 9)",
        columnas: TABLA9_COLUMNAS.activo,
        filas,
        getVal: (f, c) => f.activo[c] ?? 0,
        mounted,
        accent: "text-emerald-400"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MatrizBloque,
      {
        titulo: "Pasivo (Tabla 9)",
        columnas: TABLA9_COLUMNAS.pasivo,
        filas,
        getVal: (f, c) => f.pasivo[c] ?? 0,
        mounted,
        accent: "text-red-400"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MatrizBloque,
      {
        titulo: "Patrimonio (Tabla 9)",
        columnas: TABLA9_COLUMNAS.patrimonio,
        filas,
        getVal: (f, c) => f.patrimonio[c] ?? 0,
        mounted,
        accent: "text-sky-400"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MatrizBloque,
      {
        titulo: "Gastos (Tabla 9)",
        columnas: TABLA9_COLUMNAS.gastos,
        filas,
        getVal: (f, c) => f.gastos[c] ?? 0,
        mounted,
        accent: "text-amber-400"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MatrizBloque,
      {
        titulo: "Ingresos (Tabla 9)",
        columnas: TABLA9_COLUMNAS.ingresos,
        filas,
        getVal: (f, c) => f.ingresos[c] ?? 0,
        mounted,
        accent: "text-violet-400"
      }
    )
  ] });
}
function TablaPcge({
  cuentas,
  loading,
  busqueda,
  onBusqueda
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 size-4 text-slate-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: busqueda,
          onChange: (e) => onBusqueda(e.target.value),
          className: "pl-9 bg-slate-800/50 border-slate-700",
          placeholder: "Buscar por código o denominación…"
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-12 text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin mr-2" }),
      "Cargando PCGE…"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[480px] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent sticky top-0 bg-slate-900/95", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Código" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Denominación" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Elemento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Nivel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Tipo" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (cuentas ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60 hover:bg-slate-800/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-sm", children: c.codigo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: c.denominacion }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center text-sm", children: c.elemento }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
          "N",
          c.nivel
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: cn("text-[10px]", TIPO_CUENTA_COLORS[c.tipoCuenta]),
            children: c.tipoCuenta
          }
        ) })
      ] }, c.codigo)) })
    ] }) })
  ] });
}
function FormularioAsientoManual({
  contribuyenteId,
  periodo,
  mounted
}) {
  const [fecha, setFecha] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [glosa, setGlosa] = reactExports.useState("");
  const [lineas, setLineas] = reactExports.useState([
    {
      correlativoLinea: 1,
      cuentaCodigo: "6011",
      cuentaDenominacion: "Mercaderías",
      glosa: "",
      debe: 0,
      haber: 0
    },
    {
      correlativoLinea: 2,
      cuentaCodigo: "4212",
      cuentaDenominacion: "Facturas por pagar",
      glosa: "",
      debe: 0,
      haber: 0
    }
  ]);
  const mutation = useCrearAsientoManual(contribuyenteId, periodo);
  const validacion = validarPartidaDoble(lineas);
  const addLinea = () => {
    setLineas((prev) => [
      ...prev,
      {
        correlativoLinea: prev.length + 1,
        cuentaCodigo: "",
        cuentaDenominacion: "",
        glosa: "",
        debe: 0,
        haber: 0
      }
    ]);
  };
  const removeLinea = (idx) => {
    setLineas(
      (prev) => prev.filter((_, i) => i !== idx).map((l, i) => ({ ...l, correlativoLinea: i + 1 }))
    );
  };
  const updateLinea = (idx, patch) => {
    setLineas((prev) => prev.map((l, i) => i === idx ? { ...l, ...patch } : l));
  };
  const handleSubmit = () => {
    if (!validacion.cuadrado) return;
    mutation.mutate({
      contribuyenteId,
      periodo,
      fechaOperacion: fecha,
      glosa: glosa || "Asiento manual",
      codigoLibroTabla8: "050100",
      lineas
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Fecha operación" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: fecha,
            onChange: (e) => setFecha(e.target.value),
            className: "bg-slate-800/50 border-slate-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Glosa general" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: glosa,
            onChange: (e) => setGlosa(e.target.value),
            className: "bg-slate-800/50 border-slate-700 min-h-[60px]",
            placeholder: "Descripción de la operación…"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 w-10", children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Cuenta PCGE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Denominación" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Debe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Haber" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: lineas.map((l, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-slate-500 text-xs", children: l.correlativoLinea }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: l.cuentaCodigo,
            onChange: (e) => updateLinea(idx, { cuentaCodigo: e.target.value }),
            className: "font-mono bg-slate-800/50 border-slate-700 h-8"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: l.cuentaDenominacion,
            onChange: (e) => updateLinea(idx, { cuentaDenominacion: e.target.value }),
            className: "bg-slate-800/50 border-slate-700 h-8"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            step: 0.01,
            value: l.debe || "",
            onChange: (e) => updateLinea(idx, { debe: Number(e.target.value) || 0, haber: 0 }),
            className: "text-right tabular-nums bg-slate-800/50 border-slate-700 h-8"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            step: 0.01,
            value: l.haber || "",
            onChange: (e) => updateLinea(idx, { haber: Number(e.target.value) || 0, debe: 0 }),
            className: "text-right tabular-nums bg-slate-800/50 border-slate-700 h-8"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "size-8 text-slate-500 hover:text-red-400",
            onClick: () => removeLinea(idx),
            disabled: lineas.length <= 2,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" })
          }
        ) })
      ] }, idx)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addLinea, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        "Agregar línea"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Debe: ",
          formatSoles(validacion.totalDebe, mounted)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Haber: ",
          formatSoles(validacion.totalHaber, mounted)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: validacion.cuadrado ? "text-emerald-300" : "text-red-300", children: validacion.cuadrado ? "Cuadrado" : `Diff ${validacion.diferencia.toFixed(2)}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleSubmit,
          disabled: !validacion.cuadrado || mutation.isPending || lineas.some((l) => !l.cuentaCodigo),
          className: "bg-emerald-600 hover:bg-emerald-500",
          children: [
            mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin mr-2" }) : null,
            "Registrar asiento"
          ]
        }
      )
    ] })
  ] });
}
function ContabilidadHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [tab, setTab] = reactExports.useState("f51");
  const [busquedaPcge, setBusquedaPcge] = reactExports.useState("");
  const options = reactExports.useMemo(
    () => contribuyentes.filter((c) => c.ruc?.trim()).map((c) => ({
      ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
      label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`
    })),
    [contribuyentes]
  );
  reactExports.useEffect(() => {
    if (!selectedRuc && options.length > 0) setSelectedRuc(options[0].ruc);
  }, [options, selectedRuc]);
  const contribuyente = reactExports.useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc]
  );
  const { data: resolvedId } = useQuery({
    queryKey: ["contribuyente-id-cont", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucCont(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 6e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const f51Query = useLibroDiarioF51(contribuyenteId, periodo, tab === "f51");
  const f52Query = useLibroDiarioSimplificadoF52(contribuyenteId, periodo, tab === "f52");
  const pcgeQuery = usePlanCuentasPCGE(busquedaPcge || void 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-6 text-emerald-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-100", children: "Contabilidad General & Libros SUNAT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "PCGE · Formato 5.1 Libro Diario · Formato 5.2 Diario Simplificado (Tabla 9)" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuardBanner,
      {
        contribuyenteId,
        periodo,
        vista: "contabilidad"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex flex-wrap gap-4 items-end"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 min-w-[240px] lg:flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Contribuyente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: selectedRuc || void 0,
            onValueChange: setSelectedRuc,
            disabled: loadingContrib,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione RUC…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.ruc, children: o.label }, o.ruc)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Periodo (YYYYMM)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: periodo,
            onChange: (e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6)),
            className: "w-32 bg-slate-800/50 border-slate-700 font-mono",
            maxLength: 6
          }
        )
      ] })
    ] }),
    !contribuyenteId && tab !== "pcge" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4 text-sm text-amber-300/90 border-amber-500/30"), children: "Seleccione un contribuyente para consultar libros diarios o registrar asientos." }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-slate-800/60 border border-slate-700/80 flex-wrap h-auto gap-1 p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "f51",
            className: "data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-300 gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-4" }),
              "Libro Diario (F5.1)"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "f52",
            className: "data-[state=active]:bg-sky-600/20 data-[state=active]:text-sky-300 gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableProperties, { className: "size-4" }),
              "Diario Simplificado (F5.2)"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "pcge",
            className: "data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300 gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "size-4" }),
              "Plan de Cuentas (PCGE)"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "manual",
            className: "data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-300 gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "size-4" }),
              "Nuevo Asiento Manual"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "f51", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablaFormato51,
        {
          filas: f51Query.data?.filas ?? [],
          loading: f51Query.isLoading,
          mounted,
          totalDebe: f51Query.data?.totalDebe ?? 0,
          totalHaber: f51Query.data?.totalHaber ?? 0,
          cuadrado: f51Query.data?.cuadrado ?? false
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "f52", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablaFormato52,
        {
          filas: f52Query.data?.filas ?? [],
          loading: f52Query.isLoading,
          mounted
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pcge", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablaPcge,
        {
          cuentas: pcgeQuery.data,
          loading: pcgeQuery.isLoading,
          busqueda: busquedaPcge,
          onBusqueda: setBusquedaPcge
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "manual", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4"), children: contribuyenteId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormularioAsientoManual,
        {
          contribuyenteId,
          periodo,
          mounted
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 text-sm py-8 text-center", children: "Seleccione contribuyente para registrar asientos manuales." }) }) })
    ] })
  ] });
}
export {
  ContabilidadHub
};
