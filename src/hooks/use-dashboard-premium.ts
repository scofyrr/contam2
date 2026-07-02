import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "@/hooks/query-stale-times";
import {
  adminDashboardService,
  contadorDashboardService,
} from "@/modules/dashboard/services/dashboard-service";
import { useSession } from "@/hooks/use-session";
import { usePermissions } from "@/hooks/use-permissions";

export function useIsAdminDashboard(): boolean {
  const { tiene } = usePermissions();
  return tiene("dashboard.configurar");
}

export function useEstudioMetrics() {
  const { user } = useSession();
  const isAdmin = useIsAdminDashboard();
  return useQuery({
    queryKey: ["dashboard", "admin", "metrics", user?.id],
    queryFn: () => adminDashboardService.getEstudioMetrics(user!.id),
    enabled: !!user?.id && isAdmin,
    staleTime: STALE_TIMES.DASHBOARD_KPIS,
    refetchInterval: 60_000,
  });
}

export function useContadoresPerformance() {
  const { user } = useSession();
  const isAdmin = useIsAdminDashboard();
  return useQuery({
    queryKey: ["dashboard", "admin", "contadores", user?.id],
    queryFn: () => adminDashboardService.getContadoresPerformance(user!.id),
    enabled: !!user?.id && isAdmin,
    staleTime: STALE_TIMES.DASHBOARD_KPIS,
  });
}

export function useFacturacionMensual(meses = 12) {
  const isAdmin = useIsAdminDashboard();
  return useQuery({
    queryKey: ["dashboard", "admin", "facturacion", meses],
    queryFn: () => adminDashboardService.getFacturacionMensual(meses),
    enabled: isAdmin,
    staleTime: STALE_TIMES.DASHBOARD_KPIS,
  });
}

export function useTareasPorContador() {
  const { user } = useSession();
  const isAdmin = useIsAdminDashboard();
  return useQuery({
    queryKey: ["dashboard", "admin", "tareas-contador", user?.id],
    queryFn: () => adminDashboardService.getTareasPorContador(user!.id),
    enabled: !!user?.id && isAdmin,
    staleTime: STALE_TIMES.TAREAS_PENDIENTES,
  });
}

export function useAlertasEstudio() {
  const { user } = useSession();
  const isAdmin = useIsAdminDashboard();
  return useQuery({
    queryKey: ["dashboard", "admin", "alertas", user?.id],
    queryFn: () => adminDashboardService.getAlertasEstudio(user!.id),
    enabled: !!user?.id && isAdmin,
    staleTime: STALE_TIMES.TAREAS_PENDIENTES,
    refetchInterval: 60_000,
  });
}

export function useActividadEstudio(limit = 20) {
  const isAdmin = useIsAdminDashboard();
  return useQuery({
    queryKey: ["dashboard", "admin", "actividad", limit],
    queryFn: () => adminDashboardService.getActividadReciente(limit),
    enabled: isAdmin,
    staleTime: STALE_TIMES.AUDITORIA_RECIENTE,
    refetchInterval: 60_000,
  });
}

export function usePersonalMetrics(enabled = true, refreshInterval = 30) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "metrics", user?.id],
    queryFn: () => contadorDashboardService.getPersonalMetrics(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useTareasUrgentesDashboard(enabled = true, refreshInterval = 30) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "urgentes", user?.id],
    queryFn: () => contadorDashboardService.getTareasUrgentes(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useClientesAsignados(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "clientes", user?.id],
    queryFn: () => contadorDashboardService.getClientesAsignados(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useCargaTrabajo(semanas = 4, enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "carga", user?.id, semanas],
    queryFn: () => contadorDashboardService.getCargaTrabajo(user!.id, semanas),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useSugerenciasInteligentes(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "sugerencias", user?.id],
    queryFn: () => contadorDashboardService.getSugerencias(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useLogrosPersonales(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "logros", user?.id],
    queryFn: () => contadorDashboardService.getLogros(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useActividadPersonal(limit = 10, enabled = true, refreshInterval = 30) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "actividad", user?.id, limit],
    queryFn: () => contadorDashboardService.getActividadPersonal(user!.id, limit),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useFacturacionMensualPersonal(enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "facturacion-mes", user?.id],
    queryFn: () => contadorDashboardService.getFacturacionMensualPersonal(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}

export function useProximosVencimientos(dias = 7, enabled = true, refreshInterval = 60) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["dashboard", "contador", "proximos-venc", user?.id, dias],
    queryFn: () => contadorDashboardService.getProximosVencimientos(user!.id, dias),
    enabled: !!user?.id && enabled,
    staleTime: 5 * 60_000,
    refetchInterval: enabled && refreshInterval > 0 ? refreshInterval * 1000 : false,
  });
}
