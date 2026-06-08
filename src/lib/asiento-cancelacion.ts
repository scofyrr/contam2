import { supabase } from "@/integrations/supabase/client";
import { CUENTAS_DEFAULT } from "@/lib/asientos-generator";
import { lineasToAsientosPlanos, tipoAsientoCancelacion } from "@/lib/asientos-contables-utils";
import { normalizeRegistroSire } from "@/lib/sire-data";
import { resolverMontosSunat } from "@/lib/sire-montos";
import type { LineaAsientoInput } from "@/lib/sire-types";

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

async function generarCancelacionCajaLegacy(params: {
  registroSireId: string;
}): Promise<CancelacionResult> {
  const { data: reg, error: regErr } = await supabase
    .from("registros_sire")
    .select("*")
    .eq("id", params.registroSireId)
    .single();

  if (regErr) throw regErr;

  const row = reg as Record<string, unknown>;
  if (row.cancelacion_asiento_id && row.cancelacion_mov_caja_id) {
    return {
      asientoId: String(row.cancelacion_asiento_id),
      movimientoCajaId: String(row.cancelacion_mov_caja_id),
      duplicado: true,
    };
  }

  const registro = normalizeRegistroSire(row);
  const { mto_total_cp } = resolverMontosSunat(row);
  const importe = mto_total_cp;
  const tipo = registro.tipo;
  const cuentaCaja = CUENTAS_DEFAULT.caja;
  const cuentaComercial = tipo === "VENTA" ? CUENTAS_DEFAULT.cliente : CUENTAS_DEFAULT.proveedor;
  const glosa = tipo === "VENTA" ? `Cobro de venta ${registro.id}` : `Pago de compra ${registro.id}`;

  const lineasInput: LineaAsientoInput[] =
    tipo === "VENTA"
      ? [
          { orden: 1, cuenta: cuentaCaja, glosa: "Ingreso a caja/bancos", debe: importe, haber: 0 },
          { orden: 2, cuenta: cuentaComercial, glosa: "Cancelación cuentas por cobrar", debe: 0, haber: importe },
        ]
      : [
          { orden: 1, cuenta: cuentaComercial, glosa: "Cancelación cuentas por pagar", debe: importe, haber: 0 },
          { orden: 2, cuenta: cuentaCaja, glosa: "Salida de caja/bancos", debe: 0, haber: importe },
        ];

  const filas = lineasToAsientosPlanos({
    registro,
    registroId: registro.id,
    lineas: lineasInput,
    tipoAsiento: tipoAsientoCancelacion(),
  });

  const { data: insertados, error: asientoErr } = await supabase
    .from("asientos_contables")
    .insert(filas)
    .select("id");

  if (asientoErr) throw asientoErr;

  const asientoIds = (insertados ?? []).map((r) => r.id);
  const asientoId = asientoIds[0];
  if (!asientoId) throw new Error("No se crearon asientos de cancelación.");

  const movDebe = tipo === "VENTA" ? importe : 0;
  const movHaber = tipo === "COMPRA" ? importe : 0;

  let movimientoId: string;
  const { data: mov, error: movErr } = await supabase
    .from("movimientos_caja")
    .insert({
      ruc: registro.ruc,
      periodo: registro.periodo,
      fecha: registro.fecha_emision,
      fecha_operacion: registro.fecha_emision,
      glosa,
      cuenta_contable: cuentaCaja,
      debe: movDebe,
      haber: movHaber,
      origen: "SIRE",
      registro_sire_id: registro.id,
      asiento_id: asientoId,
    })
    .select("id")
    .single();

  if (movErr) {
    if ((movErr as { code?: string }).code === "23505") {
      const { data: existing, error: selErr } = await supabase
        .from("movimientos_caja")
        .select("id")
        .eq("registro_sire_id", registro.id)
        .eq("origen", "SIRE")
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
    cancelacion_asiento_id: asientoId,
    cancelacion_mov_caja_id: movimientoId,
    cancelacion_generada_at: new Date().toISOString(),
  };
  if (tipo === "VENTA") patch.estado_cobro = "cobrado";
  else patch.estado_pago = "pagado";

  const { error: updErr } = await supabase.from("registros_sire").update(patch).eq("id", registro.id);
  if (updErr) throw updErr;

  return { asientoId, movimientoCajaId: movimientoId };
}
