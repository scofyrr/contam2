import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  auditarComprasAnomalias,
  enviarMensajeChatCopilot,
  fetchAnomaliasTributarias,
  fetchResumenAnomaliasPeriodo,
  marcarAnomaliaResuelta,
  registrarFeedbackAi,
  sugerirCuentaPcge,
} from "@/modules/ai-copilot/services/aiCopilotService";
import type { ChatMessage, FeedbackPayload } from "@/modules/ai-copilot/types/aiCopilot";

export const aiCopilotQueryKeys = {
  all: ["ai-copilot"] as const,
  anomalias: (contribuyenteId: string | null, periodo: string | null) =>
    ["ai-copilot", "anomalias", contribuyenteId, periodo] as const,
  resumen: (contribuyenteId: string | null, periodo: string | null) =>
    ["ai-copilot", "resumen", contribuyenteId, periodo] as const,
  sugerencia: (contribuyenteId: string | null, ruc: string, glosa: string) =>
    ["ai-copilot", "sugerencia", contribuyenteId, ruc, glosa] as const,
};

export function useSugerenciaPcge(
  contribuyenteId: string | null,
  ruc: string,
  glosa: string,
  razonSocial?: string,
  enabled = false,
) {
  return useQuery({
    queryKey: aiCopilotQueryKeys.sugerencia(contribuyenteId, ruc, glosa),
    queryFn: () => sugerirCuentaPcge(contribuyenteId!, ruc, glosa, razonSocial),
    enabled: enabled && !!contribuyenteId && glosa.trim().length >= 3,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAnomaliasTributarias(
  contribuyenteId: string | null,
  periodo: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: aiCopilotQueryKeys.anomalias(contribuyenteId, periodo),
    queryFn: () => fetchAnomaliasTributarias(contribuyenteId!, periodo ?? undefined),
    enabled: enabled && !!contribuyenteId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useResumenAnomalias(
  contribuyenteId: string | null,
  periodo: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: aiCopilotQueryKeys.resumen(contribuyenteId, periodo),
    queryFn: () => fetchResumenAnomaliasPeriodo(contribuyenteId!, periodo!),
    enabled: enabled && !!contribuyenteId && !!periodo,
    staleTime: 30_000,
  });
}

export function useAuditarCompras(contribuyenteId: string | null, periodo: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => auditarComprasAnomalias(contribuyenteId!, periodo!),
    onSuccess: async (result) => {
      toast.success(
        `Auditoría completada: ${result.resumen.total} anomalía(s) detectada(s)`,
      );
      await qc.invalidateQueries({ queryKey: aiCopilotQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error en auditoría fiscal IA");
    },
  });
}

export function useRegistrarFeedbackAi() {
  return useMutation({
    mutationFn: (payload: FeedbackPayload) => registrarFeedbackAi(payload),
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar feedback");
    },
  });
}

export function useMarcarAnomaliaResuelta(contribuyenteId: string | null, periodo: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (anomaliaId: string) => marcarAnomaliaResuelta(anomaliaId),
    onSuccess: async () => {
      toast.success("Anomalía marcada como resuelta");
      await qc.invalidateQueries({
        queryKey: aiCopilotQueryKeys.anomalias(contribuyenteId, periodo),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar anomalía");
    },
  });
}

export function useContamAiChat(contribuyenteId: string | null) {
  return useMutation({
    mutationFn: (messages: ChatMessage[]) =>
      enviarMensajeChatCopilot(messages, contribuyenteId ?? ""),
    onError: (error: Error) => {
      toast.error(error.message || "Error en chat CONTAM AI");
    },
  });
}
