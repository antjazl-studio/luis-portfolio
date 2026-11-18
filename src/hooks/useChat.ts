import { useCallback, useEffect, useRef, useState } from "react";
import {
  IDLE_TIMEOUT_MS,
  MAX_CHARS,
  MAX_MESSAGES,
  getApiUrl,
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
  /** Assistant messages: the stream ended without `done`. Never sent. */
  incomplete?: boolean;
};

export type ChatStatus = "idle" | "streaming" | "error" | "full";
export type ChatErrorKind = "unavailable" | "incomplete" | "empty" | "timeout";
export type ChatAnswer = { text: string; searching: boolean };

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<ChatErrorKind | null>(null);
  const [answer, setAnswer] = useState<ChatAnswer | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  const statusRef = useRef<ChatStatus>("idle");
  const controllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);
  const idRef = useRef(0);

  const commitMessages = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);
  const commitStatus = useCallback((next: ChatStatus) => {
    statusRef.current = next;
    setStatus(next);
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
          commitMessages(next);
        }
        setAnswer(null);
        if (kind) {
          setError(kind);
          commitStatus("error");
        } else {
          commitStatus(next.length >= MAX_MESSAGES ? "full" : "idle");
        }
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

      arm();
      try {
        const response = await fetch(`${getApiUrl()}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: conversation.map(({ role, content }) => ({ role, content })) }),
          credentials: "omit",
          cache: "no-store",
          signal: controller.signal,
        });
        arm();
        if (!response.ok || !response.body) {
          finishAnswer("unavailable");
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
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
    [commitMessages, commitStatus],
  );

  /** Sends a visitor message. Returns true when it was accepted. */
  const send = useCallback(
    (raw: string): boolean => {
      const text = raw.trim();
      if (text.length < 1 || text.length > MAX_CHARS) return false;
      if (messagesRef.current.length > MAX_MESSAGES - 1) return false;
      if (statusRef.current !== "idle") return false;
      const next = [...messagesRef.current, { id: `m${++idRef.current}`, role: "user" as const, content: text }];
      commitMessages(next);
      void run(next);
      return true;
    },
    [commitMessages, run],
  );

  // Cancel any in-flight request and ignore its late results (used by unmount).
  const cancel = useCallback(() => {
    runIdRef.current += 1;
    controllerRef.current?.abort();
  }, []);

  // Abort on unmount.
  useEffect(() => cancel, [cancel]);

  return { messages, status, error, answer, send };
}
