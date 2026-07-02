import { supabase } from "@/integrations/supabase/client";
import { getSireCabeceraTable, getSireReadSource, useNewSireStructure } from "@/lib/feature-flags";
import { mapRegistroFromDb, mapRegistroToDb } from "@/lib/sire-montos";
import { sanitizePayload, throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  RegistroSireAdicionales,
  RegistroSireCabecera,
  RegistroSireCompleto,
  RegistroSireModificaciones,
  RegistroSireMontos,
} from "@/types/database";

export type SireRegistrosFilters = {
  tipo?: string;
  periodo?: string;
  ruc?: string;
  contraparte?: string;
  cod_tipo_cdp?: string;
  q?: string;
  limit?: number;
};

const CABECERA_KEYS = [
  "tipo", "ruc", "razon_social", "periodo", "car_sunat", "fecha_emision", "fecha_vencimiento",
  "cod_tipo_cdp", "serie_cdp", "anio_dam_dsi", "nro_cdp_inicial", "nro_cdp_final",
  "tipo_doc_contraparte", "nro_doc_contraparte", "nombre_contraparte",
  "cod_moneda", "tipo_cambio", "estado_validacion", "estado_cobro", "estado_pago",
  "cuenta_pcge", "finalidad_operativa", "descripcion_items",
  "cancelacion_asiento_id", "cancelacion_mov_caja_id", "cancelacion_generada_at",
] as const;

const MONTOS_KEYS = [
  "bi_grav", "igv_grav", "bi_grav_y_no_grav", "igv_grav_y_no_grav",
  "bi_no_grav", "igv_no_grav", "valor_no_grav", "isc", "icbper", "otros_tributos",
  "importe_total", "mto_bi_gravada", "mto_igv_ipe", "mto_total_cp",
  "bi_adq_grav", "igv_adq_grav", "bi_adq_grav_y_no_grav", "igv_adq_grav_y_no_grav",
  "bi_adq_no_grav", "igv_adq_no_grav", "valor_adq_no_grav",
] as const;

const MOD_KEYS = [
  "fecha_emision_mod", "tipo_cdp_mod", "serie_cdp_mod", "cod_dam_dsi", "nro_cdp_mod",
] as const;

const ADIC_KEYS = [
  "clasificacion_bienes_serv", "id_proyecto_operadores", "pct_participacion",
  "impuesto_beneficio", "car_orig_indicador", "campos_38_41", "campos_libres",
  "tipo_venta_config", "observaciones",
] as const;

function pick<T extends Record<string, unknown>>(src: T, keys: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (src[k] !== undefined) out[k] = src[k];
  }
  return out;
}

export function splitRegistroPayload(raw: Record<string, unknown>) {
  const mapped = mapRegistroToDb(raw);
  return {
    cabecera: pick(mapped, CABECERA_KEYS),
    montos: pick(mapped, MONTOS_KEYS),
    modificaciones: pick(mapped, MOD_KEYS),
    adicionales: pick(mapped, ADIC_KEYS),
  };
}

export function mergeRegistroRows(row: Record<string, unknown>): Record<string, unknown> {
  return mapRegistroFromDb(row);
}

function applySireFilters<T extends {
  eq: (c: string, v: string) => T;
  ilike: (c: string, v: string) => T;
  or: (f: string) => T;
  order: (c: string, o: { ascending: boolean }) => T;
  limit: (n: number) => T;
}>(q: T, filters?: SireRegistrosFilters): T {
  if (!filters) return q.order("fecha_emision", { ascending: false }).limit(5000);
  if (filters.tipo && filters.tipo !== "TODOS") q = q.eq("tipo", filters.tipo);
  if (filters.periodo) q = q.eq("periodo", filters.periodo);
  if (filters.ruc) q = q.ilike("ruc", `%${filters.ruc}%`);
  if (filters.contraparte) q = q.ilike("nro_doc_contraparte", `%${filters.contraparte}%`);
  if (filters.cod_tipo_cdp && filters.cod_tipo_cdp !== "TODOS") q = q.eq("cod_tipo_cdp", filters.cod_tipo_cdp);
  if (filters.q) {
    q = q.or(
      `razon_social.ilike.%${filters.q}%,nombre_contraparte.ilike.%${filters.q}%,serie_cdp.ilike.%${filters.q}%,nro_cdp_inicial.ilike.%${filters.q}%`,
    );
  }
  return q.order("fecha_emision", { ascending: false }).limit(filters.limit ?? 5000);
}

export async function fetchRegistrosSireRows(
  filters?: SireRegistrosFilters,
): Promise<Record<string, unknown>[]> {
  const source = getSireReadSource();
  let q = supabase.from(source).select("*");
  q = applySireFilters(q, filters);
  const { data, error } = await q;
  throwIfSupabaseError(error, "Error al cargar registros SIRE");
  return (data ?? []) as Record<string, unknown>[];
}

