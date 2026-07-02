import { useMemo } from "react";
import type { QueryKey } from "@tanstack/react-query";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { performanceMonitor } from "@/lib/performance-monitoring";

export function useQueryPerformance(queryKey: QueryKey): {
  executionTime: number;
  cacheHit: boolean;
  isSlow: boolean;
  isFetching: boolean;
} {
  const qc = useQueryClient();
  const isFetching = useIsFetching({ queryKey }) > 0;

  return useMemo(() => {
    const state = qc.getQueryState(queryKey);
    const dataUpdatedAt = state?.dataUpdatedAt ?? 0;
    const fetchedAt = state?.fetchStatus === "idle" && state.data !== undefined ? dataUpdatedAt : 0;
    const cacheHit = fetchedAt > 0 && !isFetching;

    const keyStr = JSON.stringify(queryKey);
    const session = performanceMonitor.getSession();
    const related = session?.queries.filter((q) => q.queryName.includes(keyStr.slice(0, 20))) ?? [];
    const executionTime =
      related.length > 0
        ? related.reduce((s, q) => s + q.executionTimeMs, 0) / related.length
        : state?.dataUpdateCount ? 0 : 0;

    return {
      executionTime: Math.round(executionTime),
      cacheHit,
      isSlow: executionTime > 500,
      isFetching,
    };
  }, [qc, queryKey, isFetching]);
}

export { usePerformanceMonitor } from "@/hooks/use-component-performance";
