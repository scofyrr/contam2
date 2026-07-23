import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  AnomaliaTributaria,
  AuditAnomaliesResponse,
  AutoMapPcgeResponse,
  ChatAssistantResponse,
  ChatMessage,
  FeedbackPayload,
  NivelRiesgoAnomalia,
  ResumenAnomaliasPeriodo,
  SugerenciaPcge,
  TipoAnomalia,
} from "@/modules/ai-copilot/types/aiCopilot";
import { HEURISTICA_PCGE_KEYWORDS as KEYWORDS } from "@/modules/ai-copilot/types/aiCopilot";

type AiDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
  functions: {
    invoke: (
      name: string,
      options?: { body?: Record<string, unknown> },
    ) => ReturnType<typeof supabase.functions.invoke>;
  };
};

const db = supabase as unknown as AiDb;

type AnomaliaRow = {
  id: string;
  contribuyente_id: string;
  periodo_id: string | null;
  comprobante_ref: string;
  ruc_emisor: string;
  razon_social_emisor: string | null;
  tipo_anomalia: TipoAnomalia;
  nivel_riesgo: NivelRiesgoAnomalia;
  explicacion_ia: string;
  resuelto: boolean;
  created_at: string;
};

function mapAnomalia(row: AnomaliaRow): AnomaliaTributaria {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    periodoId: row.periodo_id,
    comprobanteRef: row.comprobante_ref,
    rucEmisor: row.ruc_emisor,
    razonSocialEmisor: row.razon_social_emisor,
    tipoAnomalia: row.tipo_anomalia,
    nivelRiesgo: row.nivel_riesgo,
    explicacionIa: row.explicacion_ia,
    resuelto: row.resuelto,
    createdAt: row.created_at,
  };
}

export async function fetchContribuyenteIdByRucAi(ruc: string): Promise<string | null> {
  const { data, error } = await db
    .from("contribuyentes")
    .select("id")
    .eq("ruc", ruc)
    .maybeSingle();
  throwIfSupabaseError(error);
  return data?.id ?? null;
}

export async function invokeCopilot<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await db.functions.invoke("contam-ai-copilot", { body });
  if (error) throw new Error(error.message ?? "Error al invocar contam-ai-copilot");
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }
  return data as T;
}

export async function sugerirCuentaPcge(
  contribuyenteId: string,
  ruc: string,
  glosa: string,
  razonSocial?: string,
): Promise<SugerenciaPcge> {
  const data = await invokeCopilot<AutoMapPcgeResponse>({
    action: "auto-map-pcge",
    contribuyenteId,
    ruc,
    glosa,
    razonSocial,
  });

  const s = data.sugerencia;
  return {
    logId: s.logId,
    cuentaCodigo: s.cuentaCodigo,
    cuentaDenominacion: s.cuentaDenominacion,
    confianzaScore: s.confianzaScore,
    justificacion: s.justificacion,
    fuente: s.fuente as SugerenciaPcge["fuente"],
  };
}

export async function auditarComprasAnomalias(
  contribuyenteId: string,
  periodo: string,
): Promise<AuditAnomaliesResponse> {
  return invokeCopilot<AuditAnomaliesResponse>({
    action: "audit-tax-anomalies",
    contribuyenteId,
    periodo,
  });
}

export async function enviarMensajeChatCopilot(
  messages: ChatMessage[],
  contribuyenteId: string,
): Promise<ChatAssistantResponse> {
  return invokeCopilot<ChatAssistantResponse>({
    action: "chat-assistant",
    contribuyenteId,
    messages: messages.filter((m) => m.role !== "system"),
  });
}

export async function registrarFeedbackAi(payload: FeedbackPayload): Promise<void> {
  const { data, error } = await db.rpc("fn_registrar_feedback_ai", {
    p_log_id: payload.logId,
    p_fue_aceptada: payload.fueAceptada,
    p_cuenta_final: payload.cuentaFinal ?? null,
  });
  throwIfSupabaseError(error);
  const result = data as { ok?: boolean } | null;
  if (result && result.ok === false) {
    throw new Error("No se pudo registrar el feedback");
  }
}

export async function fetchAnomaliasTributarias(
  contribuyenteId: string,
  periodo?: string,
): Promise<AnomaliaTributaria[]> {
  let query = db
    .from("ai_anomalias_detectadas")
    .select("*")
    .eq("contribuyente_id", contribuyenteId)
    .eq("resuelto", false)
    .order("created_at", { ascending: false });

  if (periodo) {
    const { data: periodoRow } = await db
      .from("sire_periodos")
      .select("id")
      .eq("contribuyente_id", contribuyenteId)
      .eq("periodo", periodo)
      .maybeSingle();

    if (periodoRow?.id) {
      query = query.eq("periodo_id", periodoRow.id);
    }
  }

  const { data, error } = await query.limit(100);
  throwIfSupabaseError(error);
  return ((data ?? []) as AnomaliaRow[]).map(mapAnomalia);
}

export async function fetchResumenAnomaliasPeriodo(
  contribuyenteId: string,
  periodo: string,
): Promise<ResumenAnomaliasPeriodo> {
  const { data, error } = await db.rpc("fn_obtener_resumen_anomalias_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodo,
  });
  throwIfSupabaseError(error);

  const row = data as {
    contribuyente_id: string;
    periodo: string;
    periodo_id: string | null;
    total: number;
    pendientes: number;
    por_nivel_riesgo: Partial<Record<NivelRiesgoAnomalia, number>>;
  };

  return {
    contribuyenteId: row.contribuyente_id,
    periodo: row.periodo,
    periodoId: row.periodo_id,
    total: row.total ?? 0,
    pendientes: row.pendientes ?? 0,
    porNivelRiesgo: row.por_nivel_riesgo ?? {},
  };
}

export async function marcarAnomaliaResuelta(anomaliaId: string): Promise<void> {
  const { error } = await db
    .from("ai_anomalias_detectadas")
    .update({ resuelto: true, updated_at: new Date().toISOString() })
    .eq("id", anomaliaId);
  throwIfSupabaseError(error);
}

/** Heurística local sin LLM (para InlinePcgeSuggestor debounce rápido) */
export function sugerirCuentaPcgeLocal(
  ruc: string,
  glosa: string,
  razonSocial?: string,
): Omit<SugerenciaPcge, "logId"> | null {
  const texto = `${ruc} ${glosa} ${razonSocial ?? ""}`.toLowerCase();

  for (const h of KEYWORDS) {
    const match = h.keywords.find((k) => texto.includes(k));
    if (match) {
      return {
        cuentaCodigo: h.cuenta,
        cuentaDenominacion: h.denominacion,
        confianzaScore: 0.68,
        justificacion: `Coincidencia local: "${match}" → ${h.cuenta}`,
        fuente: "HEURISTICA",
      };
    }
  }
  return null;
}
