import { supabase } from "@/integrations/supabase/client";
import { round2 } from "@/lib/asientos-contables-utils";
import { fetchDeudasPendientes } from "@/lib/cxc-cxp-service";
import { fetchIntegrityErrorsRpc } from "@/modules/contabilidad/asientos/services/asiento-traceability-service";
import { fetchTareas } from "@/modules/tareas/services/tareas-service";
import type {
  EstadisticasGeneracion,
  NuevaTareaSugerida,
  ReglaPrioridad,
  SistemaContexto,
  SireResumen,
  TareaGenerada,
  TareaRule,
} from "@/modules/tareas/types/auto-generator";
import {
  addBusinessDays,
  daysBetween,
  isoDate,
  reglaModuloToDb,
  reglaPrioridadToDb,
} from "@/modules/tareas/types/auto-generator";

const LOG_KEY = "contam-tareas-auto-log";

function cpeLabel(r: Record<string, unknown>): string {
  return `${r.cod_tipo_cdp ?? ""}-${r.serie_cdp ?? ""}-${r.nro_cdp_inicial ?? ""}`.replace(/^-|-$/g, "");
}

function bumpPrioridad(p: ReglaPrioridad): ReglaPrioridad {
  const order: ReglaPrioridad[] = ["BAJA", "MEDIA", "ALTA", "CRITICA"];
  const i = order.indexOf(p);
  return order[Math.min(i + 1, order.length - 1)];
}

function isPaid(reg: SireResumen): boolean {
  return reg.tipo === "VENTA" ? reg.estadoCobro === "cobrado" : reg.estadoPago === "pagado";
}

function lastDayOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

const REGLAS: TareaRule[] = [
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
      return ctx.registrosSIRE
        .filter((r) => !r.tieneProvision && r.diasDesdeEmision > 7)
        .map((r) => {
          const prioridad: ReglaPrioridad = r.diasDesdeEmision > 15 ? "CRITICA" : "ALTA";
          const label = cpeLabel({ cod_tipo_cdp: r.codTipoCdp, serie_cdp: r.serie, nro_cdp_inicial: r.numero });
          return {
            titulo: `URGENTE: Provisionar ${label}`,
            descripcion: `${r.razonSocial} — comprobante sin asiento principal`,
            modulo: "SIRE" as const,
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
            reglaGeneradora: "provision_pendiente",
          };
        });
    },
  },
  {
    id: "vencimiento_proximo",
    nombre: "Vencimiento próximo",
    descripcion: "Comprobantes que vencen en 5 días",
    modulo: "SIRE",
    prioridad: "MEDIA",
    intervaloReevaluacion: 360,
    activa: true,
    condicion: (ctx) =>
      ctx.registrosSIRE.some((r) => {
        if (!r.fechaVencimiento || isPaid(r)) return false;
        const dias = daysBetween(ctx.fechaActual, new Date(r.fechaVencimiento));
        return dias >= 0 && dias <= 5;
      }),
    generarTareas(ctx) {
      return ctx.registrosSIRE
        .filter((r) => {
          if (!r.fechaVencimiento || isPaid(r)) return false;
          const dias = daysBetween(ctx.fechaActual, new Date(r.fechaVencimiento));
          return dias >= 0 && dias <= 5;
        })
        .map((r) => {
          const dias = daysBetween(ctx.fechaActual, new Date(r.fechaVencimiento!));
          const prioridad: ReglaPrioridad = dias < 3 ? "ALTA" : "MEDIA";
          const label = cpeLabel({ cod_tipo_cdp: r.codTipoCdp, serie_cdp: r.serie, nro_cdp_inicial: r.numero });
          return {
            titulo: `Próximo vencimiento: ${label}`,
            descripcion: `${r.razonSocial} vence el ${r.fechaVencimiento}`,
            modulo: "SIRE",
            prioridad,
            ruc: r.ruc,
            periodo: r.periodo,
            fechaVencimiento: r.fechaVencimiento!,
            metadata: { sireRegistroId: r.id },
            hashDeduplicacion: `VENCIMIENTO_PROXIMO_${r.id}`,
            entidad: r.razonSocial,
            tramite: `Vencimiento ${label}`,
            critica: prioridad === "ALTA",
            moduloOrigen: reglaModuloToDb("SIRE"),
            referenciaId: r.id,
            reglaGeneradora: "vencimiento_proximo",
          };
        });
    },
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
      return ctx.cxcCxp
        .filter((s) => s.diasAntiguedad > 30)
        .map((s) => {
          const prioridad: ReglaPrioridad = s.diasAntiguedad > 60 ? "CRITICA" : "ALTA";
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
            reglaGeneradora: "cxcxp_antiguo",
          };
        });
    },
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
      return ctx.movimientosCaja
        .filter((m) => m.cantidad > 0)
        .map((m) => ({
          titulo: `Centralizar caja: Período ${m.periodo}`,
          descripcion: `${m.cantidad} movimientos pendientes por S/ ${m.total.toFixed(2)}`,
          modulo: "CAJA" as const,
          prioridad: (finMes ? "ALTA" : "MEDIA") as ReglaPrioridad,
          ruc: m.ruc,
          periodo: m.periodo,
          fechaVencimiento: addBusinessDays(hoy, 3),
          metadata: { cantidad: m.cantidad, total: m.total },
          hashDeduplicacion: `CENTRALIZAR_CAJA_${m.ruc}_${m.periodo}`,
          entidad: "Libro Caja",
          tramite: `Centralización ${m.periodo}`,
          critica: finMes,
          moduloOrigen: reglaModuloToDb("CAJA"),
          reglaGeneradora: "centralizar_caja",
        }));
    },
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
        reglaGeneradora: "asiento_descuadrado",
      }));
    },
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
        descripcion: c.ultimaActividad
          ? `Sin actividad desde ${c.ultimaActividad}`
          : "Sin comprobantes registrados",
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
        reglaGeneradora: "contribuyente_inactivo",
      }));
    },
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
          reglaGeneradora: "cierre_periodo",
        },
      ];
    },
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
      const rank: Record<string, ReglaPrioridad> = {
        baja: "BAJA",
        media: "MEDIA",
        alta: "ALTA",
        urgente: "CRITICA",
      };
      return ctx.tareasExistentes
        .filter((t) => t.vencida && !["completada", "cancelada"].includes(t.estado))
        .map((t) => {
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
            reglaGeneradora: "tarea_vencida",
          };
        });
    },
  },
];

