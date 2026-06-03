import type { PostgrestError } from "@supabase/supabase-js";

/** Elimina `undefined` y convierte strings vacíos a `null` (PostgREST rechaza undefined). */
export function sanitizePayload<T extends Record<string, unknown>>(payload: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value === "") {
      out[key] = null;
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

/** Mensaje legible para toasts a partir del error de Supabase/PostgREST. */
export function formatSupabaseError(error: PostgrestError | Error | unknown): string {
  if (!error) return "Error desconocido";

  if (error instanceof Error && !("code" in error)) {
    return error.message;
  }

  const pg = error as PostgrestError;
  const parts: string[] = [];

  if (pg.message) parts.push(pg.message);
  if (pg.details && pg.details !== pg.message) parts.push(`Detalle: ${pg.details}`);
  if (pg.hint) parts.push(`Sugerencia: ${pg.hint}`);
  if (pg.code) parts.push(`Código: ${pg.code}`);

  return parts.length > 0 ? parts.join(" · ") : "No se pudo completar la operación en la base de datos";
}

export function throwIfSupabaseError(
  error: PostgrestError | null,
  context?: string,
): void {
  if (!error) return;
  const msg = formatSupabaseError(error);
  throw new Error(context ? `${context}: ${msg}` : msg);
}
