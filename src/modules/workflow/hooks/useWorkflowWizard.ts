import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  fetchEstadoFlujoPeriodo,
  marcarPasoWorkflow,
} from "@/modules/workflow/services/workflowService";
import type { EstadoFlujoPeriodoResponse } from "@/modules/workflow/types/workflow";

export const workflowQueryKeys = {
  all: ["workflow"] as const,
  estado: (contribuyenteId: string | null, periodo: string | null) =>
    ["workflow", "estado", contribuyenteId, periodo] as const,
};

export function invalidateWorkflowQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contribuyenteId?: string | null,
  periodo?: string | null,
) {
  if (contribuyenteId && periodo) {
    void queryClient.invalidateQueries({
      queryKey: workflowQueryKeys.estado(contribuyenteId, periodo),
    });
  } else {
    void queryClient.invalidateQueries({ queryKey: workflowQueryKeys.all });
  }
}

export function useWorkflowWizard(
  contribuyenteId: string | null,
  periodo: string | null,
  enabled = true,
) {
  const queryClient = useQueryClient();
  const periodoClean = periodo?.replace(/\D/g, "").slice(0, 6) ?? "";
  const isReady = enabled && !!contribuyenteId && periodoClean.length === 6;

  const estadoQuery = useQuery({
    queryKey: workflowQueryKeys.estado(contribuyenteId, periodoClean),
    queryFn: () => fetchEstadoFlujoPeriodo(contribuyenteId!, periodoClean),
    enabled: isReady,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const marcarPasoMutation = useMutation({
    mutationFn: ({
      paso,
      completado,
    }: {
      paso: number;
      completado: boolean;
    }) => marcarPasoWorkflow(contribuyenteId!, periodoClean, paso, completado),
    onSuccess: () => {
      invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
      void queryClient.invalidateQueries({ queryKey: ["contabilidad"] });
      void queryClient.invalidateQueries({ queryKey: ["tesoreria"] });
      void queryClient.invalidateQueries({ queryKey: ["libro-mayor"] });
      void queryClient.invalidateQueries({ queryKey: ["compras-ventas"] });
    },
  });

  useEffect(() => {
    if (!isReady || !contribuyenteId) return;

    const channel = supabase
      .channel(`workflow-${contribuyenteId}-${periodoClean}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "periodos_cierre_status",
          filter: `contribuyente_id=eq.${contribuyenteId}`,
        },
        () => {
          invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "compras_rce",
          filter: `contribuyente_id=eq.${contribuyenteId}`,
        },
        () => {
          invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ventas_rvie",
          filter: `contribuyente_id=eq.${contribuyenteId}`,
        },
        () => {
          invalidateWorkflowQueries(queryClient, contribuyenteId, periodoClean);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [contribuyenteId, periodoClean, isReady, queryClient]);

  return {
    estado: estadoQuery.data as EstadoFlujoPeriodoResponse | undefined,
    isLoading: estadoQuery.isLoading,
    isFetching: estadoQuery.isFetching,
    isError: estadoQuery.isError,
    error: estadoQuery.error,
    refetch: estadoQuery.refetch,
    marcarPaso: marcarPasoMutation.mutateAsync,
    isMarcandoPaso: marcarPasoMutation.isPending,
  };
}
