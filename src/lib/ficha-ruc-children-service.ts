import { supabase } from "@/integrations/supabase/client";
import type {
  EstablecimientoAnexo,
  OtraPersonaVinculada,
  RepresentanteLegal,
  TributoAfecto,
} from "@/types/database";
import {
  establecimientosToDb,
  personasToDb,
  representantesToDb,
  tributosToDb,
} from "@/lib/ficha-ruc-mapper";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { throwIfSupabaseError } from "@/lib/supabase-error";

const CHILD_TABLES = [
  "tributos_afectos",
  "representantes_legales",
  "otras_personas_vinculadas",
  "establecimientos_anexos",
] as const;

export async function loadFichaChildren(ruc: string) {
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
    tributos: (t.data ?? []) as TributoAfecto[],
    representantes: (r.data ?? []) as RepresentanteLegal[],
    personas: (p.data ?? []) as OtraPersonaVinculada[],
    establecimientos: (e.data ?? []) as EstablecimientoAnexo[],
  };
}

export async function saveFichaChildren(ruc: string, ficha: FichaRuc): Promise<void> {
  await Promise.all(
    CHILD_TABLES.map((table) => supabase.from(table).delete().eq("ruc", ruc)),
  );

  const inserts: Array<{ table: (typeof CHILD_TABLES)[number]; rows: Record<string, unknown>[] }> = [
    { table: "tributos_afectos", rows: tributosToDb(ruc, ficha.tributosAfectos) },
    { table: "representantes_legales", rows: representantesToDb(ruc, ficha.representantesLegales) },
    { table: "otras_personas_vinculadas", rows: personasToDb(ruc, ficha.personasVinculadas) },
    { table: "establecimientos_anexos", rows: establecimientosToDb(ruc, ficha.establecimientosAnexos) },
  ];

  for (const { table, rows } of inserts) {
    if (!rows.length) continue;
    const { error } = await supabase.from(table).insert(rows);
    throwIfSupabaseError(error, `Error al guardar ${table}`);
  }
}

export async function fetchTributosAfectos(ruc: string) {
  const { data, error } = await supabase.from("tributos_afectos").select("*").eq("ruc", ruc).order("orden");
  throwIfSupabaseError(error, "Error al leer tributos");
  return data ?? [];
}

export async function fetchRepresentantesLegales(ruc: string) {
  const { data, error } = await supabase.from("representantes_legales").select("*").eq("ruc", ruc).order("orden");
  throwIfSupabaseError(error, "Error al leer representantes");
  return data ?? [];
}

export async function fetchOtrasPersonasVinculadas(ruc: string) {
  const { data, error } = await supabase.from("otras_personas_vinculadas").select("*").eq("ruc", ruc).order("orden");
  throwIfSupabaseError(error, "Error al leer personas vinculadas");
  return data ?? [];
}

export async function fetchEstablecimientosAnexos(ruc: string) {
  const { data, error } = await supabase.from("establecimientos_anexos").select("*").eq("ruc", ruc).order("orden");
  throwIfSupabaseError(error, "Error al leer establecimientos");
  return data ?? [];
}
