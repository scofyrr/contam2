import type { ParsedPdfInvoice, TipoComprobanteSunat } from "@/modules/importador/types/importador";

const TIPO_COMPROBANTE_PATTERNS: Array<{ pattern: RegExp; tipo: TipoComprobanteSunat }> = [
  { pattern: /NOTA\s+DE\s+CR[EÉ]DITO|NOTA\s+CR[EÉ]DITO|tipo\s*:?\s*07/i, tipo: "07" },
  { pattern: /NOTA\s+DE\s+D[EÉ]BITO|NOTA\s+D[EÉ]BITO|tipo\s*:?\s*08/i, tipo: "08" },
  { pattern: /BOLETA\s+DE\s+VENTA|BOLETA|ELECTR[OÓ]NICA\s+BV|tipo\s*:?\s*03/i, tipo: "03" },
  { pattern: /FACTURA\s+ELECTR[OÓ]NICA|FACTURA|tipo\s*:?\s*01/i, tipo: "01" },
];

const RUC_PATTERN = /\b(10|15|17|20)\d{9}\b/g;
const SERIE_PATTERN = /\b([FE][A-Z0-9]{3}|B[A-Z0-9]{3})\b/gi;
const NUMERO_PATTERN = /(?:N[°ºo.]?\s*|NRO\.?\s*|NUMERO\s*:?\s*)(\d{1,8})/gi;
const FECHA_PATTERN =
  /(?:FECHA\s*(?:DE\s*)?(?:EMISI[OÓ]N|EMISION)?\s*:?\s*)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
const MONEDA_USD_PATTERN = /USD|D[ÓO]LAR(?:ES)?|\$\s*\d/i;
const SUBTOTAL_PATTERN =
  /(?:SUB\s*TOTAL|BASE\s*IMPONIBLE|VALOR\s*VENTA|OP\.?\s*GRAVADA)\s*:?\s*(?:S\/\.?\s*)?([\d,]+\.?\d*)/gi;
const IGV_PATTERN = /(?:I\.?G\.?V\.?|IGV)\s*(?:\(?18%?\)?)?\s*:?\s*(?:S\/\.?\s*)?([\d,]+\.?\d*)/gi;
const TOTAL_PATTERN =
  /(?:IMPORTE\s*TOTAL|TOTAL\s*(?:A\s*PAGAR)?|MONTO\s*TOTAL)\s*:?\s*(?:S\/\.?\s*)?([\d,]+\.?\d*)/gi;
const RAZON_SOCIAL_PATTERN =
  /(?:RAZ[OÓ]N\s*SOCIAL|NOMBRE\s*(?:O\s*RAZ[OÓ]N\s*SOCIAL)?)\s*:?\s*([A-Z0-9ÁÉÍÓÚÑ\s\.\,&\-]{3,120})/i;

function parseMonto(raw: string | undefined): number {
  if (!raw) return 0;
  const clean = raw.replace(/,/g, "").trim();
  const n = Number(clean);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function normalizeFecha(raw: string): string {
  const parts = raw.split(/[\/\-]/);
  if (parts.length !== 3) return raw;
  let [d, m, y] = parts.map((p) => p.trim());
  if (y.length === 2) y = `20${y}`;
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function detectTipoComprobante(text: string): TipoComprobanteSunat {
  for (const { pattern, tipo } of TIPO_COMPROBANTE_PATTERNS) {
    if (pattern.test(text)) return tipo;
  }
  return "01";
}

function extractFirstMatch(text: string, pattern: RegExp): string | null {
  pattern.lastIndex = 0;
  const m = pattern.exec(text);
  return m?.[1] ?? m?.[0] ?? null;
}

function extractAllMontos(text: string, pattern: RegExp): number[] {
  const values: number[] = [];
  pattern.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const val = parseMonto(m[1] ?? m[0]);
    if (val > 0) values.push(val);
  }
  return values;
}

function extractRuc(text: string): string | null {
  RUC_PATTERN.lastIndex = 0;
  const matches = text.match(RUC_PATTERN);
  if (!matches?.length) return null;
  return matches[0].replace(/\D/g, "").slice(0, 11);
}

function extractSerie(text: string): string {
  SERIE_PATTERN.lastIndex = 0;
  const matches = [...text.matchAll(SERIE_PATTERN)];
  const candidate = matches.find((m) => /^[FEB]/i.test(m[1]))?.[1];
  return candidate?.toUpperCase() ?? "F001";
}

function extractNumero(text: string): string {
  NUMERO_PATTERN.lastIndex = 0;
  const matches = [...text.matchAll(NUMERO_PATTERN)];
  const nums = matches.map((m) => m[1]).filter(Boolean);
  if (nums.length === 0) {
    const fallback = text.match(/\b(\d{6,8})\b/);
    return fallback?.[1] ?? "1";
  }
  return nums.sort((a, b) => b.length - a.length)[0];
}

function extractFecha(text: string): string {
  FECHA_PATTERN.lastIndex = 0;
  const m = FECHA_PATTERN.exec(text);
  if (!m?.[1]) return new Date().toISOString().slice(0, 10);
  return normalizeFecha(m[1]);
}

function calcularConfianza(invoice: Omit<ParsedPdfInvoice, "confianza" | "textoExtraido">): "ALTA" | "MEDIA" | "BAJA" {
  let score = 0;
  if (invoice.rucEmisor.length === 11) score += 2;
  if (invoice.serie && invoice.numero) score += 2;
  if (invoice.total > 0) score += 2;
  if (invoice.baseImponible > 0 && invoice.igv > 0) score += 2;
  if (score >= 7) return "ALTA";
  if (score >= 4) return "MEDIA";
  return "BAJA";
}

async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n");
}

