export type EstadoValidacion = "pendiente" | "validado" | "ia_sugerido";

export type RegistroSire = {
  id: string;
  tipo: "VENTA" | "COMPRA";
  periodo: string;
  fecha_emision: string;
  cod_tipo_cdp: string;
  serie_cdp: string | null;
  nro_cdp_inicial: string;
  nombre_contraparte: string | null;
  bi_adq_grav?: number | null;
  igv_adq_grav?: number | null;
  bi_grav?: number | null;
  igv_grav?: number | null;
  mto_bi_gravada?: number | null;
  mto_igv_ipe?: number | null;
  mto_total_cp?: number | null;
  importe_total: number;
  cod_moneda: string;
  estado_validacion?: EstadoValidacion | null;
  cuenta_pcge?: string | null;
  finalidad_operativa?: string | null;
  descripcion_items?: string | null;
  ruc?: string;
  razon_social?: string;
};

export type LineaAsientoInput = {
  orden: number;
  cuenta: string;
  glosa: string;
  debe: number;
  haber: number;
};

export type LibroDiarioLinea = {
  id: string;
  sire_registro_id: string | null;
  fecha_asiento: string;
  periodo: string;
  cuenta_contable: string;
  debe: number;
  haber: number;
  glosa: string | null;
  naturaleza: "debe" | "haber";
  origen: string;
  tipo_libro?: string | null;
  tipo_registro: string | null;
  ruc: string | null;
  razon_social: string | null;
  cod_tipo_cdp: string | null;
  serie_cdp: string | null;
  nro_cdp_inicial: string | null;
};

export type KpisResponse = {
  periodo: string | null;
  ventasTotales: number;
  comprasTotales: number;
  utilidadNeta: number;
  ratioIgv: number;
  igvVentas: number;
  igvCompras: number;
  countVentas: number;
  countCompras: number;
};

export type ChartsResponse = {
  periodo: string | null;
  ventasPorPeriodo: { periodo: string; total: number }[];
  comprasPorPeriodo: { periodo: string; total: number }[];
  igvPorPeriodo: { periodo: string; igvVentas: number; igvCompras: number }[];
  utilidadPorPeriodo: { periodo: string; utilidad: number }[];
  importeTotalPorPeriodo: { periodo: string; ventas: number; compras: number }[];
  mixVentasCompras: { name: string; value: number; tipo: string }[];
  porTipoComprobante: { codigo: string; ventas: number; compras: number }[];
  porEstadoValidacion: { estado: string; cantidad: number }[];
  topContrapartes: { nombre: string; importe: number; tipo: string }[];
  composicionMensual: {
    periodo: string;
    baseVentas: number;
    baseCompras: number;
    igvVentas: number;
    igvCompras: number;
  }[];
};

/** Paleta: ganancia verde, pérdida rojo, neutro/referencia azul, periodo actual azul intenso */
export const CHART_THEME = {
  gain: "#16a34a",
  loss: "#dc2626",
  neutral: "#3b82f6",
  periodRef: "#93c5fd",
  periodCurrent: "#1d4ed8",
  ventas: "#16a34a",
  compras: "#dc2626",
  igvVentas: "#3b82f6",
  igvCompras: "#6366f1",
  utilidad: "#16a34a",
  utilidadNeg: "#dc2626",
  grid: "hsl(var(--border))",
  muted: "hsl(var(--muted-foreground))",
} as const;

export const CHART_CATALOG = [
  { id: "chart-ventas-compras", label: "Ventas vs compras", sheet: "Graf_VentasCompras" },
  { id: "chart-utilidad", label: "Utilidad neta", sheet: "Graf_Utilidad" },
  { id: "chart-utilidad-bars", label: "Utilidad por periodo (barras)", sheet: "Graf_UtilidadBarras" },
  { id: "chart-igv", label: "IGV y saldo fiscal", sheet: "Graf_IGV" },
  { id: "chart-mix", label: "Mix ventas/compras", sheet: "Graf_Mix" },
  { id: "chart-importe", label: "Importe total", sheet: "Graf_Importe" },
  { id: "chart-composicion", label: "Composición mensual", sheet: "Graf_Composicion" },
  { id: "chart-tipo-cdp", label: "Por tipo comprobante", sheet: "Graf_TipoCDP" },
  { id: "chart-estado", label: "Estado validación", sheet: "Graf_Estado" },
  { id: "chart-top-contrapartes", label: "Top contrapartes", sheet: "Graf_Contrapartes" },
  { id: "chart-radar", label: "Radar comparativo", sheet: "Graf_Radar" },
] as const;

export type ChartCatalogId = (typeof CHART_CATALOG)[number]["id"];
