export type ChatMode = "ask" | "composer" | "debug";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
};

export type ChatResponse = {
  reply: string;
  mode: string;
  tools_used: string[];
  thinking_seconds: number;
};

export async function sendChat(params: {
  message: string;
  history: ChatMessage[];
  mode: ChatMode;
  thinkingSeconds: number;
}): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      history: params.history.map(({ role, content }) => ({ role, content })),
      mode: params.mode,
      thinking_seconds: params.thinkingSeconds,
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
