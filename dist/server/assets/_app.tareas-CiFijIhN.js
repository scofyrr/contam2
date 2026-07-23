import { U as reactExports, L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { ac as supabase, a7 as round2, ar as useQueryClient, as as useSession, aj as toast, L as Link } from "./router-B2fOVgbK.js";
import { u as useQuery } from "./useQuery-BWRVlDqX.js";
import { u as useMutation } from "./useMutation-BW7ClUbS.js";
import { B as Badge } from "./badge-yaC6QAMb.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-BjHsyqGX.js";
import { P as Progress } from "./progress-C9Z_U5y-.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { f as fetchDeudasPendientes } from "./cxc-cxp-service-BJlTS8CO.js";
import { f as fetchIntegrityErrorsRpc } from "./asiento-traceability-service-BA-aKu5e.js";
import { d as fetchTareas, a as actualizarTarea, c as crearTarea, m as marcarTareaCompletada, e as eliminarTarea, b as fetchEstadisticasTareasMejorada } from "./tareas-service-Co1DUort.js";
import { n as notificarTareaGenerada } from "./notification-service-C10oxyNg.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, g as Tooltip, B as Bar, a as Cell } from "./generateCategoricalChart-Bx15tFyN.js";
import { C as ComposedChart } from "./ComposedChart-BPRK3NoC.js";
import { L as Line } from "./Line-ClKEnyq8.js";
import { a as PieChart, P as Pie } from "./PieChart-BGRPAhXi.js";
import { L as Lightbulb } from "./lightbulb-DCt4cX9W.js";
import { T as TrendingUp } from "./trending-up-H7BEnUdg.js";
import { T as TrendingDown } from "./trending-down-B-hiFKmE.js";
import { F as FormularioTarea } from "./FormularioTarea-D6w-BTXX.js";
import { P as PremiumEmptyState } from "./premium-empty-state-Cve2OItO.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-DBf2jt_8.js";
import { I as Input } from "./input-CVw-0GOD.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-B9UO78R2.js";
import { C as ClipboardList } from "./clipboard-list-NC5QH_4W.js";
import { T as TriangleAlert } from "./triangle-alert-n38mPMK9.js";
import { C as CircleCheck } from "./circle-check-Qf-bppF0.js";
import { P as Pencil } from "./pencil-DwmoUqpy.js";
import { T as Trash2 } from "./trash-2-Cab_E9zp.js";
import { P as Plus } from "./plus-BZJzn-4g.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CWutStw1.js";
import "./Combination-D4Tn14OX.js";
import "./index-CG6nsUgb.js";
import "./index-Bkm5nwUb.js";
import "./sire-sync-service-B7QOQYp8.js";
import "./pcge-service-ByOdw3ht.js";
import "./Area-CNet8Ygk.js";
import "./form-CUh1Vx2p.js";
import "./label-DrIl1YMr.js";
import "./dialog-BvZLNj9g.js";
import "./index-M3oW48Eb.js";
import "./x-B5oN35Uv.js";
import "./textarea-COeedhui.js";
import "./switch-pNzoGnQj.js";
import "./index-DkWXu2TP.js";
import "./field-helper-BvfRNaAW.js";
import "./circle-alert-Cna6VmV6.js";
import "./info-CGwkGZ-6.js";
import "./loader-circle-DUOoJQci.js";
import "./chevron-up-kSt2_UA7.js";
function reglaPrioridadToDb(p) {
  const map = {
    CRITICA: "urgente",
    ALTA: "alta",
    MEDIA: "media",
    BAJA: "baja"
  };
  return map[p];
}
function reglaModuloToDb(m) {
  const map = {
    SIRE: "sire",
    DIARIO: "asientos",
    CAJA: "caja",
    CXC_CXP: "general",
    GENERAL: "general"
  };
  return map[m];
}
function addBusinessDays(from, days) {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d.toISOString().slice(0, 10);
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / 864e5);
}
const LOG_KEY = "contam-tareas-auto-log";
function cpeLabel(r) {
  return `${r.cod_tipo_cdp ?? ""}-${r.serie_cdp ?? ""}-${r.nro_cdp_inicial ?? ""}`.replace(/^-|-$/g, "");
}
function bumpPrioridad(p) {
  const order = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
  const i = order.indexOf(p);
  return order[Math.min(i + 1, order.length - 1)];
}
function isPaid(reg) {
  return reg.tipo === "VENTA" ? reg.estadoCobro === "cobrado" : reg.estadoPago === "pagado";
}
function lastDayOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
const REGLAS = [
  {
    id: "provision_pendiente",
    nombre: "SIRE sin provisionar",
    descripcion: "Comprobantes con más de 7 días sin provisión",
    modulo: "SIRE",
    prioridad: "ALTA",
    intervaloReevaluacion: 120,
    activa: true,
    condicion: (ctx) => ctx.registrosSIRE.some((r) => !r.tieneProvision && r.diasDesdeEmision > 7),
    generarTareas(ctx) {
      const hoy = ctx.fechaActual;
      return ctx.registrosSIRE.filter((r) => !r.tieneProvision && r.diasDesdeEmision > 7).map((r) => {
        const prioridad = r.diasDesdeEmision > 15 ? "CRITICA" : "ALTA";
        const label = cpeLabel({ cod_tipo_cdp: r.codTipoCdp, serie_cdp: r.serie, nro_cdp_inicial: r.numero });
        return {
          titulo: `URGENTE: Provisionar ${label}`,
          descripcion: `${r.razonSocial} — comprobante sin asiento principal`,
          modulo: "SIRE",
          prioridad,
          ruc: r.ruc,
          periodo: r.periodo,
          fechaVencimiento: addBusinessDays(hoy, 2),
          metadata: { sireRegistroId: r.id, monto: r.montoTotal },
          hashDeduplicacion: `PROVISION_PENDIENTE_${r.id}`,
          entidad: r.razonSocial,
          tramite: `Provisionar ${label}`,
          critica: prioridad === "CRITICA",
          moduloOrigen: reglaModuloToDb("SIRE"),
          referenciaId: r.id,
          reglaGeneradora: "provision_pendiente"
        };
      });
    }
  },
  {
    id: "vencimiento_proximo",
    nombre: "Vencimiento próximo",
    descripcion: "Comprobantes que vencen en 5 días",
    modulo: "SIRE",
    prioridad: "MEDIA",
    intervaloReevaluacion: 360,
    activa: true,
    condicion: (ctx) => ctx.registrosSIRE.some((r) => {
      if (!r.fechaVencimiento || isPaid(r)) return false;
      const dias = daysBetween(ctx.fechaActual, new Date(r.fechaVencimiento));
      return dias >= 0 && dias <= 5;
    }),
    generarTareas(ctx) {
      return ctx.registrosSIRE.filter((r) => {
        if (!r.fechaVencimiento || isPaid(r)) return false;
        const dias = daysBetween(ctx.fechaActual, new Date(r.fechaVencimiento));
        return dias >= 0 && dias <= 5;
      }).map((r) => {
        const dias = daysBetween(ctx.fechaActual, new Date(r.fechaVencimiento));
        const prioridad = dias < 3 ? "ALTA" : "MEDIA";
        const label = cpeLabel({ cod_tipo_cdp: r.codTipoCdp, serie_cdp: r.serie, nro_cdp_inicial: r.numero });
        return {
          titulo: `Próximo vencimiento: ${label}`,
          descripcion: `${r.razonSocial} vence el ${r.fechaVencimiento}`,
          modulo: "SIRE",
          prioridad,
          ruc: r.ruc,
          periodo: r.periodo,
          fechaVencimiento: r.fechaVencimiento,
          metadata: { sireRegistroId: r.id },
          hashDeduplicacion: `VENCIMIENTO_PROXIMO_${r.id}`,
          entidad: r.razonSocial,
          tramite: `Vencimiento ${label}`,
          critica: prioridad === "ALTA",
          moduloOrigen: reglaModuloToDb("SIRE"),
          referenciaId: r.id,
          reglaGeneradora: "vencimiento_proximo"
        };
      });
    }
  },
  {
    id: "cxcxp_antiguo",
    nombre: "CXC/CXP antiguo",
    descripcion: "Saldos con más de 30 días",
    modulo: "CXC_CXP",
    prioridad: "ALTA",
    intervaloReevaluacion: 720,
    activa: true,
    condicion: (ctx) => ctx.cxcCxp.some((s) => s.diasAntiguedad > 30),
    generarTareas(ctx) {
      return ctx.cxcCxp.filter((s) => s.diasAntiguedad > 30).map((s) => {
        const prioridad = s.diasAntiguedad > 60 ? "CRITICA" : "ALTA";
        const accion = s.tipo === "VENTA" ? "cobro" : "pago";
        return {
          titulo: `Gestión de ${accion}: ${s.nombreContraparte}`,
          descripcion: `Saldo pendiente S/ ${s.saldoPendiente.toFixed(2)} — ${s.diasAntiguedad} días`,
          modulo: "CXC_CXP",
          prioridad,
          ruc: s.ruc,
          periodo: "",
          fechaVencimiento: addBusinessDays(ctx.fechaActual, 5),
          metadata: { sireRegistroId: s.sireRegistroId, saldo: s.saldoPendiente },
          hashDeduplicacion: `CXCXP_ANTIGUO_${s.sireRegistroId}`,
          entidad: s.nombreContraparte,
          tramite: `${accion.toUpperCase()} ${s.comprobante}`,
          critica: prioridad === "CRITICA",
          moduloOrigen: reglaModuloToDb("CXC_CXP"),
          referenciaId: s.sireRegistroId,
          reglaGeneradora: "cxcxp_antiguo"
        };
      });
    }
  },
  {
    id: "centralizar_caja",
    nombre: "Centralizar caja",
    descripcion: "Movimientos sin asiento al cierre",
    modulo: "CAJA",
    prioridad: "MEDIA",
    intervaloReevaluacion: 1440,
    activa: true,
    condicion: (ctx) => ctx.movimientosCaja.some((m) => m.cantidad > 0),
    generarTareas(ctx) {
      const hoy = ctx.fechaActual;
      const finMes = lastDayOfMonth(hoy).getDate() - hoy.getDate() <= 5;
      return ctx.movimientosCaja.filter((m) => m.cantidad > 0).map((m) => ({
        titulo: `Centralizar caja: Período ${m.periodo}`,
        descripcion: `${m.cantidad} movimientos pendientes por S/ ${m.total.toFixed(2)}`,
        modulo: "CAJA",
        prioridad: finMes ? "ALTA" : "MEDIA",
        ruc: m.ruc,
        periodo: m.periodo,
        fechaVencimiento: addBusinessDays(hoy, 3),
        metadata: { cantidad: m.cantidad, total: m.total },
        hashDeduplicacion: `CENTRALIZAR_CAJA_${m.ruc}_${m.periodo}`,
        entidad: "Libro Caja",
        tramite: `Centralización ${m.periodo}`,
        critica: finMes,
        moduloOrigen: reglaModuloToDb("CAJA"),
        reglaGeneradora: "centralizar_caja"
      }));
    }
  },
  {
    id: "asiento_descuadrado",
    nombre: "Asiento descuadrado",
    descripcion: "Integridad contable",
    modulo: "DIARIO",
    prioridad: "CRITICA",
    intervaloReevaluacion: 60,
    activa: true,
    condicion: (ctx) => ctx.asientosDescuadrados.length > 0,
    generarTareas(ctx) {
      return ctx.asientosDescuadrados.map((a) => ({
        titulo: `Corregir asiento descuadrado #${a.asientoId.slice(0, 8)}`,
        descripcion: `Diferencia: S/ ${a.diff.toFixed(2)}`,
        modulo: "DIARIO",
        prioridad: "CRITICA",
        ruc: a.ruc,
        periodo: a.periodo,
        fechaVencimiento: addBusinessDays(ctx.fechaActual, 1),
        metadata: { asientoId: a.asientoId, diff: a.diff },
        hashDeduplicacion: `ASIENTO_DESCUADRADO_${a.asientoId}`,
        entidad: "Libro Diario",
        tramite: "Corrección partida doble",
        critica: true,
        moduloOrigen: reglaModuloToDb("DIARIO"),
        referenciaId: a.asientoId,
        reglaGeneradora: "asiento_descuadrado"
      }));
    }
  },
  {
    id: "contribuyente_inactivo",
    nombre: "Contribuyente inactivo",
    descripcion: "Sin actividad SIRE 90 días",
    modulo: "GENERAL",
    prioridad: "BAJA",
    intervaloReevaluacion: 10080,
    activa: true,
    condicion: (ctx) => ctx.contribuyentesInactivos.length > 0,
    generarTareas(ctx) {
      return ctx.contribuyentesInactivos.map((c) => ({
        titulo: `Revisar contribuyente inactivo: ${c.razonSocial}`,
        descripcion: c.ultimaActividad ? `Sin actividad desde ${c.ultimaActividad}` : "Sin comprobantes registrados",
        modulo: "GENERAL",
        prioridad: "BAJA",
        ruc: c.ruc,
        periodo: "",
        fechaVencimiento: addBusinessDays(ctx.fechaActual, 15),
        metadata: { ultimaActividad: c.ultimaActividad },
        hashDeduplicacion: `CONTRIBUYENTE_INACTIVO_${c.ruc}`,
        entidad: c.razonSocial,
        tramite: "Revisión contribuyente",
        critica: false,
        moduloOrigen: reglaModuloToDb("GENERAL"),
        reglaGeneradora: "contribuyente_inactivo"
      }));
    }
  },
  {
    id: "cierre_periodo",
    nombre: "Cierre de período",
    descripcion: "Últimos 5 días del mes con pendientes",
    modulo: "SIRE",
    prioridad: "ALTA",
    intervaloReevaluacion: 720,
    activa: true,
    condicion(ctx) {
      const hoy = ctx.fechaActual;
      const restantes = lastDayOfMonth(hoy).getDate() - hoy.getDate();
      if (restantes > 5) return false;
      const periodo = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, "0")}`;
      return ctx.registrosSIRE.some((r) => r.periodo === periodo && !r.tieneProvision);
    },
    generarTareas(ctx) {
      const hoy = ctx.fechaActual;
      const periodo = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, "0")}`;
      const pendientes = ctx.registrosSIRE.filter((r) => r.periodo === periodo && !r.tieneProvision);
      if (!pendientes.length) return [];
      const ruc = pendientes[0]?.ruc ?? "";
      return [
        {
          titulo: `Cierre de período ${periodo}`,
          descripcion: `${pendientes.length} comprobantes pendientes de provisionar`,
          modulo: "SIRE",
          prioridad: "ALTA",
          ruc,
          periodo,
          fechaVencimiento: isoDate(lastDayOfMonth(hoy)),
          metadata: { cantidad: pendientes.length, periodo },
          hashDeduplicacion: `CIERRE_PERIODO_${periodo}_${ruc}`,
          entidad: "SIRE",
          tramite: `Cierre ${periodo}`,
          critica: true,
          moduloOrigen: reglaModuloToDb("SIRE"),
          reglaGeneradora: "cierre_periodo"
        }
      ];
    }
  },
  {
    id: "tarea_vencida",
    nombre: "Tareas vencidas",
    descripcion: "Escalar tareas vencidas",
    modulo: "GENERAL",
    prioridad: "ALTA",
    intervaloReevaluacion: 60,
    activa: true,
    condicion: (ctx) => ctx.tareasExistentes.some((t) => t.vencida && t.estado !== "completada"),
    generarTareas(ctx) {
      const rank = {
        baja: "BAJA",
        media: "MEDIA",
        alta: "ALTA",
        urgente: "CRITICA"
      };
      return ctx.tareasExistentes.filter((t) => t.vencida && !["completada", "cancelada"].includes(t.estado)).map((t) => {
        const base = rank[t.prioridad] ?? "MEDIA";
        const prioridad = bumpPrioridad(base);
        return {
          titulo: `TAREA VENCIDA: ${t.titulo}`,
          descripcion: `Venció el ${t.plazoVencimiento ?? "—"}`,
          modulo: "GENERAL",
          prioridad,
          ruc: "",
          periodo: "",
          fechaVencimiento: addBusinessDays(ctx.fechaActual, 1),
          metadata: { tareaOriginalId: t.id },
          hashDeduplicacion: `VENCIDA_${t.id}`,
          entidad: "Tareas",
          tramite: t.titulo,
          critica: prioridad === "CRITICA",
          moduloOrigen: reglaModuloToDb("GENERAL"),
          referenciaId: t.id,
          reglaGeneradora: "tarea_vencida"
        };
      });
    }
  }
];
async function buildContexto(ruc, periodo) {
  const fechaActual = /* @__PURE__ */ new Date();
  const rucFilter = ruc?.trim() || void 0;
  const periodoFilter = periodo?.trim() || void 0;
  let sireQ = supabase.from("registros_sire").select(
    "id, ruc, razon_social, periodo, tipo, cod_tipo_cdp, serie_cdp, nro_cdp_inicial, fecha_emision, fecha_vencimiento, importe_total, mto_total_cp, estado_cobro, estado_pago"
  ).order("fecha_emision", { ascending: false }).limit(200);
  if (rucFilter) sireQ = sireQ.eq("ruc", rucFilter);
  if (periodoFilter) sireQ = sireQ.eq("periodo", periodoFilter);
  const [sireRes, asientosRes, movRes, tareas, contribRes] = await Promise.all([
    sireQ,
    supabase.from("asientos_contables").select("sire_registro_id, id, debe, haber, ruc_contraparte, periodo, tipo_asiento").eq("tipo_asiento", "principal").limit(500),
    supabase.from("movimientos_caja").select("ruc, periodo, debe, haber").is("asiento_id", null).limit(500),
    fetchTareas({ ruc: rucFilter, estado: "todos" }),
    supabase.from("contribuyentes").select("ruc, razon_social").limit(100)
  ]);
  const provisionIds = new Set(
    (asientosRes.data ?? []).filter((a) => a.sire_registro_id).map((a) => String(a.sire_registro_id))
  );
  const registrosSIRE = (sireRes.data ?? []).map((r) => {
    const emision = String(r.fecha_emision ?? "");
    return {
      id: String(r.id),
      ruc: String(r.ruc ?? ""),
      razonSocial: String(r.razon_social ?? r.ruc ?? ""),
      periodo: String(r.periodo ?? ""),
      tipo: String(r.tipo ?? ""),
      codTipoCdp: String(r.cod_tipo_cdp ?? ""),
      serie: String(r.serie_cdp ?? ""),
      numero: String(r.nro_cdp_inicial ?? ""),
      fechaEmision: emision,
      fechaVencimiento: r.fecha_vencimiento ? String(r.fecha_vencimiento) : null,
      montoTotal: round2(Number(r.mto_total_cp ?? r.importe_total ?? 0)),
      tieneProvision: provisionIds.has(String(r.id)),
      estadoCobro: String(r.estado_cobro ?? "pendiente"),
      estadoPago: String(r.estado_pago ?? "pendiente"),
      diasDesdeEmision: emision ? daysBetween(new Date(emision), fechaActual) : 0
    };
  });
  const movMap = /* @__PURE__ */ new Map();
  for (const m of movRes.data ?? []) {
    const key = `${m.ruc}_${m.periodo}`;
    const prev = movMap.get(key) ?? { ruc: String(m.ruc), periodo: String(m.periodo), cantidad: 0, total: 0 };
    prev.cantidad++;
    prev.total += Math.max(Number(m.debe ?? 0), Number(m.haber ?? 0));
    movMap.set(key, prev);
  }
  const cxcCxp = [];
  const rucs = rucFilter ? [rucFilter] : [...new Set(registrosSIRE.map((r) => r.ruc))].slice(0, 5);
  const deudasArrays = await Promise.all(
    rucs.map((r) => fetchDeudasPendientes({ ruc: r, periodo: periodoFilter }).catch(() => []))
  );
  const sireById = new Map(registrosSIRE.map((r) => [r.id, r]));
  for (const deudas of deudasArrays) {
    for (const d of deudas) {
      const sire = sireById.get(d.sireRegistroId);
      const emision = sire?.fechaEmision ? new Date(sire.fechaEmision) : fechaActual;
      cxcCxp.push({
        sireRegistroId: d.sireRegistroId,
        ruc: d.rucContraparte ?? rucFilter ?? "",
        nombreContraparte: d.nombreContraparte ?? "",
        comprobante: d.comprobante,
        tipo: d.tipo,
        saldoPendiente: d.saldoPendiente,
        diasAntiguedad: daysBetween(emision, fechaActual)
      });
    }
  }
  const asientosDescuadrados = [];
  const integrity = await fetchIntegrityErrorsRpc(rucFilter, periodoFilter).catch(() => []);
  for (const err of integrity) {
    if (err.check_type === "PARTIDA_DOBLE" && err.detalle) {
      asientosDescuadrados.push({
        asientoId: String(err.detalle.sire_registro_id ?? err.detalle.asiento_id ?? crypto.randomUUID()),
        diff: Number(err.detalle.diff ?? 0),
        ruc: rucFilter ?? "00000000000",
        periodo: periodoFilter ?? ""
      });
    }
  }
  const ultimaPorRuc = /* @__PURE__ */ new Map();
  for (const r of registrosSIRE) {
    const prev = ultimaPorRuc.get(r.ruc);
    if (!prev || r.fechaEmision > prev) ultimaPorRuc.set(r.ruc, r.fechaEmision);
  }
  const contribuyentesInactivos = (contribRes.data ?? []).filter((c) => {
    const ult = ultimaPorRuc.get(String(c.ruc));
    if (!ult) return true;
    return daysBetween(new Date(ult), fechaActual) > 90;
  }).map((c) => ({
    ruc: String(c.ruc),
    razonSocial: String(c.razon_social ?? c.ruc),
    ultimaActividad: ultimaPorRuc.get(String(c.ruc)) ?? null
  }));
  return {
    fechaActual,
    registrosSIRE,
    asientosPendientes: [],
    movimientosCaja: [...movMap.values()],
    cxcCxp,
    tareasExistentes: tareas.map((t) => ({
      id: t.id,
      hashDeduplicacion: t.hash_deduplicacion ?? null,
      estado: t.estado,
      prioridad: t.prioridad,
      plazoVencimiento: t.plazo_vencimiento ?? null,
      titulo: t.titulo ?? t.tramite,
      vencida: t.vencida === true
    })),
    contribuyentesInactivos,
    asientosDescuadrados
  };
}
function dedupeSugerencias(sugeridas, existentes) {
  const hashMap = new Map(existentes.filter((t) => t.hashDeduplicacion).map((t) => [t.hashDeduplicacion, t]));
  return sugeridas.filter((s) => {
    const ex = hashMap.get(s.hashDeduplicacion);
    if (!ex) return true;
    if (ex.estado === "completada") return false;
    if (ex.vencida) return true;
    return false;
  });
}
class TareasAutoGenerator {
  intervalId = null;
  async evaluarReglas(ruc, periodo) {
    const ctx = await buildContexto(ruc, periodo);
    const sugeridas = [];
    for (const regla of REGLAS.filter((r) => r.activa)) {
      const ok = await regla.condicion(ctx);
      if (ok) sugeridas.push(...regla.generarTareas(ctx));
    }
    return dedupeSugerencias(sugeridas, ctx.tareasExistentes);
  }
  async generarTareasAutomaticas(ruc, periodo, autoConfirmar = false) {
    const sugeridas = await this.evaluarReglas(ruc, periodo);
    if (!autoConfirmar) {
      return sugeridas.map((s) => ({ id: "", sugerida: s, accion: "omitida" }));
    }
    const resultados = [];
    for (const s of sugeridas) {
      const payload = {
        ruc: s.ruc || null,
        entidad: s.entidad,
        tramite: s.tramite,
        titulo: s.titulo,
        descripcion: s.descripcion,
        plazo_vencimiento: s.fechaVencimiento,
        critica: s.critica,
        prioridad: reglaPrioridadToDb(s.prioridad),
        modulo_origen: s.moduloOrigen,
        referencia_id: s.referenciaId ?? null,
        hash_deduplicacion: s.hashDeduplicacion,
        generada_automaticamente: true,
        regla_generadora: s.reglaGeneradora,
        metadata: s.metadata,
        estado: "pendiente"
      };
      const { data, error } = await supabase.from("tareas_pendientes").insert(payload).select("id").single();
      if (!error && data) {
        resultados.push({ id: String(data.id), sugerida: s, accion: "creada" });
      }
    }
    this.logGeneracion(resultados);
    return resultados;
  }
  async obtenerEstadisticasGeneracion(periodo) {
    let log = [];
    try {
      log = JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
    } catch {
      log = [];
    }
    const porRegla = log.reduce((acc, e) => {
      acc[e.regla] = (acc[e.regla] ?? 0) + 1;
      return acc;
    }, {});
    const aceptadas = log.filter((e) => e.accion === "creada").length;
    const rechazadas = log.filter((e) => e.accion === "omitida").length;
    return {
      periodo,
      totalGeneradas: log.length,
      totalAceptadas: aceptadas,
      totalRechazadas: rechazadas,
      porRegla,
      tasaFalsosPositivos: log.length ? rechazadas / log.length : 0
    };
  }
  programarEvaluacionPeriodica(intervaloMinutos = 60, onNuevas) {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      void this.evaluarReglas().then((tareas) => {
        if (tareas.length && onNuevas) onNuevas(tareas);
        window.dispatchEvent(new CustomEvent("contam:tareas-sugeridas", { detail: tareas }));
      });
    }, intervaloMinutos * 6e4);
  }
  detenerEvaluacion() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  logGeneracion(resultados) {
    if (typeof window === "undefined") return;
    try {
      const prev = JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
      const next = [
        ...prev,
        ...resultados.map((r) => ({ regla: r.sugerida.reglaGeneradora, accion: r.accion }))
      ].slice(-200);
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
    } catch {
    }
  }
}
const tareasAutoGenerator = new TareasAutoGenerator();
async function evaluarReglasTareas(ruc, periodo) {
  return tareasAutoGenerator.evaluarReglas(ruc, periodo);
}
const AUTO_KEY = ["tareas", "auto"];
const INTERVAL_MS = 2 * 60 * 60 * 1e3;
function useTareasAutoGenerator(ruc, periodo) {
  const qc = useQueryClient();
  const { session } = useSession();
  const sugeridasQuery = useQuery({
    queryKey: [...AUTO_KEY, "sugeridas", ruc, periodo],
    queryFn: () => evaluarReglasTareas(ruc, periodo),
    staleTime: 5 * 6e4
  });
  const statsQuery = useQuery({
    queryKey: [...AUTO_KEY, "stats", periodo],
    queryFn: () => tareasAutoGenerator.obtenerEstadisticasGeneracion(periodo ?? ""),
    enabled: !!periodo
  });
  const generarMutation = useMutation({
    mutationFn: async (autoConfirmar) => {
      const result = await tareasAutoGenerator.generarTareasAutomaticas(ruc, periodo, autoConfirmar);
      if (autoConfirmar && session?.user?.id) {
        for (const r of result.filter((x) => x.accion === "creada")) {
          await notificarTareaGenerada({
            userId: session.user.id,
            titulo: r.sugerida.titulo,
            mensaje: r.sugerida.descripcion,
            tareaId: r.id,
            prioridad: reglaPrioridadToDb(r.sugerida.prioridad)
          });
        }
      }
      return result;
    },
    onSuccess: async (result, autoConfirmar) => {
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      await qc.invalidateQueries({ queryKey: AUTO_KEY });
      if (autoConfirmar) {
        toast.success(`${result.filter((r) => r.accion === "creada").length} tareas generadas`);
      }
    },
    onError: (e) => toast.error(e.message)
  });
  reactExports.useEffect(() => {
    const tick = () => {
      void evaluarReglasTareas(ruc, periodo).then((tareas) => {
        if (tareas.length) {
          qc.setQueryData([...AUTO_KEY, "sugeridas", ruc, periodo], tareas);
        }
      });
    };
    tick();
    const id = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(id);
  }, [ruc, periodo, qc]);
  const aceptarSugerida = reactExports.useCallback(
    async (s) => {
      const payload = {
        ruc: s.ruc || null,
        entidad: s.entidad,
        tramite: s.tramite,
        titulo: s.titulo,
        descripcion: s.descripcion,
        plazo_vencimiento: s.fechaVencimiento,
        critica: s.critica,
        prioridad: reglaPrioridadToDb(s.prioridad),
        modulo_origen: s.moduloOrigen,
        referencia_id: s.referenciaId ?? null,
        hash_deduplicacion: s.hashDeduplicacion,
        generada_automaticamente: true,
        regla_generadora: s.reglaGeneradora,
        metadata: s.metadata,
        estado: "pendiente"
      };
      const { data, error } = await supabase.from("tareas_pendientes").insert(payload).select("id").single();
      if (error) throw error;
      if (session?.user?.id) {
        await notificarTareaGenerada({
          userId: session.user.id,
          titulo: s.titulo,
          mensaje: s.descripcion,
          tareaId: String(data.id),
          prioridad: reglaPrioridadToDb(s.prioridad)
        });
      }
      await qc.invalidateQueries({ queryKey: ["tareas"] });
      await qc.invalidateQueries({ queryKey: AUTO_KEY });
      toast.success("Tarea creada");
    },
    [qc, session?.user?.id]
  );
  return {
    tareasSugeridas: sugeridasQuery.data ?? [],
    loadingSugeridas: sugeridasQuery.isLoading,
    estadisticasGeneracion: statsQuery.data,
    generarTareas: (autoConfirmar) => generarMutation.mutate(autoConfirmar),
    generando: generarMutation.isPending,
    aceptarSugerida,
    refrescar: () => sugeridasQuery.refetch()
  };
}
const MODULO_COLORS = {
  sire: "#00C8FF",
  asientos: "#00C897",
  caja: "#9B87F5",
  general: "#FF5E7A",
  pcge: "#8899B4",
  contribuyentes: "#F5A623",
  cxc_cxp: "#FF5E7A"
};
function KpiCard({
  label,
  value,
  suffix,
  trend,
  tone,
  progress,
  loading
}) {
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-xl bg-white/5" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-all duration-300 hover:scale-[1.02]",
      style: { borderBottomWidth: 2, borderBottomColor: tone ?? "#00C8FF" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-3xl font-semibold tabular-nums mt-1", tone && `text-[${tone}]`), children: [
          value,
          suffix ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg ml-1", children: suffix }) : null
        ] }),
        trend !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-xs mt-1 flex items-center gap-1", trend >= 0 ? "text-emerald-400" : "text-red-400"), children: [
          trend >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-3" }),
          Math.abs(trend),
          "% vs semana anterior"
        ] }) : null,
        progress !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress, className: "h-1.5 mt-2" }) : null
      ]
    }
  );
}
function ActivityHeatmap({ tareas }) {
  const [monthOffset, setMonthOffset] = reactExports.useState(0);
  const grid = reactExports.useMemo(() => {
    const base = /* @__PURE__ */ new Date();
    base.setMonth(base.getMonth() - monthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const counts = /* @__PURE__ */ new Map();
    for (const t of tareas) {
      const d = t.plazo_vencimiento ?? t.created_at?.slice(0, 10);
      if (!d) continue;
      const dt = new Date(d);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        counts.set(dt.getDate(), (counts.get(dt.getDate()) ?? 0) + 1);
      }
    }
    return { year, month, daysInMonth, counts };
  }, [tareas, monthOffset]);
  const intensity = (n) => {
    if (n === 0) return "bg-white/[0.02]";
    if (n <= 2) return "bg-cyan-500/20";
    if (n <= 5) return "bg-cyan-500/40";
    if (n <= 10) return "bg-cyan-500/60";
    return "bg-[#C8A44D]/60";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Heatmap de actividad" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7", onClick: () => setMonthOffset((m) => m + 1), children: "←" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-7", onClick: () => setMonthOffset((m) => Math.max(0, m - 1)), children: "→" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: Array.from({ length: grid.daysInMonth }, (_, i) => {
      const day = i + 1;
      const count = grid.counts.get(day) ?? 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          title: `${count} tareas`,
          className: cn("aspect-square rounded-sm text-[9px] flex items-center justify-center", intensity(count)),
          children: day
        },
        day
      );
    }) })
  ] });
}
function buildSugerencias(tareas, sugeridas) {
  const tips = [];
  const criticas = tareas.filter((t) => t.critica && t.estado === "pendiente").length;
  if (criticas >= 3) {
    tips.push(`Si completas ${Math.min(3, criticas)} tareas críticas hoy, reduces ~40% la carga de la semana.`);
  }
  const caja = tareas.filter((t) => t.modulo_origen === "caja" && t.estado === "pendiente");
  if (caja.length) {
    tips.push(`La centralización de caja tiene ${caja.length} recordatorio(s) pendiente(s).`);
  }
  const porRuc = tareas.reduce((acc, t) => {
    if (t.ruc) acc[t.ruc] = (acc[t.ruc] ?? 0) + 1;
    return acc;
  }, {});
  const topRuc = Object.entries(porRuc).sort((a, b) => b[1] - a[1])[0];
  if (topRuc && topRuc[1] > 2) {
    tips.push(`El RUC ${topRuc[0]} concentra ${Math.round(topRuc[1] / tareas.length * 100)}% de tus tareas activas.`);
  }
  if (sugeridas > 0) {
    tips.push(`El motor detectó ${sugeridas} tarea(s) sugerida(s) automáticamente. Revísalas en el panel inferior.`);
  }
  if (!tips.length) tips.push("Los lunes sueles tener mayor carga. Agenda tiempo para tareas SIRE ese día.");
  return tips;
}
function TareasDashboardPremium({
  stats,
  extended,
  tareas,
  loading,
  ruc,
  periodo
}) {
  const { tareasSugeridas, generarTareas, generando, aceptarSugerida } = useTareasAutoGenerator(ruc, periodo);
  const activas = tareas.filter((t) => !["completada", "cancelada"].includes(t.estado));
  const efectividad = extended?.efectividad_pct ?? Math.round(stats.completadas / Math.max(stats.total, 1) * 100);
  const cargaData = reactExports.useMemo(() => {
    const meses = extended?.por_mes ?? [];
    if (meses.length) {
      return meses.map((m) => ({
        mes: m.mes.slice(5),
        completadas: m.completadas,
        generadas: m.generadas,
        proyeccion: Math.round(m.generadas * 1.1)
      }));
    }
    return [
      { mes: "Ene", completadas: stats.completadas, generadas: stats.pendientes + stats.completadas, proyeccion: 0 },
      { mes: "Actual", completadas: stats.completadas, generadas: stats.pendientes, proyeccion: extended?.proyeccion_proximo_mes ?? stats.pendientes }
    ];
  }, [extended, stats]);
  const moduloData = Object.entries(stats.por_modulo).map(([name, value]) => ({ name, value }));
  const totalMod = moduloData.reduce((s, d) => s + d.value, 0) || 1;
  const hoy = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const manana = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const vencenHoy = activas.filter((t) => t.plazo_vencimiento === hoy).length;
  const vencenManana = activas.filter((t) => t.plazo_vencimiento === manana).length;
  const vencenSemana = activas.filter((t) => {
    if (!t.plazo_vencimiento) return false;
    const diff = (new Date(t.plazo_vencimiento).getTime() - Date.now()) / 864e5;
    return diff >= 0 && diff <= 7;
  }).length;
  const sugerencias = buildSugerencias(activas, tareasSugeridas.length);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 rounded-2xl bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6 border border-white/[0.06]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-[#E8EDF5]", children: "Centro de Operaciones Contables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-1", children: "Dashboard predictivo · motor de tareas inteligentes" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KpiCard,
        {
          label: "Pendientes",
          value: stats.pendientes + stats.en_progreso,
          trend: stats.pendientes > 10 ? 20 : -10,
          tone: "#00C8FF",
          loading
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Vencidas", value: stats.vencidas, tone: stats.vencidas > 0 ? "#FF4757" : "#00C897", loading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Críticas", value: stats.criticas, tone: "#FF4757", loading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Efectividad", value: `${efectividad}%`, progress: efectividad, tone: "#00C897", loading })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 h-72", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Carga de trabajo" }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-full bg-white/5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "90%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: cargaData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", tick: { fill: "#8899B4", fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fill: "#8899B4", fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { background: "#0D1525", border: "1px solid #1A2740" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "completadas", fill: "url(#gradCyan)", radius: 4, name: "Completadas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "generadas", fill: "#8899B460", radius: 4, name: "Generadas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "proyeccion", stroke: "#C8A44D", strokeDasharray: "4 4", dot: false, name: "Proyección" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "gradCyan", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#00C8FF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#00C897" })
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityHeatmap, { tareas })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 h-64", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Distribución por módulo" }),
        moduloData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] text-center py-12", children: "Sin datos" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "85%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: moduloData, dataKey: "value", nameKey: "name", innerRadius: 50, outerRadius: 75, label: ({ name, value }) => `${name} ${Math.round(value / totalMod * 100)}%`, children: moduloData.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: MODULO_COLORS[d.name] ?? "#8899B4" }, d.name)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Próximos vencimientos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [
          { label: "Hoy", count: vencenHoy, alert: vencenHoy > 0 && stats.criticas > 0 },
          { label: "Mañana", count: vencenManana, alert: false },
          { label: "Esta semana", count: vencenSemana, alert: false }
        ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(s.alert && "text-[#FF4757] animate-pulse"), children: s.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              s.count,
              " tareas"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: Math.min(100, s.count * 15), className: "h-1.5" })
        ] }, s.label)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "size-4 text-[#C8A44D]" }),
        "Sugerencias inteligentes"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm text-[#8899B4]", children: sugerencias.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s })
      ] }, i)) })
    ] }),
    tareasSugeridas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[#00C8FF]/30 bg-[#00C8FF]/5 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          tareasSugeridas.length,
          " tareas sugeridas por el motor"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => generarTareas(false), disabled: generando, children: "Re-evaluar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => generarTareas(true), disabled: generando, children: "Generar todas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: tareasSugeridas.slice(0, 5).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 text-xs border border-white/[0.05] rounded-lg p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-[#E8EDF5]", children: s.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8899B4]", children: s.descripcion }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[9px] mt-1", children: s.reglaGeneradora })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 shrink-0", onClick: () => void aceptarSugerida(s), children: "Aceptar" })
      ] }, s.hashDeduplicacion)) })
    ] })
  ] });
}
const PRIORIDAD_VARIANT = {
  urgente: "destructive",
  alta: "warning",
  media: "secondary",
  baja: "outline"
};
const ESTADO_LABEL = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada"
};
function ListaTareas({
  tareas,
  loading,
  filtros,
  onFiltrosChange,
  onEdit,
  onComplete,
  onDelete
}) {
  const rows = reactExports.useMemo(() => tareas, [tareas]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-panel overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-wrap gap-3 border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Buscar trámite, entidad, problema…",
          className: "max-w-xs h-9",
          value: filtros.busqueda ?? "",
          onChange: (e) => onFiltrosChange({ ...filtros, busqueda: e.target.value })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: filtros.estado ?? "todos",
          onValueChange: (v) => onFiltrosChange({ ...filtros, estado: v }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Estado" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todos", children: "Todos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pendiente", children: "Pendiente" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "en_progreso", children: "En progreso" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completada", children: "Completada" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelada", children: "Cancelada" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: filtros.prioridad ?? "todos",
          onValueChange: (v) => onFiltrosChange({ ...filtros, prioridad: v }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Prioridad" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todos", children: "Todas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgente", children: "Urgente" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "alta", children: "Alta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "media", children: "Media" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "baja", children: "Baja" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: filtros.orden ?? "reciente",
          onValueChange: (v) => onFiltrosChange({ ...filtros, orden: v }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Orden" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reciente", children: "Más recientes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "plazo", children: "Por plazo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "prioridad", children: "Por prioridad" })
            ] })
          ]
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-12", children: "Cargando tareas…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Trámite" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Entidad" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "RUC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Plazo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Prioridad" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Estado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        PremiumEmptyState,
        {
          icon: ClipboardList,
          title: "Sin tareas",
          description: "No hay tareas con los filtros seleccionados."
        }
      ) }) }) : rows.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: cn(t.vencida && "bg-destructive/5"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          t.critica && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4 text-red-600 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: t.titulo ?? t.tramite }),
            t.problema && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground line-clamp-1", children: t.problema }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] mt-1 capitalize", children: t.modulo_origen })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: t.entidad }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs", children: [
          t.ruc ?? "—",
          t.razon_social && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground truncate max-w-[120px]", children: t.razon_social })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm font-mono", children: [
          t.plazo_vencimiento ?? "—",
          t.dias_restantes != null && t.dias_restantes < 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "ml-1 text-[10px]", children: "Vencida" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: PRIORIDAD_VARIANT[t.prioridad] ?? "secondary",
            className: "text-xs capitalize rounded-full",
            children: t.prioridad
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: ESTADO_LABEL[t.estado] ?? t.estado }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
          t.estado !== "completada" && onComplete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onComplete(t), title: "Completar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 text-emerald-600" }) }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onEdit(t), title: "Editar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onDelete(t), title: "Eliminar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 text-destructive" }) })
        ] }) })
      ] }, t.id)) })
    ] })
  ] });
}
function TareasPage() {
  const qc = useQueryClient();
  const [filtros, setFiltros] = reactExports.useState({
    estado: "todos",
    orden: "reciente"
  });
  const [openForm, setOpenForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const tareasQuery = useQuery({
    queryKey: ["tareas", "list", filtros],
    queryFn: () => fetchTareas(filtros)
  });
  const statsQuery = useQuery({
    queryKey: ["tareas", "stats", filtros.ruc, filtros.ruc],
    queryFn: () => fetchEstadisticasTareasMejorada(filtros.ruc)
  });
  const saveMutation = useMutation({
    mutationFn: async (values) => {
      if (editing) {
        await actualizarTarea(editing.id, values);
        return;
      }
      await crearTarea(values);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["tareas"]
      });
      toast.success(editing ? "Tarea actualizada" : "Tarea creada");
      setOpenForm(false);
      setEditing(null);
    },
    onError: (e) => toast.error(e.message)
  });
  const completeMutation = useMutation({
    mutationFn: (id) => marcarTareaCompletada(id),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["tareas"]
      });
      toast.success("Tarea completada");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: eliminarTarea,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["tareas"]
      });
      toast.success("Tarea eliminada");
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1400px] mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "size-8 text-primary" }),
          "Tareas Pendientes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1 text-sm", children: [
          "Gestión de trámites, alertas operativas y seguimiento por módulo ·",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: "tareas_pendientes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setOpenForm(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
        "Nueva tarea"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "listado", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "dashboard", children: "Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "listado", children: "Listado" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "dashboard", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TareasDashboardPremium, { stats: statsQuery.data ?? {
        total: 0,
        pendientes: 0,
        en_progreso: 0,
        completadas: 0,
        canceladas: 0,
        criticas: 0,
        vencidas: 0,
        por_modulo: {}
      }, extended: statsQuery.data, tareas: tareasQuery.data ?? [], loading: statsQuery.isLoading || tareasQuery.isLoading, ruc: filtros.ruc ?? void 0 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "listado", className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            tareasQuery.data?.length ?? 0,
            " tareas"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tareas", className: "text-xs text-muted-foreground hover:underline", children: "Sincronizado con panel de notificaciones" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListaTareas, { tareas: tareasQuery.data ?? [], loading: tareasQuery.isLoading, filtros, onFiltrosChange: setFiltros, onEdit: (t) => {
          setEditing(t);
          setOpenForm(true);
        }, onComplete: (t) => completeMutation.mutate(t.id), onDelete: (t) => deleteMutation.mutate(t.id) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormularioTarea, { open: openForm, onOpenChange: (v) => {
      setOpenForm(v);
      if (!v) setEditing(null);
    }, initial: editing, loading: saveMutation.isPending, onSubmit: (values) => saveMutation.mutate(values) })
  ] });
}
export {
  TareasPage as component
};
