import { supabase } from "@/integrations/supabase/client";

export type ConfigContable = {
  id: number;
  cuenta_caja_default: string;
  cuenta_cxc_default: string;
  cuenta_cxp_default: string;
  created_at: string;
  updated_at: string;
};

/** Valores por defecto cuando la tabla está vacía o no disponible aún */
export const DEFAULT_CONFIG_CONTABLE: ConfigContable = {
  id: 1,
  cuenta_caja_default: "101101",
  cuenta_cxc_default: "121201",
  cuenta_cxp_default: "421201",
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

function isMissingConfigError(error: { code?: string; message?: string }): boolean {
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return (
    code === "PGRST116" ||
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("404") ||
    msg.includes("not found") ||
    msg.includes("does not exist")
  );
}

export async function fetchConfigContable(): Promise<ConfigContable> {
  const { data, error } = await supabase
    .from("config_contable")
    .select("id, cuenta_caja_default, cuenta_cxc_default, cuenta_cxp_default, created_at, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    if (isMissingConfigError(error)) {
      return DEFAULT_CONFIG_CONTABLE;
    }
    throw error;
  }

  if (!data) {
    return DEFAULT_CONFIG_CONTABLE;
  }

  return data as ConfigContable;
}

export async function updateConfigContable(
  patch: Partial<Pick<ConfigContable, "cuenta_caja_default" | "cuenta_cxc_default" | "cuenta_cxp_default">>,
): Promise<void> {
  const { error } = await supabase.from("config_contable").upsert(
    {
      id: 1,
      ...patch,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}
