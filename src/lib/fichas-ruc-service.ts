import { supabase } from "@/integrations/supabase/client";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { useDjangoApi } from "@/lib/api/config";
import {
  fetchAllFichasViaApi,
  fetchFichaByRucViaApi,
  upsertFichaRucViaApi,
} from "@/lib/api/fichas-ruc-api";
import { sanitizePayload, throwIfSupabaseError } from "@/lib/supabase-error";

export async function fetchFichaByRuc(ruc: string): Promise<FichaRuc | null> {
  if (useDjangoApi()) {
    return fetchFichaByRucViaApi(ruc);
  }

  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase
    .from("fichas_ruc")
    .select("ruc, payload, updated_at")
    .eq("ruc", clean)
    .maybeSingle();

  throwIfSupabaseError(error, "Error al leer ficha RUC");
  if (!data?.payload) return null;

  const payload = data.payload as FichaRuc;
  return {
    ...payload,
    ruc: clean,
    updatedAt: data.updated_at ?? payload.updatedAt,
  };
}

export async function fetchAllFichas(): Promise<Record<string, FichaRuc>> {
  if (useDjangoApi()) {
    return fetchAllFichasViaApi();
  }

  const { data, error } = await supabase
    .from("fichas_ruc")
    .select("ruc, payload, updated_at");

  throwIfSupabaseError(error, "Error al cargar fichas RUC");

  const out: Record<string, FichaRuc> = {};
  for (const row of data ?? []) {
    const payload = row.payload as FichaRuc;
    out[row.ruc] = {
      ...payload,
      ruc: row.ruc,
      updatedAt: row.updated_at ?? payload.updatedAt,
    };
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

  const payload = sanitizePayload({
    ruc,
    payload: { ...ficha, ruc, updatedAt: new Date().toISOString() },
  });

  const { data, error } = await supabase
    .from("fichas_ruc")
    .upsert(payload, { onConflict: "ruc" })
    .select("ruc, payload, updated_at")
    .single();

  throwIfSupabaseError(error, "Error al guardar ficha RUC");

  const saved = data.payload as FichaRuc;
  return {
    ...saved,
    ruc: data.ruc,
    updatedAt: data.updated_at ?? saved.updatedAt,
  };
}
