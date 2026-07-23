import { L as jsxRuntimeExports, U as reactExports } from "./server-BIroHbvu.js";
import { u as useQuery } from "./useQuery-CNpr8Hir.js";
import { B as Badge } from "./badge-BjDV6F_B.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { L as Label } from "./label-Dsj3Zaer.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BZS9NJ-P.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-BGymvpwQ.js";
import { m as useContribuyentes } from "./use-contribuyentes-CGcEKwfv.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { ac as supabase, a as FunctionsHttpError, ad as throwIfSupabaseError, ar as useQueryClient, aj as toast } from "./router-BRL0s0LD.js";
import { u as useMutation } from "./useMutation-DxnWSsR1.js";
import { b as TooltipProvider, T as Tooltip, c as TooltipTrigger, a as TooltipContent } from "./tooltip-BDZK6R2w.js";
import { C as ClientOnly } from "./ClientOnly-BWZ-Dgxk.js";
import { u as useIsMounted } from "./useIsMounted-4vSd_CfI.js";
import { C as Clock } from "./clock-DWVbtk8A.js";
import { C as CircleCheck } from "./circle-check-B2Wi3ps7.js";
import { T as TriangleAlert } from "./triangle-alert-B4GeD7-7.js";
import { C as CircleQuestionMark } from "./circle-question-mark-CY-HltlU.js";
import { L as LoaderCircle } from "./loader-circle-OqnuRBje.js";
import { R as RefreshCw } from "./refresh-cw-CZfG2mto.js";
import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import { T as TrendingUp } from "./trending-up-BUgChl3g.js";
import { S as ShoppingCart } from "./shopping-cart-C3O-Qmkj.js";
import { F as FileText } from "./file-text-BTjS5wgu.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Bd_3-P22.js";
import "./Combination-BhKuaGUd.js";
import "./chevron-up-CkMbl0kk.js";
import "./contribuyentes-service-C3l05GhV.js";
import "./http-client-BNGDvc7A.js";
import "./index-DcTyhqP8.js";
const __iconNode = [
  ["path", { d: "M12 13v8l-4-4", key: "1f5nwf" }],
  ["path", { d: "m12 21 4-4", key: "1lfcce" }],
  ["path", { d: "M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284", key: "ui1hmy" }]
];
const CloudDownload = createLucideIcon("cloud-download", __iconNode);
class SireSyncError extends Error {
  fuente;
  httpStatus;
  detalle;
  insertados;
  actualizados;
  constructor(message, options = {}) {
    super(message);
    this.name = "SireSyncError";
    this.fuente = options.fuente ?? "ERROR_API_EXTERNA";
    this.httpStatus = options.httpStatus;
    this.detalle = options.detalle ?? null;
    this.insertados = options.insertados ?? 0;
    this.actualizados = options.actualizados ?? 0;
  }
  static fromPayload(payload, fallbackMessage) {
    const fuente = String(payload.fuente ?? "ERROR_API_EXTERNA");
    const message = String(payload.error ?? fallbackMessage ?? "Sincronización SIRE fallida");
    return new SireSyncError(message, {
      fuente,
      httpStatus: payload.httpStatus != null ? Number(payload.httpStatus) : void 0,
      detalle: payload.detalle != null ? String(payload.detalle) : null,
      insertados: Number(payload.insertados ?? 0),
      actualizados: Number(payload.actualizados ?? 0)
    });
  }
}
const TIPO_DOC_MAP = {
  "01": "01",
  "03": "03",
  "07": "07",
  "08": "08"
};
function pad(value, length, char = "0") {
  const str = value == null ? "" : String(value);
  if (str.length >= length) return str.slice(0, length);
  return char.repeat(length - str.length) + str;
}
function formatMonto(value) {
  const n = Number(value ?? 0);
  return n.toFixed(2);
}
function formatFechaPle(fecha) {
  if (!fecha) return "";
  const clean = fecha.includes("T") ? fecha.slice(0, 10) : fecha;
  const [y, m, d] = clean.split("-");
  if (!y || !m || !d) return clean.replace(/-/g, "");
  return `${d}/${m}/${y}`;
}
function generarNombreArchivoSire(ruc, periodo, codigoLibro, oportunidad = "00") {
  const rucClean = ruc.replace(/\D/g, "").slice(0, 11);
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  const libro = codigoLibro === "140400" ? "140400" : "130400";
  return `LE${rucClean}${periodoClean}00${libro}001111${oportunidad}.txt`;
}
function generarTxtSireSinMovimiento(ruc, periodo, tipoRegistro, oportunidad = "00") {
  const rucClean = ruc.replace(/\D/g, "").slice(0, 11);
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  const nombreArchivo = generarNombreArchivoSire(rucClean, periodoClean, tipoRegistro, oportunidad);
  const anio = periodoClean.slice(0, 4);
  const mes = periodoClean.slice(4, 6);
  const codLibro = tipoRegistro;
  const descripcionLibro = tipoRegistro === "140400" ? "REGISTRO DE VENTAS E INGRESOS ELECTRÓNICO" : "REGISTRO DE COMPRAS ELECTRÓNICO";
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
    ""
  ].join("|");
  return {
    nombreArchivo,
    contenido: `${lineaCabecera}\r
`,
    codigoLibro: tipoRegistro,
    periodo: periodoClean,
    ruc: rucClean,
    esSinMovimiento: true
  };
}
function tipoRegistroToCodigoLibro(tipo) {
  return tipo === "RVIE" ? "140400" : "130400";
}
function buildLineaComprobanteRvie(ruc, periodo, c, correlativo) {
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
    ""
  ];
  return campos.join("|");
}
function buildLineaComprobanteRce(ruc, periodo, c, correlativo) {
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
    ""
  ];
  return campos.join("|");
}
function generarTxtSireConComprobantes(params) {
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
  const descripcionLibro = codigoLibro === "140400" ? "REGISTRO DE VENTAS E INGRESOS ELECTRÓNICO" : "REGISTRO DE COMPRAS ELECTRÓNICO";
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
    ""
  ].join("|");
  const lineasDetalle = params.comprobantes.map(
    (c, idx) => params.tipoRegistro === "RVIE" ? buildLineaComprobanteRvie(rucClean, periodoClean, c, idx + 1) : buildLineaComprobanteRce(rucClean, periodoClean, c, idx + 1)
  );
  const contenido = [lineaCabecera, ...lineasDetalle].join("\r\n") + "\r\n";
  return {
    nombreArchivo,
    contenido,
    codigoLibro,
    periodo: periodoClean,
    ruc: rucClean,
    esSinMovimiento: false
  };
}
function descargarTxtSire(archivo) {
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
function codigoLibroDesdeTipoRegistro(tipo) {
  return tipoRegistroToCodigoLibro(tipo);
}
function labelTipoRegistro(tipo) {
  return tipo === "RVIE" ? "RVIE — Ventas (140400)" : "RCE — Compras (130400)";
}
const db = supabase;
const SIRE_FUENTE_STORAGE_PREFIX = "contam:sire:fuente:";
function extractInvokePayload(data, error) {
  if (data && typeof data === "object") {
    return data;
  }
  if (error instanceof FunctionsHttpError) {
    const ctx = error.context;
    if (ctx && typeof ctx === "object") {
      return ctx;
    }
    try {
      if (typeof error.context === "string") {
        return JSON.parse(error.context);
      }
    } catch {
    }
  }
  return null;
}
const COMPROBANTE_SELECT = `
  id,
  contribuyente_id,
  periodo_id,
  periodo,
  tipo_registro,
  origen,
  nro_doc_contraparte,
  nombre_contraparte,
  cod_tipo_cdp,
  serie_cdp,
  nro_cdp_inicial,
  fecha_emision,
  fecha_vencimiento,
  cod_moneda,
  tipo_cambio,
  registros_sire_montos (
    registro_sire_id,
    base_imponible_gravada,
    igv_ipm,
    base_imponible_dgng,
    igv_dgng,
    valor_no_gravado,
    isc,
    icbper,
    otros_tributos,
    total_comprobante,
    importe_total,
    bi_grav,
    igv_grav,
    bi_adq_grav,
    igv_adq_grav
  )
`;
function cleanPeriodo(periodo) {
  return periodo.replace(/\D/g, "").slice(0, 6);
}
function fuenteStorageKey(contribuyenteId, periodo) {
  return `${SIRE_FUENTE_STORAGE_PREFIX}${contribuyenteId}:${cleanPeriodo(periodo)}`;
}
function unwrapMontos(raw) {
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}
function mapResumen(row) {
  return {
    contribuyenteId: row.contribuyente_id,
    ruc: row.ruc,
    periodo: row.periodo,
    periodoId: row.periodo_id,
    rvie: {
      estado: row.rvie.estado,
      cantidadComprobantes: Number(row.rvie.cantidad_comprobantes ?? 0),
      baseImponible: Number(row.rvie.base_imponible ?? 0),
      igv: Number(row.rvie.igv ?? 0),
      total: Number(row.rvie.total ?? 0)
    },
    rce: {
      estado: row.rce.estado,
      cantidadComprobantes: Number(row.rce.cantidad_comprobantes ?? 0),
      baseImponible: Number(row.rce.base_imponible ?? 0),
      igv: Number(row.rce.igv ?? 0),
      total: Number(row.rce.total ?? 0)
    },
    inconsistencias: {
      alertas: Number(row.inconsistencias.alertas ?? 0),
      erroresBloqueantes: Number(row.inconsistencias.errores_bloqueantes ?? 0),
      total: Number(row.inconsistencias.total ?? 0)
    },
    fechaSincronizacion: row.fecha_sincronizacion
  };
}
function mapComprobante(row) {
  const m = unwrapMontos(row.registros_sire_montos);
  const base = Number(m?.base_imponible_gravada ?? m?.bi_grav ?? m?.bi_adq_grav ?? 0);
  const igv = Number(m?.igv_ipm ?? m?.igv_grav ?? m?.igv_adq_grav ?? 0);
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    periodoId: row.periodo_id,
    periodo: row.periodo,
    tipoRegistro: row.tipo_registro ?? "RVIE",
    origen: row.origen ?? "SUNAT_PROPUESTA",
    rucContraparte: row.nro_doc_contraparte,
    razonSocialContraparte: row.nombre_contraparte,
    tipoComprobante: row.cod_tipo_cdp,
    serie: row.serie_cdp,
    numero: row.nro_cdp_inicial,
    fechaEmision: row.fecha_emision,
    fechaVencimiento: row.fecha_vencimiento,
    moneda: row.cod_moneda,
    tipoCambio: Number(row.tipo_cambio ?? 1),
    baseImponibleGravada: base,
    igvIpm: igv,
    baseImponibleDgng: Number(m?.base_imponible_dgng ?? 0),
    igvDgng: Number(m?.igv_dgng ?? 0),
    valorNoGravado: Number(m?.valor_no_gravado ?? 0),
    isc: Number(m?.isc ?? 0),
    icbper: Number(m?.icbper ?? 0),
    otrosTributos: Number(m?.otros_tributos ?? 0),
    totalComprobante: Number(m?.total_comprobante ?? m?.importe_total ?? 0)
  };
}
function detectarSimulacionEnComprobantes(comprobantes) {
  return comprobantes.some((c) => {
    const nombre = (c.razonSocialContraparte ?? "").toUpperCase();
    return nombre.includes("SIMULACION") || nombre.includes("SIMULADO");
  });
}
function persistirEstadoFuenteSync(contribuyenteId, periodo, entry) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      fuente: entry.fuente,
      fechaSincronizacion: entry.fechaSincronizacion ?? (/* @__PURE__ */ new Date()).toISOString(),
      ultimoError: entry.ultimoError ?? null,
      tipoRegistro: entry.tipoRegistro
    };
    localStorage.setItem(fuenteStorageKey(contribuyenteId, periodo), JSON.stringify(payload));
  } catch {
  }
}
function leerEstadoFuenteStorage(contribuyenteId, periodo) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(fuenteStorageKey(contribuyenteId, periodo));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function sincronizarPropuestaSire(request) {
  const periodo = cleanPeriodo(request.periodo);
  const { data, error } = await db.functions.invoke("sire-sync", {
    body: {
      contribuyente_id: request.contribuyenteId,
      periodo,
      tipo_registro: request.tipoRegistro
    }
  });
  const payload = extractInvokePayload(data, error) ?? (data ?? {});
  if (error) {
    if (payload && typeof payload === "object" && ("error" in payload || "fuente" in payload)) {
      throw SireSyncError.fromPayload(payload, error.message);
    }
    throw new SireSyncError(error.message || "Error al invocar sire-sync", {
      fuente: "ERROR_API_EXTERNA"
    });
  }
  if (!payload?.ok) {
    throw SireSyncError.fromPayload(payload);
  }
  const fuente = String(payload.fuente ?? "DECOLECTA");
  const response = {
    ok: true,
    contribuyenteId: String(payload.contribuyente_id ?? request.contribuyenteId),
    periodo: String(payload.periodo ?? periodo),
    tipoRegistro: payload.tipo_registro ?? request.tipoRegistro,
    insertados: Number(payload.insertados ?? 0),
    actualizados: Number(payload.actualizados ?? 0),
    inconsistencias: Number(payload.inconsistencias ?? 0),
    periodoId: String(payload.periodo_id ?? ""),
    fuente,
    error: payload.error != null ? String(payload.error) : null,
    httpStatus: payload.httpStatus != null ? Number(payload.httpStatus) : null,
    detalle: payload.detalle != null ? String(payload.detalle) : null,
    advertenciaSimulacion: payload.advertencia_simulacion != null ? String(payload.advertencia_simulacion) : null,
    advertenciaFallback: payload.advertencia_fallback != null ? String(payload.advertencia_fallback) : null,
    comprobantesRecibidos: Number(payload.comprobantes_recibidos ?? 0)
  };
  persistirEstadoFuenteSync(response.contribuyenteId, response.periodo, {
    fuente: response.fuente,
    ultimoError: null,
    tipoRegistro: response.tipoRegistro
  });
  return response;
}
async function fetchResumenPeriodo(contribuyenteId, periodo) {
  const periodoClean = cleanPeriodo(periodo);
  const { data, error } = await db.rpc("fn_obtener_resumen_sire_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodoClean
  });
  throwIfSupabaseError(error, "Error al obtener resumen SIRE del periodo");
  if (!data) {
    throw new Error("Resumen SIRE vacío");
  }
  return mapResumen(data);
}
async function fetchComprobantesSire(params) {
  const periodo = cleanPeriodo(params.periodo);
  let query = db.from("registros_sire_cabecera").select(COMPROBANTE_SELECT).eq("contribuyente_id", params.contribuyenteId).eq("periodo", periodo).order("fecha_emision", { ascending: false });
  if (params.tipoRegistro) {
    query = query.eq("tipo_registro", params.tipoRegistro);
  }
  const { data, error } = await query;
  throwIfSupabaseError(error, "Error al listar comprobantes SIRE (estructura normalizada)");
  return (data ?? []).map(mapComprobante);
}
async function fetchEstadoFuentePeriodo(contribuyenteId, periodo) {
  const periodoClean = cleanPeriodo(periodo);
  const stored = leerEstadoFuenteStorage(contribuyenteId, periodoClean);
  let resumen = null;
  try {
    resumen = await fetchResumenPeriodo(contribuyenteId, periodoClean);
  } catch {
    resumen = null;
  }
  let comprobantesMuestra = [];
  if (!stored && resumen) {
    try {
      comprobantesMuestra = await fetchComprobantesSire({
        contribuyenteId,
        periodo: periodoClean
      });
    } catch {
      comprobantesMuestra = [];
    }
  }
  const esSimulacionDetectada = detectarSimulacionEnComprobantes(comprobantesMuestra);
  if (stored) {
    return {
      contribuyenteId,
      periodo: periodoClean,
      fuente: stored.fuente,
      fechaSincronizacion: resumen?.fechaSincronizacion ?? stored.fechaSincronizacion,
      ultimoError: stored.ultimoError,
      esSimulacionDetectada: stored.fuente === "SIMULACION" || esSimulacionDetectada
    };
  }
  if (esSimulacionDetectada) {
    return {
      contribuyenteId,
      periodo: periodoClean,
      fuente: "SIMULACION",
      fechaSincronizacion: resumen?.fechaSincronizacion ?? null,
      ultimoError: null,
      esSimulacionDetectada: true
    };
  }
  const tieneDatos = (resumen?.rvie.cantidadComprobantes ?? 0) + (resumen?.rce.cantidadComprobantes ?? 0) > 0;
  if (tieneDatos && resumen?.fechaSincronizacion) {
    return {
      contribuyenteId,
      periodo: periodoClean,
      fuente: "DESCONOCIDO",
      fechaSincronizacion: resumen.fechaSincronizacion,
      ultimoError: null,
      esSimulacionDetectada: false
    };
  }
  return {
    contribuyenteId,
    periodo: periodoClean,
    fuente: "PENDIENTE",
    fechaSincronizacion: resumen?.fechaSincronizacion ?? null,
    ultimoError: null,
    esSimulacionDetectada: false
  };
}
async function generarYDescargarTxtSire(params) {
  const codigoLibro = codigoLibroDesdeTipoRegistro(params.tipoRegistro);
  const periodo = cleanPeriodo(params.periodo);
  const ruc = params.ruc.replace(/\D/g, "").slice(0, 11);
  let archivo;
  if (params.sinMovimiento || (params.comprobantes?.length ?? 0) === 0) {
    archivo = generarTxtSireSinMovimiento(ruc, periodo, codigoLibro, "00");
  } else {
    archivo = generarTxtSireConComprobantes({
      ruc,
      periodo,
      tipoRegistro: params.tipoRegistro,
      comprobantes: params.comprobantes ?? []
    });
  }
  descargarTxtSire(archivo);
  return archivo;
}
async function fetchContribuyenteIdByRuc(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
const SECRETS_HELP_COMMAND = `# 1) Portal SOL (e-menu.sunat.gob.pe) → Empresas → Credenciales API SUNAT
#    Copie Client ID y Client Secret generados para el RUC 20602438342

npx supabase secrets set SUNAT_CLIENT_ID="su_client_id"
npx supabase secrets set SUNAT_CLIENT_SECRET="su_client_secret"

# 2) En la app: Contribuyentes → OSMICE E.I.R.L. → Central de credenciales → CLAVE SOL
#    Usuario SOL (ej. MODDATOS) + Clave SOL del portal SUNAT`;
const sireCoreQueryKeys = {
  all: ["sire-core"],
  resumen: (contribuyenteId, periodo) => ["sire-core", "resumen", contribuyenteId, periodo],
  comprobantes: (contribuyenteId, periodo, tipo) => ["sire-core", "comprobantes", contribuyenteId, periodo, tipo],
  inconsistencias: (contribuyenteId, periodo) => ["sire-core", "inconsistencias", contribuyenteId, periodo],
  estadoFuente: (contribuyenteId, periodo) => ["sire-core", "estado-fuente", contribuyenteId, periodo]
};
async function invalidateSireRelatedQueries(qc, contribuyenteId, periodo, tipoRegistro) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  await Promise.all([
    qc.invalidateQueries({ queryKey: sireCoreQueryKeys.all }),
    qc.invalidateQueries({ queryKey: sireCoreQueryKeys.resumen(contribuyenteId, periodoClean) }),
    qc.invalidateQueries({
      queryKey: sireCoreQueryKeys.comprobantes(contribuyenteId, periodoClean, "ALL")
    }),
    qc.invalidateQueries({
      queryKey: sireCoreQueryKeys.inconsistencias(contribuyenteId, periodoClean)
    }),
    qc.invalidateQueries({
      queryKey: sireCoreQueryKeys.estadoFuente(contribuyenteId, periodoClean)
    }),
    tipoRegistro ? qc.invalidateQueries({
      queryKey: sireCoreQueryKeys.comprobantes(contribuyenteId, periodoClean, tipoRegistro)
    }) : Promise.resolve(),
    qc.invalidateQueries({ queryKey: ["compras-ventas"] }),
    qc.invalidateQueries({ queryKey: ["compras_rce"] }),
    qc.invalidateQueries({ queryKey: ["ventas_rvie"] }),
    qc.invalidateQueries({ queryKey: ["workflow"] }),
    qc.invalidateQueries({ queryKey: ["registros_sire_cabecera"] }),
    qc.invalidateQueries({ queryKey: ["sire"] })
  ]);
}
function copySecretsCommand() {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(SECRETS_HELP_COMMAND);
    toast.message("Comando copiado al portapapeles");
  }
}
function notifySyncSuccess(result) {
  const baseMsg = `🟢 SIRE sincronizado con SUNAT real (${result.insertados} nuevos, ${result.actualizados} actualizados)`;
  const msg = result.inconsistencias > 0 ? `${baseMsg} — ${result.inconsistencias} inconsistencia(s) detectada(s)` : baseMsg;
  toast.success(msg, { duration: 8e3 });
  if (result.advertenciaFallback) {
    toast.message(result.advertenciaFallback, { duration: 1e4 });
  }
}
function notifySyncSimulation(result) {
  const motivo = result.advertenciaSimulacion || result.error || "Token API no configurado o error en la API externa";
  toast.warning(
    `⚠️ Modo Simulación Activo: Se cargaron datos de prueba locales. Motivo: ${motivo}`,
    { duration: 12e3 }
  );
  if (result.inconsistencias > 0) {
    toast.message(`${result.inconsistencias} inconsistencia(s) detectada(s) en los datos simulados.`);
  }
}
function notifySyncError(error) {
  if (error instanceof SireSyncError) {
    const isConfig = error.fuente === "ERROR_CONFIGURACION" || error.httpStatus === 400 || error.httpStatus === 401 || error.httpStatus === 403;
    if (isConfig) {
      toast.error(`🔴 Error de Conexión SUNAT: ${error.message}`, {
        duration: 15e3,
        action: {
          label: "Copiar comando",
          onClick: copySecretsCommand
        }
      });
      return;
    }
    toast.error(`🔴 Error de Conexión SUNAT: ${error.message}`, {
      duration: 12e3,
      description: error.detalle ? error.detalle.slice(0, 180) : void 0
    });
    return;
  }
  toast.error(`🔴 Error de Conexión SUNAT: ${error.message || "Sincronización SIRE fallida"}`, {
    duration: 1e4,
    action: {
      label: "Copiar comando",
      onClick: copySecretsCommand
    }
  });
}
function useSireResumenPeriodo(contribuyenteId, periodo, enabled = true) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  return useQuery({
    queryKey: sireCoreQueryKeys.resumen(contribuyenteId, periodoClean),
    queryFn: () => fetchResumenPeriodo(contribuyenteId, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 6e4,
    refetchOnWindowFocus: true
  });
}
function useSireComprobantesPeriodo(contribuyenteId, periodo, tipoRegistro, enabled = true) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  return useQuery({
    queryKey: sireCoreQueryKeys.comprobantes(contribuyenteId, periodoClean, tipoRegistro),
    queryFn: () => fetchComprobantesSire({
      contribuyenteId,
      periodo: periodoClean,
      tipoRegistro
    }),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useSireEstadoFuentePeriodo(contribuyenteId, periodo, enabled = true) {
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  return useQuery({
    queryKey: sireCoreQueryKeys.estadoFuente(contribuyenteId, periodoClean),
    queryFn: () => fetchEstadoFuentePeriodo(contribuyenteId, periodoClean),
    enabled: enabled && !!contribuyenteId && periodoClean.length === 6,
    staleTime: 15e3,
    refetchOnWindowFocus: true
  });
}
function useSireSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request) => sincronizarPropuestaSire(request),
    onSuccess: async (result) => {
      if (result.fuente === "DECOLECTA" || result.fuente === "SUNAT_DIRECTO") {
        notifySyncSuccess(result);
      } else if (result.fuente === "SIMULACION") {
        notifySyncSimulation(result);
      } else {
        toast.error(`🔴 Error de Conexión SUNAT: ${result.error ?? "Fuente de sync desconocida"}`);
      }
      await invalidateSireRelatedQueries(
        qc,
        result.contribuyenteId,
        result.periodo,
        result.tipoRegistro
      );
    },
    onError: (error, variables) => {
      if (error instanceof SireSyncError) {
        persistirEstadoFuenteSync(variables.contribuyenteId, variables.periodo, {
          fuente: error.fuente,
          ultimoError: error.message,
          tipoRegistro: variables.tipoRegistro
        });
      }
      notifySyncError(error);
    }
  });
}
function useDescargarTxtSire() {
  return useMutation({
    mutationFn: generarYDescargarTxtSire,
    onSuccess: (archivo) => {
      toast.success(`Archivo ${archivo.nombreArchivo} descargado`);
    },
    onError: (error) => {
      toast.error(error.message || "No se pudo generar el archivo TXT");
    }
  });
}
const GLASS_BADGE = "rounded-full border backdrop-blur-md px-3 py-1 text-xs font-medium shadow-sm";
function formatSyncTime(iso, mounted) {
  if (!iso || !mounted) return null;
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return null;
  }
}
function SireSyncStatusBadgeInner({
  contribuyenteId,
  periodo,
  className
}) {
  const mounted = useIsMounted();
  const periodoClean = periodo?.replace(/\D/g, "").slice(0, 6) ?? "";
  const { data: estado, isLoading } = useSireEstadoFuentePeriodo(
    contribuyenteId,
    periodoClean,
    !!contribuyenteId && periodoClean.length === 6
  );
  if (!contribuyenteId || periodoClean.length !== 6) {
    return null;
  }
  if (isLoading && !estado) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Badge,
      {
        variant: "outline",
        className: cn(
          GLASS_BADGE,
          "border-slate-600/50 bg-slate-900/60 text-slate-400 animate-pulse",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3.5 mr-1.5" }),
          "Verificando origen SIRE…"
        ]
      }
    );
  }
  if (!estado) return null;
  const horaSync = formatSyncTime(estado.fechaSincronizacion, mounted);
  const esSunatReal = (estado.fuente === "DECOLECTA" || estado.fuente === "SUNAT_DIRECTO") && !estado.esSimulacionDetectada;
  const esSimulacion = estado.fuente === "SIMULACION" || estado.esSimulacionDetectada;
  if (esSunatReal) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: "outline",
          className: cn(
            GLASS_BADGE,
            "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-emerald-950/30",
            className
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3.5 mr-1.5 text-emerald-400" }),
            "🟢 Sincronizado SUNAT",
            horaSync ? ` · ${horaSync}` : ""
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipContent, { side: "bottom", className: "max-w-xs text-sm", children: [
        "Propuesta RVIE/RCE obtenida desde la API Decolecta/SUNAT.",
        horaSync ? ` Última sincronización: ${horaSync}.` : ""
      ] })
    ] }) });
  }
  if (esSimulacion) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: "outline",
          className: cn(
            GLASS_BADGE,
            "border-yellow-400/60 bg-yellow-400/10 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.15)]",
            className
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3.5 mr-1.5 text-yellow-400" }),
            "🟡 Datos de Simulación"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipContent, { side: "bottom", className: "max-w-sm text-sm space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Atención: Configure ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: "API_SUNAT_TOKEN" }),
          " en Supabase Edge Secrets para obtener la propuesta real de SUNAT."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
          "Comando:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: 'npx supabase secrets set API_SUNAT_TOKEN="tu_bearer_token"' })
        ] }),
        estado.ultimoError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-200/90 text-xs", children: [
          "Último error: ",
          estado.ultimoError
        ] })
      ] })
    ] }) });
  }
  if (estado.fuente === "PENDIENTE") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: "outline",
          className: cn(
            GLASS_BADGE,
            "border-slate-600/50 bg-slate-900/50 text-slate-400",
            className
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "size-3.5 mr-1.5" }),
            "Sin sincronizar"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "max-w-xs text-sm", children: 'Este periodo aún no tiene propuesta SIRE sincronizada. Use "Sincronizar propuesta SUNAT".' })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Badge,
      {
        variant: "outline",
        className: cn(
          GLASS_BADGE,
          "border-sky-500/40 bg-sky-500/10 text-sky-200",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3.5 mr-1.5" }),
          "Datos locales",
          horaSync ? ` · ${horaSync}` : ""
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "bottom", className: "max-w-xs text-sm", children: "Hay comprobantes en el periodo pero no se registró el origen SUNAT en esta sesión. Sincronice nuevamente para confirmar la fuente." })
  ] }) });
}
function SireSyncStatusBadge(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SireSyncStatusBadgeInner, { ...props }) });
}
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
function useClientMounted() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function defaultPeriodo() {
  const d = /* @__PURE__ */ new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}
