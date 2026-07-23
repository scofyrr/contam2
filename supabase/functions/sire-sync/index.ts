// supabase/functions/sire-sync/index.ts
// SIRE Core — extracción híbrida SUNAT OAuth2 (Clave SOL) + Decolecta fallback
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2?target=deno";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUNAT_OAUTH_SCOPE = "https://api-sire.sunat.gob.pe";
const SUNAT_SIRE_BASE = "https://api-sire.sunat.gob.pe";
const FETCH_TIMEOUT_MS = 45_000;
const TICKET_POLL_INTERVAL_MS = 2_000;
const TICKET_POLL_MAX_ATTEMPTS = 30;
const SUNAT_ESTADO_TERMINADO = "06";

type TipoRegistro = "RVIE" | "RCE";
type FuenteSync =
  | "SUNAT_DIRECTO"
  | "DECOLECTA"
  | "SIMULACION"
  | "ERROR_CONFIGURACION"
  | "ERROR_API_EXTERNA";

interface SyncRequestBody {
  contribuyente_id?: string;
  periodo?: string;
  tipo_registro?: TipoRegistro | string;
  permitSimulacion?: boolean;
  ping?: boolean;
}

interface ComprobanteRpc {
  ruc_contraparte: string;
  razon_social_contraparte: string;
  tipo_comprobante: string;
  serie: string;
  numero: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  moneda: string;
  tipo_cambio: number;
  base_imponible_gravada: number;
  igv_ipm: number;
  base_imponible_dgng: number;
  igv_dgng: number;
  valor_no_gravado: number;
  isc: number;
  icbper: number;
  otros_tributos: number;
  total_comprobante: number;
  origen: string;
}

interface ClaveSolCredenciales {
  usuario: string;
  clave: string;
}

interface ContribuyenteRow {
  id: string;
  ruc: string;
  razon_social: string;
  clave_sol: unknown;
  claves_sire: unknown;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function normalizePeriodo(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 6) {
    throw new Error("Periodo inválido: use formato YYYYMM");
  }
  return digits;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function pickString(raw: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const val = raw[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return fallback;
}

function pickNumber(raw: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const val = raw[key];
    if (val !== undefined && val !== null && val !== "") {
      const num = Number(val);
      if (!Number.isNaN(num)) return num;
    }
  }
  return fallback;
}

function parseCredencialesJson(value: unknown): ClaveSolCredenciales {
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    usuario: String(obj.usuario ?? "").trim(),
    clave: String(obj.clave ?? "").trim(),
  };
}

function resolveClaveSol(contrib: ContribuyenteRow): ClaveSolCredenciales {
  const sol = parseCredencialesJson(contrib.clave_sol);
  if (sol.usuario && sol.clave) return sol;
  const sire = parseCredencialesJson(contrib.claves_sire);
  if (sire.usuario && sire.clave) return sire;
  return sol.usuario || sol.clave ? sol : sire;
}

function parseSunatErrorBody(bodyText: string, status: number): string {
  const trimmed = bodyText.trim();
  if (!trimmed) return `Error SUNAT SIRE (HTTP ${status})`;

  try {
    const payload = JSON.parse(trimmed) as Record<string, unknown>;
    const errors = payload.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const parts = errors
        .map((item) => {
          if (item && typeof item === "object") {
            const row = item as Record<string, unknown>;
            return String(row.msg ?? row.message ?? "").trim();
          }
          return "";
        })
        .filter(Boolean);
      if (parts.length > 0) return parts.join(" · ");
    }
    const msg = String(payload.msg ?? payload.message ?? "").trim();
    if (msg) return msg;
  } catch {
    // texto plano
  }

  return trimmed.slice(0, 400);
}

function formatExtractionError(error: unknown): string {
  const err = error as Error & { detalle?: string; httpStatus?: number };
  const base = err.message || "Error al consultar propuesta SIRE en SUNAT";
  if (err.detalle) {
    const detalleLegible = parseSunatErrorBody(err.detalle, err.httpStatus ?? 0);
    if (detalleLegible && !base.includes(detalleLegible)) {
      return `${base} Detalle SUNAT: ${detalleLegible}`;
    }
  }
  return base;
}

function tipoToCodLibroSunat(tipo: TipoRegistro): "140000" | "080000" {
  return tipo === "RVIE" ? "140000" : "080000";
}

