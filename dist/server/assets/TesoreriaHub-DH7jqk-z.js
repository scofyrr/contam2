import { U as reactExports, L as jsxRuntimeExports } from "./server-BtEtmoed.js";
import { u as useQuery } from "./useQuery-yGnE4xdj.js";
import { B as Badge } from "./badge-DnmwkqA1.js";
import { B as Button } from "./button-CUz5JvIg.js";
import { I as Input } from "./input-D7gh_qkE.js";
import { L as Label } from "./label-E-JJzORI.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-D8PPOTXl.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-CwkkZ3JC.js";
import { m as useContribuyentes } from "./use-contribuyentes-VbWbyhxv.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, b as DialogDescription, c as DialogFooter } from "./dialog-BVSdsycQ.js";
import { T as Textarea } from "./textarea-Cuj3KEz6.js";
import { ab as supabase, ac as throwIfSupabaseError, aq as useQueryClient, ai as toast } from "./router-DdOnzL1Y.js";
import { u as useMutation } from "./useMutation-CF5vIByn.js";
import { c as contabilidadQueryKeys } from "./useContabilidad-BjqzZMqu.js";
import { c as comprasVentasQueryKeys, C as CircleArrowDown } from "./useComprasVentas-DQb_okd9.js";
import { L as LoaderCircle } from "./loader-circle-CFK0bbWm.js";
import { S as StepGuardBanner } from "./StepGuardBanner-CvvN-g92.js";
import { W as Wallet } from "./wallet-C0Zz1AOH.js";
import { B as Banknote } from "./banknote-BYn7tOOT.js";
import { C as CircleArrowUp } from "./circle-arrow-up-CLaOgqPc.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CwvZaaA2.js";
import "./index-BmgwMWsz.js";
import "./Combination-Cm3gVzC7.js";
import "./chevron-up-CZXHkJii.js";
import "./contribuyentes-service-D2dNpwbB.js";
import "./http-client-h7UKjZ8s.js";
import "./index-B1eDR-vn.js";
import "./index-q8D09Twd.js";
import "./x-RPp72KPD.js";
import "./ClientOnly-BxQ4TsRm.js";
import "./useIsMounted-cZ7hj5Yh.js";
import "./workflow-khpW1_cK.js";
import "./shield-alert-JSQsA_c2.js";
import "./triangle-alert-D9VCCoSc.js";
import "./info-CrkvcwAw.js";
const db = supabase;
function mapCuenta(row) {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    nombreCuenta: row.nombre_cuenta,
    banco: row.banco,
    numeroCuenta: row.numero_cuenta,
    cci: row.cci,
    moneda: row.moneda,
    tipoCuenta: row.tipo_cuenta,
    cuentaPcgeCodigo: row.cuenta_pcge_codigo,
    saldoActual: Number(row.saldo_actual),
    estado: row.estado,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function mapMovimiento(row) {
  const monto = Number(row.monto_soles ?? Math.max(row.debe, row.haber));
  const ingreso = row.ingreso != null ? Number(row.ingreso) : row.tipo_movimiento_enum === "INGRESO" ? monto : row.debe;
  const egreso = row.egreso != null ? Number(row.egreso) : row.tipo_movimiento_enum === "EGRESO" ? monto : row.haber;
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    periodo: row.periodo,
    cuentaBancariaId: row.cuenta_bancaria_id,
    numeroCorrelativoCaja: row.numero_correlativo_caja,
    fechaOperacion: row.fecha_operacion,
    tipoMovimiento: row.tipo_movimiento_enum,
    medioPagoTabla1: row.medio_pago_tabla1 ?? "001",
    comprobanteOrigenId: row.comprobante_origen_id,
    tipoOrigen: row.tipo_origen,
    rucDniContraparte: row.ruc_dni_contraparte,
    razonSocialContraparte: row.razon_social_contraparte,
    glosa: row.glosa,
    montoSoles: monto,
    ingreso,
    egreso,
    nombreCuenta: row.nombre_cuenta ?? null,
    banco: row.banco ?? null,
    moneda: row.moneda ?? null,
    asientoId: row.asiento_id,
    createdAt: row.created_at
  };
}
function cleanPeriodo$1(periodo) {
  return periodo.replace(/\D/g, "").slice(0, 6);
}
function calcularSaldoAcumulado(movimientos, saldoInicial = 0) {
  let saldo = saldoInicial;
  return movimientos.map((m) => {
    saldo = saldo + m.ingreso - m.egreso;
    return { ...m, saldoAcumulado: Math.round(saldo * 100) / 100 };
  });
}
async function fetchCuentasBancarias(contribuyenteId) {
  const { data, error } = await db.from("cuentas_bancarias").select("*").eq("contribuyente_id", contribuyenteId).eq("estado", "ACTIVO").order("tipo_cuenta").order("nombre_cuenta");
  throwIfSupabaseError(error, "Error al cargar cuentas bancarias");
  return (data ?? []).map(mapCuenta);
}
async function fetchMovimientosCaja(contribuyenteId, periodo, cuentaId) {
  const periodoClean = cleanPeriodo$1(periodo);
  let query = db.from("v_libro_caja_010100").select("*").eq("contribuyente_id", contribuyenteId).eq("periodo", periodoClean).order("fecha_operacion", { ascending: true }).order("numero_correlativo_caja", { ascending: true });
  if (cuentaId) {
    query = query.eq("cuenta_bancaria_id", cuentaId);
  }
  const { data, error } = await query;
  if (error) {
    let fallback = db.from("movimientos_caja").select("*").eq("contribuyente_id", contribuyenteId).eq("periodo", periodoClean).order("fecha_operacion", { ascending: true });
    if (cuentaId) fallback = fallback.eq("cuenta_bancaria_id", cuentaId);
    const res = await fallback;
    throwIfSupabaseError(res.error, "Error al cargar movimientos de caja");
    const mapped2 = (res.data ?? []).map(mapMovimiento);
    return calcularSaldoAcumulado(mapped2);
  }
  const mapped = (data ?? []).map(mapMovimiento);
  return calcularSaldoAcumulado(mapped);
}
async function ejecutarLiquidacionAtomica(payload) {
  const { data, error } = await db.rpc("rpc_liquidacion_caja_mejorada", {
    p_contribuyente_id: payload.contribuyenteId,
    p_comprobante_id: payload.comprobanteId,
    p_tipo_comprobante: payload.tipoComprobante,
    p_cuenta_bancaria_id: payload.cuentaBancariaId,
    p_medio_pago: payload.medioPago,
    p_fecha: payload.fecha,
    p_glosa: payload.glosa,
    p_monto: payload.monto,
    p_tipo_cambio: payload.tipoCambio ?? 1
  });
  throwIfSupabaseError(error, "Error en liquidación atómica");
  if (!data) throw new Error("Sin respuesta de liquidación");
  const row = data;
  if (row.ok === false) {
    return {
      ok: false,
      movimientoId: "",
      asientoId: "",
      cuo: "",
      correlativoCaja: 0,
      nuevoSaldo: 0,
      tipoMovimiento: "INGRESO",
      error: String(row.error ?? "Liquidación fallida"),
      duplicado: Boolean(row.duplicado)
    };
  }
  return {
    ok: true,
    movimientoId: String(row.movimiento_id),
    asientoId: String(row.asiento_id),
    cuo: String(row.cuo ?? ""),
    correlativoCaja: Number(row.correlativo_caja ?? 0),
    nuevoSaldo: Number(row.nuevo_saldo ?? 0),
    tipoMovimiento: row.tipo_movimiento ?? "INGRESO"
  };
}
async function fetchComprobantesPendientesLiquidacion(contribuyenteId, periodo) {
  const periodoClean = cleanPeriodo$1(periodo);
  const [comprasRes, ventasRes] = await Promise.all([
    db.from("compras_rce").select("id, serie, numero, fecha_emision, ruc_proveedor, razon_social_proveedor, total, estado_provision").eq("contribuyente_id", contribuyenteId).eq("periodo", periodoClean).neq("estado_provision", "PAGADO").neq("estado_provision", "ANULADO"),
    db.from("ventas_rvie").select("id, serie, numero, fecha_emision, ruc_cliente, razon_social_cliente, total, estado_provision").eq("contribuyente_id", contribuyenteId).eq("periodo", periodoClean).neq("estado_provision", "PAGADO").neq("estado_provision", "ANULADO")
  ]);
  throwIfSupabaseError(comprasRes.error, "Error al cargar compras pendientes");
  throwIfSupabaseError(ventasRes.error, "Error al cargar ventas pendientes");
  const compras = (comprasRes.data ?? []).map(
    (r) => ({
      id: String(r.id),
      tipo: "COMPRA",
      serie: r.serie ? String(r.serie) : null,
      numero: String(r.numero),
      fechaEmision: String(r.fecha_emision),
      rucContraparte: r.ruc_proveedor ? String(r.ruc_proveedor) : null,
      razonSocial: r.razon_social_proveedor ? String(r.razon_social_proveedor) : null,
      total: Number(r.total),
      estadoProvision: String(r.estado_provision)
    })
  );
  const ventas = (ventasRes.data ?? []).map(
    (r) => ({
      id: String(r.id),
      tipo: "VENTA",
      serie: r.serie ? String(r.serie) : null,
      numero: String(r.numero),
      fechaEmision: String(r.fecha_emision),
      rucContraparte: r.ruc_cliente ? String(r.ruc_cliente) : null,
      razonSocial: r.razon_social_cliente ? String(r.razon_social_cliente) : null,
      total: Number(r.total),
      estadoProvision: String(r.estado_provision)
    })
  );
  return [...compras, ...ventas].sort(
    (a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime()
  );
}
async function obtenerResumenCaja(contribuyenteId, periodo, cuentas, movimientos) {
  const totalIngresos = movimientos.reduce((s, m) => s + m.ingreso, 0);
  const totalEgresos = movimientos.reduce((s, m) => s + m.egreso, 0);
  return {
    contribuyenteId,
    periodo: cleanPeriodo$1(periodo),
    totalIngresos: Math.round(totalIngresos * 100) / 100,
    totalEgresos: Math.round(totalEgresos * 100) / 100,
    saldoNeto: Math.round((totalIngresos - totalEgresos) * 100) / 100,
    cantidadMovimientos: movimientos.length,
    saldoCuentas: Math.round(cuentas.reduce((s, c) => s + c.saldoActual, 0) * 100) / 100
  };
}
async function fetchContribuyenteIdByRucTes(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
const tesoreriaQueryKeys = {
  all: ["tesoreria"],
  cuentas: (contribuyenteId) => ["tesoreria", "cuentas", contribuyenteId],
  movimientos: (contribuyenteId, periodo, cuentaId) => ["tesoreria", "movimientos", contribuyenteId, periodo, cuentaId ?? "all"],
  pendientes: (contribuyenteId, periodo) => ["tesoreria", "pendientes", contribuyenteId, periodo],
  resumen: (contribuyenteId, periodo) => ["tesoreria", "resumen", contribuyenteId, periodo]
};
function cleanPeriodo(periodo) {
  return periodo.replace(/\D/g, "").slice(0, 6);
}
function useCuentasBancarias(contribuyenteId, enabled = true) {
  return useQuery({
    queryKey: tesoreriaQueryKeys.cuentas(contribuyenteId),
    queryFn: () => fetchCuentasBancarias(contribuyenteId),
    enabled: enabled && !!contribuyenteId,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useMovimientosCaja(contribuyenteId, periodo, cuentaId, enabled = true) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: tesoreriaQueryKeys.movimientos(contribuyenteId, periodoClean, cuentaId),
    queryFn: () => fetchMovimientosCaja(contribuyenteId, periodoClean, cuentaId),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 2e4,
    refetchOnWindowFocus: true
  });
}
function useComprobantesPendientes(contribuyenteId, periodo, enabled = true) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: tesoreriaQueryKeys.pendientes(contribuyenteId, periodoClean),
    queryFn: () => fetchComprobantesPendientesLiquidacion(contribuyenteId, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 3e4
  });
}
function useResumenCaja(contribuyenteId, periodo, cuentas, movimientos) {
  const periodoClean = cleanPeriodo(periodo);
  return useQuery({
    queryKey: tesoreriaQueryKeys.resumen(contribuyenteId, periodoClean),
    queryFn: () => obtenerResumenCaja(contribuyenteId, periodoClean, cuentas, movimientos ?? []),
    enabled: !!contribuyenteId && periodoClean.length === 6,
    staleTime: 2e4
  });
}
function useLiquidarComprobante(contribuyenteId, periodo) {
  const qc = useQueryClient();
  cleanPeriodo(periodo);
  return useMutation({
    mutationFn: (payload) => ejecutarLiquidacionAtomica(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: tesoreriaQueryKeys.all });
      const cuentasKey = tesoreriaQueryKeys.cuentas(contribuyenteId);
      const previousCuentas = qc.getQueryData(cuentasKey);
      qc.setQueryData(cuentasKey, (old) => {
        if (!old) return old;
        return old.map((c) => {
          if (c.id !== payload.cuentaBancariaId) return c;
          const delta = payload.tipoComprobante === "VENTA" ? payload.monto : -payload.monto;
          return { ...c, saldoActual: Math.round((c.saldoActual + delta) * 100) / 100 };
        });
      });
      return { previousCuentas };
    },
    onSuccess: async (result) => {
      if (!result.ok) {
        if (result.duplicado) {
          toast.warning(result.error ?? "Comprobante ya liquidado");
        } else {
          toast.error(result.error ?? "Liquidación fallida");
        }
        return;
      }
      toast.success(
        `Liquidación OK · CUO ${result.cuo} · Saldo S/ ${result.nuevoSaldo.toFixed(2)}`
      );
      await qc.invalidateQueries({ queryKey: tesoreriaQueryKeys.all });
      await qc.invalidateQueries({ queryKey: comprasVentasQueryKeys.all });
      await qc.invalidateQueries({ queryKey: contabilidadQueryKeys.all });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    },
    onError: (error, _vars, context) => {
      if (context?.previousCuentas) {
        qc.setQueryData(tesoreriaQueryKeys.cuentas(contribuyenteId), context.previousCuentas);
      }
      toast.error(error.message || "Error al liquidar comprobante");
    }
  });
}
const MEDIOS_PAGO_TABLA1 = [
  { codigo: "001", label: "001 — Depósito en cuenta" },
  { codigo: "003", label: "003 — Transferencia de fondos" },
  { codigo: "008", label: "008 — Efectivo" },
  { codigo: "009", label: "009 — Tarjeta de crédito" },
  { codigo: "011", label: "011 — Medios de pago de comercio electrónico" }
];
const TIPO_CUENTA_BANCARIA_LABELS = {
  CAJA_CHICA: "Caja Chica",
  CUENTA_CORRIENTE: "Cuenta Corriente",
  AHORROS: "Ahorros",
  DETRACCIONES_BN: "Detracciones BN"
};
const TIPO_CUENTA_BANCARIA_COLORS = {
  CAJA_CHICA: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  CUENTA_CORRIENTE: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  AHORROS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  DETRACCIONES_BN: "border-violet-500/40 bg-violet-500/10 text-violet-300"
};
function formatSoles$1(amount, mounted) {
  if (!mounted) return "S/ —";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2
  }).format(amount);
}
function ModalLiquidacion({
  open,
  onOpenChange,
  contribuyenteId,
  periodo,
  cuentas: cuentasProp,
  comprobantePreseleccionado,
  mounted
}) {
  const { data: cuentasQuery } = useCuentasBancarias(contribuyenteId, open && !cuentasProp);
  const cuentas = cuentasProp ?? cuentasQuery ?? [];
  const { data: pendientes = [], isLoading: loadingPendientes } = useComprobantesPendientes(
    contribuyenteId,
    periodo,
    open
  );
  const liquidar = useLiquidarComprobante(contribuyenteId, periodo);
  const [comprobanteId, setComprobanteId] = reactExports.useState("");
  const [cuentaId, setCuentaId] = reactExports.useState("");
  const [medioPago, setMedioPago] = reactExports.useState("001");
  const [fecha, setFecha] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [glosa, setGlosa] = reactExports.useState("");
  const [monto, setMonto] = reactExports.useState("");
  const comprobanteSeleccionado = pendientes.find((p) => p.id === comprobanteId);
  reactExports.useEffect(() => {
    if (!open) return;
    if (comprobantePreseleccionado) {
      setComprobanteId(comprobantePreseleccionado.id);
      setMonto(String(comprobantePreseleccionado.total));
      setGlosa(
        comprobantePreseleccionado.tipo === "COMPRA" ? `Pago compra ${comprobantePreseleccionado.serie ?? ""}-${comprobantePreseleccionado.numero}` : `Cobro venta ${comprobantePreseleccionado.serie ?? ""}-${comprobantePreseleccionado.numero}`
      );
    }
  }, [open, comprobantePreseleccionado]);
  reactExports.useEffect(() => {
    if (cuentas.length > 0 && !cuentaId) {
      setCuentaId(cuentas[0].id);
    }
  }, [cuentas, cuentaId]);
  reactExports.useEffect(() => {
    if (comprobanteSeleccionado && !comprobantePreseleccionado) {
      setMonto(String(comprobanteSeleccionado.total));
      setGlosa(
        comprobanteSeleccionado.tipo === "COMPRA" ? `Pago compra ${comprobanteSeleccionado.serie ?? ""}-${comprobanteSeleccionado.numero}` : `Cobro venta ${comprobanteSeleccionado.serie ?? ""}-${comprobanteSeleccionado.numero}`
      );
    }
  }, [comprobanteSeleccionado, comprobantePreseleccionado]);
  const handleSubmit = () => {
    if (!comprobanteId || !cuentaId || !comprobanteSeleccionado) return;
    liquidar.mutate(
      {
        contribuyenteId,
        comprobanteId,
        tipoComprobante: comprobanteSeleccionado.tipo,
        cuentaBancariaId: cuentaId,
        medioPago,
        fecha,
        glosa: glosa || "Liquidación de comprobante",
        monto: Number(monto),
        tipoCambio: 1
      },
      {
        onSuccess: (result) => {
          if (result.ok) {
            onOpenChange(false);
            setComprobanteId("");
            setMonto("");
            setGlosa("");
          }
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "bg-slate-900 border-slate-700 text-slate-100 sm:max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Liquidación directa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-slate-400", children: "Pago/cobro atómico: movimiento caja · asiento cancelación · saldo bancario · estado comprobante." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Comprobante pendiente" }),
        loadingPendientes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin mr-2" }),
          "Cargando…"
        ] }) : pendientes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-400/90", children: "No hay comprobantes pendientes en el periodo." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: comprobanteId || void 0, onValueChange: setComprobanteId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione comprobante…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700 max-h-60", children: pendientes.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
            p.tipo === "COMPRA" ? "🔴 Pago" : "🟢 Cobro",
            " · ",
            p.serie,
            "-",
            p.numero,
            " ·",
            " ",
            formatSoles$1(p.total, mounted)
          ] }, `${p.tipo}-${p.id}`)) })
        ] })
      ] }),
      comprobanteSeleccionado ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-slate-700/80 bg-slate-800/40 p-3 text-xs space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Contraparte:" }),
          " ",
          comprobanteSeleccionado.rucContraparte,
          " — ",
          comprobanteSeleccionado.razonSocial ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Total:" }),
          " ",
          formatSoles$1(comprobanteSeleccionado.total, mounted)
        ] })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Cuenta bancaria / caja" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cuentaId || void 0, onValueChange: setCuentaId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione cuenta…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: cuentas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
            c.nombreCuenta,
            " (",
            c.banco,
            ") — ",
            formatSoles$1(c.saldoActual, mounted)
          ] }, c.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Medio de pago (Tabla 1)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: medioPago, onValueChange: (v) => setMedioPago(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: MEDIOS_PAGO_TABLA1.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.codigo, children: m.label }, m.codigo)) })
          ] })
        ] }),
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
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Monto (S/)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            step: 0.01,
            value: monto,
            onChange: (e) => setMonto(e.target.value),
            className: "bg-slate-800/50 border-slate-700 tabular-nums"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Glosa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: glosa,
            onChange: (e) => setGlosa(e.target.value),
            className: "bg-slate-800/50 border-slate-700 min-h-[60px]"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), className: "border-slate-600", children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleSubmit,
          disabled: liquidar.isPending || !comprobanteId || !cuentaId || !monto || Number(monto) <= 0 || pendientes.length === 0,
          className: cn("bg-emerald-600 hover:bg-emerald-500"),
          children: [
            liquidar.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin mr-2" }) : null,
            "Ejecutar liquidación"
          ]
        }
      )
    ] })
  ] }) });
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
function formatSoles(amount, mounted, moneda = "PEN") {
  if (!mounted) return "—";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
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
function labelMedioPago(codigo) {
  return MEDIOS_PAGO_TABLA1.find((m) => m.codigo === codigo)?.label ?? codigo;
}
function CuentaCard({
  cuenta,
  mounted,
  selected,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: cn(
        GLASS,
        "p-4 text-left transition-all hover:border-emerald-500/40 w-full",
        selected && "ring-2 ring-emerald-500/50 border-emerald-500/40"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: cuenta.nombreCuenta }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: cuenta.banco })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: cn("text-[10px]", TIPO_CUENTA_BANCARIA_COLORS[cuenta.tipoCuenta]),
              children: TIPO_CUENTA_BANCARIA_LABELS[cuenta.tipoCuenta]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-semibold tabular-nums mt-3", children: formatSoles(cuenta.saldoActual, mounted, cuenta.moneda) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2 text-[10px] text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cuenta.moneda }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "PCGE ",
            cuenta.cuentaPcgeCodigo
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cuenta.numeroCuenta })
        ] })
      ]
    }
  );
}
function TesoreriaHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [cuentaFiltro, setCuentaFiltro] = reactExports.useState("all");
  const [modalOpen, setModalOpen] = reactExports.useState(false);
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
    queryKey: ["contribuyente-id-tes", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucTes(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 6e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const cuentasQuery = useCuentasBancarias(contribuyenteId);
  const cuentaIdFilter = cuentaFiltro === "all" ? void 0 : cuentaFiltro;
  const movimientosQuery = useMovimientosCaja(contribuyenteId, periodo, cuentaIdFilter);
  const pendientesQuery = useComprobantesPendientes(contribuyenteId, periodo);
  const resumenQuery = useResumenCaja(
    contribuyenteId,
    periodo,
    cuentasQuery.data ?? [],
    movimientosQuery.data
  );
  const cuentas = cuentasQuery.data ?? [];
  const movimientos = movimientosQuery.data ?? [];
  const pendientes = pendientesQuery.data?.length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-6 text-emerald-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-100", children: "Tesorería & Libro Caja" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "Formato SUNAT 010100 · Liquidaciones atómicas · Caja, bancos y detracciones BN" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => setModalOpen(true),
          disabled: !contribuyenteId || pendientes === 0,
          className: "bg-emerald-600 hover:bg-emerald-500 gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "size-4" }),
            "Liquidar comprobante",
            pendientes > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1 bg-emerald-950 text-emerald-300", children: pendientes }) : null
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuardBanner,
      {
        contribuyenteId,
        periodo,
        vista: "tesoreria"
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
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 min-w-[180px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Filtrar cuenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cuentaFiltro, onValueChange: setCuentaFiltro, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "bg-slate-900 border-slate-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todas las cuentas" }),
            cuentas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.nombreCuenta }, c.id))
          ] })
        ] })
      ] })
    ] }),
    !contribuyenteId ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4 text-sm text-amber-300/90 border-amber-500/30"), children: "Seleccione un contribuyente para gestionar tesorería y libro caja." }) : null,
    contribuyenteId && cuentasQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      cuentas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        CuentaCard,
        {
          cuenta: c,
          mounted,
          selected: cuentaFiltro === c.id,
          onSelect: () => setCuentaFiltro(cuentaFiltro === c.id ? "all" : c.id)
        },
        c.id
      )),
      cuentas.length === 0 && contribuyenteId ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4 col-span-full text-sm text-slate-500 text-center"), children: "Sin cuentas bancarias. Ejecute la migración Módulo 6 o cree una cuenta." }) : null
    ] }),
    resumenQuery.data ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex items-center gap-3"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "size-8 text-emerald-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 uppercase", children: "Ingresos periodo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold tabular-nums", children: formatSoles(resumenQuery.data.totalIngresos, mounted) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex items-center gap-3"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowDown, { className: "size-8 text-red-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 uppercase", children: "Egresos periodo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold tabular-nums", children: formatSoles(resumenQuery.data.totalEgresos, mounted) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex items-center gap-3"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-8 text-sky-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 uppercase", children: "Saldo cuentas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold tabular-nums", children: formatSoles(resumenQuery.data.saldoCuentas, mounted) })
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-slate-400", children: "Libro Caja y Bancos — Formato 010100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] border-slate-600", children: [
          movimientos.length,
          " movimientos"
        ] })
      ] }),
      movimientosQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-slate-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin mr-2" }),
        "Cargando movimientos…"
      ] }) : movimientos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-slate-500 text-sm", children: 'No hay movimientos en el periodo. Use "Liquidar comprobante" para registrar pagos/cobros.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Corr." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Fecha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Medio Pago" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "RUC / Razón Social" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Glosa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Ingreso" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Egreso" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400 text-right", children: "Saldo Acum." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: movimientos.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60 hover:bg-slate-800/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: m.numeroCorrelativoCaja ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: formatFecha(m.fechaOperacion, mounted) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: labelMedioPago(m.medioPagoTabla1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "max-w-[160px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: m.rucDniContraparte ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 truncate", title: m.razonSocialContraparte ?? "", children: m.razonSocialContraparte ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm max-w-[180px] truncate", title: m.glosa, children: m.glosa }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm text-emerald-400", children: m.ingreso > 0 ? formatSoles(m.ingreso, mounted) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm text-red-400", children: m.egreso > 0 ? formatSoles(m.egreso, mounted) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-sm font-medium", children: m.saldoAcumulado != null ? formatSoles(m.saldoAcumulado, mounted) : "—" })
        ] }, m.id)) })
      ] }) })
    ] }),
    contribuyenteId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ModalLiquidacion,
      {
        open: modalOpen,
        onOpenChange: setModalOpen,
        contribuyenteId,
        periodo,
        cuentas,
        mounted
      }
    ) : null
  ] });
}
export {
  TesoreriaHub
};
