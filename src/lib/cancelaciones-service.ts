import { supabase } from "@/integrations/supabase/client";

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

export type LineaAsiento = {
  id: string;
  asiento_id: string;
  orden: number;
  cuenta: string;
  glosa: string | null;
  debe: number;
  haber: number;
  editado_por?: string | null;
  editado_el?: string | null;
  editado_motivo?: string | null;
};

export type MovimientoCajaEdit = {
  id: string;
  fecha_operacion: string;
  glosa: string;
  cuenta_pcge: string;
  debe: number;
  haber: number;
  editado_por?: string | null;
  editado_el?: string | null;
  editado_motivo?: string | null;
};

export async function fetchCancelaciones(params: {
  ruc?: string | null;
  periodo?: string | null;
}): Promise<CancelacionRow[]> {
  let q = supabase
    .from("registros_sire")
    .select(
      "id, tipo, ruc, razon_social, periodo, fecha_emision, importe_total, estado_cobro, estado_pago, cancelacion_asiento_id, cancelacion_mov_caja_id, cancelacion_generada_at",
    )
    .not("cancelacion_asiento_id", "is", null)
    .order("fecha_emision", { ascending: false });

  if (params.ruc) q = q.eq("ruc", params.ruc);
  if (params.periodo) q = q.eq("periodo", params.periodo);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    registro_id: r.id,
    tipo: r.tipo,
    ruc: r.ruc,
    razon_social: r.razon_social,
    periodo: r.periodo,
    fecha_emision: r.fecha_emision,
    importe_total: Number(r.importe_total ?? 0),
    estado_cobro: r.estado_cobro,
    estado_pago: r.estado_pago,
    asiento_id: r.cancelacion_asiento_id,
    movimiento_id: r.cancelacion_mov_caja_id,
    generada_at: r.cancelacion_generada_at,
  })) as CancelacionRow[];
}

export async function fetchLineasAsiento(asientoId: string): Promise<LineaAsiento[]> {
  const { data, error } = await supabase
    .from("lineas_asiento")
    .select("id, asiento_id, orden, cuenta, glosa, debe, haber, editado_por, editado_el, editado_motivo")
    .eq("asiento_id", asientoId)
    .order("orden", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LineaAsiento[];
}

export async function fetchMovimientoCaja(movId: string): Promise<MovimientoCajaEdit> {
  const { data, error } = await supabase
    .from("movimientos_caja")
    .select("id, fecha_operacion, glosa, cuenta_pcge, debe, haber, editado_por, editado_el, editado_motivo")
    .eq("id", movId)
    .single();
  if (error) throw error;
  return data as MovimientoCajaEdit;
}

export async function updateLineaAsiento(params: {
  id: string;
  patch: Partial<Pick<LineaAsiento, "cuenta" | "glosa" | "debe" | "haber">>;
  audit: { editado_por: string; editado_motivo?: string | null };
}): Promise<void> {
  // Si actualiza montos, normalizar a 2 decimales.
  const patch: any = { ...params.patch };
  if (patch.debe != null) patch.debe = Number(patch.debe);
  if (patch.haber != null) patch.haber = Number(patch.haber);

  const { error } = await supabase
    .from("lineas_asiento")
    .update({
      ...patch,
      editado_por: params.audit.editado_por,
      editado_el: new Date().toISOString(),
      editado_motivo: params.audit.editado_motivo ?? null,
    })
    .eq("id", params.id);
  if (error) throw error;
}

export async function updateMovimientoCajaAudit(params: {
  id: string;
  patch: Partial<Pick<MovimientoCajaEdit, "fecha_operacion" | "glosa" | "cuenta_pcge" | "debe" | "haber">>;
  audit: { editado_por: string; editado_motivo?: string | null };
}): Promise<void> {
  const { error } = await supabase
    .from("movimientos_caja")
    .update({
      ...params.patch,
      editado_por: params.audit.editado_por,
      editado_el: new Date().toISOString(),
      editado_motivo: params.audit.editado_motivo ?? null,
    })
    .eq("id", params.id);
  if (error) throw error;
}

export async function updateTotalesAsiento(asientoId: string): Promise<void> {
  const lineas = await fetchLineasAsiento(asientoId);
  const totalDebe = lineas.reduce((s, l) => s + Number(l.debe ?? 0), 0);
  const totalHaber = lineas.reduce((s, l) => s + Number(l.haber ?? 0), 0);
  const { error } = await supabase
    .from("asientos_contables")
    .update({ total_debe: totalDebe, total_haber: totalHaber })
    .eq("id", asientoId);
  if (error) throw error;
}

