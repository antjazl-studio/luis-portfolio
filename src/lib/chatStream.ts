// Pure helpers for the "Ask about Luis" chat widget (spec 008). No dependencies, no React.

export const MAX_MESSAGES = 20;
export const MAX_CHARS = 2000;
/** Idle timeout (FR-026): abort when no bytes arrive for this long. There is no total timeout. */
export const IDLE_TIMEOUT_MS = 30000;

export type ChatRole = "user" | "assistant";

export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string }
  | { type: "replace"; text: string }
  | { type: "done" };

function toEvent(value: unknown): ChatEvent | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  switch (v.type) {
    case "text":
      return typeof v.text === "string" ? { type: "text", text: v.text } : null;
    case "replace":
      return typeof v.text === "string" ? { type: "replace", text: v.text } : null;
    case "tool":
      return { type: "tool", name: typeof v.name === "string" ? v.name : "" };
    case "done":
      return { type: "done" };
    default:
      return null;
  }
}

/**
 * Parses as many complete SSE lines as `buffer` holds. Only `data:` lines are read (one optional space
 * after the colon). Malformed JSON and unknown event types are ignored. The incomplete tail is returned
 * in `rest` so the caller can prepend it to the next chunk.
 */
export function parseSseChunk(buffer: string): { events: ChatEvent[]; rest: string } {
  const events: ChatEvent[] = [];
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  for (const raw of lines) {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(line.startsWith("data: ") ? 6 : 5);
    try {
      const event = toEvent(JSON.parse(payload));
      if (event) events.push(event);
    } catch {
      // malformed line: ignored
    }
  }
  return { events, rest };
}

const RETRY_AFTER_DEFAULT = 30;

/** Seconds to wait from a Retry-After header (integer seconds or HTTP date), clamped to 1..3600. */
export function parseRetryAfter(header: string | null, now: number = Date.now()): number {
  if (header === null) return RETRY_AFTER_DEFAULT;
  const value = header.trim();
  if (value === "") return RETRY_AFTER_DEFAULT;
  let seconds: number;
  if (/^\d+$/.test(value)) {
    seconds = Number(value);
  } else {
    const at = Date.parse(value);
    if (Number.isNaN(at)) return RETRY_AFTER_DEFAULT;
    seconds = Math.ceil((at - now) / 1000);
  }
  return Math.min(3600, Math.max(1, seconds));
}

const CHAT_HOSTS = ["luisjacho.dev", "www.luisjacho.dev", "localhost", "127.0.0.1"];

/** Exact host match only (no suffix matching): the service refuses every other origin. */
export function isChatAvailable(hostname: string): boolean {
  return CHAT_HOSTS.includes(hostname);
}

/** Public service address (no secret). The literal env expression lets Next inline it at build time. */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://127.0.0.1:8000";
  return url.replace(/\/+$/, "");
}
