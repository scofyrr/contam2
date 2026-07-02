import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { themeManager } from "@/lib/theme-manager";
import {
  FONT_SCALE_STEPS,
  type ColorBlindMode,
  type ColorScale,
  type ContrastLevel,
  type FinancialColorTokens,
  type FinancialSemantic,
  type FontScale,
  type ThemeConfig,
  type ThemeMode,
} from "@/lib/theme-system";

const EXPANDED_MODE_KEY = "contam-expanded-mode";

type AccessibilityContextValue = {
  config: ThemeConfig;
  resolvedMode: "dark" | "light";
  expandedMode: boolean;
  setMode: (mode: ThemeMode) => void;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  setContrast: (level: ContrastLevel) => void;
  setFontScale: (scale: FontScale) => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  resetFontScale: () => void;
  setReducedMotion: (v: boolean) => void;
  setDenseMode: (v: boolean) => void;
  setShowGridLines: (v: boolean) => void;
  setHighContrastFocus: (v: boolean) => void;
  resetTheme: () => void;
  toggleExpandedMode: () => void;
  getFinancialColors: () => FinancialColorTokens;
  checkContrast: (fg: string, bg: string) => { aa: boolean; aaa: boolean; ratio: number };
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function readExpanded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(EXPANDED_MODE_KEY) === "true";
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(() => themeManager.getConfig());
  const [expandedMode, setExpandedMode] = useState(readExpanded);

  useEffect(() => {
    themeManager.init();
    setConfig(themeManager.getConfig());
    return themeManager.subscribe(setConfig);
  }, []);

  useEffect(() => {
    localStorage.setItem(EXPANDED_MODE_KEY, String(expandedMode));
  }, [expandedMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return;
      const key = e.key.toLowerCase();
      if (key === "a") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("contam:toggle-a11y-loupe"));
      } else if (key === "+" || key === "=") {
        e.preventDefault();
        themeManager.setFontScale(stepFont(config.fontScale, 1));
      } else if (key === "-" || key === "_") {
        e.preventDefault();
        themeManager.setFontScale(stepFont(config.fontScale, -1));
      } else if (key === "0") {
        e.preventDefault();
        themeManager.setFontScale(100);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [config.fontScale]);

  const resolvedMode = themeManager.getResolvedMode();

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      config,
      resolvedMode,
      expandedMode,
      setMode: (mode) => themeManager.setMode(mode),
      setColorBlindMode: (mode) => themeManager.setColorBlindMode(mode),
      setContrast: (level) => themeManager.setContrast(level),
      setFontScale: (scale) => themeManager.setFontScale(scale),
      increaseFontScale: () => themeManager.setFontScale(stepFont(config.fontScale, 1)),
      decreaseFontScale: () => themeManager.setFontScale(stepFont(config.fontScale, -1)),
      resetFontScale: () => themeManager.setFontScale(100),
      setReducedMotion: (v) => themeManager.setReducedMotion(v),
      setDenseMode: (v) => themeManager.setDenseMode(v),
      setShowGridLines: (v) => themeManager.setShowGridLines(v),
      setHighContrastFocus: (v) => themeManager.setHighContrastFocus(v),
      resetTheme: () => themeManager.reset(),
      toggleExpandedMode: () => setExpandedMode((v) => !v),
      getFinancialColors: () => themeManager.getColors(),
      checkContrast: (fg, bg) => themeManager.checkContrast(fg, bg),
    }),
    [config, expandedMode, resolvedMode],
  );

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
}

function stepFont(current: FontScale, dir: 1 | -1): FontScale {
  const idx = FONT_SCALE_STEPS.indexOf(current);
  const next = FONT_SCALE_STEPS[Math.min(FONT_SCALE_STEPS.length - 1, Math.max(0, idx + dir))];
  return next;
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility debe usarse dentro de AccessibilityProvider");
  return ctx;
}

export function useFinancialColors(): FinancialColorTokens & {
  get: (type: FinancialSemantic) => ColorScale;
} {
  const { getFinancialColors } = useAccessibility();
  const colors = getFinancialColors();
  return useMemo(
    () => ({
      ...colors,
      get: (type: FinancialSemantic) => colors[type],
    }),
    [colors],
  );
}

export function useFinancialColor(type: FinancialSemantic): ColorScale {
  const colors = useFinancialColors();
  return colors[type];
}

/** Atajo para montos con signo semántico */
export function useAmountColor(value: number): FinancialSemantic {
  if (value > 0) return "gain";
  if (value < 0) return "loss";
  return "info";
}

export function useAccessibilityOptional(): AccessibilityContextValue | null {
  return useContext(AccessibilityContext);
}