async function buildContexto(ruc?: string, periodo?: string): Promise<SistemaContexto> {
  const fechaActual = new Date();
  const rucFilter = ruc?.trim() || undefined;
  const periodoFilter = periodo?.trim() || undefined;

  let sireQ = supabase
    .from("registros_sire")
    .select(
      "id, ruc, razon_social, periodo, tipo, cod_tipo_cdp, serie_cdp, nro_cdp_inicial, fecha_emision, fecha_vencimiento, importe_total, mto_total_cp, estado_cobro, estado_pago",
    )
    .order("fecha_emision", { ascending: false })
    .limit(200);
  if (rucFilter) sireQ = sireQ.eq("ruc", rucFilter);
  if (periodoFilter) sireQ = sireQ.eq("periodo", periodoFilter);

  const [sireRes, asientosRes, movRes, tareas, contribRes] = await Promise.all([
    sireQ,
    supabase
      .from("asientos_contables")
      .select("sire_registro_id, id, debe, haber, ruc_contraparte, periodo, tipo_asiento")
      .eq("tipo_asiento", "principal")
      .limit(500),
    supabase
      .from("movimientos_caja")
      .select("ruc, periodo, debe, haber")
      .is("asiento_id", null)
      .limit(500),
    fetchTareas({ ruc: rucFilter, estado: "todos" }),
    supabase.from("contribuyentes").select("ruc, razon_social").limit(100),
  ]);

  const provisionIds = new Set(
    (asientosRes.data ?? [])
      .filter((a) => a.sire_registro_id)
      .map((a) => String(a.sire_registro_id)),
  );

  const registrosSIRE: SireResumen[] = (sireRes.data ?? []).map((r) => {
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
      diasDesdeEmision: emision ? daysBetween(new Date(emision), fechaActual) : 0,
    };
  });

  const movMap = new Map<string, { ruc: string; periodo: string; cantidad: number; total: number }>();
  for (const m of movRes.data ?? []) {
    const key = `${m.ruc}_${m.periodo}`;
    const prev = movMap.get(key) ?? { ruc: String(m.ruc), periodo: String(m.periodo), cantidad: 0, total: 0 };
    prev.cantidad++;
    prev.total += Math.max(Number(m.debe ?? 0), Number(m.haber ?? 0));
    movMap.set(key, prev);
  }

  const cxcCxp: SistemaContexto["cxcCxp"] = [];
  const rucs = rucFilter ? [rucFilter] : [...new Set(registrosSIRE.map((r) => r.ruc))].slice(0, 5);
  const deudasArrays = await Promise.all(
    rucs.map((r) => fetchDeudasPendientes({ ruc: r, periodo: periodoFilter }).catch(() => [])),
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
        diasAntiguedad: daysBetween(emision, fechaActual),
      });
    }
  }

  const asientosDescuadrados: SistemaContexto["asientosDescuadrados"] = [];
  const integrity = await fetchIntegrityErrorsRpc(rucFilter, periodoFilter).catch(() => []);
  for (const err of integrity as { check_type?: string; detalle?: Record<string, unknown> }[]) {
    if (err.check_type === "PARTIDA_DOBLE" && err.detalle) {
      asientosDescuadrados.push({
        asientoId: String(err.detalle.sire_registro_id ?? err.detalle.asiento_id ?? crypto.randomUUID()),
        diff: Number(err.detalle.diff ?? 0),
        ruc: rucFilter ?? "00000000000",
        periodo: periodoFilter ?? "",
      });
    }
  }

  const ultimaPorRuc = new Map<string, string>();
  for (const r of registrosSIRE) {
    const prev = ultimaPorRuc.get(r.ruc);
    if (!prev || r.fechaEmision > prev) ultimaPorRuc.set(r.ruc, r.fechaEmision);
  }

  const contribuyentesInactivos = (contribRes.data ?? [])
    .filter((c) => {
      const ult = ultimaPorRuc.get(String(c.ruc));
      if (!ult) return true;
      return daysBetween(new Date(ult), fechaActual) > 90;
    })
    .map((c) => ({
      ruc: String(c.ruc),
      razonSocial: String(c.razon_social ?? c.ruc),
      ultimaActividad: ultimaPorRuc.get(String(c.ruc)) ?? null,
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
      vencida: t.vencida === true,
    })),
    contribuyentesInactivos,
    asientosDescuadrados,
  };
}

