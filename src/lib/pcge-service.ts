import { supabase } from "@/integrations/supabase/client";

export type PcgeCuenta = {
  codigo: string;
  descripcion: string;
  nivel: number;
  activo: boolean;
  naturaleza: string | null;
  padre_codigo: string | null;
  created_at?: string;
  updated_at?: string;
};

export function normalizePcgeCode(input: string): string {
  return (input ?? "").trim();
}

export function computeNivelFromCodigo(codigo: string): number {
  // Heurística simple: el nivel crece con la longitud del código.
  // (La normativa PCGE puede modelarse más fino, pero esto permite edición sin fricción.)
  const len = normalizePcgeCode(codigo).length;
  if (len <= 2) return 1;
  if (len <= 3) return 2;
  if (len <= 4) return 3;
  if (len <= 5) return 4;
  return 5;
}

export async function fetchPcgeCuentas(): Promise<PcgeCuenta[]> {
  const { data, error } = await supabase
    .from("tabla_pcge")
    .select("codigo, descripcion, nivel, activo, naturaleza, padre_codigo, created_at, updated_at")
    .order("codigo", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PcgeCuenta[];
}

export async function upsertPcgeCuenta(input: {
  codigo: string;
  descripcion: string;
  activo?: boolean;
  naturaleza?: string | null;
  padre_codigo?: string | null;
}): Promise<void> {
  const codigo = normalizePcgeCode(input.codigo);
  const descripcion = (input.descripcion ?? "").trim();
  if (!codigo) throw new Error("Código requerido");
  if (!descripcion) throw new Error("Descripción requerida");

  const nivel = computeNivelFromCodigo(codigo);

  const { error } = await supabase.from("tabla_pcge").upsert(
    {
      codigo,
      descripcion,
      nivel,
      activo: input.activo ?? true,
      naturaleza: input.naturaleza ?? null,
      padre_codigo: input.padre_codigo ?? null,
    },
    { onConflict: "codigo" },
  );

  if (error) throw error;
}

export async function setPcgeActivo(codigo: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from("tabla_pcge").update({ activo }).eq("codigo", codigo);
  if (error) throw error;
}

