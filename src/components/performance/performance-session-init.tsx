import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { performanceMonitor, isPerformanceMonitoringEnabled } from "@/lib/performance-monitoring";

export function PerformanceSessionInit() {
  const { user } = useSession();

  useEffect(() => {
    if (!isPerformanceMonitoringEnabled() || !user?.id) return;
    performanceMonitor.iniciarSesion(user.id);
    return () => {
      performanceMonitor.finalizarSesion();
    };
  }, [user?.id]);

  return null;
}
