import { supabase } from "@/integrations/supabase/client";
import { centralizarPeriodoViaApi } from "@/lib/api/caja-api";
import { useDjangoApi } from "@/lib/api/config";
import {
  GLOSA_CENTRALIZACION_CAJA,
  normalizeCuentaContable,
  round2,
  toAsientoContableInsert,
  type AsientoContableInsert,
} from "@/lib/asientos-contables-utils";

export type MovimientoCaja = {
  id: string;
  correlativo: string | null;
  ruc: string | null;
  periodo: string;
  fecha: string;
  fecha_operacion: string | null;
  glosa: string;
  cuenta_contable: string;
  debe: number;
  haber: number;
  origen: string;
  registro_sire_id: string | null;
  asiento_id: string | null;
  created_at?: string;
};

const MOV_CAJA_SELECT =
  "id, correlativo, ruc, periodo, fecha, fecha_operacion, glosa, cuenta_contable, debe, haber, origen, registro_sire_id, asiento_id, created_at";

export async function fetchMovimientosCaja(params: {
  ruc: string;
  periodo?: string | null;
}): Promise<MovimientoCaja[]> {
  const ruc = params.ruc.trim();
  if (!ruc) return [];

  let q = supabase
    .from("movimientos_caja")
    .select(MOV_CAJA_SELECT)
    .eq("ruc", ruc)
    .order("fecha", { ascending: true });

  if (params.periodo?.trim()) q = q.eq("periodo", params.periodo.trim());

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MovimientoCaja[];
}

