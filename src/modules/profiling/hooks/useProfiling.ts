import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchContribuyenteById,
  fetchContribuyenteByRuc,
  fetchEstudiosForCurrentUser,
  fetchProfilingRuc,
  fetchUitValor,
  saveFichaRucDecolecta,
} from "@/modules/profiling/services/profilingService";
import type { FichaRucDecolecta } from "@/modules/profiling/types/profiling";

export const profilingQueryKeys = {
  all: ["profiling"] as const,
  contribuyente: (id: string | null) => ["profiling", "contribuyente", id] as const,
  contribuyenteRuc: (ruc: string | null) => ["profiling", "contribuyente-ruc", ruc] as const,
  evaluacion: (contribuyenteId: string | null, ejercicio: number) =>
    ["profiling", "evaluacion", contribuyenteId, ejercicio] as const,
  estudios: () => ["profiling", "estudios"] as const,
  uit: (ejercicio: number) => ["profiling", "uit", ejercicio] as const,
};

export function useEstudiosUsuario() {
  return useQuery({
    queryKey: profilingQueryKeys.estudios(),
    queryFn: fetchEstudiosForCurrentUser,
    staleTime: 10 * 60_000,
  });
}

export function useContribuyenteProfiling(contribuyenteId: string | null) {
  return useQuery({
    queryKey: profilingQueryKeys.contribuyente(contribuyenteId),
    queryFn: () => fetchContribuyenteById(contribuyenteId!),
    enabled: !!contribuyenteId?.trim(),
    staleTime: 5 * 60_000,
  });
}

export function useContribuyenteByRucProfiling(ruc: string | null) {
  return useQuery({
    queryKey: profilingQueryKeys.contribuyenteRuc(ruc),
    queryFn: () => fetchContribuyenteByRuc(ruc!),
    enabled: !!ruc?.trim() && ruc.replace(/\D/g, "").length === 11,
    staleTime: 5 * 60_000,
  });
}

export function useProfilingRuc(contribuyenteId: string | null, ejercicio: number) {
  return useQuery({
    queryKey: profilingQueryKeys.evaluacion(contribuyenteId, ejercicio),
    queryFn: () => fetchProfilingRuc(contribuyenteId!, ejercicio),
    enabled: !!contribuyenteId?.trim() && ejercicio >= 2000,
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useUitValor(ejercicio: number) {
  return useQuery({
    queryKey: profilingQueryKeys.uit(ejercicio),
    queryFn: () => fetchUitValor(ejercicio),
    staleTime: 24 * 60 * 60_000,
  });
}

export function useSaveFichaRuc() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      estudioId,
      payload,
    }: {
      estudioId: string;
      payload: FichaRucDecolecta;
    }) => saveFichaRucDecolecta(estudioId, payload),
    onSuccess: async (result) => {
      toast.success(`Ficha RUC ${result.ruc} guardada correctamente`);
      await qc.invalidateQueries({ queryKey: profilingQueryKeys.all });
      await qc.invalidateQueries({ queryKey: ["contribuyentes"] });
      await qc.invalidateQueries({ queryKey: ["ficha-ruc"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo guardar la ficha RUC");
    },
  });
}
