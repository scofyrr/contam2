export type QueryOperation = "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "RPC";

export interface QueryMetric {
  id: string;
  queryName: string;
  tableName: string;
  operation: QueryOperation;
  executionTimeMs: number;
  rowsReturned: number;
  rowsAffected: number;
  cacheHit: boolean;
  timestamp: number;
  error?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export interface ComponentMetric {
  componentName: string;
  renderTimeMs: number;
  renderCount: number;
  unnecessaryRenders: number;
  mountTimeMs: number;
  updateTimeMs: number;
  memoryUsage?: number;
  timestamp: number;
}

export interface RouteMetric {
  routePath: string;
  loadTimeMs: number;
  timeToFirstByte: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  dataFetchTimeMs: number;
  renderTimeMs: number;
  timestamp: number;
}

export interface SlowQueryReport {
  queryName: string;
  tableName: string;
  avgExecutionTimeMs: number;
  p50ExecutionTimeMs: number;
  p95ExecutionTimeMs: number;
  p99ExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  totalExecutions: number;
  totalTimeMs: number;
  cacheHitRate: number;
  rowsReturnedAvg: number;
  lastExecuted: number;
  recommendation?: string;
  suggestedIndex?: string;
}

export interface SlowComponentReport {
  componentName: string;
  avgRenderTimeMs: number;
  maxRenderTimeMs: number;
  totalRenders: number;
  unnecessaryRenderRate: number;
  memoizationOpportunities: string[];
  suggestedOptimization: string;
}

export interface ErrorMetric {
  type: "QUERY_ERROR" | "RENDER_ERROR" | "ROUTE_ERROR" | "SCRIPT_ERROR";
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: number;
}

export interface PerformanceSummary {
  totalQueries: number;
  totalQueryTimeMs: number;
  slowestQuery: string;
  totalComponentRenders: number;
  slowestComponent: string;
  avgRouteLoadTimeMs: number;
  overallScore: number;
  recommendations: string[];
  cacheHitRate: number;
  avgQueryLatencyMs: number;
}

export interface MonitoringSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  userId: string;
  userAgent: string;
  queries: QueryMetric[];
  components: ComponentMetric[];
  routes: RouteMetric[];
  errors: ErrorMetric[];
  summary?: PerformanceSummary;
}

const SLOW_QUERY_MS = 500;
const MAX_METRICS = 2000;
const STORAGE_KEY = "contam-perf-session";

export function isPerformanceMonitoringEnabled(): boolean {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_ENABLE_PERFORMANCE_MONITORING === "false") {
    return false;
  }
  return typeof window !== "undefined";
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

