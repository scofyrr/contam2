import type { RegistroSire } from "@/lib/sire-types";
import type { AsientoMetadata } from "@/modules/contabilidad/diario/types/templates";

const SIRE_UUID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";

export function mockAsientoMetadata(overrides: Partial<AsientoMetadata> = {}): AsientoMetadata {
  return {
    fecha: "2026-01-15",
    periodo: "202601",
    glosa: "Asiento de prueba contable",
    ruc: "20100000001",
    tipoLibro: "DIARIO_COMPRAS",
    ...overrides,
  };
}

export function mockRegistroCompra(overrides: Partial<RegistroSire> = {}): RegistroSire {
  return {
    id: SIRE_UUID,
    tipo: "COMPRA",
    periodo: "202601",
    fecha_emision: "2026-01-15",
    cod_tipo_cdp: "01",
    serie_cdp: "F001",
    nro_cdp_inicial: "123",
    nombre_contraparte: "Proveedor Demo SAC",
    mto_bi_gravada: 1000,
    mto_igv_ipe: 180,
    mto_total_cp: 1180,
    importe_total: 1180,
    cod_moneda: "PEN",
    ruc: "20100000001",
    ...overrides,
  };
}

export function mockRegistroVenta(overrides: Partial<RegistroSire> = {}): RegistroSire {
  return mockRegistroCompra({
    tipo: "VENTA",
    nombre_contraparte: "Cliente Demo SAC",
    ruc: "20500000002",
    ...overrides,
  });
}

export function sumDebeHaber(lineas: { debe: number; haber: number }[]) {
  const debe = lineas.reduce((s, l) => s + l.debe, 0);
  const haber = lineas.reduce((s, l) => s + l.haber, 0);
  return { debe: Math.round(debe * 100) / 100, haber: Math.round(haber * 100) / 100 };
}

export { SIRE_UUID };
