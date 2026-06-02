import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  generarLineasAsiento,
  glosaAsiento,
  origenAsiento,
  type CuentasAsientoDefaults,
} from "@/lib/asientos-generator";
import { normalizeRegistroSire } from "@/lib/sire-data";
import type { LineaAsientoInput, RegistroSire } from "@/lib/sire-types";

export type ComprobantePendiente = RegistroSire & {
  tieneAsiento: boolean;
};

export type LineaAsientoEditable = LineaAsientoInput & {
  /** id local para React keys */
  key: string;
};

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function sumDebe(lineas: LineaAsientoInput[]): number {
  return round2(lineas.reduce((s, l) => s + Number(l.debe ?? 0), 0));
}

export function sumHaber(lineas: LineaAsientoInput[]): number {
  return round2(lineas.reduce((s, l) => s + Number(l.haber ?? 0), 0));
}

export function isAsientoCuadrado(lineas: LineaAsientoInput[], tolerance = 0.001): boolean {
  return Math.abs(sumDebe(lineas) - sumHaber(lineas)) <= tolerance;
}

export function toEditableLineas(lineas: LineaAsientoInput[]): LineaAsientoEditable[] {
  return lineas.map((l, i) => ({
    ...l,
    key: `linea-${l.orden}-${i}`,
  }));
}

export async function fetchComprobantesPendientes(params: {
  ruc: string;
  periodo?: string;
}): Promise<ComprobantePendiente[]> {
  let q = supabase
    .from("registros_sire")
    .select("*")
    .eq("ruc", params.ruc)
    .or("estado_validacion.is.null,estado_validacion.eq.pendiente,estado_validacion.eq.ia_sugerido")
    .order("fecha_emision", { ascending: false })
    .limit(200);

  if (params.periodo) q = q.eq("periodo", params.periodo);

  const { data, error } = await q;
  if (error) throw error;

  const registros = (data ?? []).map((row) => normalizeRegistroSire(row as Record<string, unknown>));
  if (registros.length === 0) return [];

  const ids = registros.map((r) => r.id);
  const { data: asientos } = await supabase
    .from("asientos_contables")
    .select("registro_sire_id, tipo_asiento")
    .in("registro_sire_id", ids);

  const conPrincipal = new Set(
    (asientos ?? [])
      .filter((a) => (a.tipo_asiento ?? "principal") === "principal")
      .map((a) => a.registro_sire_id),
  );

  return registros
    .filter((r) => !conPrincipal.has(r.id))
    .map((r) => ({ ...r, tieneAsiento: false }));
}

export async function fetchRegistroSireById(id: string): Promise<RegistroSire> {
  const { data, error } = await supabase.from("registros_sire").select("*").eq("id", id).single();
  if (error) throw error;
  return normalizeRegistroSire(data as Record<string, unknown>);
}

export function proponerLineasAsiento(
  registro: RegistroSire,
  cuentas?: Partial<CuentasAsientoDefaults>,
): LineaAsientoEditable[] {
  return toEditableLineas(generarLineasAsiento(registro, cuentas));
}

export async function guardarAsientoProvision(params: {
  registroId: string;
  lineas: LineaAsientoInput[];
}): Promise<{ asientoId: string }> {
  if (!isAsientoCuadrado(params.lineas)) {
    throw new Error("El asiento está descuadrado. Debe y Haber deben ser iguales.");
  }

  const registro = await fetchRegistroSireById(params.registroId);

  const { data: existente } = await supabase
    .from("asientos_contables")
    .select("id")
    .eq("registro_sire_id", params.registroId)
    .eq("tipo_asiento", "principal")
    .maybeSingle();

  if (existente?.id) {
    throw new Error("Este comprobante ya tiene un asiento de provisión registrado.");
  }

  const totalDebe = sumDebe(params.lineas);
  const totalHaber = sumHaber(params.lineas);

  const moneda = (
    registro.cod_moneda === "USD" || registro.cod_moneda === "EUR" ? registro.cod_moneda : "PEN"
  ) as Database["public"]["Enums"]["moneda_iso"];

  const { data: asiento, error: asientoErr } = await supabase
    .from("asientos_contables")
    .insert({
      periodo: registro.periodo,
      fecha: registro.fecha_emision,
      origen: origenAsiento(registro.tipo),
      registro_sire_id: params.registroId,
      tipo_asiento: "principal",
      comprobante_venta_id: null,
      comprobante_compra_id: null,
      glosa: glosaAsiento(registro),
      moneda,
      tipo_cambio: 1,
      total_debe: totalDebe,
      total_haber: totalHaber,
    })
    .select("id")
    .single();

  if (asientoErr) throw asientoErr;

  const { error: lineasErr } = await supabase.from("lineas_asiento").insert(
    params.lineas.map((l) => ({
      asiento_id: asiento.id,
      orden: l.orden,
      cuenta: l.cuenta.trim(),
      glosa: l.glosa,
      debe: round2(Number(l.debe ?? 0)),
      haber: round2(Number(l.haber ?? 0)),
    })),
  );

  if (lineasErr) {
    await supabase.from("asientos_contables").delete().eq("id", asiento.id);
    throw lineasErr;
  }

  const { error: updErr } = await supabase
    .from("registros_sire")
    .update({ estado_validacion: "validado" } as Database["public"]["Tables"]["registros_sire"]["Update"])
    .eq("id", params.registroId);

  if (updErr) throw updErr;

  return { asientoId: asiento.id };
}