function buildSunatExportUrl(periodo: string, tipo: TipoRegistro): string {
  if (tipo === "RVIE") {
    return `${SUNAT_SIRE_BASE}/v1/contribuyente/migeigv/libros/rvie/propuesta/web/propuesta/${periodo}/exportapropuesta?codTipoArchivo=0`;
  }
  return `${SUNAT_SIRE_BASE}/v1/contribuyente/migeigv/libros/rce/propuesta/web/propuesta/${periodo}/exportacioncomprobantepropuesta?codTipoArchivo=0&codOrigenEnvio=2`;
}

function parseFechaSunatToIso(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const slash = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;
  return trimmed.slice(0, 10);
}

function mapDecolectaComprobante(raw: Record<string, unknown>): ComprobanteRpc {
  const base = pickNumber(raw, [
    "base_imponible_gravada",
    "base_imponible",
    "baseImponible",
    "mtoBase",
    "mto_bi_gravada",
    "bi_grav",
  ]);
  const igv = pickNumber(raw, [
    "igv_ipm",
    "igv",
    "mtoIgv",
    "mto_igv_ipe",
    "igv_grav",
  ], base > 0 ? round2(base * 0.18) : 0);
  const total = pickNumber(raw, [
    "total_comprobante",
    "total",
    "importe_total",
    "mtoTotal",
    "mto_total_cp",
  ], round2(base + igv));

  const fechaEmision = pickString(raw, [
    "fecha_emision",
    "fechaEmision",
    "fec_emision",
  ], new Date().toISOString().slice(0, 10));

  const fechaVencRaw = pickString(raw, ["fecha_vencimiento", "fechaVencimiento"], "");
  const fechaVencimiento = fechaVencRaw ? parseFechaSunatToIso(fechaVencRaw) : null;

  return {
    ruc_contraparte: pickString(raw, [
      "ruc_contraparte",
      "rucContraparte",
      "nro_doc",
      "nro_doc_contraparte",
      "num_doc_contraparte",
    ]),
    razon_social_contraparte: pickString(raw, [
      "razon_social_contraparte",
      "razon_social",
      "razonSocial",
      "nombre_contraparte",
      "nombreContraparte",
    ], "SIN NOMBRE"),
    tipo_comprobante: pickString(raw, ["tipo_comprobante", "codTipoCdp", "cod_tipo_cdp"], "01"),
    serie: pickString(raw, ["serie", "serie_cdp", "serieCdp"], "F001"),
    numero: pickString(raw, ["numero", "numero_cdp", "nro_cdp", "nro_cdp_inicial"], "1"),
    fecha_emision: parseFechaSunatToIso(fechaEmision),
    fecha_vencimiento: fechaVencimiento,
    moneda: pickString(raw, ["moneda", "cod_moneda", "codMoneda"], "PEN"),
    tipo_cambio: pickNumber(raw, ["tipo_cambio", "tipoCambio"], 1),
    base_imponible_gravada: round2(base),
    igv_ipm: round2(igv),
    base_imponible_dgng: round2(pickNumber(raw, ["base_imponible_dgng", "base_dgng", "bi_grav_y_no_grav"])),
    igv_dgng: round2(pickNumber(raw, ["igv_dgng", "igv_grav_y_no_grav"])),
    valor_no_gravado: round2(pickNumber(raw, ["valor_no_gravado", "valor_no_grav", "mto_valor_no_grav"])),
    isc: round2(pickNumber(raw, ["isc"])),
    icbper: round2(pickNumber(raw, ["icbper"])),
    otros_tributos: round2(pickNumber(raw, ["otros_tributos", "otros_cargos"])),
    total_comprobante: round2(total),
    origen: pickString(raw, ["origen"], "SUNAT_PROPUESTA"),
  };
}

