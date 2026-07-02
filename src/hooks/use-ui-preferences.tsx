import { type ReactNode } from "react";
import { useAccessibility } from "@/hooks/use-accessibility";

type UiPreferencesContextValue = {
  darkMode: boolean;
  expandedMode: boolean;
  toggleDarkMode: () => void;
  toggleExpandedMode: () => void;
};

/** Compatibilidad con componentes existentes — requiere AccessibilityProvider en __root__ */
export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useUiPreferences(): UiPreferencesContextValue {
  const a11y = useAccessibility();
  return {
    darkMode: a11y.resolvedMode === "dark",
    expandedMode: a11y.expandedMode,
    toggleDarkMode: () => {
      a11y.setMode(a11y.resolvedMode === "dark" ? "light" : "dark");
    },
    toggleExpandedMode: a11y.toggleExpandedMode,
  };
}
