/** Runtime VITE_* — Render inyecta process.env; el cliente lee window.__CONTAM_PUBLIC_ENV__. */

const PUBLIC_ENV_KEYS = [
  "VITE_AI_API_URL",
  "VITE_API_URL",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
] as const;

export type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number];

declare global {
  interface Window {
    __CONTAM_PUBLIC_ENV__?: Partial<Record<PublicEnvKey, string>>;
  }
}

function fromProcess(key: PublicEnvKey): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function getPublicEnv(key: PublicEnvKey): string | undefined {
  if (typeof window !== "undefined") {
    const fromWindow = window.__CONTAM_PUBLIC_ENV__?.[key]?.trim();
    if (fromWindow) return fromWindow;
  }

  const fromNode = fromProcess(key);
  if (fromNode) return fromNode;

  const fromVite = (import.meta.env[key] as string | undefined)?.trim();
  return fromVite || undefined;
}

/** Script inline para hidratar env público en el browser (SSR lee process.env de Render). */
export function buildPublicEnvScript(): string {
  const env: Partial<Record<PublicEnvKey, string>> = {};
  for (const key of PUBLIC_ENV_KEYS) {
    const value = fromProcess(key) ?? (import.meta.env[key] as string | undefined)?.trim();
    if (value) env[key] = value;
  }
  return `window.__CONTAM_PUBLIC_ENV__=${JSON.stringify(env)};`;
}
