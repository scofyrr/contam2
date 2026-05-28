import type { LineaAsientoInput, RegistroSire } from "@/lib/sire-types";

/** Cuentas PCGE por defecto (subcuentas frecuentes en Perú) */
const CUENTAS = {
  cliente: "121201",
  proveedor: "421201",
  igv: "401111",
  gastoCompra: "601101",
  ingresoVenta: "701111",
} as const;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function comprobanteLabel(r: RegistroSire): string {
  const serie = r.serie_cdp ?? "";
  const numero = r.nro_cdp_inicial ?? "";
  return `${r.cod_tipo_cdp}-${serie}-${numero}`.replace(/^-|-$/g, "");
}

function baseImponible(r: RegistroSire): number {
  return round2(Number(r.bi_grav ?? 0));
}

function igv(r: RegistroSire): number {
  return round2(Number(r.igv_grav ?? 0));
}

function total(r: RegistroSire): number {
  return round2(Number(r.importe_total ?? 0));
}

/**
 * Genera las líneas de partida doble para un registro SIRE validado.
 */
export function generarLineasAsiento(registro: RegistroSire): LineaAsientoInput[] {
  const base = baseImponible(registro);
  const tax = igv(registro);
  const importe = total(registro);
  const label = comprobanteLabel(registro);
  const cuentaGasto = registro.cuenta_pcge?.trim() || CUENTAS.gastoCompra;

  if (registro.tipo === "COMPRA") {
    return [
      {
        orden: 1,
        cuenta: cuentaGasto,
        glosa: `Por compra según comprobante ${label}`,
        debe: base,
        haber: 0,
      },
      {
        orden: 2,
        cuenta: CUENTAS.igv,
        glosa: `IGV según comprobante ${label}`,
        debe: tax,
        haber: 0,
      },
      {
        orden: 3,
        cuenta: CUENTAS.proveedor,
        glosa: `Obligación con proveedor ${registro.nombre_contraparte ?? ""}`.trim(),
        debe: 0,
        haber: importe,
      },
    ];
  }

  return [
    {
      orden: 1,
      cuenta: CUENTAS.cliente,
      glosa: `Factura pendiente de cobro ${label}`,
      debe: importe,
      haber: 0,
    },
    {
      orden: 2,
      cuenta: CUENTAS.ingresoVenta,
      glosa: `Ingreso por venta ${label}`,
      debe: 0,
      haber: base,
    },
    {
      orden: 3,
      cuenta: CUENTAS.igv,
      glosa: `IGV por pagar ${label}`,
      debe: 0,
      haber: tax,
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
