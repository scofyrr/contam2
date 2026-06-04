import { formatApiError } from "@/lib/api/http-client";
import { useDjangoApi } from "@/lib/api/config";
import { formatSupabaseError } from "@/lib/supabase-error";

/** Mensaje de error según el backend activo (Django o Supabase). */
export function formatRequestError(e: unknown, fallback?: string): string {
  if (useDjangoApi()) {
    return formatApiError(e, fallback ?? "Error de comunicación con el servidor");
  }
  return formatSupabaseError(e);
}
