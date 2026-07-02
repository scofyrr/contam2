import {
  applyColorBlindToFinancial,
  DEFAULT_THEME_CONFIG,
  getPalette,
  loadThemeConfigFromStorage,
  persistThemeConfig,
  resolveThemeMode,
  type ColorScale,
  type ContrastLevel,
  type FinancialColorTokens,
  type FinancialSemantic,
  type FontScale,
  type ThemeConfig,
  type ThemeMode,
  type ColorBlindMode,
} from "@/lib/theme-system";

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  return null;
}

function parseColor(input: string): [number, number, number] | null {
  const rgb = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return hexToRgb(input);
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function applyContrastToPalette(
  palette: ReturnType<typeof getPalette>,
  level: ContrastLevel,
  resolved: "dark" | "light",
): ReturnType<typeof getPalette> {
  if (level === "normal") return palette;
  if (level === "high") {
    return {
      ...palette,
      text: {
        ...palette.text,
        primary: resolved === "dark" ? "#FFFFFF" : "#0F172A",
        secondary: resolved === "dark" ? "#CBD5E1" : "#334155",
      },
    };
  }
  return {
    ...palette,
    background: {
      ...palette.background,
      primary: resolved === "dark" ? "#000000" : "#FFFFFF",
      secondary: resolved === "dark" ? "#000000" : "#FFFFFF",
    },
    text: {
      primary: resolved === "dark" ? "#FFFFFF" : "#000000",
      secondary: resolved === "dark" ? "#F1F5F9" : "#1E293B",
      tertiary: resolved === "dark" ? "#E2E8F0" : "#334155",
      inverse: resolved === "dark" ? "#000000" : "#FFFFFF",
      link: resolved === "dark" ? "#7DD3FC" : "#0369A1",
    },
    border: {
      ...palette.border,
      default: resolved === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
      strong: resolved === "dark" ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
    },
  };
}

function setFinancialVar(root: HTMLElement, key: FinancialSemantic, scale: ColorScale) {
  root.style.setProperty(`--fin-${key}-text`, scale.text);
  root.style.setProperty(`--fin-${key}-bg`, scale.bg);
  root.style.setProperty(`--fin-${key}-border`, scale.border);
  root.style.setProperty(`--fin-${key}-glow`, scale.glow);
}

export class ThemeManager {
  private config: ThemeConfig;
  private listeners = new Set<(config: ThemeConfig) => void>();
  private systemMedia: MediaQueryList | null = null;
  private systemListener: (() => void) | null = null;

  constructor(initial?: ThemeConfig) {
    this.config = initial ?? loadThemeConfigFromStorage();
  }

  init(): void {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced && !this.config.reducedMotion) {
      this.config = { ...this.config, reducedMotion: true };
    }
    this.watchSystemTheme();
    this.applyToDOM();
  }

  private watchSystemTheme(): void {
    if (typeof window === "undefined") return;
    this.systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
    this.systemListener = () => {
      if (this.config.mode === "system") this.applyToDOM();
    };
    this.systemMedia.addEventListener("change", this.systemListener);
  }

  destroy(): void {
    if (this.systemMedia && this.systemListener) {
      this.systemMedia.removeEventListener("change", this.systemListener);
    }
  }

  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  getResolvedMode(): "dark" | "light" {
    return resolveThemeMode(this.config.mode);
  }

  getColors(): FinancialColorTokens {
    const resolved = this.getResolvedMode();
    let palette = getPalette(resolved);
    palette = applyContrastToPalette(palette, this.config.contrastLevel, resolved);
    return applyColorBlindToFinancial(palette.financial, this.config.colorBlindMode);
  }

  setMode(mode: ThemeMode): void {
    this.update({ mode });
  }

  setColorBlindMode(mode: ColorBlindMode): void {
    this.update({ colorBlindMode: mode });
  }

  setContrast(level: ContrastLevel): void {
    this.update({ contrastLevel: level });
  }

  setFontScale(scale: FontScale): void {
    this.update({ fontScale: scale });
  }

  setReducedMotion(reduced: boolean): void {
    this.update({ reducedMotion: reduced });
  }

  setDenseMode(dense: boolean): void {
    this.update({ denseMode: dense });
  }

  setShowGridLines(show: boolean): void {
    this.update({ showGridLines: show });
  }

  setHighContrastFocus(high: boolean): void {
    this.update({ highContrastFocus: high });
  }

  patch(partial: Partial<ThemeConfig>): void {
    this.update(partial);
  }

  reset(): void {
    this.config = { ...DEFAULT_THEME_CONFIG, lastUpdated: Date.now() };
    persistThemeConfig(this.config);
    this.applyToDOM();
    this.emit();
  }

  subscribe(listener: (config: ThemeConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  checkContrast(
    foreground: string,
    background: string,
  ): { aa: boolean; aaa: boolean; ratio: number } {
    const fg = parseColor(foreground);
    const bg = parseColor(background);
    if (!fg || !bg) return { aa: false, aaa: false, ratio: 0 };
    const l1 = relativeLuminance(...fg);
    const l2 = relativeLuminance(...bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return { aa: ratio >= 4.5, aaa: ratio >= 7, ratio: Math.round(ratio * 100) / 100 };
  }

  applyToDOM(): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const resolved = this.getResolvedMode();
    let palette = getPalette(resolved);
    palette = applyContrastToPalette(palette, this.config.contrastLevel, resolved);
    const financial = applyColorBlindToFinancial(palette.financial, this.config.colorBlindMode);

    root.classList.toggle("dark", resolved === "dark");
    root.dataset.theme = resolved;
    root.dataset.colorBlind = this.config.colorBlindMode;
    root.dataset.contrast = this.config.contrastLevel;
    root.dataset.fontScale = String(this.config.fontScale);
    root.dataset.reducedMotion = String(this.config.reducedMotion);
    root.dataset.dense = String(this.config.denseMode);
    root.dataset.gridLines = String(this.config.showGridLines);
    root.dataset.highContrastFocus = String(this.config.highContrastFocus);

    const basePx = resolved === "light" ? 17 : 16;
    root.style.setProperty("--theme-base-font-px", String(basePx));
    root.style.setProperty("--font-scale-factor", String(this.config.fontScale / 100));
    root.style.fontSize = `calc(${basePx}px * var(--font-scale-factor))`;

    root.style.setProperty("--theme-bg-primary", palette.background.primary);
    root.style.setProperty("--theme-text-primary", palette.text.primary);
    root.style.setProperty("--theme-text-secondary", palette.text.secondary);

    root.style.setProperty("--background", palette.background.primary);
    root.style.setProperty("--foreground", palette.text.primary);
    root.style.setProperty("--muted-foreground", palette.text.secondary);
    root.style.setProperty("--border", palette.border.default);
    root.style.setProperty("--ring", palette.border.focus);

    if (resolved === "light") {
      root.style.setProperty("--card", palette.surface.card);
      root.style.setProperty("--card-foreground", palette.text.primary);
      root.style.setProperty("--success", financial.gain.text);
      root.style.setProperty("--destructive", financial.loss.text);
    } else {
      root.style.setProperty("--card", "#0f1d32");
      root.style.setProperty("--card-foreground", palette.text.primary);
      root.style.setProperty("--success", financial.gain.text);
      root.style.setProperty("--destructive", financial.loss.text);
    }

    for (const key of Object.keys(financial) as FinancialSemantic[]) {
      setFinancialVar(root, key, financial[key]);
    }

    root.style.setProperty(
      "--motion-duration",
      this.config.reducedMotion ? "0ms" : "200ms",
    );
  }

  private update(partial: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...partial, lastUpdated: Date.now() };
    persistThemeConfig(this.config);
    this.applyToDOM();
    this.emit();
  }

  private emit(): void {
    const snap = this.getConfig();
    for (const l of this.listeners) l(snap);
  }
}

export const themeManager = new ThemeManager();