function formatSoles(amount, mounted) {
  if (!mounted) return "S/ —";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2
  }).format(amount);
}
function formatFecha(fecha, mounted) {
  if (!fecha || !mounted) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(fecha.includes("T") ? fecha : `${fecha}T12:00:00`));
  } catch {
    return fecha;
  }
}
function OrigenBadge({ origen }) {
  const map = {
    SUNAT_PROPUESTA: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    AJUSTE_POSTERIOR: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    REEMPLAZO: "border-sky-500/40 bg-sky-500/10 text-sky-300"
  };
  const labels = {
    SUNAT_PROPUESTA: "Propuesta SUNAT",
    AJUSTE_POSTERIOR: "Ajuste",
    REEMPLAZO: "Reemplazo"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-[10px]", map[origen]), children: labels[origen] });
}
function KpiGlassCard({
  label,
  value,
  icon,
  accent = "emerald"
}) {
  const accentClass = accent === "sky" ? "border-sky-500/30 bg-sky-500/10 text-sky-300" : accent === "amber" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-5", accentClass.split(" ")[0], "border"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium uppercase tracking-wider text-slate-500", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: accentClass.split(" ").slice(1).join(" "), children: icon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-2xl font-bold", accentClass.split(" ")[2]), children: value })
  ] });
}
function SireDashboardHub({ className }) {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [tipoRegistro, setTipoRegistro] = reactExports.useState("RVIE");
  const contribuyente = reactExports.useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc]
  );
  const { data: resolvedContribuyenteId } = useQuery({
    queryKey: ["contribuyente-id-by-ruc", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRuc(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 6e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedContribuyenteId ?? null;
  const options = reactExports.useMemo(
    () => contribuyentes.filter((c) => c.ruc?.trim()).map((c) => ({
      ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
      label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`,
      id: c.id
    })),
    [contribuyentes]
  );
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  const {
    data: resumen,
    isLoading: loadingResumen,
    refetch: refetchResumen,
    isFetching: fetchingResumen
  } = useSireResumenPeriodo(contribuyenteId, periodoClean, !!contribuyenteId);
  const {
    data: comprobantes = [],
    isLoading: loadingComprobantes,
    refetch: refetchComprobantes
  } = useSireComprobantesPeriodo(contribuyenteId, periodoClean, tipoRegistro, !!contribuyenteId);
  const syncMutation = useSireSync();
  const downloadMutation = useDescargarTxtSire();
  const metricasActuales = tipoRegistro === "RVIE" ? resumen?.rvie : resumen?.rce;
  const handleSync = () => {
    if (!contribuyenteId) return;
    syncMutation.mutate(
      {
        contribuyenteId,
        periodo: periodoClean,
        tipoRegistro
      },
      {
        onSuccess: async () => {
          await refetchResumen();
          await refetchComprobantes();
        }
      }
    );
  };
  const handleDescargarTxt = (sinMovimiento) => {
    if (!selectedRuc) return;
    downloadMutation.mutate({
      ruc: selectedRuc,
      periodo: periodoClean,
      tipoRegistro,
      comprobantes: sinMovimiento ? [] : comprobantes,
      sinMovimiento
    });
  };
  const periodosOptions = reactExports.useMemo(() => {
    const list = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      list.push(`${y}${m}`);
    }
    return list;
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("min-h-full space-y-6 p-4 md:p-6", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "SIRE Core — Hub de Sincronización" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "RVIE (140400) · RCE (130400) · Propuesta SUNAT · Archivos planos sin movimiento" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SireSyncStatusBadge, { contribuyenteId, periodo: periodoClean })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 md:p-5"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 lg:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Contribuyente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: selectedRuc || void 0,
              onValueChange: setSelectedRuc,
              disabled: loadingContrib,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "border-slate-700 bg-slate-950/50 text-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione RUC…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.ruc, children: o.label }, o.ruc)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Periodo (YYYYMM)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: periodoClean, onValueChange: setPeriodo, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "border-slate-700 bg-slate-950/50 text-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: periodosOptions.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p, children: [
              p.slice(0, 4),
              "-",
              p.slice(4, 6)
            ] }, p)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Registro SIRE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: tipoRegistro,
              onValueChange: (v) => setTipoRegistro(v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "border-slate-700 bg-slate-950/50 text-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RVIE", children: labelTipoRegistro("RVIE") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RCE", children: labelTipoRegistro("RCE") })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSync,
            disabled: !contribuyenteId || syncMutation.isPending,
            className: "bg-emerald-600 hover:bg-emerald-500",
            children: syncMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 size-4 animate-spin" }),
              "Sincronizando…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 size-4" }),
              "Sincronizar propuesta SUNAT"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "border-slate-700 text-slate-300",
            disabled: !contribuyenteId || fetchingResumen,
            onClick: () => void refetchResumen(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "mr-2 size-4" }),
              "Refrescar resumen"
            ]
          }
        )
      ] })
    ] }),
    !contribuyenteId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground", children: "Seleccione un contribuyente para sincronizar registros SIRE del periodo." }),
    contribuyenteId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiGlassCard,
          {
            label: "Base imponible",
            value: loadingResumen ? "…" : formatSoles(metricasActuales?.baseImponible ?? 0, mounted),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-5" }),
            accent: "emerald"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiGlassCard,
          {
            label: "IGV / IPM",
            value: loadingResumen ? "…" : formatSoles(metricasActuales?.igv ?? 0, mounted),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "size-5" }),
            accent: "sky"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiGlassCard,
          {
            label: "Total facturado",
            value: loadingResumen ? "…" : formatSoles(metricasActuales?.total ?? 0, mounted),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-5" }),
            accent: "amber"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiGlassCard,
          {
            label: "Comprobantes",
            value: loadingResumen ? "…" : String(metricasActuales?.cantidadComprobantes ?? 0),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-5" })
          }
        )
      ] }),
      resumen && resumen.inconsistencias.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mt-0.5 size-5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Inconsistencias detectadas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm opacity-90", children: [
            resumen.inconsistencias.alertas,
            " alerta(s) ·",
            " ",
            resumen.inconsistencias.erroresBloqueantes,
            " error(es) bloqueante(s)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "overflow-hidden"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-slate-800/80 px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-slate-100", children: [
            "Comprobantes propuestos — ",
            labelTipoRegistro(tipoRegistro)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
            "Periodo ",
            periodoClean.slice(0, 4),
            "-",
            periodoClean.slice(4, 6),
            resumen?.fechaSincronizacion && mounted && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " · Última sync: ",
              formatFecha(resumen.fechaSincronizacion, mounted)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Fecha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Tipo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Serie-Número" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "RUC emisor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Contraparte" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-slate-400", children: "Base" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-slate-400", children: "IGV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-slate-400", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Origen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            loadingComprobantes && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 9, className: "py-12 text-center text-slate-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mx-auto mb-2 size-6 animate-spin text-emerald-400" }),
              "Cargando comprobantes…"
            ] }) }),
            !loadingComprobantes && comprobantes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-12 text-center text-slate-500", children: "Sin comprobantes para este periodo. Sincronice la propuesta SUNAT o genere archivo sin movimiento." }) }),
            !loadingComprobantes && comprobantes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                className: "border-slate-800/60 hover:bg-slate-800/30",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-slate-300", children: formatFecha(c.fechaEmision, mounted) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-slate-400", children: c.tipoComprobante }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-sm text-slate-200", children: [
                    c.serie,
                    "-",
                    c.numero
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-emerald-400/90", children: c.rucContraparte ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[180px] truncate text-slate-400", children: c.razonSocialContraparte ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-slate-300", children: formatSoles(c.baseImponibleGravada, mounted) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-slate-300", children: formatSoles(c.igvIpm, mounted) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-medium text-emerald-300", children: formatSoles(c.totalComprobante, mounted) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrigenBadge, { origen: c.origen }) })
                ]
              },
              c.id
            ))
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-6"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 font-semibold text-slate-100", children: "Declaración sin movimiento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-4 text-sm text-slate-500", children: [
          "Genere el archivo plano `.txt` normativo SUNAT cuando el periodo no registre operaciones de ",
          tipoRegistro === "RVIE" ? "ventas" : "compras",
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "border-emerald-600/40 text-emerald-300 hover:bg-emerald-500/10",
              disabled: !selectedRuc || downloadMutation.isPending,
              onClick: () => handleDescargarTxt(true),
              children: [
                downloadMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 size-4" }),
                "Descargar TXT sin movimiento"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "border-slate-600 text-slate-300",
              disabled: !selectedRuc || comprobantes.length === 0 || downloadMutation.isPending,
              onClick: () => handleDescargarTxt(false),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 size-4" }),
                "Descargar TXT con comprobantes (",
                comprobantes.length,
                ")"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  SireDashboardHub
};
