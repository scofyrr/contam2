// supabase/functions/consultar-ruc/index.ts
// Consulta Ficha RUC vía Decolecta — sin datos falsos por defecto
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DECOLECTA_RUC_URL = "https://api.decolecta.com/v1/sunat/ruc/full";
const FETCH_TIMEOUT_MS = 30_000;

interface ConsultaRucBody {
  ruc?: string;
  permitSimulacion?: boolean;
  ping?: boolean;
}

interface RepresentanteLegalDto {
  nombre: string;
  cargo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaDesde: string | null;
}

interface EstablecimientoAnexoDto {
  denominacion: string;
  domicilio: string;
  ubigeo: string | null;
  tipo: string;
}

interface TributoAfectoDto {
  codigo: string;
  descripcion: string;
  fechaAlta: string | null;
}

interface FichaRucEnriquecida {
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  estadoContribuyente: string;
  condicionDomicilioFiscal: string;
  regimenTributario: string | null;
  tipoContribuyente: string | null;
  actividadEconomicaPrincipal: string | null;
  sistemaContabilidad: string | null;
  domicilioFiscal: {
    direccion: string;
    departamento: string | null;
    provincia: string | null;
    distrito: string | null;
    ubigeo: string | null;
    tipoVia: string | null;
    nombreVia: string | null;
    numero: string | null;
    interior: string | null;
  };
  fechaInscripcion: string | null;
  fechaInicioActividades: string | null;
  representantesLegales: RepresentanteLegalDto[];
  establecimientosAnexos: EstablecimientoAnexoDto[];
  tributosAfectos: TributoAfectoDto[];
  raw: Record<string, unknown>;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function envFlagTrue(name: string): boolean {
  return String(Deno.env.get(name) ?? "").trim().toLowerCase() === "true";
}

function canUseSimulation(body: ConsultaRucBody): boolean {
  return body.permitSimulacion === true || envFlagTrue("ALLOW_MOCK_FALLBACK");
}

function normalizeRuc(raw: string): string {
  const clean = raw.replace(/\D/g, "").slice(0, 11);
  if (clean.length !== 11) {
    throw new Error("RUC inválido: debe tener 11 dígitos numéricos");
  }
  return clean;
}

function normalizeDate(val: string | null | undefined): string | null {
  if (!val) return null;
  const cleanVal = String(val).trim();
  if (!cleanVal) return null;
  if (cleanVal.includes("/")) {
    const parts = cleanVal.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return cleanVal;
}

function pickString(raw: Record<string, unknown>, keys: string[], fallback: string | null = null): string | null {
  for (const key of keys) {
    const val = raw[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return fallback;
}

function mapExternalApiError(status: number, bodyText: string): { message: string; httpStatus: number } {
  if (status === 401 || status === 403) {
    return {
      message: "Token de API SUNAT/Decolecta inválido, expirado o sin saldo.",
      httpStatus: status,
    };
  }
  if (status === 429) {
    return {
      message: "Límite de peticiones a la API excedido. Intente nuevamente en unos minutos.",
      httpStatus: 429,
    };
  }
  if (status === 404) {
    return {
      message: "RUC no encontrado en SUNAT/Decolecta.",
      httpStatus: 404,
    };
  }
  if (status >= 500) {
    return {
      message: "Servidor de SUNAT/Decolecta no disponible temporalmente.",
      httpStatus: status >= 503 ? status : 503,
    };
  }
  return {
    message: `Error de API externa Decolecta/SUNAT (HTTP ${status}).`,
    httpStatus: status,
  };
}

function mapFichaRucEnriquecida(data: Record<string, unknown>): FichaRucEnriquecida {
  const ruc = pickString(data, ["numero_documento", "numeroDocumento", "ruc"], "") ?? "";

  const representantesRaw = (data.representantes_legales ?? data.representantes ?? []) as unknown;
  const representantesLegales: RepresentanteLegalDto[] = Array.isArray(representantesRaw)
    ? representantesRaw.map((p) => {
      const row = p as Record<string, unknown>;
      return {
        nombre: pickString(row, ["nombre", "apellidos_nombres"], "") ?? "",
        cargo: pickString(row, ["cargo"], "") ?? "",
        tipoDocumento: pickString(row, ["tipoDocumento", "tipo_documento"], "DNI") ?? "DNI",
        numeroDocumento: pickString(row, ["numero", "numero_documento"], "") ?? "",
        fechaDesde: normalizeDate(pickString(row, ["desde", "fecha_desde"], "") ?? undefined),
      };
    })
    : [];

  const anexosRaw = (data.locales_anexos ?? data.establecimientos ?? data.establecimientos_anexos ?? []) as unknown;
  const establecimientosAnexos: EstablecimientoAnexoDto[] = Array.isArray(anexosRaw)
    ? anexosRaw.map((e, idx) => {
      const row = e as Record<string, unknown>;
      return {
        denominacion: pickString(row, ["nombre", "denominacion"], `LOCAL ANEXO ${idx + 1}`) ?? `LOCAL ANEXO ${idx + 1}`,
        domicilio: pickString(row, ["direccion", "domicilio"], "") ?? "",
        ubigeo: pickString(row, ["ubigeo"], null),
        tipo: pickString(row, ["tipo"], "LOCAL ANEXO") ?? "LOCAL ANEXO",
      };
    })
    : [];

  const tributosRaw = (data.tributos_afectos ?? data.tributos ?? []) as unknown;
  const tributosAfectos: TributoAfectoDto[] = Array.isArray(tributosRaw)
    ? tributosRaw.map((t) => {
      const row = t as Record<string, unknown>;
      return {
        codigo: pickString(row, ["codigo"], "0000") ?? "0000",
        descripcion: pickString(row, ["descripcion", "tributo"], "") ?? "",
        fechaAlta: normalizeDate(pickString(row, ["fecha", "fecha_alta"], "") ?? undefined),
      };
    })
    : [];

  const direccion = pickString(data, ["direccion", "otras_referencias", "domicilio_fiscal"], "") ?? "";

  return {
    ruc,
    razonSocial: (pickString(data, ["razon_social", "razonSocial"], "") ?? "").toUpperCase(),
    nombreComercial: pickString(data, ["nombre_comercial", "nombreComercial"], null),
    estadoContribuyente: pickString(data, ["estado", "estado_contribuyente"], "ACTIVO") ?? "ACTIVO",
    condicionDomicilioFiscal: pickString(data, ["condicion", "condicion_domicilio_fiscal"], "HABIDO") ?? "HABIDO",
    regimenTributario: pickString(data, [
      "regimen",
      "regimen_tributario",
      "codigo_regimen",
      "regimenTributario",
    ], null),
    tipoContribuyente: pickString(data, ["tipo", "tipo_contribuyente", "tipoContribuyente"], null),
    actividadEconomicaPrincipal: pickString(data, ["actividad_economica", "actividadEconomica"], null),
    sistemaContabilidad: pickString(data, ["tipo_contabilidad", "tipoContabilidad", "sistema_contabilidad"], null),
    domicilioFiscal: {
      direccion,
      departamento: pickString(data, ["departamento"], null),
      provincia: pickString(data, ["provincia"], null),
      distrito: pickString(data, ["distrito"], null),
      ubigeo: pickString(data, ["ubigeo"], null),
      tipoVia: pickString(data, ["via_tipo", "viaTipo", "tipo_via"], null),
      nombreVia: pickString(data, ["via_nombre", "viaNombre", "nombre_via"], null),
      numero: pickString(data, ["numero"], null),
      interior: pickString(data, ["interior"], null),
    },
    fechaInscripcion: normalizeDate(pickString(data, ["fecha_inscripcion", "fechaInscripcion"], "") ?? undefined),
    fechaInicioActividades: normalizeDate(
      pickString(data, ["fecha_inicio_actividades", "fechaInicioActividades", "fecha_inicio_actividad"], "") ??
        undefined,
    ),
    representantesLegales,
    establecimientosAnexos,
    tributosAfectos,
    raw: data,
  };
}

function generarFichaRucSimulada(ruc: string): FichaRucEnriquecida {
  return {
    ruc,
    razonSocial: `CONTRIBUYENTE SIMULADO ${ruc}`,
    nombreComercial: null,
    estadoContribuyente: "ACTIVO",
    condicionDomicilioFiscal: "HABIDO",
    regimenTributario: "RG",
    tipoContribuyente: "PERSONA JURIDICA",
    actividadEconomicaPrincipal: "6920 - ACTIVIDADES DE CONTABILIDAD",
    sistemaContabilidad: "COMPUTARIZADO",
    domicilioFiscal: {
      direccion: "AV. SIMULACION 123",
      departamento: "LIMA",
      provincia: "LIMA",
      distrito: "MIRAFLORES",
      ubigeo: "150122",
      tipoVia: "AV.",
      nombreVia: "SIMULACION",
      numero: "123",
      interior: null,
    },
    fechaInscripcion: "2010-01-01",
    fechaInicioActividades: "2010-01-15",
    representantesLegales: [
      {
        nombre: "REPRESENTANTE LEGAL SIMULADO",
        cargo: "GERENTE GENERAL",
        tipoDocumento: "DNI",
        numeroDocumento: "12345678",
        fechaDesde: "2010-01-01",
      },
    ],
    establecimientosAnexos: [],
    tributosAfectos: [
      { codigo: "1010", descripcion: "IGV", fechaAlta: "2010-01-01" },
    ],
    raw: { simulacion: true, ruc },
  };
}

async function fetchRucDecolecta(ruc: string, token: string): Promise<Record<string, unknown>> {
  const url = `${DECOLECTA_RUC_URL}?numero=${encodeURIComponent(ruc)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
  } catch (fetchError) {
    if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
      throw new Error("Tiempo de espera agotado al consultar la API Decolecta/SUNAT.");
    }
    const msg = fetchError instanceof Error ? fetchError.message : "Error de red desconocido";
    throw new Error(`No se pudo conectar con la API Decolecta/SUNAT: ${msg}`);
  } finally {
    clearTimeout(timeoutId);
  }

  const responseText = await response.text();

  if (!response.ok) {
    const mapped = mapExternalApiError(response.status, responseText);
    const error = new Error(mapped.message) as Error & { httpStatus?: number; detalle?: string };
    error.httpStatus = mapped.httpStatus;
    error.detalle = responseText.trim().slice(0, 2000);
    throw error;
  }

  try {
    return responseText ? JSON.parse(responseText) as Record<string, unknown> : {};
  } catch {
    throw new Error("La API Decolecta/SUNAT devolvió una respuesta JSON inválida.");
  }
}

async function persistirFichaRuc(
  supabase: ReturnType<typeof createClient>,
  ficha: FichaRucEnriquecida,
): Promise<void> {
  const { error: errorFicha } = await supabase.from("fichas_ruc").upsert({
    ruc: ficha.ruc,
    razon_social: ficha.razonSocial,
    nombre_comercial: ficha.nombreComercial,
    estado_contribuyente: ficha.estadoContribuyente,
    condicion_domicilio_fiscal: ficha.condicionDomicilioFiscal,
    actividad_economica_principal: ficha.actividadEconomicaPrincipal,
    sistema_contabilidad: ficha.sistemaContabilidad,
    departamento: ficha.domicilioFiscal.departamento,
    provincia: ficha.domicilioFiscal.provincia,
    distrito: ficha.domicilioFiscal.distrito,
    ubigeo: ficha.domicilioFiscal.ubigeo,
    tipo_via: ficha.domicilioFiscal.tipoVia,
    nombre_via: ficha.domicilioFiscal.nombreVia,
    numero: ficha.domicilioFiscal.numero,
    interior: ficha.domicilioFiscal.interior,
    otras_referencias: ficha.domicilioFiscal.direccion,
    fecha_inscripcion: ficha.fechaInscripcion,
    fecha_inicio_actividades: ficha.fechaInicioActividades,
    tipo_contribuyente: ficha.tipoContribuyente,
  });

  if (errorFicha) {
    throw new Error(`Error al persistir ficha RUC: ${errorFicha.message}`);
  }

  if (ficha.tributosAfectos.length > 0) {
    const { error: errorTributos } = await supabase.from("tributos_afectos").upsert(
      ficha.tributosAfectos.map((t) => ({
        ruc: ficha.ruc,
        tributo: t.descripcion,
        fecha_alta: t.fechaAlta,
      })),
    );
    if (errorTributos) {
      throw new Error(`Error al persistir tributos afectos: ${errorTributos.message}`);
    }
  }

  if (ficha.representantesLegales.length > 0) {
    const { error: errorReps } = await supabase.from("representantes_legales").upsert(
      ficha.representantesLegales.map((p) => ({
        ruc: ficha.ruc,
        apellidos_nombres: p.nombre,
        tipo_documento: p.tipoDocumento,
        numero_documento: p.numeroDocumento,
        cargo: p.cargo,
        fecha_desde: p.fechaDesde,
      })),
    );
    if (errorReps) {
      throw new Error(`Error al persistir representantes legales: ${errorReps.message}`);
    }
  }

  if (ficha.establecimientosAnexos.length > 0) {
    const { error: errorEst } = await supabase.from("establecimientos_anexos").upsert(
      ficha.establecimientosAnexos.map((e) => ({
        ruc: ficha.ruc,
        denominacion: e.denominacion,
        domicilio: e.domicilio,
        ubigeo: e.ubigeo,
        tipo: e.tipo,
      })),
    );
    if (errorEst) {
      throw new Error(`Error al persistir establecimientos anexos: ${errorEst.message}`);
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Método no permitido. Use POST." }, 405);
  }

  try {
    let body: ConsultaRucBody = {};
    try {
      body = await req.json() as ConsultaRucBody;
    } catch {
      return jsonResponse({ ok: false, error: "Body JSON inválido" }, 400);
    }

    if (body.ping === true) {
      const apiToken = Deno.env.get("API_SUNAT_TOKEN")?.trim();
      const tokenOk = !!apiToken;
      return jsonResponse({
        ok: true,
        ping: true,
        edge_function: "consultar-ruc",
        fuente: tokenOk ? "DECOLECTA" : "ERROR_CONFIGURACION",
        token_configurado: tokenOk,
        error: tokenOk
          ? null
          : "El secreto API_SUNAT_TOKEN no está configurado en Supabase Edge Secrets. Ejecuta: supabase secrets set API_SUNAT_TOKEN=tu_token",
      });
    }

    if (!body.ruc?.trim()) {
      return jsonResponse({ ok: false, error: "RUC es requerido" }, 400);
    }

    const ruc = normalizeRuc(body.ruc);
    const simulationAllowed = canUseSimulation(body);

    const apiToken = Deno.env.get("API_SUNAT_TOKEN")?.trim();
    if (!apiToken) {
      return jsonResponse(
        {
          ok: false,
          fuente: "ERROR_CONFIGURACION",
          error:
            "El secreto API_SUNAT_TOKEN no está configurado en Supabase Edge Secrets. Ejecuta: supabase secrets set API_SUNAT_TOKEN=tu_token",
        },
        400,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(
        {
          ok: false,
          fuente: "ERROR_CONFIGURACION",
          error: "Credenciales Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) no configuradas en el entorno Edge.",
        },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let ficha: FichaRucEnriquecida;
    let fuente: "DECOLECTA" | "SIMULACION" = "DECOLECTA";

    try {
      const rawData = await fetchRucDecolecta(ruc, apiToken);
      const rucDoc = pickString(rawData, ["numero_documento", "numeroDocumento", "ruc"], null);

      if (!rucDoc) {
        return jsonResponse(
          {
            ok: false,
            fuente: "ERROR_API_EXTERNA",
            error: "RUC no encontrado o respuesta inválida en API externa Decolecta/SUNAT.",
            httpStatus: 404,
          },
          404,
        );
      }

      ficha = mapFichaRucEnriquecida(rawData);
    } catch (apiError) {
      if (simulationAllowed) {
        console.warn("[consultar-ruc] Simulación opt-in activada tras error API:", apiError);
        ficha = generarFichaRucSimulada(ruc);
        fuente = "SIMULACION";
      } else {
        const err = apiError as Error & { httpStatus?: number; detalle?: string };
        const httpStatus = err.httpStatus ?? 502;
        return jsonResponse(
          {
            ok: false,
            fuente: "ERROR_API_EXTERNA",
            error: err instanceof Error ? err.message : "Error al consultar API externa",
            httpStatus,
            detalle: err.detalle ?? null,
          },
          httpStatus,
        );
      }
    }

    await persistirFichaRuc(supabase, ficha);

    const rawPayload = fuente === "DECOLECTA" ? ficha.raw : { simulacion: true, ruc: ficha.ruc };

    return jsonResponse({
      ok: true,
      fuente,
      message: fuente === "SIMULACION"
        ? "Consulta en modo simulación (permitSimulacion o ALLOW_MOCK_FALLBACK=true)."
        : "Consulta RUC exitosa",
      ficha,
      data: rawPayload,
      advertencia_simulacion: fuente === "SIMULACION"
        ? "Los datos provienen de simulación local, no de SUNAT."
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno consultar-ruc";
    console.error("[consultar-ruc] Error no controlado:", err);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
