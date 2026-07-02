import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Crown,
  Download,
  RefreshCw,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DashboardKpiCard,
  DashboardSection,
  formatSoles,
} from "@/modules/dashboard/components/dashboard-shared";
import { relativeTime } from "@/modules/dashboard/services/dashboard-service";
import type { ContadorPerformance } from "@/modules/dashboard/types/dashboard";
import {
  useAdminActividad,
  useAdminAlertas,
  useAdminGraficos,
  useAdminKPIs,
  useRendimientoContadores,
} from "@/hooks/use-admin-metrics";
import { useSession } from "@/hooks/use-session";
import { FinancialAmount } from "@/components/accessibility/financial-amount";

type SortKey = "nombre" | "clientesAsignados" | "tareasPendientes" | "tareasCompletadas" | "efectividad" | "tareasVencidas";

const ESTADO_ICON: Record<string, string> = {
  ACTIVO: "🟢",
  AUSENTE: "🟡",
  INACTIVO: "🔴",
};

function efectividadColor(pct: number, meta = 90): string {
  if (pct >= meta) return "#00C897";
  if (pct >= 70) return "#F0A500";
  return "#FF5E7A";
}

function ContadorRow({
  c,
  isTop,
}: {
  c: ContadorPerformance;
  isTop: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b border-white/[0.04] text-sm transition-colors",
        isTop && "ring-1 ring-[#C8A95A]/40 bg-[#C8A95A]/5",
        c.cargaTrabajo === "CRITICA" && "bg-red-500/5",
        c.cargaTrabajo === "ALTA" && !isTop && "bg-amber-500/5",
      )}
    >
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          {isTop && <Star className="size-3.5 text-[#C8A95A] shrink-0" />}
          <div>
            <div className="font-medium text-[#E8EDF5]">{c.nombre}</div>
            <div className="text-[10px] text-[#8899B4]">{c.rol}</div>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-2 text-center tabular-nums">{c.clientesAsignados}</td>
      <td className="py-2.5 px-2 text-center tabular-nums">{c.tareasPendientes}</td>
      <td className="py-2.5 px-2 text-center tabular-nums">{c.tareasCompletadas}</td>
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-2 min-w-[100px]">
          <Progress value={c.efectividad} className="h-1.5 flex-1" />
          <span className="text-xs tabular-nums" style={{ color: efectividadColor(c.efectividad) }}>
            {c.efectividad}%
          </span>
        </div>
      </td>
      <td className={cn("py-2.5 px-2 text-center tabular-nums", c.tareasVencidas > 0 && "text-red-400 font-semibold")}>
        {c.tareasVencidas > 0 ? `${c.tareasVencidas} 🔴` : "0 🟢"}
      </td>
      <td className="py-2.5 px-2 text-center">
        <span title={c.estado}>
          {ESTADO_ICON[c.estado] ?? "○"} {c.estado === "ACTIVO" && c.efectividad >= 90 ? "⭐" : ""}
        </span>
      </td>
      <td className="py-2.5 pl-2">
        <Button variant="ghost" size="sm" className="h-7 text-xs text-[#C8A95A]" asChild>
          <Link to="/admin/usuarios">Ver detalle</Link>
        </Button>
      </td>
    </tr>
  );
}

