export type AiChatMode = "ask" | "composer" | "debug";

export type AiPageFieldSnapshot = {
  field_path: string;
  label?: string;
  value?: string;
  readonly?: boolean;
  disabled?: boolean;
  sensitive?: boolean;
};

export type AiPageContext = {
  page_id: string;
  route?: string;
  ruc: string;
  title?: string;
  fields: AiPageFieldSnapshot[];
  overwrite?: boolean;
};

export type AiFillAction = {
  field_path: string;
  label?: string;
  value: string;
  source?: string;
};

export type AiSkippedField = {
  field_path: string;
  label?: string;
  reason: string;
};

export type AiDebugIssue = {
  field_path: string;
  label?: string;
  issue_type?: string;
  current_value?: string;
  expected_value?: string;
  fixed?: boolean;
  message?: string;
};

export type AiChatResponse = {
  reply: string;
  mode: string;
  tools_used: string[];
  thinking_seconds: number;
  fill_actions?: AiFillAction[];
  skipped_fields?: AiSkippedField[];
  composer_meta?: Record<string, unknown>;
  debug_issues?: AiDebugIssue[];
  debug_meta?: Record<string, unknown>;
};

import { getPublicEnv } from "@/lib/public-env";

export function getAiApiBase(): string {
  const fromEnv = getPublicEnv("VITE_AI_API_URL");
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/ai-api";
  if (import.meta.env.PROD) {
    console.error("VITE_AI_API_URL no está configurada en producción.");
  }
  return "http://localhost:8001";
}

export async function sendAiChat(params: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  mode: AiChatMode;
  thinkingSeconds: number;
  pageContext?: AiPageContext;
}): Promise<AiChatResponse> {
  const res = await fetch(`${getAiApiBase()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      history: params.history.map(({ role, content }) => ({ role, content })),
      mode: params.mode,
      thinking_seconds: params.thinkingSeconds,
      page_context: params.pageContext,
    }),
  });
  const data = (await res.json()) as AiChatResponse & { detail?: string };
  if (!res.ok) throw new Error(data.detail ?? `Error HTTP ${res.status}`);
  return data;
}
