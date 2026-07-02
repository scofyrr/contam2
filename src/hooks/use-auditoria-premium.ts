import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auditoriaService } from "@/modules/auditoria/services/auditoria-service";
import type { AuditoriaFilters } from "@/modules/auditoria/types/auditoria";

export function useAuditoriaRegistros(filters: AuditoriaFilters) {
  return useQuery({
    queryKey: ["auditoria", "registros", filters],
    queryFn: () => auditoriaService.buscarRegistros(filters),
    staleTime: 30_000,
  });
}

export function useAuditoriaDashboard() {
  return useQuery({
    queryKey: ["auditoria", "dashboard"],
    queryFn: () => auditoriaService.obtenerDashboardStats(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useAuditoriaResumen() {
  return useQuery({
    queryKey: ["auditoria", "resumen"],
    queryFn: () => auditoriaService.obtenerResumenActividad(24),
    refetchInterval: 5 * 60_000,
  });
}

export function useCambiosSensibles() {
  return useQuery({
    queryKey: ["auditoria", "sensibles"],
    queryFn: () => auditoriaService.obtenerCambiosSensibles(30),
    refetchInterval: 60_000,
  });
}

export function useAlertasAuditoria(noResueltas = true) {
  return useQuery({
    queryKey: ["auditoria", "alertas", noResueltas],
    queryFn: () => auditoriaService.obtenerAlertas(noResueltas),
    refetchInterval: 2 * 60_000,
  });
}

export function useActividadUsuario(userId: string | null, dias = 30) {
  return useQuery({
    queryKey: ["auditoria", "usuario", userId, dias],
    queryFn: () => auditoriaService.obtenerActividadUsuario(userId!, dias),
    enabled: !!userId,
  });
}

export function useEjecutarDeteccionPatrones() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => auditoriaService.ejecutarDeteccionPatrones(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["auditoria", "alertas"] });
      await qc.invalidateQueries({ queryKey: ["auditoria", "dashboard"] });
    },
  });
}

export function useResolverAlerta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertaId: string) => auditoriaService.resolverAlerta(alertaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["auditoria"] });
    },
  });
}
