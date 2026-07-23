import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  crearCuentaBancaria,
  ejecutarLiquidacionAtomica,
  fetchComprobantesPendientesLiquidacion,
  fetchCuentasBancarias,
  fetchMovimientosCaja,
  obtenerResumenCaja,
} from "@/modules/tesoreria/services/tesoreriaService";
import type { CuentaBancaria, LiquidacionPayload } from "@/modules/tesoreria/types/tesoreria";
import { contabilidadQueryKeys } from "@/modules/contabilidad/hooks/useContabilidad";
import { comprasVentasQueryKeys } from "@/modules/compras-ventas/hooks/useComprasVentas";

export const tesoreriaQueryKeys = {
  all: ["tesoreria"] as const,
  cuentas: (contribuyenteId: string | null) => ["tesoreria", "cuentas", contribuyenteId] as const,
  movimientos: (
    contribuyenteId: string | null,
    periodo: string,
    cuentaId?: string,
  ) => ["tesoreria", "movimientos", contribuyenteId, periodo, cuentaId ?? "all"] as const,
  pendientes: (contribuyenteId: string | null, periodo: string) =>
    ["tesoreria", "pendientes", contribuyenteId, periodo] as const,
  resumen: (contribuyenteId: string | null, periodo: string) =>
    ["tesoreria", "resumen", contribuyenteId, periodo] as const,
};

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

export function useCuentasBancarias(contribuyenteId: string | null, enabled = true) {
  return useQuery({
    queryKey: tesoreriaQueryKeys.cuentas(contribuyenteId),
    queryFn: () => fetchCuentasBancarias(contribuyenteId!),
    enabled: enabled && !!contribuyenteId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMovimientosCaja(
  contribuyenteId: string | null,
  periodo: string,
  cuentaId?: string,
  enabled = true,
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: tesoreriaQueryKeys.movimientos(contribuyenteId, periodoClean, cuentaId),
    queryFn: () => fetchMovimientosCaja(contribuyenteId!, periodoClean, cuentaId),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useComprobantesPendientes(
  contribuyenteId: string | null,
  periodo: string,
  enabled = true,
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: tesoreriaQueryKeys.pendientes(contribuyenteId, periodoClean),
    queryFn: () => fetchComprobantesPendientesLiquidacion(contribuyenteId!, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
  });
}

export function useResumenCaja(
  contribuyenteId: string | null,
  periodo: string,
  cuentas: CuentaBancaria[],
  movimientos: ReturnType<typeof useMovimientosCaja>["data"],
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: tesoreriaQueryKeys.resumen(contribuyenteId, periodoClean),
    queryFn: () =>
      obtenerResumenCaja(contribuyenteId!, periodoClean, cuentas, movimientos ?? []),
    enabled: !!contribuyenteId && periodoClean.length === 6,
    staleTime: 20_000,
  });
}

export function useLiquidarComprobante(contribuyenteId: string | null, periodo: string) {
  const qc = useQueryClient();
  const periodoClean = cleanPeriodo(periodo);

  return useMutation({
    mutationFn: (payload: LiquidacionPayload) => ejecutarLiquidacionAtomica(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: tesoreriaQueryKeys.all });

      const cuentasKey = tesoreriaQueryKeys.cuentas(contribuyenteId);
      const previousCuentas = qc.getQueryData(cuentasKey);

      qc.setQueryData(cuentasKey, (old: CuentaBancaria[] | undefined) => {
        if (!old) return old;
        return old.map((c) => {
          if (c.id !== payload.cuentaBancariaId) return c;
          const delta = payload.tipoComprobante === "VENTA" ? payload.monto : -payload.monto;
          return { ...c, saldoActual: Math.round((c.saldoActual + delta) * 100) / 100 };
        });
      });

      return { previousCuentas };
    },
    onSuccess: async (result) => {
      if (!result.ok) {
        if (result.duplicado) {
          toast.warning(result.error ?? "Comprobante ya liquidado");
        } else {
          toast.error(result.error ?? "Liquidación fallida");
        }
        return;
      }
      toast.success(
        `Liquidación OK · CUO ${result.cuo} · Saldo S/ ${result.nuevoSaldo.toFixed(2)}`,
      );
      await qc.invalidateQueries({ queryKey: tesoreriaQueryKeys.all });
      await qc.invalidateQueries({ queryKey: comprasVentasQueryKeys.all });
      await qc.invalidateQueries({ queryKey: contabilidadQueryKeys.all });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousCuentas) {
        qc.setQueryData(tesoreriaQueryKeys.cuentas(contribuyenteId), context.previousCuentas);
      }
      toast.error(error.message || "Error al liquidar comprobante");
    },
  });
}

export function useCrearCuentaBancaria(contribuyenteId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: crearCuentaBancaria,
    onSuccess: async () => {
      toast.success("Cuenta bancaria creada");
      await qc.invalidateQueries({ queryKey: tesoreriaQueryKeys.cuentas(contribuyenteId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo crear la cuenta");
    },
  });
}
