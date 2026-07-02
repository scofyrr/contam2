/** Sistema central de temas, tokens financieros y accesibilidad visual. */

export type ThemeMode = "dark" | "light" | "system";
export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";
export type ContrastLevel = "normal" | "high" | "maximum";
export type FontScale = 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 | 175 | 200;

export const FONT_SCALE_STEPS: FontScale[] = [80, 90, 100, 110, 120, 130, 140, 150, 175, 200];

export type FinancialSemantic = "gain" | "loss" | "security" | "info" | "warning" | "premium" | "error" | "success";

export interface ThemeConfig {
  mode: ThemeMode;
  colorBlindMode: ColorBlindMode;
  contrastLevel: ContrastLevel;
  fontScale: FontScale;
  reducedMotion: boolean;
  denseMode: boolean;
  showGridLines: boolean;
  highContrastFocus: boolean;
  lastUpdated: number;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: "dark",
  colorBlindMode: "none",
  contrastLevel: "normal",
  fontScale: 100,
  reducedMotion: false,
  denseMode: false,
  showGridLines: false,
  highContrastFocus: false,
  lastUpdated: Date.now(),
};

export const THEME_STORAGE_KEY = "contam-theme-config";
export const LEGACY_DARK_MODE_KEY = "contam-dark-mode";

export interface ColorScale {
  bg: string;
  bgHover: string;
  bgLight: string;
  text: string;
  textSecondary: string;
  border: string;
  borderLight: string;
  glow: string;
  icon: string;
}

export type FinancialColorTokens = Record<FinancialSemantic, ColorScale>;

export interface ThemePalette {
  background: { primary: string; secondary: string; elevated: string; overlay: string };
  surface: { card: string; cardHover: string; cardActive: string; input: string; inputFocus: string };
  border: { subtle: string; default: string; strong: string; focus: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string; link: string };
  financial: FinancialColorTokens;
}

function fin(
  text: string,
  bg: string,
  opts?: Partial<ColorScale>,
): ColorScale {
  return {
    bg,
    bgHover: opts?.bgHover ?? bg.replace("0.10", "0.15"),
    bgLight: opts?.bgLight ?? bg.replace("0.10", "0.06"),
    text,
    textSecondary: opts?.textSecondary ?? text,
    border: opts?.border ?? bg.replace("0.10", "0.30"),
    borderLight: opts?.borderLight ?? bg.replace("0.10", "0.15"),
    glow: opts?.glow ?? `0 0 20px ${bg}`,
    icon: opts?.icon ?? text,
  };
}

export const DARK_THEME_TOKENS: ThemePalette = {
  background: {
    primary: "#060B14",
    secondary: "#0A1628",
    elevated: "#0D1525",
    overlay: "rgba(6, 11, 20, 0.8)",
  },
  surface: {
    card: "rgba(255, 255, 255, 0.02)",
    cardHover: "rgba(255, 255, 255, 0.04)",
    cardActive: "rgba(255, 255, 255, 0.06)",
    input: "#0F1D32",
    inputFocus: "#0A1628",
  },
  border: {
    subtle: "rgba(255, 255, 255, 0.04)",
    default: "rgba(255, 255, 255, 0.06)",
    strong: "rgba(255, 255, 255, 0.10)",
    focus: "#C8A95A",
  },
  text: {
    primary: "#E8EDF5",
    secondary: "#8899B4",
    tertiary: "#5A6D8A",
    inverse: "#060B14",
    link: "#00D4FF",
  },
  financial: {
    gain: fin("#00C897", "rgba(0, 200, 151, 0.10)", { textSecondary: "#00A87D" }),
    loss: fin("#FF5E7A", "rgba(255, 94, 122, 0.10)", { textSecondary: "#E84A6A" }),
    security: fin("#60A5FA", "rgba(59, 130, 246, 0.10)", { textSecondary: "#3B82F6" }),
    info: fin("#00D4FF", "rgba(0, 212, 255, 0.10)", { textSecondary: "#00B8E0" }),
    warning: fin("#F0A500", "rgba(240, 165, 0, 0.10)", { textSecondary: "#D49500" }),
    premium: fin("#C8A95A", "rgba(200, 169, 90, 0.10)", { textSecondary: "#B89940" }),
    error: fin("#FF4757", "rgba(255, 71, 87, 0.10)", { textSecondary: "#E83545" }),
    success: fin("#00D68F", "rgba(0, 214, 143, 0.10)", { textSecondary: "#00B878" }),
  },
};

