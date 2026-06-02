import { supabase } from "@/integrations/supabase/client";

export type ConfigContable = {
  id: number;
  cuenta_caja_default: string;
  cuenta_cxc_default: string;
  cuenta_cxp_default: string;
  created_at: string;
  updated_at: string;
};

export async function fetchConfigContable(): Promise<ConfigContable> {
  const { data, error } = await supabase
    .from("config_contable")
    .select("id, cuenta_caja_default, cuenta_cxc_default, cuenta_cxp_default, created_at, updated_at")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as ConfigContable;
}

export async function updateConfigContable(patch: Partial<Pick<ConfigContable, "cuenta_caja_default" | "cuenta_cxc_default" | "cuenta_cxp_default">>): Promise<void> {
  const { error } = await supabase.from("config_contable").update(patch).eq("id", 1);
  if (error) throw error;
}

