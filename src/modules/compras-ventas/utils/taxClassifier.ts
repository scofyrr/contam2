import type { DestinoIgv } from "@/modules/compras-ventas/types/comprasVentas";

export interface CreditoFiscalResult {
  igvCreditoFiscal: number;
  igvCostoGasto: number;
  porcentajeCredito: number;
}

export type CodigoDetraccionSunat =
  | "SERVICIOS"
  | "TRANSPORTE"
  | "ARRENDAMIENTO"
  | "CONSTRUCCION"
  | "OTROS";

const TASAS_DETRACCION: Record<CodigoDetraccionSunat, number> = {
  SERVICIOS: 12,
  TRANSPORTE: 4,
  ARRENDAMIENTO: 10,
  CONSTRUCCION: 4,
  OTROS: 12,
};

const FACTOR_PRORRATA_DEFAULT = 0.5;

export function calcularCreditoFiscalIgv(
  baseImponible: number,
  igv: number,
  destino: DestinoIgv,
  factorProrrata = FACTOR_PRORRATA_DEFAULT,
): CreditoFiscalResult {
  const igvCalc = igv > 0 ? igv : Math.round(baseImponible * 0.18 * 100) / 100;
  let igvCreditoFiscal = 0;

  switch (destino) {
    case "DESTINO_1_GRAVADO":
      igvCreditoFiscal = igvCalc;
      break;
    case "DESTINO_2_MIXTO":
      igvCreditoFiscal = Math.round(igvCalc * factorProrrata * 100) / 100;
      break;
    case "DESTINO_3_NO_GRAVADO":
    case "SIN_CREDITO_FISCAL":
      igvCreditoFiscal = 0;
      break;
  }

  const igvCostoGasto = Math.round(Math.max(igvCalc - igvCreditoFiscal, 0) * 100) / 100;
  const porcentajeCredito = igvCalc > 0 ? Math.round((igvCreditoFiscal / igvCalc) * 10000) / 100 : 0;

  return { igvCreditoFiscal, igvCostoGasto, porcentajeCredito };
}

export function validarMontoDetraccion(
  total: number,
  tipoServicioCod: string,
): { aplica: boolean; porcentaje: number; monto: number; codigo: CodigoDetraccionSunat } {
  const codigo = normalizarCodigoDetraccion(tipoServicioCod);
  const porcentaje = TASAS_DETRACCION[codigo];
  const umbralMinimo = 700;

  if (total < umbralMinimo) {
    return { aplica: false, porcentaje: 0, monto: 0, codigo };
  }

  const monto = Math.round(total * (porcentaje / 100) * 100) / 100;
  return { aplica: true, porcentaje, monto, codigo };
}

function normalizarCodigoDetraccion(raw: string): CodigoDetraccionSunat {
  const u = raw.toUpperCase().trim();
  if (u.includes("TRANSPORT") || u === "04" || u === "4") return "TRANSPORTE";
  if (u.includes("ARREND") || u === "10") return "ARRENDAMIENTO";
  if (u.includes("CONSTRUC") || u === "09") return "CONSTRUCCION";
  if (u.includes("SERVIC") || u === "12") return "SERVICIOS";
  return "OTROS";
}

export function inferirTipoOperacionVenta(v: {
  baseImponibleGravada: number;
  valorExonerado: number;
  valorInafecto: number;
  exportacion: number;
}): import("@/modules/compras-ventas/types/comprasVentas").TipoOperacionVenta {
  const hasGrav = v.baseImponibleGravada > 0;
  const hasExo = v.valorExonerado > 0;
  const hasInaf = v.valorInafecto > 0;
  const hasExp = v.exportacion > 0;
  const count = [hasGrav, hasExo, hasInaf, hasExp].filter(Boolean).length;
  if (count > 1) return "MIXTA";
  if (hasExp) return "EXPORTACION";
  if (hasExo) return "EXONERADA";
  if (hasInaf) return "INAFECTA";
  return "GRAVADA";
}

export function labelTipoOperacionVenta(
  tipo: import("@/modules/compras-ventas/types/comprasVentas").TipoOperacionVenta,
): string {
  const map = {
    GRAVADA: "Gravada",
    EXONERADA: "Exonerada",
    INAFECTA: "Inafecta",
    EXPORTACION: "Exportación",
    MIXTA: "Mixta",
  };
  return map[tipo];
}

export const TASAS_DETRACCION_SUNAT = TASAS_DETRACCION;
