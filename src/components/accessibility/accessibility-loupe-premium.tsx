import { useCallback, useEffect, useId, useState } from "react";
import {
  Eye,
  Minus,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAccessibility } from "@/hooks/use-accessibility";
import { FONT_SCALE_STEPS, type ColorBlindMode, type ContrastLevel, type FontScale, type ThemeMode } from "@/lib/theme-system";
import { cn } from "@/lib/utils";

function ModePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-all duration-200",
        active
          ? "border-[var(--fin-premium-text,#C8A95A)] bg-[var(--fin-premium-bg)] text-[var(--fin-premium-text,#C8A95A)]"
          : "border-border/60 bg-transparent text-muted-foreground hover:bg-muted/40",
      )}
    >
      {children}
    </button>
  );
}

function ColorBlindPreview({ mode }: { mode: ColorBlindMode }) {
  const colors =
    mode === "protanopia"
      ? ["#00B878", "#D4A000", "#4A90D9"]
      : mode === "deuteranopia"
        ? ["#0088CC", "#CC5500", "#4477CC"]
        : mode === "tritanopia"
          ? ["#00AA88", "#DD3355", "#44AAAA"]
          : ["var(--fin-gain-text)", "var(--fin-loss-text)", "var(--fin-security-text)"];

  return (
    <span className="flex gap-0.5 ml-1">
      {colors.map((c) => (
        <span key={c} className="size-2 rounded-full border border-border/40" style={{ background: c }} />
      ))}
    </span>
  );
}

