import { supabase } from "@/integrations/supabase/client";
import { fetchConfigContable } from "@/lib/config-contable-service";

export type CancelacionResult = {
  asientoId: string;
  movimientoCajaId: string;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function first2(ruc: string | null | undefined): string {
  return (ruc ?? "").slice(0, 2);
}

export async function generarCancelacionCaja(params: {
  registroSireId: string;
}): Promise<CancelacionResult> {
  // 1) Traer registro SIRE
  const { data: reg, error: regErr } = await supabase
    .from("registros_sire")
    .select("id, tipo, ruc, periodo, fecha_emision, importe_total, razon_social, cancelacion_asiento_id, cancelacion_mov_caja_id")
    .eq("id", params.registroSireId)
    .single();

  if (regErr) throw regErr;
  if (reg.cancelacion_asiento_id && reg.cancelacion_mov_caja_id) {
    return { asientoId: reg.cancelacion_asiento_id, movimientoCajaId: reg.cancelacion_mov_caja_id };
  }

  const periodo: string = reg.periodo;
  const fecha: string = reg.fecha_emision; // simplificación: fecha de operación = fecha del comprobante
  const importe = round2(Number(reg.importe_total ?? 0));
  const tipo: "VENTA" | "COMPRA" = reg.tipo;

  // 2) Definir cuentas desde configuración (editable en el sistema)
  // - Venta: Debe caja / Haber CxC
  // - Compra: Debe CxP / Haber caja
  const cfg = await fetchConfigContable();
  const cuentaCaja = cfg.cuenta_caja_default;
  const cuentaCxc = cfg.cuenta_cxc_default;
  const cuentaCxp = cfg.cuenta_cxp_default;

  const glosa = tipo === "VENTA"
    ? `Cobro de venta ${reg.id}`
    : `Pago de compra ${reg.id}`;

  // 3) Crear asiento contable (origen = VENTAS/COMPRAS, tipo_asiento = cancelacion_caja)
  const { data: asiento, error: asientoErr } = await supabase
    .from("asientos_contables")
    .insert({
      periodo,
      fecha,
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
          { orden: 2, cuenta: cuentaCxc, glosa: "Cancelación de cuentas por cobrar", debe: 0, haber: importe },
        ]
      : [
          { orden: 1, cuenta: cuentaCxp, glosa: "Cancelación de cuentas por pagar", debe: importe, haber: 0 },
          { orden: 2, cuenta: cuentaCaja, glosa: "Salida de caja/bancos", debe: 0, haber: importe },
        ];

  const { error: lineasErr } = await supabase.from("lineas_asiento").insert(
    lineas.map((l) => ({
      asiento_id: asiento.id,
      orden: l.orden,
      cuenta: l.cuenta,
      glosa: l.glosa,
      debe: l.debe,
      haber: l.haber,
    })),
  );
  if (lineasErr) throw lineasErr;

  // 4) Crear movimiento en caja (monto total)
  const movDebe = tipo === "VENTA" ? importe : 0;
  const movHaber = tipo === "COMPRA" ? importe : 0;

  // Evitar duplicados: hay un índice único parcial (origen='sire') en registro_sire_id.
  // PostgREST no puede hacer upsert contra un índice parcial, así que hacemos insert+fallback select.
  let movimientoId: string | null = null;
  const { data: mov, error: movErr } = await supabase
    .from("movimientos_caja")
    .insert({
      ruc: reg.ruc ?? null,
      periodo,
      fecha_operacion: fecha,
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
    // 23505: unique_violation
    if ((movErr as any)?.code === "23505") {
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

  // 5) Marcar registro
  const patch: any = {
    cancelacion_asiento_id: asiento.id,
    cancelacion_mov_caja_id: movimientoId,
    cancelacion_generada_at: new Date().toISOString(),
  };
  if (tipo === "VENTA") patch.estado_cobro = "cobrado";
  else patch.estado_pago = "pagado";

  const { error: updErr } = await supabase.from("registros_sire").update(patch).eq("id", reg.id);
  if (updErr) throw updErr;

  return { asientoId: asiento.id, movimientoCajaId: movimientoId! };
}

