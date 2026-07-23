// supabase/functions/contam-ai-copilot/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AiAction = "auto-map-pcge" | "audit-tax-anomalies" | "chat-assistant";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type PcgeCuenta = { codigo: string; denominacion: string; tipo_cuenta: string };

type ReglaPersonalizada = {
  id: string;
  ruc_patron: string | null;
  palabra_clave: string | null;
  cuenta_pcge_codigo: string;
  prioridad: number;
};

type CompraRow = {
  id: string;
  tipo_comprobante: string;
  serie: string | null;
  numero: string;
  fecha_emision: string;
  ruc_proveedor: string | null;
  razon_social_proveedor: string | null;
  base_imponible: number;
  igv: number;
  total: number;
  periodo: string;
};

type AnomaliaDetectada = {
  comprobanteRef: string;
  rucEmisor: string;
  razonSocialEmisor?: string;
  tipoAnomalia: string;
  nivelRiesgo: string;
  explicacionIa: string;
};

const SYSTEM_PROMPT_SUNAT = `Eres CONTAM AI Copilot, asistente fiscal experto en normativa peruana para contadores.
Dominas: Ley del IGV (DS 055-99-EF), Impuesto a la Renta (DL 824), Código Tributario (DL 774),
Reglamento de Comprobantes de Pago, SIRE SUNAT, detracciones, retenciones, prorrata del IGV,
reconstrucción de libros (60 días calendario), plazos de comunicación a SUNAT (15 días hábiles),
UIT vigente, y el Plan Contable General Empresarial (PCGE).
Responde en español peruano, claro y accionable. Cita artículos o normas cuando sea relevante.
Si no estás seguro, indica la fuente normativa a consultar. No inventes montos de UIT: indica verificar el valor oficial del ejercicio.`;

const HEURISTICA_KEYWORDS: Array<{ keywords: string[]; cuenta: string }> = [
  { keywords: ["combustible", "petroperu", "repsol", "primax", "gasolina", "diesel"], cuenta: "6032" },
  { keywords: ["luz del sur", "enel", "electrica", "energia", "kwh"], cuenta: "6361" },
  { keywords: ["sedapal", "agua", "alcantarillado"], cuenta: "6362" },
  { keywords: ["movistar", "claro", "entel", "telefono", "internet"], cuenta: "6363" },
  { keywords: ["alquiler", "arrendamiento"], cuenta: "6371" },
  { keywords: ["planilla", "sueldo", "remuneracion"], cuenta: "6311" },
  { keywords: ["seguro", "rimac", "pacifico"], cuenta: "6541" },
  { keywords: ["mercaderia", "inventario"], cuenta: "6011" },
  { keywords: ["honorario", "consultoria", "servicio profesional"], cuenta: "6511" },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAuthenticatedClient(req: Request): Promise<{ supabase: SupabaseClient; userId: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Authorization header requerido");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Credenciales Supabase no configuradas");

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Sesión no válida");

  return { supabase, userId: user.id };
}

function getServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) throw new Error("Service role key no configurada");
  return createClient(supabaseUrl, serviceKey);
}

async function loadPcgeCatalog(supabase: SupabaseClient): Promise<PcgeCuenta[]> {
  const { data, error } = await supabase
    .from("plan_cuentas_pcge")
    .select("codigo, denominacion, tipo_cuenta")
    .eq("estado", "ACTIVO")
    .eq("permite_movimiento", true)
    .order("codigo");
  if (error) throw error;
  return (data ?? []) as PcgeCuenta[];
}

