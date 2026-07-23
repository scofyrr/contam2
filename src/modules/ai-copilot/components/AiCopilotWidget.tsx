import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Minimize2,
  ScanSearch,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { cn } from "@/lib/utils";
import { InlinePcgeSuggestor } from "@/modules/ai-copilot/components/InlinePcgeSuggestor";
import {
  useAnomaliasTributarias,
  useAuditarCompras,
  useContamAiChat,
  useMarcarAnomaliaResuelta,
  useResumenAnomalias,
} from "@/modules/ai-copilot/hooks/useContamAi";
import { fetchContribuyenteIdByRucAi } from "@/modules/ai-copilot/services/aiCopilotService";
import type { AnomaliaTributaria, ChatMessage } from "@/modules/ai-copilot/types/aiCopilot";
import {
  NIVEL_RIESGO_COLORS,
  QUICK_CHAT_PROMPTS,
  TIPO_ANOMALIA_LABELS,
} from "@/modules/ai-copilot/types/aiCopilot";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function renderSimpleMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-emerald-300 text-sm">$1</code>')
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-emerald-300 mt-2 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-semibold text-emerald-200 mt-3 mb-1">$1</h3>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br/>");
}

function AnomaliaCard({
  anomalia,
  mounted,
  onResolver,
  resolving,
}: {
  anomalia: AnomaliaTributaria;
  mounted: boolean;
  onResolver: (id: string) => void;
  resolving: boolean;
}) {
  const colors = NIVEL_RIESGO_COLORS[anomalia.nivelRiesgo];

  return (
    <div
      className={cn(
        GLASS,
        "p-4 border-l-4",
        colors.border,
        colors.bg,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-lg shrink-0" suppressHydrationWarning>
            {mounted ? colors.emoji : "⚠"}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs", colors.text, colors.border)}>
                {anomalia.nivelRiesgo}
              </Badge>
              <span className="text-xs text-slate-500 font-mono">{anomalia.comprobanteRef}</span>
            </div>
            <p className="font-medium text-slate-100">
              {TIPO_ANOMALIA_LABELS[anomalia.tipoAnomalia]}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {anomalia.razonSocialEmisor ?? anomalia.rucEmisor}
            </p>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{anomalia.explicacionIa}</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 border-slate-700 text-slate-300 h-8"
          disabled={resolving}
          onClick={() => onResolver(anomalia.id)}
        >
          {resolving ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
          <span className="ml-1">Resolver</span>
        </Button>
      </div>
    </div>
  );
}

function FloatingChatWidget({
  contribuyenteId,
  mounted,
}: {
  contribuyenteId: string | null;
  mounted: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy **CONTAM AI Copilot**. Consulta normativa SUNAT, plazos SIRE, detracciones, prorrata IGV y más.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatMutation = useContamAiChat(contribuyenteId);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, chatMutation.isPending]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || chatMutation.isPending) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages(nextMessages);
      setInput("");

      try {
        const res = await chatMutation.mutateAsync(nextMessages);
        setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error en el asistente";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠ No pude procesar la consulta: ${msg}` },
        ]);
      }
    },
    [messages, chatMutation],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  if (!mounted) return null;

  return (
    <>
      {!open && (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 border border-emerald-400/30"
          aria-label="Abrir CONTAM AI Copilot"
        >
          <MessageCircle className="size-6" />
        </Button>
      )}

      {open && (
        <div
          className={cn(
            GLASS,
            "fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(560px,calc(100vh-4rem))] flex flex-col overflow-hidden border-emerald-500/20",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-emerald-400" />
              <span className="font-semibold text-emerald-200">CONTAM AI Copilot</span>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-slate-400"
                onClick={() => setOpen(false)}
              >
                <Minimize2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-slate-400"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm max-w-[92%]",
                  m.role === "user"
                    ? "ml-auto bg-emerald-900/50 border border-emerald-700/40 text-emerald-50"
                    : "mr-auto bg-slate-800/80 border border-slate-700/50 text-slate-200",
                )}
              >
                {m.role === "assistant" ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none [&_li]:text-slate-300"
                    dangerouslySetInnerHTML={{
                      __html: `<p>${renderSimpleMarkdown(m.content)}</p>`,
                    }}
                  />
                ) : (
                  m.content
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="size-4 animate-spin text-emerald-400" />
                Analizando normativa SUNAT…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 pb-2 flex flex-wrap gap-1.5 border-t border-slate-800 pt-2">
            {QUICK_CHAT_PROMPTS.slice(0, 3).map((q) => (
              <button
                key={q}
                type="button"
                className="text-[10px] px-2 py-1 rounded-full border border-slate-700 text-slate-400 hover:border-emerald-600 hover:text-emerald-300 transition-colors"
                onClick={() => void sendMessage(q)}
              >
                {q.length > 42 ? `${q.slice(0, 40)}…` : q}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="p-3 border-t border-slate-800 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre IGV, Renta, SIRE…"
              className="bg-slate-950/60 border-slate-700 text-slate-100"
              disabled={chatMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500"
              disabled={!input.trim() || chatMutation.isPending}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

export function AiCopilotWidget() {
  const mounted = useClientMounted();
  const { contribuyentes } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState("");

  const options = useMemo(
    () =>
      contribuyentes
        .filter((c) => c.ruc?.trim())
        .map((c) => ({
          ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
          label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`,
        })),
    [contribuyentes],
  );

  useEffect(() => {
    if (!selectedRuc && options.length > 0) setSelectedRuc(options[0].ruc);
  }, [options, selectedRuc]);

  const contribuyente = useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc],
  );

  const ruc = selectedRuc;

  const now = new Date();
  const defaultPeriodo = mounted
    ? `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`
    : "202601";

  const [periodo, setPeriodo] = useState(defaultPeriodo);
  const [demoRuc, setDemoRuc] = useState("20100070970");
  const [demoGlosa, setDemoGlosa] = useState("Combustible diesel camión ruta Lima");
  const [demoCuenta, setDemoCuenta] = useState("");

  useEffect(() => {
    if (mounted) setPeriodo(defaultPeriodo);
  }, [mounted, defaultPeriodo]);

  const { data: resolvedId } = useQuery({
    queryKey: ["ai-copilot", "contribuyente-id", ruc],
    queryFn: () => fetchContribuyenteIdByRucAi(ruc),
    enabled: !!ruc && ruc.length === 11,
    staleTime: 120_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;

  const { data: anomalias = [], isLoading: loadingAnomalias, refetch } = useAnomaliasTributarias(
    contribuyenteId ?? null,
    periodo,
    !!contribuyenteId,
  );

  const { data: resumen } = useResumenAnomalias(contribuyenteId ?? null, periodo, !!contribuyenteId);
  const auditarMutation = useAuditarCompras(contribuyenteId ?? null, periodo);
  const resolverMutation = useMarcarAnomaliaResuelta(contribuyenteId ?? null, periodo);

  const resumenCards = useMemo(() => {
    const porNivel = resumen?.porNivelRiesgo ?? {};
    return [
      { label: "Críticas", key: "CRITICO" as const, count: porNivel.CRITICO ?? 0 },
      { label: "Altas", key: "ALTO" as const, count: porNivel.ALTO ?? 0 },
      { label: "Medias", key: "MEDIO" as const, count: porNivel.MEDIO ?? 0 },
      { label: "Bajas", key: "BAJO" as const, count: porNivel.BAJO ?? 0 },
    ];
  }, [resumen]);

  const handleAuditar = () => {
    if (!contribuyenteId) return;
    auditarMutation.mutate(undefined, {
      onSuccess: () => void refetch(),
    });
  };

  return (
    <div className="min-h-full p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="size-7 text-emerald-400" />
            CONTAM AI Copilot
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Auto-mapeo PCGE, auditoría fiscal de anomalías y asistente conversacional SUNAT.
          </p>
        </div>
        {contribuyente && (
          <Badge variant="outline" className="border-emerald-600/40 text-emerald-300 w-fit">
            {contribuyente.razonSocial ?? contribuyente.ruc}
          </Badge>
        )}
      </div>

      {options.length > 0 && (
        <div className={cn(GLASS, "p-4 max-w-md")}>
          <Label className="text-slate-400 text-xs">Contribuyente</Label>
          <Select value={selectedRuc} onValueChange={setSelectedRuc}>
            <SelectTrigger className="mt-1 bg-slate-950/60 border-slate-700">
              <SelectValue placeholder="Seleccionar RUC" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.ruc} value={o.ruc}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs defaultValue="auditoria" className="space-y-4">
        <TabsList className="bg-slate-900/80 border border-slate-800">
          <TabsTrigger value="auditoria" className="data-[state=active]:bg-emerald-900/50">
            Auditoría Fiscal
          </TabsTrigger>
          <TabsTrigger value="pcge" className="data-[state=active]:bg-emerald-900/50">
            Auto-Mapeo PCGE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auditoria" className="space-y-4">
          <div className={cn(GLASS, "p-4 flex flex-wrap items-end gap-4")}>
            <div className="space-y-1">
              <Label className="text-slate-400">Periodo tributario</Label>
              <Input
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="YYYYMM"
                className="w-32 bg-slate-950/60 border-slate-700 font-mono"
              />
            </div>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-500 gap-2"
              disabled={!contribuyenteId || auditarMutation.isPending}
              onClick={handleAuditar}
            >
              {auditarMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ScanSearch className="size-4" />
              )}
              Ejecutar auditoría IA
            </Button>
            {resumen && mounted && (
              <p className="text-sm text-slate-400 ml-auto">
                {resumen.pendientes} pendiente(s) de {resumen.total} detectada(s)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {resumenCards.map((c) => {
              const colors = NIVEL_RIESGO_COLORS[c.key];
              return (
                <div key={c.key} className={cn(GLASS, "p-4 text-center", colors.border)}>
                  <p className="text-2xl font-bold" suppressHydrationWarning>
                    {mounted ? c.count : "—"}
                  </p>
                  <p className={cn("text-xs mt-1", colors.text)}>{c.label}</p>
                </div>
              );
            })}
          </div>

          {loadingAnomalias ? (
            <div className={cn(GLASS, "p-8 flex justify-center text-slate-400")}>
              <Loader2 className="size-5 animate-spin mr-2" />
              Cargando anomalías…
            </div>
          ) : anomalias.length === 0 ? (
            <div className={cn(GLASS, "p-8 text-center")}>
              <AlertTriangle className="size-10 text-emerald-500/60 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Sin anomalías pendientes</p>
              <p className="text-sm text-slate-500 mt-1">
                Ejecute la auditoría IA para analizar compras del periodo vs. actividad RUC.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalias.map((a) => (
                <AnomaliaCard
                  key={a.id}
                  anomalia={a}
                  mounted={mounted}
                  onResolver={(id) => resolverMutation.mutate(id)}
                  resolving={resolverMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pcge">
          <div className={cn(GLASS, "p-6 space-y-4 max-w-xl")}>
            <p className="text-sm text-slate-400">
              Simule el suggestor inline que aparece en formularios de compras y asientos.
              Escriba RUC y glosa para ver la sugerencia en tiempo real.
            </p>
            <div className="space-y-2">
              <Label className="text-slate-400">RUC proveedor</Label>
              <Input
                value={demoRuc}
                onChange={(e) => setDemoRuc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="bg-slate-950/60 border-slate-700 font-mono"
                placeholder="20XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Glosa / descripción</Label>
              <Textarea
                value={demoGlosa}
                onChange={(e) => setDemoGlosa(e.target.value)}
                className="bg-slate-950/60 border-slate-700 min-h-[80px]"
                placeholder="Ej: Factura luz del sur oficina principal"
              />
              <InlinePcgeSuggestor
                contribuyenteId={contribuyenteId ?? null}
                ruc={demoRuc}
                glosa={demoGlosa}
                onAccept={(codigo, denom) => setDemoCuenta(`${codigo} — ${denom}`)}
              />
            </div>
            {demoCuenta && (
              <div className="rounded-lg border border-emerald-600/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
                Cuenta seleccionada: <strong>{demoCuenta}</strong>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FloatingChatWidget contribuyenteId={contribuyenteId ?? null} mounted={mounted} />
    </div>
  );
}
