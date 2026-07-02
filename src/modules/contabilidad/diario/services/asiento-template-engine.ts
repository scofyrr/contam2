import type {
  AsientoProgramado,
  AsientoTemplate,
  FormulaCondicion,
  FormulaCuenta,
  FormulaMonto,
  FormulaTexto,
  TemplateEvaluacion,
  TemplateLinea,
  TemplateLineaGenerada,
  TemplateParametro,
} from "@/modules/contabilidad/diario/types/templates";

const round2 = (n: number) => Math.round(n * 100) / 100;

function pNum(params: Record<string, unknown>, id: string): number {
  const v = params[id];
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function pStr(params: Record<string, unknown>, id: string): string {
  return String(params[id] ?? "").trim();
}

export function resolverFormulaMonto(formula: FormulaMonto, params: Record<string, unknown>): number {
  switch (formula.tipo) {
    case "VALOR_FIJO":
      return round2(formula.valor);
    case "PARAMETRO":
      return round2(pNum(params, formula.paramId));
    case "PORCENTAJE":
      return round2((pNum(params, formula.paramId) * formula.porcentaje) / 100);
    case "SUMA":
      return round2(formula.formulas.reduce((s, f) => s + resolverFormulaMonto(f, params), 0));
    case "RESTA":
      return round2(resolverFormulaMonto(formula.a, params) - resolverFormulaMonto(formula.b, params));
    case "MULTIPLICACION":
      return round2(resolverFormulaMonto(formula.a, params) * resolverFormulaMonto(formula.b, params));
    case "DIVISION": {
      const b = resolverFormulaMonto(formula.b, params);
      if (Math.abs(b) < 0.0001) return 0;
      return round2(resolverFormulaMonto(formula.a, params) / b);
    }
    case "TIPO_CAMBIO": {
      const me = pNum(params, formula.montoParamId);
      const tc = pNum(params, "tipoCambioActual") || pNum(params, "tipoCambio");
      return round2(me * tc);
    }
    default:
      return 0;
  }
}

function resolverCuenta(cuenta: string | FormulaCuenta, params: Record<string, unknown>): string {
  if (typeof cuenta === "string") return cuenta;
  if (cuenta.tipo === "FIJO") return cuenta.codigo;
  return pStr(params, cuenta.paramId) || cuenta.codigo;
}

function resolverTexto(texto: string | FormulaTexto | undefined, params: Record<string, unknown>): string {
  if (!texto) return "";
  if (typeof texto === "string") return texto;
  if (texto.tipo === "FIJO") return texto.texto;
  if (texto.tipo === "PARAMETRO") return pStr(params, texto.paramId);
  if (texto.tipo === "FECHA_ACTUAL") return new Date().toISOString().slice(0, 10);
  return "";
}

function evaluarCondicion(cond: FormulaCondicion, params: Record<string, unknown>): boolean {
  switch (cond.tipo) {
    case "MAYOR_QUE":
      return pNum(params, cond.paramId) > cond.valor;
    case "MENOR_QUE":
      return pNum(params, cond.paramId) < cond.valor;
    case "IGUAL":
      return pStr(params, cond.paramId) === String(cond.valor);
    case "EXISTE":
      return params[cond.paramId] != null && pStr(params, cond.paramId) !== "";
    case "AND":
      return cond.condiciones.every((c) => evaluarCondicion(c, params));
    case "OR":
      return cond.condiciones.some((c) => evaluarCondicion(c, params));
    case "NOT":
      return !evaluarCondicion(cond.condicion, params);
    default:
      return true;
  }
}

function validarParametros(template: AsientoTemplate, params: Record<string, unknown>): string[] {
  const errores: string[] = [];
  for (const p of template.parametros) {
    if (!p.requerido) continue;
    const v = params[p.id];
    if (v == null || String(v).trim() === "") {
      errores.push(`Parámetro requerido: ${p.nombre}`);
    }
    if (p.tipo === "MONTO" || p.tipo === "PORCENTAJE") {
      const n = pNum(params, p.id);
      if (p.validacion?.min != null && n < p.validacion.min) {
        errores.push(p.validacion.customMessage ?? `${p.nombre} debe ser >= ${p.validacion.min}`);
      }
    }
  }
  return errores;
}

function evaluarLinea(linea: TemplateLinea, params: Record<string, unknown>): TemplateLineaGenerada | null {
  if (linea.condicion && !evaluarCondicion(linea.condicion, params)) return null;

  const monto =
    typeof linea.monto === "number" ? round2(linea.monto) : round2(resolverFormulaMonto(linea.monto, params));
  if (monto <= 0) return null;

  const cuenta = resolverCuenta(linea.cuenta, params);
  const glosa = resolverTexto(linea.glosaLinea, params) || linea.denominacionSugerida || "";

  return {
    cuentaContable: cuenta,
    denominacion: linea.denominacionSugerida ?? cuenta,
    debe: linea.naturaleza === "D" ? monto : 0,
    haber: linea.naturaleza === "A" ? monto : 0,
    naturaleza: linea.naturaleza,
    glosaLinea: glosa,
    centroCosto: linea.centroCosto,
  };
}

export const PLANTILLAS_PREDEFINIDAS: AsientoTemplate[] = [
  {
    id: "tpl-planilla-mensual",
    nombre: "Provisión de Planilla Mensual",
    descripcion: "Sueldos, ESSALUD y ONP",
    categoria: "PLANILLA",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoBruto", nombre: "Sueldo bruto", descripcion: "Total planilla", tipo: "MONTO", requerido: true },
      { id: "porcentajeESSALUD", nombre: "% ESSALUD", tipo: "PORCENTAJE", requerido: false, valorDefault: 9 },
      { id: "porcentajeONP", nombre: "% ONP", tipo: "PORCENTAJE", requerido: false, valorDefault: 13 },
      { id: "cuentaGasto", nombre: "Cuenta gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621101" },
      { id: "cuentaRemuneraciones", nombre: "Remuneraciones por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411101" },
      { id: "cuentaESSALUD", nombre: "ESSALUD por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "403101" },
      { id: "cuentaONP", nombre: "ONP por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "403102" },
      { id: "periodo", nombre: "Período", tipo: "PERIODO", requerido: true },
    ],
    lineas: [
      { id: "l1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "PARAMETRO", paramId: "sueldoBruto" }, glosaLinea: { tipo: "FIJO", texto: "Gasto de personal" }, denominacionSugerida: "Gasto de Personal" },
      { id: "l2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaRemuneraciones" }, naturaleza: "A", monto: { tipo: "RESTA", a: { tipo: "PARAMETRO", paramId: "sueldoBruto" }, b: { tipo: "SUMA", formulas: [{ tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 9 }, { tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 13 }] } }, glosaLinea: { tipo: "FIJO", texto: "Remuneraciones por pagar" } },
      { id: "l3", cuenta: { tipo: "PARAMETRO", paramId: "cuentaESSALUD" }, naturaleza: "A", monto: { tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 9 }, glosaLinea: { tipo: "FIJO", texto: "ESSALUD por pagar" } },
      { id: "l4", cuenta: { tipo: "PARAMETRO", paramId: "cuentaONP" }, naturaleza: "A", monto: { tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 13 }, glosaLinea: { tipo: "FIJO", texto: "ONP por pagar" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["planilla", "rrhh"], usoCount: 0 },
  },
  {
    id: "tpl-gratificaciones",
    nombre: "Provisión de Gratificaciones",
    categoria: "PROVISION",
    descripcion: "Julio / Diciembre",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoBase", nombre: "Sueldo base", tipo: "MONTO", requerido: true },
      { id: "mesesTrabajados", nombre: "Meses trabajados", tipo: "MONTO", requerido: true, valorDefault: 6 },
      { id: "cuentaGasto", nombre: "Cuenta gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621102" },
      { id: "cuentaProvision", nombre: "Provisión", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411102" },
    ],
    lineas: [
      { id: "g1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoBase" }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 6 } }, glosaLinea: { tipo: "FIJO", texto: "Gratificación devengada" } },
      { id: "g2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaProvision" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoBase" }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 6 } }, glosaLinea: { tipo: "FIJO", texto: "Provisión gratificaciones" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["gratificacion"], usoCount: 0 },
  },
  {
    id: "tpl-cts",
    nombre: "Provisión de CTS",
    categoria: "PROVISION",
    descripcion: "Mayo / Noviembre",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoBase", nombre: "Sueldo base", tipo: "MONTO", requerido: true },
      { id: "mesesTrabajados", nombre: "Meses", tipo: "MONTO", requerido: true, valorDefault: 12 },
      { id: "asignacionFamiliar", nombre: "Asignación familiar", tipo: "MONTO", requerido: false, valorDefault: 0 },
      { id: "cuentaGasto", nombre: "Gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621103" },
      { id: "cuentaProvision", nombre: "Provisión CTS", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411103" },
    ],
    lineas: [
      { id: "c1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "sueldoBase" }, { tipo: "PARAMETRO", paramId: "asignacionFamiliar" }] }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "CTS devengada" } },
      { id: "c2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaProvision" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "sueldoBase" }, { tipo: "PARAMETRO", paramId: "asignacionFamiliar" }] }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Provisión CTS" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["cts"], usoCount: 0 },
  },
  {
    id: "tpl-depreciacion",
    nombre: "Depreciación Mensual (Línea Recta)",
    categoria: "DEPRECIACION",
    descripcion: "Activo fijo",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "valorActivo", nombre: "Valor activo", tipo: "MONTO", requerido: true },
      { id: "vidaUtilMeses", nombre: "Vida útil (meses)", tipo: "MONTO", requerido: true },
      { id: "cuentaGasto", nombre: "Gasto depreciación", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "681101" },
      { id: "cuentaDepreciacion", nombre: "Depreciación acumulada", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "391101" },
    ],
    lineas: [
      { id: "d1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "PARAMETRO", paramId: "valorActivo" }, b: { tipo: "PARAMETRO", paramId: "vidaUtilMeses" } }, glosaLinea: { tipo: "FIJO", texto: "Depreciación del mes" } },
      { id: "d2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaDepreciacion" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "PARAMETRO", paramId: "valorActivo" }, b: { tipo: "PARAMETRO", paramId: "vidaUtilMeses" } }, glosaLinea: { tipo: "FIJO", texto: "Depreciación acumulada" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["activo"], usoCount: 0 },
  },
  {
    id: "tpl-intereses",
    nombre: "Devengado de Intereses",
    categoria: "DEVENGADO",
    descripcion: "Préstamo mensual",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "saldoPrestamo", nombre: "Saldo préstamo", tipo: "MONTO", requerido: true },
      { id: "tasaInteresAnual", nombre: "Tasa anual %", tipo: "PORCENTAJE", requerido: true },
      { id: "cuentaGasto", nombre: "Gasto financiero", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "671101" },
      { id: "cuentaIntereses", nombre: "Intereses por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "469101" },
    ],
    lineas: [
      { id: "i1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "saldoPrestamo" }, b: { tipo: "PORCENTAJE", paramId: "tasaInteresAnual", porcentaje: 1 } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Intereses devengados" } },
      { id: "i2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaIntereses" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "saldoPrestamo" }, b: { tipo: "PORCENTAJE", paramId: "tasaInteresAnual", porcentaje: 1 } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Intereses por pagar" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["financiero"], usoCount: 0 },
  },
  {
    id: "tpl-ir-anual",
    nombre: "Provisión Impuesto a la Renta",
    categoria: "IMPUESTO",
    descripcion: "Cierre anual",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "utilidadContable", nombre: "Utilidad contable", tipo: "MONTO", requerido: true },
      { id: "tasaIR", nombre: "Tasa IR %", tipo: "PORCENTAJE", requerido: false, valorDefault: 29.5 },
    ],
    lineas: [
      { id: "ir1", cuenta: { tipo: "FIJO", codigo: "881101" }, naturaleza: "D", monto: { tipo: "PORCENTAJE", paramId: "utilidadContable", porcentaje: 29.5 }, glosaLinea: { tipo: "FIJO", texto: "Impuesto a la renta" } },
      { id: "ir2", cuenta: { tipo: "FIJO", codigo: "401721" }, naturaleza: "A", monto: { tipo: "PORCENTAJE", paramId: "utilidadContable", porcentaje: 29.5 }, glosaLinea: { tipo: "FIJO", texto: "IR por pagar" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["impuesto"], usoCount: 0 },
  },
  {
    id: "tpl-vacaciones",
    nombre: "Provisión de Vacaciones",
    categoria: "PROVISION",
    descripcion: "Devengo mensual",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoMensual", nombre: "Sueldo mensual", tipo: "MONTO", requerido: true },
      { id: "mesesDevengados", nombre: "Meses devengados", tipo: "MONTO", requerido: true, valorDefault: 12 },
      { id: "cuentaGasto", nombre: "Gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621104" },
      { id: "cuentaProvision", nombre: "Provisión", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411104" },
    ],
    lineas: [
      { id: "v1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoMensual" }, b: { tipo: "PARAMETRO", paramId: "mesesDevengados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Vacaciones devengadas" } },
      { id: "v2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaProvision" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoMensual" }, b: { tipo: "PARAMETRO", paramId: "mesesDevengados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Provisión vacaciones" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["vacaciones"], usoCount: 0 },
  },
  {
    id: "tpl-castigo",
    nombre: "Castigo Cuentas Incobrables",
    categoria: "AJUSTE",
    descripcion: "CXC incobrable",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "montoCastigo", nombre: "Monto castigo", tipo: "MONTO", requerido: true },
      { id: "cuentaCobranzaDudosa", nombre: "CXC", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "121201" },
      { id: "cuentaGasto", nombre: "Gasto castigo", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "681201" },
    ],
    lineas: [
      { id: "ci1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "PARAMETRO", paramId: "montoCastigo" }, glosaLinea: { tipo: "FIJO", texto: "Castigo incobrable" } },
      { id: "ci2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaCobranzaDudosa" }, naturaleza: "A", monto: { tipo: "PARAMETRO", paramId: "montoCastigo" }, glosaLinea: { tipo: "FIJO", texto: "Baja CXC" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["cxc"], usoCount: 0 },
  },
  {
    id: "tpl-costo-ventas",
    nombre: "Consumo de Inventario",
    categoria: "AJUSTE",
    descripcion: "Costo de ventas",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "inventarioInicial", nombre: "Inv. inicial", tipo: "MONTO", requerido: true },
      { id: "compras", nombre: "Compras", tipo: "MONTO", requerido: true },
      { id: "inventarioFinal", nombre: "Inv. final", tipo: "MONTO", requerido: true },
      { id: "cuentaCosto", nombre: "Costo ventas", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "691101" },
      { id: "cuentaInventario", nombre: "Inventario", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "201101" },
    ],
    lineas: [
      { id: "cv1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaCosto" }, naturaleza: "D", monto: { tipo: "RESTA", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "inventarioInicial" }, { tipo: "PARAMETRO", paramId: "compras" }] }, b: { tipo: "PARAMETRO", paramId: "inventarioFinal" } }, glosaLinea: { tipo: "FIJO", texto: "Costo de ventas" } },
      { id: "cv2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaInventario" }, naturaleza: "A", monto: { tipo: "RESTA", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "inventarioInicial" }, { tipo: "PARAMETRO", paramId: "compras" }] }, b: { tipo: "PARAMETRO", paramId: "inventarioFinal" } }, glosaLinea: { tipo: "FIJO", texto: "Salida inventario" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["inventario"], usoCount: 0 },
  },
  {
    id: "tpl-diferencia-cambio",
    nombre: "Diferencia de Cambio",
    categoria: "AJUSTE",
    descripcion: "Ajuste por variación TC",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "montoUSD", nombre: "Monto USD", tipo: "MONTO", requerido: true },
      { id: "tipoCambioAnterior", nombre: "TC anterior", tipo: "TIPO_CAMBIO", requerido: true },
      { id: "tipoCambioActual", nombre: "TC actual", tipo: "TIPO_CAMBIO", requerido: true },
      { id: "cuentaActivo", nombre: "Cuenta ME", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "121201" },
      { id: "cuentaGanancia", nombre: "Ganancia DC", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "776101" },
      { id: "cuentaPerdida", nombre: "Pérdida DC", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "676101" },
    ],
    lineas: [
      { id: "dc1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaActivo" }, naturaleza: "D", monto: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "montoUSD" }, b: { tipo: "RESTA", a: { tipo: "PARAMETRO", paramId: "tipoCambioActual" }, b: { tipo: "PARAMETRO", paramId: "tipoCambioAnterior" } } }, condicion: { tipo: "MAYOR_QUE", paramId: "tipoCambioActual", valor: 0 }, glosaLinea: { tipo: "FIJO", texto: "Ajuste activo ME" } },
      { id: "dc2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGanancia" }, naturaleza: "A", monto: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "montoUSD" }, b: { tipo: "RESTA", a: { tipo: "PARAMETRO", paramId: "tipoCambioActual" }, b: { tipo: "PARAMETRO", paramId: "tipoCambioAnterior" } } }, glosaLinea: { tipo: "FIJO", texto: "Ganancia diferencia de cambio" } },
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["moneda"], usoCount: 0 },
  },
];

