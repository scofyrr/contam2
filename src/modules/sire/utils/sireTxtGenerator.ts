import type {
  SireCodigoLibro,
  SireComprobanteCabecera,
  SireTxtGenerado,
  SireTipoRegistro,
} from "@/modules/sire/types/sire-core";

const TIPO_DOC_MAP: Record<string, string> = {
  "01": "01",
  "03": "03",
  "07": "07",
  "08": "08",
};

function pad(value: string | number | null | undefined, length: number, char = "0"): string {
  const str = value == null ? "" : String(value);
  if (str.length >= length) return str.slice(0, length);
  return char.repeat(length - str.length) + str;
}

function formatMonto(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toFixed(2);
}

function formatFechaPle(fecha: string | null | undefined): string {
  if (!fecha) return "";
  const clean = fecha.includes("T") ? fecha.slice(0, 10) : fecha;
  const [y, m, d] = clean.split("-");
  if (!y || !m || !d) return clean.replace(/-/g, "");
  return `${d}/${m}/${y}`;
}

export function generarNombreArchivoSire(
  ruc: string,
  periodo: string,
  codigoLibro: SireCodigoLibro,
  oportunidad = "00",
): string {
  const rucClean = ruc.replace(/\D/g, "").slice(0, 11);
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  const libro = codigoLibro === "140400" ? "140400" : "130400";
  return `LE${rucClean}${periodoClean}00${libro}001111${oportunidad}.txt`;
}

export function generarTxtSireSinMovimiento(
  ruc: string,
  periodo: string,
  tipoRegistro: SireCodigoLibro,
  oportunidad = "00",
): SireTxtGenerado {
  const rucClean = ruc.replace(/\D/g, "").slice(0, 11);
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  const nombreArchivo = generarNombreArchivoSire(rucClean, periodoClean, tipoRegistro, oportunidad);

  const anio = periodoClean.slice(0, 4);
  const mes = periodoClean.slice(4, 6);
  const codLibro = tipoRegistro;
  const descripcionLibro =
    tipoRegistro === "140400"
      ? "REGISTRO DE VENTAS E INGRESOS ELECTRÓNICO"
      : "REGISTRO DE COMPRAS ELECTRÓNICO";

  const lineaCabecera = [
    "010000",
    rucClean,
    descripcionLibro,
    codLibro,
    periodoClean,
    oportunidad,
    "1",
    "",
    "1",
    anio,
    mes,
    "",
    "",
    "",
    "0",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ].join("|");

  return {
    nombreArchivo,
    contenido: `${lineaCabecera}\r\n`,
    codigoLibro: tipoRegistro,
    periodo: periodoClean,
    ruc: rucClean,
    esSinMovimiento: true,
  };
}

function tipoRegistroToCodigoLibro(tipo: SireTipoRegistro): SireCodigoLibro {
  return tipo === "RVIE" ? "140400" : "130400";
}

function buildLineaComprobanteRvie(
  ruc: string,
  periodo: string,
  c: SireComprobanteCabecera,
  correlativo: number,
): string {
  const campos = [
    "020000",
    pad(correlativo, 10),
    formatFechaPle(c.fechaEmision),
    pad(TIPO_DOC_MAP[c.tipoComprobante] ?? c.tipoComprobante, 2),
    c.serie ?? "",
    c.numero ?? "",
    "",
    c.rucContraparte ?? "",
    c.razonSocialContraparte ?? "",
    formatMonto(c.baseImponibleGravada),
    formatMonto(c.igvIpm),
    formatMonto(c.baseImponibleDgng),
    formatMonto(c.igvDgng),
    formatMonto(c.valorNoGravado),
    formatMonto(c.isc),
    formatMonto(c.icbper),
    formatMonto(c.otrosTributos),
    formatMonto(c.totalComprobante),
    c.moneda ?? "PEN",
    formatMonto(c.tipoCambio),
    formatFechaPle(c.fechaVencimiento),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];
  return campos.join("|");
}

