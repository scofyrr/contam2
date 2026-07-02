import type {
  ColoresConfig,
  ContenidoContadorConfig,
  DashboardContadorConfig,
  NotificacionesDefaults,
  SidebarConfig,
  TareasAutoConfig,
  UmbralesConfig,
} from "@/modules/config/types/estudio-config";
import type { JsonValue, ValidationResult } from "@/modules/admin/types/admin-config";

const HEX_RE = /^#([0-9A-Fa-f]{6})$/;

function ok(): ValidationResult {
  return { valido: true, errores: [], warnings: [] };
}

function fail(errores: ValidationResult["errores"], warnings: ValidationResult["warnings"] = []): ValidationResult {
  return { valido: errores.length === 0, errores, warnings };
}

function parseTime(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function contrastRatio(hex: string, bg = "#060B14"): number {
  const parse = (h: string) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
  };
  const lum = ([r, g, b]: readonly [number, number, number]) => {
    const f = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(bg);
  const l1 = lum([r1, g1, b1]);
  const l2 = lum([r2, g2, b2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateDashboardContador(valor: DashboardContadorConfig): ValidationResult {
  const errores: ValidationResult["errores"] = [];
  const warnings: ValidationResult["warnings"] = [];

  if (!valor.widgets.activos.length) {
    errores.push({ campo: "widgets.activos", mensaje: "Debe haber al menos 1 widget activo" });
  }
  if (valor.kpis_visibles.length < 2) {
    errores.push({ campo: "kpis_visibles", mensaje: "Mínimo 2 KPIs visibles" });
  }
  if (valor.max_tareas_urgentes < 1 || valor.max_tareas_urgentes > 20) {
    errores.push({ campo: "max_tareas_urgentes", mensaje: "Debe estar entre 1 y 20" });
  }
  if (valor.max_clientes_grafico < 1 || valor.max_clientes_grafico > 20) {
    errores.push({ campo: "max_clientes_grafico", mensaje: "Debe estar entre 1 y 20" });
  }
  const allowedRefresh = [15, 30, 60, 120, 300];
  if (!allowedRefresh.includes(valor.intervalo_refresh_seg)) {
    warnings.push({ campo: "intervalo_refresh_seg", mensaje: "Se ajustará al valor permitido más cercano" });
  }
  return fail(errores, warnings);
}

export function validateUmbrales(valor: UmbralesConfig): ValidationResult {
  const errores: ValidationResult["errores"] = [];
  if (valor.carga_baja >= valor.carga_alta) {
    errores.push({ campo: "carga_baja", mensaje: "Carga baja debe ser menor que carga alta" });
  }
  if (valor.carga_alta >= valor.carga_critica) {
    errores.push({ campo: "carga_alta", mensaje: "Carga alta debe ser menor que carga crítica" });
  }
  if (valor.efectividad_meta >= valor.efectividad_excelente) {
    errores.push({ campo: "efectividad_meta", mensaje: "Meta debe ser menor que excelente" });
  }
  if (valor.horas_inactividad_ausente >= valor.horas_inactividad_inactivo) {
    errores.push({ campo: "horas_inactividad_ausente", mensaje: "Horas ausente debe ser menor que inactivo" });
  }
  return fail(errores);
}

export function validateColores(valor: ColoresConfig): ValidationResult {
  const errores: ValidationResult["errores"] = [];
  const warnings: ValidationResult["warnings"] = [];
  const colors = [
    valor.acento,
    valor.urgencia_vencida,
    valor.urgencia_hoy,
    valor.urgencia_semana,
    valor.urgencia_normal,
  ];
  for (const c of colors) {
    if (!HEX_RE.test(c)) {
      errores.push({ campo: "color", mensaje: `Color inválido: ${c}` });
    } else if (contrastRatio(c) < 4.5) {
      warnings.push({ campo: "color", mensaje: `Contraste bajo en ${c} (ratio < 4.5:1)` });
    }
  }
  return fail(errores, warnings);
}

export function validateNotificaciones(valor: NotificacionesDefaults): ValidationResult {
  const errores: ValidationResult["errores"] = [];
  const ini = parseTime(valor.horas_silencio.inicio);
  const fin = parseTime(valor.horas_silencio.fin);
  if (ini === null || fin === null) {
    errores.push({ campo: "horas_silencio", mensaje: "Formato de hora inválido (HH:MM)" });
  }
  if (valor.dias_retencion_notificaciones < 7 || valor.dias_retencion_notificaciones > 90) {
    errores.push({ campo: "dias_retencion_notificaciones", mensaje: "Debe estar entre 7 y 90 días" });
  }
  return fail(errores);
}

export function validateSidebar(valor: SidebarConfig): ValidationResult {
  const errores: ValidationResult["errores"] = [];
  if (valor.modulos.length < 2) {
    errores.push({ campo: "modulos", mensaje: "Al menos 2 módulos visibles" });
  }
  if (!valor.modulos.includes(valor.modulo_inicio)) {
    errores.push({ campo: "modulo_inicio", mensaje: "El módulo de inicio debe estar visible" });
  }
  return fail(errores);
}

export function validateContenido(valor: ContenidoContadorConfig): ValidationResult {
  const errores: ValidationResult["errores"] = [];
  if (valor.mensaje_bienvenida.length > 500) {
    errores.push({ campo: "mensaje_bienvenida", mensaje: "Máximo 500 caracteres" });
  }
  if (valor.enlaces_rapidos.length > 6) {
    errores.push({ campo: "enlaces_rapidos", mensaje: "Máximo 6 enlaces rápidos" });
  }
  return fail(errores);
}

export function validateTareasAuto(valor: TareasAutoConfig): ValidationResult {
  const errores: ValidationResult["errores"] = [];
  const activas = Object.values(valor.reglas_activas).filter(Boolean).length;
  if (activas < 1) {
    errores.push({ campo: "reglas_activas", mensaje: "Al menos 1 regla activa" });
  }
  if (valor.permitir_snooze_horas.some((h) => h <= 0)) {
    errores.push({ campo: "permitir_snooze_horas", mensaje: "Horas de snooze deben ser positivas" });
  }
  return fail(errores);
}

export function validateConfig(clave: string, valor: unknown): ValidationResult {
  switch (clave) {
    case "dashboard_contador":
      return validateDashboardContador(valor as DashboardContadorConfig);
    case "umbrales_contador":
      return validateUmbrales(valor as UmbralesConfig);
    case "colores_contador":
      return validateColores(valor as ColoresConfig);
    case "notificaciones_default":
      return validateNotificaciones(valor as NotificacionesDefaults);
    case "sidebar_contador":
      return validateSidebar(valor as SidebarConfig);
    case "contenido_contador":
      return validateContenido(valor as ContenidoContadorConfig);
    case "tareas_auto":
      return validateTareasAuto(valor as TareasAutoConfig);
    default:
      return ok();
  }
}

export function summarizeJson(valor: JsonValue, maxLen = 80): string {
  const s = JSON.stringify(valor);
  return s.length <= maxLen ? s : `${s.slice(0, maxLen)}…`;
}