export async function fetchRegistroSireById(id: string): Promise<Record<string, unknown>> {
  const source = getSireReadSource();
  const { data, error } = await supabase.from(source).select("*").eq("id", id).single();
  throwIfSupabaseError(error, "Registro SIRE no encontrado");
  return data as Record<string, unknown>;
}

async function upsertRegistroNormalizado(
  registroId: string | null,
  parts: ReturnType<typeof splitRegistroPayload>,
): Promise<string> {
  const cabecera = sanitizePayload(parts.cabecera) as RegistroSireCabecera;

  let id = registroId;

  if (id) {
    const { error } = await supabase
      .from("registros_sire_cabecera")
      .update(cabecera)
      .eq("id", id);
    throwIfSupabaseError(error, "Error al actualizar cabecera SIRE");
  } else {
    const { data, error } = await supabase
      .from("registros_sire_cabecera")
      .insert(cabecera)
      .select("id")
      .single();
    throwIfSupabaseError(error, "Error al crear cabecera SIRE");
    id = String(data.id);
  }

  const montosPayload = sanitizePayload({
    ...parts.montos,
    registro_sire_id: id,
  }) as RegistroSireMontos;

  const { data: existingMontos } = await supabase
    .from("registros_sire_montos")
    .select("id")
    .eq("registro_sire_id", id)
    .maybeSingle();

  if (existingMontos?.id) {
    const { error } = await supabase
      .from("registros_sire_montos")
      .update(montosPayload)
      .eq("registro_sire_id", id);
    throwIfSupabaseError(error, "Error al actualizar montos SIRE");
  } else {
    const { error } = await supabase.from("registros_sire_montos").insert(montosPayload);
    throwIfSupabaseError(error, "Error al insertar montos SIRE");
  }

  const modPayload = sanitizePayload({
    ...parts.modificaciones,
    registro_sire_id: id,
  }) as RegistroSireModificaciones;

  const { data: existingMod } = await supabase
    .from("registros_sire_modificaciones")
    .select("id")
    .eq("registro_sire_id", id)
    .maybeSingle();

  if (existingMod?.id) {
    const { error } = await supabase
      .from("registros_sire_modificaciones")
      .update(modPayload)
      .eq("registro_sire_id", id);
    throwIfSupabaseError(error, "Error al actualizar modificaciones SIRE");
  } else {
    const { error } = await supabase.from("registros_sire_modificaciones").insert(modPayload);
    throwIfSupabaseError(error, "Error al insertar modificaciones SIRE");
  }

  const adicPayload = sanitizePayload({
    ...parts.adicionales,
    registro_sire_id: id,
  }) as RegistroSireAdicionales;

  const { data: existingAdic } = await supabase
    .from("registros_sire_adicionales")
    .select("id")
    .eq("registro_sire_id", id)
    .maybeSingle();

  if (existingAdic?.id) {
    const { error } = await supabase
      .from("registros_sire_adicionales")
      .update(adicPayload)
      .eq("registro_sire_id", id);
    throwIfSupabaseError(error, "Error al actualizar adicionales SIRE");
  } else {
    const { error } = await supabase.from("registros_sire_adicionales").insert(adicPayload);
    throwIfSupabaseError(error, "Error al insertar adicionales SIRE");
  }

  return id;
}

export async function upsertRegistroSire(reg: Record<string, unknown>): Promise<string> {
  const id = reg.id ? String(reg.id) : null;

  if (useNewSireStructure()) {
    const parts = splitRegistroPayload(reg);
    return upsertRegistroNormalizado(id, parts);
  }

  const raw = mapRegistroToDb({ ...reg });
  delete raw.id;
  delete raw.created_at;
  delete raw.updated_at;
  const payload = sanitizePayload(raw);

  if (id) {
    const { error } = await supabase.from("registros_sire").update(payload).eq("id", id);
    throwIfSupabaseError(error, "Error al actualizar registro SIRE");
    return id;
  }

  const { data, error } = await supabase.from("registros_sire").insert(payload).select("id").single();
  throwIfSupabaseError(error, "Error al registrar comprobante SIRE");
  return String(data.id);
}

export async function deleteRegistroSire(id: string): Promise<void> {
  if (useNewSireStructure()) {
    const { error } = await supabase.from("registros_sire_cabecera").delete().eq("id", id);
    throwIfSupabaseError(error, "Error al eliminar registro SIRE");
    return;
  }
  const { error } = await supabase.from("registros_sire").delete().eq("id", id);
  throwIfSupabaseError(error, "Error al eliminar registro SIRE");
}

export async function updateRegistroSireCabecera(
  id: string,
  patch: Partial<RegistroSireCabecera>,
): Promise<void> {
  const table = getSireCabeceraTable();
  const { error } = await supabase.from(table).update(sanitizePayload(patch)).eq("id", id);
  throwIfSupabaseError(error, "Error al actualizar registro SIRE");
}

export function toRegistroCompleto(row: Record<string, unknown>): RegistroSireCompleto {
  const merged = mergeRegistroRows(row);
  return merged as unknown as RegistroSireCompleto;
}
