import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { u as useQuery } from "./useQuery-GwWd8T8C.js";
import { B as Badge } from "./badge-R7vlE0zl.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { I as Input } from "./input-Dd5Cl0P5.js";
import { L as Label } from "./label-RwV7o-pk.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BAtobcg4.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-C5yJfdlB.js";
import { T as Textarea } from "./textarea-DrawpDgB.js";
import { m as useContribuyentes } from "./use-contribuyentes-CgGZLenc.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { ab as supabase, ac as throwIfSupabaseError, aq as useQueryClient, ai as toast } from "./router-B2oVQHub.js";
import { u as useMutation } from "./useMutation-DD5rBZOv.js";
import { L as LoaderCircle } from "./loader-circle-D9KbOhZE.js";
import { S as Sparkles } from "./sparkles-H49z-E_d.js";
import { X } from "./x-BCtce-HD.js";
import { C as Check } from "./Combination-zo30HTiN.js";
import { a as createLucideIcon } from "./index-CE2u8TBR.js";
import { T as TriangleAlert } from "./triangle-alert-C9v1hrNU.js";
import { C as CircleCheck } from "./circle-check-s6qbrqFU.js";
import { M as MessageCircle, a as Minimize2 } from "./minimize-2-jSwUDp1Z.js";
import { B as Bot } from "./bot-5HDJ2yX3.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CRO2D6uM.js";
import "./chevron-up-CdlYVDxF.js";
import "./index-D5JWF47-.js";
import "./index-CLwIwY0T.js";
import "./contribuyentes-service-DhFtq9J9.js";
import "./http-client-BVL7nK2k.js";
const __iconNode$1 = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ["path", { d: "m16 16-1.9-1.9", key: "1dq9hf" }]
];
const ScanSearch = createLucideIcon("scan-search", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode);
const TIPO_ANOMALIA_LABELS = {
  INCONGRUENCIA_ACTIVIDAD_RUC: "Incongruencia con actividad RUC",
  DESCUADRE_IGV_MATEMATICO: "Descuadre IGV matemático",
  RIESGO_REPARO_RENTA: "Riesgo de reparo Renta",
  MONTO_ANORMAL_PROMEDIO: "Monto anormal vs. promedio"
};
const NIVEL_RIESGO_COLORS = {
  CRITICO: {
    bg: "bg-red-950/60",
    text: "text-red-300",
    border: "border-red-500/50",
    emoji: "🔴"
  },
  ALTO: {
    bg: "bg-orange-950/50",
    text: "text-orange-300",
    border: "border-orange-500/40",
    emoji: "🟠"
  },
  MEDIO: {
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-500/40",
    emoji: "🟡"
  },
  BAJO: {
    bg: "bg-sky-950/40",
    text: "text-sky-300",
    border: "border-sky-500/40",
    emoji: "🔵"
  }
};
const QUICK_CHAT_PROMPTS = [
  "¿Cuándo vence el SIRE del periodo actual?",
  "¿Cómo aplico la prorrata del IGV?",
  "¿Cuál es el plazo para reconstruir libros contables?",
  "¿Qué operaciones están sujetas a detracción?",
  "¿Cuándo pierdo el crédito fiscal del IGV?"
];
const HEURISTICA_PCGE_KEYWORDS = [
  { keywords: ["combustible", "petroperu", "repsol", "primax", "gasolina", "diesel"], cuenta: "6032", denominacion: "Combustibles y lubricantes" },
  { keywords: ["luz del sur", "enel", "electrica", "energia", "kwh"], cuenta: "6361", denominacion: "Energía eléctrica" },
  { keywords: ["sedapal", "agua", "alcantarillado"], cuenta: "6362", denominacion: "Agua" },
  { keywords: ["movistar", "claro", "entel", "telefono", "internet", "cable"], cuenta: "6363", denominacion: "Teléfono" },
  { keywords: ["alquiler", "arrendamiento", "inmobiliaria"], cuenta: "6371", denominacion: "Alquileres" },
  { keywords: ["planilla", "sueldo", "remuneracion", "gratificacion"], cuenta: "6311", denominacion: "Gastos de personal - remuneraciones" },
  { keywords: ["seguro", "rimac", "pacifico", "mapfre"], cuenta: "6541", denominacion: "Seguros" },
  { keywords: ["mercaderia", "compra mercader", "inventario"], cuenta: "6011", denominacion: "Mercaderías" },
  { keywords: ["honorario", "servicio profesional", "consultoria"], cuenta: "6511", denominacion: "Gastos de administración" }
];
const db = supabase;
function mapAnomalia(row) {
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
    createdAt: row.created_at
  };
}
async function fetchContribuyenteIdByRucAi(ruc) {
  const { data, error } = await db.from("contribuyentes").select("id").eq("ruc", ruc).maybeSingle();
  throwIfSupabaseError(error);
  return data?.id ?? null;
}
async function invokeCopilot(body) {
  const { data, error } = await db.functions.invoke("contam-ai-copilot", { body });
  if (error) throw new Error(error.message ?? "Error al invocar contam-ai-copilot");
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }
  return data;
}
async function sugerirCuentaPcge(contribuyenteId, ruc, glosa, razonSocial) {
  const data = await invokeCopilot({
    action: "auto-map-pcge",
    contribuyenteId,
    ruc,
    glosa,
    razonSocial
  });
  const s = data.sugerencia;
  return {
    logId: s.logId,
    cuentaCodigo: s.cuentaCodigo,
    cuentaDenominacion: s.cuentaDenominacion,
    confianzaScore: s.confianzaScore,
    justificacion: s.justificacion,
    fuente: s.fuente
  };
}
async function auditarComprasAnomalias(contribuyenteId, periodo) {
  return invokeCopilot({
    action: "audit-tax-anomalies",
    contribuyenteId,
    periodo
  });
}
async function enviarMensajeChatCopilot(messages, contribuyenteId) {
  return invokeCopilot({
    action: "chat-assistant",
    contribuyenteId,
    messages: messages.filter((m) => m.role !== "system")
  });
}
async function registrarFeedbackAi(payload) {
  const { data, error } = await db.rpc("fn_registrar_feedback_ai", {
    p_log_id: payload.logId,
    p_fue_aceptada: payload.fueAceptada,
    p_cuenta_final: payload.cuentaFinal ?? null
  });
  throwIfSupabaseError(error);
  const result = data;
  if (result && result.ok === false) {
    throw new Error("No se pudo registrar el feedback");
  }
}
async function fetchAnomaliasTributarias(contribuyenteId, periodo) {
  let query = db.from("ai_anomalias_detectadas").select("*").eq("contribuyente_id", contribuyenteId).eq("resuelto", false).order("created_at", { ascending: false });
  if (periodo) {
    const { data: periodoRow } = await db.from("sire_periodos").select("id").eq("contribuyente_id", contribuyenteId).eq("periodo", periodo).maybeSingle();
    if (periodoRow?.id) {
      query = query.eq("periodo_id", periodoRow.id);
    }
  }
  const { data, error } = await query.limit(100);
  throwIfSupabaseError(error);
  return (data ?? []).map(mapAnomalia);
}
async function fetchResumenAnomaliasPeriodo(contribuyenteId, periodo) {
  const { data, error } = await db.rpc("fn_obtener_resumen_anomalias_periodo", {
    p_contribuyente_id: contribuyenteId,
    p_periodo: periodo
  });
  throwIfSupabaseError(error);
  const row = data;
  return {
    contribuyenteId: row.contribuyente_id,
    periodo: row.periodo,
    periodoId: row.periodo_id,
    total: row.total ?? 0,
    pendientes: row.pendientes ?? 0,
    porNivelRiesgo: row.por_nivel_riesgo ?? {}
  };
}
async function marcarAnomaliaResuelta(anomaliaId) {
  const { error } = await db.from("ai_anomalias_detectadas").update({ resuelto: true, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", anomaliaId);
  throwIfSupabaseError(error);
}
function sugerirCuentaPcgeLocal(ruc, glosa, razonSocial) {
  const texto = `${ruc} ${glosa} ${razonSocial ?? ""}`.toLowerCase();
  for (const h of HEURISTICA_PCGE_KEYWORDS) {
    const match = h.keywords.find((k) => texto.includes(k));
    if (match) {
      return {
        cuentaCodigo: h.cuenta,
        cuentaDenominacion: h.denominacion,
        confianzaScore: 0.68,
        justificacion: `Coincidencia local: "${match}" → ${h.cuenta}`,
        fuente: "HEURISTICA"
      };
    }
  }
  return null;
}
const aiCopilotQueryKeys = {
  all: ["ai-copilot"],
  anomalias: (contribuyenteId, periodo) => ["ai-copilot", "anomalias", contribuyenteId, periodo],
  resumen: (contribuyenteId, periodo) => ["ai-copilot", "resumen", contribuyenteId, periodo],
  sugerencia: (contribuyenteId, ruc, glosa) => ["ai-copilot", "sugerencia", contribuyenteId, ruc, glosa]
};
function useAnomaliasTributarias(contribuyenteId, periodo, enabled = true) {
  return useQuery({
    queryKey: aiCopilotQueryKeys.anomalias(contribuyenteId, periodo),
    queryFn: () => fetchAnomaliasTributarias(contribuyenteId, periodo ?? void 0),
    enabled: enabled && !!contribuyenteId,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useResumenAnomalias(contribuyenteId, periodo, enabled = true) {
  return useQuery({
    queryKey: aiCopilotQueryKeys.resumen(contribuyenteId, periodo),
    queryFn: () => fetchResumenAnomaliasPeriodo(contribuyenteId, periodo),
    enabled: enabled && !!contribuyenteId && !!periodo,
    staleTime: 3e4
  });
}
function useAuditarCompras(contribuyenteId, periodo) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => auditarComprasAnomalias(contribuyenteId, periodo),
    onSuccess: async (result) => {
      toast.success(
        `Auditoría completada: ${result.resumen.total} anomalía(s) detectada(s)`
      );
      await qc.invalidateQueries({ queryKey: aiCopilotQueryKeys.all });
    },
    onError: (error) => {
      toast.error(error.message || "Error en auditoría fiscal IA");
    }
  });
}
function useRegistrarFeedbackAi() {
  return useMutation({
    mutationFn: (payload) => registrarFeedbackAi(payload),
    onError: (error) => {
      toast.error(error.message || "Error al registrar feedback");
    }
  });
}
function useMarcarAnomaliaResuelta(contribuyenteId, periodo) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (anomaliaId) => marcarAnomaliaResuelta(anomaliaId),
    onSuccess: async () => {
      toast.success("Anomalía marcada como resuelta");
      await qc.invalidateQueries({
        queryKey: aiCopilotQueryKeys.anomalias(contribuyenteId, periodo)
      });
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar anomalía");
    }
  });
}
function useContamAiChat(contribuyenteId) {
  return useMutation({
    mutationFn: (messages) => enviarMensajeChatCopilot(messages, contribuyenteId ?? ""),
    onError: (error) => {
      toast.error(error.message || "Error en chat CONTAM AI");
    }
  });
}
const GLASS$1 = "rounded-xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-md shadow-lg shadow-emerald-950/30";
function useClientMounted$1() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function confianzaColor(score) {
  if (score >= 0.85) return "text-emerald-400 border-emerald-500/50";
  if (score >= 0.65) return "text-amber-400 border-amber-500/50";
  return "text-slate-400 border-slate-600/50";
}
function InlinePcgeSuggestor({
  contribuyenteId,
  ruc = "",
  glosa,
  razonSocial,
  disabled,
  className,
  onAccept
}) {
  const mounted = useClientMounted$1();
  const [sugerencia, setSugerencia] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [visible, setVisible] = reactExports.useState(false);
  const [dismissed, setDismissed] = reactExports.useState(false);
  const debounceRef = reactExports.useRef(null);
  const feedbackMutation = useRegistrarFeedbackAi();
  const fetchSugerencia = reactExports.useCallback(async () => {
    if (!contribuyenteId || glosa.trim().length < 3 || disabled) {
      setSugerencia(null);
      setVisible(false);
      return;
    }
    setLoading(true);
    setDismissed(false);
    const local = sugerirCuentaPcgeLocal(ruc, glosa, razonSocial);
    if (local) {
      setSugerencia({ ...local, logId: null });
      setVisible(true);
    }
    try {
      const ai = await sugerirCuentaPcge(contribuyenteId, ruc, glosa, razonSocial);
      setSugerencia(ai);
      setVisible(true);
    } catch {
      if (!local) {
        setSugerencia(null);
        setVisible(false);
      }
    } finally {
      setLoading(false);
    }
  }, [contribuyenteId, ruc, glosa, razonSocial, disabled]);
  reactExports.useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!mounted || glosa.trim().length < 3) {
      setSugerencia(null);
      setVisible(false);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      void fetchSugerencia();
    }, 600);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [mounted, glosa, ruc, fetchSugerencia]);
  const handleAccept = reactExports.useCallback(() => {
    if (!sugerencia) return;
    onAccept(sugerencia.cuentaCodigo, sugerencia.cuentaDenominacion);
    if (sugerencia.logId) {
      feedbackMutation.mutate({
        logId: sugerencia.logId,
        fueAceptada: true
      });
    }
    setVisible(false);
    setDismissed(true);
  }, [sugerencia, onAccept, feedbackMutation]);
  const handleDismiss = reactExports.useCallback(() => {
    if (sugerencia?.logId) {
      feedbackMutation.mutate({
        logId: sugerencia.logId,
        fueAceptada: false
      });
    }
    setVisible(false);
    setDismissed(true);
  }, [sugerencia, feedbackMutation]);
  reactExports.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Tab" && visible && sugerencia && !e.shiftKey) {
        const active = document.activeElement;
        if (active?.closest("[data-pcge-suggestor]")) {
          e.preventDefault();
          handleAccept();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, sugerencia, handleAccept]);
  if (!mounted || dismissed || !visible || !sugerencia) {
    if (mounted && loading && glosa.trim().length >= 3) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-pcge-suggestor": true,
          className: cn(
            "flex items-center gap-2 text-xs text-slate-400 py-1",
            className
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 animate-spin text-emerald-400" }),
            "Analizando glosa con IA…"
          ]
        }
      );
    }
    return null;
  }
  const pct = Math.round(sugerencia.confianzaScore * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-pcge-suggestor": true,
      className: cn(GLASS$1, "p-3 mt-2 animate-in fade-in slide-in-from-top-1", className),
      role: "status",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-emerald-400 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mb-1", children: "Sugerencia PCGE (IA)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono font-semibold text-emerald-300", children: [
                sugerencia.cuentaCodigo,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-sans font-normal text-slate-200", children: [
                  "— ",
                  sugerencia.cuentaDenominacion
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-1 line-clamp-2", children: sugerencia.justificacion })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "size-7 shrink-0 text-slate-500 hover:text-slate-300",
              onClick: handleDismiss,
              "aria-label": "Descartar sugerencia",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-3 gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: "outline",
              className: cn("text-xs", confianzaColor(sugerencia.confianzaScore)),
              children: [
                "Confianza ",
                pct,
                "%"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                size: "sm",
                variant: "outline",
                className: "h-8 border-slate-700 text-slate-300",
                onClick: handleDismiss,
                children: "Ignorar"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                size: "sm",
                className: "h-8 bg-emerald-600 hover:bg-emerald-500 text-white gap-1",
                onClick: handleAccept,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }),
                  "Aceptar",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "ml-1 text-[10px] opacity-70 px-1 rounded bg-emerald-800", children: "Tab" })
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
function useClientMounted() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function renderSimpleMarkdown(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-emerald-300 text-sm">$1</code>').replace(/^### (.+)$/gm, '<h4 class="font-semibold text-emerald-300 mt-2 mb-1">$1</h4>').replace(/^## (.+)$/gm, '<h3 class="font-semibold text-emerald-200 mt-3 mb-1">$1</h3>').replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>').replace(/\n\n/g, "</p><p class='mt-2'>").replace(/\n/g, "<br/>");
}
function AnomaliaCard({
  anomalia,
  mounted,
  onResolver,
  resolving
}) {
  const colors = NIVEL_RIESGO_COLORS[anomalia.nivelRiesgo];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        GLASS,
        "p-4 border-l-4",
        colors.border,
        colors.bg
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg shrink-0", suppressHydrationWarning: true, children: mounted ? colors.emoji : "⚠" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("text-xs", colors.text, colors.border), children: anomalia.nivelRiesgo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 font-mono", children: anomalia.comprobanteRef })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-slate-100", children: TIPO_ANOMALIA_LABELS[anomalia.tipoAnomalia] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400 mt-1", children: anomalia.razonSocialEmisor ?? anomalia.rucEmisor }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-300 mt-2 leading-relaxed", children: anomalia.explicacionIa })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "shrink-0 border-slate-700 text-slate-300 h-8",
            disabled: resolving,
            onClick: () => onResolver(anomalia.id),
            children: [
              resolving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", children: "Resolver" })
            ]
          }
        )
      ] })
    }
  );
}
function FloatingChatWidget({
  contribuyenteId,
  mounted
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [input, setInput] = reactExports.useState("");
  const [messages, setMessages] = reactExports.useState([
    {
      role: "assistant",
      content: "Hola, soy **CONTAM AI Copilot**. Consulta normativa SUNAT, plazos SIRE, detracciones, prorrata IGV y más."
    }
  ]);
  const bottomRef = reactExports.useRef(null);
  const chatMutation = useContamAiChat(contribuyenteId);
  reactExports.useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, chatMutation.isPending]);
  const sendMessage = reactExports.useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || chatMutation.isPending) return;
      const nextMessages = [...messages, { role: "user", content: trimmed }];
      setMessages(nextMessages);
      setInput("");
      try {
        const res = await chatMutation.mutateAsync(nextMessages);
        setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error en el asistente";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠ No pude procesar la consulta: ${msg}` }
        ]);
      }
    },
    [messages, chatMutation]
  );
  const onSubmit = (e) => {
    e.preventDefault();
    void sendMessage(input);
  };
  if (!mounted) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    !open && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        onClick: () => setOpen(true),
        className: "fixed bottom-6 right-6 z-50 size-14 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 border border-emerald-400/30",
        "aria-label": "Abrir CONTAM AI Copilot",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-6" })
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          GLASS,
          "fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(560px,calc(100vh-4rem))] flex flex-col overflow-hidden border-emerald-500/20"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "size-5 text-emerald-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-emerald-200", children: "CONTAM AI Copilot" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  className: "size-8 text-slate-400",
                  onClick: () => setOpen(false),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "size-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  className: "size-8 text-slate-400",
                  onClick: () => setOpen(false),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [
            messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "rounded-xl px-3 py-2 text-sm max-w-[92%]",
                  m.role === "user" ? "ml-auto bg-emerald-900/50 border border-emerald-700/40 text-emerald-50" : "mr-auto bg-slate-800/80 border border-slate-700/50 text-slate-200"
                ),
                children: m.role === "assistant" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "prose prose-invert prose-sm max-w-none [&_li]:text-slate-300",
                    dangerouslySetInnerHTML: {
                      __html: `<p>${renderSimpleMarkdown(m.content)}</p>`
                    }
                  }
                ) : m.content
              },
              i
            )),
            chatMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-emerald-400" }),
              "Analizando normativa SUNAT…"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-2 flex flex-wrap gap-1.5 border-t border-slate-800 pt-2", children: QUICK_CHAT_PROMPTS.slice(0, 3).map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "text-[10px] px-2 py-1 rounded-full border border-slate-700 text-slate-400 hover:border-emerald-600 hover:text-emerald-300 transition-colors",
              onClick: () => void sendMessage(q),
              children: q.length > 42 ? `${q.slice(0, 40)}…` : q
            },
            q
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "p-3 border-t border-slate-800 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: input,
                onChange: (e) => setInput(e.target.value),
                placeholder: "Pregunta sobre IGV, Renta, SIRE…",
                className: "bg-slate-950/60 border-slate-700 text-slate-100",
                disabled: chatMutation.isPending
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                size: "icon",
                className: "shrink-0 bg-emerald-600 hover:bg-emerald-500",
                disabled: !input.trim() || chatMutation.isPending,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" })
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function AiCopilotWidget() {
  const mounted = useClientMounted();
  const { contribuyentes } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const options = reactExports.useMemo(
    () => contribuyentes.filter((c) => c.ruc?.trim()).map((c) => ({
      ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
      label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`
    })),
    [contribuyentes]
  );
  reactExports.useEffect(() => {
    if (!selectedRuc && options.length > 0) setSelectedRuc(options[0].ruc);
  }, [options, selectedRuc]);
  const contribuyente = reactExports.useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc]
  );
  const ruc = selectedRuc;
  const now = /* @__PURE__ */ new Date();
  const defaultPeriodo = mounted ? `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}` : "202601";
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [demoRuc, setDemoRuc] = reactExports.useState("20100070970");
  const [demoGlosa, setDemoGlosa] = reactExports.useState("Combustible diesel camión ruta Lima");
  const [demoCuenta, setDemoCuenta] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (mounted) setPeriodo(defaultPeriodo);
  }, [mounted, defaultPeriodo]);
  const { data: resolvedId } = useQuery({
    queryKey: ["ai-copilot", "contribuyente-id", ruc],
    queryFn: () => fetchContribuyenteIdByRucAi(ruc),
    enabled: !!ruc && ruc.length === 11,
    staleTime: 12e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const { data: anomalias = [], isLoading: loadingAnomalias, refetch } = useAnomaliasTributarias(
    contribuyenteId ?? null,
    periodo,
    !!contribuyenteId
  );
  const { data: resumen } = useResumenAnomalias(contribuyenteId ?? null, periodo, !!contribuyenteId);
  const auditarMutation = useAuditarCompras(contribuyenteId ?? null, periodo);
  const resolverMutation = useMarcarAnomaliaResuelta(contribuyenteId ?? null, periodo);
  const resumenCards = reactExports.useMemo(() => {
    const porNivel = resumen?.porNivelRiesgo ?? {};
    return [
      { label: "Críticas", key: "CRITICO", count: porNivel.CRITICO ?? 0 },
      { label: "Altas", key: "ALTO", count: porNivel.ALTO ?? 0 },
      { label: "Medias", key: "MEDIO", count: porNivel.MEDIO ?? 0 },
      { label: "Bajas", key: "BAJO", count: porNivel.BAJO ?? 0 }
    ];
  }, [resumen]);
  const handleAuditar = () => {
    if (!contribuyenteId) return;
    auditarMutation.mutate(void 0, {
      onSuccess: () => void refetch()
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold text-slate-100 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-7 text-emerald-400" }),
          "CONTAM AI Copilot"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 text-sm mt-1", children: "Auto-mapeo PCGE, auditoría fiscal de anomalías y asistente conversacional SUNAT." })
      ] }),
      contribuyente && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-emerald-600/40 text-emerald-300 w-fit", children: contribuyente.razonSocial ?? contribuyente.ruc })
    ] }),
    options.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 max-w-md"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Contribuyente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedRuc, onValueChange: setSelectedRuc, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1 bg-slate-950/60 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccionar RUC" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.ruc, children: o.label }, o.ruc)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "auditoria", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-slate-900/80 border border-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "auditoria", className: "data-[state=active]:bg-emerald-900/50", children: "Auditoría Fiscal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "pcge", className: "data-[state=active]:bg-emerald-900/50", children: "Auto-Mapeo PCGE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "auditoria", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex flex-wrap items-end gap-4"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Periodo tributario" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: periodo,
                onChange: (e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6)),
                placeholder: "YYYYMM",
                className: "w-32 bg-slate-950/60 border-slate-700 font-mono"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              className: "bg-emerald-600 hover:bg-emerald-500 gap-2",
              disabled: !contribuyenteId || auditarMutation.isPending,
              onClick: handleAuditar,
              children: [
                auditarMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScanSearch, { className: "size-4" }),
                "Ejecutar auditoría IA"
              ]
            }
          ),
          resumen && mounted && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-400 ml-auto", children: [
            resumen.pendientes,
            " pendiente(s) de ",
            resumen.total,
            " detectada(s)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: resumenCards.map((c) => {
          const colors = NIVEL_RIESGO_COLORS[c.key];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 text-center", colors.border), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", suppressHydrationWarning: true, children: mounted ? c.count : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-xs mt-1", colors.text), children: c.label })
          ] }, c.key);
        }) }),
        loadingAnomalias ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-8 flex justify-center text-slate-400"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin mr-2" }),
          "Cargando anomalías…"
        ] }) : anomalias.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-8 text-center"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-10 text-emerald-500/60 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-300 font-medium", children: "Sin anomalías pendientes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Ejecute la auditoría IA para analizar compras del periodo vs. actividad RUC." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: anomalias.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          AnomaliaCard,
          {
            anomalia: a,
            mounted,
            onResolver: (id) => resolverMutation.mutate(id),
            resolving: resolverMutation.isPending
          },
          a.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pcge", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-6 space-y-4 max-w-xl"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "Simule el suggestor inline que aparece en formularios de compras y asientos. Escriba RUC y glosa para ver la sugerencia en tiempo real." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "RUC proveedor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: demoRuc,
              onChange: (e) => setDemoRuc(e.target.value.replace(/\D/g, "").slice(0, 11)),
              className: "bg-slate-950/60 border-slate-700 font-mono",
              placeholder: "20XXXXXXXXX"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Glosa / descripción" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: demoGlosa,
              onChange: (e) => setDemoGlosa(e.target.value),
              className: "bg-slate-950/60 border-slate-700 min-h-[80px]",
              placeholder: "Ej: Factura luz del sur oficina principal"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InlinePcgeSuggestor,
            {
              contribuyenteId: contribuyenteId ?? null,
              ruc: demoRuc,
              glosa: demoGlosa,
              onAccept: (codigo, denom) => setDemoCuenta(`${codigo} — ${denom}`)
            }
          )
        ] }),
        demoCuenta && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-emerald-600/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200", children: [
          "Cuenta seleccionada: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: demoCuenta })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingChatWidget, { contribuyenteId: contribuyenteId ?? null, mounted })
  ] });
}
export {
  AiCopilotWidget
};
