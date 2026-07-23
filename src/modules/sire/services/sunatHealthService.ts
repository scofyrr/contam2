import { FunctionsHttpError } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { useNewSireStructure } from "@/lib/feature-flags";

export type SunatHealthCheckStatus = "ok" | "error" | "warning";

export interface SunatHealthCheckItem {
  id: string;
  titulo: string;
  status: SunatHealthCheckStatus;
  ok: boolean;
  mensaje: string;
  detalle?: string | null;
}

export type SunatHealthGlobalStatus =
  | "SISTEMA_OPERATIVO"
  | "ACCION_REQUERIDA"
  | "MODO_SIMULACION";

export interface SunatHealthDiagnostic {
  ejecutadoAt: string;
  globalStatus: SunatHealthGlobalStatus;
  globalLabel: string;
  migracionesOk: boolean;
  edgeFunctionDeployed: boolean;
  consultarRucDeployed: boolean;
  tokenConfigurado: boolean;
  featureFlagNuevoSire: boolean;
  checks: SunatHealthCheckItem[];
  comandosSolucion: string[];
}

const PROBE_CONTRIBUYENTE_ID = "00000000-0000-0000-0000-000000000001";
const PROBE_PERIODO = "202601";

function isSchemaMissingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("no existe") ||
    lower.includes("42p01") ||
    lower.includes("42883") ||
    lower.includes("42703") ||
    lower.includes("could not find the table") ||
    lower.includes("schema cache")
  );
}

function isNetworkOrNotFoundError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("failed to send") ||
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("404") ||
    lower.includes("not found") ||
    lower.includes("function not found") ||
    lower.includes("requested function was not found")
  );
}

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

function tokenMissingInPayload(payload: Record<string, unknown> | null): boolean {
  if (!payload) return false;
  const fuente = String(payload.fuente ?? "");
  const errorText = String(payload.error ?? "");
  const tokenFlag = payload.token_configurado;
  const oauthFlag = payload.sunat_oauth_configurado;
  if (oauthFlag === true || tokenFlag === true) return false;
  return (
    fuente === "ERROR_CONFIGURACION" ||
    errorText.includes("API_SUNAT_TOKEN") ||
    errorText.includes("SUNAT_CLIENT_ID") ||
    tokenFlag === false
  );
}

async function probeMigraciones(contribuyenteId?: string): Promise<SunatHealthCheckItem> {
  const detalles: string[] = [];
  let ok = true;

  const { error: tableError } = await supabase.from("sire_periodos").select("id").limit(1);

  if (tableError) {
    ok = false;
    detalles.push(`Tabla sire_periodos: ${tableError.message}`);
  }

  const { error: cabeceraError } = await supabase
    .from("registros_sire_cabecera")
    .select("id")
    .limit(1);

  if (cabeceraError) {
    ok = false;
    detalles.push(`Tabla registros_sire_cabecera: ${cabeceraError.message}`);
  }

  const { error: rpcError } = await supabase.rpc("fn_obtener_resumen_sire_periodo", {
    p_contribuyente_id: contribuyenteId ?? PROBE_CONTRIBUYENTE_ID,
    p_periodo: PROBE_PERIODO,
  });

  if (rpcError && isSchemaMissingError(rpcError.message)) {
    ok = false;
    detalles.push(`RPC fn_obtener_resumen_sire_periodo: ${rpcError.message}`);
  }

  const { error: syncRpcError } = await supabase.rpc("fn_sincronizar_propuesta_sire", {
    p_contribuyente_id: contribuyenteId ?? PROBE_CONTRIBUYENTE_ID,
    p_periodo: PROBE_PERIODO,
    p_tipo_registro: "RVIE",
    p_comprobantes: [],
  });

  if (syncRpcError && isSchemaMissingError(syncRpcError.message)) {
    ok = false;
    detalles.push(`RPC fn_sincronizar_propuesta_sire: ${syncRpcError.message}`);
  }

  return {
    id: "migraciones",
    titulo: "Migraciones PostgreSQL (RPCs & Tablas)",
    status: ok ? "ok" : "error",
    ok,
    mensaje: ok ? "Aplicadas" : "Tablas Faltantes",
    detalle: ok
      ? "sire_periodos, registros_sire_cabecera y RPCs del Módulo 2 responden."
      : detalles.join(" · ") ||
        "Falta aplicar migración Módulo 2 (SQL): 20260721180000_modulo2_sire_core.sql",
  };
}

async function probeEdgeFunction(
  functionName: "sire-sync" | "consultar-ruc",
  titulo: string,
): Promise<SunatHealthCheckItem & { tokenHint: boolean }> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: { ping: true },
  });

  const payload = extractInvokePayload(data, error);
  const errorMessage = error instanceof Error ? error.message : null;

  if (error && isNetworkOrNotFoundError(errorMessage ?? "") && !payload) {
    return {
      id: functionName,
      titulo,
      status: "error",
      ok: false,
      mensaje: "No responde / Err 404",
      detalle: errorMessage,
      tokenHint: false,
    };
  }

  const deployed = !!payload || !!error;
  const tokenHint = tokenMissingInPayload(payload);

  return {
    id: functionName,
    titulo,
    status: deployed ? "ok" : "error",
    ok: deployed,
    mensaje: deployed ? "Desplegada" : "No responde / Err 404",
    detalle: payload
      ? `Ping OK — ${String(payload.edge_function ?? functionName)}`
      : errorMessage,
    tokenHint,
  };
}

