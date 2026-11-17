import { getAccessToken } from "@/lib/auth";

export type GenerateBody =
  | { tool: "writer"; prompt: string; contentType: string; tone: string }
  | { tool: "study"; mode: "ask" | "explain" | "summarize"; prompt: string; level?: string };

/** Pulls the safe `error` message out of a JSON error body, or returns a fallback. */
export function readableError(raw: string | undefined, fallback = "Something went wrong. Please try again.") {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as { error?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    // not JSON — use as-is if it reads like a sentence
  }
  return raw.length < 300 && !raw.trim().startsWith("<") ? raw : fallback;
}

/** Streams a Writer/Study generation from the server, calling onText with the full text so far. */
export async function streamGenerate(
  body: GenerateBody,
  onText: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("Please sign in to use this tool.");
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    ...(signal ? { signal } : {}),
  });
  if (!res.ok || !res.body) {
    throw new Error(readableError(await res.text().catch(() => undefined)));
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  if (!text.trim()) {
    throw new Error("Something went wrong generating a response. Your credits were refunded.");
  }
  return text;
}
