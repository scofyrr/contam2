import { an as useNewSireStructure, ab as supabase, s as fetchRegistroSireById, aj as updateRegistroSireCabecera, V as normalizeRegistroSire, a5 as resolverMontosSunat, K as lineasToAsientosPlanos, C as CUENTAS_DEFAULT, af as tipoAsientoCancelacion } from "./router-DdOnzL1Y.js";
async function generarCancelacionCaja(params) {
  if (useNewSireStructure()) {
    const { data: data2, error: error2 } = await supabase.rpc("rpc_liquidacion_caja_mejorada", {
      p_registro_sire_id: params.registroSireId,
      p_cuenta_caja: params.cuentaCaja ?? null,
      p_cuenta_cxc: params.cuentaCxc ?? null,
      p_cuenta_cxp: params.cuentaCxp ?? null,
      p_usuario_id: params.usuarioId ?? null
    });
    if (!error2 && data2) {
      const result2 = data2;
      if (result2.success === false) {
        throw new Error(result2.error ?? "Error en liquidación de caja");
      }
      if (result2.duplicado) {
        const row = await fetchRegistroSireById(params.registroSireId);
        if (row.tipo === "VENTA" && row.estado_cobro !== "cobrado") {
          await updateRegistroSireCabecera(params.registroSireId, { estado_cobro: "cobrado" });
        } else if (row.tipo !== "VENTA" && row.estado_pago !== "pagado") {
          await updateRegistroSireCabecera(params.registroSireId, { estado_pago: "pagado" });
        }
      }
      return {
        asientoId: String(result2.asiento_id),
        movimientoCajaId: String(result2.movimiento_caja_id),
        duplicado: result2.duplicado ?? false
      };
    }
  }
  const { data, error } = await supabase.rpc("rpc_liquidacion_caja", {
    p_registro_sire_id: params.registroSireId
  });
  if (error) {
    return generarCancelacionCajaLegacy(params);
  }
  const result = data;
  if (result.duplicado) {
    const row = await fetchRegistroSireById(params.registroSireId);
    if (row.tipo === "VENTA" && row.estado_cobro !== "cobrado") {
      await updateRegistroSireCabecera(params.registroSireId, { estado_cobro: "cobrado" });
    } else if (row.tipo !== "VENTA" && row.estado_pago !== "pagado") {
      await updateRegistroSireCabecera(params.registroSireId, { estado_pago: "pagado" });
    }
  }
  return {
    asientoId: result.asiento_id,
    movimientoCajaId: result.movimiento_caja_id,
    duplicado: result.duplicado ?? false
  };
}
async function revertirCancelacion(registroSireId) {
  const { data, error } = await supabase.rpc("rpc_revertir_cancelacion", {
    p_registro_sire_id: registroSireId
  });
  if (error) throw error;
  const result = data;
  if (result?.success === false) {
    throw new Error(result.error ?? "No se pudo revertir la cancelación");
  }
}
async function generarCancelacionCajaLegacy(params) {
  const row = await fetchRegistroSireById(params.registroSireId);
  if (row.cancelacion_asiento_id && row.cancelacion_mov_caja_id) {
    return {
      asientoId: String(row.cancelacion_asiento_id),
      movimientoCajaId: String(row.cancelacion_mov_caja_id),
      duplicado: true
    };
  }
  const registro = normalizeRegistroSire(row);
  const { mto_total_cp } = resolverMontosSunat(row);
  const importe = mto_total_cp;
  const tipo = registro.tipo;
  const cuentaCaja = CUENTAS_DEFAULT.caja;
  const cuentaComercial = tipo === "VENTA" ? CUENTAS_DEFAULT.cliente : CUENTAS_DEFAULT.proveedor;
  const glosa = tipo === "VENTA" ? `Cobro de venta ${registro.id}` : `Pago de compra ${registro.id}`;
  const lineasInput = tipo === "VENTA" ? [
    { orden: 1, cuenta: cuentaCaja, glosa: "Ingreso a caja/bancos", debe: importe, haber: 0 },
    { orden: 2, cuenta: cuentaComercial, glosa: "Cancelación cuentas por cobrar", debe: 0, haber: importe }
  ] : [
    { orden: 1, cuenta: cuentaComercial, glosa: "Cancelación cuentas por pagar", debe: importe, haber: 0 },
    { orden: 2, cuenta: cuentaCaja, glosa: "Salida de caja/bancos", debe: 0, haber: importe }
  ];
  const filas = lineasToAsientosPlanos({
    registro,
    registroId: registro.id,
    lineas: lineasInput,
    tipoAsiento: tipoAsientoCancelacion(),
    tipoLibro: "CAJA_BANCOS"
    // ← garantiza que aparezca en Flujo de efectivo
  });
  const { data: insertados, error: asientoErr } = await supabase.from("asientos_contables").insert(filas).select("id");
  if (asientoErr) throw asientoErr;
  const asientoIds = (insertados ?? []).map((r) => r.id);
  const asientoId = asientoIds[0];
  if (!asientoId) throw new Error("No se crearon asientos de cancelación.");
  const movDebe = tipo === "VENTA" ? importe : 0;
  const movHaber = tipo === "COMPRA" ? importe : 0;
  let movimientoId;
  const { data: mov, error: movErr } = await supabase.from("movimientos_caja").insert({
    ruc: registro.ruc,
    ruc_contribuyente: registro.ruc,
    periodo: registro.periodo,
    fecha: registro.fecha_emision,
    fecha_operacion: registro.fecha_emision,
    glosa,
    cuenta_contable: cuentaCaja,
    debe: movDebe,
    haber: movHaber,
    origen: "sire",
    origen_documento: "sire",
    tipo_movimiento: tipo === "VENTA" ? "ingreso" : "egreso",
    registro_sire_id: registro.id,
    asiento_id: asientoId
  }).select("id").single();
  if (movErr) {
    if (movErr.code === "23505") {
      const { data: existing, error: selErr } = await supabase.from("movimientos_caja").select("id").eq("registro_sire_id", registro.id).eq("origen", "sire").maybeSingle();
      if (selErr) throw selErr;
      if (!existing) throw movErr;
      movimientoId = existing.id;
    } else {
      throw movErr;
    }
  } else {
    movimientoId = mov.id;
  }
  await updateRegistroSireCabecera(registro.id, {
    cancelacion_asiento_id: asientoId,
    cancelacion_mov_caja_id: movimientoId,
    cancelacion_generada_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...tipo === "VENTA" ? { estado_cobro: "cobrado" } : { estado_pago: "pagado" }
  });
  return { asientoId, movimientoCajaId: movimientoId };
}
export {
  generarCancelacionCaja as g,
  revertirCancelacion as r
};
