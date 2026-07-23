import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import {
  SireSyncError,
  type SireComprobanteModel,
  type SireEstadoFuentePeriodo,
  type SireFuenteSync,
  type SireInconsistencia,
  type SireOrigenRegistro,
  type SireResumenPeriodo,
  type SireSyncRequest,
  type SireSyncResponse,
  type SireTipoRegistro,
  type SireTxtGenerado,
} from "@/modules/sire/types/sire-core";
import {
  codigoLibroDesdeTipoRegistro,
  descargarTxtSire,
  generarTxtSireConComprobantes,
  generarTxtSireSinMovimiento,
} from "@/modules/sire/utils/sireTxtGenerator";

type SireDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
  functions: {
    invoke: (
      name: string,
      options?: { body?: Record<string, unknown> },
    ) => ReturnType<typeof supabase.functions.invoke>;
  };
};

const db = supabase as unknown as SireDb;

const SIRE_FUENTE_STORAGE_PREFIX = "contam:sire:fuente:";

function extractInvokePayload(
  data: unknown,
  error: unknown,
): Record<string, unknown> | null {
  if (data && typeof data === "object") {
    return data as Record<string, unknown>;
  }

  if (error instanceof FunctionsHttpError) {
    const ctx = error.context as unknown;
    if (ctx && typeof ctx === "object") {
      return ctx as Record<string, unknown>;
    }
    try {
      if (typeof error.context === "string") {
        return JSON.parse(error.context) as Record<string, unknown>;
      }
    } catch {
      // ignore parse errors
    }
  }

  return null;
}

/** Select PostgREST: cabecera + montos normalizados (ADR-003) */
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

type ResumenRpcRow = {
  contribuyente_id: string;
  ruc: string;
  periodo: string;
  periodo_id: string | null;
  rvie: {
    estado: string;
    cantidad_comprobantes: number;
    base_imponible: number;
    igv: number;
    total: number;
  };
  rce: {
    estado: string;
    cantidad_comprobantes: number;
    base_imponible: number;
    igv: number;
    total: number;
  };
  inconsistencias: {
    alertas: number;
    errores_bloqueantes: number;
    total: number;
  };
  fecha_sincronizacion: string | null;
};

type MontosRow = {
  registro_sire_id?: string | null;
  base_imponible_gravada: number | null;
  igv_ipm: number | null;
  base_imponible_dgng: number | null;
  igv_dgng: number | null;
  valor_no_gravado: number | null;
  isc: number | null;
  icbper: number | null;
  otros_tributos: number | null;
  total_comprobante: number | null;
  importe_total: number | null;
  bi_grav: number | null;
  igv_grav: number | null;
  bi_adq_grav: number | null;
  igv_adq_grav: number | null;
};

type CabeceraRow = {
  id: string;
  contribuyente_id: string | null;
  periodo_id: string | null;
  periodo: string;
  tipo_registro: SireTipoRegistro | null;
  origen: SireOrigenRegistro | null;
  nro_doc_contraparte: string | null;
  nombre_contraparte: string | null;
  cod_tipo_cdp: string;
  serie_cdp: string | null;
  nro_cdp_inicial: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  cod_moneda: string;
  tipo_cambio: number;
  registros_sire_montos: MontosRow | MontosRow[] | null;
};

type InconsistenciaRow = {
  id: string;
  periodo_id: string;
  tipo_registro: SireTipoRegistro;
  comprobante_ref: string | null;
  descripcion_error: string;
  severidad: SireInconsistencia["severidad"];
  resuelto: boolean;
};

type FuenteStorageEntry = {
  fuente: SireFuenteSync;
  fechaSincronizacion: string;
  ultimoError: string | null;
  tipoRegistro?: SireTipoRegistro;
};

function cleanPeriodo(periodo: string): string {
  return periodo.replace(/\D/g, "").slice(0, 6);
}

