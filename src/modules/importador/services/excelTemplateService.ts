import * as XLSX from "xlsx";

import type {
  FilaAsientoImport,
  FilaComprobanteImport,
  FilaImportNormalizada,
  ImportacionOrigen,
  PlantillaTipo,
} from "@/modules/importador/types/importador";

const HEADERS_COMPRAS_VENTAS = [
  "RUC",
  "Razon Social",
  "TipoDoc",
  "Serie",
  "Numero",
  "Fecha",
  "Moneda",
  "Base",
  "IGV",
  "Total",
] as const;

const HEADERS_ASIENTOS = [
  "Fecha",
  "Periodo",
  "Cuenta",
  "Debe",
  "Haber",
  "Glosa",
  "RUC Contraparte",
  "Nombre Contraparte",
  "Serie",
  "Numero",
] as const;

const EJEMPLO_COMPRAS: string[][] = [
  HEADERS_COMPRAS_VENTAS as unknown as string[],
  [
    "20512345678",
    "PROVEEDOR DEMO SAC",
    "01",
    "F001",
    "00001234",
    "2025-01-15",
    "PEN",
    "1000.00",
    "180.00",
    "1180.00",
  ],
  [
    "10456789012",
    "SERVICIOS GENERALES EIRL",
    "03",
    "B001",
    "00000089",
    "2025-01-20",
    "PEN",
    "500.00",
    "90.00",
    "590.00",
  ],
];

const EJEMPLO_VENTAS: string[][] = [
  HEADERS_COMPRAS_VENTAS as unknown as string[],
  [
    "20100070970",
    "CLIENTE CORPORATIVO SA",
    "01",
    "F001",
    "00004567",
    "2025-01-10",
    "PEN",
    "2500.00",
    "450.00",
    "2950.00",
  ],
];

const EJEMPLO_ASIENTOS: string[][] = [
  HEADERS_ASIENTOS as unknown as string[],
  [
    "2025-01-31",
    "202501",
    "601101",
    "850.00",
    "0.00",
    "Compra mercadería importada",
    "20512345678",
    "PROVEEDOR DEMO SAC",
    "F001",
    "1234",
  ],
  [
    "2025-01-31",
    "202501",
    "421201",
    "0.00",
    "850.00",
    "Compra mercadería importada",
    "20512345678",
    "PROVEEDOR DEMO SAC",
    "F001",
    "1234",
  ],
];

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildStyledWorkbook(data: string[][], sheetName: string): XLSX.WorkBook {
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = data[0].map((_, colIdx) => ({
    wch: Math.max(12, ...data.map((row) => String(row[colIdx] ?? "").length + 2)),
  }));

  const headerRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "047857" } },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
}

export function descargarPlantillaOficial(tipo: PlantillaTipo): void {
  let data: string[][];
  let filename: string;
  let sheetName: string;

  switch (tipo) {
    case "COMPRAS":
      data = EJEMPLO_COMPRAS;
      filename = "CONTAM_Plantilla_Importacion_COMPRAS.xlsx";
      sheetName = "Compras RCE";
      break;
    case "VENTAS":
      data = EJEMPLO_VENTAS;
      filename = "CONTAM_Plantilla_Importacion_VENTAS.xlsx";
      sheetName = "Ventas RVIE";
      break;
    case "ASIENTOS":
      data = EJEMPLO_ASIENTOS;
      filename = "CONTAM_Plantilla_Importacion_ASIENTOS.xlsx";
      sheetName = "Asientos Manuales";
      break;
  }

  const wb = buildStyledWorkbook(data, sheetName);
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  triggerDownload(
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename,
  );
}

