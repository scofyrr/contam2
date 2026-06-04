import type {
  Contribuyente,
  CredencialesPortal,
  EstadoCliente,
} from "@/lib/contribuyentes-types";
import { ApiError, apiRequest } from "@/lib/api/http-client";

type CredencialesDto = { usuario?: string; clave?: string };

type ContribuyenteDto = {
  id?: string;
  ruc: string;
  razon_social: string;
  estado: string;
  otros?: string;
  fecha_vencimiento_declaracion?: string | null;
  cat1ra?: boolean;
  cat2da?: boolean;
  cat3ra?: boolean;
  cat4ta_retenciones?: boolean;
  cat4ta_cta_propia?: boolean;
  cat5ta?: boolean;
  clave_sol?: CredencialesDto;
  afp_net?: CredencialesDto;
  validez_cpe?: CredencialesDto;
  claves_sire?: CredencialesDto;
  created_at?: string;
  updated_at?: string;
};

function parseCredenciales(value: CredencialesDto | undefined): CredencialesPortal {
  return {
    usuario: String(value?.usuario ?? ""),
    clave: String(value?.clave ?? ""),
  };
}

function toCredencialesDto(c: CredencialesPortal): CredencialesDto {
  return { usuario: c.usuario ?? "", clave: c.clave ?? "" };
}

export function mapContribuyenteFromDto(row: ContribuyenteDto): Contribuyente {
  return {
    id: row.id,
    ruc: row.ruc.trim(),
    razonSocial: row.razon_social,
    estado: row.estado as EstadoCliente,
    otros: row.otros ?? "",
    fechaVencimientoDeclaracion: row.fecha_vencimiento_declaracion ?? "",
    cat1ra: Boolean(row.cat1ra),
    cat2da: Boolean(row.cat2da),
    cat3ra: Boolean(row.cat3ra),
    cat4taRetenciones: Boolean(row.cat4ta_retenciones),
    cat4taCtaPropia: Boolean(row.cat4ta_cta_propia),
    cat5ta: Boolean(row.cat5ta),
    claveSol: parseCredenciales(row.clave_sol),
    afpNet: parseCredenciales(row.afp_net),
    validezCpe: parseCredenciales(row.validez_cpe),
    clavesSire: parseCredenciales(row.claves_sire),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toContribuyenteDto(c: Contribuyente): ContribuyenteDto {
  const ruc = c.ruc.replace(/\D/g, "").slice(0, 11);
  return {
    ruc,
    razon_social: c.razonSocial.trim(),
    estado: c.estado ?? "ACTIVO",
    otros: c.otros ?? "",
    fecha_vencimiento_declaracion: c.fechaVencimientoDeclaracion?.trim()
      ? c.fechaVencimientoDeclaracion
      : null,
    cat1ra: c.cat1ra ?? false,
    cat2da: c.cat2da ?? false,
    cat3ra: c.cat3ra ?? false,
    cat4ta_retenciones: c.cat4taRetenciones ?? false,
    cat4ta_cta_propia: c.cat4taCtaPropia ?? false,
    cat5ta: c.cat5ta ?? false,
    clave_sol: toCredencialesDto(c.claveSol),
    afp_net: toCredencialesDto(c.afpNet),
    validez_cpe: toCredencialesDto(c.validezCpe),
    claves_sire: toCredencialesDto(c.clavesSire),
  };
}

export async function fetchContribuyentesViaApi(): Promise<Contribuyente[]> {
  const rows = await apiRequest<ContribuyenteDto[]>("/contribuyentes/", { method: "GET" });
  return rows.map(mapContribuyenteFromDto);
}

export async function fetchContribuyenteByRucViaApi(ruc: string): Promise<Contribuyente | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  try {
    const row = await apiRequest<ContribuyenteDto>(`/contribuyentes/${clean}/`, {
      method: "GET",
    });
    return mapContribuyenteFromDto(row);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function rucExistsViaApi(ruc: string, excludeRuc?: string): Promise<boolean> {
  const clean = ruc.replace(/\D/g, "");
  if (!clean) return false;
  const found = await fetchContribuyenteByRucViaApi(clean);
  if (!found) return false;
  if (excludeRuc && found.ruc === excludeRuc.replace(/\D/g, "")) return false;
  return true;
}

export async function upsertContribuyenteViaApi(contribuyente: Contribuyente): Promise<Contribuyente> {
  const body = toContribuyenteDto(contribuyente);
  const existing = await fetchContribuyenteByRucViaApi(body.ruc);

  if (existing) {
    const row = await apiRequest<ContribuyenteDto>(`/contribuyentes/${body.ruc}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapContribuyenteFromDto(row);
  }

  const row = await apiRequest<ContribuyenteDto>("/contribuyentes/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapContribuyenteFromDto(row);
}

export async function deleteContribuyenteViaApi(ruc: string): Promise<void> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  await apiRequest<void>(`/contribuyentes/${clean}/`, { method: "DELETE" });
}

export async function bulkUpsertContribuyentesViaApi(list: Contribuyente[]): Promise<number> {
  let count = 0;
  for (const c of list) {
    await upsertContribuyenteViaApi(c);
    count += 1;
  }
  return count;
}