function fuenteStorageKey(contribuyenteId: string, periodo: string): string {
  return `${SIRE_FUENTE_STORAGE_PREFIX}${contribuyenteId}:${cleanPeriodo(periodo)}`;
}

function unwrapMontos(raw: CabeceraRow["registros_sire_montos"]): MontosRow | null {
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

function mapResumen(row: ResumenRpcRow): SireResumenPeriodo {
  return {
    contribuyenteId: row.contribuyente_id,
    ruc: row.ruc,
    periodo: row.periodo,
    periodoId: row.periodo_id,
    rvie: {
      estado: row.rvie.estado as SireResumenPeriodo["rvie"]["estado"],
      cantidadComprobantes: Number(row.rvie.cantidad_comprobantes ?? 0),
      baseImponible: Number(row.rvie.base_imponible ?? 0),
      igv: Number(row.rvie.igv ?? 0),
      total: Number(row.rvie.total ?? 0),
    },
    rce: {
      estado: row.rce.estado as SireResumenPeriodo["rce"]["estado"],
      cantidadComprobantes: Number(row.rce.cantidad_comprobantes ?? 0),
      baseImponible: Number(row.rce.base_imponible ?? 0),
      igv: Number(row.rce.igv ?? 0),
      total: Number(row.rce.total ?? 0),
    },
    inconsistencias: {
      alertas: Number(row.inconsistencias.alertas ?? 0),
      erroresBloqueantes: Number(row.inconsistencias.errores_bloqueantes ?? 0),
      total: Number(row.inconsistencias.total ?? 0),
    },
    fechaSincronizacion: row.fecha_sincronizacion,
  };
}

function mapComprobante(row: CabeceraRow): SireComprobanteModel {
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
    totalComprobante: Number(m?.total_comprobante ?? m?.importe_total ?? 0),
  };
}

function mapInconsistencia(row: InconsistenciaRow): SireInconsistencia {
  return {
    id: row.id,
    periodoId: row.periodo_id,
    tipoRegistro: row.tipo_registro,
    comprobanteRef: row.comprobante_ref,
    descripcionError: row.descripcion_error,
    severidad: row.severidad,
    resuelto: row.resuelto,
  };
}

function detectarSimulacionEnComprobantes(comprobantes: SireComprobanteModel[]): boolean {
  return comprobantes.some((c) => {
    const nombre = (c.razonSocialContraparte ?? "").toUpperCase();
    return nombre.includes("SIMULACION") || nombre.includes("SIMULADO");
  });
}

export function persistirEstadoFuenteSync(
  contribuyenteId: string,
  periodo: string,
  entry: Omit<FuenteStorageEntry, "fechaSincronizacion"> & { fechaSincronizacion?: string },
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: FuenteStorageEntry = {
      fuente: entry.fuente,
      fechaSincronizacion: entry.fechaSincronizacion ?? new Date().toISOString(),
      ultimoError: entry.ultimoError ?? null,
      tipoRegistro: entry.tipoRegistro,
    };
    localStorage.setItem(fuenteStorageKey(contribuyenteId, periodo), JSON.stringify(payload));
  } catch {
    // localStorage no disponible — ignorar
  }
}

function leerEstadoFuenteStorage(
  contribuyenteId: string,
  periodo: string,
): FuenteStorageEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(fuenteStorageKey(contribuyenteId, periodo));
    if (!raw) return null;
    return JSON.parse(raw) as FuenteStorageEntry;
  } catch {
    return null;
  }
}

