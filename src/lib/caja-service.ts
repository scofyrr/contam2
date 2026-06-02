import { supabase } from "@/integrations/supabase/client";

export type MovimientoCaja = {
  id: string;
  correlativo: number | null;
  ruc: string | null;
  periodo: string | null;
  fecha_operacion: string;
  glosa: string;
  cuenta_pcge: string;
  debe: number;
  haber: number;
  origen: "manual" | "sire";
  registro_sire_id: string | null;
  asiento_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchMovimientosCaja(params: {
  ruc?: string | null;
  periodo?: string | null;
}): Promise<MovimientoCaja[]> {
  let q = supabase
    .from("movimientos_caja")
    .select(
      "id, correlativo, ruc, periodo, fecha_operacion, glosa, cuenta_pcge, debe, haber, origen, registro_sire_id, asiento_id, created_at, updated_at",
    )
    .order("fecha_operacion", { ascending: true })
    .order("correlativo", { ascending: true });

  if (params.ruc) q = q.eq("ruc", params.ruc);
  if (params.periodo) q = q.eq("periodo", params.periodo);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MovimientoCaja[];
}

export async function createMovimientoCaja(input: Omit<MovimientoCaja, "id" | "correlativo">): Promise<MovimientoCaja> {
  const { data, error } = await supabase
    .from("movimientos_caja")
    .insert({
      ruc: input.ruc ?? null,
      ruc_contribuyente: input.ruc ?? null,
      periodo: input.periodo ?? null,
      fecha_operacion: input.fecha_operacion,
      glosa: input.glosa,
      cuenta_pcge: input.cuenta_pcge,
      debe: input.debe,
      haber: input.haber,
      origen: input.origen,
      registro_sire_id: input.registro_sire_id ?? null,
      asiento_id: input.asiento_id ?? null,
    })
    .select(
      "id, correlativo, ruc, periodo, fecha_operacion, glosa, cuenta_pcge, debe, haber, origen, registro_sire_id, asiento_id, created_at, updated_at",
    )
    .single();

  if (error) throw error;
  return data as MovimientoCaja;
}

export async function updateMovimientoCaja(id: string, patch: Partial<Pick<MovimientoCaja, "fecha_operacion" | "glosa" | "cuenta_pcge" | "debe" | "haber">>): Promise<void> {
  const { error } = await supabase.from("movimientos_caja").update(patch).eq("id", id);
  if (error) throw error;
}

