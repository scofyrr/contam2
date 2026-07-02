import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ASIENTOS_CONTABLES_SELECT,
  GLOSA_CENTRALIZACION_CAJA,
  round2,
} from "@/lib/asientos-contables-utils";
import { resolverMontosSunat } from "@/lib/sire-montos";
import { sireSyncService } from "@/modules/sire/services/sire-sync-service";
import { fetchPcgeCuentas } from "@/lib/pcge-service";
import type {
  AsientoLineaTrazabilidad,
  IntegrityIssue,
  ResumenTrazabilidad,
  TraceabilityChain,
  TraceabilityEdge,
  TraceabilityNode,
} from "@/modules/contabilidad/asientos/types/traceability";

const TRACE_KEY = ["traceability"] as const;

function formatFecha(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function cpeLabel(row: Record<string, unknown>): string {
  return `${row.cod_tipo_cdp ?? ""}-${row.serie_cdp ?? ""}-${row.nro_cdp_inicial ?? ""}`.replace(
    /^-|-$/g,
    "",
  );
}

function lineaFromRow(
  row: Record<string, unknown>,
  pcgeMap: Map<string, string>,
): AsientoLineaTrazabilidad {
  const debe = round2(Number(row.debe ?? 0));
  const haber = round2(Number(row.haber ?? 0));
  const codigo = String(row.cuenta_contable ?? "");
  return {
    cuentaCodigo: codigo,
    cuentaDenominacion: pcgeMap.get(codigo) ?? codigo,
    debe,
    haber,
    naturaleza: debe > 0 ? "D" : "A",
  };
}

function cuentaPrincipal(lineas: AsientoLineaTrazabilidad[]): string | undefined {
  if (!lineas.length) return undefined;
  const sorted = [...lineas].sort(
    (a, b) => Math.max(b.debe, b.haber) - Math.max(a.debe, a.haber),
  );
  return sorted[0]?.cuentaCodigo;
}

function inferEstadoActual(
  registro: Record<string, unknown>,
  hasProvision: boolean,
  hasCancelacion: boolean,
  montoPendiente: number,
): string {
  if (registro.estado_validacion === "anulado") return "ANULADO";
  const tipo = String(registro.tipo ?? "");
  if (hasCancelacion) {
    return tipo === "VENTA" ? "COBRADO" : "PAGADO";
  }
  if (hasProvision && montoPendiente > 0.01) return "PARCIAL";
  if (hasProvision) return "PROVISIONADO";
  return "PENDIENTE";
}

/** Valida integridad de una cadena de trazabilidad. */
export function validateTraceabilityIntegrity(chain: TraceabilityChain): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  let issueIdx = 0;

  for (const node of chain.nodos) {
    if (node.type === "PROVISION" || node.type === "CANCELACION") {
      const lineas = node.metadata.lineasContables ?? [];
      const debe = round2(lineas.reduce((s, l) => s + l.debe, 0));
      const haber = round2(lineas.reduce((s, l) => s + l.haber, 0));
      if (Math.abs(debe - haber) > 0.001) {
        issues.push({
          id: `issue-${issueIdx++}`,
          tipo: "PARTIDA_DOBLE",
          severidad: "CRITICAL",
          descripcion: `Asiento descuadrado en ${node.titulo}`,
          detalle: `Debe ${debe} ≠ Haber ${haber}`,
          nodosAfectados: [node.id],
          sugerenciaCorreccion: "Revise las líneas del asiento en Libro Diario",
        });
      }
    }
  }

  const montoSire = chain.resumen.montoOriginal;
  if (chain.resumen.montoProvisionado > 0 && Math.abs(montoSire - chain.resumen.montoProvisionado) > 0.05) {
    issues.push({
      id: `issue-${issueIdx++}`,
      tipo: "MONTOS_DIVERGENTES",
      severidad: "ERROR",
      descripcion: "Monto SIRE difiere de la provisión",
      detalle: `SIRE ${montoSire} vs Provisión ${chain.resumen.montoProvisionado}`,
      nodosAfectados: [chain.nodoOrigen.id],
      sugerenciaCorreccion: "Regenerar provisión o corregir montos SUNAT",
    });
  }

  const fechas = chain.nodos.map((n) => new Date(n.fecha).getTime()).filter((t) => !Number.isNaN(t));
  if (fechas.length >= 2) {
    for (let i = 1; i < chain.nodos.length; i++) {
      const prev = new Date(chain.nodos[i - 1].fecha).getTime();
      const curr = new Date(chain.nodos[i].fecha).getTime();
      if (!Number.isNaN(prev) && !Number.isNaN(curr) && curr < prev - 86400000) {
        issues.push({
          id: `issue-${issueIdx++}`,
          tipo: "FECHA_INCONSISTENTE",
          severidad: "WARNING",
          descripcion: "Secuencia temporal inconsistente",
          detalle: `${chain.nodos[i].titulo} anterior a ${chain.nodos[i - 1].titulo}`,
          nodosAfectados: [chain.nodos[i - 1].id, chain.nodos[i].id],
        });
        break;
      }
    }
  }

  if (chain.nodos.length === 1) {
    issues.push({
      id: `issue-${issueIdx++}`,
      tipo: "ESLABON_ROTO",
      severidad: "INFO",
      descripcion: "Sin provisión ni movimientos de caja vinculados",
      detalle: "El comprobante aún no tiene trazabilidad contable completa",
      nodosAfectados: [chain.nodoOrigen.id],
      sugerenciaCorreccion: "Genere provisión desde Libro Diario",
    });
  }

  return issues;
}

