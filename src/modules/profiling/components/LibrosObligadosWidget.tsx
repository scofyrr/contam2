import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  Scale,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FormatoLibroDiario, ProfilingResult } from "@/modules/profiling/types/profiling";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function formatSoles(amount: number, mounted: boolean): string {
  if (!mounted) return "S/ —";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatUit(value: number, mounted: boolean): string {
  if (!mounted) return "— UIT";
  return `${value.toLocaleString("es-PE", { maximumFractionDigits: 2 })} UIT`;
}

function formatoLabel(formato: FormatoLibroDiario): string {
  switch (formato) {
    case "FORMATO_5_2_SIMPLIFICADO":
      return "Formato 5.2 — Libro Diario Simplificado";
    case "FORMATO_5_1_DIARIO":
      return "Formato 5.1 — Libro Diario Completo";
    case "NO_APLICA":
      return "No aplica (Régimen simplificado)";
    default:
      return formato;
  }
}

function formatoBadgeClass(formato: FormatoLibroDiario): string {
  switch (formato) {
    case "FORMATO_5_2_SIMPLIFICADO":
      return "border-emerald-500/50 bg-emerald-500/15 text-emerald-300";
    case "FORMATO_5_1_DIARIO":
      return "border-sky-500/50 bg-sky-500/15 text-sky-300";
    case "NO_APLICA":
      return "border-slate-500/50 bg-slate-500/15 text-slate-400";
    default:
      return "border-slate-600 text-slate-300";
  }
}

interface UmbralBarProps {
  label: string;
  value: number;
  max: number;
  threshold: number;
  mounted: boolean;
  accentClass: string;
}

function UmbralBar({ label, value, max, threshold, mounted, accentClass }: UmbralBarProps) {
  const pct = mounted ? Math.min(100, (value / max) * 100) : 0;
  const thresholdPct = (threshold / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-mono text-slate-400">
          {mounted ? `${threshold} UIT` : "— UIT"}
        </span>
      </div>
      <div className="relative">
        <Progress value={pct} className={cn("h-2.5 bg-slate-800/80", accentClass)} />
        <div
          className="absolute top-0 h-2.5 w-0.5 bg-white/60"
          style={{ left: `${thresholdPct}%` }}
          title={`Umbral ${threshold} UIT`}
        />
      </div>
    </div>
  );
}

export interface LibrosObligadosWidgetProps {
  profiling: ProfilingResult | undefined;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function LibrosObligadosWidget({
  profiling,
  isLoading,
  isError,
  errorMessage,
  onRefresh,
  isRefreshing,
  className,
}: LibrosObligadosWidgetProps) {
  const mounted = useClientMounted();

  const maxUit = profiling?.umbralesUit.completo ?? 1700;
  const ingresosUit = profiling?.ingresosBrutosUit ?? 0;

  const librosDestacados = useMemo(
    () => profiling?.librosObligados.filter((l) => l.destacado) ?? [],
    [profiling?.librosObligados],
  );

  if (isLoading) {
    return (
      <div className={cn(GLASS, "flex items-center justify-center gap-3 p-12", className)}>
        <Loader2 className="size-6 animate-spin text-emerald-400" />
        <span className="text-sm text-slate-400">Evaluando libros obligados SUNAT…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(GLASS, "p-6", className)}>
        <div className="flex items-start gap-3 text-red-300">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Error al evaluar profiling</p>
            <p className="mt-1 text-sm text-slate-400">{errorMessage ?? "Intente nuevamente."}</p>
          </div>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-slate-700 text-slate-300"
            onClick={onRefresh}
          >
            <RefreshCw className="mr-2 size-4" /> Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (!profiling) {
    return (
      <div className={cn(GLASS, "p-8 text-center text-slate-500", className)}>
        <BookOpen className="mx-auto mb-3 size-8 opacity-40" />
        <p className="text-sm">Seleccione un contribuyente para evaluar libros obligados.</p>
      </div>
    );
  }

  return (
    <section className={cn(GLASS, "overflow-hidden", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-4">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-emerald-400" />
          <div>
            <h3 className="font-semibold text-slate-100">Libros Obligatorios SUNAT</h3>
            <p className="text-xs text-slate-500">
              Ejercicio {profiling.ejercicio} · Tabla 8 PLE
            </p>
          </div>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-emerald-300"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("mr-2 size-4", isRefreshing && "animate-spin")} />
            Actualizar
          </Button>
        )}
      </header>

      <div className="space-y-6 p-6">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-emerald-400/80">
            Formato Libro Diario aplicable
          </p>
          <Badge
            variant="outline"
            className={cn("text-sm font-medium", formatoBadgeClass(profiling.formatoLibroDiario))}
          >
            {formatoLabel(profiling.formatoLibroDiario)}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Ingresos brutos"
            value={formatSoles(profiling.ingresosBrutosSoles, mounted)}
            sub={`Ejercicio ${profiling.ejercicio}`}
          />
          <MetricCard
            label="Valor UIT"
            value={mounted ? `S/ ${profiling.uitMonto.toLocaleString("es-PE")}` : "S/ —"}
            sub="Parámetro SUNAT"
          />
          <MetricCard
            label="Total en UIT"
            value={formatUit(profiling.ingresosBrutosUit, mounted)}
            sub="Ingresos / UIT"
            highlight
          />
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-950/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Progreso vs umbrales UIT
          </p>
          <UmbralBar
            label="Límite Diario Simplificado (5.2)"
            value={ingresosUit}
            max={maxUit}
            threshold={profiling.umbralesUit.simplificado}
            mounted={mounted}
            accentClass="[&>div]:bg-emerald-500"
          />
          <UmbralBar
            label="Umbral intermedio"
            value={ingresosUit}
            max={maxUit}
            threshold={profiling.umbralesUit.intermedio}
            mounted={mounted}
            accentClass="[&>div]:bg-amber-500"
          />
          <UmbralBar
            label="Umbral empresa mediana/grande"
            value={ingresosUit}
            max={maxUit}
            threshold={profiling.umbralesUit.completo}
            mounted={mounted}
            accentClass="[&>div]:bg-violet-500"
          />
        </div>

        {librosDestacados.length > 0 && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="mr-2 inline size-4" />
            Libro diario destacado:{" "}
            <strong>{librosDestacados.map((l) => l.nombre).join(", ")}</strong>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {profiling.librosObligados.map((libro) => (
            <LibroCard key={`${libro.codigo}-${libro.nombre}`} libro={libro} mounted={mounted} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        highlight
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-slate-800/60 bg-slate-950/40",
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-bold",
          highlight ? "text-emerald-300" : "text-slate-100",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function LibroCard({
  libro,
  mounted,
}: {
  libro: ProfilingResult["librosObligados"][number];
  mounted: boolean;
}) {
  const isInfo = libro.codigo.startsWith("NOTA_") || libro.codigo === "INFO";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        libro.destacado
          ? "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20"
          : isInfo
            ? "border-slate-700/50 bg-slate-950/20"
            : "border-slate-800/60 bg-slate-950/40 hover:border-slate-700",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isInfo ? (
              <Info className="size-4 shrink-0 text-slate-500" />
            ) : (
              <BookOpen className="size-4 shrink-0 text-emerald-400/80" />
            )}
            <span className="truncate text-sm font-medium text-slate-200">{libro.nombre}</span>
          </div>
          {libro.descripcion && (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{libro.descripcion}</p>
          )}
        </div>
        {mounted && !isInfo && (
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 font-mono text-[10px]",
              libro.obligatorio
                ? "border-emerald-500/40 text-emerald-400"
                : "border-slate-600 text-slate-500",
            )}
          >
            {libro.codigo}
          </Badge>
        )}
      </div>
      {libro.formatoPle && mounted && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-600">
          PLE Formato {libro.formatoPle}
        </p>
      )}
    </div>
  );
}

export function LibrosObligadosWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(GLASS, "animate-pulse p-6", className)}>
      <div className="mb-6 h-6 w-1/2 rounded bg-slate-800" />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-slate-800/80" />
        <div className="h-24 rounded-xl bg-slate-800/80" />
        <div className="h-24 rounded-xl bg-slate-800/80" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-800/80" />
        ))}
      </div>
    </div>
  );
}
