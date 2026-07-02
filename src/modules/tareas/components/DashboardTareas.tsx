import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TareasEstadisticas } from "@/types/tareas";

const MODULO_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#64748b"];

type Props = {
  stats: TareasEstadisticas;
  loading?: boolean;
};

function KpiCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-semibold ${tone ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export function DashboardTareas({ stats, loading }: Props) {
  const pieData = [
    { name: "Pendientes", value: stats.pendientes, color: "#f59e0b" },
    { name: "En progreso", value: stats.en_progreso, color: "#3b82f6" },
    { name: "Completadas", value: stats.completadas, color: "#10b981" },
    { name: "Canceladas", value: stats.canceladas, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  const moduloData = Object.entries(stats.por_modulo).map(([name, value]) => ({ name, value }));

  if (loading) {
    return <p className="text-sm text-muted-foreground py-6">Cargando estadísticas…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="Total" value={stats.total} />
        <KpiCard label="Pendientes" value={stats.pendientes} tone="text-amber-600" />
        <KpiCard label="En progreso" value={stats.en_progreso} tone="text-blue-600" />
        <KpiCard label="Completadas" value={stats.completadas} tone="text-emerald-600" />
        <KpiCard label="Críticas" value={stats.criticas} tone="text-red-600" />
        <KpiCard label="Vencidas" value={stats.vencidas} tone="text-red-700" />
        <KpiCard label="Canceladas" value={stats.canceladas} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por estado</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tareas activas por módulo</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {moduloData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">Sin tareas activas</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduloData} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={4}>
                    {moduloData.map((_, i) => (
                      <Cell key={i} fill={MODULO_COLORS[i % MODULO_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
