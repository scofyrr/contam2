import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPcgeCuentas, setPcgeActivo, upsertPcgeCuenta } from "@/lib/pcge-service";

export function usePcge() {
  const qc = useQueryClient();

  const cuentasQuery = useQuery({
    queryKey: ["pcge", "cuentas"],
    queryFn: fetchPcgeCuentas,
  });

  const upsert = useMutation({
    mutationFn: upsertPcgeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pcge", "cuentas"] });
    },
  });

  const setActivo = useMutation({
    mutationFn: ({ codigo, activo }: { codigo: string; activo: boolean }) => setPcgeActivo(codigo, activo),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pcge", "cuentas"] });
    },
  });

  return { cuentasQuery, upsert, setActivo };
}

