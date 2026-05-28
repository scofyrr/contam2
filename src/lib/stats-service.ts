import type { ChartsResponse, KpisResponse, RegistroSire } from "@/lib/sire-types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function baseOf(r: RegistroSire): number {
  return Number(r.bi_grav ?? 0);
}

function igvOf(r: RegistroSire): number {
  return Number(r.igv_grav ?? 0);
}

export function computeKpis(
  rows: RegistroSire[],
  periodo: string | null,
): KpisResponse {
  const ventas = rows.filter((r) => r.tipo === "VENTA");
  const compras = rows.filter((r) => r.tipo === "COMPRA");

  const ventasTotales = round2(ventas.reduce((s, r) => s + baseOf(r), 0));
  const comprasTotales = round2(compras.reduce((s, r) => s + baseOf(r), 0));
  const igvVentas = round2(ventas.reduce((s, r) => s + igvOf(r), 0));
  const igvCompras = round2(compras.reduce((s, r) => s + igvOf(r), 0));

  return {
    periodo,
    ventasTotales,
    comprasTotales,
    utilidadNeta: round2(ventasTotales - comprasTotales),
    ratioIgv: round2(igvVentas - igvCompras),
    igvVentas,
    igvCompras,
    countVentas: ventas.length,
    countCompras: compras.length,
  };
}

export function computeCharts(
  rows: RegistroSire[],
  periodo: string | null,
): ChartsResponse {
  const byPeriodo = new Map<string, { ventas: number; compras: number; igvV: number; igvC: number }>();

  for (const r of rows) {
    const p = r.periodo;
    const bucket = byPeriodo.get(p) ?? { ventas: 0, compras: 0, igvV: 0, igvC: 0 };
    const base = baseOf(r);
    const tax = igvOf(r);
    if (r.tipo === "VENTA") {
      bucket.ventas += base;
      bucket.igvV += tax;
    } else {
      bucket.compras += base;
      bucket.igvC += tax;
    }
    byPeriodo.set(p, bucket);
  }

  const periodos = [...byPeriodo.keys()].sort();

  const ventasPorPeriodo = periodos.map((p) => ({
    periodo: p,
    total: round2(byPeriodo.get(p)!.ventas),
  }));
  const comprasPorPeriodo = periodos.map((p) => ({
    periodo: p,
    total: round2(byPeriodo.get(p)!.compras),
  }));

  const utilidadPorPeriodo = periodos.map((p) => {
    const b = byPeriodo.get(p)!;
    return { periodo: p, utilidad: round2(b.ventas - b.compras) };
  });

  const importeMap = new Map<string, { ventas: number; compras: number }>();
  for (const r of rows) {
    const bucket = importeMap.get(r.periodo) ?? { ventas: 0, compras: 0 };
    const imp = Number(r.importe_total ?? 0);
    if (r.tipo === "VENTA") bucket.ventas += imp;
    else bucket.compras += imp;
    importeMap.set(r.periodo, bucket);
  }

  const importeTotalPorPeriodo = periodos.map((p) => ({
    periodo: p,
    ventas: round2(importeMap.get(p)?.ventas ?? 0),
    compras: round2(importeMap.get(p)?.compras ?? 0),
  }));

  const totalVentas = rows.filter((r) => r.tipo === "VENTA").reduce((s, r) => s + baseOf(r), 0);
  const totalCompras = rows.filter((r) => r.tipo === "COMPRA").reduce((s, r) => s + baseOf(r), 0);

  const mixVentasCompras = [
    { name: "Ventas", value: round2(totalVentas), tipo: "VENTA" },
    { name: "Compras", value: round2(totalCompras), tipo: "COMPRA" },
  ].filter((x) => x.value > 0);

  const tipoCdpMap = new Map<string, { ventas: number; compras: number }>();
  for (const r of rows) {
    const cod = r.cod_tipo_cdp || "00";
    const b = tipoCdpMap.get(cod) ?? { ventas: 0, compras: 0 };
    const base = baseOf(r);
    if (r.tipo === "VENTA") b.ventas += base;
    else b.compras += base;
    tipoCdpMap.set(cod, b);
  }

  const porTipoComprobante = [...tipoCdpMap.entries()]
    .map(([codigo, v]) => ({
      codigo,
      ventas: round2(v.ventas),
      compras: round2(v.compras),
    }))
    .sort((a, b) => b.ventas + b.compras - (a.ventas + a.compras));

  const estadoMap = new Map<string, number>();
  for (const r of rows) {
    const e = r.estado_validacion ?? "pendiente";
    estadoMap.set(e, (estadoMap.get(e) ?? 0) + 1);
  }

  const porEstadoValidacion = [...estadoMap.entries()].map(([estado, cantidad]) => ({
    estado,
    cantidad,
  }));

  const contraparteMap = new Map<string, { importe: number; tipo: string }>();
  for (const r of rows) {
    const nombre = r.nombre_contraparte?.trim() || "Sin nombre";
    const key = `${r.tipo}::${nombre}`;
    const prev = contraparteMap.get(key) ?? { importe: 0, tipo: r.tipo };
    prev.importe += Number(r.importe_total ?? 0);
    contraparteMap.set(key, prev);
  }

  const topContrapartes = [...contraparteMap.entries()]
    .map(([key, v]) => ({
      nombre: key.split("::")[1] ?? key,
      importe: round2(v.importe),
      tipo: v.tipo,
    }))
    .sort((a, b) => b.importe - a.importe)
    .slice(0, 10);

  const composicionMensual = periodos.map((p) => {
    const b = byPeriodo.get(p)!;
    return {
      periodo: p,
      baseVentas: round2(b.ventas),
      baseCompras: round2(b.compras),
      igvVentas: round2(b.igvV),
      igvCompras: round2(b.igvC),
    };
  });

  return {
    periodo,
    ventasPorPeriodo,
    comprasPorPeriodo,
    igvPorPeriodo: periodos.map((p) => ({
      periodo: p,
      igvVentas: round2(byPeriodo.get(p)!.igvV),
      igvCompras: round2(byPeriodo.get(p)!.igvC),
    })),
    utilidadPorPeriodo,
    importeTotalPorPeriodo,
    mixVentasCompras,
    porTipoComprobante,
    porEstadoValidacion,
    topContrapartes,
    composicionMensual,
  };
}

