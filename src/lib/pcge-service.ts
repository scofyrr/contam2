import { supabase } from "@/integrations/supabase/client";
import { sanitizePayload, throwIfSupabaseError } from "@/lib/supabase-error";

const PCGE_COLUMNS =
  "id, codigo_cuenta, nombre_cuenta, tipo_cuenta, nivel, naturaleza, aplica_para, palabras_clave, activo, created_at, updated_at" as const;

/** Alineado con columnas físicas de `plan_contable_pcge` en producción */
export type PcgeCuenta = {
  id?: string;
  codigo_cuenta: string;
  nombre_cuenta: string;
  tipo_cuenta?: string | null;
  nivel: number;
  naturaleza?: string | null;
  aplica_para?: string | null;
  palabras_clave?: string | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CuentaPCGE = PcgeCuenta;

export function formatCuentaPcge(cuenta: Pick<PcgeCuenta, "codigo_cuenta" | "nombre_cuenta">): string {
  return `[${cuenta.codigo_cuenta}] - ${cuenta.nombre_cuenta}`;
}

export function normalizePcgeCode(input: string): string {
  return (input ?? "").trim();
}

export function computeNivelFromCodigo(codigo: string): number {
  const len = normalizePcgeCode(codigo).length;
  if (len <= 2) return 1;
  if (len <= 3) return 2;
  if (len <= 4) return 3;
  if (len <= 5) return 4;
  return 5;
}

function mapRow(row: Record<string, unknown>): PcgeCuenta {
  return {
    id: row.id != null ? String(row.id) : undefined,
    codigo_cuenta: String(row.codigo_cuenta ?? ""),
    nombre_cuenta: String(row.nombre_cuenta ?? ""),
    tipo_cuenta: row.tipo_cuenta != null ? String(row.tipo_cuenta) : null,
    nivel: Number(row.nivel ?? 1),
    naturaleza: row.naturaleza != null ? String(row.naturaleza) : null,
    aplica_para: row.aplica_para != null ? String(row.aplica_para) : null,
    palabras_clave: row.palabras_clave != null ? String(row.palabras_clave) : null,
    activo: row.activo !== false,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
    updated_at: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

export async function fetchPcgeCuentas(): Promise<PcgeCuenta[]> {
  const { data, error } = await supabase
    .from("plan_contable_pcge")
    .select(PCGE_COLUMNS)
    .order("codigo_cuenta", { ascending: true });

  throwIfSupabaseError(error, "Error al cargar plan de cuentas");
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function fetchPcgeCuentasActivas(): Promise<PcgeCuenta[]> {
  const { data, error } = await supabase
    .from("plan_contable_pcge")
    .select(PCGE_COLUMNS)
    .eq("activo", true)
    .order("codigo_cuenta", { ascending: true });

  throwIfSupabaseError(error, "Error al cargar cuentas activas");
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function upsertPcgeCuenta(input: {
  id?: string;
  codigo_cuenta: string;
  nombre_cuenta: string;
  tipo_cuenta?: string | null;
  nivel?: number | null;
  activo?: boolean;
  naturaleza?: string | null;
  aplica_para?: string | null;
  palabras_clave?: string | null;
}): Promise<void> {
  const codigo_cuenta = normalizePcgeCode(input.codigo_cuenta);
  const nombre_cuenta = (input.nombre_cuenta ?? "").trim();
  if (!codigo_cuenta) throw new Error("Código de cuenta requerido");
  if (!nombre_cuenta) throw new Error("Nombre de cuenta requerido");

  const payload = sanitizePayload({
    codigo_cuenta,
    nombre_cuenta,
    nivel: input.nivel ?? computeNivelFromCodigo(codigo_cuenta),
    activo: input.activo ?? true,
    tipo_cuenta: input.tipo_cuenta ?? null,
    naturaleza: input.naturaleza ?? null,
    aplica_para: input.aplica_para ?? null,
    palabras_clave: input.palabras_clave ?? null,
  });

  const existing = await supabase
    .from("plan_contable_pcge")
    .select("codigo_cuenta")
    .eq("codigo_cuenta", codigo_cuenta)
    .maybeSingle();

  if (existing.data) {
    const { error } = await supabase
      .from("plan_contable_pcge")
      .update(payload)
      .eq("codigo_cuenta", codigo_cuenta);
    throwIfSupabaseError(error, "Error al actualizar cuenta PCGE");
    return;
  }

  const { error } = await supabase.from("plan_contable_pcge").insert(payload);
  throwIfSupabaseError(error, "Error al registrar cuenta PCGE");
}

export async function setPcgeActivo(codigo_cuenta: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from("plan_contable_pcge")
    .update({ activo })
    .eq("codigo_cuenta", codigo_cuenta);
  throwIfSupabaseError(error, "Error al cambiar estado de cuenta");
}
