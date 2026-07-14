import type { LineaAsientoInput, RegistroSire } from "@/lib/sire-types";
import { resolverMontosSunat } from "@/lib/sire-montos";

/** Cuentas PCGE por defecto (subcuentas frecuentes en Perú) */
export const CUENTAS_DEFAULT: CuentasAsientoDefaults = {
  caja: "101101",
  cliente: "121201",
  proveedor: "421201",
  igv: "40111",
  gastoCompra: "601101",
  ingresoVenta: "701111",
};

export type CuentasAsientoDefaults = {
  caja: string;
  cliente: string;
  proveedor: string;
  igv: string;
  gastoCompra: string;
  ingresoVenta: string;
};

function comprobanteLabel(r: RegistroSire): string {
  const serie = r.serie_cdp ?? "";
  const numero = r.nro_cdp_inicial ?? "";
  return `${r.cod_tipo_cdp}-${serie}-${numero}`.replace(/^-|-$/g, "");
}

/** Resuelve montos SUNAT estrictos (mto_bi_gravada, mto_igv_ipe, mto_total_cp) */
export function resolverMontosComprobante(r: RegistroSire): {
  base: number;
  igv: number;
  total: number;
  mto_bi_gravada: number;
  mto_igv_ipe: number;
  mto_total_cp: number;
} {
  const { mto_bi_gravada, mto_igv_ipe, mto_total_cp } = resolverMontosSunat(r);
  return {
    base: mto_bi_gravada,
    igv: mto_igv_ipe,
    total: mto_total_cp,
    mto_bi_gravada,
    mto_igv_ipe,
    mto_total_cp,
  };
}

/**
 * Genera líneas de partida doble desde columnas SUNAT:
 * - mto_total_cp → Debe cliente (121201) en venta
 * - mto_bi_gravada → Haber ingreso (701111)
 * - mto_igv_ipe → Haber IGV (40111)
 */
export function generarLineasAsiento(
  registro: RegistroSire,
  cuentas: Partial<CuentasAsientoDefaults> = {},
): LineaAsientoInput[] {
  const c = { ...CUENTAS_DEFAULT, ...cuentas };
  const { mto_bi_gravada, mto_igv_ipe, mto_total_cp } = resolverMontosComprobante(registro);
  const label = comprobanteLabel(registro);
  const round = (n: number) => Math.round(n * 100) / 100;

  if (registro.tipo === "COMPRA") {
    // Si es un Recibo por Honorarios (CPE tipo 02)
    if (registro.cod_tipo_cdp === "02") {
      const gastoDefault = "632901"; // Honorarios profesionales - Otros
      const cuentaGasto = registro.cuenta_pcge?.trim() || gastoDefault;
      const cuentaHonPagar = "424101"; // Honorarios por pagar
      const cuentaRetencion = "40172"; // Renta de cuarta categoría

      const bruto = mto_total_cp;
      const aplicaRetencion = bruto > 1500;
      const retencion = aplicaRetencion ? round(bruto * 0.08) : 0;
      const neto = round(bruto - retencion);

      const lineas: LineaAsientoInput[] = [
        {
          orden: 1,
          cuenta: cuentaGasto,
          glosa: `Por provisión de honorarios según comprobante ${label}`,
          debe: bruto,
          haber: 0,
        },
      ];

      if (retencion > 0) {
        lineas.push({
          orden: 2,
          cuenta: cuentaRetencion,
          glosa: `Retención IR 4ta Cat. ${label}`,
          debe: 0,
          haber: retencion,
        });
      }

      lineas.push({
        orden: lineas.length + 1,
        cuenta: cuentaHonPagar,
        glosa: `Obligación por honorarios ${registro.nombre_contraparte ?? ""}`.trim(),
        debe: 0,
        haber: neto,
      });

      return lineas;
    }

    // Compra estándar
    const cuentaGasto = registro.cuenta_pcge?.trim() || c.gastoCompra;
    return [
      {
        orden: 1,
        cuenta: cuentaGasto,
        glosa: `Por compra según comprobante ${label}`,
        debe: mto_bi_gravada,
        haber: 0,
      },
      {
        orden: 2,
        cuenta: c.igv,
        glosa: `IGV crédito fiscal ${label}`,
        debe: mto_igv_ipe,
        haber: 0,
      },
      {
        orden: 3,
        cuenta: c.proveedor,
        glosa: `Obligación con proveedor ${registro.nombre_contraparte ?? ""}`.trim(),
        debe: 0,
        haber: mto_total_cp,
      },
    ];
  }

  return [
    {
      orden: 1,
      cuenta: c.cliente,
      glosa: `Factura por cobrar ${label}`,
      debe: mto_total_cp,
      haber: 0,
    },
    {
      orden: 2,
      cuenta: c.ingresoVenta,
      glosa: `Ingreso por venta ${label}`,
      debe: 0,
      haber: mto_bi_gravada,
    },
    {
      orden: 3,
      cuenta: c.igv,
      glosa: `IGV por pagar ${label}`,
      debe: 0,
      haber: mto_igv_ipe,
    },
  ];
}

export function glosaAsiento(registro: RegistroSire): string {
  const label = comprobanteLabel(registro);
  const extra = registro.descripcion_items?.trim();
  const base = `Asiento automático SIRE ${registro.tipo} ${label}`;
  return extra ? `${base} — ${extra}` : base;
}

export function origenAsiento(tipo: RegistroSire["tipo"]): "VENTAS" | "COMPRAS" {
  return tipo === "VENTA" ? "VENTAS" : "COMPRAS";
}

/** @deprecated use CUENTAS_DEFAULT */
export const CUENTAS = CUENTAS_DEFAULT;