export class AsientoTemplateEngine {
  private templates: Map<string, AsientoTemplate>;

  constructor(extra: AsientoTemplate[] = []) {
    this.templates = new Map([...PLANTILLAS_PREDEFINIDAS, ...extra].map((t) => [t.id, t]));
  }

  listarPlantillas(): AsientoTemplate[] {
    return [...this.templates.values()];
  }

  obtenerPlantilla(id: string): AsientoTemplate | undefined {
    return this.templates.get(id);
  }

  evaluarTemplate(templateId: string, parametros: Record<string, unknown>): TemplateEvaluacion {
    const template = this.templates.get(templateId);
    if (!template) {
      return {
        templateId,
        parametrosUsados: parametros,
        lineasGeneradas: [],
        totalDebe: 0,
        totalHaber: 0,
        cuadra: false,
        diferencia: 0,
        warnings: [],
        errores: [`Plantilla no encontrada: ${templateId}`],
      };
    }

    const merged = { ...Object.fromEntries(template.parametros.map((p) => [p.id, p.valorDefault])), ...parametros };
    const errores = validarParametros(template, merged);
    const warnings: string[] = [];
    const lineasGeneradas: TemplateLineaGenerada[] = [];

    for (const linea of template.lineas) {
      const gen = evaluarLinea(linea, merged);
      if (gen) lineasGeneradas.push(gen);
    }

    const totalDebe = round2(lineasGeneradas.reduce((s, l) => s + l.debe, 0));
    const totalHaber = round2(lineasGeneradas.reduce((s, l) => s + l.haber, 0));
    const diferencia = round2(totalDebe - totalHaber);

    if (Math.abs(diferencia) > 0.01) {
      errores.push(`Partida doble descuadrada: diferencia S/ ${diferencia.toFixed(2)}`);
    }

    return {
      templateId,
      parametrosUsados: merged,
      lineasGeneradas,
      totalDebe,
      totalHaber,
      cuadra: Math.abs(diferencia) <= 0.01,
      diferencia,
      warnings,
      errores,
    };
  }