function mapSireTxtLineToComprobante(campos: string[]): ComprobanteRpc | null {
  const tipoLinea = campos[0]?.trim();
  if (tipoLinea !== "020000" && tipoLinea !== "020100" && tipoLinea !== "020200") {
    return null;
  }

  const parseMonto = (idx: number) => round2(Number(String(campos[idx] ?? "0").replace(/,/g, "")) || 0);

  return {
    ruc_contraparte: String(campos[7] ?? "").trim(),
    razon_social_contraparte: String(campos[8] ?? "SIN NOMBRE").trim() || "SIN NOMBRE",
    tipo_comprobante: String(campos[3] ?? "01").trim().padStart(2, "0").slice(-2),
    serie: String(campos[4] ?? "").trim(),
    numero: String(campos[5] ?? "").trim(),
    fecha_emision: parseFechaSunatToIso(String(campos[2] ?? "")),
    fecha_vencimiento: campos[20]?.trim()
      ? parseFechaSunatToIso(String(campos[20]))
      : null,
    moneda: String(campos[18] ?? "PEN").trim() || "PEN",
    tipo_cambio: parseMonto(19) || 1,
    base_imponible_gravada: parseMonto(9),
    igv_ipm: parseMonto(10),
    base_imponible_dgng: parseMonto(11),
    igv_dgng: parseMonto(12),
    valor_no_gravado: parseMonto(13),
    isc: parseMonto(14),
    icbper: parseMonto(15),
    otros_tributos: parseMonto(16),
    total_comprobante: parseMonto(17),
    origen: "SUNAT_PROPUESTA",
  };
}

function parseSireTxtContent(text: string): ComprobanteRpc[] {
  const lines = text.split(/\r?\n/);
  const comprobantes: ComprobanteRpc[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const campos = trimmed.split("|");
    const mapped = mapSireTxtLineToComprobante(campos);
    if (mapped && mapped.numero) {
      comprobantes.push(mapped);
    }
  }

  return comprobantes;
}

function extractTxtFromZipBuffer(buffer: Uint8Array): string {
  const unzipped = unzipSync(buffer);
  const txtEntry = Object.entries(unzipped).find(([name]) =>
    name.toLowerCase().endsWith(".txt")
  );
  if (!txtEntry) {
    throw new Error("El archivo ZIP de SUNAT no contiene un .txt de propuesta.");
  }
  const [, content] = txtEntry;
  return new TextDecoder("latin1").decode(content);
}

