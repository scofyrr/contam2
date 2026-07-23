import type {
  FilaAsientoImport,
  FilaComprobanteImport,
  FilaImportNormalizada,
  ImportacionTipoLote,
  PreflightError,
  PreflightRowResult,
  PreflightSummary,
} from "@/modules/importador/types/importador";
import { isFilaAsiento, isFilaComprobante } from "@/modules/importador/types/importador";

const MONTO_TOLERANCIA = 0.05;

const FACTORES_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function validarRucModulo11(ruc: string): boolean {
  const clean = ruc.replace(/\D/g, "");
  if (!/^\d{11}$/.test(clean)) return false;
  if (!/^(10|15|17|20)/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i], 10) * FACTORES_RUC[i];
  }
  let mod = 11 - (sum % 11);
  if (mod === 10) mod = 0;
  if (mod === 11) mod = 1;
  return mod === parseInt(clean[10], 10);
}

function validarFechaEnPeriodo(fecha: string, periodoActivo: string | null): PreflightError | null {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return { codigo: "FECHA_INVALIDA", mensaje: "Fecha inválida o vacía (use YYYY-MM-DD)", campo: "fecha" };
  }
  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { codigo: "FECHA_INVALIDA", mensaje: "Fecha no parseable", campo: "fecha" };
  }
  if (periodoActivo && periodoActivo.length === 6) {
    const rowPeriodo = fecha.replace(/-/g, "").slice(0, 6);
    if (rowPeriodo !== periodoActivo) {
      return {
        codigo: "FECHA_FUERA_PERIODO",
        mensaje: `Fecha ${fecha} no pertenece al periodo activo ${periodoActivo.slice(0, 4)}-${periodoActivo.slice(4, 6)}`,
        campo: "fecha",
      };
    }
  }
  return null;
}

function validarMontos(base: number, igv: number, total: number): PreflightError | null {
  if (base <= 0 && total <= 0) {
    return { codigo: "MONTO_CERO", mensaje: "Base y Total no pueden ser cero", campo: "total" };
  }
  const esperado = Math.round((base + igv) * 100) / 100;
  const diff = Math.abs(esperado - total);
  if (diff > MONTO_TOLERANCIA) {
    return {
      codigo: "DESCUADRE_MONTOS",
      mensaje: `Base (${base}) + IGV (${igv}) = ${esperado} ≠ Total (${total}). Diferencia ${diff.toFixed(2)}`,
      campo: "total",
    };
  }
  return null;
}

function claveComprobanteBd(row: FilaComprobanteImport): string {
  return `${row.tipoDoc}|${row.serie}|${row.numero}|${row.ruc}`;
}

function validarFilaComprobante(
  row: FilaComprobanteImport,
  periodoActivo: string | null,
  duplicadosArchivo: Set<string>,
  duplicadosBd: Set<string>,
): PreflightError[] {
  const errores: PreflightError[] = [];

  if (!row.ruc || row.ruc.length !== 11) {
    errores.push({ codigo: "RUC_FORMATO", mensaje: "RUC debe tener 11 dígitos", campo: "ruc" });
  } else if (!validarRucModulo11(row.ruc)) {
    errores.push({
      codigo: "RUC_MODULO11",
      mensaje: `RUC ${row.ruc} no pasa validación Módulo 11 SUNAT`,
      campo: "ruc",
    });
  }

  if (!row.serie?.trim()) {
    errores.push({ codigo: "SERIE_VACIA", mensaje: "Serie es obligatoria", campo: "serie" });
  }
  if (!row.numero?.trim()) {
    errores.push({ codigo: "NUMERO_VACIO", mensaje: "Número es obligatorio", campo: "numero" });
  }

  const fechaErr = validarFechaEnPeriodo(row.fecha, periodoActivo ?? row.periodo ?? null);
  if (fechaErr) errores.push(fechaErr);

  const montosErr = validarMontos(row.base, row.igv, row.total);
  if (montosErr) errores.push(montosErr);

  const clave = claveComprobanteBd(row);
  if (duplicadosArchivo.has(clave)) {
    errores.push({
      codigo: "DUPLICADO_ARCHIVO",
      mensaje: `Comprobante duplicado en archivo: ${row.serie}-${row.numero}`,
      campo: "numero",
    });
  } else {
    duplicadosArchivo.add(clave);
  }

  if (duplicadosBd.has(clave)) {
    errores.push({
      codigo: "DUPLICADO_BD",
      mensaje: `Comprobante ya existe en BD: ${row.serie}-${row.numero}`,
      campo: "numero",
    });
  }

  return errores;
}

