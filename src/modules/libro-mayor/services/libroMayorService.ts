import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  BalanceComprobacionResponse,
  CuentaMayorizada,
  FilaBalanceComprobacion,
  FilaLibroMayorF61,
  LibroMayorF61Response,
  NaturalezaSaldo,
} from "@/modules/libro-mayor/types/libroMayor";

type LmDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const db = supabase as unknown as LmDb;

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

function mapFilaMayor(raw: Record<string, unknown>): FilaLibroMayorF61 {
  return {
    fechaOperacion: String(raw.fecha_operacion ?? ""),
    cuo: String(raw.cuo ?? ""),
    correlativoLinea: raw.correlativo_linea != null ? Number(raw.correlativo_linea) : null,
    glosa: String(raw.glosa ?? ""),
    debe: Number(raw.debe ?? 0),
    haber: Number(raw.haber ?? 0),
    saldoLinea: Number(raw.saldo_linea ?? 0),
  };
}

function mapCuentaMayorizada(raw: Record<string, unknown>): CuentaMayorizada {
  const filasRaw = raw.filas;
  const filas = Array.isArray(filasRaw)
    ? filasRaw.map((f) => mapFilaMayor(f as Record<string, unknown>))
    : [];

  return {
    codigoCuenta: String(raw.codigo_cuenta ?? ""),
    denominacion: String(raw.denominacion ?? ""),
    saldoInicial: Number(raw.saldo_inicial ?? 0),
    totalDebe: Number(raw.total_debe ?? 0),
    totalHaber: Number(raw.total_haber ?? 0),
    saldoFinal: Number(raw.saldo_final ?? 0),
    naturalezaSaldo: String(raw.naturaleza_saldo ?? "NEUTRO") as NaturalezaSaldo,
    filas,
  };
}

function mapFilaBalance(raw: Record<string, unknown>): FilaBalanceComprobacion {
  return {
    cuentaCodigo: String(raw.cuenta_codigo ?? ""),
    cuentaDenominacion: String(raw.cuenta_denominacion ?? ""),
    saldoInicial: Number(raw.saldo_inicial ?? 0),
    sumaDebe: Number(raw.suma_debe ?? 0),
    sumaHaber: Number(raw.suma_haber ?? 0),
    saldoDeudor: Number(raw.saldo_deudor ?? 0),
    saldoAcreedor: Number(raw.saldo_acreedor ?? 0),
    saldoFinal: Number(raw.saldo_final ?? 0),
  };
}

export async function fetchContribuyenteIdByRucLm(ruc: string): Promise<string | null> {
  const { data, error } = await db
    .from("contribuyentes")
    .select("id")
    .eq("ruc", ruc)
    .maybeSingle();
  throwIfSupabaseError(error);
  return data?.id ?? null;
}

export async function fetchLibroMayorF61(
  contribuyenteId: string,
  periodo: string,
  nivelCuenta = 4,
  cuentaFiltro?: string,
): Promise<LibroMayorF61Response> {
  const { data, error } = await db.rpc("fn_obtener_libro_mayor_f61", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: cleanPeriodo(periodo),
    p_nivel_cuenta: nivelCuenta,
    p_cuenta_filtro: cuentaFiltro?.trim() || null,
  });
  throwIfSupabaseError(error);

  const row = data as Record<string, unknown>;
  const cuentasRaw = row.cuentas;
  const cuentas = Array.isArray(cuentasRaw)
    ? cuentasRaw.map((c) => mapCuentaMayorizada(c as Record<string, unknown>))
    : [];

  return {
    contribuyenteId: String(row.contribuyente_id ?? contribuyenteId),
    ruc: String(row.ruc ?? ""),
    razonSocial: String(row.razon_social ?? ""),
    periodo: String(row.periodo ?? cleanPeriodo(periodo)),
    nivelCuenta: Number(row.nivel_cuenta ?? nivelCuenta),
    codigoLibroTabla8: String(row.codigo_libro_tabla8 ?? "060100"),
    nombreLibro: String(row.nombre_libro ?? "Libro Mayor"),
    totalDebeGeneral: Number(row.total_debe_general ?? 0),
    totalHaberGeneral: Number(row.total_haber_general ?? 0),
    cuadrado: Boolean(row.cuadrado),
    cuentas,
    generadoAt: String(row.generado_at ?? new Date().toISOString()),
  };
}

export async function fetchBalanceComprobacion(
  contribuyenteId: string,
  periodo: string,
): Promise<BalanceComprobacionResponse> {
  const { data, error } = await db.rpc("fn_obtener_balance_comprobacion", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: cleanPeriodo(periodo),
  });
  throwIfSupabaseError(error);

  const row = data as Record<string, unknown>;
  const filasRaw = row.filas;
  const filas = Array.isArray(filasRaw)
    ? filasRaw.map((f) => mapFilaBalance(f as Record<string, unknown>))
    : [];

  return {
    contribuyenteId: String(row.contribuyente_id ?? contribuyenteId),
    ruc: String(row.ruc ?? ""),
    razonSocial: String(row.razon_social ?? ""),
    periodo: String(row.periodo ?? cleanPeriodo(periodo)),
    filas,
    totalDebe: Number(row.total_debe ?? 0),
    totalHaber: Number(row.total_haber ?? 0),
    totalSaldoDeudor: Number(row.total_saldo_deudor ?? 0),
    totalSaldoAcreedor: Number(row.total_saldo_acreedor ?? 0),
    cuadrado: Boolean(row.cuadrado),
    generadoAt: String(row.generado_at ?? new Date().toISOString()),
  };
}