function generarPropuestaSimulada(
  ruc: string,
  periodo: string,
  tipo: TipoRegistro,
): ComprobanteRpc[] {
  const esVenta = tipo === "RVIE";
  const base1 = esVenta ? 1500 : 850;
  const igv1 = round2(base1 * 0.18);
  const base2 = esVenta ? 3200 : 1200;
  const igv2 = round2(base2 * 0.18);
  const yyyy = periodo.slice(0, 4);
  const mm = periodo.slice(4, 6);

  return [
    {
      ruc_contraparte: esVenta ? "20100070970" : "20512345678",
      razon_social_contraparte: esVenta
        ? "SUPERMERCADOS PERUANOS S.A."
        : "DISTRIBUIDORA COMERCIAL EIRL",
      tipo_comprobante: "01",
      serie: "F001",
      numero: "00001234",
      fecha_emision: `${yyyy}-${mm}-05`,
      fecha_vencimiento: `${yyyy}-${mm}-15`,
      moneda: "PEN",
      tipo_cambio: 1,
      base_imponible_gravada: base1,
      igv_ipm: igv1,
      base_imponible_dgng: 0,
      igv_dgng: 0,
      valor_no_gravado: 0,
      isc: 0,
      icbper: 0,
      otros_tributos: 0,
      total_comprobante: round2(base1 + igv1),
      origen: "SUNAT_PROPUESTA",
    },
    {
      ruc_contraparte: esVenta ? "20456789012" : "10456789011",
      razon_social_contraparte: esVenta
        ? "CLIENTE CORPORATIVO SAC"
        : "PROVEEDOR INSUMOS SAC",
      tipo_comprobante: "03",
      serie: "B001",
      numero: "00000089",
      fecha_emision: `${yyyy}-${mm}-18`,
      fecha_vencimiento: null,
      moneda: "PEN",
      tipo_cambio: 1,
      base_imponible_gravada: base2,
      igv_ipm: igv2,
      base_imponible_dgng: 0,
      igv_dgng: 0,
      valor_no_gravado: 0,
      isc: 0,
      icbper: 0,
      otros_tributos: 0,
      total_comprobante: round2(base2 + igv2),
      origen: "SUNAT_PROPUESTA",
    },
    {
      ruc_contraparte: ruc.replace(/\D/g, "").slice(0, 11),
      razon_social_contraparte: "COMPROBANTE NOTA AJUSTE (SIMULACION)",
      tipo_comprobante: "07",
      serie: "FC01",
      numero: "00000003",
      fecha_emision: `${yyyy}-${mm}-25`,
      fecha_vencimiento: null,
      moneda: "PEN",
      tipo_cambio: 1,
      base_imponible_gravada: 200,
      igv_ipm: 36,
      base_imponible_dgng: 0,
      igv_dgng: 0,
      valor_no_gravado: 0,
      isc: 0,
      icbper: 0,
      otros_tributos: 0,
      total_comprobante: 236,
      origen: "AJUSTE_POSTERIOR",
    },
  ];
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Tiempo de espera agotado al consultar SUNAT/Decolecta.");
    }
    const msg = error instanceof Error ? error.message : "Error de red desconocido";
    throw new Error(`No se pudo conectar con el servicio externo: ${msg}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

function isSunatAuthError(status: number): boolean {
  return status === 400 || status === 401 || status === 403;
}

function isSunatEmptyPeriodError(bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  return lower.includes("1070") ||
    lower.includes("no se ha encontrado información") ||
    lower.includes("no se ha encontrado informacion");
}

function parseSunatOAuthError(responseText: string): {
  message: string;
  fuente: FuenteSync;
} {
  try {
    const payload = JSON.parse(responseText) as Record<string, unknown>;
    const oauthError = String(payload.error ?? "").trim();
    const oauthDesc = String(payload.error_description ?? "").trim();

    if (oauthError === "unauthorized_client") {
      return {
        message:
          "Client ID o Client Secret OAuth rechazados por SUNAT (unauthorized_client). Regenere las credenciales en Portal SOL → Empresas → Credenciales API SUNAT y actualice los secrets en Supabase.",
        fuente: "ERROR_CONFIGURACION",
      };
    }

    if (oauthError === "invalid_grant" || oauthDesc.toLowerCase().includes("credencial")) {
      return {
        message:
          "Usuario o Clave SOL incorrectos para este RUC. Verifique en Contribuyentes → Central de credenciales → CLAVE SOL (usuario tipo MODDATOS + clave del portal SUNAT).",
        fuente: "ERROR_API_EXTERNA",
      };
    }

    if (oauthDesc) {
      return {
        message: `SUNAT OAuth2: ${oauthDesc}`,
        fuente: "ERROR_API_EXTERNA",
      };
    }
  } catch {
    // respuesta no JSON
  }

  return {
    message:
      "Credenciales OAuth SUNAT rechazadas. Verifique Client ID/Secret en Supabase Secrets y Clave SOL en la ficha del contribuyente.",
    fuente: "ERROR_API_EXTERNA",
  };
}

async function obtainSunatAccessToken(params: {
  ruc: string;
  usuarioSol: string;
  claveSol: string;
  clientId: string;
  clientSecret: string;
}): Promise<string> {
  const username = `${params.ruc.replace(/\D/g, "").slice(0, 11)}${params.usuarioSol}`;
  const tokenUrl =
    `https://api-seguridad.sunat.gob.pe/v1/clientessol/${encodeURIComponent(params.clientId)}/oauth2/token/`;

  const body = new URLSearchParams({
    grant_type: "password",
    scope: SUNAT_OAUTH_SCOPE,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    username,
    password: params.claveSol,
  });

  const response = await fetchWithTimeout(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const responseText = await response.text();

  if (!response.ok) {
    if (isSunatAuthError(response.status)) {
      const parsed = parseSunatOAuthError(responseText);
      const error = new Error(parsed.message) as Error & {
        httpStatus?: number;
        detalle?: string;
        fuente?: FuenteSync;
      };
      error.httpStatus = response.status;
      error.detalle = responseText.slice(0, 2000);
      error.fuente = parsed.fuente;
      throw error;
    }
    throw new Error(`Error OAuth2 SUNAT (HTTP ${response.status}): ${responseText.slice(0, 300)}`);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new Error("SUNAT OAuth2 devolvió una respuesta JSON inválida.");
  }

  const accessToken = String(payload.access_token ?? "").trim();
  if (!accessToken) {
    throw new Error("SUNAT OAuth2 no devolvió access_token.");
  }

  return accessToken;
}

async function sunatJsonGet<T extends Record<string, unknown>>(
  url: string,
  accessToken: string,
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    if (response.status === 422 && isSunatEmptyPeriodError(responseText)) {
      return {} as T;
    }
    const detalleLegible = parseSunatErrorBody(responseText, response.status);
    const error = new Error(
      response.status === 404
        ? `SUNAT no generó propuesta para el periodo ${url.match(/\d{6}/)?.[0] ?? ""}. Puede no existir propuesta aún o el periodo está vacío.`
        : `Error SUNAT SIRE: ${detalleLegible}`,
    ) as Error & {
      httpStatus?: number;
      detalle?: string;
    };
    error.httpStatus = response.status;
    error.detalle = responseText.slice(0, 2000);
    throw error;
  }

  if (!responseText.trim()) return {} as T;

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error("SUNAT SIRE devolvió una respuesta JSON inválida.");
  }
}

