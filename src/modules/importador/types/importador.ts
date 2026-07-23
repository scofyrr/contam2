export type ImportacionOrigen = "EXCEL" | "CSV" | "PDF_OCR";

export type ImportacionTipoLote = "COMPRAS" | "VENTAS" | "ASIENTOS_MANUALES";

export type ImportacionEstadoLote = "BORRADOR" | "PROCESADO" | "RECHAZADO";

export type ImportacionEstadoRegistro = "VALIDO" | "ERROR";

export type TipoComprobanteSunat = "01" | "03" | "07" | "08";

export interface ParsedPdfInvoice {
  tipoComprobante: TipoComprobanteSunat;
  rucEmisor: string;
  razonSocialEmisor: string | null;
  serie: string;
  numero: string;
  fechaEmision: string;
  moneda: "PEN" | "USD";
  baseImponible: number;
  igv: number;
  total: number;
  textoExtraido: string;
  confianza: "ALTA" | "MEDIA" | "BAJA";
}

export interface FilaComprobanteImport {
  filaNumero: number;
  ruc: string;
  razonSocial: string;
  tipoDoc: string;
  serie: string;
  numero: string;
  fecha: string;
  moneda: string;
  base: number;
  igv: number;
  total: number;
  periodo?: string;
  tipoCambio?: number;
}

export interface FilaAsientoImport {
  filaNumero: number;
  fechaAsiento: string;
  periodo: string;
  cuentaContable: string;
  debe: number;
  haber: number;
  glosa: string;
  tipoRegistro?: "COMPRA" | "VENTA";
  rucContraparte?: string;
  nombreContraparte?: string;
  serie?: string;
  numero?: string;
}

export type FilaImportNormalizada = FilaComprobanteImport | FilaAsientoImport;

export interface PreflightError {
  codigo: string;
  mensaje: string;
  campo?: string;
}

export interface PreflightRowResult<T = FilaImportNormalizada> {
  filaNumero: number;
  datos: T;
  estado: ImportacionEstadoRegistro;
  errores: PreflightError[];
}

export interface PreflightSummary {
  total: number;
  validos: number;
  errores: number;
  filas: PreflightRowResult[];
}

export interface ImportacionLote {
  id: string;
  contribuyenteId: string;
  origen: ImportacionOrigen;
  tipoLote: ImportacionTipoLote;
  totalRegistros: number;
  registrosExitosos: number;
  registrosConError: number;
  estado: ImportacionEstadoLote;
  usuarioId: string | null;
  nombreArchivo: string | null;
  periodoContable: string | null;
  createdAt: string;
  procesadoAt: string | null;
}

export interface ProcesarLoteResult {
  ok: boolean;
  loteId: string;
  registrosExitosos: number;
  registrosConError: number;
  estado: ImportacionEstadoLote;
}

export type PlantillaTipo = "COMPRAS" | "VENTAS" | "ASIENTOS";

export function isFilaComprobante(row: FilaImportNormalizada): row is FilaComprobanteImport {
  return "tipoDoc" in row && "ruc" in row;
}

export function isFilaAsiento(row: FilaImportNormalizada): row is FilaAsientoImport {
  return "cuentaContable" in row && "debe" in row;
}
