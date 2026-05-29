import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Contribuyente, FichaRuc } from "@/lib/contribuyentes-types";
import { emptyContribuyente, emptyFichaRuc } from "@/lib/contribuyentes-factory";
import {
  loadContribuyentes,
  loadFichas,
  saveContribuyentes,
  saveFichas,
  seedIfEmpty,
} from "@/lib/contribuyentes-storage";

type Ctx = {
  loading: boolean;
  contribuyentes: Contribuyente[];
  fichas: Record<string, FichaRuc>;
  upsertContribuyente: (c: Contribuyente) => void;
  removeContribuyente: (ruc: string) => void;
  getFicha: (ruc: string) => FichaRuc | undefined;
  saveFicha: (ficha: FichaRuc) => void;
  refresh: () => void;
};

const ContribuyentesContext = createContext<Ctx | null>(null);

export function ContribuyentesProvider({ children }: { children: ReactNode }) {
  const [loading] = useState(false);
  const [contribuyentes, setContribuyentes] = useState<Contribuyente[]>([]);
  const [fichas, setFichas] = useState<Record<string, FichaRuc>>({});

  const hydrate = useCallback(() => {
    const { contribuyentes: c, fichas: f } = seedIfEmpty();
    setContribuyentes(c);
    setFichas(f);
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const upsertContribuyente = useCallback((c: Contribuyente) => {
    const now = new Date().toISOString();
    const item = { ...c, updatedAt: now, createdAt: c.createdAt || now };
    setContribuyentes((prev) => {
      const idx = prev.findIndex((x) => x.ruc === item.ruc);
      const next =
        idx >= 0 ? prev.map((x, i) => (i === idx ? item : x)) : [...prev, item];
      saveContribuyentes(next);
      return next;
    });
    setFichas((prev) => {
      if (prev[item.ruc]) return prev;
      const ficha = emptyFichaRuc(item.ruc, item.razonSocial);
      const next = { ...prev, [item.ruc]: ficha };
      saveFichas(next);
      return next;
    });
  }, []);

  const removeContribuyente = useCallback((ruc: string) => {
    setContribuyentes((prev) => {
      const next = prev.filter((x) => x.ruc !== ruc);
      saveContribuyentes(next);
      return next;
    });
    setFichas((prev) => {
      const next = { ...prev };
      delete next[ruc];
      saveFichas(next);
      return next;
    });
  }, []);

  const getFicha = useCallback(
    (ruc: string) => fichas[ruc],
    [fichas],
  );

  const saveFicha = useCallback((ficha: FichaRuc) => {
    const updated = { ...ficha, updatedAt: new Date().toISOString() };
    setFichas((prev) => {
      const next = { ...prev, [ficha.ruc]: updated };
      saveFichas(next);
      return next;
    });
    setContribuyentes((prev) => {
      const idx = prev.findIndex((c) => c.ruc === ficha.ruc);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        razonSocial: ficha.general.razonSocial,
        updatedAt: updated.updatedAt,
      };
      saveContribuyentes(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      loading,
      contribuyentes,
      fichas,
      upsertContribuyente,
      removeContribuyente,
      getFicha,
      saveFicha,
      refresh: hydrate,
    }),
    [
      loading,
      contribuyentes,
      fichas,
      upsertContribuyente,
      removeContribuyente,
      getFicha,
      saveFicha,
      hydrate,
    ],
  );

  return (
    <ContribuyentesContext.Provider value={value}>
      {children}
    </ContribuyentesContext.Provider>
  );
}

export function useContribuyentes() {
  const ctx = useContext(ContribuyentesContext);
  if (!ctx) {
    throw new Error("useContribuyentes debe usarse dentro de ContribuyentesProvider");
  }
  return ctx;
}

/** KPIs agregados */
export function useContribuyentesKpis(contribuyentes: Contribuyente[]) {
  return useMemo(() => {
    const total = contribuyentes.length;
    const activos = contribuyentes.filter((c) => c.estado === "ACTIVO").length;
    const inactivos = contribuyentes.filter((c) => c.estado === "INACTIVO").length;
    const deBaja = contribuyentes.filter((c) => c.estado === "DE_BAJA").length;
    return { total, activos, inactivos, deBaja };
  }, [contribuyentes]);
}
