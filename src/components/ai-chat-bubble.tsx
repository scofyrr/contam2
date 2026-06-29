import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
};

function getAiApiBase(): string {
  const fromEnv = (import.meta.env.VITE_AI_API_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Proxy Vite en dev → misma origen, evita CORS / "Failed to fetch"
  if (import.meta.env.DEV) return "/ai-api";
  return "http://localhost:8001";
}

const AI_API_BASE = getAiApiBase();

async function sendChat(params: {
  message: string;
  history: ChatMessage[];
  thinkingSeconds: number;
}): Promise<{ reply: string; tools_used: string[] }> {
  const res = await fetch(`${AI_API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      history: params.history.map(({ role, content }) => ({ role, content })),
      mode: "ask",
      thinking_seconds: params.thinkingSeconds,
    }),
  });
  const data = (await res.json()) as { reply?: string; tools_used?: string[]; detail?: string };
  if (!res.ok) throw new Error(data.detail ?? `Error HTTP ${res.status}`);
  return { reply: data.reply ?? "", tools_used: data.tools_used ?? [] };
}

/** Bolita flotante CONTAM AI — llama a ai-agent/server (puerto 8001). Sin tocar BD. */
export function AiChatBubble() {
  const [open, setOpen] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(3);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy CONTAM AI (beta). Modo Ask: consulto la base de datos en solo lectura y puedo buscar en internet. ¿En qué te ayudo?",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role === "user" || m.role === "assistant");
      const res = await sendChat({ message: text, history, thinkingSeconds });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, toolsUsed: res.tools_used },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ ${msg}. ¿Está corriendo el servidor AI? (cd ai-agent/server → python main.py)`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed right-5 bottom-20 z-50 flex w-[min(420px,calc(100vw-2.5rem))] h-[min(580px,calc(100vh-6rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          role="dialog"
          aria-label="CONTAM AI Chat"
        >
          <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="font-semibold">CONTAM AI</span>
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium">
                Beta · Ask
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex gap-1 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <span className="flex-1 rounded-lg bg-blue-600 py-1.5 text-center text-xs font-medium text-white">
              Ask
            </span>
            <span
              className="flex-1 rounded-lg border border-slate-200 py-1.5 text-center text-xs text-slate-400"
              title="Próximamente"
            >
              Composer
            </span>
            <span
              className="flex-1 rounded-lg border border-slate-200 py-1.5 text-center text-xs text-slate-400"
              title="Próximamente"
            >
              Debug
            </span>
          </div>

          <div className="border-b border-slate-100 px-3 py-2 text-xs text-slate-500">
            <label htmlFor="ai-thinking" className="flex items-center justify-between gap-2">
              <span>
                Pensamiento: <strong className="text-slate-700">{thinkingSeconds}s</strong>
              </span>
              <input
                id="ai-thinking"
                type="range"
                min={0}
                max={15}
                step={1}
                value={thinkingSeconds}
                onChange={(e) => setThinkingSeconds(Number(e.target.value))}
                className="w-32 accent-blue-600"
              />
            </label>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[92%] ${m.role === "user" ? "ml-auto items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "border border-slate-200 bg-white text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
                {m.toolsUsed && m.toolsUsed.length > 0 && (
                  <span className="mt-0.5 text-[10px] text-slate-400">
                    {m.toolsUsed.join(", ")}
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-sm italic text-slate-500">
                Analizando{thinkingSeconds > 0 ? ` (~${thinkingSeconds}s)` : ""}…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: teléfono del RUC 20123456789…"
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
