import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AiFillAction, AiPageContext, AiPageFieldSnapshot } from "@/lib/ai-chat-api";

export type AiComposerRegistration = {
  pageId: string;
  ruc: string;
  title: string;
  route: string;
  getFields: () => AiPageFieldSnapshot[];
  applyFill: (action: AiFillAction) => void;
};

type AiComposerContextValue = {
  registration: AiComposerRegistration | null;
  register: (reg: AiComposerRegistration) => void;
  unregister: (pageId: string) => void;
  buildPageContext: () => AiPageContext | undefined;
};

const AiComposerContext = createContext<AiComposerContextValue | null>(null);

export function AiComposerProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistration] = useState<AiComposerRegistration | null>(null);

  const register = useCallback((reg: AiComposerRegistration) => {
    setRegistration(reg);
  }, []);

  const unregister = useCallback((pageId: string) => {
    setRegistration((prev) => (prev?.pageId === pageId ? null : prev));
  }, []);

  const buildPageContext = useCallback((): AiPageContext | undefined => {
    if (!registration) return undefined;
    return {
      page_id: registration.pageId,
      route: registration.route,
      ruc: registration.ruc,
      title: registration.title,
      fields: registration.getFields(),
    };
  }, [registration]);

  const value = useMemo(
    () => ({ registration, register, unregister, buildPageContext }),
    [registration, register, unregister, buildPageContext],
  );

  return <AiComposerContext.Provider value={value}>{children}</AiComposerContext.Provider>;
}

export function useAiComposer() {
  const ctx = useContext(AiComposerContext);
  if (!ctx) throw new Error("useAiComposer debe usarse dentro de AiComposerProvider");
  return ctx;
}

/** Registra la página activa para Composer (p. ej. editor Ficha RUC). */
export function useRegisterAiComposerPage(
  reg: AiComposerRegistration | null,
  enabled: boolean,
) {
  const { register, unregister } = useAiComposer();

  useEffect(() => {
    if (!enabled || !reg) {
      if (reg?.pageId) unregister(reg.pageId);
      return;
    }
    register(reg);
    return () => unregister(reg.pageId);
  }, [enabled, reg, register, unregister]);
}
