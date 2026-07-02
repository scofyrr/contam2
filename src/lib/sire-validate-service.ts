import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { generarLineasAsiento } from "@/lib/asientos-generator";
import {
  lineasToAsientosPlanos,
  logSupabaseAsientosInsertError,
  tipoAsientoProvision,
} from "@/lib/asientos-contables-utils";
import { getSireCabeceraTable, getSireReadSource } from "@/lib/feature-flags";
import { normalizeRegistroSire } from "@/lib/sire-data";

type AdminClient = SupabaseClient<Database>;

export type ValidateResult = {
  registroId: string;
  asientoId: string;
  lineas: number;
  alreadyValidated: boolean;
};

const TIPOS_PROVISION = ["principal"] as const;

export async function validarRegistroSire(
  supabase: AdminClient,
  registroId: string,
): Promise<ValidateResult> {
  const source = getSireReadSource();
  const cabecera = getSireCabeceraTable();

  const { data: registro, error: fetchError } = await supabase
    .from(source)
    .select("*")
    .eq("id", registroId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!registro) throw new Error("Registro SIRE no encontrado");

  const r = normalizeRegistroSire(registro as Record<string, unknown>);
  const tipoAsiento = tipoAsientoProvision(r.tipo);

  const { data: existentes } = await supabase
    .from("asientos_contables")
    .select("id")
    .eq("sire_registro_id", registroId)
    .in("tipo_asiento", [...TIPOS_PROVISION]);

  if (existentes?.length) {
    if (r.estado_validacion !== "validado") {
      await supabase.from(cabecera).update({ estado_validacion: "validado" }).eq("id", registroId);
    }

    return {
      registroId,
      asientoId: existentes[0].id,
      lineas: existentes.length,
      alreadyValidated: true,
    };
  }

  const lineas = generarLineasAsiento(r);
  const filas = lineasToAsientosPlanos({
    registro: r,
    registroId,
    lineas,
    tipoAsiento,
  });

  const { data: insertados, error: insertError } = await supabase
    .from("asientos_contables")
    .insert(filas)
    .select("id");

  if (insertError) {
    logSupabaseAsientosInsertError(insertError, filas, "validarRegistroSire");
    throw insertError;
  }

  const ids = (insertados ?? []).map((row) => row.id);

  const { error: updateError } = await supabase
    .from(cabecera)
    .update({ estado_validacion: "validado" })
    .eq("id", registroId);

  if (updateError) throw updateError;

  return {
    registroId,
    asientoId: ids[0] ?? "",
    lineas: ids.length,
    alreadyValidated: false,
  };
}
