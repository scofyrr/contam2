import { supabase } from "@/integrations/supabase/client";
import { fetchLibroDiario } from "@/lib/sire-data";

export interface PLECabecera {
  ruc: string;
  razonSocial: string;
  periodo: string;
  tipoLibro: string;
  moneda: string;
  fechaGeneracion: string;
  totalRegistros: number;
  totalDebe: number;
  totalHaber: number;
}

export interface PLEDetalle {
  numeroCorrelativo: number;
  fecha: string;
  cuentaContable: string;
  denominacion: string;
  debe: number;
  haber: number;
  glosa: string;
  referencia?: string;
}

export interface LibroElectronico {
  ruc: string;
  periodo: string;
  tipoLibro: "DIARIO" | "MAYOR" | "COMPRAS" | "VENTAS" | "CAJA_BANCOS";
  formato: "TXT_PLE" | "EXCEL_SUNAT" | "PDF_FORMAL";
  cabecera: PLECabecera;
  detalle: PLEDetalle[];
  hashIntegridad: string;
}

export interface PlazoPresentacion {
  libro: string;
  periodo: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estado: "VIGENTE" | "PROXIMO" | "VENCIDO";
}

export interface IntegridadReporte {
  ruc: string;
  periodo: string;
  estado: "OK" | "CON_OBSERVACIONES" | "CRITICO";
  sireRegistros: number;
  asientosGenerados: number;
  discrepancias: Array<{ tipo: string; descripcion: string; severidad: string }>;
}

export interface ReporteCumplimiento {
  tipo: "LIBROS_ELECTRONICOS" | "PLAZOS_PRESENTACION" | "INTEGRIDAD_REGISTROS" | "RESUMEN_OPERACIONES";
  periodo: string;
  ruc: string;
  fechaGeneracion: string;
  estado: "COMPLETO" | "PENDIENTE" | "CON_OBSERVACIONES";
  datos: Record<string, unknown>;
  observaciones?: string[];
}

async function hashIntegridad(payload: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16)
    .toUpperCase();
}

function ultimoDiaMes(periodo: string): string {
  const y = Number(periodo.slice(0, 4));
  const m = Number(periodo.slice(4, 6));
  const d = new Date(y, m, 0);
  return d.toISOString().slice(0, 10);
}

function plazoSunat(periodo: string, mesesOffset: number): string {
  const y = Number(periodo.slice(0, 4));
  const m = Number(periodo.slice(4, 6)) - 1 + mesesOffset;
  const d = new Date(y, m + 1, 0);
  d.setDate(Math.min(d.getDate(), 25));
  return d.toISOString().slice(0, 10);
}

export async function generarReporteLibrosElectronicos(
  ruc: string,
  periodo: string,
  tipoLibro: LibroElectronico["tipoLibro"] = "DIARIO",
): Promise<LibroElectronico> {
  const rows = await fetchLibroDiario(ruc, periodo);
  let correlativo = 0;
  let totalDebe = 0;
  let totalHaber = 0;

  const detalle: PLEDetalle[] = rows.map((linea) => {
    correlativo += 1;
    const debe = Number(linea.debe ?? 0);
    const haber = Number(linea.haber ?? 0);
    totalDebe += debe;
    totalHaber += haber;
    return {
      numeroCorrelativo: correlativo,
      fecha: linea.fecha_asiento ?? ultimoDiaMes(periodo),
      cuentaContable: linea.cuenta_contable ?? "",
      denominacion: linea.denominacion ?? "",
      debe,
      haber,
      glosa: linea.glosa ?? "",
      referencia: linea.sire_registro_id ?? undefined,
    };
  });

  const cabecera: PLECabecera = {
    ruc,
    razonSocial: "CONTRIBUYENTE",
    periodo,
    tipoLibro,
    moneda: "PEN",
    fechaGeneracion: new Date().toISOString(),
    totalRegistros: detalle.length,
    totalDebe,
    totalHaber,
  };

  const payload = JSON.stringify({ cabecera, detalle });
  const hash = await hashIntegridad(payload);

  return {
    ruc,
    periodo,
    tipoLibro,
    formato: "TXT_PLE",
    cabecera,
    detalle,
    hashIntegridad: hash,
  };
}

