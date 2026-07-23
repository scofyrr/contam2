import type { Formato51Result, Formato52Result } from "@/modules/contabilidad/types/contabilidad";
import type { LibroMayorF61Response } from "@/modules/libro-mayor/types/libroMayor";
import type { MovimientoCaja } from "@/modules/tesoreria/types/tesoreria";

export type PdfReportKind = "F51" | "F52" | "F61" | "CAJA_010100";

export interface PdfContribuyenteInfo {
  ruc: string;
  razonSocial: string;
}

export interface PdfReportMeta {
  contribuyente: PdfContribuyenteInfo;
  periodo: string;
  codigoLibro: string;
  nombreLibro: string;
  verificationCode: string;
  generatedAt: string;
  logoUrl?: string;
  firmaDigitalUrl?: string;
  elaboradoPor?: string;
}

export interface Formato51PdfProps {
  meta: PdfReportMeta;
  data: Formato51Result;
  qrDataUrl?: string;
}

export interface Formato52PdfProps {
  meta: PdfReportMeta;
  data: Formato52Result;
  qrDataUrl?: string;
}

export interface Formato61PdfProps {
  meta: PdfReportMeta;
  data: LibroMayorF61Response;
  qrDataUrl?: string;
}

export interface LibroCajaPdfData {
  movimientos: MovimientoCaja[];
  totalIngresos: number;
  totalEgresos: number;
  saldoFinal: number;
  cuentaFinanciera?: string;
}

export interface LibroCajaPdfProps {
  meta: PdfReportMeta;
  data: LibroCajaPdfData;
  qrDataUrl?: string;
}

export function buildVerificationCode(
  kind: PdfReportKind,
  ruc: string,
  periodo: string,
): string {
  const stamp = Date.now().toString(36).toUpperCase();
  return `CONTAM-${kind}-${ruc}-${periodo}-${stamp}`;
}

export function buildPdfFileName(
  kind: PdfReportKind,
  periodo: string,
  ruc: string,
): string {
  const prefix =
    kind === "F51"
      ? "CONTAM_F51"
      : kind === "F52"
        ? "CONTAM_F52"
        : kind === "F61"
          ? "CONTAM_F61"
          : "CONTAM_CAJA_010100";
  return `${prefix}_${periodo}_${ruc}.pdf`;
}
