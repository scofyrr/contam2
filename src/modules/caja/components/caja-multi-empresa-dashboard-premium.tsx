import { useMemo } from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { useLiquidezDashboard } from "@/hooks/use-caja-premium";
import { cn } from "@/lib/utils";
import type { LiquidezEmpresa } from "@/modules/caja/types/conciliacion";

const SALUD_STYLE = {
  SALUDABLE: { label: "🟢 SALUDABLE", color: "#00C897", glow: "#00C89744" },
  ATENCION: { label: "🟡 ATENCIÓN", color: "#F0A500", glow: "#F0A50044" },
  CRITICO: { label: "🔴 CRÍTICO", color: "#FF5E7A", glow: "#FF5E7A44" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);
}

function Sparkline({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke="#00C8FF" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmpresaCard({ emp, onClick }: { emp: LiquidezEmpresa; onClick?: () => void }) {
  const salud = SALUD_STYLE[emp.estadoSalud];
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-4 transition-all duration-300 hover:scale-[1.03] w-full"
      style={{ boxShadow: `0 8px 32px ${salud.glow}` }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate text-[#E8EDF5]">{emp.razonSocial}</p>
          <p className="text-[10px] text-[#7B8FA8] font-mono">{emp.ruc}</p>
        </div>
        <span className="text-[10px] shrink-0" style={{ color: salud.color }}>
          {salud.label}
        </span>
      </div>

      <p className="font-mono text-2xl font-semibold mt-3 text-[#E8EDF5]">{fmt(emp.saldoTotal)}</p>

      <Sparkline data={emp.sparkline} />

      <div className="mt-3 space-y-1">
        {emp.cuentas.slice(0, 3).map((c) => (
          <div key={c.id} className="flex justify-between text-[10px] text-[#7B8FA8]">
            <span className="truncate">{c.nombre}</span>
            <span className="font-mono text-[#E8EDF5]">{fmt(c.saldo)}</span>
          </div>
        ))}
      </div>

      {emp.variacionMes !== 0 ? (
        <p
          className={cn(
            "text-xs mt-2 flex items-center gap-1",
            emp.variacionMes >= 0 ? "text-[#00C897]" : "text-[#FF5E7A]",
          )}
        >
          {emp.variacionMes >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {fmt(Math.abs(emp.variacionMes))} este mes
        </p>
      ) : null}
    </button>
  );
}

function LiquidezGlobalBar({ empresas }: { empresas: LiquidezEmpresa[] }) {
  const totals = useMemo(() => {
    let disp = 0;
    let cxc = 0;
    let cxp = 0;
    for (const e of empresas) {
      disp += e.saldoDisponible;
      cxc += e.porCobrar;
      cxp += e.porPagar;
    }
    const total = disp + cxc;
    const ratio = cxp > 0 ? disp / cxp : disp > 0 ? 99 : 0;
    return { disp, cxc, cxp, total, ratio };
  }, [empresas]);

  const pctDisp = totals.total > 0 ? (totals.disp / totals.total) * 100 : 60;
  const pctCxc = totals.total > 0 ? (totals.cxc / totals.total) * 100 : 25;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-widest text-[#7B8FA8]">L I Q U I D E Z   G L O B A L</h3>
        <span className="font-mono text-lg text-[#E8EDF5]">{fmt(totals.disp + totals.cxc - totals.cxp)}</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden flex bg-[#152238]">
        <div className="h-full bg-[#00C897] transition-all duration-700" style={{ width: `${pctDisp}%` }} />
        <div className="h-full bg-[#00C8FF] transition-all duration-700" style={{ width: `${pctCxc}%` }} />
        <div className="h-full bg-[#FF5E7A]/60 flex-1" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs text-[#7B8FA8]">
        <div>
          <span className="text-[#00C897]">●</span> Disponible {fmt(totals.disp)}
        </div>
        <div>
          <span className="text-[#00C8FF]">●</span> Por cobrar {fmt(totals.cxc)}
        </div>
        <div>
          <span className="text-[#FF5E7A]">●</span> Por pagar {fmt(totals.cxp)}
        </div>
        <div>
          Ratio: <strong className="text-[#E8EDF5]">{totals.ratio.toFixed(1)}x</strong>
        </div>
      </div>
    </div>
  );
}

export function CajaMultiEmpresaDashboardPremium({
  ruc,
  periodo,
  onSelectRuc,
}: {
  ruc?: string | null;
  periodo?: string | null;
  onSelectRuc?: (ruc: string) => void;
}) {
  const { data, isLoading, isError } = useLiquidezDashboard(ruc, periodo);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  const empresas = data ?? [];

  if (isError || empresas.length === 0) {
    return (
      <div
        className="rounded-2xl border border-[#152238] p-8 text-center"
        style={{ backgroundColor: "#060B14" }}
      >
        <Wallet className="size-10 mx-auto text-[#7B8FA8] mb-3" />
        <p className="text-sm text-[#7B8FA8]">
          {ruc
            ? "No hay datos de liquidez para este contribuyente. Ejecute la migración 024 o registre movimientos de caja."
            : "Seleccione un RUC o configure contribuyentes para ver liquidez multi-empresa."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#152238] p-4 md:p-6" style={{ backgroundColor: "#060B14" }}>
      <header className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-[#E8EDF5]">
          <Wallet className="size-5 text-[#00C897]" />
          Dashboard de Liquidez
        </h2>
        {periodo ? <span className="text-xs text-[#7B8FA8]">Período {periodo}</span> : null}
      </header>

      {!ruc && empresas.length > 1 ? <LiquidezGlobalBar empresas={empresas} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {empresas.map((emp) => (
          <EmpresaCard key={emp.ruc} emp={emp} onClick={() => onSelectRuc?.(emp.ruc)} />
        ))}
      </div>
    </div>
  );
}