/** Construye la cadena completa de trazabilidad para un comprobante SIRE. */
export async function buildTraceabilityChain(sireRegistroId: string): Promise<TraceabilityChain> {
  const t0 = performance.now();
  const fuentes: string[] = [];

  let registro: Record<string, unknown> | null = null;
  try {
    registro = (await sireSyncService.getRegistro(sireRegistroId)) as Record<string, unknown>;
    fuentes.push("sire_sync_service");
  } catch {
    registro = null;
  }

  if (!registro) {
    const { data: legacy } = await supabase
      .from("registros_sire")
      .select("*")
      .eq("id", sireRegistroId)
      .maybeSingle();
    if (legacy) {
      registro = legacy as Record<string, unknown>;
      fuentes.push("registros_sire");
    } else {
      const { data: norm } = await supabase
        .from("registros_sire_cabecera")
        .select("*")
        .eq("id", sireRegistroId)
        .maybeSingle();
      if (norm) {
        registro = norm as Record<string, unknown>;
        fuentes.push("registros_sire_cabecera");
      }
    }
  }

  if (!registro) {
    throw new Error("Comprobante SIRE no encontrado en legacy ni estructura normalizada");
  }

  const [asientosRes, movimientosRes, pcgeCuentas] = await Promise.all([
    supabase
      .from("asientos_contables")
      .select(ASIENTOS_CONTABLES_SELECT)
      .eq("sire_registro_id", sireRegistroId)
      .order("created_at", { ascending: true }),
    supabase
      .from("movimientos_caja")
      .select(
        "id, fecha, fecha_operacion, glosa, cuenta_contable, debe, haber, origen, origen_documento, tipo_movimiento, asiento_id, registro_sire_id, periodo, created_at",
      )
      .eq("registro_sire_id", sireRegistroId)
      .order("created_at", { ascending: true }),
    fetchPcgeCuentas().catch(() => []),
  ]);

  fuentes.push("asientos_contables", "movimientos_caja");

  if (asientosRes.error) throw asientosRes.error;
  if (movimientosRes.error) throw movimientosRes.error;

  const asientos = (asientosRes.data ?? []) as Record<string, unknown>[];
  const movimientos = (movimientosRes.data ?? []) as Record<string, unknown>[];
  const pcgeMap = new Map(pcgeCuentas.map((c) => [c.codigo_cuenta, c.nombre_cuenta]));

  const montos = resolverMontosSunat(registro);
  const moneda = String(registro.cod_moneda ?? "PEN");
  const nodos: TraceabilityNode[] = [];
  const aristas: TraceabilityEdge[] = [];

  const sireNodeId = `sire-${sireRegistroId}`;
  const sireNode: TraceabilityNode = {
    id: sireNodeId,
    type: "SIRE_REGISTRO",
    fecha: String(registro.created_at ?? registro.fecha_emision ?? new Date().toISOString()),
    fechaFormateada: formatFecha(String(registro.fecha_emision ?? registro.created_at ?? "")),
    titulo: `Comprobante ${cpeLabel(registro)}`,
    descripcion: `${registro.tipo} — ${registro.nombre_contraparte ?? ""}`,
    monto: montos.mto_total_cp,
    moneda,
    estado: "completado",
    metadata: {
      tipoComprobante: String(registro.cod_tipo_cdp ?? ""),
      serie: String(registro.serie_cdp ?? ""),
      numero: String(registro.nro_cdp_inicial ?? ""),
      rucContraparte: String(registro.nro_doc_contraparte ?? ""),
      nombreContraparte: String(registro.nombre_contraparte ?? ""),
      linkNavegacion: "/sire-registros",
    },
  };
  nodos.push(sireNode);

  let prevNodeId = sireNodeId;

  const provisionRows = asientos.filter((a) => a.tipo_asiento === "principal");
  const cancelacionRows = asientos.filter((a) => a.tipo_asiento === "cancelacion_caja");
  const centralRows = asientos.filter(
    (a) =>
      a.tipo_libro === "CAJA_BANCOS" &&
      String(a.glosa ?? "").startsWith(GLOSA_CENTRALIZACION_CAJA),
  );

  if (provisionRows.length) {
    const lineas = provisionRows.map((r) => lineaFromRow(r, pcgeMap));
    const monto = round2(lineas.reduce((s, l) => s + l.debe, 0));
    const nodeId = `provision-${sireRegistroId}`;
    const node: TraceabilityNode = {
      id: nodeId,
      type: "PROVISION",
      fecha: String(provisionRows[0].created_at ?? provisionRows[0].fecha_asiento ?? ""),
      fechaFormateada: formatFecha(String(provisionRows[0].fecha_asiento ?? "")),
      titulo: "Provisión contable",
      descripcion: String(provisionRows[0].glosa ?? "Asiento principal SIRE"),
      monto,
      moneda,
      estado: "completado",
      metadata: {
        asientoId: String(provisionRows[0].id ?? ""),
        lineasContables: lineas,
        cuentaPrincipal: cuentaPrincipal(lineas),
        linkNavegacion: "/libro-diario",
      },
      nodoAnterior: prevNodeId,
    };
    nodos.push(node);
    aristas.push({
      from: prevNodeId,
      to: nodeId,
      type: "GENERA",
      label: "Genera provisión",
      montoRelacionado: monto,
    });
    prevNodeId = nodeId;
  }

  const movNodeIds: string[] = [];
  for (const mov of movimientos) {
    const monto = round2(Math.max(Number(mov.debe ?? 0), Number(mov.haber ?? 0)));
    const nodeId = `mov-${mov.id}`;
    const node: TraceabilityNode = {
      id: nodeId,
      type: "MOVIMIENTO_CAJA",
      fecha: String(mov.fecha_operacion ?? mov.fecha ?? mov.created_at ?? ""),
      fechaFormateada: formatFecha(String(mov.fecha_operacion ?? mov.fecha ?? "")),
      titulo: "Movimiento de caja",
      descripcion: String(mov.glosa ?? "Liquidación SIRE"),
      monto,
      moneda,
      estado: "completado",
      metadata: {
        movimientoId: String(mov.id),
        cuentaFinanciera: String(mov.cuenta_contable ?? ""),
        tipoMovimiento: Number(mov.debe ?? 0) > 0 ? "INGRESO" : "EGRESO",
        origenDocumento: String(mov.origen_documento ?? mov.origen ?? "SIRE"),
        linkNavegacion: "/libro-caja",
      },
      nodoAnterior: prevNodeId,
    };
    nodos.push(node);
    movNodeIds.push(nodeId);
    aristas.push({
      from: prevNodeId,
      to: nodeId,
      type: "PAGA",
      label: String(registro.tipo) === "VENTA" ? "Cobro" : "Pago",
      montoRelacionado: monto,
    });
  }

  if (cancelacionRows.length) {
    const lineas = cancelacionRows.map((r) => lineaFromRow(r, pcgeMap));
    const monto = round2(lineas.reduce((s, l) => s + Math.max(l.debe, l.haber), 0));
    const nodeId = `cancel-${sireRegistroId}`;
    const node: TraceabilityNode = {
      id: nodeId,
      type: "CANCELACION",
      fecha: String(cancelacionRows[0].created_at ?? cancelacionRows[0].fecha_asiento ?? ""),
      fechaFormateada: formatFecha(String(cancelacionRows[0].fecha_asiento ?? "")),
      titulo: "Cancelación contable",
      descripcion: "Asiento cancelacion_caja vía liquidación SIRE",
      monto,
      moneda,
      estado: "completado",
      metadata: {
        asientoId: String(cancelacionRows[0].id ?? ""),
        lineasContables: lineas,
        cuentaPrincipal: cuentaPrincipal(lineas),
        linkNavegacion: "/libro-diario",
      },
      nodoAnterior: movNodeIds[movNodeIds.length - 1] ?? prevNodeId,
      nodosParalelos: movNodeIds.length ? movNodeIds : undefined,
    };
    nodos.push(node);
    const fromId = movNodeIds[movNodeIds.length - 1] ?? prevNodeId;
    aristas.push({
      from: fromId,
      to: nodeId,
      type: "CANCELA",
      label: "Cancelación",
      montoRelacionado: monto,
    });
    prevNodeId = nodeId;
  }

  if (centralRows.length) {
    const asientoIds = new Set(centralRows.map((r) => String(r.id)));
    const movsAgrupados = movimientos.filter((m) => m.asiento_id && asientoIds.has(String(m.asiento_id)));
    const nodeId = `central-${sireRegistroId}`;
    const node: TraceabilityNode = {
      id: nodeId,
      type: "CENTRALIZACION",
      fecha: String(centralRows[0].created_at ?? centralRows[0].fecha_asiento ?? ""),
      fechaFormateada: formatFecha(String(centralRows[0].fecha_asiento ?? "")),
      titulo: "Centralización de caja",
      descripcion: GLOSA_CENTRALIZACION_CAJA,
      monto: round2(centralRows.reduce((s, r) => s + Number(r.debe ?? 0), 0)),
      moneda,
      estado: "completado",
      metadata: {
        cantidadMovimientos: movsAgrupados.length || movimientos.length,
        periodoCentralizado: String(centralRows[0].periodo ?? registro.periodo ?? ""),
        linkNavegacion: "/libro-caja",
      },
      nodoAnterior: prevNodeId,
    };
    nodos.push(node);
    for (const mid of movNodeIds) {
      aristas.push({ from: mid, to: nodeId, type: "AGRUPA", label: "Centraliza" });
    }
  }

  const cancelacionActiva = Boolean(registro.cancelacion_asiento_id);
  if (
    cancelacionRows.length > 0 &&
    !cancelacionActiva &&
    (registro.estado_cobro === "pendiente" || registro.estado_pago === "pendiente")
  ) {
    const nodeId = `reversion-${sireRegistroId}`;
    nodos.push({
      id: nodeId,
      type: "REVERSION",
      fecha: new Date().toISOString(),
      fechaFormateada: formatFecha(new Date().toISOString()),
      titulo: "Posible reversión",
      descripcion: "Estado SIRE pendiente pero existen asientos de cancelación",
      monto: 0,
      moneda,
      estado: "revertido",
      metadata: { linkNavegacion: "/libro-caja" },
      nodoAnterior: prevNodeId,
    });
    aristas.push({ from: prevNodeId, to: nodeId, type: "REVIERTE", label: "Reversión detectada" });
  }

  nodos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const montoProvisionado = round2(
    provisionRows.reduce((s, r) => s + Number(r.debe ?? 0), 0),
  );
  const montoPagado = round2(
    movimientos.reduce((s, m) => s + Math.max(Number(m.debe ?? 0), Number(m.haber ?? 0)), 0),
  );
  const montoPendiente = round2(Math.max(0, montos.mto_total_cp - montoPagado));

  const fechaCreacion = String(registro.fecha_emision ?? registro.created_at ?? "");
  const hoy = Date.now();
  const diasTranscurridos = fechaCreacion
    ? Math.floor((hoy - new Date(fechaCreacion).getTime()) / 86400000)
    : 0;

  const chainDraft: TraceabilityChain = {
    id: sireRegistroId,
    ruc: String(registro.ruc ?? ""),
    periodo: String(registro.periodo ?? ""),
    nodoOrigen: sireNode,
    nodos,
    aristas,
    resumen: {
      estadoActual: inferEstadoActual(
        registro,
        provisionRows.length > 0,
        cancelacionRows.length > 0 || cancelacionActiva,
        montoPendiente,
      ),
      montoOriginal: montos.mto_total_cp,
      montoProvisionado,
      montoPagado,
      montoPendiente,
      porcentajeCompletado: montos.mto_total_cp
        ? Math.min(100, round2((montoPagado / montos.mto_total_cp) * 100))
        : 0,
      fechaCreacion,
      fechaProvision: provisionRows[0]
        ? String(provisionRows[0].fecha_asiento ?? "")
        : undefined,
      fechaPago: movimientos.length
        ? String(movimientos[movimientos.length - 1].fecha_operacion ?? "")
        : undefined,
      diasTranscurridos,
      diasHastaPago:
        movimientos.length && fechaCreacion
          ? Math.floor(
              (new Date(String(movimientos[movimientos.length - 1].fecha_operacion)).getTime() -
                new Date(fechaCreacion).getTime()) /
                86400000,
            )
          : undefined,
      tieneErrores: false,
      erroresDetectados: [],
    },
    metadata: {
      fechaConsulta: new Date().toISOString(),
      usuarioConsulta: "authenticated",
      tiempoConstruccion: Math.round(performance.now() - t0),
      fuentesConsultadas: fuentes,
    },
  };

  const errores = validateTraceabilityIntegrity(chainDraft);
  chainDraft.resumen.erroresDetectados = errores;
  chainDraft.resumen.tieneErrores = errores.some((e) => e.severidad === "CRITICAL" || e.severidad === "ERROR");

  return chainDraft;
}

