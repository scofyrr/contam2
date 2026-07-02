import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

export function DashboardKpiCard({
  label,
  value,
  suffix,
  sublabel,
  trend,
  accentColor = "#00D4FF",
  loading,
  pulse,
  onClick,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  sublabel?: string;
  trend?: number;
  accentColor?: string;
  loading?: boolean;
  pulse?: boolean;
  onClick?: () => void;
}) {
  if (loading) return <Skeleton className="h-28 rounded-xl bg-white/5" />;

  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition-all duration-300 hover:bg-white/[0.05] hover:scale-[1.02]",
        pulse && "animate-pulse-red",
        onClick && "cursor-pointer",
      )}
      style={{ borderBottomWidth: 2, borderBottomColor: accentColor }}
    >
      <p className="text-xs text-[#8899B4]">{label}</p>
      <p className="text-3xl font-semibold tabular-nums mt-1 text-[#E8EDF5]">
        {value}
        {suffix ? <span className="text-lg ml-1 text-[#8899B4]">{suffix}</span> : null}
      </p>
      {sublabel ? <p className="text-[10px] text-[#8899B4] mt-1">{sublabel}</p> : null}
      {trend !== undefined ? (
        <p className={cn("text-xs mt-1 flex items-center gap-1", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
          {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(trend)}% vs mes anterior
        </p>
      ) : null}
    </Wrapper>
  );
}

export function DashboardSection({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function formatSoles(n: number): string {
  if (n >= 1_000_000) return `S/ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `S/ ${(n / 1_000).toFixed(0)}K`;
  return `S/ ${n.toFixed(0)}`;
}
