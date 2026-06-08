import { supabase } from "@/integrations/supabase/client";
import type { CuentaFinanciera } from "@/lib/cuentas-financieras-types";

const SELECT =
  "id, ruc, nombre, tipo, cuenta_contable, banco, numero_cuenta, activo, created_at, updated_at";

const DEFAULTS: Omit<CuentaFinanciera, "id" | "created_at" | "updated_at">[] = [
  {
    ruc: "",
    nombre: "Caja Chica Principal",
    tipo: "CAJA_CHICA",
    cuenta_contable: "101101",
    banco: null,
    numero_cuenta: null,
    activo: true,
  },
  {
    ruc: "",
    nombre: "BCP — Cuenta Corriente",
    tipo: "BANCO",
    cuenta_contable: "104101",
    banco: "BCP",
    numero_cuenta: null,
    activo: true,
  },
];

export async function fetchCuentasFinancieras(ruc: string): Promise<CuentaFinanciera[]> {
  const clean = ruc.trim();
  if (!clean) return [];

  const { data, error } = await supabase
    .from("cuentas_financieras")
    .select(SELECT)
    .eq("ruc", clean)
    .eq("activo", true)
    .order("nombre");

  if (error) {
    if ((error as { code?: string }).code === "42P01") {
      return DEFAULTS.map((d, i) => ({
        ...d,
        ruc: clean,
        id: `local-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    throw error;
  }

  if ((data ?? []).length === 0) {
    await seedDefaults(clean);
    return fetchCuentasFinancieras(clean);
  }

  return (data ?? []) as CuentaFinanciera[];
}

async function seedDefaults(ruc: string) {
  const rows = DEFAULTS.map((d) => ({ ...d, ruc }));
  const { error } = await supabase.from("cuentas_financieras").insert(rows);
  if (error && (error as { code?: string }).code !== "42P01") throw error;
}

export async function upsertCuentaFinanciera(
  input: Omit<CuentaFinanciera, "id" | "created_at" | "updated_at"> & { id?: string },
): Promise<CuentaFinanciera> {
  const body = {
    ruc: input.ruc.trim(),
    nombre: input.nombre.trim(),
    tipo: input.tipo,
    cuenta_contable: input.cuenta_contable.trim(),
    banco: input.banco?.trim() || null,
    numero_cuenta: input.numero_cuenta?.trim() || null,
    activo: input.activo ?? true,
  };

  if (input.id && !input.id.startsWith("local-")) {
    const { data, error } = await supabase
      .from("cuentas_financieras")
      .update(body)
      .eq("id", input.id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data as CuentaFinanciera;
  }

  const { data, error } = await supabase
    .from("cuentas_financieras")
    .insert(body)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as CuentaFinanciera;
}

export async function desactivarCuentaFinanciera(id: string): Promise<void> {
  const { error } = await supabase
    .from("cuentas_financieras")
    .update({ activo: false })
    .eq("id", id);
  if (error) throw error;
}
