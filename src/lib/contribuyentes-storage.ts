import type { Contribuyente, FichaRuc } from "@/lib/contribuyentes-types";

const KEY_CONTRIBUYENTES = "contam_contribuyentes_v1";
const KEY_FICHAS = "contam_fichas_ruc_v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/** Lee contribuyentes persistidos en localStorage (solo migración one-shot). */
export function loadContribuyentes(): Contribuyente[] {
  return readJson<Contribuyente[]>(KEY_CONTRIBUYENTES, []);
}

export function saveContribuyentes(list: Contribuyente[]) {
  writeJson(KEY_CONTRIBUYENTES, list);
}

export function loadFichas(): Record<string, FichaRuc> {
  return readJson<Record<string, FichaRuc>>(KEY_FICHAS, {});
}

export function saveFichas(fichas: Record<string, FichaRuc>) {
  writeJson(KEY_FICHAS, fichas);
}

export function seedIfEmpty(): { contribuyentes: Contribuyente[]; fichas: Record<string, FichaRuc> } {
  const contribuyentes = loadContribuyentes();
  const fichas = loadFichas();
  return { contribuyentes, fichas };
}
