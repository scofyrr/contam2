export type TemplateCategoria =
  | "PROVISION"
  | "AJUSTE"
  | "CIERRE"
  | "DEPRECIACION"
  | "DEVENGADO"
  | "IMPUESTO"
  | "PLANILLA"
  | "PERSONALIZADA";

export type TipoLibroTemplate =
  | "DIARIO_COMPRAS"
  | "DIARIO_VENTAS"
  | "DIARIO_MANUAL"
  | "CAJA_BANCOS";

export interface TemplateParametro {
  id: string;
  nombre: string;
  descripcion: string;
  tipo:
    | "MONTO"
    | "PORCENTAJE"
    | "CUENTA_PCGE"
    | "RUC"
    | "FECHA"
    | "PERIODO"
    | "TEXTO"
    | "MONEDA"
    | "TIPO_CAMBIO"
    | "SELECCION";
  requerido: boolean;
  valorDefault?: string | number;
  opciones?: { label: string; value: string | number }[];
  validacion?: { min?: number; max?: number; pattern?: string; customMessage?: string };
  sugerencia?: string;
}

export type FormulaMonto =
  | { tipo: "PARAMETRO"; paramId: string }
  | { tipo: "PORCENTAJE"; paramId: string; porcentaje: number }
  | { tipo: "SUMA"; formulas: FormulaMonto[] }
  | { tipo: "RESTA"; a: FormulaMonto; b: FormulaMonto }
  | { tipo: "MULTIPLICACION"; a: FormulaMonto; b: FormulaMonto }
  | { tipo: "DIVISION"; a: FormulaMonto; b: FormulaMonto }
  | { tipo: "TIPO_CAMBIO"; montoParamId: string; monedaOrigen: string; monedaDestino: string }
  | { tipo: "VALOR_FIJO"; valor: number };

export type FormulaCuenta =
  | { tipo: "FIJO"; codigo: string }
  | { tipo: "PARAMETRO"; paramId: string };

export type FormulaTexto =
  | { tipo: "FIJO"; texto: string }
  | { tipo: "PARAMETRO"; paramId: string }
  | { tipo: "FECHA_ACTUAL"; formato: string };

export type FormulaCondicion =
  | { tipo: "MAYOR_QUE"; paramId: string; valor: number }
  | { tipo: "MENOR_QUE"; paramId: string; valor: number }
  | { tipo: "IGUAL"; paramId: string; valor: string | number }
  | { tipo: "EXISTE"; paramId: string }
  | { tipo: "AND"; condiciones: FormulaCondicion[] }
  | { tipo: "OR"; condiciones: FormulaCondicion[] }
  | { tipo: "NOT"; condicion: FormulaCondicion };

export interface TemplateLinea {
  id: string;
  cuenta: string | FormulaCuenta;
  denominacionSugerida?: string;
  naturaleza: "D" | "A";
  monto: number | FormulaMonto;
  glosaLinea?: string | FormulaTexto;
  centroCosto?: string;
  condicion?: FormulaCondicion;
}

export interface TemplateValidacion {
  id: string;
  descripcion: string;
  tipo: "PARTIDA_DOBLE" | "MONTO_MINIMO" | "MONTO_MAXIMO" | "CUENTA_OBLIGATORIA" | "PORCENTAJE_MAXIMO";
  config: Record<string, unknown>;
  mensajeError: string;
}

export interface AsientoTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: TemplateCategoria;
  tipoLibro: TipoLibroTemplate;
  parametros: TemplateParametro[];
  lineas: TemplateLinea[];
  validaciones?: TemplateValidacion[];
  metadata: {
    version: string;
    autor: string;
    fechaCreacion: string;
    tags: string[];
    usoCount: number;
    ultimaUso?: string;
  };
}

export interface TemplateLineaGenerada {
  cuentaContable: string;
  denominacion: string;
  debe: number;
  haber: number;
  naturaleza: "D" | "A";
  glosaLinea: string;
  centroCosto?: string;
}

export interface TemplateEvaluacion {
  templateId: string;
  parametrosUsados: Record<string, unknown>;
  lineasGeneradas: TemplateLineaGenerada[];
  totalDebe: number;
  totalHaber: number;
  cuadra: boolean;
  diferencia: number;
  warnings: string[];
  errores: string[];
}

export interface AsientoProgramado {
  id: string;
  templateId: string;
  nombre: string;
  parametrosFijos: Record<string, unknown>;
  frecuencia: "DIARIO" | "SEMANAL" | "QUINCENAL" | "MENSUAL" | "BIMESTRAL" | "TRIMESTRAL" | "ANUAL";
  diaEjecucion: number;
  fechaInicio: string;
  fechaFin?: string;
  ultimaEjecucion?: string;
  proximaEjecucion: string;
  activo: boolean;
  generarAutomaticamente: boolean;
  notificarAntes: number;
  ruc?: string;
}

export interface AsientoLineaInput {
  cuenta: string;
  glosa: string;
  debe: number;
  haber: number;
}

export interface AsientoMetadata {
  fecha: string;
  periodo: string;
  glosa: string;
  ruc?: string;
  tipoLibro?: string;
}
