import type { Logro, SugerenciaInteligente } from "@/modules/dashboard/types/dashboard";
import type { ContadorPersonalMetrics } from "@/modules/dashboard/types/dashboard";
import type { TareaPendiente } from "@/types/tareas";

const LOGROS_DEF: Omit<Logro, "desbloqueado" | "progreso" | "fechaDesbloqueo">[] = [
  { id: "RACHA_7", titulo: "🔥 Enrachado", descripcion: "7 días seguidos completando tareas", icono: "Flame", tipo: "RACHA" },
  { id: "RACHA_30", titulo: "🔥 Imparable", descripcion: "30 días seguidos completando tareas", icono: "Flame", tipo: "RACHA" },
  { id: "EFECTIVIDAD_90", titulo: "⭐ Precisión Quirúrgica", descripcion: "90% de tareas completadas a tiempo", icono: "Star", tipo: "EFECTIVIDAD" },
  { id: "EFECTIVIDAD_100", titulo: "🏆 Perfección", descripcion: "100% de tareas a tiempo este mes", icono: "Trophy", tipo: "EFECTIVIDAD" },
  { id: "VOLUMEN_50", titulo: "💪 Productivo", descripcion: "50 tareas completadas en un mes", icono: "Zap", tipo: "VOLUMEN" },
  { id: "VOLUMEN_100", titulo: "🚀 Súper Productivo", descripcion: "100 tareas completadas en un mes", icono: "Rocket", tipo: "VOLUMEN" },
  { id: "CLIENTES_SIN_VENCIDAS", titulo: "🛡️ Guardián", descripcion: "Todos tus clientes sin tareas vencidas", icono: "Shield", tipo: "ESPECIAL" },
];

function computeRacha(tareas: TareaPendiente[]): number {
  const completedDays = new Set<string>();
  for (const t of tareas) {
    if (t.estado === "completada" && t.fecha_completada) {
      completedDays.add(t.fecha_completada.slice(0, 10));
    }
  }
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const iso = d.toISOString().slice(0, 10);
    if (completedDays.has(iso)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calcularLogros(
  metrics: ContadorPersonalMetrics,
  tareas: TareaPendiente[],
  clientesConVencidas: number,
): Logro[] {
  const racha = computeRacha(tareas);
  const completadasMes = tareas.filter(
    (t) =>
      t.estado === "completada" &&
      t.fecha_completada &&
      t.fecha_completada.slice(0, 7) === new Date().toISOString().slice(0, 7),
  ).length;

  const checks: Record<string, boolean> = {
    RACHA_7: racha >= 7,
    RACHA_30: racha >= 30,
    EFECTIVIDAD_90: metrics.efectividad >= 90,
    EFECTIVIDAD_100: metrics.efectividad >= 100,
    VOLUMEN_50: completadasMes >= 50,
    VOLUMEN_100: completadasMes >= 100,
    CLIENTES_SIN_VENCIDAS: clientesConVencidas === 0 && metrics.clientesAsignados > 0,
  };

  return LOGROS_DEF.map((l) => ({
    ...l,
    desbloqueado: checks[l.id] ?? false,
    progreso: l.id.startsWith("RACHA")
      ? Math.min(100, Math.round((racha / (l.id === "RACHA_30" ? 30 : 7)) * 100))
      : l.id.startsWith("VOLUMEN")
        ? Math.min(100, Math.round((completadasMes / (l.id === "VOLUMEN_100" ? 100 : 50)) * 100))
        : checks[l.id]
          ? 100
          : Math.round(metrics.efectividad),
    fechaDesbloqueo: checks[l.id] ? new Date().toISOString() : undefined,
  }));
}

export function generarSugerencias(
  metrics: ContadorPersonalMetrics,
  tareas: TareaPendiente[],
  clientes: { ruc: string; razonSocial: string; tareasPendientes: number; cxcVencido: number }[],
): SugerenciaInteligente[] {
  const sugerencias: SugerenciaInteligente[] = [];
  const criticas = tareas.filter((t) => t.critica && t.estado !== "completada").length;
  const sirePendientes = tareas.filter(
    (t) => t.modulo_origen === "sire" && !["completada", "cancelada"].includes(t.estado),
  ).length;

  if (sirePendientes >= 3) {
    sugerencias.push({
      id: "prov-sire",
      tipo: "PRIORIZAR",
      titulo: "Provisiona comprobantes SIRE",
      descripcion: `Tienes ${sirePendientes} comprobantes pendientes de provisión.`,
      impacto: "Reduce hasta 60% de tus tareas críticas",
      accion: { label: "Ir a SIRE", link: "/sire-registros" },
      prioridad: "ALTA",
    });
  }

  const topCxc = [...clientes].sort((a, b) => b.cxcVencido - a.cxcVencido)[0];
  if (topCxc && topCxc.cxcVencido > 0) {
    sugerencias.push({
      id: "cxc-focus",
      tipo: "OPTIMIZAR",
      titulo: `Prioriza ${topCxc.razonSocial}`,
      descripcion: "Este cliente concentra la mayor parte de CXC vencidas.",
      impacto: "Mejora flujo de cobranza del mes",
      accion: { label: "Ver contribuyente", link: "/contribuyentes" },
      prioridad: "MEDIA",
    });
  }

  if (metrics.cargaTrabajo === "ALTA" || metrics.cargaTrabajo === "CRITICA") {
    sugerencias.push({
      id: "carga-alta",
      tipo: "ALERTA",
      titulo: "Carga de trabajo elevada",
      descripcion: "Considera delegar clientes o posponer tareas no críticas.",
      impacto: "Evita vencimientos en cascada",
      accion: { label: "Ver tareas", link: "/tareas" },
      prioridad: "ALTA",
    });
  }

  if (metrics.rachaDiasProductivos >= 7) {
    sugerencias.push({
      id: "racha-logro",
      tipo: "LOGRO",
      titulo: `¡Racha de ${metrics.rachaDiasProductivos} días!`,
      descripcion: "Has completado tareas de forma consistente.",
      impacto: "Mantén el ritmo para desbloquear logros",
      accion: { label: "Ver logros", link: "/dashboard" },
      prioridad: "BAJA",
    });
  }

  if (criticas === 0 && metrics.tareasVencidas === 0) {
    sugerencias.push({
      id: "sin-criticas",
      tipo: "LOGRO",
      titulo: "Sin tareas vencidas",
      descripcion: "Excelente control de plazos este periodo.",
      impacto: "Efectividad personal en buen nivel",
      accion: { label: "Ver estadísticas", link: "/dashboard-estadisticas" },
      prioridad: "BAJA",
    });
  }

  return sugerencias.slice(0, 5);
}

export function calcularRachaDias(tareas: TareaPendiente[]): number {
  return computeRacha(tareas);
}