function dedupeSugerencias(
  sugeridas: NuevaTareaSugerida[],
  existentes: SistemaContexto["tareasExistentes"],
): NuevaTareaSugerida[] {
  const hashMap = new Map(existentes.filter((t) => t.hashDeduplicacion).map((t) => [t.hashDeduplicacion!, t]));
  return sugeridas.filter((s) => {
    const ex = hashMap.get(s.hashDeduplicacion);
    if (!ex) return true;
    if (ex.estado === "completada") return false;
    if (ex.vencida) return true;
    return false;
  });
}

export class TareasAutoGenerator {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async evaluarReglas(ruc?: string, periodo?: string): Promise<NuevaTareaSugerida[]> {
    const ctx = await buildContexto(ruc, periodo);
    const sugeridas: NuevaTareaSugerida[] = [];

    for (const regla of REGLAS.filter((r) => r.activa)) {
      const ok = await regla.condicion(ctx);
      if (ok) sugeridas.push(...regla.generarTareas(ctx));
    }

    return dedupeSugerencias(sugeridas, ctx.tareasExistentes);
  }

  async generarTareasAutomaticas(
    ruc?: string,
    periodo?: string,
    autoConfirmar = false,
  ): Promise<TareaGenerada[]> {
    const sugeridas = await this.evaluarReglas(ruc, periodo);
    if (!autoConfirmar) {
      return sugeridas.map((s) => ({ id: "", sugerida: s, accion: "omitida" as const }));
    }

    const resultados: TareaGenerada[] = [];
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
        estado: "pendiente" as const,
      };

      const { data, error } = await supabase.from("tareas_pendientes").insert(payload).select("id").single();
      if (!error && data) {
        resultados.push({ id: String(data.id), sugerida: s, accion: "creada" });
      }
    }

    this.logGeneracion(resultados);
    return resultados;
  }

  async obtenerEstadisticasGeneracion(periodo: string): Promise<EstadisticasGeneracion> {
    let log: { regla: string; accion: string }[] = [];
    try {
      log = JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]") as typeof log;
    } catch {
      log = [];
    }
    const porRegla = log.reduce<Record<string, number>>((acc, e) => {
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
      tasaFalsosPositivos: log.length ? rechazadas / log.length : 0,
    };
  }

  programarEvaluacionPeriodica(intervaloMinutos = 60, onNuevas?: (tareas: NuevaTareaSugerida[]) => void) {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      void this.evaluarReglas().then((tareas) => {
        if (tareas.length && onNuevas) onNuevas(tareas);
        window.dispatchEvent(new CustomEvent("contam:tareas-sugeridas", { detail: tareas }));
      });
    }, intervaloMinutos * 60_000);
  }

  detenerEvaluacion() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private logGeneracion(resultados: TareaGenerada[]) {
    if (typeof window === "undefined") return;
    try {
      const prev = JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]") as { regla: string; accion: string }[];
      const next = [
        ...prev,
        ...resultados.map((r) => ({ regla: r.sugerida.reglaGeneradora, accion: r.accion })),
      ].slice(-200);
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
}

export const tareasAutoGenerator = new TareasAutoGenerator();

export async function evaluarReglasTareas(ruc?: string, periodo?: string) {
  return tareasAutoGenerator.evaluarReglas(ruc, periodo);
}
