/**
 * Cliente HTTP hacia Django DRF (reemplaza llamadas directas a supabase.from).
 */

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api";

export type ApiErrorBody = {
  error?: string;
  detail?: string | Record<string, unknown>;
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(message: string, status: number, body: ApiErrorBody = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function formatApiError(err: unknown, fallback = "Error de comunicación con el servidor"): string {
  if (err instanceof ApiError) {
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

async function parseJsonSafe(res: Response): Promise<ApiErrorBody | null> {
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      (typeof body?.error === "string" && body.error) ||
      (typeof body?.detail === "string" && body.detail) ||
      `HTTP ${res.status}`;
    throw new ApiError(message, res.status, body ?? {});
  }

  if (body === null) {
    return undefined as T;
  }

  return body as T;
}
