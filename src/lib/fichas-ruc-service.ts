import { supabase } from "@/integrations/supabase/client";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { useDjangoApi } from "@/lib/api/config";
import {
  fetchAllFichasViaApi,
  fetchFichaByRucViaApi,
  upsertFichaRucViaApi,
} from "@/lib/api/fichas-ruc-api";
import {
  loadFichaChildren,
  saveFichaChildren,
} from "@/lib/ficha-ruc-children-service";
import {
  dbToFicha,
  fichaToDbRow,
} from "@/lib/ficha-ruc-mapper";
import { sanitizePayload, throwIfSupabaseError } from "@/lib/supabase-error";

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

  const children = await loadFichaChildren(clean);
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

  await saveFichaChildren(ruc, ficha);

  const children = await loadFichaChildren(ruc);
  return dbToFicha(
    data as Record<string, unknown>,
    children.tributos as Record<string, unknown>[],
    children.representantes as Record<string, unknown>[],
    children.personas as Record<string, unknown>[],
    children.establecimientos as Record<string, unknown>[],
  );
}
