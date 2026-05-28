import { CHART_THEME } from "@/lib/sire-types";

export function resolvePeriodoActual(
  filtroPeriodo: string,
  periodos: string[],
): string {
  if (filtroPeriodo) return filtroPeriodo;
  const sorted = [...new Set(periodos)].sort();
  return sorted.at(-1) ?? "";
}

/** Periodos históricos: azul suave; periodo actual: azul intenso */
export function periodoBarColor(periodo: string, periodoActual: string): string {
  if (!periodoActual) return CHART_THEME.periodRef;
  return periodo === periodoActual ? CHART_THEME.periodCurrent : CHART_THEME.periodRef;
}

export function utilidadColor(value: number): string {
  if (value > 0) return CHART_THEME.gain;
  if (value < 0) return CHART_THEME.loss;
  return CHART_THEME.neutral;
}

export function saldoColor(value: number): string {
  return utilidadColor(value);
}

export function formatPeriodoLabel(p: string): string {
  if (p.length !== 6) return p;
  return `${p.slice(0, 4)}-${p.slice(4, 6)}`;
}
