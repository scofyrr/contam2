import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { u as useQuery } from "./useQuery-GwWd8T8C.js";
import { B as Badge } from "./badge-R7vlE0zl.js";
import { I as Input } from "./input-Dd5Cl0P5.js";
import { L as Label } from "./label-RwV7o-pk.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BAtobcg4.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-D2g8SVZq.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-C5yJfdlB.js";
import { m as useContribuyentes } from "./use-contribuyentes-CgGZLenc.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { a as useCompras, d as useVentas, b as useResumenFiscalPeriodo, C as CircleArrowDown, l as labelTipoOperacionVenta, u as useActualizarDestinoIgv, f as fetchContribuyenteIdByRucCv } from "./useComprasVentas-nWrSYML1.js";
import { R as Receipt } from "./receipt-By7dVNAU.js";
import { S as Search } from "./search-CYPX3dQn.js";
import { T as TrendingUp } from "./trending-up-CcZmLxtW.js";
import { S as Scale } from "./scale-CDGgGODT.js";
import { T as TrendingDown } from "./trending-down-BmLuyfec.js";
import { C as CircleArrowUp } from "./circle-arrow-up-5Wy1zm5C.js";
import { S as ShoppingCart } from "./shopping-cart-DTB2pxfH.js";
import { L as LoaderCircle } from "./loader-circle-D9KbOhZE.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./router-B2oVQHub.js";
import "./index-CE2u8TBR.js";
import "./index-CRO2D6uM.js";
import "./Combination-zo30HTiN.js";
import "./chevron-up-CdlYVDxF.js";
import "./index-D5JWF47-.js";
import "./index-CLwIwY0T.js";
import "./contribuyentes-service-DhFtq9J9.js";
import "./http-client-BVL7nK2k.js";
import "./useMutation-DD5rBZOv.js";
const DESTINO_IGV_LABELS = {
  DESTINO_1_GRAVADO: "Destino 1 — Gravado (100% CF)",
  DESTINO_2_MIXTO: "Destino 2 — Mixto (Prorrata)",
  DESTINO_3_NO_GRAVADO: "Destino 3 — No Gravado",
  SIN_CREDITO_FISCAL: "Sin Crédito Fiscal"
};
const DESTINO_IGV_COLORS = {
  DESTINO_1_GRAVADO: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
  DESTINO_2_MIXTO: "border-amber-500/50 bg-amber-500/15 text-amber-300",
  DESTINO_3_NO_GRAVADO: "border-red-500/50 bg-red-500/15 text-red-300",
  SIN_CREDITO_FISCAL: "border-slate-500/50 bg-slate-500/15 text-slate-400"
};
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
const DESTINOS = [
  "DESTINO_1_GRAVADO",
  "DESTINO_2_MIXTO",
  "DESTINO_3_NO_GRAVADO",
  "SIN_CREDITO_FISCAL"
];
const DESTINO_EMOJI = {
  DESTINO_1_GRAVADO: "🟢",
  DESTINO_2_MIXTO: "🟡",
  DESTINO_3_NO_GRAVADO: "🔴",
  SIN_CREDITO_FISCAL: "⚪"
};
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
function formatComprobante(serie, numero) {
  return `${serie ?? "—"}-${numero}`;
}
function KpiGlassCard({
  label,
  value,
  icon,
  accent = "emerald",
  sub
}) {
  const accentClass = accent === "sky" ? "border-sky-500/30 bg-sky-500/10 text-sky-300" : accent === "amber" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : accent === "red" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex flex-col gap-2"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-slate-400", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("rounded-lg border p-2", accentClass), children: icon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-semibold tabular-nums", children: value }),
    sub ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500", children: sub }) : null
  ] });
}
function DestinoIgvSelector({
  compra,
  contribuyenteId,
  periodo,
  mounted
}) {
  const mutation = useActualizarDestinoIgv(contribuyenteId, periodo);
  if (!mounted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: DESTINO_IGV_COLORS[compra.destinoIgv], children: [
      DESTINO_EMOJI[compra.destinoIgv],
      " …"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Select,
    {
      value: compra.destinoIgv,
      disabled: mutation.isPending,
      onValueChange: (v) => mutation.mutate({ compraId: compra.id, nuevoDestino: v }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectTrigger,
          {
            className: cn(
              "h-8 w-[200px] text-xs border",
              DESTINO_IGV_COLORS[compra.destinoIgv]
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectValue, { children: [
              DESTINO_EMOJI[compra.destinoIgv],
              " ",
              DESTINO_IGV_LABELS[compra.destinoIgv].split("—")[0].trim()
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: DESTINOS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: d, className: "text-xs", children: [
          DESTINO_EMOJI[d],
          " ",
          DESTINO_IGV_LABELS[d]
        ] }, d)) })
      ]
    }
  );
}
function TablaCompras({
  compras,
  loading,
  mounted,
  contribuyenteId,
  periodo
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin mr-2" }),
      "Cargando compras RCE…"
    ] });
  }
  if (compras.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-slate-500 text-sm", children: "No hay compras registradas para este periodo. Sincronice SIRE o importe comprobantes." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Fecha" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Comprobante" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "RUC Proveedor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Razón Social" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Destino IGV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Base" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "IGV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Detracción" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Total" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: compras.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60 hover:bg-slate-800/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: formatFecha(c.fechaEmision, mounted) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: formatComprobante(c.serie, c.numero) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: c.rucProveedor ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[180px] truncate text-sm", title: c.razonSocialProveedor ?? "", children: c.razonSocialProveedor ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DestinoIgvSelector,
        {
          compra: c,
          contribuyenteId,
          periodo,
          mounted
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm", children: formatSoles(c.baseImponible, mounted) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm", children: formatSoles(c.igv, mounted) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: c.detraccion.tieneDetraccion ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Badge,
        {
          variant: "outline",
          className: "border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px]",
          children: formatSoles(c.detraccion.monto, mounted)
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600 text-xs", children: "—" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-medium text-sm", children: formatSoles(c.total, mounted) })
    ] }, c.id)) })
  ] }) });
}
function TablaVentas({
  ventas,
  loading,
  mounted
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin mr-2" }),
      "Cargando ventas RVIE…"
    ] });
  }
  if (ventas.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-slate-500 text-sm", children: "No hay ventas registradas para este periodo." });
  }
  const tipoColor = {
    GRAVADA: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    EXONERADA: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    INAFECTA: "border-slate-500/40 bg-slate-500/10 text-slate-300",
    EXPORTACION: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    MIXTA: "border-amber-500/40 bg-amber-500/10 text-amber-300"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Fecha" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Comprobante" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "RUC Cliente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Razón Social" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Tipo Operación" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Base" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "IGV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Perc./Ret." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Total" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: ventas.map((v) => {
      const base = v.baseImponibleGravada + v.valorExonerado + v.valorInafecto + v.exportacion;
      const percRet = (v.percepcion.tienePercepcion ? v.percepcion.monto : 0) + (v.retencion.tieneRetencion ? v.retencion.monto : 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60 hover:bg-slate-800/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: formatFecha(v.fechaEmision, mounted) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: formatComprobante(v.serie, v.numero) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: v.rucCliente ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[180px] truncate text-sm", title: v.razonSocialCliente ?? "", children: v.razonSocialCliente ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-[10px]", tipoColor[v.tipoOperacion]), children: labelTipoOperacionVenta(v.tipoOperacion) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm", children: formatSoles(base, mounted) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm", children: formatSoles(v.igv, mounted) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm", children: percRet > 0 ? formatSoles(percRet, mounted) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-medium text-sm", children: formatSoles(v.total, mounted) })
      ] }, v.id);
    }) })
  ] }) });
}
function ComprasVentasHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [tab, setTab] = reactExports.useState("compras");
  const [busqueda, setBusqueda] = reactExports.useState("");
  const [filtroDestino, setFiltroDestino] = reactExports.useState("ALL");
  const options = reactExports.useMemo(
    () => contribuyentes.filter((c) => c.ruc?.trim()).map((c) => ({
      ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
      label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`
    })),
    [contribuyentes]
  );
  reactExports.useEffect(() => {
    if (!selectedRuc && options.length > 0) {
      setSelectedRuc(options[0].ruc);
    }
  }, [options, selectedRuc]);
  const contribuyente = reactExports.useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc]
  );
  const { data: resolvedContribuyenteId } = useQuery({
    queryKey: ["contribuyente-id-by-ruc-cv", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucCv(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 6e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedContribuyenteId ?? null;
  const filtrosCompras = reactExports.useMemo(
    () => ({
      busqueda: busqueda || void 0,
      destinoIgv: filtroDestino === "ALL" ? void 0 : filtroDestino
    }),
    [busqueda, filtroDestino]
  );
  const filtrosVentas = reactExports.useMemo(
    () => ({
      busqueda: busqueda || void 0
    }),
    [busqueda]
  );
  const comprasQuery = useCompras(
    contribuyenteId,
    periodo,
    filtrosCompras,
    tab === "compras"
  );
  const ventasQuery = useVentas(contribuyenteId, periodo, filtrosVentas, tab === "ventas");
  const resumenQuery = useResumenFiscalPeriodo(contribuyenteId, periodo);
  const resumen = resumenQuery.data;
  const saldoLabel = resumen && resumen.saldoFavorEstimado > 0 ? "Saldo a favor estimado" : "IGV por pagar estimado";
  const saldoValor = resumen && resumen.saldoFavorEstimado > 0 ? resumen.saldoFavorEstimado : resumen?.igvAPagarEstimado ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "size-6 text-emerald-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-100", children: "Compras & Ventas Fiscal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "RCE 130400 · RVIE 140400 — Clasificación IGV, detracciones y resumen tributario" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex flex-wrap gap-4 items-end"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 min-w-[200px] lg:col-span-2", children: [
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
            placeholder: "202607",
            maxLength: 6
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[200px] space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Buscar RUC / Razón Social" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 size-4 text-slate-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: busqueda,
              onChange: (e) => setBusqueda(e.target.value),
              className: "pl-9 bg-slate-800/50 border-slate-700",
              placeholder: "Buscar…"
            }
          )
        ] })
      ] }),
      tab === "compras" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 min-w-[180px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Destino IGV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: filtroDestino,
            onValueChange: (v) => setFiltroDestino(v),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "bg-slate-900 border-slate-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ALL", children: "Todos" }),
                DESTINOS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: d, children: [
                  DESTINO_EMOJI[d],
                  " ",
                  DESTINO_IGV_LABELS[d]
                ] }, d))
              ] })
            ]
          }
        )
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiGlassCard,
        {
          label: "Débito Fiscal (IGV Ventas)",
          value: resumenQuery.isLoading ? "…" : formatSoles(resumen?.debitoFiscalIgvVentas ?? 0, mounted),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4" }),
          accent: "sky",
          sub: `${resumen?.cantidadVentas ?? 0} comprobantes RVIE`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiGlassCard,
        {
          label: "Crédito Fiscal Destino 1",
          value: resumenQuery.isLoading ? "…" : formatSoles(resumen?.creditoFiscalDestino1 ?? 0, mounted),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowDown, { className: "size-4" }),
          accent: "emerald"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiGlassCard,
        {
          label: "Crédito Fiscal Prorrata (D2)",
          value: resumenQuery.isLoading ? "…" : formatSoles(resumen?.creditoFiscalDestino2Prorrata ?? 0, mounted),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "size-4" }),
          accent: "amber"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiGlassCard,
        {
          label: saldoLabel,
          value: resumenQuery.isLoading ? "…" : formatSoles(saldoValor, mounted),
          icon: resumen && resumen.saldoFavorEstimado > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "size-4" }),
          accent: resumen && resumen.saldoFavorEstimado > 0 ? "emerald" : "red",
          sub: `${resumen?.cantidadCompras ?? 0} compras · CF total ${mounted ? formatSoles(resumen?.creditoFiscalTotal ?? 0, true) : "—"}`
        }
      )
    ] }),
    !contribuyenteId ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4 text-sm text-amber-300/90 border-amber-500/30"), children: "Seleccione un contribuyente para ver compras, ventas y el resumen fiscal del periodo." }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-slate-800/60 border border-slate-700/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "compras",
            className: "data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-300 gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "size-4" }),
              "Compras (RCE 130400)"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "ventas",
            className: "data-[state=active]:bg-sky-600/20 data-[state=active]:text-sky-300 gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4" }),
              "Ventas (RVIE 140400)"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "compras", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablaCompras,
        {
          compras: comprasQuery.data ?? [],
          loading: comprasQuery.isLoading,
          mounted,
          contribuyenteId: contribuyenteId ?? "",
          periodo
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ventas", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablaVentas,
        {
          ventas: ventasQuery.data ?? [],
          loading: ventasQuery.isLoading,
          mounted
        }
      ) }) })
    ] })
  ] });
}
export {
  ComprasVentasHub
};
