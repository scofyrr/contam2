import { formatSupabaseError } from "@/lib/supabase-error";

export type ImportValidationResult = {
  ok: boolean;
  missing: string[];
  headers: string[];
  rows: Record<string, unknown>[];
};

export async function parseExcelToRows(file: File): Promise<Record<string, unknown>[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("El archivo Excel no contiene hojas");
  const sheet = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

export function validateImportColumns(
  rows: Record<string, unknown>[],
  requiredColumns: string[],
): ImportValidationResult {
  if (rows.length === 0) {
    return { ok: false, missing: requiredColumns, headers: [], rows: [] };
  }

  const headers = Object.keys(rows[0] ?? {});
  const normalizedHeaders = new Set(headers.map((h) => h.trim().toLowerCase()));
  const missing = requiredColumns.filter(
    (col) => !normalizedHeaders.has(col.trim().toLowerCase()),
  );

  return { ok: missing.length === 0, missing, headers, rows };
}

export const SIRE_EXPORT_COLUMNS = [
  "Periodo",
  "Tipo",
  "RUC",
  "Razón social",
  "Fecha emisión",
  "Tipo CDP",
  "Serie",
  "Número",
  "Contraparte",
  "Base imponible",
  "IGV",
  "Importe total",
  "Moneda",
  "Estado validación",
  "Cuenta PCGE",
];

export const CONTRIBUYENTES_IMPORT_COLUMNS = [
  "ruc",
  "razon_social",
  "estado",
  "cat1ra",
  "cat2da",
  "cat3ra",
];

export const PCGE_IMPORT_COLUMNS = ["codigo_cuenta", "nombre_cuenta"];

export function formatImportError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return formatSupabaseError(error);
}

export async function readImportFile(file: File): Promise<Record<string, unknown>[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    return parseExcelToRows(file);
  }
  if (ext === "csv") {
    const text = await file.text();
    const XLSX = await import("xlsx");
    const wb = XLSX.read(text, { type: "string" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  }
  throw new Error("Formato no soportado. Use Excel (.xlsx) o CSV exportado por CONTAM.");
}
