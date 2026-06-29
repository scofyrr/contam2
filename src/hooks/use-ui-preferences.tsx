import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const DARK_MODE_KEY = "contam-dark-mode";
const EXPANDED_MODE_KEY = "contam-expanded-mode";

type UiPreferencesContextValue = {
  darkMode: boolean;
  expandedMode: boolean;
  toggleDarkMode: () => void;
  toggleExpandedMode: () => void;
};

const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(null);

function readBool(key: string, fallback = false): boolean {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) === "true";
}

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => readBool(DARK_MODE_KEY));
  const [expandedMode, setExpandedMode] = useState(() => readBool(EXPANDED_MODE_KEY));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem(DARK_MODE_KEY, String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(EXPANDED_MODE_KEY, String(expandedMode));
  }, [expandedMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((v) => !v), []);
  const toggleExpandedMode = useCallback(() => setExpandedMode((v) => !v), []);

  return (
    <UiPreferencesContext.Provider value={{ darkMode, expandedMode, toggleDarkMode, toggleExpandedMode }}>
      {children}
    </UiPreferencesContext.Provider>
  );
}

export function useUiPreferences() {
  const ctx = useContext(UiPreferencesContext);
  if (!ctx) throw new Error("useUiPreferences debe usarse dentro de UiPreferencesProvider");
  return ctx;
}
