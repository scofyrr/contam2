import type { CompraRce } from "@/modules/compras-ventas/types/comprasVentas";
import type { VentaRvie } from "@/modules/compras-ventas/types/comprasVentas";
import type { AsientoLinea } from "@/modules/contabilidad/types/contabilidad";

export const CUENTAS_PCGE_MODULO5 = {
  caja: "101",
  cliente: "1212",
  proveedor: "4212",
  igv: "40111",
  gastoCompra: "6011",
  ingresoVenta: "7011",
  mercaderias: "2011",
  cargasImputables: "7911",
  costoVentas: "6911",
} as const;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function labelCompra(c: CompraRce): string {
  return `${c.tipoComprobante}-${c.serie ?? ""}-${c.numero}`.replace(/^-|-$/g, "");
}

function labelVenta(v: VentaRvie): string {
  return `${v.tipoComprobante}-${v.serie ?? ""}-${v.numero}`.replace(/^-|-$/g, "");
}

function codigoLibroCompra(tipo: string): string {
  if (tipo === "07") return "050300";
  if (tipo === "08") return "050400";
  return "050100";
}

function codigoLibroVenta(tipo: string): string {
  if (tipo === "07") return "140300";
  if (tipo === "08") return "140400";
  return "140100";
}

export interface AsientoGenerado {
  glosa: string;
  codigoLibroTabla8: string;
  numeroCorrelativoSustentatorio: string;
  numeroDocumentoSustentatorio: string;
  lineas: AsientoLinea[];
  asientosDestino?: {
    glosa: string;
    lineas: AsientoLinea[];
  };
}

export function generarAsientoCompraRce(compra: CompraRce): AsientoGenerado {
  const label = labelCompra(compra);
  const doc = `${compra.tipoComprobante}-${label}`;
  const corr = `${compra.serie ?? ""}-${compra.numero}`;
  const base = round2(compra.baseImponible);
  const igvCf = round2(compra.igvCreditoFiscal);
  const igvCosto = round2(compra.igvCostoGasto);
  const total = round2(compra.total);

  const lineas: AsientoLinea[] = [];
  let orden = 0;

  orden += 1;
  lineas.push({
    correlativoLinea: orden,
    cuentaCodigo: CUENTAS_PCGE_MODULO5.gastoCompra,
    cuentaDenominacion: "Mercaderías / Gasto de compra",
    glosa: `Por compra según comprobante ${label}`,
    debe: round2(base + igvCosto),
    haber: 0,
  });

  if (igvCf > 0) {
    orden += 1;
    lineas.push({
      correlativoLinea: orden,
      cuentaCodigo: CUENTAS_PCGE_MODULO5.igv,
      cuentaDenominacion: "IGV - Cuenta propia",
      glosa: `IGV crédito fiscal ${label}`,
      debe: igvCf,
      haber: 0,
    });
  }

  orden += 1;
  lineas.push({
    correlativoLinea: orden,
    cuentaCodigo: CUENTAS_PCGE_MODULO5.proveedor,
    cuentaDenominacion: "Facturas por pagar",
    glosa: `Obligación con proveedor ${compra.razonSocialProveedor ?? ""}`.trim(),
    debe: 0,
    haber: total,
  });

  let asientosDestino: AsientoGenerado["asientosDestino"];

  if (
    (compra.destinoIgv === "DESTINO_3_NO_GRAVADO" ||
      compra.destinoIgv === "SIN_CREDITO_FISCAL") &&
    igvCosto > 0
  ) {
    asientosDestino = {
      glosa: `Destino IGV no gravado ${label}`,
      lineas: [
        {
          correlativoLinea: 1,
          cuentaCodigo: CUENTAS_PCGE_MODULO5.mercaderias,
          cuentaDenominacion: "Mercaderías",
          glosa: `Destino IGV no gravado ${label}`,
          debe: igvCosto,
          haber: 0,
        },
        {
          correlativoLinea: 2,
          cuentaCodigo: CUENTAS_PCGE_MODULO5.cargasImputables,
          cuentaDenominacion: "Cargas imputables a costos y gastos",
          glosa: `Carga imputable destino IGV ${label}`,
          debe: 0,
          haber: igvCosto,
        },
      ],
    };
  }

  return {
    glosa: `Por compra ${label}`,
    codigoLibroTabla8: codigoLibroCompra(compra.tipoComprobante),
    numeroCorrelativoSustentatorio: corr,
    numeroDocumentoSustentatorio: doc,
    lineas,
    asientosDestino,
  };
}

export function generarAsientoVentaRvie(venta: VentaRvie): AsientoGenerado {
  const label = labelVenta(venta);
  const doc = `${venta.tipoComprobante}-${label}`;
  const corr = `${venta.serie ?? ""}-${venta.numero}`;
  const base = round2(venta.baseImponibleGravada);
  const igv = round2(venta.igv);
  const total = round2(venta.total);

  const lineas: AsientoLinea[] = [
    {
      correlativoLinea: 1,
      cuentaCodigo: CUENTAS_PCGE_MODULO5.cliente,
      cuentaDenominacion: "Facturas por cobrar",
      glosa: `Factura por cobrar ${label}`,
      debe: total,
      haber: 0,
    },
    {
      correlativoLinea: 2,
      cuentaCodigo: CUENTAS_PCGE_MODULO5.igv,
      cuentaDenominacion: "IGV - Cuenta propia",
      glosa: `IGV por pagar ${label}`,
      debe: 0,
      haber: igv,
    },
    {
      correlativoLinea: 3,
      cuentaCodigo: CUENTAS_PCGE_MODULO5.ingresoVenta,
      cuentaDenominacion: "Ventas de mercaderías",
      glosa: `Ingreso por venta ${label}`,
      debe: 0,
      haber: base,
    },
  ];

  return {
    glosa: `Por venta ${label}`,
    codigoLibroTabla8: codigoLibroVenta(venta.tipoComprobante),
    numeroCorrelativoSustentatorio: corr,
    numeroDocumentoSustentatorio: doc,
    lineas,
  };
}

export function validarPartidaDoble(lineas: AsientoLinea[]): {
  cuadrado: boolean;
  totalDebe: number;
  totalHaber: number;
  diferencia: number;
} {
  const totalDebe = round2(lineas.reduce((s, l) => s + l.debe, 0));
  const totalHaber = round2(lineas.reduce((s, l) => s + l.haber, 0));
  const diferencia = round2(Math.abs(totalDebe - totalHaber));
  return {
    cuadrado: diferencia < 0.01,
    totalDebe,
    totalHaber,
    diferencia,
  };
}

export function generarCuoPreview(periodo: string, secuencia: number): string {
  const p = periodo.replace(/\D/g, "").slice(0, 6);
  return `CUO-${p}-${String(secuencia).padStart(4, "0")}`;
}
