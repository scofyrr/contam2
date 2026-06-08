import { supabase } from "@/integrations/supabase/client";

export type ClienteOption = {
  ruc: string;
  razonSocial: string;
  estado?: string | null;
  direccion?: string | null;
  source: "contribuyentes";
};

/**
 * Búsqueda async en tabla maestra contribuyentes.
 * LEFT JOIN opcional con fichas_ruc para dirección y estado complementarios.
 */
export async function searchClientes(query: string): Promise<ClienteOption[]> {
  const needle = query.trim();
  if (needle.length < 2) return [];

  const { data, error } = await supabase
    .from("contribuyentes")
    .select(
      `
      ruc,
      razon_social,
      estado,
      fichas_ruc (
        estado_contribuyente,
        departamento,
        provincia,
        distrito,
        tipo_via,
        numero
      )
    `,
    )
    .or(`ruc.ilike.%${needle}%,razon_social.ilike.%${needle}%`)
    .order("razon_social", { ascending: true })
    .limit(30);

  if (error) {
    // Fallback: contribuyentes sin join si la FK aún no existe
    const { data: fallback, error: fbErr } = await supabase
      .from("contribuyentes")
      .select("ruc, razon_social, estado")
      .or(`ruc.ilike.%${needle}%,razon_social.ilike.%${needle}%`)
      .order("razon_social", { ascending: true })
      .limit(30);

    if (fbErr) throw fbErr;

    return (fallback ?? []).map((c) => ({
      ruc: c.ruc,
      razonSocial: c.razon_social,
      estado: c.estado,
      source: "contribuyentes" as const,
    }));
  }

  return (data ?? []).map((row) => {
    const fichaArr = row.fichas_ruc as Record<string, unknown> | Record<string, unknown>[] | null;
    const ficha = Array.isArray(fichaArr) ? fichaArr[0] : fichaArr;
    const parts = [
      ficha?.tipo_via,
      ficha?.numero,
      ficha?.distrito,
      ficha?.provincia,
      ficha?.departamento,
    ]
      .filter(Boolean)
      .map(String);

    return {
      ruc: row.ruc,
      razonSocial: row.razon_social,
      estado: (ficha?.estado_contribuyente as string | undefined) ?? row.estado,
      direccion: parts.length ? parts.join(", ") : null,
      source: "contribuyentes" as const,
    };
  });
}
