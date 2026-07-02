/** Activa la estructura normalizada SIRE (cabecera + montos + modificaciones + adicionales). */
export function useNewSireStructure(): boolean {
  const raw = import.meta.env.VITE_USE_NEW_SIRE_STRUCTURE;
  return String(raw ?? "").toLowerCase() === "true";
}

export function getSireReadSource(): "registros_sire_completo" | "registros_sire" {
  return useNewSireStructure() ? "registros_sire_completo" : "registros_sire";
}

export function getSireCabeceraTable(): "registros_sire_cabecera" | "registros_sire" {
  return useNewSireStructure() ? "registros_sire_cabecera" : "registros_sire";
}

/** Relación PostgREST embebida desde asientos_contables hacia el comprobante SIRE. */
export function getSireEmbedRelation(): "registros_sire_cabecera" | "registros_sire" {
  return useNewSireStructure() ? "registros_sire_cabecera" : "registros_sire";
}