export function parseInvoiceFromText(text: string): ParsedPdfInvoice {
  const normalized = text.replace(/\s+/g, " ").trim();
  const tipoComprobante = detectTipoComprobante(normalized);
  const rucEmisor = extractRuc(normalized) ?? "";
  const serie = extractSerie(normalized);
  const numero = extractNumero(normalized);
  const fechaEmision = extractFecha(normalized);
  const moneda: "PEN" | "USD" = MONEDA_USD_PATTERN.test(normalized) ? "USD" : "PEN";

  const bases = extractAllMontos(normalized, SUBTOTAL_PATTERN);
  const igvs = extractAllMontos(normalized, IGV_PATTERN);
  const totales = extractAllMontos(normalized, TOTAL_PATTERN);

  let baseImponible = bases.length ? bases[bases.length - 1] : 0;
  let igv = igvs.length ? igvs[igvs.length - 1] : 0;
  let total = totales.length ? totales[totales.length - 1] : 0;

  if (total === 0 && baseImponible > 0 && igv > 0) {
    total = Math.round((baseImponible + igv) * 100) / 100;
  }
  if (baseImponible === 0 && total > 0 && igv > 0) {
    baseImponible = Math.round((total - igv) * 100) / 100;
  }
  if (igv === 0 && baseImponible > 0) {
    igv = Math.round(baseImponible * 0.18 * 100) / 100;
  }
  if (total === 0 && baseImponible > 0) {
    total = Math.round((baseImponible + igv) * 100) / 100;
  }

  const razonMatch = RAZON_SOCIAL_PATTERN.exec(normalized);
  const razonSocialEmisor = razonMatch?.[1]?.trim() ?? null;

  const partial = {
    tipoComprobante,
    rucEmisor,
    razonSocialEmisor,
    serie,
    numero,
    fechaEmision,
    moneda,
    baseImponible,
    igv,
    total,
  };

  return {
    ...partial,
    textoExtraido: normalized.slice(0, 4000),
    confianza: calcularConfianza(partial),
  };
}

export async function parsePdfInvoice(file: File): Promise<ParsedPdfInvoice> {
  const buffer = await file.arrayBuffer();
  const text = await extractTextFromPdfBuffer(buffer);
  if (!text.trim()) {
    throw new Error("No se pudo extraer texto del PDF. Verifique que no esté escaneado como imagen pura.");
  }
  return parseInvoiceFromText(text);
}

export async function parsePdfInvoicesFromFile(file: File): Promise<ParsedPdfInvoice[]> {
  const invoice = await parsePdfInvoice(file);
  return [invoice];
}

export function parsedPdfToImportRow(
  invoice: ParsedPdfInvoice,
  filaNumero: number,
): import("@/modules/importador/types/importador").FilaComprobanteImport {
  const periodo = invoice.fechaEmision.replace(/-/g, "").slice(0, 6);
  return {
    filaNumero,
    ruc: invoice.rucEmisor,
    razonSocial: invoice.razonSocialEmisor ?? "SIN RAZON SOCIAL",
    tipoDoc: invoice.tipoComprobante,
    serie: invoice.serie,
    numero: invoice.numero,
    fecha: invoice.fechaEmision,
    moneda: invoice.moneda,
    base: invoice.baseImponible,
    igv: invoice.igv,
    total: invoice.total,
    periodo,
    tipoCambio: invoice.moneda === "USD" ? 3.75 : 1,
  };
}
