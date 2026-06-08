import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCancelaciones,
  fetchLineasAsiento,
  fetchMovimientoCaja,
  updateLineaAsiento,
  updateMovimientoCajaAudit,
} from "@/lib/cancelaciones-service";
import { updateTotalesAsiento } from "@/lib/cancelaciones-service";

export function useCancelacionesList(params: { ruc: string; periodo?: string | null }) {
  const qc = useQueryClient();
  const ruc = params.ruc.trim();

  const cancelacionesQuery = useQuery({
    queryKey: ["cancelaciones", ruc || null, params.periodo ?? null],
    queryFn: () => fetchCancelaciones({ ruc, periodo: params.periodo }),
    enabled: !!ruc,
  });

  const updateLinea = useMutation({
    mutationFn: updateLineaAsiento,
    onSuccess: async () => {
      // El recálculo de totales se invoca desde la UI (cuando edita una línea),
      // porque aquí no tenemos el asientoId sin acoplar el tipo de patch.
      await qc.invalidateQueries({ queryKey: ["cancelaciones"] });
      await qc.invalidateQueries({ queryKey: ["asiento-lineas"] });
    },
  });

  const updateMovimiento = useMutation({
    mutationFn: updateMovimientoCajaAudit,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cancelaciones"] });
      await qc.invalidateQueries({ queryKey: ["caja", "movimientos"] });
      await qc.invalidateQueries({ queryKey: ["caja-movimiento"] });
    },
  });

  return {
    cancelacionesQuery,
    updateLinea,
    updateMovimiento,
  };
}

export function useCancelacionDetails(params: { asientoId: string | null; movimientoId: string | null }) {
  const lineasQuery = useQuery({
    queryKey: ["asiento-lineas", params.asientoId],
    queryFn: () => fetchLineasAsiento(params.asientoId!),
    enabled: !!params.asientoId,
  });

  const movimientoQuery = useQuery({
    queryKey: ["caja-movimiento", params.movimientoId],
    queryFn: () => fetchMovimientoCaja(params.movimientoId!),
    enabled: !!params.movimientoId,
  });

  return { lineasQuery, movimientoQuery };
}

