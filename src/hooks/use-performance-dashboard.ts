import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { performanceMonitor } from "@/lib/performance-monitoring";
import { useSession } from "@/hooks/use-session";

type DbSlowQuery = {
  query_text: string;
  calls: number;
  mean_time_ms: number;
  max_time_ms: number;
  cache_hit_ratio: number;
  recomendacion: string;
};

export function usePerformanceSummary() {
  return useQuery({
    queryKey: ["performance", "summary"],
    queryFn: () => {
      const live = performanceMonitor.obtenerResumenSesion();
      const persisted = performanceMonitor.loadPersistedSession()?.summary;
      return persisted ?? live;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useSlowQueriesClient() {
  return useQuery({
    queryKey: ["performance", "slow-queries-client"],
    queryFn: () => performanceMonitor.obtenerQueriesLentas(100),
    refetchInterval: 30_000,
  });
}

export function useSlowComponents() {
  return useQuery({
    queryKey: ["performance", "slow-components"],
    queryFn: () => performanceMonitor.obtenerComponentesLentos(30),
    refetchInterval: 30_000,
  });
}

export function useDbSlowQueries() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["performance", "slow-queries-db"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("rpc_analyze_slow_queries", { p_horas: 24 });
      if (error) return [] as DbSlowQuery[];
      return (data ?? []) as DbSlowQuery[];
    },
    staleTime: 5 * 60_000,
    enabled: !!user?.id,
  });
}

export function useRefreshMaterializedViews() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("rpc_refresh_materialized_views");
      if (error) throw error;
      return data as Array<{ view_name: string; refreshed_at: string; duration_ms: number }>;
    },
  });
}

export function useMvDashboardStats(ruc: string | null, periodo: string | null) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["performance", "mv-dashboard", ruc, periodo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("rpc_get_mv_dashboard_stats", {
        p_ruc: ruc!,
        p_periodo: periodo!,
      });
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!ruc && !!periodo && !!user?.id,
    staleTime: 5 * 60_000,
  });
}
