import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

import { buildQrPayload, generateQrDataUrl } from "@/modules/pdf/utils/qrCode";
import type { PdfReportMeta } from "@/modules/pdf/types/pdfReport";

export async function renderPdfBlob(
  document: ReactElement<DocumentProps>,
): Promise<Blob> {
  const instance = pdf(document);
  return instance.toBlob();
}

export async function enrichMetaWithQr(meta: PdfReportMeta): Promise<string> {
  const payload = buildQrPayload({
    verificationCode: meta.verificationCode,
    ruc: meta.contribuyente.ruc,
    periodo: meta.periodo,
    codigoLibro: meta.codigoLibro,
  });
  return generateQrDataUrl(payload);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
