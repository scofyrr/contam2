import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminConfigService } from "@/modules/admin/services/admin-config-service";
import {
  CATEGORY_TO_BUNDLE_KEY,
  CLAVE_TO_CATEGORY,
  type ConfigCategory,
  type SaveStatus,
} from "@/modules/admin/types/admin-config";
import type {
  EstudioConfigBundle,
  FeatureFlagRow,
} from "@/modules/config/types/estudio-config";
import { DEFAULT_ESTUDIO_CONFIG } from "@/modules/config/types/estudio-config";

const CLAVE_BY_CATEGORY: Record<Exclude<ConfigCategory, "flags" | "historial">, string> = {
  widgets: "dashboard_contador",
  umbrales: "umbrales_contador",
  colores: "colores_contador",
  notificaciones: "notificaciones_default",
  sidebar: "sidebar_contador",
  contenido: "contenido_contador",
  tareas: "tareas_auto",
};

type DraftState = EstudioConfigBundle;

function bundleKeyForCategory(cat: Exclude<ConfigCategory, "flags" | "historial">) {
  return CATEGORY_TO_BUNDLE_KEY[cat];
}

export function useAdminConfig() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [activeCategory, setActiveCategory] = useState<ConfigCategory>("widgets");

  const configQuery = useQuery({
    queryKey: ["admin", "config", "bundle"],
    queryFn: () => adminConfigService.getBundle(),
    staleTime: 2 * 60_000,
  });

  const flagsQuery = useQuery({
    queryKey: ["admin", "config", "flags"],
    queryFn: () => adminConfigService.getFeatureFlags(),
    staleTime: 2 * 60_000,
  });

  const historyQuery = useQuery({
    queryKey: ["admin", "config", "history"],
    queryFn: () => adminConfigService.getChangeHistory(undefined, 30),
    staleTime: 30_000,
  });

  const saved = configQuery.data ?? DEFAULT_ESTUDIO_CONFIG;
  const working = draft ?? saved;
  const flags = flagsQuery.data ?? [];

  const isDirtyCategory = useCallback(
    (cat: ConfigCategory): boolean => {
      if (!draft || cat === "flags" || cat === "historial") return false;
      const key = bundleKeyForCategory(cat);
      return JSON.stringify(draft[key]) !== JSON.stringify(saved[key]);
    },
    [draft, saved],
  );

  const isDirty = useMemo(() => {
    if (!draft) return false;
    return (Object.keys(CLAVE_BY_CATEGORY) as Array<keyof typeof CLAVE_BY_CATEGORY>).some((cat) =>
      isDirtyCategory(cat),
    );
  }, [draft, isDirtyCategory]);

  const updateDraft = useCallback(
    <K extends keyof EstudioConfigBundle>(key: K, value: EstudioConfigBundle[K]) => {
      setDraft((prev) => {
        const base = prev ?? { ...saved };
        return { ...base, [key]: value };
      });
      setSaveStatus("idle");
    },
    [saved],
  );

  const discardAll = useCallback(() => {
    setDraft(null);
    setSaveStatus("idle");
  }, []);

  const invalidateAll = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "config"] });
    await qc.invalidateQueries({ queryKey: ["estudio"] });
  }, [qc]);

  const saveCategory = useMutation({
    mutationFn: async (cat: Exclude<ConfigCategory, "flags" | "historial">) => {
      const clave = CLAVE_BY_CATEGORY[cat];
      const key = bundleKeyForCategory(cat);
      const valor = working[key];
      const validation = adminConfigService.validateConfig(clave, valor);
      if (!validation.valido) {
        throw new Error(validation.errores.map((e) => e.mensaje).join("; "));
      }
      return adminConfigService.updateConfig(clave, valor as never);
    },
    onMutate: () => setSaveStatus("saving"),
    onSuccess: async () => {
      setSaveStatus("saved");
      setDraft(null);
      await invalidateAll();
      void historyQuery.refetch();
      toast.success("Configuración guardada");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: (e: Error) => {
      setSaveStatus("error");
      toast.error(e.message);
    },
  });

  const saveAll = useCallback(async () => {
    const dirtyCats = (Object.keys(CLAVE_BY_CATEGORY) as Array<keyof typeof CLAVE_BY_CATEGORY>).filter(
      (c) => isDirtyCategory(c),
    );
    if (!dirtyCats.length) {
      toast.info("No hay cambios pendientes");
      return;
    }
    setSaveStatus("saving");
    try {
      for (const cat of dirtyCats) {
        const clave = CLAVE_BY_CATEGORY[cat];
        const key = bundleKeyForCategory(cat);
        const valor = working[key];
        const validation = adminConfigService.validateConfig(clave, valor);
        if (!validation.valido) {
          throw new Error(`${cat}: ${validation.errores.map((e) => e.mensaje).join("; ")}`);
        }
        await adminConfigService.updateConfig(clave, valor as never);
      }
      setSaveStatus("saved");
      setDraft(null);
      await invalidateAll();
      void historyQuery.refetch();
      toast.success("Configuración guardada");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setSaveStatus("error");
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  }, [isDirtyCategory, working, invalidateAll, historyQuery]);

  const saveCurrentCategory = useCallback(async () => {
    if (activeCategory === "flags" || activeCategory === "historial") return;
    await saveCategory.mutateAsync(activeCategory);
  }, [activeCategory, saveCategory]);

  const toggleFlag = useMutation({
    mutationFn: ({ codigo, activo }: { codigo: string; activo: boolean }) =>
      adminConfigService.toggleFeatureFlag(codigo, activo),
    onSuccess: async () => {
      await invalidateAll();
      void flagsQuery.refetch();
      toast.success("Feature flag actualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revertChange = useMutation({
    mutationFn: ({ clave, id }: { clave: string; id: string }) =>
      adminConfigService.revertConfig(clave, id),
    onSuccess: async () => {
      setDraft(null);
      await invalidateAll();
      void historyQuery.refetch();
      toast.success("Cambio revertido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const previewBundle = useMemo((): EstudioConfigBundle => working, [working]);

  const lastChange = historyQuery.data?.[0] ?? null;

  return {
    saved,
    working,
    flags,
    draft,
    activeCategory,
    setActiveCategory,
    updateDraft,
    isDirty,
    isDirtyCategory,
    saveStatus,
    saveAll,
    saveCurrentCategory,
    discardAll,
    toggleFlag: toggleFlag.mutate,
    revertChange: revertChange.mutate,
    isLoading: configQuery.isLoading,
    isSaving: saveStatus === "saving",
    history: historyQuery.data ?? [],
    lastChange,
    previewBundle,
    recargar: () => void configQuery.refetch(),
    categoryLabel: (clave: string) => CLAVE_TO_CATEGORY[clave] ?? clave,
  };
}

export type { FeatureFlagRow };
