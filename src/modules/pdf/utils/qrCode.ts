import QRCode from "qrcode";

export async function generateQrDataUrl(payload: string, size = 96): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: size,
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

export function buildQrPayload(meta: {
  verificationCode: string;
  ruc: string;
  periodo: string;
  codigoLibro: string;
}): string {
  return [
    "CONTAM-ERP",
    meta.verificationCode,
    `RUC:${meta.ruc}`,
    `PER:${meta.periodo}`,
    `LIB:${meta.codigoLibro}`,
  ].join("|");
}
