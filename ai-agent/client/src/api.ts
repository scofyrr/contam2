export type ChatMode = "ask" | "composer" | "debug";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  fillCount?: number;
  skippedCount?: number;
};

export type PageFieldSnapshot = {
  field_path: string;
  label?: string;
  value?: string;
  readonly?: boolean;
  disabled?: boolean;
  sensitive?: boolean;
};

export type PageContext = {
  page_id: string;
  route?: string;
  ruc: string;
  title?: string;
  fields: PageFieldSnapshot[];
  sol_credentials?: { usuario: string; clave: string };
  overwrite?: boolean;
};

export type FillAction = {
  field_path: string;
  label?: string;
  value: string;
  source?: string;
};

export type SkippedField = {
  field_path: string;
  label?: string;
  reason: string;
  current_value?: string | null;
};

export type ChatResponse = {
  reply: string;
  mode: string;
  tools_used: string[];
  thinking_seconds: number;
  fill_actions?: FillAction[];
  skipped_fields?: SkippedField[];
  composer_meta?: Record<string, unknown>;
};

export async function sendChat(params: {
  message: string;
  history: ChatMessage[];
  mode: ChatMode;
  thinkingSeconds: number;
  pageContext?: PageContext;
}): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
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

  const data = (await res.json()) as ChatResponse & { detail?: string };
  if (!res.ok) {
    throw new Error(data.detail ?? `Error HTTP ${res.status}`);
  }
  return data;
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const res = await fetch("/health");
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchComposerPages(): Promise<{ page_id: string; title: string }[]> {
  const res = await fetch("/api/composer/pages");
  if (!res.ok) return [];
  const data = (await res.json()) as { pages?: { page_id: string; title: string }[] };
  return data.pages ?? [];
}