function probeFeatureFlag(): SunatHealthCheckItem {
  const enabled = useNewSireStructure();
  const raw = String(import.meta.env.VITE_USE_NEW_SIRE_STRUCTURE ?? "false");

  return {
    id: "feature-flag",
    titulo: "Frontend Feature Flag (VITE_USE_NEW_SIRE_STRUCTURE)",
    status: enabled ? "ok" : "warning",
    ok: enabled,
    mensaje: enabled ? "VITE_USE_NEW_SIRE_STRUCTURE=true" : "Estructura Legacy Activa",
    detalle: enabled
      ? "El cliente lee registros_sire_cabecera + registros_sire_montos."
      : `Valor actual: "${raw}". Configure VITE_USE_NEW_SIRE_STRUCTURE=true en .env`,
  };
}

function buildComandosSolucion(checks: SunatHealthCheckItem[]): string[] {
  const comandos = new Set<string>();

  const migraciones = checks.find((c) => c.id === "migraciones");
  if (migraciones && !migraciones.ok) {
    comandos.add("supabase db push");
    comandos.add(
      "# o aplique en SQL Editor: supabase/migrations/20260721180000_modulo2_sire_core.sql",
    );
  }

  const edgeFail = checks.some(
    (c) => (c.id === "sire-sync" || c.id === "consultar-ruc") && !c.ok,
  );
  if (edgeFail) {
    comandos.add("supabase functions deploy sire-sync");
    comandos.add("supabase functions deploy consultar-ruc");
  }

  const tokenFail = checks.some((c) => c.id === "token-api" && !c.ok);
  if (tokenFail) {
    comandos.add('supabase secrets set SUNAT_CLIENT_ID="tu_client_id"');
    comandos.add('supabase secrets set SUNAT_CLIENT_SECRET="tu_client_secret"');
    comandos.add('supabase secrets set API_SUNAT_TOKEN="tu_bearer_token_decolecta"');
  }

  const ffFail = checks.find((c) => c.id === "feature-flag" && !c.ok);
  if (ffFail) {
    comandos.add("# En .env local / despliegue frontend:");
    comandos.add("VITE_USE_NEW_SIRE_STRUCTURE=true");
  }

  return Array.from(comandos);
}

function resolveGlobalStatus(input: {
  migracionesOk: boolean;
  edgeOk: boolean;
  tokenOk: boolean;
  featureFlagOk: boolean;
}): { status: SunatHealthGlobalStatus; label: string } {
  if (!input.migracionesOk || !input.edgeOk) {
    return { status: "ACCION_REQUERIDA", label: "🔴 ACCIÓN REQUERIDA" };
  }
  if (!input.tokenOk || !input.featureFlagOk) {
    return { status: "MODO_SIMULACION", label: "🟡 MODO SIMULACIÓN" };
  }
  return { status: "SISTEMA_OPERATIVO", label: "🟢 SISTEMA OPERATIVO" };
}

export async function verificarSaludPipelineSunat(
  contribuyenteId?: string,
): Promise<SunatHealthDiagnostic> {
  const [migraciones, sireSync, consultarRuc, featureFlag] = await Promise.all([
    probeMigraciones(contribuyenteId),
    probeEdgeFunction("sire-sync", "Edge Function Supabase (sire-sync)"),
    probeEdgeFunction("consultar-ruc", "Edge Function Supabase (consultar-ruc)"),
    Promise.resolve(probeFeatureFlag()),
  ]);

  const oauthSunatConfigurado = sireSync.ok && !sireSync.tokenHint;
  const decolectaRucConfigurado = consultarRuc.ok && !consultarRuc.tokenHint;

  const tokenCheck: SunatHealthCheckItem = {
    id: "token-api",
    titulo: "Credenciales SUNAT OAuth2 (sire-sync) + Decolecta RUC",
    status: oauthSunatConfigurado ? "ok" : "error",
    ok: oauthSunatConfigurado,
    mensaje: oauthSunatConfigurado ? "OAuth2 SUNAT configurado" : "Faltan secrets OAuth SUNAT",
    detalle: oauthSunatConfigurado
      ? `sire-sync: SUNAT OAuth2 OK. consultar-ruc (Decolecta RUC): ${decolectaRucConfigurado ? "OK" : "API_SUNAT_TOKEN pendiente"}.`
      : "Configure SUNAT_CLIENT_ID y SUNAT_CLIENT_SECRET. La sync SIRE requiere además Clave SOL por contribuyente en BD.",
  };

  const checks = [migraciones, sireSync, consultarRuc, tokenCheck, featureFlag];
  const global = resolveGlobalStatus({
    migracionesOk: migraciones.ok,
    edgeOk: sireSync.ok && consultarRuc.ok,
    tokenOk: oauthSunatConfigurado,
    featureFlagOk: featureFlag.ok,
  });

  return {
    ejecutadoAt: new Date().toISOString(),
    globalStatus: global.status,
    globalLabel: global.label,
    migracionesOk: migraciones.ok,
    edgeFunctionDeployed: sireSync.ok,
    consultarRucDeployed: consultarRuc.ok,
    tokenConfigurado: oauthSunatConfigurado,
    featureFlagNuevoSire: featureFlag.ok,
    checks,
    comandosSolucion: buildComandosSolucion(checks),
  };
}