export async function getRelatedAsientos(asientoId: string): Promise<TraceabilityNode[]> {
  const { data: anchor, error } = await supabase
    .from("asientos_contables")
    .select("sire_registro_id")
    .eq("id", asientoId)
    .maybeSingle();
  if (error || !anchor?.sire_registro_id) return [];
  const chain = await buildTraceabilityChain(String(anchor.sire_registro_id));
  return chain.nodos.filter(
    (n) => n.metadata.asientoId === asientoId || n.type === "SIRE_REGISTRO",
  );
}

export async function getResumenTrazabilidadRUC(
  ruc: string,
  periodo?: string,
): Promise<ResumenTrazabilidad[]> {
  let q = supabase
    .from("registros_sire")
    .select("id, cod_tipo_cdp, serie_cdp, nro_cdp_inicial, tipo, importe_total, mto_total_cp, bi_grav, igv_grav, fecha_emision, created_at")
    .eq("ruc", ruc)
    .order("fecha_emision", { ascending: false })
    .limit(50);

  if (periodo) q = q.eq("periodo", periodo);

  let { data, error } = await q;
  if (error || !data?.length) {
    const q2 = supabase
      .from("registros_sire_cabecera")
      .select("id, cod_tipo_cdp, serie_cdp, nro_cdp_inicial, tipo, fecha_emision, created_at")
      .eq("ruc", ruc)
      .order("fecha_emision", { ascending: false })
      .limit(50);
    const res = periodo ? await q2.eq("periodo", periodo) : await q2;
    data = res.data as typeof data;
    error = res.error;
  }
  if (error) throw error;

  const summaries: ResumenTrazabilidad[] = [];
  for (const row of data ?? []) {
    try {
      const chain = await buildTraceabilityChain(String(row.id));
      summaries.push({
        sireRegistroId: String(row.id),
        comprobante: cpeLabel(row as Record<string, unknown>),
        tipo: String(row.tipo ?? ""),
        estadoActual: chain.resumen.estadoActual,
        montoTotal: chain.resumen.montoOriginal,
        montoPendiente: chain.resumen.montoPendiente,
        diasTranscurridos: chain.resumen.diasTranscurridos,
        tieneErrores: chain.resumen.tieneErrores,
      });
    } catch {
      /* skip */
    }
  }
  return summaries;
}

