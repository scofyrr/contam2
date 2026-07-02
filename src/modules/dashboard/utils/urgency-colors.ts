import type { ColoresConfig } from "@/modules/config/types/estudio-config";
import type { TaskUrgency } from "@/modules/notificaciones/types/alert-system";

export function getUrgencyColor(urgency: TaskUrgency, colores: ColoresConfig): string {
  switch (urgency) {
    case "OVERDUE":
      return colores.urgencia_vencida;
    case "TODAY":
      return colores.urgencia_hoy;
    case "TOMORROW":
    case "THIS_WEEK":
      return colores.urgencia_semana;
    default:
      return colores.urgencia_normal;
  }
}

export function getEfectividadColor(
  pct: number,
  umbrales: { efectividad_meta: number; efectividad_excelente: number },
): string {
  if (pct >= umbrales.efectividad_excelente) return "#00C897";
  if (pct >= umbrales.efectividad_meta) return "#00D4FF";
  if (pct >= 70) return "#F0A500";
  return "#FF5E7A";
}

export function applyContadorCssVariables(colores: ColoresConfig, reducirAnimaciones: boolean): void {
  const root = document.documentElement;
  root.style.setProperty("--color-urgencia-vencida", colores.urgencia_vencida);
  root.style.setProperty("--color-urgencia-hoy", colores.urgencia_hoy);
  root.style.setProperty("--color-urgencia-semana", colores.urgencia_semana);
  root.style.setProperty("--color-urgencia-normal", colores.urgencia_normal);
  root.style.setProperty("--color-acento-contador", colores.acento);
  if (reducirAnimaciones) {
    root.setAttribute("data-reduced-motion", "true");
  } else {
    root.removeAttribute("data-reduced-motion");
  }
}
