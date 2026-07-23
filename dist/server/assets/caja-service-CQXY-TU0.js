import { ac as supabase, V as normalizeCuentaContable, ai as toAsientoContableInsert, G as GLOSA_CENTRALIZACION_CAJA, a7 as round2 } from "./router-BRL0s0LD.js";
import { a as apiRequest, u as useDjangoApi } from "./http-client-BNGDvc7A.js";
import "./server-BIroHbvu.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
async function centralizarPeriodoViaApi(params) {
  const res = await apiRequest("/caja/centralizar-periodo/", {
    method: "POST",
    body: JSON.stringify({ ruc: params.ruc, periodo: params.periodo })
  });
  const ref = res.asiento_referencia_id;
  return {
    asientoReferenciaId: ref,
    movimientosVinculados: res.movimientos_vinculados,
    lineasDiario: res.lineas_diario
  };
}
const MOV_CAJA_SELECT = "id, correlativo, ruc, ruc_contribuyente, periodo, fecha, fecha_operacion, glosa, descripcion, cuenta_contable, debe, haber, origen, origen_documento, numero_documento, tipo_movimiento, registro_sire_id, asiento_id, created_at";
async function fetchMovimientosCaja(params) {
  const ruc = params.ruc.trim();
  if (!ruc) return [];
  let q = supabase.from("movimientos_caja").select(MOV_CAJA_SELECT).eq("ruc", ruc).order("fecha", { ascending: true });
  if (params.periodo?.trim()) q = q.eq("periodo", params.periodo.trim());
  if (params.tipo_movimiento?.trim()) q = q.eq("tipo_movimiento", params.tipo_movimiento.trim());
  if (params.origen_documento?.trim()) q = q.eq("origen_documento", params.origen_documento.trim());
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
async function fetchMovimientosSinCentralizar(params) {
  const ruc = params.ruc.trim();
  const periodo = params.periodo.trim();
  if (!ruc || !periodo) return [];
  const { data, error } = await supabase.from("movimientos_caja").select(MOV_CAJA_SELECT).eq("ruc", ruc).eq("periodo", periodo).is("asiento_id", null).order("fecha_operacion", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
async function centralizarPeriodoCaja(params) {
  const ruc = params.ruc.trim();
  const periodo = params.periodo.trim();
  if (!ruc) throw new Error("Selecciona un RUC antes de centralizar.");
  if (!periodo) throw new Error("Indica el periodo (AAAAMM) antes de centralizar.");
  const movimientos = await fetchMovimientosSinCentralizar({ ruc, periodo });
  if (movimientos.length === 0) {
    throw new Error("No hay movimientos pendientes de centralizar en este periodo.");
  }
  const porCuenta = /* @__PURE__ */ new Map();
  for (const m of movimientos) {
    const fecha = String(m.fecha_operacion ?? m.fecha ?? "").slice(0, 10);
    const cuenta = normalizeCuentaContable(m.cuenta_contable);
    if (!cuenta) throw new Error(`Movimiento ${m.id} sin cuenta contable válida.`);
    const prev = porCuenta.get(cuenta) ?? { debe: 0, haber: 0, fecha };
    prev.debe += Number(m.debe ?? 0);
    prev.haber += Number(m.haber ?? 0);
    if (fecha > prev.fecha) prev.fecha = fecha;
    porCuenta.set(cuenta, prev);
  }
  const fechaAsiento = [...porCuenta.values()].reduce((max, a) => a.fecha > max ? a.fecha : max, "") || `${periodo.slice(0, 4)}-${periodo.slice(4, 6)}-01`;
  const glosaResumen = `${GLOSA_CENTRALIZACION_CAJA} ${periodo}`;
  const filas = [...porCuenta.entries()].map(
    ([cuenta, agg]) => toAsientoContableInsert({
      sire_registro_id: null,
      periodo,
      tipo_asiento: "principal",
      tipo_libro: "CAJA_BANCOS",
      fecha_asiento: fechaAsiento,
      cuenta_contable: cuenta,
      glosa: glosaResumen,
      debe: round2(agg.debe),
      haber: round2(agg.haber),
      naturaleza: agg.debe > 0 ? "debe" : "haber",
      tipo_registro: "COMPRA",
      serie_cdp: null,
      nro_cdp_inicial: null,
      ruc_contraparte: ruc,
      nombre_contraparte: null
    })
  );
  const totalDebe = round2(filas.reduce((s, f) => s + Number(f.debe ?? 0), 0));
  const totalHaber = round2(filas.reduce((s, f) => s + Number(f.haber ?? 0), 0));
  if (Math.abs(totalDebe - totalHaber) > 0.01) {
    throw new Error(
      `La centralización está descuadrada (Debe ${totalDebe} ≠ Haber ${totalHaber}). Revise los movimientos de caja.`
    );
  }
  const { data: insertados, error: insertErr } = await supabase.from("asientos_contables").insert(filas).select("id");
  if (insertErr) throw insertErr;
  const ids = (insertados ?? []).map((r) => r.id);
  if (ids.length === 0) throw new Error("No se generaron líneas en el libro diario.");
  const asientoReferenciaId = ids[0];
  const movIds = movimientos.map((m) => m.id);
  const { error: linkErr } = await supabase.from("movimientos_caja").update({ asiento_id: asientoReferenciaId }).eq("ruc", ruc).eq("periodo", periodo).in("id", movIds);
  if (linkErr) throw linkErr;
  return {
    movimientosVinculados: movIds.length,
    lineasDiario: ids.length,
    asientoReferenciaId
  };
}
async function ejecutarCentralizarPeriodo(params) {
  if (useDjangoApi()) {
    return centralizarPeriodoViaApi(params);
  }
  return centralizarPeriodoCaja(params);
}
async function fetchMovimientosPorAsientoLote(asientoLoteId) {
  const id = asientoLoteId.trim();
  if (!id) return [];
  const { data, error } = await supabase.from("movimientos_caja").select(MOV_CAJA_SELECT).eq("asiento_id", id).order("fecha_operacion", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
async function createMovimientoCaja(input) {
  const ruc = input.ruc.trim();
  if (!ruc) throw new Error("El RUC del contribuyente es obligatorio.");
  const fecha = input.fecha_operacion ?? input.fecha;
  const { data, error } = await supabase.from("movimientos_caja").insert({
    ruc,
    periodo: input.periodo,
    fecha,
    fecha_operacion: input.fecha_operacion ?? fecha,
    glosa: input.glosa,
    cuenta_contable: normalizeCuentaContable(input.cuenta_contable),
    debe: input.debe,
    haber: input.haber,
    origen: input.origen ?? "manual",
    registro_sire_id: input.registro_sire_id ?? null,
    asiento_id: input.asiento_id ?? null
  }).select(MOV_CAJA_SELECT).single();
  if (error) throw error;
  return data;
}
async function updateMovimientoCaja(id, patch) {
  const body = { ...patch };
  if (patch.fecha_operacion) body.fecha = patch.fecha_operacion;
  if (patch.cuenta_contable != null) {
    body.cuenta_contable = normalizeCuentaContable(patch.cuenta_contable);
  }
  const { error } = await supabase.from("movimientos_caja").update(body).eq("id", id);
  if (error) throw error;
}
export {
  centralizarPeriodoCaja,
  createMovimientoCaja,
  ejecutarCentralizarPeriodo,
  fetchMovimientosCaja,
  fetchMovimientosPorAsientoLote,
  fetchMovimientosSinCentralizar,
  updateMovimientoCaja
};
