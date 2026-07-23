/** Formateo determinista para PDFs (sin dependencia de locale del servidor) */

const LOCALE = "es-PE";

export function formatPdfDate(isoDate: string): string {
  if (!isoDate) return "—";
  const normalized = isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatPdfPeriodo(periodo: string): string {
  if (periodo.length !== 6) return periodo;
  const year = periodo.slice(0, 4);
  const month = periodo.slice(4, 6);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const idx = parseInt(month, 10) - 1;
  return `${months[idx] ?? month} ${year}`;
}

export function formatPdfMoney(value: number, moneda = "PEN"): string {
  const n = Number(value) || 0;
  const formatted = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
  const sign = n < 0 ? "-" : "";
  return `${sign}${moneda === "PEN" ? "S/ " : ""}${formatted}`;
}

export function formatPdfNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value) || 0);
}

export function truncatePdfText(text: string, maxLen: number): string {
  const t = (text ?? "").trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

export function padCorrelativo(n: number, len = 4): string {
  return String(n).padStart(len, "0");
}
