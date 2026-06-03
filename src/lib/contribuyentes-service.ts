import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import type {
  Contribuyente,
  CredencialesPortal,
  EstadoCliente,
} from "@/lib/contribuyentes-types";
import { sanitizePayload, throwIfSupabaseError } from "@/lib/supabase-error";

type ContribuyenteRow = Database["public"]["Tables"]["contribuyentes"]["Row"];
type ContribuyenteInsert = Database["public"]["Tables"]["contribuyentes"]["Insert"];

function parseCredenciales(value: Json | null | undefined): CredencialesPortal {
  const obj = (value ?? {}) as Record<string, unknown>;
  return {
    usuario: String(obj.usuario ?? ""),
    clave: String(obj.clave ?? ""),
  };
}

function toJsonCredenciales(c: CredencialesPortal): Json {
  return { usuario: c.usuario ?? "", clave: c.clave ?? "" };
}

/** Payload limpio: solo las 18 columnas físicas (sin timestamps en alta). */
export function toContribuyenteInsert(c: Contribuyente): ContribuyenteInsert {
  return sanitizePayload({
    ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
    razon_social: c.razonSocial.trim(),
    estado: c.estado ?? "ACTIVO",
    otros: c.otros ?? "",
    fecha_vencimiento_declaracion: c.fechaVencimientoDeclaracion?.trim()
      ? c.fechaVencimientoDeclaracion
      : null,
    cat1ra: c.cat1ra ?? false,
    cat2da: c.cat2da ?? false,
    cat3ra: c.cat3ra ?? false,
    cat4ta_retenciones: c.cat4taRetenciones ?? false,
    cat4ta_cta_propia: c.cat4taCtaPropia ?? false,
    cat5ta: c.cat5ta ?? false,
    clave_sol: toJsonCredenciales(c.claveSol),
    afp_net: toJsonCredenciales(c.afpNet),
    validez_cpe: toJsonCredenciales(c.validezCpe),
    claves_sire: toJsonCredenciales(c.clavesSire),
    ...(c.id ? { id: c.id } : {}),
  }) as ContribuyenteInsert;
}

export function mapContribuyenteFromRow(row: ContribuyenteRow): Contribuyente {
  return {
    id: row.id,
    ruc: row.ruc.trim(),
    razonSocial: row.razon_social,
    estado: row.estado as EstadoCliente,
    otros: row.otros ?? "",
    fechaVencimientoDeclaracion: row.fecha_vencimiento_declaracion ?? "",
    cat1ra: Boolean(row.cat1ra),
    cat2da: Boolean(row.cat2da),
    cat3ra: Boolean(row.cat3ra),
    cat4taRetenciones: Boolean(row.cat4ta_retenciones),
    cat4taCtaPropia: Boolean(row.cat4ta_cta_propia),
    cat5ta: Boolean(row.cat5ta),
    claveSol: parseCredenciales(row.clave_sol),
    afpNet: parseCredenciales(row.afp_net),
    validezCpe: parseCredenciales(row.validez_cpe),
    clavesSire: parseCredenciales(row.claves_sire),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchContribuyentes(): Promise<Contribuyente[]> {
  const { data, error } = await supabase
    .from("contribuyentes")
    .select("*")
    .order("razon_social", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapContribuyenteFromRow(row));
}

export async function fetchContribuyenteByRuc(ruc: string): Promise<Contribuyente | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase
    .from("contribuyentes")
    .select("*")
    .eq("ruc", clean)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapContribuyenteFromRow(data);
}

export async function rucExists(ruc: string, excludeRuc?: string): Promise<boolean> {
  const clean = ruc.replace(/\D/g, "");
  if (!clean) return false;

  const { data, error } = await supabase
    .from("contribuyentes")
    .select("ruc")
    .eq("ruc", clean)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;
  if (excludeRuc && data.ruc.trim() === excludeRuc.replace(/\D/g, "")) return false;
  return true;
}

export async function upsertContribuyente(contribuyente: Contribuyente): Promise<Contribuyente> {
  const payload = toContribuyenteInsert(contribuyente);
  const ruc = payload.ruc;

  const existing = await fetchContribuyenteByRuc(ruc);

  if (existing) {
    const { ruc: _pk, ...updateBody } = payload;
    const { data, error } = await supabase
      .from("contribuyentes")
      .update(sanitizePayload(updateBody))
      .eq("ruc", ruc)
      .select("*")
      .single();

    throwIfSupabaseError(error, "Error al actualizar contribuyente");
    if (!data) throw new Error("No se recibió respuesta al actualizar contribuyente");
    return mapContribuyenteFromRow(data);
  }

  const { error } = await supabase.from("contribuyentes").insert(payload);
  throwIfSupabaseError(error, "Error al registrar contribuyente");

  const saved = await fetchContribuyenteByRuc(ruc);
  if (!saved) {
    throw new Error("No se pudo recuperar el contribuyente guardado");
  }
  return saved;
}

export async function deleteContribuyente(ruc: string): Promise<void> {
  const { error } = await supabase.from("contribuyentes").delete().eq("ruc", ruc);
  if (error) throw error;
}

export async function bulkUpsertContribuyentes(list: Contribuyente[]): Promise<number> {
  if (list.length === 0) return 0;

  const rows: ContribuyenteInsert[] = list.map((c) => toContribuyenteInsert(c));

  const { error } = await supabase
    .from("contribuyentes")
    .upsert(rows, { onConflict: "ruc" });
  throwIfSupabaseError(error, "Error en carga masiva de contribuyentes");
  return rows.length;
}

export async function countContribuyentes(): Promise<number> {
  const { count, error } = await supabase
    .from("contribuyentes")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}
