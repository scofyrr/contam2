import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchConfigContable, updateConfigContable } from "@/lib/config-contable-service";

export function useConfigContable() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["config", "contable"],
    queryFn: fetchConfigContable,
  });

  const update = useMutation({
    mutationFn: updateConfigContable,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["config", "contable"] });
    },
  });

  return { query, update };
}

