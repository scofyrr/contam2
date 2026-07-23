export type AiCopilotAction = "auto-map-pcge" | "audit-tax-anomalies" | "chat-assistant";

export type NivelRiesgoAnomalia = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export type TipoAnomalia =
  | "INCONGRUENCIA_ACTIVIDAD_RUC"
  | "DESCUADRE_IGV_MATEMATICO"
  | "RIESGO_REPARO_RENTA"
  | "MONTO_ANORMAL_PROMEDIO";

export interface SugerenciaPcge {
  logId: string | null;
  cuentaCodigo: string;
  cuentaDenominacion: string;
  confianzaScore: number;
  justificacion: string;
  fuente: "REGLA_PERSONALIZADA" | "HEURISTICA" | "LLM";
}

export interface AnomaliaTributaria {
  id: string;
  contribuyenteId: string;
  periodoId: string | null;
  comprobanteRef: string;
  rucEmisor: string;
  razonSocialEmisor: string | null;
  tipoAnomalia: TipoAnomalia;
  nivelRiesgo: NivelRiesgoAnomalia;
  explicacionIa: string;
  resuelto: boolean;
  createdAt: string;
}

export interface ResumenAnomaliasPeriodo {
  contribuyenteId: string;
  periodo: string;
  periodoId: string | null;
  total: number;
  pendientes: number;
  porNivelRiesgo: Partial<Record<NivelRiesgoAnomalia, number>>;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PromptActionPayload {
  action: AiCopilotAction;
  contribuyenteId: string;
  ruc?: string;
  glosa?: string;
  razonSocial?: string;
  periodo?: string;
  messages?: ChatMessage[];
}

export interface FeedbackPayload {
  logId: string;
  fueAceptada: boolean;
  cuentaFinal?: string;
}

export interface AutoMapPcgeResponse {
  ok: boolean;
  sugerencia: {
    cuentaCodigo: string;
    cuentaDenominacion: string;
    confianzaScore: number;
    justificacion: string;
    fuente: string;
    logId: string | null;
  };
}

export interface AuditAnomaliesResponse {
  ok: boolean;
  anomalias: Array<{
    comprobanteRef: string;
    rucEmisor: string;
    razonSocialEmisor?: string;
    tipoAnomalia: TipoAnomalia;
    nivelRiesgo: NivelRiesgoAnomalia;
    explicacionIa: string;
    id?: string;
  }>;
  resumen: {
    total: number;
    criticas: number;
    altas: number;
  };
}

export interface ChatAssistantResponse {
  ok: boolean;
  reply: string;
  model?: string;
}

export const TIPO_ANOMALIA_LABELS: Record<TipoAnomalia, string> = {
  INCONGRUENCIA_ACTIVIDAD_RUC: "Incongruencia con actividad RUC",
  DESCUADRE_IGV_MATEMATICO: "Descuadre IGV matemático",
  RIESGO_REPARO_RENTA: "Riesgo de reparo Renta",
  MONTO_ANORMAL_PROMEDIO: "Monto anormal vs. promedio",
};

export const NIVEL_RIESGO_COLORS: Record<
  NivelRiesgoAnomalia,
  { bg: string; text: string; border: string; emoji: string }
> = {
  CRITICO: {
    bg: "bg-red-950/60",
    text: "text-red-300",
    border: "border-red-500/50",
    emoji: "🔴",
  },
  ALTO: {
    bg: "bg-orange-950/50",
    text: "text-orange-300",
    border: "border-orange-500/40",
    emoji: "🟠",
  },
  MEDIO: {
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-500/40",
    emoji: "🟡",
  },
  BAJO: {
    bg: "bg-sky-950/40",
    text: "text-sky-300",
    border: "border-sky-500/40",
    emoji: "🔵",
  },
};

export const QUICK_CHAT_PROMPTS = [
  "¿Cuándo vence el SIRE del periodo actual?",
  "¿Cómo aplico la prorrata del IGV?",
  "¿Cuál es el plazo para reconstruir libros contables?",
  "¿Qué operaciones están sujetas a detracción?",
  "¿Cuándo pierdo el crédito fiscal del IGV?",
] as const;

/** Palabras clave → cuenta PCGE para heurística local (fallback sin LLM) */
export const HEURISTICA_PCGE_KEYWORDS: Array<{
  keywords: string[];
  cuenta: string;
  denominacion: string;
}> = [
  { keywords: ["combustible", "petroperu", "repsol", "primax", "gasolina", "diesel"], cuenta: "6032", denominacion: "Combustibles y lubricantes" },
  { keywords: ["luz del sur", "enel", "electrica", "energia", "kwh"], cuenta: "6361", denominacion: "Energía eléctrica" },
  { keywords: ["sedapal", "agua", "alcantarillado"], cuenta: "6362", denominacion: "Agua" },
  { keywords: ["movistar", "claro", "entel", "telefono", "internet", "cable"], cuenta: "6363", denominacion: "Teléfono" },
  { keywords: ["alquiler", "arrendamiento", "inmobiliaria"], cuenta: "6371", denominacion: "Alquileres" },
  { keywords: ["planilla", "sueldo", "remuneracion", "gratificacion"], cuenta: "6311", denominacion: "Gastos de personal - remuneraciones" },
  { keywords: ["seguro", "rimac", "pacifico", "mapfre"], cuenta: "6541", denominacion: "Seguros" },
  { keywords: ["mercaderia", "compra mercader", "inventario"], cuenta: "6011", denominacion: "Mercaderías" },
  { keywords: ["honorario", "servicio profesional", "consultoria"], cuenta: "6511", denominacion: "Gastos de administración" },
];
