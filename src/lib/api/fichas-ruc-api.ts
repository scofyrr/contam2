/**
 * Ficha RUC vía Django — sustituye supabase.from('fichas_ruc').
 *
 * Uso en componente (ej. _app.ficha-ruc.tsx):
 *   import { toast } from "sonner";
 *   import { upsertFichaRucViaApi, formatApiError } from "@/lib/api/fichas-ruc-api";
 *
 *   try {
 *     const saved = await upsertFichaRucViaApi(ficha);
 *     toast.success("Ficha guardada");
 *   } catch (e) {
 *     toast.error(formatApiError(e, "No se pudo guardar la ficha"));
 *   }
 */

import type { FichaRuc } from "@/lib/contribuyentes-types";
import { ApiError, apiRequest, formatApiError } from "@/lib/api/http-client";

export { formatApiError };

type FichaRucRowDto = {
  ruc: string;
  payload: FichaRuc;
  created_at?: string;
  updated_at?: string;
};

function rowToFicha(row: FichaRucRowDto): FichaRuc {
  const payload = row.payload ?? ({} as FichaRuc);
  return {
    ...payload,
    ruc: row.ruc,
    updatedAt: row.updated_at ?? payload.updatedAt,
  };
}

export async function fetchFichaByRucViaApi(ruc: string): Promise<FichaRuc | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  try {
    const row = await apiRequest<FichaRucRowDto>(`/fichas-ruc/${clean}/`, { method: "GET" });
    return rowToFicha(row);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function fetchAllFichasViaApi(): Promise<Record<string, FichaRuc>> {
  const rows = await apiRequest<FichaRucRowDto[]>("/fichas-ruc/", { method: "GET" });
  const out: Record<string, FichaRuc> = {};
  for (const row of rows) {
    out[row.ruc] = rowToFicha(row);
  }
  return out;
}

/**
 * Crea o actualiza: si existe, PATCH solo `payload`; si no, POST.
 */
export async function upsertFichaRucViaApi(ficha: FichaRuc): Promise<FichaRuc> {
  const ruc = ficha.ruc.replace(/\D/g, "").slice(0, 11);
  if (ruc.length !== 11) {
    throw new Error("RUC inválido: debe tener 11 dígitos");
  }

  const payload: FichaRuc = {
    ...ficha,
    ruc,
    updatedAt: new Date().toISOString(),
  };

  const existing = await fetchFichaByRucViaApi(ruc).catch(() => null);

  if (existing) {
    const row = await apiRequest<FichaRucRowDto>(`/fichas-ruc/${ruc}/`, {
      method: "PATCH",
      body: JSON.stringify({ payload }),
    });
    return rowToFicha(row);
  }

  const row = await apiRequest<FichaRucRowDto>("/fichas-ruc/", {
    method: "POST",
    body: JSON.stringify({ ruc, payload }),
  });
  return rowToFicha(row);
}
