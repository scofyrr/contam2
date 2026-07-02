import type { LineaAsientoInput } from "@/lib/sire-types";
import type { AsientoMetadata } from "@/modules/contabilidad/diario/types/templates";

export interface ValidacionError {
  codigo: string;
  mensaje: string;
  lineaIndices?: number[];
  severidad: "ERROR" | "CRITICAL";
}

export interface ValidacionWarning {
  codigo: string;
  mensaje: string;
  lineaIndices?: number[];
  sugerencia?: string;
}

export interface AsientoValidacion {
  esValido: boolean;
  errores: ValidacionError[];
  warnings: ValidacionWarning[];
  sugerencias: string[];
}

export interface LineaValidacion {
  valida: boolean;
  errores: ValidacionError[];
  warnings: ValidacionWarning[];
}

export interface AsientoLineaInputValidator {
  cuenta: string;
  glosa: string;
  debe: number;
  haber: number;
}

const CUENTAS_AGRUPADORAS = /^[1-6](0{4,}|000)$/;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function validarLinea(
  linea: AsientoLineaInputValidator,
  _lineasExistentes: AsientoLineaInputValidator[],
  cuentasValidas?: Set<string>,
): LineaValidacion {
  const errores: ValidacionError[] = [];
  const warnings: ValidacionWarning[] = [];
  const cuenta = linea.cuenta.replace(/\./g, "").trim();
  const debe = round2(Number(linea.debe ?? 0));
  const haber = round2(Number(linea.haber ?? 0));

  if (!cuenta) {
    errores.push({ codigo: "CUENTA_VACIA", mensaje: "Seleccione una cuenta PCGE", severidad: "ERROR" });
  } else if (cuentasValidas && cuentasValidas.size > 0 && !cuentasValidas.has(cuenta)) {
    errores.push({ codigo: "CUENTA_NO_EXISTE", mensaje: `Cuenta ${cuenta} no existe en PCGE`, severidad: "ERROR" });
  } else if (CUENTAS_AGRUPADORAS.test(cuenta.slice(0, 2))) {
    errores.push({ codigo: "CUENTA_AGRUPADORA", mensaje: "No use cuentas agrupadoras de nivel 1-2", severidad: "ERROR" });
  }

  if (debe === 0 && haber === 0) {
    errores.push({ codigo: "MONTO_CERO", mensaje: "La línea debe tener debe o haber", severidad: "ERROR" });
  }
  if (debe > 0 && haber > 0) {
    warnings.push({ codigo: "DEBE_HABER_AMBOS", mensaje: "Línea con debe y haber simultáneos", sugerencia: "Deje uno en cero" });
  }
  if (linea.glosa.trim().length < 3) {
    warnings.push({ codigo: "GLOSA_CORTA", mensaje: "Glosa muy corta", sugerencia: "Describa el movimiento con más detalle" });
  }

  return { valida: errores.length === 0, errores, warnings };
}

export function validarAsientoCompleto(
  lineas: AsientoLineaInput[],
  metadata: AsientoMetadata,
  options?: { cuentasValidas?: Set<string>; periodoCerrado?: boolean },
): AsientoValidacion {
  const errores: ValidacionError[] = [];
  const warnings: ValidacionWarning[] = [];
  const sugerencias: string[] = [];

  if (!lineas.length) {
    errores.push({ codigo: "LINEAS_VACIAS", mensaje: "El asiento no tiene líneas", severidad: "CRITICAL" });
    return { esValido: false, errores, warnings, sugerencias };
  }

  if (!metadata.glosa?.trim()) {
    errores.push({ codigo: "GLOSA_VACIA", mensaje: "Indique una glosa descriptiva", severidad: "ERROR" });
  }

  const hoy = new Date().toISOString().slice(0, 10);
  if (metadata.fecha > hoy) {
    errores.push({ codigo: "FECHA_FUTURA", mensaje: "La fecha del asiento no puede ser futura", severidad: "CRITICAL" });
  }

  const hace365 = new Date();
  hace365.setDate(hace365.getDate() - 365);
  if (metadata.fecha < hace365.toISOString().slice(0, 10)) {
    warnings.push({ codigo: "FECHA_ANTERIOR_CIERRE", mensaje: "Fecha anterior a 365 días", sugerencia: "Verifique el período contable" });
  }

  const dow = new Date(metadata.fecha + "T12:00:00").getDay();
  if (dow === 0 || dow === 6) {
    warnings.push({ codigo: "FECHA_FIN_DE_SEMANA", mensaje: "Asiento en fin de semana" });
  }

  if (options?.periodoCerrado) {
    errores.push({ codigo: "PERIODO_CERRADO", mensaje: "El período contable está cerrado", severidad: "CRITICAL" });
  }

  lineas.forEach((l, i) => {
    const v = validarLinea(l, lineas, options?.cuentasValidas);
    v.errores.forEach((e) => errores.push({ ...e, lineaIndices: [i] }));
    v.warnings.forEach((w) => warnings.push({ ...w, lineaIndices: [i] }));
  });

  const totalDebe = round2(lineas.reduce((s, l) => s + Number(l.debe ?? 0), 0));
  const totalHaber = round2(lineas.reduce((s, l) => s + Number(l.haber ?? 0), 0));
  const diff = round2(totalDebe - totalHaber);

  if (Math.abs(diff) > 0.001) {
    errores.push({
      codigo: "PARTIDA_DOBLE_DESCUADRADA",
      mensaje: `Debe S/ ${totalDebe.toFixed(2)} ≠ Haber S/ ${totalHaber.toFixed(2)} (dif. ${diff.toFixed(2)})`,
      severidad: "CRITICAL",
    });
    if (diff > 0) {
      sugerencias.push(`Agregue S/ ${Math.abs(diff).toFixed(2)} al haber para cuadrar`);
    } else {
      sugerencias.push(`Agregue S/ ${Math.abs(diff).toFixed(2)} al debe para cuadrar`);
    }
  }

  if (!metadata.ruc?.trim() && (metadata.tipoLibro?.includes("COMPRAS") || metadata.tipoLibro?.includes("VENTAS"))) {
    warnings.push({ codigo: "SIN_RUC_CONTRAPARTE", mensaje: "Sin RUC contraparte", sugerencia: "Registre el RUC del tercero" });
  }

  const montosAltos = lineas.filter((l) => Math.max(Number(l.debe), Number(l.haber)) > 100000);
  if (montosAltos.length) {
    warnings.push({ codigo: "MONTO_INUSUAL", mensaje: `${montosAltos.length} línea(s) con montos elevados` });
  }

  const criticos = errores.filter((e) => e.severidad === "CRITICAL");
  return {
    esValido: criticos.length === 0 && errores.length === 0,
    errores,
    warnings,
    sugerencias,
  };
}

export const asientoValidatorService = {
  validarLinea,
  validarAsientoCompleto,
};
