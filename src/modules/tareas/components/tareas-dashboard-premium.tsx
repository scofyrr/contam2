import { useMemo, useState } from "react";
import {
  Bar,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTareasAutoGenerator } from "@/hooks/use-tareas-auto-generator";
import type { TareaPendiente, TareasEstadisticas } from "@/types/tareas";

const MODULO_COLORS: Record<string, string> = {
  sire: "#00C8FF",
  asientos: "#00C897",
  caja: "#9B87F5",
  general: "#FF5E7A",
  pcge: "#8899B4",
  contribuyentes: "#F5A623",
  cxc_cxp: "#FF5E7A",
};

type ExtendedStats = TareasEstadisticas & {
  efectividad_pct?: number;
  por_mes?: { mes: string; generadas: number; completadas: number }[];
  proyeccion_proximo_mes?: number;
};

function KpiCard({
  label,
  value,
  suffix,
  trend,
  tone,
  progress,
  loading,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  trend?: number;
  tone?: string;
  progress?: number;
  loading?: boolean;
}) {
  if (loading) return <Skeleton className="h-28 rounded-xl bg-white/5" />;
  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-all duration-300 hover:scale-[1.02]"
      style={{ borderBottomWidth: 2, borderBottomColor: tone ?? "#00C8FF" }}
    >
      <p className="text-xs text-[#8899B4]">{label}</p>
      <p className={cn("text-3xl font-semibold tabular-nums mt-1", tone && `text-[${tone}]`)}>
        {value}
        {suffix ? <span className="text-lg ml-1">{suffix}</span> : null}
      </p>
      {trend !== undefined ? (
        <p className={cn("text-xs mt-1 flex items-center gap-1", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
          {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(trend)}% vs semana anterior
        </p>
      ) : null}
      {progress !== undefined ? <Progress value={progress} className="h-1.5 mt-2" /> : null}
    </div>
  );
}

function ActivityHeatmap({ tareas }: { tareas: TareaPendiente[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const grid = useMemo(() => {
    const base = new Date();
    base.setMonth(base.getMonth() - monthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const counts = new Map<number, number>();
    for (const t of tareas) {
      const d = t.plazo_vencimiento ?? t.created_at?.slice(0, 10);
      if (!d) continue;
      const dt = new Date(d);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        counts.set(dt.getDate(), (counts.get(dt.getDate()) ?? 0) + 1);
      }
    }
    return { year, month, daysInMonth, counts };
  }, [tareas, monthOffset]);

  const intensity = (n: number) => {
    if (n === 0) return "bg-white/[0.02]";
    if (n <= 2) return "bg-cyan-500/20";
    if (n <= 5) return "bg-cyan-500/40";
    if (n <= 10) return "bg-cyan-500/60";
    return "bg-[#C8A44D]/60";
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Heatmap de actividad</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7" onClick={() => setMonthOffset((m) => m + 1)}>
            ←
          </Button>
          <Button variant="ghost" size="sm" className="h-7" onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}>
            →
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: grid.daysInMonth }, (_, i) => {
          const day = i + 1;
          const count = grid.counts.get(day) ?? 0;
          return (
            <div
              key={day}
              title={`${count} tareas`}
              className={cn("aspect-square rounded-sm text-[9px] flex items-center justify-center", intensity(count))}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildSugerencias(tareas: TareaPendiente[], sugeridas: number): string[] {
  const tips: string[] = [];
  const criticas = tareas.filter((t) => t.critica && t.estado === "pendiente").length;
  if (criticas >= 3) {
    tips.push(`Si completas ${Math.min(3, criticas)} tareas críticas hoy, reduces ~40% la carga de la semana.`);
  }
  const caja = tareas.filter((t) => t.modulo_origen === "caja" && t.estado === "pendiente");
  if (caja.length) {
    tips.push(`La centralización de caja tiene ${caja.length} recordatorio(s) pendiente(s).`);
  }
  const porRuc = tareas.reduce<Record<string, number>>((acc, t) => {
    if (t.ruc) acc[t.ruc] = (acc[t.ruc] ?? 0) + 1;
    return acc;
  }, {});
  const topRuc = Object.entries(porRuc).sort((a, b) => b[1] - a[1])[0];
  if (topRuc && topRuc[1] > 2) {
    tips.push(`El RUC ${topRuc[0]} concentra ${Math.round((topRuc[1] / tareas.length) * 100)}% de tus tareas activas.`);
  }
  if (sugeridas > 0) {
    tips.push(`El motor detectó ${sugeridas} tarea(s) sugerida(s) automáticamente. Revísalas en el panel inferior.`);
  }
  if (!tips.length) tips.push("Los lunes sueles tener mayor carga. Agenda tiempo para tareas SIRE ese día.");
  return tips;
}

export default function TareasDashboardPremium({
  stats,
  extended,
  tareas,
  loading,
  ruc,
  periodo,
}: {
  stats: TareasEstadisticas;
  extended?: ExtendedStats;
  tareas: TareaPendiente[];
  loading?: boolean;
  ruc?: string;
  periodo?: string;
}) {
  const { tareasSugeridas, generarTareas, generando, aceptarSugerida } = useTareasAutoGenerator(ruc, periodo);

  const activas = tareas.filter((t) => !["completada", "cancelada"].includes(t.estado));
  const efectividad = extended?.efectividad_pct ?? Math.round((stats.completadas / Math.max(stats.total, 1)) * 100);

  const cargaData = useMemo(() => {
    const meses = extended?.por_mes ?? [];
    if (meses.length) {
      return meses.map((m) => ({
        mes: m.mes.slice(5),
        completadas: m.completadas,
        generadas: m.generadas,
        proyeccion: Math.round(m.generadas * 1.1),
      }));
    }
    return [
      { mes: "Ene", completadas: stats.completadas, generadas: stats.pendientes + stats.completadas, proyeccion: 0 },
      { mes: "Actual", completadas: stats.completadas, generadas: stats.pendientes, proyeccion: extended?.proyeccion_proximo_mes ?? stats.pendientes },
    ];
  }, [extended, stats]);

  const moduloData = Object.entries(stats.por_modulo).map(([name, value]) => ({ name, value }));
  const totalMod = moduloData.reduce((s, d) => s + d.value, 0) || 1;

  const hoy = new Date().toISOString().slice(0, 10);
  const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const vencenHoy = activas.filter((t) => t.plazo_vencimiento === hoy).length;
  const vencenManana = activas.filter((t) => t.plazo_vencimiento === manana).length;
  const vencenSemana = activas.filter((t) => {
    if (!t.plazo_vencimiento) return false;
    const diff = (new Date(t.plazo_vencimiento).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 7;
  }).length;

  const sugerencias = buildSugerencias(activas, tareasSugeridas.length);

  return (
    <div className="space-y-6 rounded-2xl bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6 border border-white/[0.06]">
      <header>
        <h2 className="text-xl font-semibold text-[#E8EDF5]">Centro de Operaciones Contables</h2>
        <p className="text-xs text-[#8899B4] mt-1">Dashboard predictivo · motor de tareas inteligentes</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Pendientes"
          value={stats.pendientes + stats.en_progreso}
          trend={stats.pendientes > 10 ? 20 : -10}
          tone="#00C8FF"
          loading={loading}
        />
        <KpiCard label="Vencidas" value={stats.vencidas} tone={stats.vencidas > 0 ? "#FF4757" : "#00C897"} loading={loading} />
        <KpiCard label="Críticas" value={stats.criticas} tone="#FF4757" loading={loading} />
        <KpiCard label="Efectividad" value={`${efectividad}%`} progress={efectividad} tone="#00C897" loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 h-72">
          <h3 className="text-sm font-semibold mb-2">Carga de trabajo</h3>
          {loading ? (
            <Skeleton className="h-full bg-white/5" />
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={cargaData}>
                <XAxis dataKey="mes" tick={{ fill: "#8899B4", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8899B4", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #1A2740" }} />
                <Bar dataKey="completadas" fill="url(#gradCyan)" radius={4} name="Completadas" />
                <Bar dataKey="generadas" fill="#8899B460" radius={4} name="Generadas" />
                <Line type="monotone" dataKey="proyeccion" stroke="#C8A44D" strokeDasharray="4 4" dot={false} name="Proyección" />
                <defs>
                  <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C8FF" />
                    <stop offset="100%" stopColor="#00C897" />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <ActivityHeatmap tareas={tareas} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 h-64">
          <h3 className="text-sm font-semibold mb-2">Distribución por módulo</h3>
          {moduloData.length === 0 ? (
            <p className="text-sm text-[#8899B4] text-center py-12">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={moduloData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} label={({ name, value }) => `${name} ${Math.round((value / totalMod) * 100)}%`}>
                  {moduloData.map((d) => (
                    <Cell key={d.name} fill={MODULO_COLORS[d.name] ?? "#8899B4"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold mb-3">Próximos vencimientos</h3>
          <div className="space-y-3">
            {[
              { label: "Hoy", count: vencenHoy, alert: vencenHoy > 0 && stats.criticas > 0 },
              { label: "Mañana", count: vencenManana, alert: false },
              { label: "Esta semana", count: vencenSemana, alert: false },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={cn(s.alert && "text-[#FF4757] animate-pulse")}>{s.label}</span>
                  <span>{s.count} tareas</span>
                </div>
                <Progress value={Math.min(100, s.count * 15)} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Lightbulb className="size-4 text-[#C8A44D]" />
          Sugerencias inteligentes
        </h3>
        <ul className="space-y-2 text-sm text-[#8899B4]">
          {sugerencias.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span>•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {tareasSugeridas.length > 0 && (
        <div className="rounded-xl border border-[#00C8FF]/30 bg-[#00C8FF]/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold">{tareasSugeridas.length} tareas sugeridas por el motor</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => generarTareas(false)} disabled={generando}>
                Re-evaluar
              </Button>
              <Button size="sm" onClick={() => generarTareas(true)} disabled={generando}>
                Generar todas
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tareasSugeridas.slice(0, 5).map((s) => (
              <div key={s.hashDeduplicacion} className="flex items-start justify-between gap-2 text-xs border border-white/[0.05] rounded-lg p-2">
                <div>
                  <p className="font-medium text-[#E8EDF5]">{s.titulo}</p>
                  <p className="text-[#8899B4]">{s.descripcion}</p>
                  <Badge variant="outline" className="text-[9px] mt-1">{s.reglaGeneradora}</Badge>
                </div>
                <Button size="sm" variant="ghost" className="h-7 shrink-0" onClick={() => void aceptarSugerida(s)}>
                  Aceptar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