export async function verificarPlazosPresentacion(ruc: string, periodo: string): Promise<PlazoPresentacion[]> {
  void ruc;
  const hoy = new Date();
  const libros = [
    { libro: "Libro Diario (5.1)", offset: 1 },
    { libro: "Registro de Compras (8.1)", offset: 1 },
    { libro: "Registro de Ventas (14.1)", offset: 1 },
    { libro: "Libro Caja y Bancos (1.1)", offset: 1 },
  ];

  return libros.map(({ libro, offset }) => {
    const venc = new Date(plazoSunat(periodo, offset));
    const dias = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);
    let estado: PlazoPresentacion["estado"] = "VIGENTE";
    if (dias < 0) estado = "VENCIDO";
    else if (dias <= 7) estado = "PROXIMO";
    return {
      libro,
      periodo,
      fechaVencimiento: venc.toISOString().slice(0, 10),
      diasRestantes: dias,
      estado,
    };
  });
}

export async function validarIntegridadRegistros(ruc: string, periodo: string): Promise<IntegridadReporte> {
  const discrepancias: IntegridadReporte["discrepancias"] = [];

  try {
    const { data } = await supabase.rpc("rpc_validate_accounting_integrity", {
      p_ruc: ruc,
      p_periodo: periodo,
    });
    for (const row of (data ?? []) as Array<{ check_type: string; descripcion: string; severidad: string }>) {
      discrepancias.push({
        tipo: row.check_type,
        descripcion: row.descripcion,
        severidad: row.severidad,
      });
    }
  } catch {
    /* RPC opcional */
  }

  const libro = await fetchLibroDiario(ruc, periodo);
  const sireIds = new Set(libro.filter((l) => l.sire_registro_id).map((l) => l.sire_registro_id));

  let estado: IntegridadReporte["estado"] = "OK";
  if (discrepancias.some((d) => d.severidad === "CRITICAL" || d.severidad === "ERROR")) {
    estado = "CRITICO";
  } else if (discrepancias.length > 0) {
    estado = "CON_OBSERVACIONES";
  }

  return {
    ruc,
    periodo,
    estado,
    sireRegistros: sireIds.size,
    asientosGenerados: libro.length,
    discrepancias,
  };
}

export function generarLineasPLE(libro: LibroElectronico): string[] {
  const { cabecera, detalle } = libro;
  const lines: string[] = [
    `${cabecera.ruc}|${cabecera.periodo}|${cabecera.tipoLibro}|${cabecera.moneda}|${cabecera.totalRegistros}`,
  ];
  for (const d of detalle) {
    lines.push(
      [
        d.numeroCorrelativo,
        d.fecha.replace(/-/g, ""),
        d.cuentaContable,
        d.debe.toFixed(2),
        d.haber.toFixed(2),
        (d.glosa ?? "").replace(/\|/g, " "),
        d.referencia ?? "",
      ].join("|"),
    );
  }
  return lines;
}

export async function exportarPLE(
  ruc: string,
  periodo: string,
  tipoLibro: LibroElectronico["tipoLibro"],
  formato: "TXT_PLE" | "EXCEL_SUNAT" | "PDF_FORMAL",
): Promise<Blob> {
  const libro = await generarReporteLibrosElectronicos(ruc, periodo, tipoLibro);

  if (formato === "TXT_PLE") {
    const txt = generarLineasPLE(libro).join("\n");
    return new Blob([txt], { type: "text/plain;charset=utf-8" });
  }

  if (formato === "EXCEL_SUNAT") {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(libro.detalle);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PLE");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }

  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(12);
  doc.text(`Libro Electrónico PLE — ${tipoLibro}`, 14, 16);
  doc.setFontSize(9);
  doc.text(`RUC: ${ruc}  Período: ${periodo}  Hash: ${libro.hashIntegridad}`, 14, 24);
  autoTable(doc, {
    startY: 30,
    head: [["#", "Fecha", "Cuenta", "Debe", "Haber", "Glosa"]],
    body: libro.detalle.slice(0, 500).map((d) => [
      d.numeroCorrelativo,
      d.fecha,
      d.cuentaContable,
      d.debe.toFixed(2),
      d.haber.toFixed(2),
      d.glosa.slice(0, 60),
    ]),
    styles: { fontSize: 7 },
  });
  return doc.output("blob");
}
