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
import { emptyFichaRuc } from "@/lib/contribuyentes-factory";
import {
  deleteContribuyente as deleteContribuyenteRemote,
  fetchContribuyentes,
  upsertContribuyente as upsertContribuyenteRemote,
} from "@/lib/contribuyentes-service";
import { hydrateContribuyentesOnce } from "@/lib/hydrateContribuyentes";
import { loadFichas, saveFichas } from "@/lib/contribuyentes-storage";

type Ctx = {
  loading: boolean;
  error: string | null;
  contribuyentes: Contribuyente[];
  fichas: Record<string, FichaRuc>;
  upsertContribuyente: (c: Contribuyente) => Promise<Contribuyente>;
  removeContribuyente: (ruc: string) => Promise<void>;
  getFicha: (ruc: string) => FichaRuc | undefined;
  saveFicha: (ficha: FichaRuc) => void;
  refresh: () => Promise<void>;
};

const ContribuyentesContext = createContext<Ctx | null>(null);

export function ContribuyentesProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contribuyentes, setContribuyentes] = useState<Contribuyente[]>([]);
  const [fichas, setFichas] = useState<Record<string, FichaRuc>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await hydrateContribuyentesOnce();
      const list = await fetchContribuyentes();
      setContribuyentes(list);
      setFichas(loadFichas());
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error al cargar contribuyentes";
      setError(message);
      setContribuyentes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsertContribuyente = useCallback(async (c: Contribuyente) => {
    const saved = await upsertContribuyenteRemote(c);
    setContribuyentes((prev) => {
      const idx = prev.findIndex((x) => x.ruc === saved.ruc);
      if (idx >= 0) {
        return prev.map((x, i) => (i === idx ? saved : x));
      }
      return [...prev, saved].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
    });
    setFichas((prev) => {
      if (prev[saved.ruc]) return prev;
      const ficha = emptyFichaRuc(saved.ruc, saved.razonSocial);
      const next = { ...prev, [saved.ruc]: ficha };
      saveFichas(next);
      return next;
    });
    return saved;
  }, []);

  const removeContribuyente = useCallback(async (ruc: string) => {
    await deleteContribuyenteRemote(ruc);
    setContribuyentes((prev) => prev.filter((x) => x.ruc !== ruc));
    setFichas((prev) => {
      const next = { ...prev };
      delete next[ruc];
      saveFichas(next);
      return next;
    });
  }, []);

  const getFicha = useCallback((ruc: string) => fichas[ruc], [fichas]);

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
      };
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      contribuyentes,
      fichas,
      upsertContribuyente,
      removeContribuyente,
      getFicha,
      saveFicha,
      refresh,
    }),
    [
      loading,
      error,
      contribuyentes,
      fichas,
      upsertContribuyente,
      removeContribuyente,
      getFicha,
      saveFicha,
      refresh,
    ],
  );

  return (
    <ContribuyentesContext.Provider value={value}>{children}</ContribuyentesContext.Provider>
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
