import {
  computeNivelFromCodigo,
  computePadreCodigo,
  nextChildLength,
  normalizePcgeCode,
} from "@/modules/contabilidad/pcge/utils/pcge-codigo";
import { PCGE_LONGITUDES_NIVEL, type PcgeNivel, type PlanContableCuenta } from "@/types/pcge";

/** Resultado de validación de jerarquía PCGE. */
export type ValidationResult = {
  valid: boolean;
  nivel: PcgeNivel | null;
  nivelNombre: string | null;
  padreEsperado: string | null;
  errors: string[];
  warnings: string[];
};

const VALID_LENGTHS = new Set([1, 2, 3, 4, 6, 8]);

const NIVEL_NOMBRES: Record<PcgeNivel, string> = {
  1: "Elemento",
  2: "Subelemento",
  3: "Cuenta Mayor",
  4: "Subcuenta",
  5: "Divisionaria",
  6: "Subdivisional",
};

/**
 * Valida jerarquía PCGE peruana (CONASEV).
 *
 * @example
 * validatePCGEHierarchy('101101') // → válido, nivel 5, padre 1011
 * validatePCGEHierarchy('101101', '1011') // → válido si prefijo coincide
 * validatePCGEHierarchy('101101', '102') // → inválido: no extiende al padre
 */
export function validatePCGEHierarchy(codigo: string, padreCodigo?: string | null): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const c = normalizePcgeCode(codigo);

  if (!c) {
    return {
      valid: false,
      nivel: null,
      nivelNombre: null,
      padreEsperado: null,
      errors: ["El código de cuenta es obligatorio"],
      warnings,
    };
  }

  if (!/^\d+$/.test(c)) {
    errors.push("El código solo puede contener dígitos (sin puntos ni letras)");
  }

  if (c.length < 1 || c.length > 8) {
    errors.push(`Longitud ${c.length} inválida: el PCGE admite entre 1 y 8 dígitos`);
  }

  if (!VALID_LENGTHS.has(c.length)) {
    errors.push(
      `Longitud ${c.length} no corresponde a un nivel PCGE válido. Use 1, 2, 3, 4, 6 u 8 dígitos`,
    );
  }

  const nivel = errors.length === 0 ? computeNivelFromCodigo(c) : null;
  const padreEsperado = c ? computePadreCodigo(c) : null;

  if (padreCodigo != null && padreCodigo !== "") {
    const padre = normalizePcgeCode(padreCodigo);
    if (!c.startsWith(padre)) {
      errors.push(
        `El código ${c} debe comenzar con el prefijo del padre ${padre} (jerarquía secuencial PCGE)`,
      );
    }
    const expectedChildLen = nextChildLength(padre);
    if (expectedChildLen != null && c.length !== expectedChildLen) {
      errors.push(
        `Bajo el padre ${padre} se espera un código de ${expectedChildLen} dígitos, no ${c.length}`,
      );
    }
  } else if (padreEsperado && c.length > 1) {
    warnings.push(`Padre esperado según estructura: ${padreEsperado}`);
  }

  if (c.length === 1 && padreCodigo) {
    errors.push("Las cuentas de nivel Elemento (1 dígito) no pueden tener padre");
  }

  return {
    valid: errors.length === 0,
    nivel,
    nivelNombre: nivel ? NIVEL_NOMBRES[nivel] : null,
    padreEsperado,
    errors,
    warnings,
  };
}

/**
 * Sugiere el código padre más cercano existente en el plan.
 *
 * @example
 * suggestParentCode('101101', ['1','10','101','1011']) // → '1011'
 * suggestParentCode('101101', ['1','10']) // → '10' (escala hacia arriba)
 */
export function suggestParentCode(
  codigo: string,
  codigosExistentes: Iterable<string>,
): string | null {
  const c = normalizePcgeCode(codigo);
  if (c.length <= 1) return null;

  const existing = new Set([...codigosExistentes].map(normalizePcgeCode));
  let candidate = computePadreCodigo(c);

  while (candidate) {
    if (existing.has(candidate)) return candidate;
    candidate = computePadreCodigo(candidate);
  }

  return null;
}

/**
 * Calcula el siguiente código hijo disponible bajo un padre.
 *
 * @example
 * getNextAvailableChildCode('101', ['101','1011','101101']) // → '102' si 102 libre
 * getNextAvailableChildCode('1011', ['1011','101101']) // → '101102' o similar
 */