function buildLineaComprobanteRce(
  ruc: string,
  periodo: string,
  c: SireComprobanteCabecera,
  correlativo: number,
): string {
  const campos = [
    "020000",
    pad(correlativo, 10),
    formatFechaPle(c.fechaEmision),
    pad(TIPO_DOC_MAP[c.tipoComprobante] ?? c.tipoComprobante, 2),
    c.serie ?? "",
    c.numero ?? "",
    "",
    c.rucContraparte ?? "",
    c.razonSocialContraparte ?? "",
    formatMonto(c.baseImponibleGravada),
    formatMonto(c.igvIpm),
    formatMonto(c.baseImponibleDgng),
    formatMonto(c.igvDgng),
    formatMonto(c.valorNoGravado),
    formatMonto(c.isc),
    formatMonto(c.icbper),
    formatMonto(c.otrosTributos),
    formatMonto(c.totalComprobante),
    c.moneda ?? "PEN",
    formatMonto(c.tipoCambio),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];
  return campos.join("|");
}

export function generarTxtSireConComprobantes(params: {
  ruc: string;
  periodo: string;
  tipoRegistro: SireTipoRegistro;
  comprobantes: SireComprobanteCabecera[];
  oportunidad?: string;
}): SireTxtGenerado {
  const rucClean = params.ruc.replace(/\D/g, "").slice(0, 11);
  const periodoClean = params.periodo.replace(/\D/g, "").slice(0, 6);
  const codigoLibro = tipoRegistroToCodigoLibro(params.tipoRegistro);
  const oportunidad = params.oportunidad ?? "00";

  if (params.comprobantes.length === 0) {
    return generarTxtSireSinMovimiento(rucClean, periodoClean, codigoLibro, oportunidad);
  }

  const nombreArchivo = generarNombreArchivoSire(rucClean, periodoClean, codigoLibro, oportunidad);
  const anio = periodoClean.slice(0, 4);
  const mes = periodoClean.slice(4, 6);
  const descripcionLibro =
    codigoLibro === "140400"
      ? "REGISTRO DE VENTAS E INGRESOS ELECTRÓNICO"
      : "REGISTRO DE COMPRAS ELECTRÓNICO";

  const totalBase = params.comprobantes.reduce((s, c) => s + c.baseImponibleGravada, 0);
  const totalIgv = params.comprobantes.reduce((s, c) => s + c.igvIpm, 0);
  const totalGeneral = params.comprobantes.reduce((s, c) => s + c.totalComprobante, 0);

  const lineaCabecera = [
    "010000",
    rucClean,
    descripcionLibro,
    codigoLibro,
    periodoClean,
    oportunidad,
    String(params.comprobantes.length),
    "",
    "1",
    anio,
    mes,
    formatMonto(totalBase),
    formatMonto(totalIgv),
    formatMonto(totalGeneral),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ].join("|");

  const lineasDetalle = params.comprobantes.map((c, idx) =>
    params.tipoRegistro === "RVIE"
      ? buildLineaComprobanteRvie(rucClean, periodoClean, c, idx + 1)
      : buildLineaComprobanteRce(rucClean, periodoClean, c, idx + 1),
  );

  const contenido = [lineaCabecera, ...lineasDetalle].join("\r\n") + "\r\n";

  return {
    nombreArchivo,
    contenido,
    codigoLibro,
    periodo: periodoClean,
    ruc: rucClean,
    esSinMovimiento: false,
  };
}

export function descargarTxtSire(archivo: SireTxtGenerado): void {
  const blob = new Blob([archivo.contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = archivo.nombreArchivo;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function codigoLibroDesdeTipoRegistro(tipo: SireTipoRegistro): SireCodigoLibro {
  return tipoRegistroToCodigoLibro(tipo);
}

export function labelTipoRegistro(tipo: SireTipoRegistro): string {
  return tipo === "RVIE" ? "RVIE — Ventas (140400)" : "RCE — Compras (130400)";
}