  previsualizarAsiento(templateId: string, parametros: Record<string, unknown>) {
    return this.evaluarTemplate(templateId, parametros);
  }

  aLineasAsiento(evaluacion: TemplateEvaluacion, glosaBase?: string): import("@/lib/sire-types").LineaAsientoInput[] {
    return evaluacion.lineasGeneradas.map((l, i) => ({
      orden: i + 1,
      cuenta: l.cuentaContable,
      glosa: l.glosaLinea || glosaBase || "",
      debe: l.debe,
      haber: l.haber,
    }));
  }
}

const PROGRAMADOS_KEY = "contam-asientos-programados";

export async function programarAsiento(config: Omit<AsientoProgramado, "id">): Promise<string> {
  const id = crypto.randomUUID();
  const item: AsientoProgramado = { ...config, id };
  const prev = JSON.parse(localStorage.getItem(PROGRAMADOS_KEY) ?? "[]") as AsientoProgramado[];
  localStorage.setItem(PROGRAMADOS_KEY, JSON.stringify([item, ...prev]));
  return id;
}

export async function obtenerAsientosProgramados(activos?: boolean): Promise<AsientoProgramado[]> {
  const list = JSON.parse(localStorage.getItem(PROGRAMADOS_KEY) ?? "[]") as AsientoProgramado[];
  return activos ? list.filter((x) => x.activo) : list;
}

export function calcularProximaEjecucion(frecuencia: AsientoProgramado["frecuencia"], desde: Date): string {
  const d = new Date(desde);
  if (frecuencia === "MENSUAL") d.setMonth(d.getMonth() + 1);
  else if (frecuencia === "TRIMESTRAL") d.setMonth(d.getMonth() + 3);
  else if (frecuencia === "ANUAL") d.setFullYear(d.getFullYear() + 1);
  else d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export const asientoTemplateEngine = new AsientoTemplateEngine();
