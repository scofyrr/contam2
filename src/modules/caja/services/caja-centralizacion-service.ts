import { supabase } from "@/integrations/supabase/client";
import { ejecutarCentralizarPeriodo, fetchMovimientosSinCentralizar } from "@/lib/caja-service";
import { useDjangoApi } from "@/lib/api/config";
import type { AgrupacionCentralizacion, CentralizacionGrupo, LiquidezEmpresa } from "@/modules/caja/types/conciliacion";

export async function centralizarPeriodoInteligente(params: {
  ruc: string;
  periodo: string;
  cuentaFinancieraId?: string | null;
  agrupacion?: AgrupacionCentralizacion;
  dryRun?: boolean;
}): Promise<CentralizacionGrupo[]> {
  const { data, error } = await supabase.rpc("rpc_centralizacion_inteligente", {
    p_ruc: params.ruc.trim(),
    p_periodo: params.periodo.trim(),
    p_cuenta_financiera_id: params.cuentaFinancieraId ?? null,
    p_agrupacion: params.agrupacion ?? "cuenta",
    p_dry_run: params.dryRun ?? true,
  });

  if (error) {
    if (params.dryRun !== false) throw error;
    if (useDjangoApi()) throw error;
    const legacy = await ejecutarCentralizarPeriodo({ ruc: params.ruc, periodo: params.periodo });
    return [
      {
        grupoNombre: "Resumen",
        cuentaContable: "—",
        cantidadMovimientos: legacy.movimientosVinculados,
        totalIngresos: 0,
        totalEgresos: 0,
        montoNeto: 0,
        asientoGeneradoId: legacy.asientoReferenciaId,
      },
    ];
  }

  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    grupoNombre: String(r.grupo_nombre ?? ""),
    cuentaContable: String(r.cuenta_contable ?? ""),
    cantidadMovimientos: Number(r.cantidad_movimientos ?? 0),
    totalIngresos: Number(r.total_ingresos ?? 0),
    totalEgresos: Number(r.total_egresos ?? 0),
    montoNeto: Number(r.monto_neto ?? 0),
    asientoGeneradoId: r.asiento_generado_id ? String(r.asiento_generado_id) : null,
  }));
}

export async function decentralizarPeriodo(params: {
  ruc: string;
  periodo: string;
  cuentaFinancieraId?: string | null;
}) {
  const { data, error } = await supabase.rpc("rpc_descentralizar_periodo", {
    p_ruc: params.ruc.trim(),
    p_periodo: params.periodo.trim(),
    p_cuenta_financiera_id: params.cuentaFinancieraId ?? null,
  });
  if (error) throw error;
  return data ?? [];
}

export async function obtenerMovimientosPendientes(ruc: string, periodo: string) {
  return fetchMovimientosSinCentralizar({ ruc, periodo });
}

export async function obtenerResumenLiquidez(ruc?: string | null): Promise<LiquidezEmpresa[]> {
  const { data, error } = await supabase.rpc("rpc_obtener_liquidez_global", {
    p_ruc: ruc?.trim() || null,
  });

  if (error || !data?.success) {
    return buildLiquidezFallback(ruc);
  }

  const rows = (data.data as Record<string, unknown>[]) ?? [];
  return rows.map((r) => {
    const saldo = Number(r.saldo_disponible ?? 0);
    const porCobrar = Number(r.por_cobrar ?? 0);
    const porPagar = Number(r.por_pagar ?? 0);
    const total = Number(r.saldo_total ?? saldo + porCobrar - porPagar);
    const ratio = Number(r.ratio ?? 0);
    return {
      ruc: String(r.ruc ?? ""),
      razonSocial: String(r.razon_social ?? r.ruc ?? ""),
      saldoTotal: total,
      saldoDisponible: saldo,
      porCobrar,
      porPagar,
      ratio,
      estadoSalud: ratio >= 2 ? "SALUDABLE" : ratio >= 1 ? "ATENCION" : "CRITICO",
      variacionMes: 0,
      cuentas: [],
      sparkline: Array.from({ length: 30 }, (_, i) => saldo * (0.9 + (i % 5) * 0.02)),
    } satisfies LiquidezEmpresa;
  });
}

async function buildLiquidezFallback(ruc?: string | null): Promise<LiquidezEmpresa[]> {
  const { fetchMovimientosCaja } = await import("@/lib/caja-service");
  const { fetchCuentasFinancieras } = await import("@/lib/cuentas-financieras-service");

  if (ruc?.trim()) {
    const movs = await fetchMovimientosCaja({ ruc });
    const cuentas = await fetchCuentasFinancieras(ruc);
    const saldo = movs.reduce((s, m) => s + Number(m.haber ?? 0) - Number(m.debe ?? 0), 0);
    return [
      {
        ruc,
        razonSocial: ruc,
        saldoTotal: saldo,
        saldoDisponible: saldo,
        porCobrar: 0,
        porPagar: 0,
        ratio: 1,
        estadoSalud: saldo > 10000 ? "SALUDABLE" : saldo > 1000 ? "ATENCION" : "CRITICO",
        variacionMes: 0,
        cuentas: cuentas.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          saldo: movs
            .filter((m) => m.cuenta_contable === c.cuenta_contable)
            .reduce((s, m) => s + Number(m.haber ?? 0) - Number(m.debe ?? 0), 0),
          tipo: c.tipo,
        })),
        sparkline: Array.from({ length: 30 }, () => saldo / 30),
      },
    ];
  }
  return [];
}

export async function obtenerFlujoCaja(ruc: string, periodo: string) {
  const { fetchMovimientosCaja } = await import("@/lib/caja-service");
  const movs = await fetchMovimientosCaja({ ruc, periodo });
  const byDay = new Map<string, { ingresos: number; egresos: number }>();
  for (const m of movs) {
    const d = String(m.fecha_operacion ?? m.fecha ?? "").slice(0, 10);
    const prev = byDay.get(d) ?? { ingresos: 0, egresos: 0 };
    prev.ingresos += Number(m.haber ?? 0);
    prev.egresos += Number(m.debe ?? 0);
    byDay.set(d, prev);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, v]) => ({ fecha, ...v, neto: v.ingresos - v.egresos }));
}

export const cajaCentralizacionService = {
  centralizarPeriodoInteligente,
  decentralizarPeriodo,
  obtenerMovimientosPendientes,
  obtenerResumenLiquidez,
  obtenerFlujoCaja,
};
