import type { PcgeNivel } from "@/types/pcge";
import { PCGE_LONGITUDES_NIVEL } from "@/types/pcge";

/** Elimina puntos y caracteres no numéricos del código PCGE. */
export function normalizePcgeCode(input: string | null | undefined): string {
  return String(input ?? "")
    .trim()
    .replace(/\./g, "")
    .replace(/\D/g, "");
}

/** Nivel jerárquico según longitud del código (PCGE Perú). */
export function computeNivelFromCodigo(codigo: string): PcgeNivel {
  const len = normalizePcgeCode(codigo).length;
  if (len <= 1) return 1;
  if (len <= 2) return 2;
  if (len <= 3) return 3;
  if (len <= 4) return 4;
  if (len <= 6) return 5;
  return 6;
}

/** Código padre inmediato según estructura secuencial. */
export function computePadreCodigo(codigo: string): string | null {
  const c = normalizePcgeCode(codigo);
  if (c.length <= 1) return null;
  if (c.length === 2) return c.slice(0, 1);
  if (c.length === 3) return c.slice(0, 2);
  if (c.length === 4) return c.slice(0, 3);
  if (c.length <= 6) return c.slice(0, 4);
  return c.slice(0, 6);
}

export function validatePcgeCode(codigo: string): string | null {
  const c = normalizePcgeCode(codigo);
  if (!c) return "El código de cuenta es obligatorio";
  if (!/^\d+$/.test(c)) return "Solo se permiten dígitos (sin puntos)";
  const len = c.length;
  const validLengths = Object.values(PCGE_LONGITUDES_NIVEL);
  if (!validLengths.includes(len as (typeof validLengths)[number])) {
    return `Longitud inválida (${len}). Use 1, 2, 3, 4, 6 u 8 dígitos según el nivel PCGE`;
  }
  return null;
}

export function formatCuentaPcge(cuenta: {
  codigo_cuenta: string;
  nombre_cuenta: string;
}): string {
  return `${normalizePcgeCode(cuenta.codigo_cuenta)} — ${cuenta.nombre_cuenta}`;
}

/** Formato corto código + denominación. */
export function formatCuenta(codigo: string, denominacion: string): string {
  return `${normalizePcgeCode(codigo)} - ${denominacion}`;
}

/** Siguiente longitud al crear hijo bajo un padre. */
export function nextChildLength(padreCodigo: string): number | null {
  const len = normalizePcgeCode(padreCodigo).length;
  if (len === 1) return 2;
  if (len === 2) return 3;
  if (len === 3) return 4;
  if (len === 4) return 6;
  if (len === 6) return 8;
  return null;
}
