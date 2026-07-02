import type { SupabaseClient } from "@supabase/supabase-js";
import { isPerformanceMonitoringEnabled, performanceMonitor } from "@/lib/performance-monitoring";

type QueryBuilder = ReturnType<SupabaseClient["from"]>;

function wrapQueryBuilder(
  builder: QueryBuilder,
  tableName: string,
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE",
  queryName: string,
): QueryBuilder {
  if (!isPerformanceMonitoringEnabled()) return builder;

  const proxy = new Proxy(builder, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original !== "function") return original;

      if (prop === "then") {
        return (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
          const start = performance.now();
          return (original as (fn?: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise<unknown>).call(
            target,
            (result: { data?: unknown[] | null; error?: Error | null; count?: number | null }) => {
              const ms = performance.now() - start;
              const rows = Array.isArray(result?.data) ? result.data.length : Number(result?.count ?? 0);
              performanceMonitor.registrarQuery({
                queryName,
                tableName,
                operation,
                executionTimeMs: Math.round(ms),
                rowsReturned: operation === "SELECT" ? rows : 0,
                rowsAffected: operation !== "SELECT" ? rows : 0,
                cacheHit: false,
                error: result?.error?.message,
              });
              return onFulfilled ? onFulfilled(result) : result;
            },
            onRejected,
          );
        };
      }

      return (...args: unknown[]) => {
        const next = (original as (...a: unknown[]) => unknown).apply(target, args);
        if (next && typeof next === "object") {
          return wrapQueryBuilder(next as QueryBuilder, tableName, operation, queryName);
        }
        return next;
      };
    },
  });

  return proxy;
}

export function createMonitoredSupabaseClient(client: SupabaseClient): SupabaseClient {
  if (!isPerformanceMonitoringEnabled()) return client;

  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === "from") {
        return (table: string) => {
          const builder = target.from(table);
          return wrapQueryBuilder(builder, table, "SELECT", `from:${table}`);
        };
      }
      if (prop === "rpc") {
        return async (fn: string, params?: Record<string, unknown>, options?: unknown) => {
          const start = performance.now();
          const result = await target.rpc(fn, params, options as never);
          performanceMonitor.registrarQuery({
            queryName: `rpc:${fn}`,
            tableName: fn,
            operation: "RPC",
            executionTimeMs: Math.round(performance.now() - start),
            rowsReturned: Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0,
            rowsAffected: 0,
            cacheHit: false,
            error: result.error?.message,
            metadata: params,
          });
          return result;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as SupabaseClient;
}
