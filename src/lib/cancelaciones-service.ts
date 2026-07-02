import { getSireReadSource } from "@/lib/feature-flags";
import { supabase } from "@/integrations/supabase/client";
import { ASIENTOS_CONTABLES_SELECT } from "@/lib/asientos-contables-utils";
import { resolverMontosSunat } from "@/lib/sire-montos";

export type CancelacionRow = {
  registro_id: string;
  tipo: "VENTA" | "COMPRA";
  ruc: string;
  razon_social: string;
  periodo: string;
  fecha_emision: string;
  importe_total: number;
  estado_cobro: string;
  estado_pago: string;
  asiento_id: string | null;
  movimiento_id: string | null;
  generada_at: string | null;
};

/** Línea editable mapeada desde fila plana de asientos_contables. */
export type LineaAsiento = {
  id: string;
  asiento_id: string;
  orden: number;
  cuenta: string;
  glosa: string | null;
  debe: number;
  haber: number;
};

export type MovimientoCajaEdit = {
  id: string;
  fecha_operacion: string;
  glosa: string;
  cuenta_contable: string;
  debe: number;
  haber: number;
};

export async function fetchCancelaciones(params: {
  ruc: string;
  periodo?: string | null;
}): Promise<CancelacionRow[]> {
  const ruc = params.ruc.trim();
  if (!ruc) return [];

  let q = supabase
    .from(getSireReadSource())
    .select(
      "id, tipo, ruc, razon_social, periodo, fecha_emision, importe_total, estado_cobro, estado_pago, cancelacion_asiento_id, cancelacion_mov_caja_id, cancelacion_generada_at",
    )
    .eq("ruc", ruc)
    .not("cancelacion_asiento_id", "is", null)
    .order("fecha_emision", { ascending: false });
  if (params.periodo) q = q.eq("periodo", params.periodo);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((r) => ({
    registro_id: r.id,
    tipo: r.tipo as "VENTA" | "COMPRA",
    ruc: r.ruc,
    razon_social: r.razon_social,
    periodo: r.periodo,
    fecha_emision: r.fecha_emision,
    importe_total: resolverMontosSunat(r).mto_total_cp,
    estado_cobro: r.estado_cobro,
    estado_pago: r.estado_pago,
    asiento_id: r.cancelacion_asiento_id,
    movimiento_id: r.cancelacion_mov_caja_id,
    generada_at: r.cancelacion_generada_at,
  }));
}

/** Filas planas del mismo comprobante (mismo sire_registro_id + tipo CAJA). */
export async function fetchLineasAsiento(asientoId: string): Promise<LineaAsiento[]> {
  const { data: anchor, error: anchorErr } = await supabase
    .from("asientos_contables")
    .select("sire_registro_id, tipo_asiento")
    .eq("id", asientoId)
    .maybeSingle();

  if (anchorErr) throw anchorErr;
  if (!anchor?.sire_registro_id) return [];

  const { data, error } = await supabase
    .from("asientos_contables")
    .select(ASIENTOS_CONTABLES_SELECT)
    .eq("sire_registro_id", anchor.sire_registro_id)
    .eq("tipo_asiento", anchor.tipo_asiento ?? "CAJA")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row, index) => ({
    id: row.id,
    asiento_id: asientoId,
    orden: index + 1,
    cuenta: row.cuenta_contable,
    glosa: row.glosa,
    debe: Number(row.debe ?? 0),
    haber: Number(row.haber ?? 0),
  }));
}

export async function fetchMovimientoCaja(movId: string): Promise<MovimientoCajaEdit> {
  const { data, error } = await supabase
    .from("movimientos_caja")
    .select("id, fecha_operacion, fecha, glosa, cuenta_contable, debe, haber")
    .eq("id", movId)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    fecha_operacion: data.fecha_operacion ?? data.fecha,
    glosa: data.glosa,
    cuenta_contable: data.cuenta_contable,
    debe: Number(data.debe ?? 0),
    haber: Number(data.haber ?? 0),
  };
}

export async function updateLineaAsiento(params: {
  id: string;
  patch: Partial<Pick<LineaAsiento, "cuenta" | "glosa" | "debe" | "haber">>;
  audit: { editado_por: string; editado_motivo?: string | null };
}): Promise<void> {
  const body: Record<string, unknown> = {};
  if (params.patch.cuenta != null) body.cuenta_contable = params.patch.cuenta;
  if (params.patch.glosa != null) body.glosa = params.patch.glosa;
  if (params.patch.debe != null) {
    body.debe = Number(params.patch.debe);
    body.naturaleza = "debe";
  }
  if (params.patch.haber != null) {
    body.haber = Number(params.patch.haber);
    if (!params.patch.debe) body.naturaleza = "haber";
  }

  const { error } = await supabase.from("asientos_contables").update(body).eq("id", params.id);
  if (error) throw error;
  void params.audit;
}

export async function updateMovimientoCajaAudit(params: {
  id: string;
  patch: Partial<Pick<MovimientoCajaEdit, "fecha_operacion" | "glosa" | "cuenta_contable" | "debe" | "haber">>;
  audit: { editado_por: string; editado_motivo?: string | null };
}): Promise<void> {
  const { error } = await supabase
    .from("movimientos_caja")
    .update(params.patch)
    .eq("id", params.id);
  if (error) throw error;
  void params.audit;
}

/** No aplica en modelo plano (sin cabecera con totales). */
export async function updateTotalesAsiento(_asientoId: string): Promise<void> {
  return;
}
