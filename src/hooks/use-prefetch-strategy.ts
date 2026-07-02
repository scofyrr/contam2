import { useCallback, useRef } from "react";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export function usePrefetchOnHover<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  enabled = true,
) {
  const qc = useQueryClient();
  const prefetched = useRef(false);

  return useCallback(() => {
    if (!enabled || prefetched.current) return;
    const run = () => {
      prefetched.current = true;
      void qc.prefetchQuery({ queryKey, queryFn, staleTime: 60_000 });
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 100);
    }
  }, [enabled, qc, queryKey, queryFn]);
}

const ROUTE_PREFETCH: Record<string, QueryKey[]> = {
  "/sire-registros": [["sire-registros"]],
  "/libro-diario": [["libro_diario"]],
  "/libro-caja": [["libro_caja_bancos"]],
  "/tareas": [["tareas"]],
};

export function useRoutePrefetch(currentPath: string) {
  const qc = useQueryClient();

  const prefetchLikely = useCallback(() => {
    for (const [route, keys] of Object.entries(ROUTE_PREFETCH)) {
      if (route === currentPath) continue;
      for (const key of keys) {
        void qc.prefetchQuery({ queryKey: key, queryFn: async () => null, staleTime: 120_000 });
      }
    }
  }, [currentPath, qc]);

  return { prefetchLikely };
}
