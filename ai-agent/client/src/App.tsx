import { FormEvent, useEffect, useRef, useState } from "react";
import { ChatMessage, ChatMode, fetchHealth, sendChat } from "./api";

const MODES: { id: ChatMode; label: string; description: string; enabled: boolean }[] = [
  {
    id: "ask",
    label: "Ask",
    description: "Consultas BD + internet",
    enabled: true,
  },
  {
    id: "composer",
    label: "Composer",
    description: "Rellenar formularios (próximamente)",
    enabled: false,
  },
  {
    id: "debug",
    label: "Debug",
    description: "Verificar rellenado (próximamente)",
    enabled: false,
  },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("ask");
  const [thinkingSeconds, setThinkingSeconds] = useState(3);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy CONTAM AI (beta). Modo Ask activo: puedo consultar la base de datos en solo lectura y buscar en internet. ¿En qué te ayudo?",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHealth().then(setOnline);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || mode !== "ask") return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role === "user" || m.role === "assistant");
      const res = await sendChat({
        message: text,
        history,
        mode,
        thinkingSeconds,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          toolsUsed: res.tools_used,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      {/* Demo page — en beta la bolita vive aquí; luego se puede embeber en el ERP */}
      {!open && (
        <div className="demo-bg">
          <h1>CONTAM AI — Beta</h1>
          <p>
            Ecosistema aislado en <code>ai-agent/</code>. Sin tocar <code>src/</code> ni{" "}
            <code>backend/</code>.
          </p>
          <p className="hint">Pulsa la bolita abajo a la derecha para abrir el chat.</p>
          {online === false && (
            <p className="warn">Servidor AI offline — ejecuta el backend en el puerto 8001.</p>
          )}
        </div>
      )}

      {open && (
        <div className="chat-panel" role="dialog" aria-label="CONTAM AI Chat">
          <header className="chat-header">
            <div>
              <strong>CONTAM AI</strong>
              <span className="badge">Beta · Ask</span>
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
              Pensamiento profundo: <strong>{thinkingSeconds}s</strong>
            </label>
            <input
              id="thinking"
              type="range"
              min={0}
              max={15}
              step={1}
              value={thinkingSeconds}
              onChange={(e) => setThinkingSeconds(Number(e.target.value))}
            />
          </div>

          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="bubble">{m.content}</div>
                {m.toolsUsed && m.toolsUsed.length > 0 && (
                  <div className="tools">Tools: {m.toolsUsed.join(", ")}</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="msg assistant">
                <div className="bubble thinking">
                  Analizando{thinkingSeconds > 0 ? ` (~${thinkingSeconds}s)` : ""}…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: teléfono del RUC 20123456789…"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
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
