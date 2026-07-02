import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarFicha,
  actualizarFichaDesdeSunat,
  buscarContribuyentes,
  compararContribuyentes,
  obtenerDashboard360,
  obtenerFichaCompleta,
} from "@/modules/ficha-ruc/services/ficha-ruc-service";
import type { FichaRuc } from "@/lib/contribuyentes-types";

export function useFichaCompleta(ruc: string | null) {
  return useQuery({
    queryKey: ["ficha-ruc", "completa", ruc],
    queryFn: () => obtenerFichaCompleta(ruc!.trim()),
    enabled: !!ruc?.trim(),
    staleTime: 30 * 60_000,
  });
}

export function useConsultarSunat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruc, forzar }: { ruc: string; forzar?: boolean }) =>
      actualizarFichaDesdeSunat(ruc, forzar ?? false),
    onSuccess: async (_, { ruc }) => {
      await qc.invalidateQueries({ queryKey: ["ficha-ruc"] });
      await qc.invalidateQueries({ queryKey: ["contribuyentes"] });
      await qc.invalidateQueries({ queryKey: ["ficha-ruc", "completa", ruc] });
    },
  });
}

export function useDashboard360(ruc: string | null, periodo?: string | null, enabled = true) {
  return useQuery({
    queryKey: ["ficha-ruc", "dashboard360", ruc, periodo ?? null],
    queryFn: () => obtenerDashboard360(ruc!.trim(), periodo?.trim() ?? undefined),
    enabled: enabled && !!ruc?.trim(),
    staleTime: 5 * 60_000,
  });
}

export function useBuscarContribuyentes(termino: string) {
  return useQuery({
    queryKey: ["ficha-ruc", "buscar", termino],
    queryFn: () => buscarContribuyentes(termino),
    enabled: termino.trim().length >= 2,
    staleTime: 60_000,
  });
}

export function useActualizarFicha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruc, datos }: { ruc: string; datos: Partial<FichaRuc> }) => actualizarFicha(ruc, datos),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["ficha-ruc"] });
    },
  });
}

export function useCompararContribuyentes(ruc1: string | null, ruc2: string | null) {
  return useQuery({
    queryKey: ["ficha-ruc", "comparar", ruc1, ruc2],
    queryFn: () => compararContribuyentes(ruc1!, ruc2!),
    enabled: !!ruc1?.trim() && !!ruc2?.trim() && ruc1 !== ruc2,
  });
}
