import { useQuery } from "@tanstack/react-query";

import {
  fetchBalanceComprobacion,
  fetchLibroMayorF61,
} from "@/modules/libro-mayor/services/libroMayorService";
import type { NivelCuentaPcge } from "@/modules/libro-mayor/types/libroMayor";

export const libroMayorQueryKeys = {
  all: ["libro-mayor"] as const,
  f61: (
    contribuyenteId: string | null,
    periodo: string | null,
    nivel: number,
    filtro: string | null,
  ) => ["libro-mayor", "f61", contribuyenteId, periodo, nivel, filtro] as const,
  balance: (contribuyenteId: string | null, periodo: string | null) =>
    ["libro-mayor", "balance", contribuyenteId, periodo] as const,
};

export function useLibroMayorF61(
  contribuyenteId: string | null,
  periodo: string | null,
  nivelCuenta: NivelCuentaPcge = 4,
  cuentaFiltro?: string,
  enabled = true,
) {
  const periodoClean = periodo?.replace(/\D/g, "").slice(0, 6) ?? "";
  const filtro = cuentaFiltro?.trim() || null;

  return useQuery({
    queryKey: libroMayorQueryKeys.f61(contribuyenteId, periodoClean, nivelCuenta, filtro),
    queryFn: () =>
      fetchLibroMayorF61(contribuyenteId!, periodoClean, nivelCuenta, filtro ?? undefined),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useBalanceComprobacion(
  contribuyenteId: string | null,
  periodo: string | null,
  enabled = true,
) {
  const periodoClean = periodo?.replace(/\D/g, "").slice(0, 6) ?? "";

  return useQuery({
    queryKey: libroMayorQueryKeys.balance(contribuyenteId, periodoClean),
    queryFn: () => fetchBalanceComprobacion(contribuyenteId!, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
