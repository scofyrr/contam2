import type { ComponentType, LazyExoticComponent } from "react";
import type {
  ColoresConfig,
  ContenidoContadorConfig,
  DashboardContadorConfig,
  UmbralesConfig,
} from "@/modules/config/types/estudio-config";

export type WidgetSize = "small" | "medium" | "large" | "full";

export type WidgetStatus = "loading" | "loaded" | "error" | "empty" | "disabled";

export interface WidgetProps {
  config: DashboardContadorConfig;
  umbrales: UmbralesConfig;
  colores: ColoresConfig;
  contenido: ContenidoContadorConfig;
  kpisVisibles: string[];
  rucActual?: string;
  periodoActual: string;
  refreshInterval: number;
  isFeatureActive: (codigo: string) => boolean;
}

export type WidgetLazyComponent = LazyExoticComponent<ComponentType<Record<string, never>>>;

export interface WidgetRegistryEntry {
  component: WidgetLazyComponent;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  tamano: WidgetSize;
  permisosRequeridos?: string[];
  scopeRuc?: boolean;
}

export type WidgetRegistry = Record<string, WidgetRegistryEntry>;

export interface DashboardWidget extends WidgetRegistryEntry {
  id: string;
  visible: boolean;
  orden: number;
}

export interface DashboardState {
  widgets: DashboardWidget[];
  config: DashboardContadorConfig;
  umbrales: UmbralesConfig;
  colores: ColoresConfig;
  contenido: ContenidoContadorConfig;
  cargando: boolean;
  error: string | null;
}

export interface AnuncioEstudio {
  id: string;
  titulo: string;
  mensaje: string;
  prioridad: string;
  fecha_fin?: string;
}
