import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "@/hooks/query-stale-times";
import { adminMetricsService } from "@/modules/admin/services/admin-metrics-service";
import { useSession } from "@/hooks/use-session";
import { usePermissions } from "@/hooks/use-permissions";

function useAdminEnabled(): boolean {
  const { tiene } = usePermissions();
  return tiene("dashboard.configurar");
}

export function useAdminKPIs() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "kpis", user?.id],
    queryFn: () => adminMetricsService.getEstudioKPIs(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 2 * 60_000,
    refetchInterval: 2 * 60_000,
  });
}

export function useRendimientoContadores() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "rendimiento", user?.id],
    queryFn: () => adminMetricsService.getRendimientoContadores(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
  });
}

export function useAdminGraficos() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "graficos", user?.id],
    queryFn: () => adminMetricsService.getGraficos(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 10 * 60_000,
  });
}

export function useAdminAlertas() {
  const { user } = useSession();
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "alertas", user?.id],
    queryFn: () => adminMetricsService.getAlertasEstudio(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: STALE_TIMES.TAREAS_PENDIENTES,
    refetchInterval: 60_000,
  });
}

export function useAdminActividad(limit = 10) {
  const enabled = useAdminEnabled();
  return useQuery({
    queryKey: ["admin", "actividad", limit],
    queryFn: () => adminMetricsService.getActividadReciente(limit),
    enabled,
    staleTime: STALE_TIMES.AUDITORIA_RECIENTE,
    refetchInterval: 60_000,
  });
}