export async function sincronizarPropuestaSire(
  request: SireSyncRequest,
): Promise<SireSyncResponse> {
  const periodo = cleanPeriodo(request.periodo);

  const { data, error } = await db.functions.invoke("sire-sync", {
    body: {
      contribuyente_id: request.contribuyenteId,
      periodo,
      tipo_registro: request.tipoRegistro,
    },
  });

  const payload = extractInvokePayload(data, error) ?? (data ?? {}) as Record<string, unknown>;

  if (error) {
    if (payload && typeof payload === "object" && ("error" in payload || "fuente" in payload)) {
      throw SireSyncError.fromPayload(payload, error.message);
    }
    throw new SireSyncError(error.message || "Error al invocar sire-sync", {
      fuente: "ERROR_API_EXTERNA",
    });
  }

  if (!payload?.ok) {
    throw SireSyncError.fromPayload(payload);
  }

  const fuente = String(payload.fuente ?? "DECOLECTA") as SireFuenteSync;

  const response: SireSyncResponse = {
    ok: true,
    contribuyenteId: String(payload.contribuyente_id ?? request.contribuyenteId),
    periodo: String(payload.periodo ?? periodo),
    tipoRegistro: (payload.tipo_registro as SireTipoRegistro) ?? request.tipoRegistro,
    insertados: Number(payload.insertados ?? 0),
    actualizados: Number(payload.actualizados ?? 0),
    inconsistencias: Number(payload.inconsistencias ?? 0),
    periodoId: String(payload.periodo_id ?? ""),
    fuente,
    error: payload.error != null ? String(payload.error) : null,
    httpStatus: payload.httpStatus != null ? Number(payload.httpStatus) : null,
    detalle: payload.detalle != null ? String(payload.detalle) : null,
    advertenciaSimulacion:
      payload.advertencia_simulacion != null ? String(payload.advertencia_simulacion) : null,
    advertenciaFallback:
      payload.advertencia_fallback != null ? String(payload.advertencia_fallback) : null,
    comprobantesRecibidos: Number(payload.comprobantes_recibidos ?? 0),
  };

  persistirEstadoFuenteSync(response.contribuyenteId, response.periodo, {
    fuente: response.fuente,
    ultimoError: null,
    tipoRegistro: response.tipoRegistro,
  });

  return response;
}

export async function fetchResumenPeriodo(
  contribuyenteId: string,
  periodo: string,
): Promise<SireResumenPeriodo> {
  const periodoClean = cleanPeriodo(periodo);

  const { data, error } = await db.rpc("fn_obtener_resumen_sire_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodoClean,
  });

  throwIfSupabaseError(error, "Error al obtener resumen SIRE del periodo");

  if (!data) {
    throw new Error("Resumen SIRE vacío");
  }

  return mapResumen(data as ResumenRpcRow);
}

/** @deprecated Use fetchResumenPeriodo */
export const obtenerResumenSirePeriodo = fetchResumenPeriodo;

export async function fetchComprobantesSire(params: {
  contribuyenteId: string;
  periodo: string;
  tipoRegistro?: SireTipoRegistro;
}): Promise<SireComprobanteModel[]> {
  const periodo = cleanPeriodo(params.periodo);

  let query = db
    .from("registros_sire_cabecera")
    .select(COMPROBANTE_SELECT)
    .eq("contribuyente_id", params.contribuyenteId)
    .eq("periodo", periodo)
    .order("fecha_emision", { ascending: false });

  if (params.tipoRegistro) {
    query = query.eq("tipo_registro", params.tipoRegistro);
  }

  const { data, error } = await query;

  throwIfSupabaseError(error, "Error al listar comprobantes SIRE (estructura normalizada)");

  return ((data ?? []) as unknown as CabeceraRow[]).map(mapComprobante);
}

/** @deprecated Use fetchComprobantesSire */
export async function listarComprobantesSirePeriodo(params: {
  contribuyenteId: string;
  periodo: string;
  tipoRegistro: SireTipoRegistro;
}): Promise<SireComprobanteModel[]> {
  return fetchComprobantesSire(params);
}