async function pollSunatTicket(
  accessToken: string,
  periodo: string,
  numTicket: string,
): Promise<Record<string, unknown>> {
  const consultUrl =
    `${SUNAT_SIRE_BASE}/v1/contribuyente/migeigv/libros/rvierce/gestionprocesosmasivos/web/masivo/consultaestadotickets` +
    `?perIni=${encodeURIComponent(periodo)}&perFin=${encodeURIComponent(periodo)}&page=1&perPage=20&numTicket=${encodeURIComponent(numTicket)}`;

  for (let attempt = 1; attempt <= TICKET_POLL_MAX_ATTEMPTS; attempt++) {
    const payload = await sunatJsonGet<Record<string, unknown>>(consultUrl, accessToken);
    const registros = payload.registros;
    const registro = Array.isArray(registros) ? registros[0] : null;

    if (registro && typeof registro === "object") {
      const row = registro as Record<string, unknown>;
      const codEstado = String(
        row.codEstadoEnvio ?? row.codEstadoProceso ?? "",
      ).trim();

      if (codEstado === SUNAT_ESTADO_TERMINADO) {
        return row;
      }

      const desEstado = String(row.desEstadoEnvio ?? row.desEstadoProceso ?? "");
      if (codEstado && codEstado !== "05" && codEstado !== "04" && codEstado !== "03") {
        if (attempt >= TICKET_POLL_MAX_ATTEMPTS) {
          throw new Error(
            `Ticket SUNAT ${numTicket} no terminó a tiempo. Estado: ${desEstado || codEstado}`,
          );
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, TICKET_POLL_INTERVAL_MS));
  }

  throw new Error(`Ticket SUNAT ${numTicket} agotó el tiempo de espera (${TICKET_POLL_MAX_ATTEMPTS * TICKET_POLL_INTERVAL_MS / 1000}s).`);
}

async function downloadSunatArchivoReporte(
  accessToken: string,
  params: {
    nomArchivoReporte: string;
    codTipoArchivoReporte: string | null;
    codLibro: string;
  },
): Promise<Uint8Array> {
  const query = new URLSearchParams({
    nomArchivoReporte: params.nomArchivoReporte,
    codLibro: params.codLibro,
  });
  if (params.codTipoArchivoReporte != null && params.codTipoArchivoReporte !== "") {
    query.set("codTipoArchivoReporte", params.codTipoArchivoReporte);
  }

  const url =
    `${SUNAT_SIRE_BASE}/v1/contribuyente/migeigv/libros/rvierce/gestionprocesosmasivos/web/masivo/archivoreporte?${query.toString()}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Accept: "application/octet-stream, application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al descargar archivo SUNAT (HTTP ${response.status}): ${text.slice(0, 300)}`);
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error("SUNAT devolvió un archivo de propuesta vacío.");
  }
  return buffer;
}

