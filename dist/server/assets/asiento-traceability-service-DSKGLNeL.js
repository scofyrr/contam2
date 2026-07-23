import { u as useQuery } from "./useQuery-GwWd8T8C.js";
import { ab as supabase, A as ASIENTOS_CONTABLES_SELECT, a5 as resolverMontosSunat, G as GLOSA_CENTRALIZACION_CAJA, a6 as round2 } from "./router-B2oVQHub.js";
import { s as sireSyncService } from "./sire-sync-service-FZz5qvf6.js";
import { f as fetchPcgeCuentas } from "./pcge-service-BYlxIcvs.js";
const TRACE_KEY = ["traceability"];
function formatFecha(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}
function cpeLabel(row) {
  return `${row.cod_tipo_cdp ?? ""}-${row.serie_cdp ?? ""}-${row.nro_cdp_inicial ?? ""}`.replace(
    /^-|-$/g,
    ""
  );
}
function lineaFromRow(row, pcgeMap) {
  const debe = round2(Number(row.debe ?? 0));
  const haber = round2(Number(row.haber ?? 0));
  const codigo = String(row.cuenta_contable ?? "");
  return {
    cuentaCodigo: codigo,
    cuentaDenominacion: pcgeMap.get(codigo) ?? codigo,
    debe,
    haber,
    naturaleza: debe > 0 ? "D" : "A"
  };
}
function cuentaPrincipal(lineas) {
  if (!lineas.length) return void 0;
  const sorted = [...lineas].sort(
    (a, b) => Math.max(b.debe, b.haber) - Math.max(a.debe, a.haber)
  );
  return sorted[0]?.cuentaCodigo;
}
function inferEstadoActual(registro, hasProvision, hasCancelacion, montoPendiente) {
  if (registro.estado_validacion === "anulado") return "ANULADO";
  const tipo = String(registro.tipo ?? "");
  if (hasCancelacion) {
    return tipo === "VENTA" ? "COBRADO" : "PAGADO";
  }
  if (hasProvision && montoPendiente > 0.01) return "PARCIAL";
  if (hasProvision) return "PROVISIONADO";
  return "PENDIENTE";
}
function validateTraceabilityIntegrity(chain) {
  const issues = [];
  let issueIdx = 0;
  for (const node of chain.nodos) {
    if (node.type === "PROVISION" || node.type === "CANCELACION") {
      const lineas = node.metadata.lineasContables ?? [];
      const debe = round2(lineas.reduce((s, l) => s + l.debe, 0));
      const haber = round2(lineas.reduce((s, l) => s + l.haber, 0));
      if (Math.abs(debe - haber) > 1e-3) {
        issues.push({
          id: `issue-${issueIdx++}`,
          tipo: "PARTIDA_DOBLE",
          severidad: "CRITICAL",
          descripcion: `Asiento descuadrado en ${node.titulo}`,
          detalle: `Debe ${debe} ≠ Haber ${haber}`,
          nodosAfectados: [node.id],
          sugerenciaCorreccion: "Revise las líneas del asiento en Libro Diario"
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
      sugerenciaCorreccion: "Regenerar provisión o corregir montos SUNAT"
    });
  }
  const fechas = chain.nodos.map((n) => new Date(n.fecha).getTime()).filter((t) => !Number.isNaN(t));
  if (fechas.length >= 2) {
    for (let i = 1; i < chain.nodos.length; i++) {
      const prev = new Date(chain.nodos[i - 1].fecha).getTime();
      const curr = new Date(chain.nodos[i].fecha).getTime();
      if (!Number.isNaN(prev) && !Number.isNaN(curr) && curr < prev - 864e5) {
        issues.push({
          id: `issue-${issueIdx++}`,
          tipo: "FECHA_INCONSISTENTE",
          severidad: "WARNING",
          descripcion: "Secuencia temporal inconsistente",
          detalle: `${chain.nodos[i].titulo} anterior a ${chain.nodos[i - 1].titulo}`,
          nodosAfectados: [chain.nodos[i - 1].id, chain.nodos[i].id]
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
      sugerenciaCorreccion: "Genere provisión desde Libro Diario"
    });
  }
  return issues;
}
async function buildTraceabilityChain(sireRegistroId) {
  const t0 = performance.now();
  const fuentes = [];
  let registro = null;
  try {
    registro = await sireSyncService.getRegistro(sireRegistroId);
    fuentes.push("sire_sync_service");
  } catch {
    registro = null;
  }
  if (!registro) {
    const { data: legacy } = await supabase.from("registros_sire").select("*").eq("id", sireRegistroId).maybeSingle();
    if (legacy) {
      registro = legacy;
      fuentes.push("registros_sire");
    } else {
      const { data: norm } = await supabase.from("registros_sire_cabecera").select("*").eq("id", sireRegistroId).maybeSingle();
      if (norm) {
        registro = norm;
        fuentes.push("registros_sire_cabecera");
      }
    }
  }
  if (!registro) {
    throw new Error("Comprobante SIRE no encontrado en legacy ni estructura normalizada");
  }
  const [asientosRes, movimientosRes, pcgeCuentas] = await Promise.all([
    supabase.from("asientos_contables").select(ASIENTOS_CONTABLES_SELECT).eq("sire_registro_id", sireRegistroId).order("created_at", { ascending: true }),
    supabase.from("movimientos_caja").select(
      "id, fecha, fecha_operacion, glosa, cuenta_contable, debe, haber, origen, origen_documento, tipo_movimiento, asiento_id, registro_sire_id, periodo, created_at"
    ).eq("registro_sire_id", sireRegistroId).order("created_at", { ascending: true }),
    fetchPcgeCuentas().catch(() => [])
  ]);
  fuentes.push("asientos_contables", "movimientos_caja");
  if (asientosRes.error) throw asientosRes.error;
  if (movimientosRes.error) throw movimientosRes.error;
  const asientos = asientosRes.data ?? [];
  const movimientos = movimientosRes.data ?? [];
  const pcgeMap = new Map(pcgeCuentas.map((c) => [c.codigo_cuenta, c.nombre_cuenta]));
  const montos = resolverMontosSunat(registro);
  const moneda = String(registro.cod_moneda ?? "PEN");
  const nodos = [];
  const aristas = [];
  const sireNodeId = `sire-${sireRegistroId}`;
  const sireNode = {
    id: sireNodeId,
    type: "SIRE_REGISTRO",
    fecha: String(registro.created_at ?? registro.fecha_emision ?? (/* @__PURE__ */ new Date()).toISOString()),
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
      linkNavegacion: "/sire-registros"
    }
  };
  nodos.push(sireNode);
  let prevNodeId = sireNodeId;
  const provisionRows = asientos.filter((a) => a.tipo_asiento === "principal");
  const cancelacionRows = asientos.filter((a) => a.tipo_asiento === "cancelacion_caja");
  const centralRows = asientos.filter(
    (a) => a.tipo_libro === "CAJA_BANCOS" && String(a.glosa ?? "").startsWith(GLOSA_CENTRALIZACION_CAJA)
  );
  if (provisionRows.length) {
    const lineas = provisionRows.map((r) => lineaFromRow(r, pcgeMap));
    const monto = round2(lineas.reduce((s, l) => s + l.debe, 0));
    const nodeId = `provision-${sireRegistroId}`;
    const node = {
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
        linkNavegacion: "/libro-diario"
      },
      nodoAnterior: prevNodeId
    };
    nodos.push(node);
    aristas.push({
      from: prevNodeId,
      to: nodeId,
      type: "GENERA",
      label: "Genera provisión",
      montoRelacionado: monto
    });
    prevNodeId = nodeId;
  }
  const movNodeIds = [];
  for (const mov of movimientos) {
    const monto = round2(Math.max(Number(mov.debe ?? 0), Number(mov.haber ?? 0)));
    const nodeId = `mov-${mov.id}`;
    const node = {
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
        linkNavegacion: "/libro-caja"
      },
      nodoAnterior: prevNodeId
    };
    nodos.push(node);
    movNodeIds.push(nodeId);
    aristas.push({
      from: prevNodeId,
      to: nodeId,
      type: "PAGA",
      label: String(registro.tipo) === "VENTA" ? "Cobro" : "Pago",
      montoRelacionado: monto
    });
  }
  if (cancelacionRows.length) {
    const lineas = cancelacionRows.map((r) => lineaFromRow(r, pcgeMap));
    const monto = round2(lineas.reduce((s, l) => s + Math.max(l.debe, l.haber), 0));
    const nodeId = `cancel-${sireRegistroId}`;
    const node = {
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
        linkNavegacion: "/libro-diario"
      },
      nodoAnterior: movNodeIds[movNodeIds.length - 1] ?? prevNodeId,
      nodosParalelos: movNodeIds.length ? movNodeIds : void 0
    };
    nodos.push(node);
    const fromId = movNodeIds[movNodeIds.length - 1] ?? prevNodeId;
    aristas.push({
      from: fromId,
      to: nodeId,
      type: "CANCELA",
      label: "Cancelación",
      montoRelacionado: monto
    });
    prevNodeId = nodeId;
  }
  if (centralRows.length) {
    const asientoIds = new Set(centralRows.map((r) => String(r.id)));
    const movsAgrupados = movimientos.filter((m) => m.asiento_id && asientoIds.has(String(m.asiento_id)));
    const nodeId = `central-${sireRegistroId}`;
    const node = {
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
        linkNavegacion: "/libro-caja"
      },
      nodoAnterior: prevNodeId
    };
    nodos.push(node);
    for (const mid of movNodeIds) {
      aristas.push({ from: mid, to: nodeId, type: "AGRUPA", label: "Centraliza" });
    }
  }
  const cancelacionActiva = Boolean(registro.cancelacion_asiento_id);
  if (cancelacionRows.length > 0 && !cancelacionActiva && (registro.estado_cobro === "pendiente" || registro.estado_pago === "pendiente")) {
    const nodeId = `reversion-${sireRegistroId}`;
    nodos.push({
      id: nodeId,
      type: "REVERSION",
      fecha: (/* @__PURE__ */ new Date()).toISOString(),
      fechaFormateada: formatFecha((/* @__PURE__ */ new Date()).toISOString()),
      titulo: "Posible reversión",
      descripcion: "Estado SIRE pendiente pero existen asientos de cancelación",
      monto: 0,
      moneda,
      estado: "revertido",
      metadata: { linkNavegacion: "/libro-caja" },
      nodoAnterior: prevNodeId
    });
    aristas.push({ from: prevNodeId, to: nodeId, type: "REVIERTE", label: "Reversión detectada" });
  }
  nodos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const montoProvisionado = round2(
    provisionRows.reduce((s, r) => s + Number(r.debe ?? 0), 0)
  );
  const montoPagado = round2(
    movimientos.reduce((s, m) => s + Math.max(Number(m.debe ?? 0), Number(m.haber ?? 0)), 0)
  );
  const montoPendiente = round2(Math.max(0, montos.mto_total_cp - montoPagado));
  const fechaCreacion = String(registro.fecha_emision ?? registro.created_at ?? "");
  const hoy = Date.now();
  const diasTranscurridos = fechaCreacion ? Math.floor((hoy - new Date(fechaCreacion).getTime()) / 864e5) : 0;
  const chainDraft = {
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
        montoPendiente
      ),
      montoOriginal: montos.mto_total_cp,
      montoProvisionado,
      montoPagado,
      montoPendiente,
      porcentajeCompletado: montos.mto_total_cp ? Math.min(100, round2(montoPagado / montos.mto_total_cp * 100)) : 0,
      fechaCreacion,
      fechaProvision: provisionRows[0] ? String(provisionRows[0].fecha_asiento ?? "") : void 0,
      fechaPago: movimientos.length ? String(movimientos[movimientos.length - 1].fecha_operacion ?? "") : void 0,
      diasTranscurridos,
      diasHastaPago: movimientos.length && fechaCreacion ? Math.floor(
        (new Date(String(movimientos[movimientos.length - 1].fecha_operacion)).getTime() - new Date(fechaCreacion).getTime()) / 864e5
      ) : void 0,
      tieneErrores: false,
      erroresDetectados: []
    },
    metadata: {
      fechaConsulta: (/* @__PURE__ */ new Date()).toISOString(),
      usuarioConsulta: "authenticated",
      tiempoConstruccion: Math.round(performance.now() - t0),
      fuentesConsultadas: fuentes
    }
  };
  const errores = validateTraceabilityIntegrity(chainDraft);
  chainDraft.resumen.erroresDetectados = errores;
  chainDraft.resumen.tieneErrores = errores.some((e) => e.severidad === "CRITICAL" || e.severidad === "ERROR");
  return chainDraft;
}
async function fetchIntegrityErrorsRpc(ruc, periodo) {
  const { data, error } = await supabase.rpc("rpc_validate_accounting_integrity", {
    p_ruc: ruc ?? null,
    p_periodo: periodo ?? null
  });
  if (error) return [];
  return data ?? [];
}
function useTraceabilityChain(sireRegistroId) {
  return useQuery({
    queryKey: [...TRACE_KEY, "chain", sireRegistroId],
    queryFn: () => buildTraceabilityChain(sireRegistroId),
    enabled: !!sireRegistroId,
    staleTime: 2 * 6e4
  });
}
export {
  fetchIntegrityErrorsRpc as f,
  useTraceabilityChain as u
};
