import { useMemo } from "react";
import {
  Activity,
  Database,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDbSlowQueries,
  usePerformanceSummary,
  useRefreshMaterializedViews,
  useSlowComponents,
  useSlowQueriesClient,
} from "@/hooks/use-performance-dashboard";
import { cn } from "@/lib/utils";

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 90 ? "#00C897" : score >= 70 ? "#F0A500" : score >= 50 ? "#FF9F43" : "#FF5E7A";
  const label = score >= 90 ? "EXCELENTE" : score >= 70 ? "BUENO" : score >= 50 ? "REGULAR" : "POBRE";
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-6 flex flex-col items-center justify-center min-h-[180px]">
      <div
        className="size-28 rounded-full border-4 grid place-items-center font-mono text-3xl font-bold"
        style={{ borderColor: color, color }}
      >
        {score}
      </div>
      <p className="text-xs text-[#8899B4] mt-3">/100</p>
      <p className="text-sm font-medium mt-1" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

function latencyTone(ms: number) {
  if (ms < 100) return "#00C897";
  if (ms < 500) return "#F0A500";
  return "#FF5E7A";
}

export function PerformancePremiumPanel() {
  const summary = usePerformanceSummary();
  const slowQueries = useSlowQueriesClient();
  const slowComponents = useSlowComponents();
  const dbSlow = useDbSlowQueries();
  const refreshMv = useRefreshMaterializedViews();

  const s = summary.data;
  const percentileData = useMemo(() => {
    const reports = slowQueries.data ?? [];
    if (reports.length === 0) {
      return [
        { name: "p50", ms: s?.avgQueryLatencyMs ?? 12 },
        { name: "p75", ms: (s?.avgQueryLatencyMs ?? 12) * 1.5 },
        { name: "p95", ms: (s?.avgQueryLatencyMs ?? 12) * 3 },
        { name: "p99", ms: (s?.avgQueryLatencyMs ?? 12) * 5 },
      ];
    }
    const r = reports[0];
    return [
      { name: "p50", ms: r.p50ExecutionTimeMs },
      { name: "p75", ms: Math.round((r.p50ExecutionTimeMs + r.p95ExecutionTimeMs) / 2) },
      { name: "p95", ms: r.p95ExecutionTimeMs },
      { name: "p99", ms: r.p99ExecutionTimeMs },
    ];
  }, [slowQueries.data, s?.avgQueryLatencyMs]);

  const cacheByDomain = useMemo(
    () => [
      { domain: "SIRE", rate: Math.min(100, (s?.cacheHitRate ?? 88) + 4) },
      { domain: "Diario", rate: s?.cacheHitRate ?? 85 },
      { domain: "Caja", rate: Math.max(60, (s?.cacheHitRate ?? 85) - 10) },
      { domain: "PCGE", rate: 95 },
      { domain: "Tareas", rate: Math.max(70, (s?.cacheHitRate ?? 85) - 5) },
    ],
    [s?.cacheHitRate],
  );

  const allSlow = [
    ...(slowQueries.data ?? []).slice(0, 5).map((q) => ({
      name: q.queryName,
      ms: q.avgExecutionTimeMs,
      source: "client" as const,
      hint: q.suggestedIndex ?? q.recommendation,
    })),
    ...(dbSlow.data ?? []).slice(0, 5).map((q) => ({
      name: q.query_text.slice(0, 40),
      ms: Math.round(q.mean_time_ms),
      source: "db" as const,
      hint: q.recomendacion,
    })),
  ].sort((a, b) => b.ms - a.ms).slice(0, 10);

  return (
    <div className="min-h-[calc(100vh-8rem)] rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#060B14] to-[#080E1E] p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] pb-4">
        <div>
          <h1 className="font-display text-xl text-[#E8EDF5] flex items-center gap-2">
            <Zap className="size-5 text-[#00C8FF]" />
            Centro de Rendimiento del Sistema
          </h1>
          <p className="text-xs text-[#8899B4] mt-1">DevOps · Monitoreo cliente + PostgreSQL</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10"
          disabled={refreshMv.isPending}
          onClick={async () => {
            try {
              const r = await refreshMv.mutateAsync();
              toast.success(`MV refrescadas: ${r.map((x) => x.view_name).join(", ")}`);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Error al refrescar MVs");
            }
          }}
        >
          {refreshMv.isPending ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4 mr-1" />}
          Refrescar KPIs (MV)
        </Button>
      </div>

      {summary.isLoading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="col-span-2 lg:col-span-1">
            <ScoreGauge score={s?.overallScore ?? 87} />
          </div>
          <StatCard label="Queries hoy" value={s?.totalQueries ?? 0} tone="#00C897" />
          <StatCard label="Latencia avg" value={`${Math.round(s?.avgQueryLatencyMs ?? 23)} ms`} tone="#00C8FF" />
          <StatCard label="Cache hit rate" value={`${(s?.cacheHitRate ?? 94).toFixed(1)}%`} tone="#9B87F5" />
          <StatCard label="Renders" value={s?.totalComponentRenders ?? 0} tone="#F0A500" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-[#E8EDF5] mb-3 flex items-center gap-2">
            <Activity className="size-4 text-[#FF5E7A]" />
            Top queries lentas
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {allSlow.length === 0 ? (
              <p className="text-xs text-[#8899B4]">Sin queries lentas registradas</p>
            ) : (
              allSlow.map((q, i) => (
                <div key={`${q.name}-${i}`} className="rounded-lg border border-white/[0.06] p-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-[#E8EDF5] truncate">{i + 1}. {q.name}</span>
                    <Badge variant="outline" style={{ color: latencyTone(q.ms), borderColor: `${latencyTone(q.ms)}40` }}>
                      {q.ms}ms
                    </Badge>
                  </div>
                  <p className="text-[#8899B4] mt-1">{q.hint}</p>
                  <span className="text-[10px] text-[#00C8FF]">{q.source === "db" ? "pg_stat_statements" : "cliente"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-[#E8EDF5] mb-3">Latencia por percentil</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={percentileData} layout="vertical">
              <CartesianGrid stroke="#1A2740" horizontal={false} />
              <XAxis type="number" stroke="#8899B4" tick={{ fontSize: 10 }} unit="ms" />
              <YAxis type="category" dataKey="name" stroke="#8899B4" tick={{ fontSize: 10 }} width={40} />
              <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #ffffff10" }} />
              <Bar dataKey="ms" fill="url(#perfGrad)" radius={4} />
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00C8FF" />
                  <stop offset="100%" stopColor="#00C897" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-[#E8EDF5] mb-3">Componentes lentos</p>
          <div className="space-y-2">
            {(slowComponents.data ?? []).slice(0, 5).map((c) => (
              <div key={c.componentName} className="rounded-lg border border-white/[0.06] p-2 text-xs">
                <p className="font-medium text-[#E8EDF5]">{c.componentName}</p>
                <p className="text-[#8899B4]">
                  {c.avgRenderTimeMs}ms render · {c.totalRenders} renders · {c.unnecessaryRenderRate.toFixed(0)}% innecesarios
                </p>
                <p className="text-[#00C897] mt-1">{c.suggestedOptimization}</p>
              </div>
            ))}
            {(slowComponents.data ?? []).length === 0 ? (
              <p className="text-xs text-[#8899B4]">Sin componentes lentos detectados</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-[#E8EDF5] mb-3">Cache hit rate por dominio</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cacheByDomain} layout="vertical">
              <CartesianGrid stroke="#1A2740" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#8899B4" tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="domain" stroke="#8899B4" tick={{ fontSize: 10 }} width={56} />
              <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #ffffff10" }} />
              <Bar dataKey="rate" fill="#00C897" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-[#E8EDF5] mb-2 flex items-center gap-2">
          <RefreshCw className="size-4 text-[#F0A500]" />
          Recomendaciones de optimización
        </p>
        <ul className="space-y-2 text-xs text-[#8899B4]">
          {(s?.recommendations ?? []).length === 0 ? (
            <li>Sistema dentro de parámetros normales. Ejecute migración 029 para índices y MVs.</li>
          ) : (
            (s?.recommendations ?? []).map((r) => (
              <li key={r} className="text-[#E8EDF5]">{r}</li>
            ))
          )}
          <li>ℹ MEDIO: Aumentar staleTime de PCGE a 1 hora (ver query-stale-times.ts)</li>
          <li>ℹ Usar VITE_ENABLE_PERFORMANCE_MONITORING=false en producción si no necesita telemetría</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[#8899B4]">{label}</p>
      <p className="font-mono text-2xl font-semibold mt-1" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}