export const LIGHT_THEME_TOKENS: ThemePalette = {
  background: {
    primary: "#F8FAFC",
    secondary: "#FFFFFF",
    elevated: "#FFFFFF",
    overlay: "rgba(248, 250, 252, 0.8)",
  },
  surface: {
    card: "#FFFFFF",
    cardHover: "#F1F5F9",
    cardActive: "#E2E8F0",
    input: "#FFFFFF",
    inputFocus: "#F8FAFC",
  },
  border: {
    subtle: "rgba(0, 0, 0, 0.04)",
    default: "rgba(0, 0, 0, 0.08)",
    strong: "rgba(0, 0, 0, 0.12)",
    focus: "#B8860B",
  },
  text: {
    primary: "#1E293B",
    secondary: "#475569",
    tertiary: "#64748B",
    inverse: "#FFFFFF",
    link: "#007A99",
  },
  financial: {
    gain: fin("#00855A", "rgba(0, 133, 90, 0.08)", { textSecondary: "#006B48" }),
    loss: fin("#D9405A", "rgba(217, 64, 90, 0.08)", { textSecondary: "#C03048" }),
    security: fin("#2563EB", "rgba(37, 99, 235, 0.08)", { textSecondary: "#1D4ED8" }),
    info: fin("#007A99", "rgba(0, 122, 153, 0.08)", { textSecondary: "#006680" }),
    warning: fin("#C48A00", "rgba(196, 138, 0, 0.08)", { textSecondary: "#A07000" }),
    premium: fin("#B8860B", "rgba(184, 134, 11, 0.08)", { textSecondary: "#9A6F00" }),
    error: fin("#DC2626", "rgba(220, 38, 38, 0.08)", { textSecondary: "#B91C1C" }),
    success: fin("#00B878", "rgba(0, 184, 120, 0.08)", { textSecondary: "#009960" }),
  },
};

type ColorBlindPatch = Partial<Record<FinancialSemantic, Pick<ColorScale, "text" | "bg">>>;

export const COLOR_BLIND_MATRICES: Record<Exclude<ColorBlindMode, "none">, ColorBlindPatch> = {
  protanopia: {
    gain: { text: "#00B878", bg: "rgba(0, 184, 120, 0.10)" },
    loss: { text: "#D4A000", bg: "rgba(212, 160, 0, 0.10)" },
    security: { text: "#4A90D9", bg: "rgba(74, 144, 217, 0.10)" },
    info: { text: "#00B8D4", bg: "rgba(0, 184, 212, 0.10)" },
    warning: { text: "#E8A000", bg: "rgba(232, 160, 0, 0.10)" },
    error: { text: "#D4A000", bg: "rgba(212, 160, 0, 0.10)" },
    success: { text: "#00B878", bg: "rgba(0, 184, 120, 0.10)" },
  },
  deuteranopia: {
    gain: { text: "#0088CC", bg: "rgba(0, 136, 204, 0.10)" },
    loss: { text: "#CC5500", bg: "rgba(204, 85, 0, 0.10)" },
    security: { text: "#4477CC", bg: "rgba(68, 119, 204, 0.10)" },
    info: { text: "#0099CC", bg: "rgba(0, 153, 204, 0.10)" },
    warning: { text: "#CC7700", bg: "rgba(204, 119, 0, 0.10)" },
    error: { text: "#CC5500", bg: "rgba(204, 85, 0, 0.10)" },
    success: { text: "#0088CC", bg: "rgba(0, 136, 204, 0.10)" },
  },
  tritanopia: {
    gain: { text: "#00AA88", bg: "rgba(0, 170, 136, 0.10)" },
    loss: { text: "#DD3355", bg: "rgba(221, 51, 85, 0.10)" },
    security: { text: "#44AAAA", bg: "rgba(68, 170, 170, 0.10)" },
    info: { text: "#00AAAA", bg: "rgba(0, 170, 170, 0.10)" },
    warning: { text: "#DD8800", bg: "rgba(221, 136, 0, 0.10)" },
    error: { text: "#DD3355", bg: "rgba(221, 51, 85, 0.10)" },
    success: { text: "#00AA88", bg: "rgba(0, 170, 136, 0.10)" },
  },
};

export function resolveThemeMode(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function getPalette(resolved: "dark" | "light"): ThemePalette {
  return resolved === "dark" ? DARK_THEME_TOKENS : LIGHT_THEME_TOKENS;
}

export function applyColorBlindToFinancial(
  financial: FinancialColorTokens,
  colorBlindMode: ColorBlindMode,
): FinancialColorTokens {
  if (colorBlindMode === "none") return financial;
  const patch = COLOR_BLIND_MATRICES[colorBlindMode];
  const out = { ...financial };
  for (const key of Object.keys(patch) as FinancialSemantic[]) {
    const p = patch[key];
    if (!p) continue;
    out[key] = {
      ...out[key],
      text: p.text,
      icon: p.text,
      textSecondary: p.text,
      bg: p.bg,
      bgHover: p.bg.replace("0.10", "0.15"),
      bgLight: p.bg.replace("0.10", "0.06"),
      border: p.bg.replace("0.10", "0.30"),
      borderLight: p.bg.replace("0.10", "0.15"),
      glow: `0 0 20px ${p.bg}`,
    };
  }
  return out;
}

export function loadThemeConfigFromStorage(): ThemeConfig {
  if (typeof window === "undefined") return { ...DEFAULT_THEME_CONFIG };
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ThemeConfig>;
      return { ...DEFAULT_THEME_CONFIG, ...parsed, lastUpdated: parsed.lastUpdated ?? Date.now() };
    }
    const legacyDark = localStorage.getItem(LEGACY_DARK_MODE_KEY);
    if (legacyDark !== null) {
      return {
        ...DEFAULT_THEME_CONFIG,
        mode: legacyDark === "true" ? "dark" : "light",
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_THEME_CONFIG };
}

export function persistThemeConfig(config: ThemeConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  localStorage.setItem(LEGACY_DARK_MODE_KEY, String(resolveThemeMode(config.mode) === "dark"));
}
