import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchContingencias,
  fetchLegalizaciones,
  fetchSemaforoContingencias,
  registrarContingencia,
  registrarLegalizacionNotarial,
} from "@/modules/control-formal/services/controlFormalService";
import type {
  LegalizacionNotarial,
  RegistrarContingenciaPayload,
} from "@/modules/control-formal/types/controlFormal";

export const controlFormalQueryKeys = {
  all: ["control-formal"] as const,
  legalizaciones: (contribuyenteId: string | null) =>
    ["control-formal", "legalizaciones", contribuyenteId] as const,
  contingencias: (contribuyenteId: string | null) =>
    ["control-formal", "contingencias", contribuyenteId] as const,
  semaforo: (contribuyenteId: string | null) =>
    ["control-formal", "semaforo", contribuyenteId] as const,
};

export function useLegalizaciones(contribuyenteId: string | null, enabled = true) {
  return useQuery({
    queryKey: controlFormalQueryKeys.legalizaciones(contribuyenteId),
    queryFn: () => fetchLegalizaciones(contribuyenteId!),
    enabled: enabled && !!contribuyenteId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useContingencias(contribuyenteId: string | null, enabled = true) {
  return useQuery({
    queryKey: controlFormalQueryKeys.contingencias(contribuyenteId),
    queryFn: () => fetchContingencias(contribuyenteId!),
    enabled: enabled && !!contribuyenteId,
    staleTime: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useSemaforoContingencias(contribuyenteId: string | null, enabled = true) {
  return useQuery({
    queryKey: controlFormalQueryKeys.semaforo(contribuyenteId),
    queryFn: () => fetchSemaforoContingencias(contribuyenteId!),
    enabled: enabled && !!contribuyenteId,
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useRegistrarLegalizacion(contribuyenteId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      legalizacion: Partial<LegalizacionNotarial> & {
        contribuyenteId: string;
        codigoLibroTabla8: string;
        nombreLibro: string;
        numeroLegalizacion: string;
        notariaJuzgado: string;
        fechaLegalizacion: string;
        foliosDesde: number;
        foliosHasta: number;
      },
    ) => registrarLegalizacionNotarial(legalizacion),
    onSuccess: async () => {
      toast.success("Legalización notarial registrada");
      await qc.invalidateQueries({ queryKey: controlFormalQueryKeys.legalizaciones(contribuyenteId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar legalización");
    },
  });
}

export function useRegistrarContingencia(contribuyenteId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegistrarContingenciaPayload) => registrarContingencia(payload),
    onSuccess: async (result) => {
      toast.success(
        `Contingencia registrada. Comunicar SUNAT antes del ${result.fechaLimiteComunicacion15d}`,
      );
      await qc.invalidateQueries({ queryKey: controlFormalQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar contingencia");
    },
  });
}