async function loadReglasPersonalizadas(
  supabase: SupabaseClient,
  contribuyenteId: string,
): Promise<ReglaPersonalizada[]> {
  const { data, error } = await supabase
    .from("ai_reglas_personalizadas")
    .select("id, ruc_patron, palabra_clave, cuenta_pcge_codigo, prioridad")
    .eq("contribuyente_id", contribuyenteId)
    .order("prioridad", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReglaPersonalizada[];
}

function findCuenta(catalog: PcgeCuenta[], codigo: string): PcgeCuenta | undefined {
  return catalog.find((c) => c.codigo === codigo);
}

function matchHeuristica(ruc: string, glosa: string, razonSocial: string, catalog: PcgeCuenta[]) {
  const texto = `${ruc} ${glosa} ${razonSocial}`.toLowerCase();
  for (const h of HEURISTICA_KEYWORDS) {
    if (h.keywords.some((k) => texto.includes(k))) {
      const cuenta = findCuenta(catalog, h.cuenta);
      if (cuenta) {
        return {
          cuentaCodigo: cuenta.codigo,
          cuentaDenominacion: cuenta.denominacion,
          confianzaScore: 0.72,
          justificacion: `Coincidencia heurística por palabra clave en glosa/RUC (${h.keywords.find((k) => texto.includes(k))}).`,
          fuente: "HEURISTICA",
        };
      }
    }
  }
  return null;
}

function matchReglaPersonalizada(
  reglas: ReglaPersonalizada[],
  ruc: string,
  glosa: string,
  catalog: PcgeCuenta[],
) {
  const glosaLower = glosa.toLowerCase();
  for (const regla of reglas) {
    const matchRuc = regla.ruc_patron && regla.ruc_patron === ruc;
    const matchKw = regla.palabra_clave && glosaLower.includes(regla.palabra_clave.toLowerCase());
    if (matchRuc || matchKw) {
      const cuenta = findCuenta(catalog, regla.cuenta_pcge_codigo);
      if (cuenta) {
        return {
          cuentaCodigo: cuenta.codigo,
          cuentaDenominacion: cuenta.denominacion,
          confianzaScore: matchRuc ? 0.95 : 0.88,
          justificacion: matchRuc
            ? `Regla personalizada por RUC ${ruc} → cuenta ${cuenta.codigo}.`
            : `Regla personalizada por palabra clave "${regla.palabra_clave}" → cuenta ${cuenta.codigo}.`,
          fuente: "REGLA_PERSONALIZADA",
        };
      }
    }
  }
  return null;
}

async function callLlm(params: {
  system: string;
  user: string;
  messages?: ChatMessage[];
  jsonMode?: boolean;
}): Promise<string> {
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

  if (openAiKey) {
    const msgs: ChatMessage[] = [{ role: "system", content: params.system }];
    if (params.messages?.length) {
      msgs.push(...params.messages.filter((m) => m.role !== "system"));
    }
    msgs.push({ role: "user", content: params.user });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: msgs,
        temperature: 0.2,
        ...(params.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI error: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  if (anthropicKey) {
    const anthropicModel = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-3-5-haiku-20241022";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: anthropicModel,
        max_tokens: 4096,
        system: params.system,
        messages: [
          ...(params.messages?.filter((m) => m.role !== "system").map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })) ?? []),
          { role: "user", content: params.user },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic error: ${errText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }

  throw new Error("No hay OPENAI_API_KEY ni ANTHROPIC_API_KEY configurada");
}

async function handleAutoMapPcge(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
) {
  const contribuyenteId = String(body.contribuyenteId ?? "");
  const ruc = String(body.ruc ?? "").trim();
  const glosa = String(body.glosa ?? "").trim();
  const razonSocial = String(body.razonSocial ?? "").trim();

  if (!contribuyenteId || !glosa) {
    return jsonResponse({ error: "contribuyenteId y glosa son requeridos" }, 400);
  }

  const catalog = await loadPcgeCatalog(supabase);
  const reglas = await loadReglasPersonalizadas(supabase, contribuyenteId);

  let sugerencia = matchReglaPersonalizada(reglas, ruc, glosa, catalog);
  if (!sugerencia) sugerencia = matchHeuristica(ruc, glosa, razonSocial, catalog);

  if (!sugerencia) {
    try {
      const pcgeResumen = catalog
        .filter((c) => c.tipo_cuenta === "GASTOS" || c.codigo.startsWith("6"))
        .slice(0, 80)
        .map((c) => `${c.codigo}: ${c.denominacion}`)
        .join("\n");

      const llmRaw = await callLlm({
        system: `Eres contador peruano experto en PCGE. Responde SOLO JSON válido con: cuentaCodigo (4-5 dígitos), confianzaScore (0-1), justificacion (string corto).`,
        user: `Proveedor RUC: ${ruc || "N/A"}\nRazón social: ${razonSocial || "N/A"}\nGlosa compra: ${glosa}\n\nCatálogo PCGE gastos:\n${pcgeResumen}\n\nSugiere la cuenta PCGE más apropiada.`,
        jsonMode: true,
      });

      const parsed = JSON.parse(llmRaw);
      const codigo = String(parsed.cuentaCodigo ?? parsed.cuenta ?? "6511");
      const cuenta = findCuenta(catalog, codigo) ?? findCuenta(catalog, "6511")!;
      sugerencia = {
        cuentaCodigo: cuenta.codigo,
        cuentaDenominacion: cuenta.denominacion,
        confianzaScore: Math.min(1, Math.max(0, Number(parsed.confianzaScore ?? 0.65))),
        justificacion: String(parsed.justificacion ?? "Sugerencia generada por modelo de lenguaje."),
        fuente: "LLM",
      };
    } catch {
      const fallback = findCuenta(catalog, "6511") ?? catalog[0];
      sugerencia = {
        cuentaCodigo: fallback.codigo,
        cuentaDenominacion: fallback.denominacion,
        confianzaScore: 0.45,
        justificacion: "Cuenta genérica de gastos de administración (6511) — sin coincidencia clara.",
        fuente: "HEURISTICA",
      };
    }
  }

  const { data: logRow, error: logError } = await supabase
    .from("ai_clasificacion_logs")
    .insert({
      contribuyente_id: contribuyenteId,
      ruc_contraparte: ruc || null,
      glosa,
      cuenta_sugerida_codigo: sugerencia.cuentaCodigo,
      confianza_score: sugerencia.confianzaScore,
    })
    .select("id")
    .single();

  if (logError) throw logError;

  return jsonResponse({
    ok: true,
    sugerencia: {
      ...sugerencia,
      logId: logRow?.id ?? null,
    },
  });
}

function detectIgvMismatch(compras: CompraRow[]): AnomaliaDetectada[] {
  const result: AnomaliaDetectada[] = [];
  for (const c of compras) {
    const expectedIgv = Math.round(c.base_imponible * 0.18 * 100) / 100;
    const diff = Math.abs(c.igv - expectedIgv);
    if (c.base_imponible > 0 && diff > 0.05 && diff / c.base_imponible > 0.005) {
      result.push({
        comprobanteRef: `${c.tipo_comprobante}-${c.serie ?? ""}-${c.numero}`,
        rucEmisor: c.ruc_proveedor ?? "",
        razonSocialEmisor: c.razon_social_proveedor ?? undefined,
        tipoAnomalia: "DESCUADRE_IGV_MATEMATICO",
        nivelRiesgo: diff > 10 ? "ALTO" : "MEDIO",
        explicacionIa: `IGV registrado S/ ${c.igv.toFixed(2)} difiere del 18% esperado S/ ${expectedIgv.toFixed(2)} sobre base S/ ${c.base_imponible.toFixed(2)}.`,
      });
    }
  }
  return result;
}

function detectMontoAnormal(compras: CompraRow[]): AnomaliaDetectada[] {
  if (compras.length < 3) return [];
  const promedio = compras.reduce((s, c) => s + Number(c.total), 0) / compras.length;
  const stdDev = Math.sqrt(
    compras.reduce((s, c) => s + Math.pow(Number(c.total) - promedio, 2), 0) / compras.length,
  );
  const umbral = promedio + stdDev * 2.5;

  return compras
    .filter((c) => Number(c.total) > umbral && Number(c.total) > 500)
    .map((c) => ({
      comprobanteRef: `${c.tipo_comprobante}-${c.serie ?? ""}-${c.numero}`,
      rucEmisor: c.ruc_proveedor ?? "",
      razonSocialEmisor: c.razon_social_proveedor ?? undefined,
      tipoAnomalia: "MONTO_ANORMAL_PROMEDIO",
      nivelRiesgo: Number(c.total) > promedio * 5 ? "ALTO" : "MEDIO",
      explicacionIa: `Monto S/ ${Number(c.total).toFixed(2)} supera 2.5 desviaciones del promedio del periodo (S/ ${promedio.toFixed(2)}). Verificar deducibilidad y sustento.`,
    }));
}

async function handleAuditTaxAnomalies(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
) {
  const contribuyenteId = String(body.contribuyenteId ?? "");
  const periodo = String(body.periodo ?? "").trim();

  if (!contribuyenteId || !periodo) {
    return jsonResponse({ error: "contribuyenteId y periodo son requeridos" }, 400);
  }

  const { data: contrib, error: contribErr } = await supabase
    .from("contribuyentes")
    .select("id, ruc, razon_social, actividad_economica_principal")
    .eq("id", contribuyenteId)
    .single();
  if (contribErr) throw contribErr;

  const { data: ficha } = await supabase
    .from("fichas_ruc")
    .select("actividad_economica_principal, actividad_economica")
    .eq("ruc", contrib.ruc)
    .maybeSingle();

  const actividad =
    ficha?.actividad_economica_principal ??
    ficha?.actividad_economica ??
    contrib.actividad_economica_principal ??
    "No registrada";

  const { data: compras, error: comprasErr } = await supabase
    .from("compras_rce")
    .select(
      "id, tipo_comprobante, serie, numero, fecha_emision, ruc_proveedor, razon_social_proveedor, base_imponible, igv, total, periodo",
    )
    .eq("contribuyente_id", contribuyenteId)
    .eq("periodo", periodo)
    .order("fecha_emision", { ascending: false })
    .limit(200);
  if (comprasErr) throw comprasErr;

  const comprasList = (compras ?? []) as CompraRow[];
  let anomalias: AnomaliaDetectada[] = [
    ...detectIgvMismatch(comprasList),
    ...detectMontoAnormal(comprasList),
  ];

  const { data: periodoRow } = await supabase
    .from("sire_periodos")
    .select("id")
    .eq("contribuyente_id", contribuyenteId)
    .eq("periodo", periodo)
    .maybeSingle();

  if (comprasList.length > 0) {
    try {
      const muestra = comprasList.slice(0, 40).map((c) => ({
        ref: `${c.tipo_comprobante}-${c.serie ?? ""}-${c.numero}`,
        ruc: c.ruc_proveedor,
        proveedor: c.razon_social_proveedor,
        total: c.total,
        base: c.base_imponible,
        igv: c.igv,
        fecha: c.fecha_emision,
      }));

      const llmRaw = await callLlm({
        system: `Eres auditor fiscal SUNAT. Analiza compras vs actividad económica del contribuyente.
Responde SOLO JSON: { "anomalias": [ { "comprobanteRef", "rucEmisor", "razonSocialEmisor", "tipoAnomalia" (INCONGRUENCIA_ACTIVIDAD_RUC|RIESGO_REPARO_RENTA), "nivelRiesgo" (BAJO|MEDIO|ALTO|CRITICO), "explicacionIa" } ] }
Detecta compras incongruentes con la actividad (ej: empresa transportes comprando electrodomésticos).`,
        user: `Contribuyente: ${contrib.razon_social} (RUC ${contrib.ruc})\nActividad económica RUC: ${actividad}\nPeriodo: ${periodo}\nCompras:\n${JSON.stringify(muestra, null, 2)}`,
        jsonMode: true,
      });

      const parsed = JSON.parse(llmRaw);
      if (Array.isArray(parsed.anomalias)) {
        for (const a of parsed.anomalias) {
          anomalias.push({
            comprobanteRef: String(a.comprobanteRef ?? ""),
            rucEmisor: String(a.rucEmisor ?? ""),
            razonSocialEmisor: a.razonSocialEmisor ? String(a.razonSocialEmisor) : undefined,
            tipoAnomalia: String(a.tipoAnomalia ?? "RIESGO_REPARO_RENTA"),
            nivelRiesgo: String(a.nivelRiesgo ?? "MEDIO"),
            explicacionIa: String(a.explicacionIa ?? "Anomalía detectada por IA."),
          });
        }
      }
    } catch (llmErr) {
      console.warn("LLM audit fallback:", llmErr);
    }
  }

  // Deduplicar por comprobanteRef + tipo
  const seen = new Set<string>();
  anomalias = anomalias.filter((a) => {
    const key = `${a.comprobanteRef}|${a.tipoAnomalia}`;
    if (seen.has(key) || !a.comprobanteRef) return false;
    seen.add(key);
    return true;
  });

  const serviceClient = getServiceClient();
  const inserted: AnomaliaDetectada[] = [];

  for (const a of anomalias) {
    const { data: existing } = await serviceClient
      .from("ai_anomalias_detectadas")
      .select("id")
      .eq("contribuyente_id", contribuyenteId)
      .eq("comprobante_ref", a.comprobanteRef)
      .eq("tipo_anomalia", a.tipoAnomalia)
      .eq("resuelto", false)
      .maybeSingle();

    if (existing?.id) {
      inserted.push({ ...a, id: existing.id } as AnomaliaDetectada & { id: string });
      continue;
    }

    const { data: row, error: insErr } = await serviceClient
      .from("ai_anomalias_detectadas")
      .insert({
        contribuyente_id: contribuyenteId,
        periodo_id: periodoRow?.id ?? null,
        comprobante_ref: a.comprobanteRef,
        ruc_emisor: a.rucEmisor,
        razon_social_emisor: a.razonSocialEmisor ?? null,
        tipo_anomalia: a.tipoAnomalia,
        nivel_riesgo: a.nivelRiesgo,
        explicacion_ia: a.explicacionIa,
      })
      .select("id")
      .single();

    if (!insErr && row) {
      inserted.push({ ...a, id: row.id } as AnomaliaDetectada & { id: string });
    }
  }

  const criticas = anomalias.filter((a) => a.nivelRiesgo === "CRITICO").length;
  const altas = anomalias.filter((a) => a.nivelRiesgo === "ALTO").length;

  return jsonResponse({
    ok: true,
    anomalias: inserted.length ? inserted : anomalias,
    resumen: {
      total: anomalias.length,
      criticas,
      altas,
    },
  });
}

async function handleChatAssistant(body: Record<string, unknown>) {
  const messages = (body.messages ?? []) as ChatMessage[];
  const contribuyenteId = body.contribuyenteId ? String(body.contribuyenteId) : undefined;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return jsonResponse({ error: "Se requiere al menos un mensaje de usuario" }, 400);
  }

  let contextExtra = "";
  if (contribuyenteId) {
    contextExtra = `\nContexto: el usuario trabaja con contribuyente_id=${contribuyenteId} en CONTAM ERP.`;
  }

  const reply = await callLlm({
    system: SYSTEM_PROMPT_SUNAT + contextExtra,
    user: lastUser.content,
    messages: messages.slice(0, -1),
  });

  return jsonResponse({
    ok: true,
    reply,
    model: Deno.env.get("OPENAI_MODEL") ?? Deno.env.get("ANTHROPIC_MODEL") ?? "llm",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405);
  }

  try {
    const { supabase } = await getAuthenticatedClient(req);
    const body = await req.json();
    const action = String(body.action ?? "") as AiAction;

    switch (action) {
      case "auto-map-pcge":
        return await handleAutoMapPcge(supabase, body);
      case "audit-tax-anomalies":
        return await handleAuditTaxAnomalies(supabase, body);
      case "chat-assistant":
        return await handleChatAssistant(body);
      default:
        return jsonResponse({ error: `Acción no soportada: ${action}` }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("contam-ai-copilot error:", message);
    return jsonResponse({ error: message }, message.includes("Sesión") ? 401 : 500);
  }
});
