import { supabase } from "@/integrations/supabase/client";
import { fetchConfigContable } from "@/lib/config-contable-service";
import { resolverMontosSunat } from "@/lib/sire-montos";

export type CancelacionResult = {
  asientoId: string;
  movimientoCajaId: string;
  duplicado?: boolean;
};

export async function generarCancelacionCaja(params: {
  registroSireId: string;
}): Promise<CancelacionResult> {
  const { data, error } = await supabase.rpc("rpc_liquidacion_caja", {
    p_registro_sire_id: params.registroSireId,
  });

  if (error) {
    // Fallback secuencial si la RPC aún no está migrada
    return generarCancelacionCajaLegacy(params);
  }

  const result = data as {
    asiento_id: string;
    movimiento_caja_id: string;
    duplicado?: boolean;
  };

  return {
    asientoId: result.asiento_id,
    movimientoCajaId: result.movimiento_caja_id,
    duplicado: result.duplicado ?? false,
  };
}

/** Fallback sin RPC (compatibilidad pre-migración) */
async function generarCancelacionCajaLegacy(params: {
  registroSireId: string;
}): Promise<CancelacionResult> {
  const { data: reg, error: regErr } = await supabase
    .from("registros_sire")
    .select(
      "id, tipo, ruc, periodo, fecha_emision, importe_total, mto_total_cp, mto_bi_gravada, mto_igv_ipe, bi_grav, igv_grav, razon_social, cancelacion_asiento_id, cancelacion_mov_caja_id",
    )
    .eq("id", params.registroSireId)
    .single();

  if (regErr) throw regErr;
  if (reg.cancelacion_asiento_id && reg.cancelacion_mov_caja_id) {
    return {
      asientoId: reg.cancelacion_asiento_id,
      movimientoCajaId: reg.cancelacion_mov_caja_id,
      duplicado: true,
    };
  }

  const { mto_total_cp } = resolverMontosSunat(reg);
  const importe = mto_total_cp;
  const tipo: "VENTA" | "COMPRA" = reg.tipo;
  const cfg = await fetchConfigContable();
  const cuentaCaja = cfg.cuenta_caja_default;
  const cuentaComercial = tipo === "VENTA" ? cfg.cuenta_cxc_default : cfg.cuenta_cxp_default;
  const glosa = tipo === "VENTA" ? `Cobro de venta ${reg.id}` : `Pago de compra ${reg.id}`;

  const { data: asiento, error: asientoErr } = await supabase
    .from("asientos_contables")
    .insert({
      periodo: reg.periodo,
      fecha: reg.fecha_emision,
      origen: tipo === "VENTA" ? "VENTAS" : "COMPRAS",
      comprobante_venta_id: null,
      comprobante_compra_id: null,
      registro_sire_id: reg.id,
      tipo_asiento: "cancelacion_caja",
      glosa,
      moneda: "PEN",
      tipo_cambio: 1,
      total_debe: importe,
      total_haber: importe,
    })
    .select("id")
    .single();

  if (asientoErr) throw asientoErr;

  const lineas =
    tipo === "VENTA"
      ? [
          { orden: 1, cuenta: cuentaCaja, glosa: "Ingreso a caja/bancos", debe: importe, haber: 0 },
          { orden: 2, cuenta: cuentaComercial, glosa: "Cancelación cuentas por cobrar", debe: 0, haber: importe },
        ]
      : [
          { orden: 1, cuenta: cuentaComercial, glosa: "Cancelación cuentas por pagar", debe: importe, haber: 0 },
          { orden: 2, cuenta: cuentaCaja, glosa: "Salida de caja/bancos", debe: 0, haber: importe },
        ];

  const { error: lineasErr } = await supabase.from("lineas_asiento").insert(
    lineas.map((l) => ({ asiento_id: asiento.id, ...l })),
  );
  if (lineasErr) throw lineasErr;

  const movDebe = tipo === "VENTA" ? importe : 0;
  const movHaber = tipo === "COMPRA" ? importe : 0;

  let movimientoId: string;
  const { data: mov, error: movErr } = await supabase
    .from("movimientos_caja")
    .insert({
      ruc: reg.ruc,
      ruc_contribuyente: reg.ruc,
      periodo: reg.periodo,
      fecha_operacion: reg.fecha_emision,
      glosa,
      cuenta_pcge: cuentaCaja,
      debe: movDebe,
      haber: movHaber,
      origen: "sire",
      registro_sire_id: reg.id,
      asiento_id: asiento.id,
    })
    .select("id")
    .single();

  if (movErr) {
    if ((movErr as { code?: string }).code === "23505") {
      const { data: existing, error: selErr } = await supabase
        .from("movimientos_caja")
        .select("id")
        .eq("registro_sire_id", reg.id)
        .eq("origen", "sire")
        .maybeSingle();
      if (selErr) throw selErr;
      if (!existing) throw movErr;
      movimientoId = existing.id;
    } else {
      throw movErr;
    }
  } else {
    movimientoId = mov.id;
  }

  const patch: Record<string, unknown> = {
    cancelacion_asiento_id: asiento.id,
    cancelacion_mov_caja_id: movimientoId,
    cancelacion_generada_at: new Date().toISOString(),
  };
  if (tipo === "VENTA") patch.estado_cobro = "cobrado";
  else patch.estado_pago = "pagado";

  const { error: updErr } = await supabase.from("registros_sire").update(patch).eq("id", reg.id);
  if (updErr) throw updErr;

  return { asientoId: asiento.id, movimientoCajaId: movimientoId };
}
