import { useCallback, useEffect, useRef, useState } from "react";
import {
  IDLE_TIMEOUT_MS,
  MAX_CHARS,
  MAX_MESSAGES,
  getApiUrl,
  parseRetryAfter,
  parseSseChunk,
  type ChatEvent,
  type ChatRole,
} from "@/lib/chatStream";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  /** Visitor messages: the turn failed and a retry is offered. Never sent. */
  failed?: boolean;
  /** Assistant messages: the stream ended without `done`. The flag is client-only; the partial text itself is sent as context if the visitor writes a new message instead of retrying. */
  incomplete?: boolean;
};

export type ChatStatus = "idle" | "streaming" | "rate-limited" | "error" | "full";
export type ChatErrorKind = "invalid" | "budget" | "unavailable" | "incomplete" | "empty" | "timeout";
export type ChatAnswer = { text: string; searching: boolean };

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<ChatErrorKind | null>(null);
  const [answer, setAnswer] = useState<ChatAnswer | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [draft, setDraft] = useState("");

  const messagesRef = useRef<ChatMessage[]>([]);
  const statusRef = useRef<ChatStatus>("idle");
  const draftRef = useRef("");
  const controllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);
  const idRef = useRef(0);
  const untilRef = useRef(0);

  const commitMessages = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);
  const commitStatus = useCallback((next: ChatStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);
  const updateDraft = useCallback((next: string) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const run = useCallback(
    async (conversation: ChatMessage[]) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const runId = ++runIdRef.current;
      const current = () => runIdRef.current === runId;

      commitStatus("streaming");
      setError(null);
      // Feedback within 1 s of sending (SC-002): searching is true from the start, the `tool` event keeps it true.
      let text = "";
      let searching = true;
      setAnswer({ text, searching });

      // Coalesce appends per animation frame; flush synchronously on replace, done and stream end.
      let raf = 0;
      const flush = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (current()) setAnswer({ text, searching });
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(flush);
      };

      // Idle timeout (FR-026): no total timeout; abort only when no bytes arrive for IDLE_TIMEOUT_MS.
      let timedOut = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const arm = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, IDLE_TIMEOUT_MS);
      };

      const markLastFailed = (list: ChatMessage[]): ChatMessage[] => {
        const last = list[list.length - 1];
        if (!last || last.role !== "user") return list;
        return [...list.slice(0, -1), { ...last, failed: true }];
      };

      /** Ends the turn. `kind` null = success. Server text is never read or shown (FR-017). */
      const finishAnswer = (kind: ChatErrorKind | null, incomplete = false) => {
        if (!current()) return;
        flush();
        const final = text.trim() === "" ? "" : text;
        let next = messagesRef.current;
        if (final) {
          next = [
            ...next,
            { id: `m${++idRef.current}`, role: "assistant", content: final, ...(incomplete ? { incomplete: true } : {}) },
          ];
        } else if (kind === "invalid") {
          // 422: the visitor message is removed and its text goes back to the input.
          const last = next[next.length - 1];
          if (last && last.role === "user") {
            next = next.slice(0, -1);
            updateDraft(draftRef.current.trim() === "" ? last.content : `${last.content}\n${draftRef.current}`);
          }
        } else if (kind) {
          next = markLastFailed(next);
        }
        commitMessages(next);
        setAnswer(null);
        if (kind) {
          setError(kind);
          commitStatus("error");
        } else {
          commitStatus(next.length >= MAX_MESSAGES ? "full" : "idle");
        }
      };

      const rateLimited = (seconds: number) => {
        if (!current()) return;
        flush();
        commitMessages(markLastFailed(messagesRef.current));
        setAnswer(null);
        setError(null);
        untilRef.current = Date.now() + seconds * 1000;
        setSecondsLeft(seconds);
        setWaitSeconds(seconds);
        commitStatus("rate-limited");
      };

      let sawDone = false;
      const apply = (event: ChatEvent) => {
        if (event.type === "text") {
          text += event.text;
          searching = false;
          schedule();
        } else if (event.type === "tool") {
          if (text === "") searching = true;
          schedule();
        } else if (event.type === "replace") {
          text = event.text;
          searching = false;
          flush();
        } else {
          sawDone = true;
        }
      };

      // No service configured (production build without NEXT_PUBLIC_AGENT_API_URL): show "unavailable", send nothing.
      const apiUrl = getApiUrl();
      if (apiUrl === null) {
        finishAnswer("unavailable");
        return;
      }

      arm();
      try {
        const response = await fetch(`${apiUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: conversation.map(({ role, content }) => ({ role, content })) }),
          credentials: "omit",
          cache: "no-store",
          signal: controller.signal,
        });
        arm();
        if (!response.ok) {
          void response.body?.cancel().catch(() => {});
          if (response.status === 422) finishAnswer("invalid");
          else if (response.status === 429) rateLimited(parseRetryAfter(response.headers.get("Retry-After")));
          else if (response.status === 503) finishAnswer("budget");
          else finishAnswer("unavailable");
          return;
        }
        if (!response.body) {
          finishAnswer("unavailable");
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            // Last line without a trailing newline: parse it too, so a final `done`/`replace` is not lost.
            const tail = parseSseChunk(`${buffer}${decoder.decode()}\n`);
            for (const event of tail.events) apply(event);
            break;
          }
          arm();
          const parsed = parseSseChunk(buffer + decoder.decode(value, { stream: true }));
          buffer = parsed.rest;
          for (const event of parsed.events) apply(event);
          if (sawDone) break;
        }
        if (sawDone) {
          void reader.cancel().catch(() => {});
          finishAnswer(text.trim() === "" ? "empty" : null);
        } else {
          finishAnswer(text.trim() === "" ? "unavailable" : "incomplete", true);
        }
      } catch {
        if (!current()) return;
        if (controller.signal.aborted && !timedOut) return; // user abort: not an error
        finishAnswer(text.trim() === "" ? (timedOut ? "timeout" : "unavailable") : "incomplete", true);
      } finally {
        clearTimeout(timer);
        if (raf) cancelAnimationFrame(raf);
      }
    },
    [commitMessages, commitStatus, updateDraft],
  );

  /** Sends a visitor message. Returns true when it was accepted. */
  const send = useCallback(
    (raw: string): boolean => {
      const text = raw.trim();
      if (text.length < 1 || text.length > MAX_CHARS) return false;
      if (statusRef.current !== "idle" && statusRef.current !== "error") return false;
      let base = messagesRef.current;
      // A visitor message that never got an answer is replaced by the new one (keeps roles alternating).
      const last = base[base.length - 1];
      if (last && last.role === "user" && last.failed) base = base.slice(0, -1);
      if (base.length > MAX_MESSAGES - 1) return false;
      const next = [...base, { id: `m${++idRef.current}`, role: "user" as const, content: text }];
      commitMessages(next);
      void run(next);
      return true;
    },
    [commitMessages, run],
  );

  /** Resends the same conversation without duplicating the visitor message. */
  const retry = useCallback(() => {
    if (statusRef.current !== "idle" && statusRef.current !== "error") return;
    let conv = messagesRef.current;
    const last = conv[conv.length - 1];
    if (last && last.role === "assistant" && last.incomplete) conv = conv.slice(0, -1);
    const user = conv[conv.length - 1];
    if (!user || user.role !== "user") return;
    conv = [...conv.slice(0, -1), { ...user, failed: false }];
    commitMessages(conv);
    void run(conv);
  }, [commitMessages, run]);

  /** Aborts any request and clears the whole conversation. */
  const startNewConversation = useCallback(() => {
    runIdRef.current += 1;
    controllerRef.current?.abort();
    commitMessages([]);
    setAnswer(null);
    setError(null);
    setSecondsLeft(0);
    updateDraft("");
    commitStatus("idle");
  }, [commitMessages, commitStatus, updateDraft]);

  // Rate-limit countdown: ticks once per second and re-enables sending when it ends.
  useEffect(() => {
    if (status !== "rate-limited") return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((untilRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(id);
        statusRef.current = "idle";
        setStatus("idle");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  // Cancel any in-flight request and ignore its late results (used by unmount).
  const cancel = useCallback(() => {
    runIdRef.current += 1;
    controllerRef.current?.abort();
  }, []);

  // Abort on unmount.
  useEffect(() => cancel, [cancel]);

  const last = messages[messages.length - 1];
  const canRetry =
    status === "error"
      ? error !== "invalid"
      : status === "idle" && last?.role === "user" && last.failed === true;

  return { messages, status, error, answer, secondsLeft, waitSeconds, draft, setDraft: updateDraft, canRetry, send, retry, startNewConversation };
}
