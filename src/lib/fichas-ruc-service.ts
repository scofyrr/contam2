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

  // 1) Traer todas las cabeceras en una sola query
  const { data: cabeceras, error: cabErr } = await supabase
    .from("fichas_ruc")
    .select("*");
  throwIfSupabaseError(cabErr, "Error al cargar fichas RUC");

  if (!cabeceras || cabeceras.length === 0) return {};

  const rucs = cabeceras.map((r) => r.ruc as string);

  // 2) Traer todas las tablas hijas en paralelo con .in("ruc", rucs)
  const [tRes, rRes, pRes, eRes] = await Promise.all([
    supabase.from("tributos_afectos").select("*").in("ruc", rucs).order("orden"),
    supabase.from("representantes_legales").select("*").in("ruc", rucs).order("orden"),
    supabase.from("otras_personas_vinculadas").select("*").in("ruc", rucs).order("orden"),
    supabase.from("establecimientos_anexos").select("*").in("ruc", rucs).order("orden"),
  ]);

  throwIfSupabaseError(tRes.error, "Error al cargar tributos afectos");
  throwIfSupabaseError(rRes.error, "Error al cargar representantes legales");
  throwIfSupabaseError(pRes.error, "Error al cargar personas vinculadas");
  throwIfSupabaseError(eRes.error, "Error al cargar establecimientos anexos");

  // 3) Agrupar hijos por RUC en memoria (O(n), sin más queries)
  const tributosMap = groupByRuc(tRes.data ?? []);
  const representantesMap = groupByRuc(rRes.data ?? []);
  const personasMap = groupByRuc(pRes.data ?? []);
  const establecimientosMap = groupByRuc(eRes.data ?? []);

  // 4) Ensamblar cada FichaRuc desde los datos ya cargados
  const out: Record<string, FichaRuc> = {};
  for (const row of cabeceras) {
    const ruc = String(row.ruc);
    const ficha = dbToFicha(
      row as Record<string, unknown>,
      tributosMap[ruc] ?? [],
      representantesMap[ruc] ?? [],
      personasMap[ruc] ?? [],
      establecimientosMap[ruc] ?? [],
    );
    out[ruc] = ficha;
  }
  return out;
}

/** Agrupa un array de filas (con columna `ruc`) en un Map por RUC. */
function groupByRuc(
  rows: Record<string, unknown>[],
): Record<string, Record<string, unknown>[]> {
  const map: Record<string, Record<string, unknown>[]> = {};
  for (const row of rows) {
    const ruc = String(row.ruc ?? "");
    if (!ruc) continue;
    (map[ruc] ??= []).push(row);
  }
  return map;
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
