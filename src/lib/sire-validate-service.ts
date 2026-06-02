import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { generarLineasAsiento, glosaAsiento, origenAsiento } from "@/lib/asientos-generator";
import type { RegistroSire } from "@/lib/sire-types";

type AdminClient = SupabaseClient<Database>;

export type ValidateResult = {
  registroId: string;
  asientoId: string;
  lineas: number;
  alreadyValidated: boolean;
};

export async function validarRegistroSire(
  supabase: AdminClient,
  registroId: string,
): Promise<ValidateResult> {
  const { data: registro, error: fetchError } = await supabase
    .from("registros_sire")
    .select("*")
    .eq("id", registroId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!registro) throw new Error("Registro SIRE no encontrado");

  const r = registro as unknown as RegistroSire;

  const { data: asientoExistente } = await supabase
    .from("asientos_contables")
    .select("id")
    .eq("registro_sire_id", registroId)
    .eq("tipo_asiento", "principal")
    .maybeSingle();

  if (asientoExistente?.id) {
    if (r.estado_validacion !== "validado") {
      await supabase
        .from("registros_sire")
        .update({ estado_validacion: "validado" })
        .eq("id", registroId);
    }
    const { count } = await supabase
      .from("lineas_asiento")
      .select("id", { count: "exact", head: true })
      .eq("asiento_id", asientoExistente.id);

    return {
      registroId,
      asientoId: asientoExistente.id,
      lineas: count ?? 0,
      alreadyValidated: true,
    };
  }

  const lineas = generarLineasAsiento(r);
  const totalDebe = lineas.reduce((s, l) => s + l.debe, 0);
  const totalHaber = lineas.reduce((s, l) => s + l.haber, 0);

  const { data: asiento, error: asientoError } = await supabase
    .from("asientos_contables")
    .insert({
      periodo: r.periodo,
      fecha: r.fecha_emision,
      origen: origenAsiento(r.tipo),
      registro_sire_id: registroId,
      tipo_asiento: "principal",
      glosa: glosaAsiento(r),
      moneda: (r.cod_moneda === "USD" || r.cod_moneda === "EUR" ? r.cod_moneda : "PEN") as
        | "PEN"
        | "USD"
        | "EUR",
      tipo_cambio: 1,
      total_debe: totalDebe,
      total_haber: totalHaber,
    })
    .select("id")
    .single();

  if (asientoError) throw asientoError;

  const { error: lineasError } = await supabase.from("lineas_asiento").insert(
    lineas.map((l) => ({
      asiento_id: asiento.id,
      orden: l.orden,
      cuenta: l.cuenta,
      glosa: l.glosa,
      debe: l.debe,
      haber: l.haber,
    })),
  );

  if (lineasError) {
    await supabase.from("asientos_contables").delete().eq("id", asiento.id);
    throw lineasError;
  }

  const { error: updateError } = await supabase
    .from("registros_sire")
    .update({ estado_validacion: "validado" } as Database["public"]["Tables"]["registros_sire"]["Update"])
    .eq("id", registroId);

  if (updateError) throw updateError;

  return {
    registroId,
    asientoId: asiento.id,
    lineas: lineas.length,
    alreadyValidated: false,
  };
}
