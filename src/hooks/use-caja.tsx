import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMovimientoCaja, fetchMovimientosCaja, updateMovimientoCaja } from "@/lib/caja-service";

export function useCaja(params: { ruc?: string | null; periodo?: string | null }) {
  const qc = useQueryClient();

  const movimientosQuery = useQuery({
    queryKey: ["caja", "movimientos", params.ruc ?? null, params.periodo ?? null],
    queryFn: () => fetchMovimientosCaja(params),
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

  return { movimientosQuery, create, update };
}

