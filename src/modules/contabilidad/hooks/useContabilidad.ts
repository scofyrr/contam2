import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  crearAsientoManual,
  fetchLibroDiarioFormato51,
  fetchLibroDiarioSimplificadoFormato52,
  fetchPlanCuentasPcge,
  generarAsientoComprobante,
} from "@/modules/contabilidad/services/contabilidadService";
import type { AsientoPlano } from "@/modules/contabilidad/types/contabilidad";

export const contabilidadQueryKeys = {
  all: ["contabilidad-mod5"] as const,
  pcge: (filtro?: string) => ["contabilidad-mod5", "pcge", filtro ?? ""] as const,
  f51: (contribuyenteId: string | null, periodo: string) =>
    ["contabilidad-mod5", "f51", contribuyenteId, periodo] as const,
  f52: (contribuyenteId: string | null, periodo: string) =>
    ["contabilidad-mod5", "f52", contribuyenteId, periodo] as const,
};

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

export function usePlanCuentasPCGE(filtroCodigo?: string) {
  return useQuery({
    queryKey: contabilidadQueryKeys.pcge(filtroCodigo),
    queryFn: () => fetchPlanCuentasPcge(filtroCodigo),
    staleTime: 5 * 60_000,
  });
}

export function useLibroDiarioF51(
  contribuyenteId: string | null,
  periodo: string,
  enabled = true,
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: contabilidadQueryKeys.f51(contribuyenteId, periodoClean),
    queryFn: () => fetchLibroDiarioFormato51(contribuyenteId!, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useLibroDiarioSimplificadoF52(
  contribuyenteId: string | null,
  periodo: string,
  enabled = true,
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: contabilidadQueryKeys.f52(contribuyenteId, periodoClean),
    queryFn: () => fetchLibroDiarioSimplificadoFormato52(contribuyenteId!, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useGenerarAsientoComprobante(contribuyenteId: string | null, periodo: string) {
  const qc = useQueryClient();
  const periodoClean = cleanPeriodo(periodo);

  return useMutation({
    mutationFn: (params: {
      comprobanteId: string;
      tipoOrigen: "COMPRA" | "VENTA" | "RCE" | "RVIE";
    }) => generarAsientoComprobante(contribuyenteId!, params.comprobanteId, params.tipoOrigen),
    onSuccess: async (result) => {
      toast.success(`Asiento ${result.cuo} generado (${result.lineasGeneradas} líneas)`);
      await qc.invalidateQueries({
        queryKey: contabilidadQueryKeys.f51(contribuyenteId, periodoClean),
      });
      await qc.invalidateQueries({
        queryKey: contabilidadQueryKeys.f52(contribuyenteId, periodoClean),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo generar el asiento");
    },
  });
}

export function useCrearAsientoManual(contribuyenteId: string | null, periodo: string) {
  const qc = useQueryClient();
  const periodoClean = cleanPeriodo(periodo);

  return useMutation({
    mutationFn: (asiento: AsientoPlano) => crearAsientoManual(asiento),
    onSuccess: async (result) => {
      toast.success(`Asiento manual ${result.cuo} registrado`);
      await qc.invalidateQueries({
        queryKey: contabilidadQueryKeys.f51(contribuyenteId, periodoClean),
      });
      await qc.invalidateQueries({
        queryKey: contabilidadQueryKeys.f52(contribuyenteId, periodoClean),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar asiento manual");
    },
  });
}