export async function fetchInconsistencias(params: {
  contribuyenteId: string;
  periodo: string;
  soloPendientes?: boolean;
  tipoRegistro?: SireTipoRegistro;
}): Promise<SireInconsistencia[]> {
  const periodo = cleanPeriodo(params.periodo);

  const { data: periodoRow, error: periodoError } = await db
    .from("sire_periodos")
    .select("id")
    .eq("contribuyente_id", params.contribuyenteId)
    .eq("periodo", periodo)
    .maybeSingle();

  throwIfSupabaseError(periodoError, "Error al resolver periodo SIRE");

  if (!periodoRow?.id) {
    return [];
  }

  let query = db
    .from("sire_inconsistencias")
    .select(
      "id, periodo_id, tipo_registro, comprobante_ref, descripcion_error, severidad, resuelto",
    )
    .eq("periodo_id", periodoRow.id)
    .order("created_at", { ascending: false });

  if (params.soloPendientes !== false) {
    query = query.eq("resuelto", false);
  }

  if (params.tipoRegistro) {
    query = query.eq("tipo_registro", params.tipoRegistro);
  }

  const { data, error } = await query;

  throwIfSupabaseError(error, "Error al listar inconsistencias SIRE");

  return ((data ?? []) as InconsistenciaRow[]).map(mapInconsistencia);
}

export async function fetchEstadoFuentePeriodo(
  contribuyenteId: string,
  periodo: string,
): Promise<SireEstadoFuentePeriodo> {
  const periodoClean = cleanPeriodo(periodo);
  const stored = leerEstadoFuenteStorage(contribuyenteId, periodoClean);

  let resumen: SireResumenPeriodo | null = null;
  try {
    resumen = await fetchResumenPeriodo(contribuyenteId, periodoClean);
  } catch {
    resumen = null;
  }

  let comprobantesMuestra: SireComprobanteModel[] = [];
  if (!stored && resumen) {
    try {
      comprobantesMuestra = await fetchComprobantesSire({
        contribuyenteId,
        periodo: periodoClean,
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
      esSimulacionDetectada: stored.fuente === "SIMULACION" || esSimulacionDetectada,
    };
  }

  if (esSimulacionDetectada) {
    return {
      contribuyenteId,
      periodo: periodoClean,
      fuente: "SIMULACION",
      fechaSincronizacion: resumen?.fechaSincronizacion ?? null,
      ultimoError: null,
      esSimulacionDetectada: true,
    };
  }

  const tieneDatos =
    (resumen?.rvie.cantidadComprobantes ?? 0) + (resumen?.rce.cantidadComprobantes ?? 0) > 0;

  if (tieneDatos && resumen?.fechaSincronizacion) {
    return {
      contribuyenteId,
      periodo: periodoClean,
      fuente: "DESCONOCIDO",
      fechaSincronizacion: resumen.fechaSincronizacion,
      ultimoError: null,
      esSimulacionDetectada: false,
    };
  }

  return {
    contribuyenteId,
    periodo: periodoClean,
    fuente: "PENDIENTE",
    fechaSincronizacion: resumen?.fechaSincronizacion ?? null,
    ultimoError: null,
    esSimulacionDetectada: false,
  };
}

export async function generarYDescargarTxtSire(params: {
  ruc: string;
  periodo: string;
  tipoRegistro: SireTipoRegistro;
  comprobantes?: SireComprobanteModel[];
  sinMovimiento?: boolean;
}): Promise<SireTxtGenerado> {
  const codigoLibro = codigoLibroDesdeTipoRegistro(params.tipoRegistro);
  const periodo = cleanPeriodo(params.periodo);
  const ruc = params.ruc.replace(/\D/g, "").slice(0, 11);

  let archivo: SireTxtGenerado;

  if (params.sinMovimiento || (params.comprobantes?.length ?? 0) === 0) {
    archivo = generarTxtSireSinMovimiento(ruc, periodo, codigoLibro, "00");
  } else {
    archivo = generarTxtSireConComprobantes({
      ruc,
      periodo,
      tipoRegistro: params.tipoRegistro,
      comprobantes: params.comprobantes ?? [],
    });
  }

  descargarTxtSire(archivo);
  return archivo;
}

export async function fetchContribuyenteIdByRuc(ruc: string): Promise<string | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase
    .from("contribuyentes")
    .select("id")
    .eq("ruc", clean)
    .maybeSingle();

  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