export function AccessibilityLoupePremium() {
  const {
    config,
    resolvedMode,
    setMode,
    setColorBlindMode,
    setContrast,
    setFontScale,
    increaseFontScale,
    decreaseFontScale,
    resetFontScale,
    setReducedMotion,
    setDenseMode,
    setShowGridLines,
    setHighContrastFocus,
    resetTheme,
  } = useAccessibility();

  const [open, setOpen] = useState(false);
  const panelId = useId();

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const handler = () => toggleOpen();
    window.addEventListener("contam:toggle-a11y-loupe", handler);
    return () => window.removeEventListener("contam:toggle-a11y-loupe", handler);
  }, [toggleOpen]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const sliderIndex = FONT_SCALE_STEPS.indexOf(config.fontScale);

  return (
    <>
      {config.fontScale !== 100 && (
        <div
          className="fixed bottom-6 left-20 z-[60] rounded-full border border-[#00D4FF]/40 bg-[#0D1525]/90 px-2.5 py-1 text-xs font-medium text-[#00D4FF] shadow-lg backdrop-blur-xl animate-in fade-in duration-200 dark:bg-[#0D1525]/90"
          aria-live="polite"
        >
          {config.fontScale}%
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Abrir asistente de accesibilidad"
        title="Accesibilidad (Ctrl+Shift+A)"
        onClick={toggleOpen}
        className={cn(
          "fixed bottom-6 left-6 z-[60] size-12 rounded-full border shadow-lg transition-transform duration-200 hover:scale-110",
          resolvedMode === "dark"
            ? "border-white/10 bg-[#0D1525]/95 text-[#C8A95A] hover:shadow-[0_0_20px_rgba(200,169,90,0.25)]"
            : "border-black/10 bg-white/95 text-[#B8860B] hover:shadow-md",
        )}
      >
        <Search className="size-5" strokeWidth={2} />
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-[2px]"
            aria-label="Cerrar panel"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
            className={cn(
              "fixed bottom-24 left-6 z-[60] w-[min(420px,calc(100vw-3rem))] max-h-[min(80vh,640px)] overflow-y-auto rounded-2xl border p-4 shadow-2xl",
              "animate-in zoom-in-95 fade-in duration-200",
              resolvedMode === "dark"
                ? "border-white/[0.08] bg-[#0D1525]/95 text-[#E8EDF5] backdrop-blur-xl"
                : "border-black/[0.08] bg-white/95 text-[#1E293B] backdrop-blur-xl",
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Search className="size-4 text-[#C8A95A]" />
                <h2 id={`${panelId}-title`} className="text-sm font-semibold tracking-wide">
                  ACCESIBILIDAD
                </h2>
              </div>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setOpen(false)} aria-label="Cerrar">
                <X className="size-4" />
              </Button>
            </div>

            <section className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Eye className="size-3.5" />
                TAMAÑO DE TEXTO
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={decreaseFontScale} aria-label="Reducir texto">
                  <Minus className="size-3.5" />
                </Button>
                <Slider
                  value={[sliderIndex >= 0 ? sliderIndex : 2]}
                  min={0}
                  max={FONT_SCALE_STEPS.length - 1}
                  step={1}
                  onValueChange={([v]) => setFontScale(FONT_SCALE_STEPS[v] as FontScale)}
                  className="flex-1"
                  aria-label="Escala de texto"
                />
                <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={increaseFontScale} aria-label="Aumentar texto">
                  <Plus className="size-3.5" />
                </Button>
                <span className="w-12 text-right text-xs font-mono text-[#00D4FF]">{config.fontScale}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Atajos: Ctrl+Shift+ +/- / 0 para restablecer
              </p>
            </section>

            <section className="space-y-2 mb-5">
              <div className="text-xs font-medium text-muted-foreground">MODO DE COLOR</div>
              <div className="flex gap-2">
                {(
                  [
                    ["dark", Moon, "Oscuro"],
                    ["light", Sun, "Claro"],
                    ["system", Monitor, "Auto"],
                  ] as const
                ).map(([mode, Icon, label]) => (
                  <ModePill key={mode} active={config.mode === mode} onClick={() => setMode(mode as ThemeMode)}>
                    <Icon className="size-4" />
                    {label}
                  </ModePill>
                ))}
              </div>
            </section>

            <section className="space-y-2 mb-5">
              <div className="text-xs font-medium text-muted-foreground">CONTRASTE</div>
              <div className="flex gap-2">
                {(["normal", "high", "maximum"] as ContrastLevel[]).map((level) => (
                  <ModePill key={level} active={config.contrastLevel === level} onClick={() => setContrast(level)}>
                    {level === "normal" ? "Normal" : level === "high" ? "Alto" : "Máximo"}
                  </ModePill>
                ))}
              </div>
            </section>

            <section className="space-y-2 mb-5">
              <div className="text-xs font-medium text-muted-foreground">DALTONISMO</div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["none", "Ninguno"],
                    ["protanopia", "Protanopía"],
                    ["deuteranopia", "Deuteranopía"],
                    ["tritanopia", "Tritanopía"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    title={
                      mode !== "none"
                        ? "Simulación de percepción cromática — verifique con su médico"
                        : undefined
                    }
                    onClick={() => setColorBlindMode(mode)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-2 py-2 text-xs transition-all duration-200",
                      config.colorBlindMode === mode
                        ? "border-[var(--fin-premium-text,#C8A95A)] bg-[var(--fin-premium-bg)]"
                        : "border-border/60 hover:bg-muted/40",
                    )}
                  >
                    <span>{label}</span>
                    <ColorBlindPreview mode={mode} />
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 mb-5 border-t border-border/40 pt-4">
              <div className="text-xs font-medium text-muted-foreground">OPCIONES ADICIONALES</div>
              {[
                [config.reducedMotion, setReducedMotion, "Reducir animaciones"],
                [config.denseMode, setDenseMode, "Modo compacto"],
                [config.showGridLines, setShowGridLines, "Líneas de cuadrícula en tablas"],
                [config.highContrastFocus, setHighContrastFocus, "Anillos de focus mejorados"],
              ].map(([checked, setter, label]) => (
                <div key={label as string} className="flex items-center justify-between gap-2">
                  <Label htmlFor={`a11y-${label}`} className="text-xs cursor-pointer">
                    {label as string}
                  </Label>
                  <Switch
                    id={`a11y-${label}`}
                    checked={checked as boolean}
                    onCheckedChange={setter as (v: boolean) => void}
                  />
                </div>
              ))}
            </section>

            <div className="flex gap-2 border-t border-border/40 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  resetTheme();
                  resetFontScale();
                }}
              >
                Restaurar defaults
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
