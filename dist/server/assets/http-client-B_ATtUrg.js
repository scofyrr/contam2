import { B as getPublicEnv } from "./router-B2fOVgbK.js";
function useDjangoApi() {
  const raw = "false";
  return String(raw).toLowerCase() === "true";
}
function getDataSourceLabel() {
  return useDjangoApi() ? "API Django" : "Supabase";
}
function getApiBase() {
  const raw = getPublicEnv("VITE_API_URL")?.replace(/\/$/, "") ?? "http://localhost:8000";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}
class ApiError extends Error {
  status;
  body;
  constructor(message, status, body = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
function formatApiError(err, fallback = "Error de comunicación con el servidor") {
  if (err instanceof ApiError) {
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
async function apiRequest(path, options = {}) {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, {
    ...options,
    headers
  });
  if (res.status === 204) {
    return void 0;
  }
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const message = typeof body?.error === "string" && body.error || typeof body?.detail === "string" && body.detail || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, body ?? {});
  }
  if (body === null) {
    return void 0;
  }
  return body;
}
export {
  ApiError as A,
  apiRequest as a,
  formatApiError as f,
  getDataSourceLabel as g,
  useDjangoApi as u
};
