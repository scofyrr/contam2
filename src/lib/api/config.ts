/** `true` cuando VITE_USE_DJANGO_API está activo (string "true", case-insensitive). */
export function useDjangoApi(): boolean {
  const raw = import.meta.env.VITE_USE_DJANGO_API;
  return String(raw ?? "").toLowerCase() === "true";
}

export function getDataSourceLabel(): string {
  return useDjangoApi() ? "API Django" : "Supabase";
}