function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseNum(val: unknown): number {
  if (typeof val === "number") return Math.round(val * 100) / 100;
  const s = String(val ?? "").replace(/,/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function parseFechaCell(val: unknown): string {
  if (val == null || val === "") return "";
  if (typeof val === "number") {
    const parsed = XLSX.SSF.parse_date_code(val);
    if (parsed) {
      const y = parsed.y;
      const m = String(parsed.m).padStart(2, "0");
      const d = String(parsed.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const slash = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slash) {
    let [, d, m, y] = slash;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return s;
}

function detectTipoPlantilla(headers: string[]): PlantillaTipo | null {
  const h = headers.map(normalizeHeader);
  if (h.includes("cuenta") && h.includes("debe") && h.includes("haber")) return "ASIENTOS";
  if (h.includes("ruc") && h.includes("tipodoc") && h.includes("base")) {
    return h.some((x) => x.includes("venta")) ? "VENTAS" : "COMPRAS";
  }
  if (h.includes("ruc") && h.includes("serie") && h.includes("total")) return "COMPRAS";
  return null;
}

function rowToComprobante(
  row: Record<string, unknown>,
  filaNumero: number,
): FilaComprobanteImport {
  const fecha = parseFechaCell(row.fecha ?? row.Fecha);
  const periodo = fecha ? fecha.replace(/-/g, "").slice(0, 6) : undefined;
  return {
    filaNumero,
    ruc: String(row.ruc ?? row.RUC ?? "").replace(/\D/g, "").slice(0, 11),
    razonSocial: String(row.razonsocial ?? row["Razon Social"] ?? row.razon_social ?? "").trim(),
    tipoDoc: String(row.tipodoc ?? row.TipoDoc ?? "01").replace(/\D/g, "").padStart(2, "0").slice(-2),
    serie: String(row.serie ?? row.Serie ?? "F001").trim().toUpperCase(),
    numero: String(row.numero ?? row.Numero ?? "").trim(),
    fecha,
    moneda: String(row.moneda ?? row.Moneda ?? "PEN").toUpperCase().slice(0, 3),
    base: parseNum(row.base ?? row.Base),
    igv: parseNum(row.igv ?? row.IGV),
    total: parseNum(row.total ?? row.Total),
    periodo,
    tipoCambio: parseNum(row.tipocambio ?? row.tipo_cambio) || 1,
  };
}

function rowToAsiento(row: Record<string, unknown>, filaNumero: number): FilaAsientoImport {
  const fechaAsiento = parseFechaCell(row.fecha ?? row.Fecha);
  const periodoRaw = String(row.periodo ?? row.Periodo ?? "").replace(/\D/g, "");
  const periodo =
    periodoRaw.length === 6
      ? periodoRaw
      : fechaAsiento.replace(/-/g, "").slice(0, 6);

  return {
    filaNumero,
    fechaAsiento,
    periodo,
    cuentaContable: String(row.cuenta ?? row.Cuenta ?? "").replace(/\D/g, "").slice(0, 10),
    debe: parseNum(row.debe ?? row.Debe),
    haber: parseNum(row.haber ?? row.Haber),
    glosa: String(row.glosa ?? row.Glosa ?? "").trim(),
    rucContraparte: String(row.ruccontraparte ?? row["RUC Contraparte"] ?? "")
      .replace(/\D/g, "")
      .slice(0, 11),
    nombreContraparte: String(row.nombrecontraparte ?? row["Nombre Contraparte"] ?? "").trim(),
    serie: String(row.serie ?? row.Serie ?? "").trim(),
    numero: String(row.numero ?? row.Numero ?? "").trim(),
    tipoRegistro: "COMPRA",
  };
}

export interface ParseResult {
  origen: ImportacionOrigen;
  tipoDetectado: PlantillaTipo;
  filas: FilaImportNormalizada[];
}

export async function parsearArchivoImportacion(file: File): Promise<ParseResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const origen: ImportacionOrigen =
    ext === "csv" ? "CSV" : ext === "pdf" ? "PDF_OCR" : "EXCEL";

  if (ext === "pdf") {
    throw new Error("Use pdfOcrParser.parsePdfInvoice para archivos PDF");
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (json.length === 0) {
    throw new Error("El archivo no contiene filas de datos");
  }

  const headers = Object.keys(json[0] ?? {});
  const tipoDetectado = detectTipoPlantilla(headers) ?? "COMPRAS";

  const filas: FilaImportNormalizada[] = json.map((row, idx) => {
    const filaNumero = idx + 2;
    if (tipoDetectado === "ASIENTOS") {
      return rowToAsiento(row, filaNumero);
    }
    return rowToComprobante(row, filaNumero);
  });

  return { origen, tipoDetectado, filas };
}

export async function parsearCsvImportacion(file: File): Promise<ParseResult> {
  return parsearArchivoImportacion(file);
}
