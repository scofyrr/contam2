import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cajaCentralizacionService,
  centralizarPeriodoInteligente,
  decentralizarPeriodo,
  obtenerResumenLiquidez,
} from "@/modules/caja/services/caja-centralizacion-service";
import {
  conciliacionBancariaService,
  executeConciliacion,
  obtenerHistorialConciliaciones,
} from "@/modules/caja/services/conciliacion-bancaria-service";
import type { AgrupacionCentralizacion, BankStatementRow, ConciliacionConfig } from "@/modules/caja/types/conciliacion";

export function useLiquidezDashboard(ruc?: string | null, periodo?: string | null) {
  return useQuery({
    queryKey: ["caja", "liquidez", ruc ?? "all", periodo ?? null],
    queryFn: () => obtenerResumenLiquidez(ruc),
    staleTime: 60_000,
  });
}

export function useConciliacionesPendientes(cuentaFinancieraId?: string | null) {
  return useQuery({
    queryKey: ["caja", "conciliaciones", cuentaFinancieraId ?? null],
    queryFn: () =>
      cuentaFinancieraId
        ? obtenerHistorialConciliaciones(cuentaFinancieraId)
        : Promise.resolve([]),
    enabled: !!cuentaFinancieraId,
  });
}

export function useCentralizarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      ruc: string;
      periodo: string;
      agrupacion?: AgrupacionCentralizacion;
      dryRun?: boolean;
      cuentaFinancieraId?: string | null;
    }) => centralizarPeriodoInteligente(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja"] });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    },
  });
}

export function useDescentralizarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: decentralizarPeriodo,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja"] });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    },
  });
}

export function useEjecutarConciliacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      cuentaFinancieraId: string;
      ruc: string;
      periodo: string;
      extracto: BankStatementRow[];
      config?: Partial<ConciliacionConfig>;
      archivoOriginal?: string;
    }) => executeConciliacion(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja", "conciliaciones"] });
    },
  });
}

export function useFlujoCaja(ruc: string, periodo: string) {
  return useQuery({
    queryKey: ["caja", "flujo", ruc, periodo],
    queryFn: () => cajaCentralizacionService.obtenerFlujoCaja(ruc, periodo),
    enabled: !!ruc && !!periodo,
  });
}

export { conciliacionBancariaService, cajaCentralizacionService };
