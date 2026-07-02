import type { FeatureFlagRow } from "@/modules/config/types/estudio-config";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface ConfigChangeLog {
  id: string;
  clave: string;
  valorAnterior: JsonValue;
  valorNuevo: JsonValue;
  cambiadoPor: string;
  cambiadoPorNombre: string;
  timestamp: string;
  revertido: boolean;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface ValidationResult {
  valido: boolean;
  errores: Array<{ campo: string; mensaje: string }>;
  warnings: Array<{ campo: string; mensaje: string }>;
}

export type ConfigCategory =
  | "widgets"
  | "umbrales"
  | "colores"
  | "notificaciones"
  | "sidebar"
  | "contenido"
  | "tareas"
  | "flags"
  | "historial";

export interface ConfigCategoryInfo {
  id: ConfigCategory;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  claveConfig: string | null;
}

export type FeatureFlag = FeatureFlagRow & {
  scope?: string;
  updated_at?: string;
};

export const CONFIG_CATEGORIES: ConfigCategoryInfo[] = [
  {
    id: "widgets",
    nombre: "Layout y Widgets",
    descripcion: "Widgets visibles, KPIs y opciones del dashboard contador",
    icono: "Layout",
    color: "#00D4FF",
    claveConfig: "dashboard_contador",
  },
  {
    id: "umbrales",
    nombre: "Umbrales",
    descripcion: "Carga de trabajo, efectividad e inactividad",
    icono: "Gauge",
    color: "#F0A500",
    claveConfig: "umbrales_contador",
  },
  {
    id: "colores",
    nombre: "Colores",
    descripcion: "Paleta de urgencia y comportamiento visual",
    icono: "Palette",
    color: "#A78BFA",
    claveConfig: "colores_contador",
  },
  {
    id: "notificaciones",
    nombre: "Notificaciones",
    descripcion: "Sonidos, módulos y retención por defecto",
    icono: "Bell",
    color: "#00D4FF",
    claveConfig: "notificaciones_default",
  },
  {
    id: "sidebar",
    nombre: "Sidebar",
    descripcion: "Módulos visibles y funcionalidades del menú",
    icono: "Smartphone",
    color: "#00C897",
    claveConfig: "sidebar_contador",
  },
  {
    id: "contenido",
    nombre: "Contenido",
    descripcion: "Mensaje de bienvenida, anuncios y enlaces rápidos",
    icono: "FileEdit",
    color: "#C8A95A",
    claveConfig: "contenido_contador",
  },
  {
    id: "tareas",
    nombre: "Tareas Auto",
    descripcion: "Motor automático de tareas y reglas",
    icono: "Bot",
    color: "#A78BFA",
    claveConfig: "tareas_auto",
  },
  {
    id: "flags",
    nombre: "Feature Flags",
    descripcion: "Activar o desactivar funcionalidades del sistema",
    icono: "Rocket",
    color: "#FF5E7A",
    claveConfig: null,
  },
  {
    id: "historial",
    nombre: "Historial",
    descripcion: "Cambios recientes con opción de revertir",
    icono: "History",
    color: "#8899B4",
    claveConfig: null,
  },
];

export const CATEGORY_TO_BUNDLE_KEY = {
  widgets: "dashboard_contador",
  umbrales: "umbrales",
  colores: "colores",
  notificaciones: "notificaciones",
  sidebar: "sidebar",
  contenido: "contenido",
  tareas: "tareas_auto",
} as const;

export const CLAVE_TO_CATEGORY: Record<string, ConfigCategory> = {
  dashboard_contador: "widgets",
  umbrales_contador: "umbrales",
  colores_contador: "colores",
  notificaciones_default: "notificaciones",
  sidebar_contador: "sidebar",
  contenido_contador: "contenido",
  tareas_auto: "tareas",
};

export const WIDGET_LABELS: Record<string, string> = {
  kpis: "KPIs personales",
  tareas_urgentes: "Tareas urgentes",
  clientes: "Gráfico de clientes",
  carga_trabajo: "Carga de trabajo",
  sugerencias: "Sugerencias inteligentes",
  logros: "Logros y rachas",
  actividad_reciente: "Actividad reciente",
};

export const KPI_LABELS: Record<string, string> = {
  clientes: "Clientes",
  tareas: "Tareas",
  vencidas: "Vencidas",
  efectividad: "Efectividad",
  racha: "Racha",
  facturacion: "Facturación",
};

export const SIDEBAR_MODULE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/sire-registros": "Registros SIRE",
  "/libro-diario": "Libro Diario",
  "/libro-caja": "Libro Caja",
  "/pcge": "Plan de Cuentas",
  "/contribuyentes": "Contribuyentes",
  "/tareas": "Tareas",
  "/ficha-ruc": "Ficha RUC",
  "/sire-sync": "Sync SIRE",
  "/dashboard-estadisticas": "Estadísticas SIRE",
  "/mi-cuenta": "Mi Cuenta",
};

export const TAREA_REGLA_LABELS: Record<string, string> = {
  sire_sin_provision: "SIRE sin provisionar",
  vencimiento_proximo: "Vencimiento próximo",
  cxc_vencida: "CXC vencida",
  centralizar_caja: "Centralizar caja",
  asiento_descadrado: "Asiento descuadrado",
  contribuyente_inactivo: "Contribuyente inactivo",
  cierre_periodo: "Cierre de período",
};