export function DashboardAdminPremium() {
  const { user } = useSession();
  const kpis = useAdminKPIs();
  const contadores = useRendimientoContadores();
  const graficos = useAdminGraficos();
  const alertas = useAdminAlertas();
  const actividad = useAdminActividad(10);

  const [sortKey, setSortKey] = useState<SortKey>("efectividad");
  const [sortAsc, setSortAsc] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const adminName = user?.user_metadata?.nombre ?? user?.email?.split("@")[0] ?? "Admin";
  const m = kpis.data;

  const sortedContadores = useMemo(() => {
    let rows = [...(contadores.data ?? [])];
    if (filtroEstado !== "todos") {
      rows = rows.filter((c) => c.estado === filtroEstado);
    }
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return rows;
  }, [contadores.data, sortKey, sortAsc, filtroEstado]);

  const topEfectividadId = useMemo(() => {
    const rows = contadores.data ?? [];
    if (!rows.length) return null;
    return [...rows].sort((a, b) => b.efectividad - a.efectividad)[0]?.userId ?? null;
  }, [contadores.data]);

  const chartFact = useMemo(
    () =>
      (graficos.data?.facturacionMensual ?? []).map((f) => ({
        mes: f.mes.length >= 6 ? `${f.mes.slice(4, 6)}/${f.mes.slice(2, 4)}` : f.mes,
        monto: f.monto,
      })),
    [graficos.data],
  );

  const chartClientes = graficos.data?.clientesPorContador ?? [];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const estadoSistema = m?.estadoSistema ?? "NORMAL";
  const estadoLabel =
    estadoSistema === "CRITICO" ? "🔴 Crítico" : estadoSistema === "ATENCION" ? "🟡 Atención" : "🟢 Normal";

  return (
    <div className="min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C8A95A]">
            <Crown className="size-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Centro de Control</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-[#E8EDF5] mt-1">
            Estudio Contable
          </h1>
          <p className="text-sm text-[#8899B4] mt-1">
            Admin: {adminName} · {new Date().toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-[#C8A95A]/30 text-[#C8A95A]" asChild>
            <Link to="/admin/performance">
              <Settings className="size-3.5 mr-1.5" />
              Configuración
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => void kpis.refetch()}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" disabled>
            <Download className="size-3.5 mr-1.5" />
            Exportar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <DashboardKpiCard
          label="Contadores activos"
          value={m?.contadoresActivos ?? "—"}
          sublabel={`de ${m?.totalContadores ?? 0} total`}
          trend={2}
          accentColor="#C8A95A"
          loading={kpis.isLoading}
        />
        <DashboardKpiCard
          label="Clientes activos"
          value={m?.clientesActivos ?? "—"}
          sublabel={`de ${m?.totalClientes ?? 0} RUCs`}
          trend={5}
          accentColor="#60A5FA"
          loading={kpis.isLoading}
        />
        <DashboardKpiCard
          label="Facturación mensual"
          value={m ? formatSoles(m.facturacionMensual) : "—"}
          trend={12}
          accentColor="#C8A95A"
          loading={kpis.isLoading}
        />
        <DashboardKpiCard
          label="Efectividad estudio"
          value={m ? `${m.efectividadPromedio}%` : "—"}
          trend={2}
          accentColor="#00C897"
          loading={kpis.isLoading}
        />
        <DashboardKpiCard
          label="Estado del sistema"
          value={estadoLabel}
          sublabel={
            m
              ? `${m.alertasSeguridad} alertas · ${m.contadoresInactivos} inactivos`
              : undefined
          }
          accentColor={estadoSistema === "CRITICO" ? "#FF5E7A" : estadoSistema === "ATENCION" ? "#F0A500" : "#00C897"}
          loading={kpis.isLoading}
          pulse={estadoSistema === "CRITICO"}
        />
      </div>

      <DashboardSection
        title="Rendimiento por contador"
        icon={<Users className="size-4 text-[#C8A95A]" />}
        action={
          <div className="flex gap-1">
            {(["todos", "ACTIVO", "AUSENTE", "INACTIVO"] as const).map((f) => (
              <Button
                key={f}
                variant={filtroEstado === f ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => setFiltroEstado(f)}
              >
                {f === "todos" ? "Todos" : f}
              </Button>
            ))}
          </div>
        }
      >
        {contadores.isLoading ? (
          <Skeleton className="h-48 rounded-lg bg-white/5" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-[10px] text-[#8899B4] uppercase tracking-wide">
                  {(
                    [
                      ["nombre", "Contador"],
                      ["clientesAsignados", "Clientes"],
                      ["tareasPendientes", "Tareas"],
                      ["tareasCompletadas", "Complet."],
                      ["efectividad", "Efect."],
                      ["tareasVencidas", "Vencidas"],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <th key={key} className="pb-2 text-left cursor-pointer hover:text-[#E8EDF5]" onClick={() => toggleSort(key)}>
                      {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
                    </th>
                  ))}
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedContadores.map((c) => (
                  <ContadorRow key={c.userId} c={c} isTop={c.userId === topEfectividadId} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>

      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardSection title="Clientes por contador" icon={<Users className="size-4 text-[#C8A95A]" />}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartClientes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2740" />
              <XAxis type="number" tick={{ fill: "#8899B4", fontSize: 10 }} />
              <YAxis type="category" dataKey="nombre" width={72} tick={{ fill: "#8899B4", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #1A2740" }} />
              <Bar dataKey="clientes" fill="#C8A95A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardSection>

        <DashboardSection title="Facturación del estudio" icon={<TrendingUp className="size-4 text-[#C8A95A]" />}>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartFact}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2740" />
              <XAxis dataKey="mes" tick={{ fill: "#8899B4", fontSize: 10 }} />
              <YAxis tick={{ fill: "#8899B4", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "#0D1525", border: "1px solid #1A2740" }} formatter={(v: number) => [formatSoles(v), "Monto"]} />
              <Bar dataKey="monto" fill="#C8A95A" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line type="monotone" dataKey="monto" stroke="#9B87F5" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#8899B4] mt-2">
            Total anual: <FinancialAmount value={m?.facturacionAnual ?? 0} className="inline text-[#C8A95A]" />
          </p>
        </DashboardSection>
      </div>

      <DashboardSection title="Alertas y actividad reciente" icon={<Shield className="size-4 text-[#FF5E7A]" />}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#8899B4] uppercase">Alertas</h4>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm">
              <p className="text-[#E8EDF5]">🚨 {m?.alertasSeguridad ?? 0} alertas de seguridad</p>
              <p className="text-red-400 mt-1">🔴 {m?.tareasVencidasEstudio ?? 0} tareas vencidas (estudio)</p>
              <p className="text-amber-400 mt-1">🟡 {m?.contadoresInactivos ?? 0} contadores inactivos</p>
            </div>
            {(alertas.data ?? []).slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-lg border border-white/[0.06] px-3 py-2 text-xs">
                <p className="text-[#E8EDF5]">{a.titulo}</p>
                <p className="text-[#8899B4]">{a.descripcion}</p>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-[#C8A95A]" asChild>
              <Link to="/admin/auditoria">Ver todas las alertas →</Link>
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#8899B4] uppercase">Últimas acciones</h4>
            {actividad.isLoading ? (
              <Skeleton className="h-32 rounded-lg bg-white/5" />
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {actividad.data?.map((a) => (
                  <div key={a.id} className="flex gap-2 text-sm border-b border-white/[0.04] pb-2">
                    <span className="text-[10px] text-[#8899B4] shrink-0 w-16">
                      {relativeTime(a.createdAt)}
                    </span>
                    <p className="text-[#E8EDF5]">
                      {a.usuarioNombre ? `${a.usuarioNombre}: ` : ""}
                      {a.titulo}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="text-[#00D4FF]" asChild>
              <Link to="/admin/auditoria">
                <AlertTriangle className="size-3 mr-1" />
                Ver auditoría completa →
              </Link>
            </Button>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}

export default DashboardAdminPremium;