export async function fetchMovimientosSinCentralizar(params: {
  ruc: string;
  periodo: string;
}): Promise<MovimientoCaja[]> {
  const ruc = params.ruc.trim();
  const periodo = params.periodo.trim();
  if (!ruc || !periodo) return [];

  const { data, error } = await supabase
    .from("movimientos_caja")
    .select(MOV_CAJA_SELECT)
    .eq("ruc", ruc)
    .eq("periodo", periodo)
    .is("asiento_id", null)
    .order("fecha_operacion", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MovimientoCaja[];
}

export type CentralizarPeriodoResult = {
  movimientosVinculados: number;
  lineasDiario: number;
  asientoReferenciaId: string;
};

/**
 * Centraliza movimientos de caja sin `asiento_id` hacia `asientos_contables` (tipo CAJA).
 * Agrupa por cuenta contable (resumen) y vincula todos los movimientos al primer ID generado.
 */
export async function centralizarPeriodoCaja(params: {
  ruc: string;
  periodo: string;
}): Promise<CentralizarPeriodoResult> {
  const ruc = params.ruc.trim();
  const periodo = params.periodo.trim();
  if (!ruc) throw new Error("Selecciona un RUC antes de centralizar.");
  if (!periodo) throw new Error("Indica el periodo (AAAAMM) antes de centralizar.");

  const movimientos = await fetchMovimientosSinCentralizar({ ruc, periodo });
  if (movimientos.length === 0) {
    throw new Error("No hay movimientos pendientes de centralizar en este periodo.");
  }

  type Agg = { debe: number; haber: number; fecha: string };
  const porCuenta = new Map<string, Agg>();

  for (const m of movimientos) {
    const fecha = String(m.fecha_operacion ?? m.fecha ?? "").slice(0, 10);
    const cuenta = normalizeCuentaContable(m.cuenta_contable);
    if (!cuenta) throw new Error(`Movimiento ${m.id} sin cuenta contable válida.`);
    const prev = porCuenta.get(cuenta) ?? { debe: 0, haber: 0, fecha };
    prev.debe += Number(m.debe ?? 0);
    prev.haber += Number(m.haber ?? 0);
    if (fecha > prev.fecha) prev.fecha = fecha;
    porCuenta.set(cuenta, prev);
  }

  const fechaAsiento =
    [...porCuenta.values()].reduce((max, a) => (a.fecha > max ? a.fecha : max), "") ||
    `${periodo.slice(0, 4)}-${periodo.slice(4, 6)}-01`;

  const glosaResumen = `${GLOSA_CENTRALIZACION_CAJA} ${periodo}`;

  const filas: AsientoContableInsert[] = [...porCuenta.entries()].map(([cuenta, agg]) =>
    toAsientoContableInsert({
      sire_registro_id: null,
      periodo,
      tipo_asiento: "principal",
      fecha_asiento: fechaAsiento,
      cuenta_contable: cuenta,
      glosa: glosaResumen,
      debe: round2(agg.debe),
      haber: round2(agg.haber),
      naturaleza: agg.debe > 0 ? "debe" : "haber",
      tipo_registro: "COMPRA",
      serie_cdp: null,
      nro_cdp_inicial: null,
      ruc_contraparte: ruc,
      nombre_contraparte: null,
    }),
  );

  const totalDebe = round2(filas.reduce((s, f) => s + Number(f.debe ?? 0), 0));
  const totalHaber = round2(filas.reduce((s, f) => s + Number(f.haber ?? 0), 0));
  if (Math.abs(totalDebe - totalHaber) > 0.01) {
    throw new Error(
      `La centralización está descuadrada (Debe ${totalDebe} ≠ Haber ${totalHaber}). Revise los movimientos de caja.`,
    );
  }

  const { data: insertados, error: insertErr } = await supabase
    .from("asientos_contables")
    .insert(filas)
    .select("id");

  if (insertErr) throw insertErr;

  const ids = (insertados ?? []).map((r) => r.id as string);
  if (ids.length === 0) throw new Error("No se generaron líneas en el libro diario.");

  const asientoReferenciaId = ids[0];
  const movIds = movimientos.map((m) => m.id);

  const { error: linkErr } = await supabase
    .from("movimientos_caja")
    .update({ asiento_id: asientoReferenciaId })
    .eq("ruc", ruc)
    .eq("periodo", periodo)
    .in("id", movIds);

  if (linkErr) throw linkErr;

  return {
    movimientosVinculados: movIds.length,
    lineasDiario: ids.length,
    asientoReferenciaId,
  };
}

/** Centraliza vía Supabase o Django según configuración. */
export async function ejecutarCentralizarPeriodo(params: {
  ruc: string;
  periodo: string;
}): Promise<CentralizarPeriodoResult> {
  if (useDjangoApi()) {
    return centralizarPeriodoViaApi(params);
  }
  return centralizarPeriodoCaja(params);
}

/** Movimientos de caja amarrados al UUID de referencia del lote (auditoría cruzada). */
export async function fetchMovimientosPorAsientoLote(asientoLoteId: string): Promise<MovimientoCaja[]> {
  const id = asientoLoteId.trim();
  if (!id) return [];

  const { data, error } = await supabase
    .from("movimientos_caja")
    .select(MOV_CAJA_SELECT)
    .eq("asiento_id", id)
    .order("fecha_operacion", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MovimientoCaja[];
}

export async function createMovimientoCaja(
  input: Omit<MovimientoCaja, "id" | "correlativo" | "created_at"> & { ruc: string },
): Promise<MovimientoCaja> {
  const ruc = input.ruc.trim();
  if (!ruc) throw new Error("El RUC del contribuyente es obligatorio.");

  const fecha = input.fecha_operacion ?? input.fecha;
  const { data, error } = await supabase
    .from("movimientos_caja")
    .insert({
      ruc,
      periodo: input.periodo,
      fecha,
      fecha_operacion: input.fecha_operacion ?? fecha,
      glosa: input.glosa,
      cuenta_contable: normalizeCuentaContable(input.cuenta_contable),
      debe: input.debe,
      haber: input.haber,
      origen: input.origen ?? "manual",
      registro_sire_id: input.registro_sire_id ?? null,
      asiento_id: input.asiento_id ?? null,
    })
    .select(MOV_CAJA_SELECT)
    .single();

  if (error) throw error;
  return data as MovimientoCaja;
}

export async function updateMovimientoCaja(
  id: string,
  patch: Partial<
    Pick<MovimientoCaja, "fecha_operacion" | "glosa" | "cuenta_contable" | "debe" | "haber">
  >,
): Promise<void> {
  const body: Record<string, unknown> = { ...patch };
  if (patch.fecha_operacion) body.fecha = patch.fecha_operacion;
  if (patch.cuenta_contable != null) {
    body.cuenta_contable = normalizeCuentaContable(patch.cuenta_contable);
  }
  const { error } = await supabase.from("movimientos_caja").update(body).eq("id", id);
  if (error) throw error;
}