function validarFilaAsiento(row: FilaAsientoImport, periodoActivo: string | null): PreflightError[] {
  const errores: PreflightError[] = [];

  const fechaErr = validarFechaEnPeriodo(row.fechaAsiento, periodoActivo ?? row.periodo);
  if (fechaErr) errores.push(fechaErr);

  if (!row.cuentaContable || row.cuentaContable.length < 2) {
    errores.push({
      codigo: "CUENTA_INVALIDA",
      mensaje: "Cuenta contable PCGE inválida",
      campo: "cuentaContable",
    });
  }

  if (row.debe <= 0 && row.haber <= 0) {
    errores.push({
      codigo: "DEBE_HABER_CERO",
      mensaje: "Debe o Haber debe ser mayor a cero",
      campo: "debe",
    });
  }

  if (row.debe > 0 && row.haber > 0) {
    errores.push({
      codigo: "DEBE_HABER_AMBOS",
      mensaje: "Una línea no puede tener Debe y Haber simultáneamente",
      campo: "haber",
    });
  }

  return errores;
}

export function ejecutarPreflightValidacion(params: {
  filas: FilaImportNormalizada[];
  tipoLote: ImportacionTipoLote;
  periodoActivo: string | null;
  duplicadosEnBd?: Set<string>;
}): PreflightSummary {
  const duplicadosArchivo = new Set<string>();
  const duplicadosBd = params.duplicadosEnBd ?? new Set<string>();
  const resultados: PreflightRowResult[] = [];

  for (const fila of params.filas) {
    let errores: PreflightError[] = [];

    if (params.tipoLote === "ASIENTOS_MANUALES" && isFilaAsiento(fila)) {
      errores = validarFilaAsiento(fila, params.periodoActivo);
    } else if (isFilaComprobante(fila)) {
      errores = validarFilaComprobante(fila, params.periodoActivo, duplicadosArchivo, duplicadosBd);
    } else {
      errores.push({ codigo: "TIPO_FILA", mensaje: "Tipo de fila no reconocido para el lote" });
    }

    resultados.push({
      filaNumero: fila.filaNumero,
      datos: fila,
      estado: errores.length === 0 ? "VALIDO" : "ERROR",
      errores,
    });
  }

  const validos = resultados.filter((r) => r.estado === "VALIDO").length;

  return {
    total: resultados.length,
    validos,
    errores: resultados.length - validos,
    filas: resultados,
  };
}

export function filaComprobanteToDatosRaw(row: FilaComprobanteImport): Record<string, unknown> {
  return {
    ruc: row.ruc,
    razon_social: row.razonSocial,
    tipo_doc: row.tipoDoc,
    serie: row.serie,
    numero: row.numero,
    fecha: row.fecha,
    moneda: row.moneda,
    base: row.base,
    igv: row.igv,
    total: row.total,
    periodo: row.periodo,
    tipo_cambio: row.tipoCambio ?? 1,
  };
}

export function filaAsientoToDatosRaw(row: FilaAsientoImport): Record<string, unknown> {
  return {
    fecha_asiento: row.fechaAsiento,
    periodo: row.periodo,
    cuenta_contable: row.cuentaContable,
    debe: row.debe,
    haber: row.haber,
    glosa: row.glosa,
    tipo_registro: row.tipoRegistro ?? "COMPRA",
    ruc_contraparte: row.rucContraparte ?? "",
    nombre_contraparte: row.nombreContraparte ?? "",
    serie: row.serie ?? "",
    numero: row.numero ?? "",
  };
}

export function buildClavesComprobanteBd(
  rows: Array<{ serie: string | null; nro: string; tipo: string }>,
): Set<string> {
  const set = new Set<string>();
  for (const r of rows) {
    set.add(`${r.tipo}|${r.serie ?? ""}|${r.nro}`);
  }
  return set;
}
