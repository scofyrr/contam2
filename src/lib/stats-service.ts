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

export function filterRegistrosByPeriodRange(
  rows: RegistroSire[],
  periodoDesde?: string,
  periodoHasta?: string,
): RegistroSire[] {
  if (!periodoDesde && !periodoHasta) return rows;
  return rows.filter((r) => {
    if (periodoDesde && r.periodo < periodoDesde) return false;
    if (periodoHasta && r.periodo > periodoHasta) return false;
    return true;
  });
}

export type KpisPorEntidad = {
  ruc: string;
  razonSocial: string;
  kpis: KpisResponse;
};

/** Segmentación individual por RUC contribuyente */
export function computeKpisByRuc(rows: RegistroSire[], periodo: string | null): KpisPorEntidad[] {
  const byRuc = new Map<string, { razonSocial: string; rows: RegistroSire[] }>();

  for (const r of rows) {
    const ruc = (r.ruc ?? "").trim() || "SIN_RUC";
    const label = r.razon_social?.trim() || r.nombre_contraparte?.trim() || ruc;
    const bucket = byRuc.get(ruc) ?? { razonSocial: label, rows: [] };
    bucket.rows.push(r);
    byRuc.set(ruc, bucket);
  }

  return [...byRuc.entries()]
    .map(([ruc, { razonSocial, rows: entityRows }]) => ({
      ruc,
      razonSocial,
      kpis: computeKpis(entityRows, periodo),
    }))
    .sort((a, b) => b.kpis.ventasTotales + b.kpis.comprasTotales - (a.kpis.ventasTotales + a.kpis.comprasTotales));
}