function uuid(): string {
  return crypto.randomUUID?.() ?? `perf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class PerformanceMonitor {
  private session: MonitoringSession | null = null;
  private componentState = new Map<string, { lastPropsHash?: string; renders: number; unnecessary: number }>();
  private queryBuckets = new Map<string, number[]>();

  iniciarSesion(userId: string): string {
    if (!isPerformanceMonitoringEnabled()) return "disabled";
    this.session = {
      id: uuid(),
      startedAt: Date.now(),
      userId,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      queries: [],
      components: [],
      routes: [],
      errors: [],
    };
    this.setupWebVitals();
    return this.session.id;
  }

  finalizarSesion(): PerformanceSummary {
    const summary = this.obtenerResumenSesion();
    if (this.session) {
      this.session.endedAt = Date.now();
      this.session.summary = summary;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.session));
      } catch {
        /* quota */
      }
    }
    return summary;
  }

  registrarQuery(metric: Omit<QueryMetric, "id" | "timestamp">): void {
    if (!isPerformanceMonitoringEnabled() || !this.session) return;
    const entry: QueryMetric = { ...metric, id: uuid(), timestamp: Date.now() };
    this.pushBounded(this.session.queries, entry);
    const bucket = this.queryBuckets.get(metric.queryName) ?? [];
    bucket.push(metric.executionTimeMs);
    this.queryBuckets.set(metric.queryName, bucket.slice(-500));
    if (metric.executionTimeMs > SLOW_QUERY_MS && !metric.cacheHit) {
      console.warn(`[PERF] Query lenta: ${metric.queryName} (${metric.executionTimeMs}ms)`);
    }
  }

  registrarComponente(metric: Omit<ComponentMetric, "timestamp">): void {
    if (!isPerformanceMonitoringEnabled() || !this.session) return;
    this.pushBounded(this.session.components, { ...metric, timestamp: Date.now() });
    if (metric.renderCount > 0 && metric.renderCount % 10 === 0 && metric.renderTimeMs > 16) {
      console.warn(`[PERF] Componente con muchos renders: ${metric.componentName}`);
    }
  }

  registrarRuta(metric: Omit<RouteMetric, "timestamp">): void {
    if (!isPerformanceMonitoringEnabled() || !this.session) return;
    this.pushBounded(this.session.routes, { ...metric, timestamp: Date.now() });
  }

  registrarError(error: Omit<ErrorMetric, "timestamp">): void {
    if (!isPerformanceMonitoringEnabled() || !this.session) return;
    this.pushBounded(this.session.errors, { ...error, timestamp: Date.now() });
  }

  trackComponentRender(componentName: string, renderTimeMs: number, propsHash?: string): void {
    const state = this.componentState.get(componentName) ?? { renders: 0, unnecessary: 0 };
    state.renders += 1;
    if (propsHash && state.lastPropsHash === propsHash) {
      state.unnecessary += 1;
    }
    if (propsHash) state.lastPropsHash = propsHash;
    this.componentState.set(componentName, state);
    this.registrarComponente({
      componentName,
      renderTimeMs,
      renderCount: state.renders,
      unnecessaryRenders: state.unnecessary,
      mountTimeMs: renderTimeMs,
      updateTimeMs: renderTimeMs,
    });
  }

  obtenerResumenSesion(): PerformanceSummary {
    const queries = this.session?.queries ?? [];
    const components = this.session?.components ?? [];
    const routes = this.session?.routes ?? [];

    const totalQueryTimeMs = queries.reduce((s, q) => s + q.executionTimeMs, 0);
    const cacheHits = queries.filter((q) => q.cacheHit).length;
    const cacheHitRate = queries.length ? (cacheHits / queries.length) * 100 : 100;
    const avgQueryLatencyMs = queries.length ? totalQueryTimeMs / queries.length : 0;

    const slowestQuery = queries.reduce<QueryMetric | null>(
      (best, q) => (!best || q.executionTimeMs > best.executionTimeMs ? q : best),
      null,
    );

    const compMap = new Map<string, number>();
    for (const c of components) {
      compMap.set(c.componentName, (compMap.get(c.componentName) ?? 0) + c.renderTimeMs);
    }
    let slowestComponent = "";
    let maxComp = 0;
    for (const [name, ms] of compMap) {
      if (ms > maxComp) {
        maxComp = ms;
        slowestComponent = name;
      }
    }

    const avgRouteLoadTimeMs = routes.length
      ? routes.reduce((s, r) => s + r.loadTimeMs, 0) / routes.length
      : 0;

    const latencyScore = Math.max(0, 100 - avgQueryLatencyMs / 10);
    const cacheScore = cacheHitRate;
    const routeScore = Math.max(0, 100 - avgRouteLoadTimeMs / 50);
    const compScore = components.length
      ? Math.max(0, 100 - (components.reduce((s, c) => s + c.unnecessaryRenders, 0) / components.length) * 5)
      : 100;

    const overallScore = Math.round(
      latencyScore * 0.3 + cacheScore * 0.25 + routeScore * 0.25 + compScore * 0.2,
    );

    return {
      totalQueries: queries.length,
      totalQueryTimeMs,
      slowestQuery: slowestQuery?.queryName ?? "—",
      totalComponentRenders: components.reduce((s, c) => s + c.renderCount, 0),
      slowestComponent: slowestComponent || "—",
      avgRouteLoadTimeMs,
      overallScore,
      cacheHitRate,
      avgQueryLatencyMs,
      recommendations: this.buildRecommendations(queries, components),
    };
  }

  obtenerQueriesLentas(umbralMs = SLOW_QUERY_MS): SlowQueryReport[] {
    const grouped = new Map<string, QueryMetric[]>();
    for (const q of this.session?.queries ?? []) {
      const key = q.queryName;
      const list = grouped.get(key) ?? [];
      list.push(q);
      grouped.set(key, list);
    }

    const reports: SlowQueryReport[] = [];
    for (const [queryName, list] of grouped) {
      const times = list.map((q) => q.executionTimeMs);
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      if (avg < umbralMs) continue;
      const cacheHits = list.filter((q) => q.cacheHit).length;
      reports.push({
        queryName,
        tableName: list[0]?.tableName ?? "",
        avgExecutionTimeMs: Math.round(avg),
        p50ExecutionTimeMs: percentile(times, 50),
        p95ExecutionTimeMs: percentile(times, 95),
        p99ExecutionTimeMs: percentile(times, 99),
        maxExecutionTimeMs: Math.max(...times),
        totalExecutions: list.length,
        totalTimeMs: times.reduce((a, b) => a + b, 0),
        cacheHitRate: list.length ? (cacheHits / list.length) * 100 : 0,
        rowsReturnedAvg: list.reduce((s, q) => s + q.rowsReturned, 0) / list.length,
        lastExecuted: Math.max(...list.map((q) => q.timestamp)),
        recommendation: avg > 1000 ? "CRÍTICO: revisar índices y query plan" : "Considerar índice o caching",
        suggestedIndex: this.suggestIndex(list[0]?.tableName ?? ""),
      });
    }
    return reports.sort((a, b) => b.avgExecutionTimeMs - a.avgExecutionTimeMs);
  }

  obtenerComponentesLentos(umbralMs = 50): SlowComponentReport[] {
    const grouped = new Map<string, ComponentMetric[]>();
    for (const c of this.session?.components ?? []) {
      const list = grouped.get(c.componentName) ?? [];
      list.push(c);
      grouped.set(c.componentName, list);
    }
    const reports: SlowComponentReport[] = [];
    for (const [name, list] of grouped) {
      const times = list.map((c) => c.renderTimeMs);
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      if (avg < umbralMs && list.length < 20) continue;
      const unnecessary = list.reduce((s, c) => s + c.unnecessaryRenders, 0);
      const totalRenders = list.reduce((s, c) => s + c.renderCount, 0);
      reports.push({
        componentName: name,
        avgRenderTimeMs: Math.round(avg),
        maxRenderTimeMs: Math.max(...times),
        totalRenders,
        unnecessaryRenderRate: totalRenders ? (unnecessary / totalRenders) * 100 : 0,
        memoizationOpportunities: unnecessary > 5 ? ["React.memo", "useMemo para props derivadas"] : [],
        suggestedOptimization:
          avg > 100
            ? "Evaluar virtualización o división del componente"
            : unnecessary > 5
              ? "Implementar React.memo"
              : "Rendimiento aceptable",
      });
    }
    return reports.sort((a, b) => b.avgRenderTimeMs - a.avgRenderTimeMs);
  }

  getSession(): MonitoringSession | null {
    return this.session;
  }

  loadPersistedSession(): MonitoringSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as MonitoringSession;
    } catch {
      return null;
    }
  }

  private pushBounded<T>(arr: T[], item: T) {
    arr.push(item);
    if (arr.length > MAX_METRICS) arr.shift();
  }

  private suggestIndex(table: string): string | undefined {
    const map: Record<string, string> = {
      asientos_contables: "idx_asientos_sire_registro (sire_registro_id)",
      movimientos_caja: "idx_movimientos_ruc_periodo_fecha",
      registros_sire: "idx_sire_ruc_periodo",
      registros_sire_cabecera: "idx_sire_cab_ruc_periodo",
    };
    return map[table];
  }

  private buildRecommendations(queries: QueryMetric[], components: ComponentMetric[]): string[] {
    const recs: string[] = [];
    const slow = queries.filter((q) => q.executionTimeMs > SLOW_QUERY_MS && !q.cacheHit);
    if (slow.length > 0) {
      recs.push(`⚡ ${slow.length} query(s) lentas detectadas — revisar índices en migración 029`);
    }
    const lowCache = queries.length && queries.filter((q) => q.cacheHit).length / queries.length < 0.7;
    if (lowCache) {
      recs.push("ℹ Aumentar staleTime en dominios de lectura frecuente (PCGE, contribuyentes)");
    }
    const heavy = components.filter((c) => c.unnecessaryRenders > 10);
    if (heavy.length > 0) {
      recs.push(`⚡ ${heavy[0]?.componentName}: implementar React.memo`);
    }
    return recs;
  }

  private setupWebVitals() {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const nav = entry as PerformanceNavigationTiming;
            this.registrarRuta({
              routePath: window.location.pathname,
              loadTimeMs: nav.loadEventEnd - nav.startTime,
              timeToFirstByte: nav.responseStart - nav.requestStart,
              timeToInteractive: nav.domInteractive - nav.startTime,
              firstContentfulPaint: 0,
              largestContentfulPaint: 0,
              cumulativeLayoutShift: 0,
              firstInputDelay: 0,
              dataFetchTimeMs: nav.responseEnd - nav.requestStart,
              renderTimeMs: nav.domComplete - nav.domInteractive,
            });
          }
        }
      });
      po.observe({ type: "navigation", buffered: true });
    } catch {
      /* noop */
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