export async function fetchIntegrityErrorsRpc(ruc?: string, periodo?: string) {
  const { data, error } = await supabase.rpc("rpc_validate_accounting_integrity", {
    p_ruc: ruc ?? null,
    p_periodo: periodo ?? null,
  });
  if (error) return [];
  return data ?? [];
}

export async function fixIntegrityIssues(dryRun: boolean) {
  const { data, error } = await supabase.rpc("rpc_fix_common_integrity_issues", {
    p_dry_run: dryRun,
  });
  if (error) throw error;
  return data;
}

export function useTraceabilityChain(sireRegistroId: string | null | undefined) {
  return useQuery({
    queryKey: [...TRACE_KEY, "chain", sireRegistroId],
    queryFn: () => buildTraceabilityChain(sireRegistroId!),
    enabled: !!sireRegistroId,
    staleTime: 2 * 60_000,
  });
}

export function useTraceabilitySummary(ruc: string, periodo?: string) {
  return useQuery({
    queryKey: [...TRACE_KEY, "summary", ruc, periodo],
    queryFn: () => getResumenTrazabilidadRUC(ruc, periodo),
    enabled: ruc.trim().length === 11,
    staleTime: 5 * 60_000,
  });
}

export function useIntegrityErrors(ruc?: string, periodo?: string) {
  return useQuery({
    queryKey: [...TRACE_KEY, "integrity", ruc, periodo],
    queryFn: () => fetchIntegrityErrorsRpc(ruc, periodo),
    staleTime: 60_000,
  });
}

export function useFixIntegrity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dryRun: boolean) => fixIntegrityIssues(dryRun),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TRACE_KEY });
    },
  });
}

export const asientoTraceabilityService = {
  buildTraceabilityChain,
  validateTraceabilityIntegrity,
  getRelatedAsientos,
  getResumenTrazabilidadRUC,
};