async function fetchPropuestaSunatDirecto(
  ruc: string,
  periodo: string,
  tipo: TipoRegistro,
  credenciales: ClaveSolCredenciales,
  clientId: string,
  clientSecret: string,
): Promise<ComprobanteRpc[]> {
  const accessToken = await obtainSunatAccessToken({
    ruc,
    usuarioSol: credenciales.usuario,
    claveSol: credenciales.clave,
    clientId,
    clientSecret,
  });

  const exportUrl = buildSunatExportUrl(periodo, tipo);
  const exportPayload = await sunatJsonGet<Record<string, unknown>>(exportUrl, accessToken);
  const numTicket = String(exportPayload.numTicket ?? "").trim();

  if (!numTicket) {
    if (isSunatEmptyPeriodError(JSON.stringify(exportPayload))) {
      return [];
    }
    throw new Error("SUNAT no devolvió numTicket al solicitar exportación de propuesta.");
  }

  const ticketRow = await pollSunatTicket(accessToken, periodo, numTicket);

  const archivoReporte = ticketRow.archivoReporte;
  const reporte = Array.isArray(archivoReporte) ? archivoReporte[0] : null;
  const reporteObj = reporte && typeof reporte === "object"
    ? reporte as Record<string, unknown>
    : null;

  const nomArchivoReporte = String(
    reporteObj?.nomArchivoReporte ??
      ticketRow.nomArchivoReporte ??
      "",
  ).trim();

  if (!nomArchivoReporte) {
    throw new Error("SUNAT no generó nombre de archivo de propuesta tras completar el ticket.");
  }

  const codTipoArchivoReporte = reporteObj?.codTipoAchivoReporte != null
    ? String(reporteObj.codTipoAchivoReporte)
    : reporteObj?.codTipoArchivoReporte != null
    ? String(reporteObj.codTipoArchivoReporte)
    : null;

  const zipBuffer = await downloadSunatArchivoReporte(accessToken, {
    nomArchivoReporte,
    codTipoArchivoReporte,
    codLibro: tipoToCodLibroSunat(tipo),
  });

  const txtContent = extractTxtFromZipBuffer(zipBuffer);
  return parseSireTxtContent(txtContent);
}

function errorConfiguracionResponse(message: string): Response {
  return jsonResponse(
    {
      ok: false,
      fuente: "ERROR_CONFIGURACION" satisfies FuenteSync,
      error: message,
      insertados: 0,
      actualizados: 0,
    },
    200,
  );
}

function errorApiExternaResponse(
  error: unknown,
  extra: Record<string, unknown> = {},
): Response {
  const err = error as Error & { httpStatus?: number; detalle?: string; fuente?: FuenteSync };
  const httpStatus = err.httpStatus ?? 502;
  const message = formatExtractionError(error);
  const fuente = err.fuente ?? "ERROR_API_EXTERNA";

  return jsonResponse(
    {
      ok: false,
      fuente,
      error: message,
      httpStatus,
      detalle: err.detalle ?? null,
      insertados: 0,
      actualizados: 0,
      ...extra,
    },
    200,
  );
}

