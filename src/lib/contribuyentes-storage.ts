import type { Contribuyente, FichaRuc } from "@/lib/contribuyentes-types";
import {
  emptyContribuyente,
  emptyFichaRuc,
  emptyCategorias,
} from "@/lib/contribuyentes-factory";

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

const DEMO_CONTRIBUYENTES: Contribuyente[] = [
  {
    ...emptyContribuyente(),
    ruc: "20123456789",
    razonSocial: "EMPRESA DEMO SAC",
    otros: "Cliente piloto CONTAM",
    categorias: { ...emptyCategorias(), cat3ra: true },
    fechaVencimientoDeclaracion: "2026-04-18",
    estado: "ACTIVO",
    claveSol: { usuario: "MODDATOS", clave: "••••••" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ...emptyContribuyente(),
    ruc: "10456789012",
    razonSocial: "GARCIA LOPEZ JUAN CARLOS",
    categorias: { ...emptyCategorias(), cat4taCtaPropia: true },
    fechaVencimientoDeclaracion: "2026-04-25",
    estado: "ACTIVO",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function buildDemoFichas(): Record<string, FichaRuc> {
  const out: Record<string, FichaRuc> = {};
  for (const c of DEMO_CONTRIBUYENTES) {
    const f = emptyFichaRuc(c.ruc, c.razonSocial);
    f.general.tipoContribuyente = c.ruc.startsWith("20") ? "PERSONA JURÍDICA" : "PERSONA NATURAL";
    f.general.fechaInscripcion = "2015-03-10";
    f.general.estadoContribuyente = "ACTIVO";
    f.modificacionContribuyente.nombreComercial = "DEMO COMERCIAL";
    f.modificacionContribuyente.correoElectronico1 = "contacto@demo.pe";
    out[c.ruc] = f;
  }
  return out;
}

export function loadContribuyentes(): Contribuyente[] {
  const stored = readJson<Contribuyente[] | null>(KEY_CONTRIBUYENTES, null);
  if (stored?.length) return stored;
  return DEMO_CONTRIBUYENTES;
}

export function saveContribuyentes(list: Contribuyente[]) {
  writeJson(KEY_CONTRIBUYENTES, list);
}

export function loadFichas(): Record<string, FichaRuc> {
  const stored = readJson<Record<string, FichaRuc> | null>(KEY_FICHAS, null);
  if (stored && Object.keys(stored).length > 0) return stored;
  return buildDemoFichas();
}

export function saveFichas(fichas: Record<string, FichaRuc>) {
  writeJson(KEY_FICHAS, fichas);
}

export function seedIfEmpty(): { contribuyentes: Contribuyente[]; fichas: Record<string, FichaRuc> } {
  const contribuyentes = loadContribuyentes();
  const fichas = loadFichas();
  if (!readJson(KEY_CONTRIBUYENTES, null)) saveContribuyentes(contribuyentes);
  if (!readJson(KEY_FICHAS, null)) saveFichas(fichas);
  return { contribuyentes, fichas };
}
