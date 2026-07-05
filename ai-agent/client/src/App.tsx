import { FormEvent, useEffect, useRef, useState } from "react";
import { ChatMessage, ChatMode, fetchHealth, sendChat } from "./api";
import { applyFillActions, installComposerBridge } from "./composer-bridge";
import { DemoFichaForm, EMPTY_FICHA, type FichaState } from "./DemoFichaForm";

const MODES: { id: ChatMode; label: string; description: string; enabled: boolean }[] = [
  { id: "ask", label: "Ask", description: "Consultas BD + internet", enabled: true },
  { id: "composer", label: "Composer", description: "Rellenar formularios desde BD/Clave SOL", enabled: true },
  { id: "debug", label: "Debug", description: "Verificar rellenado (próximamente)", enabled: false },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("composer");
  const [thinkingSeconds, setThinkingSeconds] = useState(15);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [ficha, setFicha] = useState<FichaState>(EMPTY_FICHA);
  const formRef = useRef<HTMLFormElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Modo **Composer**: leo datos de `fichas_ruc` (BD read-only) y valido Clave SOL vía API SUNAT. Relleno campos en pantalla pero **no guardo ni emito**. Tú revisas y guardas.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHealth().then(setOnline);
    installComposerBridge();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const thinkingMax = mode === "composer" ? 45 : 15;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    if (mode === "debug") return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role === "user" || m.role === "assistant");
      const pageContext =
        mode === "composer" && formRef.current
          ? {
              page_id: "ficha-ruc",
              route: "/ficha-ruc",
              ruc: ficha.ruc,
              title: "Ficha RUC demo",
              fields: Array.from(formRef.current.querySelectorAll("[data-ai-field]")).map((el) => {
                const inputEl = el as HTMLInputElement;
                return {
                  field_path: inputEl.getAttribute("data-ai-field") ?? "",
                  label: inputEl.getAttribute("data-ai-label") ?? "",
                  value: inputEl.value,
                  readonly: inputEl.readOnly,
                  disabled: inputEl.disabled,
                };
              }),
            }
          : undefined;

      const res = await sendChat({
        message: text,
        history,
        mode,
        thinkingSeconds: Math.min(thinkingSeconds, thinkingMax),
        pageContext,
      });

      let reply = res.reply;
      if (mode === "composer" && res.fill_actions?.length && formRef.current) {
        const { applied, failed } = applyFillActions(res.fill_actions, formRef.current);
        setFicha((prev) => {
          let next = { ...prev };
          for (const a of res.fill_actions ?? []) {
            if (a.field_path === "ruc") next = { ...next, ruc: a.value };
            else {
              const [section, key] = a.field_path.split(".");
              if (section && key && section in next && section !== "ruc") {
                const sec = section as keyof Omit<FichaState, "ruc">;
                next = {
                  ...next,
                  [sec]: { ...next[sec], [key]: a.value },
                };
              }
            }
          }
          return next;
        });
        reply += `\n\n📝 Aplicados en pantalla: **${applied}** campos.`;
        if (failed.length) {
          reply += ` No encontrados/bloqueados: ${failed.length}.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          toolsUsed: res.tools_used,
          fillCount: res.fill_actions?.length,
          skippedCount: res.skipped_fields?.length,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      {!open && (
        <div className="demo-bg">
          <h1>CONTAM AI — Composer</h1>
          <p>
            Demo en <code>ai-agent/</code> — relleno desde BD read-only + validación Clave SOL (SUNAT OAuth).
          </p>
          <DemoFichaForm formRef={formRef} ficha={ficha} onChange={setFicha} />
          {online === false && (
            <p className="warn">Servidor AI offline — cd ai-agent/server → python main.py</p>
          )}
        </div>
      )}

      {open && (
        <div className="chat-panel" role="dialog" aria-label="CONTAM AI Chat">
          <header className="chat-header">
            <div>
              <strong>CONTAM AI</strong>
              <span className="badge">Beta · {mode === "composer" ? "Composer" : "Ask"}</span>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar">
              ✕
            </button>
          </header>

          <div className="mode-row">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mode-btn ${mode === m.id ? "active" : ""} ${!m.enabled ? "disabled" : ""}`}
                disabled={!m.enabled}
                title={m.description}
                onClick={() => m.enabled && setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="thinking-row">
            <label htmlFor="thinking">
              Pensamiento: <strong>{thinkingSeconds}s</strong>
              {mode === "composer" && <span className="hint-inline"> (1–45 s)</span>}
            </label>
            <input
              id="thinking"
              type="range"
              min={1}
              max={thinkingMax}
              step={1}
              value={Math.min(thinkingSeconds, thinkingMax)}
              onChange={(e) => setThinkingSeconds(Number(e.target.value))}
            />
          </div>

          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="bubble">{m.content}</div>
                {m.toolsUsed && m.toolsUsed.length > 0 && (
                  <div className="tools">
                    {m.toolsUsed.join(", ")}
                    {m.fillCount != null && ` · ${m.fillCount} fills`}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="msg assistant">
                <div className="bubble thinking">
                  {mode === "composer" ? "Rellenando" : "Analizando"} (~{thinkingSeconds}s)…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "composer"
                  ? "Ej: Rellena la ficha con datos de la Clave SOL…"
                  : "Ej: ¿Cuántos registros hay en plan_contable_pcge?"
              }
              disabled={loading || mode === "debug"}
            />
            <button type="submit" disabled={loading || !input.trim() || mode === "debug"}>
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`fab ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat CONTAM AI"}
      >
        {open ? "✕" : "AI"}
      </button>
    </div>
  );
}
