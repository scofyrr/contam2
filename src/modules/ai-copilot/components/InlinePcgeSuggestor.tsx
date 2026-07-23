import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRegistrarFeedbackAi } from "@/modules/ai-copilot/hooks/useContamAi";
import {
  sugerirCuentaPcge,
  sugerirCuentaPcgeLocal,
} from "@/modules/ai-copilot/services/aiCopilotService";
import type { SugerenciaPcge } from "@/modules/ai-copilot/types/aiCopilot";

const GLASS =
  "rounded-xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-md shadow-lg shadow-emerald-950/30";

export interface InlinePcgeSuggestorProps {
  contribuyenteId: string | null;
  ruc?: string;
  glosa: string;
  razonSocial?: string;
  disabled?: boolean;
  className?: string;
  onAccept: (cuentaCodigo: string, cuentaDenominacion: string) => void;
}

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function confianzaColor(score: number): string {
  if (score >= 0.85) return "text-emerald-400 border-emerald-500/50";
  if (score >= 0.65) return "text-amber-400 border-amber-500/50";
  return "text-slate-400 border-slate-600/50";
}

export function InlinePcgeSuggestor({
  contribuyenteId,
  ruc = "",
  glosa,
  razonSocial,
  disabled,
  className,
  onAccept,
}: InlinePcgeSuggestorProps) {
  const mounted = useClientMounted();
  const [sugerencia, setSugerencia] = useState<SugerenciaPcge | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const feedbackMutation = useRegistrarFeedbackAi();

  const fetchSugerencia = useCallback(async () => {
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

  useEffect(() => {
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

  const handleAccept = useCallback(() => {
    if (!sugerencia) return;
    onAccept(sugerencia.cuentaCodigo, sugerencia.cuentaDenominacion);
    if (sugerencia.logId) {
      feedbackMutation.mutate({
        logId: sugerencia.logId,
        fueAceptada: true,
      });
    }
    setVisible(false);
    setDismissed(true);
  }, [sugerencia, onAccept, feedbackMutation]);

  const handleDismiss = useCallback(() => {
    if (sugerencia?.logId) {
      feedbackMutation.mutate({
        logId: sugerencia.logId,
        fueAceptada: false,
      });
    }
    setVisible(false);
    setDismissed(true);
  }, [sugerencia, feedbackMutation]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
      return (
        <div
          data-pcge-suggestor
          className={cn(
            "flex items-center gap-2 text-xs text-slate-400 py-1",
            className,
          )}
        >
          <Loader2 className="size-3 animate-spin text-emerald-400" />
          Analizando glosa con IA…
        </div>
      );
    }
    return null;
  }

  const pct = Math.round(sugerencia.confianzaScore * 100);

  return (
    <div
      data-pcge-suggestor
      className={cn(GLASS, "p-3 mt-2 animate-in fade-in slide-in-from-top-1", className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Sparkles className="size-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-1">Sugerencia PCGE (IA)</p>
            <p className="font-mono font-semibold text-emerald-300">
              {sugerencia.cuentaCodigo}{" "}
              <span className="font-sans font-normal text-slate-200">
                — {sugerencia.cuentaDenominacion}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sugerencia.justificacion}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-slate-500 hover:text-slate-300"
          onClick={handleDismiss}
          aria-label="Descartar sugerencia"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn("text-xs", confianzaColor(sugerencia.confianzaScore))}
        >
          Confianza {pct}%
        </Badge>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 border-slate-700 text-slate-300"
            onClick={handleDismiss}
          >
            Ignorar
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
            onClick={handleAccept}
          >
            <Check className="size-3.5" />
            Aceptar
            <kbd className="ml-1 text-[10px] opacity-70 px-1 rounded bg-emerald-800">Tab</kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}