function hasSunatOAuthSecrets(): boolean {
  return !!Deno.env.get("SUNAT_CLIENT_ID")?.trim() &&
    !!Deno.env.get("SUNAT_CLIENT_SECRET")?.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Método no permitido. Use POST." }, 405);
  }

  try {
    let body: SyncRequestBody;
    try {
      body = await req.json() as SyncRequestBody;
    } catch {
      return jsonResponse({ ok: false, error: "Body JSON inválido" }, 400);
    }

    if (body.ping === true) {
      const oauthOk = hasSunatOAuthSecrets();

      return jsonResponse({
        ok: true,
        ping: true,
        edge_function: "sire-sync",
        fuente: oauthOk ? "SUNAT_DIRECTO" : "ERROR_CONFIGURACION",
        sunat_oauth_configurado: oauthOk,
        token_configurado: oauthOk,
        error: oauthOk
          ? null
          : "Configure SUNAT_CLIENT_ID y SUNAT_CLIENT_SECRET en Supabase Edge Secrets. La sync SIRE usa la API oficial SUNAT (OAuth2 + Clave SOL), no Decolecta.",
      });
    }

    if (!body.contribuyente_id?.trim()) {
      return jsonResponse({ ok: false, error: "contribuyente_id es requerido", insertados: 0, actualizados: 0 }, 400);
    }
    if (!body.periodo?.trim()) {
      return jsonResponse({ ok: false, error: "periodo es requerido (YYYYMM)", insertados: 0, actualizados: 0 }, 400);
    }
    if (!body.tipo_registro || !["RVIE", "RCE"].includes(String(body.tipo_registro).toUpperCase())) {
      return jsonResponse({ ok: false, error: "tipo_registro debe ser RVIE o RCE", insertados: 0, actualizados: 0 }, 400);
    }

    const periodo = normalizePeriodo(body.periodo);
    const tipoRegistro = String(body.tipo_registro).toUpperCase() as TipoRegistro;
    const simulationAllowed = body.permitSimulacion === true;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(
        {
          ok: false,
          fuente: "ERROR_CONFIGURACION",
          error: "Credenciales Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) no configuradas en el entorno Edge.",
          insertados: 0,
          actualizados: 0,
        },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: contrib, error: contribErr } = await supabase
      .from("contribuyentes")
      .select("id, ruc, razon_social, clave_sol, claves_sire")
      .eq("id", body.contribuyente_id.trim())
      .maybeSingle();

    if (contribErr) {
      return jsonResponse({ ok: false, error: contribErr.message, insertados: 0, actualizados: 0 }, 500);
    }
    if (!contrib?.ruc) {
      return jsonResponse({ ok: false, error: "Contribuyente no encontrado", insertados: 0, actualizados: 0 }, 404);
    }

    const claveSol = resolveClaveSol(contrib as ContribuyenteRow);
    const hasClaveSol = !!(claveSol.usuario && claveSol.clave);
    const oauthSecrets = hasSunatOAuthSecrets();
    const clientId = Deno.env.get("SUNAT_CLIENT_ID")?.trim() ?? "";
    const clientSecret = Deno.env.get("SUNAT_CLIENT_SECRET")?.trim() ?? "";

    if (!oauthSecrets) {
      return errorConfiguracionResponse(
        "Faltan SUNAT_CLIENT_ID y SUNAT_CLIENT_SECRET en Supabase Edge Secrets. Ejecute: supabase secrets set SUNAT_CLIENT_ID=... SUNAT_CLIENT_SECRET=...",
      );
    }

    if (!hasClaveSol) {
      return errorConfiguracionResponse(
        `El contribuyente ${contrib.ruc} no tiene Clave SOL en la BD. Configure usuario y clave SOL en Contribuyentes → Ficha → Credenciales SOL.`,
      );
    }

    let comprobantes: ComprobanteRpc[] = [];
    let fuente: FuenteSync = "SUNAT_DIRECTO";
    let extractionError: unknown = null;

    try {
      comprobantes = await fetchPropuestaSunatDirecto(
        contrib.ruc,
        periodo,
        tipoRegistro,
        claveSol,
        clientId,
        clientSecret,
      );
      fuente = "SUNAT_DIRECTO";
    } catch (sunatError) {
      extractionError = sunatError;
    }

    if (extractionError) {
      if (simulationAllowed) {
        console.warn("[sire-sync] Simulación explícita tras error de extracción:", extractionError);
        comprobantes = generarPropuestaSimulada(contrib.ruc, periodo, tipoRegistro);
        fuente = "SIMULACION";
      } else {
        return errorApiExternaResponse(extractionError, {
          contribuyente_id: body.contribuyente_id,
          periodo,
          tipo_registro: tipoRegistro,
        });
      }
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "fn_sincronizar_propuesta_sire",
      {
        p_contribuyente_id: body.contribuyente_id.trim(),
        p_periodo: periodo,
        p_tipo_registro: tipoRegistro,
        p_comprobantes: comprobantes,
      },
    );

    if (rpcError) {
      return jsonResponse(
        {
          ok: false,
          fuente,
          error: rpcError.message,
          details: rpcError.details ?? null,
          hint: rpcError.hint ?? null,
          insertados: 0,
          actualizados: 0,
        },
        500,
      );
    }

    const result = rpcData as Record<string, unknown>;

    return jsonResponse({
      ok: true,
      contribuyente_id: body.contribuyente_id.trim(),
      periodo,
      tipo_registro: tipoRegistro,
      insertados: Number(result.insertados ?? 0),
      actualizados: Number(result.actualizados ?? 0),
      inconsistencias: Number(result.inconsistencias ?? 0),
      periodo_id: String(result.periodo_id ?? ""),
      fuente,
      comprobantes_recibidos: comprobantes.length,
      advertencia_simulacion: fuente === "SIMULACION"
        ? "Los datos provienen de simulación local (permitSimulacion=true en la petición)."
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno sire-sync";
    console.error("[sire-sync] Error no controlado:", err);
    return jsonResponse(
      {
        ok: false,
        error: message,
        insertados: 0,
        actualizados: 0,
      },
      500,
    );
  }
});
