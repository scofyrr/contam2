import { supabase } from "@/integrations/supabase/client";
import {
  generarLineasAsiento,
  type CuentasAsientoDefaults,
} from "@/lib/asientos-generator";
import {
  lineasToAsientosPlanos,
  logSupabaseAsientosInsertError,
  tipoAsientoProvision,
  toAsientoContableInsert,
} from "@/lib/asientos-contables-utils";
import {
  fetchRegistroSireById as fetchRegistroRowById,
  fetchRegistrosSireRows,
  updateRegistroSireCabecera,
} from "@/lib/sire-registros-service";
import { normalizeRegistroSire } from "@/lib/sire-data";
import type { LineaAsientoInput, RegistroSire } from "@/lib/sire-types";

export type ComprobantePendiente = RegistroSire & {
  tieneAsiento: boolean;
};

export type LineaAsientoEditable = LineaAsientoInput & {
  key: string;
};

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function sumDebe(lineas: LineaAsientoInput[]): number {
  return round2(lineas.reduce((s, l) => s + Number(l.debe ?? 0), 0));
}

export function sumHaber(lineas: LineaAsientoInput[]): number {
  return round2(lineas.reduce((s, l) => s + Number(l.haber ?? 0), 0));
}

export function isAsientoCuadrado(lineas: LineaAsientoInput[], tolerance = 0.001): boolean {
  return Math.abs(sumDebe(lineas) - sumHaber(lineas)) <= tolerance;
}

export function toEditableLineas(lineas: LineaAsientoInput[]): LineaAsientoEditable[] {
  return lineas.map((l, i) => ({
    ...l,
    key: `linea-${l.orden}-${i}`,
  }));
}

const TIPOS_PROVISION = ["principal"] as const;

export async function fetchComprobantesPendientes(params: {
  ruc: string;
  periodo?: string;
}): Promise<ComprobantePendiente[]> {
  const rows = await fetchRegistrosSireRows({
    ruc: params.ruc,
    periodo: params.periodo,
    limit: 200,
  });

  const registros = rows
    .map((row) => normalizeRegistroSire(row))
    .filter(
      (r) =>
        !r.estado_validacion ||
        r.estado_validacion === "pendiente" ||
        r.estado_validacion === "ia_sugerido",
    );

  if (registros.length === 0) return [];

  const ids = registros.map((r) => r.id);
  const { data: asientos } = await supabase
    .from("asientos_contables")
    .select("sire_registro_id, tipo_asiento")
    .in("sire_registro_id", ids)
    .in("tipo_asiento", [...TIPOS_PROVISION]);

  const conProvision = new Set(
    (asientos ?? []).map((a) => a.sire_registro_id).filter(Boolean),
  );

  return registros
    .filter((r) => !conProvision.has(r.id))
    .map((r) => ({ ...r, tieneAsiento: false }));
}

export async function fetchRegistroSireById(id: string): Promise<RegistroSire> {
  const row = await fetchRegistroRowById(id);
  return normalizeRegistroSire(row);
}

export function proponerLineasAsiento(
  registro: RegistroSire,
  cuentas?: Partial<CuentasAsientoDefaults>,
): LineaAsientoEditable[] {
  return toEditableLineas(generarLineasAsiento(registro, cuentas));
}

export async function guardarAsientoProvision(params: {
  registroId: string;
  lineas: LineaAsientoInput[];
}): Promise<{ asientoId: string }> {
  if (!isAsientoCuadrado(params.lineas)) {
    throw new Error("El asiento está descuadrado. Debe y Haber deben ser iguales.");
  }

  const registro = await fetchRegistroSireById(params.registroId);
  const tipoAsiento = tipoAsientoProvision(registro.tipo);

  const { data: existente } = await supabase
    .from("asientos_contables")
    .select("id")
    .eq("sire_registro_id", params.registroId)
    .in("tipo_asiento", [...TIPOS_PROVISION])
    .limit(1)
    .maybeSingle();

  if (existente?.id) {
    throw new Error("Este comprobante ya tiene un asiento de provisión registrado.");
  }

  const filas = lineasToAsientosPlanos({
    registro,
    registroId: params.registroId,
    lineas: params.lineas,
    tipoAsiento,
  });

  const { data: insertados, error: insertErr } = await supabase
    .from("asientos_contables")
    .insert(filas)
    .select("id");

  if (insertErr) {
    logSupabaseAsientosInsertError(insertErr, filas, "guardarAsientoProvision");
    throw insertErr;
  }

  const ids = (insertados ?? []).map((r) => r.id);
  if (ids.length === 0) {
    throw new Error("No se insertaron líneas en asientos_contables.");
  }

  await updateRegistroSireCabecera(params.registroId, { estado_validacion: "validado" });

  return { asientoId: ids[0] };
}

export async function guardarAsientoManual(params: {
  ruc: string;
  periodo: string;
  fecha: string;
  glosa: string;
  lineas: LineaAsientoInput[];
}): Promise<void> {
  if (!isAsientoCuadrado(params.lineas)) {
    throw new Error("El asiento manual está descuadrado. Debe y Haber deben ser iguales.");
  }

  const filas = params.lineas.map((l) => {
    const debe = round2(Number(l.debe ?? 0));
    const haber = round2(Number(l.haber ?? 0));
    return toAsientoContableInsert({
      sire_registro_id: null,
      periodo: params.periodo,
      tipo_asiento: "principal",
      tipo_libro: "DIARIO_MANUAL",
      fecha_asiento: params.fecha,
      cuenta_contable: l.cuenta,
      glosa: l.glosa?.trim() || params.glosa,
      debe,
      haber,
      tipo_registro: "COMPRA",
      ruc_contraparte: params.ruc.trim(),
      nombre_contraparte: null,
      serie_cdp: null,
      nro_cdp_inicial: null,
    });
  });

  const { error } = await supabase.from("asientos_contables").insert(filas);
  if (error) {
    logSupabaseAsientosInsertError(error, filas, "guardarAsientoManual");
    throw error;
  }
}
