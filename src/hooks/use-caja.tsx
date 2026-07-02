import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMovimientoCaja,
  ejecutarCentralizarPeriodo,
  fetchMovimientosCaja,
  fetchMovimientosSinCentralizar,
  updateMovimientoCaja,
} from "@/lib/caja-service";

export function useCaja(params: {
  ruc: string | null;
  periodo?: string | null;
  tipo_movimiento?: string | null;
  origen_documento?: string | null;
}) {
  const qc = useQueryClient();
  const ruc = params.ruc?.trim() ?? "";

  const movimientosQuery = useQuery({
    queryKey: [
      "caja",
      "movimientos",
      ruc || null,
      params.periodo ?? null,
      params.tipo_movimiento ?? null,
      params.origen_documento ?? null,
    ],
    queryFn: () =>
      fetchMovimientosCaja({
        ruc,
        periodo: params.periodo,
        tipo_movimiento: params.tipo_movimiento,
        origen_documento: params.origen_documento,
      }),
    enabled: !!ruc,
  });

  const pendientesCentralizarQuery = useQuery({
    queryKey: ["caja", "pendientes_centralizar", ruc || null, params.periodo ?? null],
    queryFn: () =>
      fetchMovimientosSinCentralizar({
        ruc,
        periodo: params.periodo?.trim() ?? "",
      }),
    enabled: !!ruc && !!params.periodo?.trim(),
  });

  const create = useMutation({
    mutationFn: createMovimientoCaja,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja", "movimientos"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateMovimientoCaja>[1] }) =>
      updateMovimientoCaja(id, patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja", "movimientos"] });
    },
  });

  const centralizar = useMutation({
    mutationFn: () =>
      ejecutarCentralizarPeriodo({
        ruc,
        periodo: params.periodo?.trim() ?? "",
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["caja"] });
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    },
  });

  return { movimientosQuery, pendientesCentralizarQuery, create, update, centralizar };
}

