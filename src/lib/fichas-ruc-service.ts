import { supabase } from "@/integrations/supabase/client";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { useDjangoApi } from "@/lib/api/config";
import {
  fetchAllFichasViaApi,
  fetchFichaByRucViaApi,
  upsertFichaRucViaApi,
} from "@/lib/api/fichas-ruc-api";
import {
  dbToFicha,
  establecimientosToDb,
  fichaToDbRow,
  personasToDb,
  representantesToDb,
  tributosToDb,
} from "@/lib/ficha-ruc-mapper";
import { sanitizePayload, throwIfSupabaseError } from "@/lib/supabase-error";

async function loadChildren(ruc: string) {
  const [t, r, p, e] = await Promise.all([
    supabase.from("tributos_afectos").select("*").eq("ruc", ruc).order("orden"),
    supabase.from("representantes_legales").select("*").eq("ruc", ruc).order("orden"),
    supabase.from("otras_personas_vinculadas").select("*").eq("ruc", ruc).order("orden"),
    supabase.from("establecimientos_anexos").select("*").eq("ruc", ruc).order("orden"),
  ]);
  throwIfSupabaseError(t.error, "Error al leer tributos afectos");
  throwIfSupabaseError(r.error, "Error al leer representantes legales");
  throwIfSupabaseError(p.error, "Error al leer personas vinculadas");
  throwIfSupabaseError(e.error, "Error al leer establecimientos anexos");
  return {
    tributos: t.data ?? [],
    representantes: r.data ?? [],
    personas: p.data ?? [],
    establecimientos: e.data ?? [],
  };
}

async function saveChildren(ruc: string, ficha: FichaRuc) {
  await Promise.all([
    supabase.from("tributos_afectos").delete().eq("ruc", ruc),
    supabase.from("representantes_legales").delete().eq("ruc", ruc),
    supabase.from("otras_personas_vinculadas").delete().eq("ruc", ruc),
    supabase.from("establecimientos_anexos").delete().eq("ruc", ruc),
  ]);

  const tribRows = tributosToDb(ruc, ficha.tributosAfectos);
  const repRows = representantesToDb(ruc, ficha.representantesLegales);
  const perRows = personasToDb(ruc, ficha.personasVinculadas);
  const estRows = establecimientosToDb(ruc, ficha.establecimientosAnexos);

  if (tribRows.length) {
    const { error } = await supabase.from("tributos_afectos").insert(tribRows);
    throwIfSupabaseError(error, "Error al guardar tributos afectos");
  }
  if (repRows.length) {
    const { error } = await supabase.from("representantes_legales").insert(repRows);
    throwIfSupabaseError(error, "Error al guardar representantes legales");
  }
  if (perRows.length) {
    const { error } = await supabase.from("otras_personas_vinculadas").insert(perRows);
    throwIfSupabaseError(error, "Error al guardar personas vinculadas");
  }
  if (estRows.length) {
    const { error } = await supabase.from("establecimientos_anexos").insert(estRows);
    throwIfSupabaseError(error, "Error al guardar establecimientos anexos");
  }
}

export async function fetchFichaByRuc(ruc: string): Promise<FichaRuc | null> {
  if (useDjangoApi()) {
    return fetchFichaByRucViaApi(ruc);
  }

  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase
    .from("fichas_ruc")
    .select("*")
    .eq("ruc", clean)
    .maybeSingle();

  throwIfSupabaseError(error, "Error al leer ficha RUC");
  if (!data) return null;

  const children = await loadChildren(clean);
  return dbToFicha(
    data as Record<string, unknown>,
    children.tributos as Record<string, unknown>[],
    children.representantes as Record<string, unknown>[],
    children.personas as Record<string, unknown>[],
    children.establecimientos as Record<string, unknown>[],
  );
}

export async function fetchAllFichas(): Promise<Record<string, FichaRuc>> {
  if (useDjangoApi()) {
    return fetchAllFichasViaApi();
  }

  const { data, error } = await supabase.from("fichas_ruc").select("ruc");
  throwIfSupabaseError(error, "Error al cargar fichas RUC");

  const out: Record<string, FichaRuc> = {};
  for (const row of data ?? []) {
    const ficha = await fetchFichaByRuc(row.ruc);
    if (ficha) out[ficha.ruc] = ficha;
  }
  return out;
}

export async function upsertFichaRuc(ficha: FichaRuc): Promise<FichaRuc> {
  if (useDjangoApi()) {
    return upsertFichaRucViaApi(ficha);
  }

  const ruc = ficha.ruc.replace(/\D/g, "").slice(0, 11);
  if (ruc.length !== 11) {
    throw new Error("RUC inválido: debe tener 11 dígitos");
  }

  const row = sanitizePayload(fichaToDbRow({ ...ficha, ruc }));

  const { data, error } = await supabase
    .from("fichas_ruc")
    .upsert(row, { onConflict: "ruc" })
    .select("*")
    .single();

  throwIfSupabaseError(error, "Error al guardar ficha RUC");

  await saveChildren(ruc, ficha);

  const children = await loadChildren(ruc);
  return dbToFicha(
    data as Record<string, unknown>,
    children.tributos as Record<string, unknown>[],
    children.representantes as Record<string, unknown>[],
    children.personas as Record<string, unknown>[],
    children.establecimientos as Record<string, unknown>[],
  );
}