/** Datos demo cuando Supabase no está disponible */
export const DEMO_REGISTROS: RegistroSire[] = [
  {
    id: "demo-1",
    tipo: "VENTA",
    periodo: "202605",
    fecha_emision: "2026-05-10",
    cod_tipo_cdp: "01",
    serie_cdp: "F001",
    nro_cdp_inicial: "120",
    nombre_contraparte: "Cliente Demo SAC",
    bi_grav: 10000,
    igv_grav: 1800,
    importe_total: 11800,
    cod_moneda: "PEN",
    estado_validacion: "validado",
  },
  {
    id: "demo-2",
    tipo: "COMPRA",
    periodo: "202605",
    fecha_emision: "2026-05-12",
    cod_tipo_cdp: "01",
    serie_cdp: "E001",
    nro_cdp_inicial: "45",
    nombre_contraparte: "Proveedor Demo EIRL",
    bi_grav: 5000,
    igv_grav: 900,
    importe_total: 5900,
    cod_moneda: "PEN",
    estado_validacion: "pendiente",
  },
  {
    id: "demo-3",
    tipo: "VENTA",
    periodo: "202604",
    fecha_emision: "2026-04-20",
    cod_tipo_cdp: "01",
    serie_cdp: "F001",
    nro_cdp_inicial: "99",
    nombre_contraparte: "Retail Perú SA",
    bi_grav: 8000,
    igv_grav: 1440,
    importe_total: 9440,
    cod_moneda: "PEN",
    estado_validacion: "validado",
  },
];

export const DEMO_LIBRO_DIARIO = [
  {
    id: "dl-1",
    sire_registro_id: "demo-1",
    fecha_asiento: "2026-05-10",
    periodo: "202605",
    cuenta_contable: "121201",
    debe: 11800,
    haber: 0,
    glosa: "Factura pendiente de cobro 01-F001-120",
    naturaleza: "debe" as const,
    origen: "VENTAS",
    tipo_registro: "VENTA",
    ruc: "20123456789",
    razon_social: "Empresa Demo SAC",
    cod_tipo_cdp: "01",
    serie_cdp: "F001",
    nro_cdp_inicial: "120",
  },
  {
    id: "dl-2",
    sire_registro_id: "demo-1",
    fecha_asiento: "2026-05-10",
    periodo: "202605",
    cuenta_contable: "701111",
    debe: 0,
    haber: 10000,
    glosa: "Ingreso por venta 01-F001-120",
    naturaleza: "haber" as const,
    origen: "VENTAS",
    tipo_registro: "VENTA",
    ruc: "20123456789",
    razon_social: "Empresa Demo SAC",
    cod_tipo_cdp: "01",
    serie_cdp: "F001",
    nro_cdp_inicial: "120",
  },
];
