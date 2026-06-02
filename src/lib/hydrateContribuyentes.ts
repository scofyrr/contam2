import type { Contribuyente } from "@/lib/contribuyentes-types";
import { emptyContribuyente } from "@/lib/contribuyentes-factory";
import { bulkUpsertContribuyentes } from "@/lib/contribuyentes-service";

const HYDRATE_FLAG = "contam_contribuyentes_supabase_hydrated_v1";
const KEY_CONTRIBUYENTES = "contam_contribuyentes_v1";

function parseCredenciales(raw: unknown): { usuario: string; clave: string } {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return { usuario: String(obj.usuario ?? ""), clave: String(obj.clave ?? "") };
}

/** Normaliza registros legacy de localStorage (p. ej. `categorias` JSON anidado). */
function normalizeLegacyContribuyente(raw: Record<string, unknown>): Contribuyente {
  const base = emptyContribuyente();
  const legacyCats = (raw.categorias ?? {}) as Record<string, unknown>;

  return {
    ...base,
    id: raw.id != null ? String(raw.id) : undefined,
    ruc: String(raw.ruc ?? "").replace(/\D/g, "").slice(0, 11),
    razonSocial: String(raw.razonSocial ?? raw.razon_social ?? ""),
    estado: (raw.estado as Contribuyente["estado"]) ?? base.estado,
    otros: String(raw.otros ?? ""),
    fechaVencimientoDeclaracion: String(
      raw.fechaVencimientoDeclaracion ?? raw.fecha_vencimiento_declaracion ?? "",
    ),
    cat1ra: Boolean(raw.cat1ra ?? legacyCats.cat1ra ?? false),
    cat2da: Boolean(raw.cat2da ?? legacyCats.cat2da ?? false),
    cat3ra: Boolean(raw.cat3ra ?? legacyCats.cat3ra ?? false),
    cat4taRetenciones: Boolean(
      raw.cat4taRetenciones ?? raw.cat4ta_retenciones ?? legacyCats.cat4taRetenciones ?? false,
    ),
    cat4taCtaPropia: Boolean(
      raw.cat4taCtaPropia ?? raw.cat4ta_cta_propia ?? legacyCats.cat4taCtaPropia ?? false,
    ),
    cat5ta: Boolean(raw.cat5ta ?? legacyCats.cat5ta ?? false),
    claveSol: parseCredenciales(raw.claveSol ?? raw.clave_sol),
    afpNet: parseCredenciales(raw.afpNet ?? raw.afp_net),
    validezCpe: parseCredenciales(raw.validezCpe ?? raw.validez_cpe),
    clavesSire: parseCredenciales(raw.clavesSire ?? raw.claves_sire),
    createdAt: raw.createdAt != null ? String(raw.createdAt) : base.createdAt,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : base.updatedAt,
  };
}

function readLocalStorageContribuyentes(): Contribuyente[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_CONTRIBUYENTES);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map((item) => normalizeLegacyContribuyente(item as Record<string, unknown>));
  } catch {
    return null;
  }
}

export function isContribuyentesHydrated(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(HYDRATE_FLAG) === "1";
}

export function markContribuyentesHydrated(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HYDRATE_FLAG, "1");
}

export type HydrateResult = {
  migrated: number;
  skipped: boolean;
  source: "localStorage" | "none";
};

/**
 * Migra una sola vez contribuyentes desde localStorage → Supabase.
 * No inyecta datos ficticios: solo datos reales del navegador del usuario.
 */
export async function hydrateContribuyentesOnce(): Promise<HydrateResult> {
  if (typeof window === "undefined") {
    return { migrated: 0, skipped: true, source: "none" };
  }

  if (isContribuyentesHydrated()) {
    return { migrated: 0, skipped: true, source: "none" };
  }

  const stored = readLocalStorageContribuyentes();
  if (!stored?.length) {
    markContribuyentesHydrated();
    return { migrated: 0, skipped: false, source: "none" };
  }

  const migrated = await bulkUpsertContribuyentes(stored);
  markContribuyentesHydrated();

  return { migrated, skipped: false, source: "localStorage" };
}
