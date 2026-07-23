import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  actualizarDestinoIgvCompra,
  fetchComprasPeriodo,
  fetchVentasPeriodo,
  obtenerResumenFiscalPeriodo,
} from "@/modules/compras-ventas/services/comprasVentasService";
import type {
  DestinoIgv,
  FiltrosTablaComprobantes,
} from "@/modules/compras-ventas/types/comprasVentas";
import { calcularCreditoFiscalIgv } from "@/modules/compras-ventas/utils/taxClassifier";

export const comprasVentasQueryKeys = {
  all: ["compras-ventas"] as const,
  compras: (
    contribuyenteId: string | null,
    periodo: string,
    filtros?: FiltrosTablaComprobantes,
  ) => ["compras-ventas", "compras", contribuyenteId, periodo, filtros ?? {}] as const,
  ventas: (
    contribuyenteId: string | null,
    periodo: string,
    filtros?: FiltrosTablaComprobantes,
  ) => ["compras-ventas", "ventas", contribuyenteId, periodo, filtros ?? {}] as const,
  resumen: (contribuyenteId: string | null, periodo: string) =>
    ["compras-ventas", "resumen", contribuyenteId, periodo] as const,
};

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

export function useCompras(
  contribuyenteId: string | null,
  periodo: string,
  filtros?: FiltrosTablaComprobantes,
  enabled = true,
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: comprasVentasQueryKeys.compras(contribuyenteId, periodoClean, filtros),
    queryFn: () => fetchComprasPeriodo(contribuyenteId!, periodoClean, filtros),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useVentas(
  contribuyenteId: string | null,
  periodo: string,
  filtros?: FiltrosTablaComprobantes,
  enabled = true,
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: comprasVentasQueryKeys.ventas(contribuyenteId, periodoClean, filtros),
    queryFn: () => fetchVentasPeriodo(contribuyenteId!, periodoClean, filtros),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useResumenFiscalPeriodo(
  contribuyenteId: string | null,
  periodo: string,
  enabled = true,
) {
  const periodoClean = cleanPeriodo(periodo);

  return useQuery({
    queryKey: comprasVentasQueryKeys.resumen(contribuyenteId, periodoClean),
    queryFn: () => obtenerResumenFiscalPeriodo(contribuyenteId!, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useActualizarDestinoIgv(contribuyenteId: string | null, periodo: string) {
  const qc = useQueryClient();
  const periodoClean = cleanPeriodo(periodo);

  return useMutation({
    mutationFn: ({
      compraId,
      nuevoDestino,
      factorProrrata,
    }: {
      compraId: string;
      nuevoDestino: DestinoIgv;
      factorProrrata?: number;
    }) => actualizarDestinoIgvCompra(compraId, nuevoDestino, factorProrrata),
    onMutate: async ({ compraId, nuevoDestino, factorProrrata = 0.5 }) => {
      await qc.cancelQueries({ queryKey: comprasVentasQueryKeys.all });

      const comprasKey = comprasVentasQueryKeys.compras(contribuyenteId, periodoClean);
      const previousCompras = qc.getQueriesData({ queryKey: comprasKey });

      qc.setQueriesData(
        { queryKey: ["compras-ventas", "compras", contribuyenteId, periodoClean] },
        (old: unknown) => {
          if (!Array.isArray(old)) return old;
          return old.map((c: { id: string; igv: number; baseImponible: number }) => {
            if (c.id !== compraId) return c;
            const calc = calcularCreditoFiscalIgv(c.baseImponible, c.igv, nuevoDestino, factorProrrata);
            return {
              ...c,
              destinoIgv: nuevoDestino,
              igvCreditoFiscal: calc.igvCreditoFiscal,
              igvCostoGasto: calc.igvCostoGasto,
            };
          });
        },
      );

      return { previousCompras };
    },
    onSuccess: async () => {
      toast.success("Destino IGV actualizado");
      await qc.invalidateQueries({ queryKey: comprasVentasQueryKeys.all });
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousCompras) {
        for (const [key, data] of context.previousCompras) {
          qc.setQueryData(key, data);
        }
      }
      toast.error(error.message || "No se pudo actualizar el destino IGV");
    },
  });
}
