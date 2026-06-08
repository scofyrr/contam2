import { supabase } from "@/integrations/supabase/client";
import { CUENTAS_DEFAULT } from "@/lib/asientos-generator";
import {
  ASIENTOS_CONTABLES_SELECT,
  logSupabaseAsientosInsertError,
  normalizeCuentaContable,
  round2,
  toAsientoContableInsert,
  type AsientoContableInsert,
} from "@/lib/asientos-contables-utils";
import type { LibroDiarioLinea } from "@/lib/sire-types";

export type FlujoCajaLinea = LibroDiarioLinea & { tipo_libro?: string | null };

export async function fetchFlujoCajaBancos(params: {
  ruc: string;
  periodo?: string | null;
}): Promise<FlujoCajaLinea[]> {
  const ruc = params.ruc.trim();
  if (!ruc) return [];

  let q = supabase
    .from("asientos_contables")
    .select(ASIENTOS_CONTABLES_SELECT)
    .eq("tipo_libro", "CAJA_BANCOS")
    .eq("ruc_contraparte", ruc)
    .order("fecha_asiento", { ascending: false })
    .limit(500);

  if (params.periodo?.trim()) q = q.eq("periodo", params.periodo.trim());

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    sire_registro_id: row.sire_registro_id,
    fecha_asiento: String(row.fecha_asiento),
    periodo: String(row.periodo),
    cuenta_contable: String(row.cuenta_contable),
    debe: Number(row.debe ?? 0),
    haber: Number(row.haber ?? 0),
    glosa: row.glosa,
    naturaleza: row.naturaleza === "haber" ? "haber" : "debe",
    origen: String(row.tipo_asiento ?? ""),
    tipo_libro: row.tipo_libro,
    tipo_registro: row.tipo_registro,
    ruc: row.ruc_contraparte,
    serie_cdp: row.serie_cdp,
    nro_cdp_inicial: row.nro_cdp_inicial,
  })) as FlujoCajaLinea[];
}

export async function registrarOperacionDirectaCaja(params: {
  ruc: string;
  periodo: string;
  fecha: string;
  glosa: string;
  cuentaFinanciera: string;
  debe: number;
  haber: number;
  contrapartida: string;
}): Promise<void> {
  const debe = round2(params.debe);
  const haber = round2(params.haber);
  if (debe <= 0 && haber <= 0) throw new Error("Indique un monto en Debe o Haber.");
  if (debe > 0 && haber > 0) throw new Error("No puede registrar Debe y Haber simultáneos.");

  const cuenta10 = normalizeCuentaContable(params.cuentaFinanciera);
  const cuentaContra = normalizeCuentaContable(params.contrapartida);
  if (!cuenta10) throw new Error("Cuenta financiera inválida.");

  const filas: AsientoContableInsert[] = [];

  if (debe > 0) {
    filas.push(
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuenta10,
        glosa: params.glosa,
        debe,
        haber: 0,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim(),
      }),
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuentaContra || CUENTAS_DEFAULT.gastoCompra,
        glosa: params.glosa,
        debe: 0,
        haber: debe,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim(),
      }),
    );
  } else {
    filas.push(
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuentaContra || CUENTAS_DEFAULT.gastoCompra,
        glosa: params.glosa,
        debe: haber,
        haber: 0,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim(),
      }),
      toAsientoContableInsert({
        sire_registro_id: null,
        periodo: params.periodo,
        tipo_asiento: "principal",
        tipo_libro: "CAJA_BANCOS",
        fecha_asiento: params.fecha,
        cuenta_contable: cuenta10,
        glosa: params.glosa,
        debe: 0,
        haber,
        tipo_registro: "COMPRA",
        ruc_contraparte: params.ruc.trim(),
      }),
    );
  }

  const { error } = await supabase.from("asientos_contables").insert(filas);
  if (error) {
    logSupabaseAsientosInsertError(error, filas, "registrarOperacionDirectaCaja");
    throw error;
  }
}
