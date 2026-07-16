import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bug, MessageCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiComposer } from "@/contexts/ai-composer-context";
import {
  type AiChatMode,
  type AiChatResponse,
  sendAiChat,
} from "@/lib/ai-chat-api";
import {
  applyFillActionsProgressive,
  COMPOSER_LOADING_STEPS,
  DEBUG_LOADING_STEPS,
  highlightDebugField,
} from "@/lib/ai-composer-fill";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  streaming?: boolean;
  streamKind?: "composer" | "debug";
  streamLines?: string[];
};

const MODES: { id: AiChatMode; label: string; enabled: boolean; hint: string }[] = [
  { id: "ask", label: "Ask", enabled: true, hint: "Consultas BD + internet" },
  { id: "composer", label: "Composer", enabled: true, hint: "Rellenar formularios (sin guardar)" },
  { id: "debug", label: "Debug", enabled: true, hint: "Revisar y corregir lo que puso Composer" },
];

function thinkingMax(mode: AiChatMode): number {
  if (mode === "composer") return 45;
  if (mode === "debug") return 30;
  return 15;
}

function loadingSteps(mode: AiChatMode) {
  return mode === "debug" ? DEBUG_LOADING_STEPS : COMPOSER_LOADING_STEPS;
}

export function AiChatBubble() {
  const { registration, buildPageContext } = useAiComposer();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AiChatMode>("ask");
  const [thinkingSeconds, setThinkingSeconds] = useState(3);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy CONTAM AI. **Ask**: consultas. **Composer**: rellena campos. **Debug**: revisa y corrige lo que Composer puso. Tú siempre guardas.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open, loadingStep]);

  useEffect(() => {
    if (!loading || (mode !== "composer" && mode !== "debug")) return;
    const steps = loadingSteps(mode);
    const id = window.setInterval(() => {
      setLoadingStep((s) => (s + 1) % steps.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [loading, mode]);

  useEffect(() => {
    const max = thinkingMax(mode);
    if (thinkingSeconds > max) setThinkingSeconds(max);
  }, [mode, thinkingSeconds]);

  const appendStreamLine = useCallback((msgIndex: number, line: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const msg = next[msgIndex];
      if (!msg) return prev;
      next[msgIndex] = {
        ...msg,
        streamLines: [...(msg.streamLines ?? []), line],
        content: [...(msg.streamLines ?? []), line].join("\n"),
      };
      return next;
    });
  }, []);

  async function runLiveFill(
    res: AiChatResponse,
    streamMsgIndex: number,
    kind: "composer" | "debug",
  ): Promise<void> {
    const actions = res.fill_actions ?? [];
    if (!actions.length || !registration) {
      setMessages((prev) => {
        const next = [...prev];
        const msg = next[streamMsgIndex];
        if (msg) {
          next[streamMsgIndex] = {
            ...msg,
            streaming: false,
            content: res.reply,
            toolsUsed: res.tools_used,
          };
        }
        return next;
      });
      return;
    }

    const delay = Math.max(80, Math.min(400, Math.floor((thinkingSeconds * 1000) / actions.length)));
    const intro =
      kind === "debug"
        ? `\n🔧 Corrigiendo **${actions.length}** campos que no cuadraban…\n`
        : `\n📝 Rellenando **${actions.length}** campos…\n`;
    appendStreamLine(streamMsgIndex, intro);

    await applyFillActionsProgressive(
      actions,
      (action) => registration.applyFill(action),
      (action, i, total) => {
        const label = action.label || action.field_path;
        const preview =
          action.value.length > 42 ? `${action.value.slice(0, 42)}…` : action.value;
        const prefix = kind === "debug" ? "🔧" : "✏️";
        appendStreamLine(
          streamMsgIndex,
          `${prefix} \`${i + 1}/${total}\` **${label}** → ${preview}`,
        );
      },
      delay,
      kind === "debug" ? highlightDebugField : undefined,
    );

    setMessages((prev) => {
      const next = [...prev];
      const msg = next[streamMsgIndex];
      if (msg) {
        next[streamMsgIndex] = {
          ...msg,
          streaming: false,
          content: `${msg.content}\n\n---\n\n${res.reply}`,
          toolsUsed: res.tools_used,
        };
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const needsForm = mode === "composer" || mode === "debug";
    if (needsForm && !registration) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        {
          role: "assistant",
          content:
            "⚠️ Abre el **Editor** de Ficha RUC para revisar o rellenar campos.",
        },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setLoadingStep(0);

    const history = messages.filter((m) => m.role === "user" || m.role === "assistant");
    const maxThink = thinkingMax(mode);
    const think = Math.min(thinkingSeconds, maxThink);
    const streamIndex =
      mode === "composer" || mode === "debug" ? messages.length + 1 : -1;

    if (mode === "composer" || mode === "debug") {
      const intro =
        mode === "debug"
          ? "🔍 Revisando datos rellenados vs base de datos…"
          : "⏳ Analizando formulario y fuentes de datos…";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: intro,
          streaming: true,
          streamKind: mode,
          streamLines: [intro],
        },
      ]);
    }

    try {
      const pageContext = needsForm ? buildPageContext() : undefined;
      const res = await sendAiChat({
        message: text,
        history,
        mode,
        thinkingSeconds: think,
        pageContext,
      });

      if (mode === "composer" || mode === "debug") {
        appendStreamLine(
          streamIndex,
          mode === "debug" ? "✅ Revisión completada." : "✅ Plan recibido del servidor.",
        );
        await runLiveFill(res, streamIndex, mode);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.reply, toolsUsed: res.tools_used },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      if ((mode === "composer" || mode === "debug") && streamIndex >= 0) {
        setMessages((prev) => {
          const next = [...prev];
          if (next[streamIndex]) {
            next[streamIndex] = {
              role: "assistant",
              content: `⚠️ ${msg}. ¿Servidor AI activo? (cd ai-agent/server → python main.py)`,
              streaming: false,
            };
          }
          return next;
        });
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${msg}. ¿Servidor AI activo? (cd ai-agent/server → python main.py)`,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  const activeMode = MODES.find((m) => m.id === mode)!;
  const maxThink = thinkingMax(mode);

  return (
    <>
      {open && (
        <div
          className="fixed right-5 bottom-20 z-50 flex w-[min(420px,calc(100vw-2.5rem))] h-[min(580px,calc(100vh-6rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          role="dialog"
          aria-label="CONTAM AI Chat"
        >
          <header className="flex items-center justify-between bg-slate-900 dark:bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="font-semibold">CONTAM AI</span>
              <span className="rounded-full bg-slate-700 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium">
                Beta · {activeMode.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex gap-1 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                title={m.hint}
                disabled={!m.enabled}
                onClick={() => m.enabled && setMode(m.id)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-center text-xs font-medium transition-colors",
                  mode === m.id && m.enabled
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-300",
                  !m.enabled && "cursor-not-allowed opacity-60",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "composer" && registration && (
            <div className="border-b border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] text-emerald-800">
              📋 {registration.title} · RUC {registration.ruc}
            </div>
          )}
          {mode === "debug" && registration && (
            <div className="border-b border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] text-orange-900">
              🔍 Revisando {registration.title} · RUC {registration.ruc}
            </div>
          )}

          <div className="border-b border-slate-100 dark:border-slate-700 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
            <label htmlFor="ai-thinking" className="flex items-center justify-between gap-2">
              <span>
                Pensamiento: <strong className="text-slate-700 dark:text-slate-200">{Math.min(thinkingSeconds, maxThink)}s</strong>
                {mode === "composer" && <span className="text-slate-400"> (1–45)</span>}
                {mode === "debug" && <span className="text-slate-400"> (1–30)</span>}
              </span>
              <input
                id="ai-thinking"
                type="range"
                min={1}
                max={maxThink}
                step={1}
                value={Math.min(thinkingSeconds, maxThink)}
                onChange={(e) => setThinkingSeconds(Number(e.target.value))}
                className="w-32 accent-blue-600"
              />
            </label>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col max-w-[92%]",
                  m.role === "user" ? "ml-auto items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap font-mono text-[12px]",
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm font-sans text-sm"
                      : "border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm",
                    m.streaming && m.streamKind === "debug" && "border-orange-300 dark:border-orange-500 ring-1 ring-orange-200 dark:ring-orange-700",
                    m.streaming && m.streamKind !== "debug" && "border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-700",
                  )}
                >
                  {m.streaming && m.streamKind === "debug" && (
                    <span className="mb-1 flex items-center gap-1 font-sans text-[10px] text-orange-700">
                      <Bug className="size-3 animate-pulse" />
                      Debug en vivo
                    </span>
                  )}
                  {m.streaming && m.streamKind !== "debug" && (
                    <span className="mb-1 flex items-center gap-1 font-sans text-[10px] text-blue-600">
                      <Sparkles className="size-3 animate-pulse" />
                      Composer en vivo
                    </span>
                  )}
                  {m.content}
                </div>
                {m.toolsUsed && m.toolsUsed.length > 0 && !m.streaming && (
                  <span className="mt-0.5 font-sans text-[10px] text-slate-400 dark:text-slate-500">
                    {m.toolsUsed.join(", ")}
                  </span>
                )}
              </div>
            ))}
            {loading && mode === "ask" && (
              <div className="text-sm italic text-slate-400 dark:text-slate-400">
                Analizando (~{Math.min(thinkingSeconds, maxThink)}s)…
              </div>
            )}
            {loading && (mode === "composer" || mode === "debug") && (
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  mode === "debug"
                    ? "border-orange-200 bg-orange-50 text-orange-900"
                    : "border-blue-200 bg-blue-50 text-blue-800",
                )}
              >
                {mode === "debug" ? (
                  <Bug className="mb-1 inline size-3 animate-pulse" />
                ) : (
                  <Sparkles className="mb-1 inline size-3 animate-pulse" />
                )}{" "}
                {loadingSteps(mode)[loadingStep]}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "composer"
                  ? "Ej: Rellena la ficha con datos de la Clave SOL…"
                  : mode === "debug"
                    ? "Ej: Revisa los datos que rellenaste…"
                    : "Ej: ¿Cuántos registros hay en plan_contable_pcge?"
              }
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Button type="submit" size="sm" disabled={loading || !input.trim()}>
              Enviar
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/40 transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Cerrar CONTAM AI" : "Abrir CONTAM AI"}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-6" />}
      </button>
    </>
  );
}