export function getNextAvailableChildCode(
  padreCodigo: string,
  codigosExistentes: Iterable<string>,
): { codigo: string | null; warning?: string } {
  const padre = normalizePcgeCode(padreCodigo);
  const childLen = padre ? nextChildLength(padre) : 1;

  if (childLen == null) {
    return { codigo: null, warning: "Nivel máximo alcanzado: no se pueden crear hijos" };
  }

  const existing = new Set([...codigosExistentes].map(normalizePcgeCode));
  const hijos = [...existing].filter(
    (code) => code.startsWith(padre) && code.length === childLen,
  );

  if (hijos.length === 0) {
    const suffix = "1".padStart(childLen - padre.length, "0");
    return { codigo: padre + suffix };
  }

  const maxNum = Math.max(...hijos.map((h) => parseInt(h, 10)));
  const next = maxNum + 1;
  const nextStr = String(next).padStart(childLen, "0");

  if (nextStr.length > childLen) {
    return {
      codigo: null,
      warning: `Límite de secuencia alcanzado bajo ${padre} (ej. ${padre}99). Revise manualmente.`,
    };
  }

  if (existing.has(nextStr)) {
    return { codigo: null, warning: `El código ${nextStr} ya existe; requiere revisión manual` };
  }

  return { codigo: nextStr };
}

export type PcgeValidationReport = {
  total: number;
  validos: number;
  invalidos: PcgeCodeIssue[];
  huerfanos: PcgeCodeIssue[];
  duplicados: PcgeCodeIssue[];
};

export type PcgeCodeIssue = {
  codigo_cuenta: string;
  nombre_cuenta?: string;
  tipo: "invalido" | "huerfano" | "duplicado" | "prefijo_padre";
  mensaje: string;
  sugerencia?: string;
};

/**
 * Valida todo el plan contable en memoria.
 *
 * @example
 * validateAllPCGECodes(cuentas) // reporte con huérfanos e inválidos
 */
export function validateAllPCGECodes(cuentas: PlanContableCuenta[]): PcgeValidationReport {
  const invalidos: PcgeCodeIssue[] = [];
  const huerfanos: PcgeCodeIssue[] = [];
  const duplicados: PcgeCodeIssue[] = [];

  const byCode = new Map<string, PlanContableCuenta>();
  for (const c of cuentas) {
    const code = normalizePcgeCode(c.codigo_cuenta);
    if (byCode.has(code)) {
      duplicados.push({
        codigo_cuenta: code,
        nombre_cuenta: c.nombre_cuenta,
        tipo: "duplicado",
        mensaje: `Código duplicado: ${code}`,
      });
    }
    byCode.set(code, c);
  }

  const codes = [...byCode.keys()];

  for (const c of byCode.values()) {
    const code = normalizePcgeCode(c.codigo_cuenta);
    const padre = c.padre_codigo ? normalizePcgeCode(c.padre_codigo) : computePadreCodigo(code);
    const result = validatePCGEHierarchy(code, padre ?? undefined);

    if (!result.valid) {
      invalidos.push({
        codigo_cuenta: code,
        nombre_cuenta: c.nombre_cuenta,
        tipo: "invalido",
        mensaje: result.errors.join("; "),
        sugerencia: result.padreEsperado
          ? `Padre esperado: ${result.padreEsperado}`
          : undefined,
      });
    }

    if (padre && !byCode.has(padre)) {
      const sugerido = suggestParentCode(code, codes);
      huerfanos.push({
        codigo_cuenta: code,
        nombre_cuenta: c.nombre_cuenta,
        tipo: "huerfano",
        mensaje: `Padre ${padre} no existe en el plan`,
        sugerencia: sugerido ? `Padre sugerido: ${sugerido}` : "Crear cuenta padre o corregir jerarquía",
      });
    }

    if (padre && byCode.has(padre) && !code.startsWith(padre)) {
      invalidos.push({
        codigo_cuenta: code,
        nombre_cuenta: c.nombre_cuenta,
        tipo: "prefijo_padre",
        mensaje: `El código no extiende al padre registrado ${padre}`,
      });
    }
  }

  const issueCodes = new Set([
    ...invalidos.map((i) => i.codigo_cuenta),
    ...huerfanos.map((i) => i.codigo_cuenta),
    ...duplicados.map((i) => i.codigo_cuenta),
  ]);

  return {
    total: cuentas.length,
    validos: cuentas.length - issueCodes.size,
    invalidos,
    huerfanos,
    duplicados,
  };
}

/** Nombre del nivel en español contable. */
export function getNivelNombre(nivel: PcgeNivel | number): string {
  const n = nivel as PcgeNivel;
  return NIVEL_NOMBRES[n] ?? `Nivel ${nivel}`;
}

/** Clases Tailwind para badge por nivel. */
export function getColorNivel(nivel: PcgeNivel | number): string {
  const map: Record<number, string> = {
    1: "text-premium-gold border-premium-gold/40 bg-premium-gold/10",
    2: "text-premium-cyan border-premium-cyan/40 bg-premium-cyan/10",
    3: "text-foreground border-border/60 bg-muted/30",
    4: "text-success border-success/30 bg-success/10",
    5: "text-warning border-warning/30 bg-warning/10",
    6: "text-muted-foreground border-border/40 bg-muted/20",
  };
  return map[nivel] ?? map[6];
}

export { computeNivelFromCodigo as getNivelFromCodigo, NIVEL_NOMBRES, PCGE_LONGITUDES_NIVEL };
