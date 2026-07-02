import { useEffect, useRef } from "react";
import { performanceMonitor } from "@/lib/performance-monitoring";

function hashProps(props: Record<string, unknown> | undefined): string | undefined {
  if (!props) return undefined;
  try {
    return JSON.stringify(props);
  } catch {
    return undefined;
  }
}

export function useComponentPerformance(
  componentName: string,
  props?: Record<string, unknown>,
): void {
  const startRef = useRef(performance.now());
  const propsHash = hashProps(props);

  useEffect(() => {
    const renderTimeMs = performance.now() - startRef.current;
    performanceMonitor.trackComponentRender(componentName, Math.round(renderTimeMs), propsHash);
    startRef.current = performance.now();
  });
}

export function usePerformanceMonitor(componentName: string): {
  renderTime: number;
  isSlow: boolean;
  suggestions: string[];
} {
  const start = performance.now();
  const reports = performanceMonitor.obtenerComponentesLentos(50);
  const mine = reports.find((r) => r.componentName === componentName);
  const renderTime = Math.round(performance.now() - start);
  return {
    renderTime,
    isSlow: (mine?.avgRenderTimeMs ?? 0) > 50,
    suggestions: mine?.memoizationOpportunities ?? [],
  };
}
