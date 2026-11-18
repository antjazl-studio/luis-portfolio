"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type UIEvent } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { useChat } from "@/hooks/useChat";
import translations from "@/lib/translations";
import { MAX_CHARS } from "@/lib/chatStream";
import { ChatMarkdown } from "./ChatMarkdown";

type ChatState = ReturnType<typeof useChat>;

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
  chat: ChatState;
};

export function ChatPanel({ open, onClose, chat }: ChatPanelProps) {
  const { language } = useLanguage();
  const t = translations[language].chat;
  const { messages, status, answer, send } = chat;
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickRef = useRef(true);

  // Native modal dialog: showModal() traps focus and handles Esc; the `close` event reports it to the parent.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        // Fade in (opacity only, <= 150 ms; the global reduced-motion rule collapses the transition).
        dialog.style.opacity = "0";
        dialog.showModal();
        inputRef.current?.focus();
      }
      // Not cancelled in a cleanup: StrictMode re-runs this effect and would otherwise leave opacity at 0.
      requestAnimationFrame(() => {
        dialog.style.opacity = "1";
      });
      return;
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Explicit Tab wrap-around: focus never leaves the panel, whatever the browser does at the dialog edge.
  const onDialogKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled]), a[href]'),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const lastEl = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      first.focus();
    }
  };

  // Keep the newest text in view while streaming, unless the visitor scrolled up.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, answer]);
  const onListScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  // Short states and the final answer are announced politely; the message list itself is not a live region.
  const last = messages[messages.length - 1];
  const announcement = answer
    ? answer.searching
      ? t.searching
      : t.answering
    : last?.role === "assistant"
      ? last.content.replace(/<[^>]*>/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "")
      : "";

  const busy = status === "streaming";
  const submit = (text: string) => {
    if (send(text)) setDraft("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(draft);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="chat-title"
      onClose={onClose}
      onKeyDown={onDialogKeyDown}
      className={`fixed inset-0 m-0 h-[100dvh] max-h-none w-full max-w-none flex-col rounded-none bg-surface p-0 text-foreground transition-opacity duration-150 open:flex backdrop:bg-transparent md:inset-auto md:bottom-6 md:right-6 md:h-[min(640px,calc(100dvh-3rem))] md:w-[400px] md:rounded-[14px] md:border md:border-border-strong`}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <h2 id="chat-title" className="text-base font-semibold text-foreground">{t.title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <span aria-hidden>✕</span>
        </button>
      </header>

      <div ref={listRef} onScroll={onListScroll} role="group" aria-label={t.messagesLabel} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
        {messages.length === 0 && !answer && (
          <div>
            <p className="mb-2 text-sm text-muted">{t.startersLabel}</p>
            <ul className="space-y-2">
              {t.starters.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => submit(s)}
                    disabled={busy}
                    className="min-h-11 w-full rounded-md border border-border-strong px-3 py-2 text-left text-sm text-foreground hover:bg-surface-2 disabled:opacity-60"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <p className="mb-0.5 text-xs text-muted">{m.role === "user" ? t.you : t.assistant}</p>
            {m.role === "user" ? (
              <p className="min-w-0 whitespace-pre-wrap break-words text-foreground">{m.content}</p>
            ) : (
              <ChatMarkdown source={m.content} />
            )}
          </div>
        ))}

        {answer && (
          <div className="text-sm" aria-busy="true">
            <p className="mb-0.5 text-xs text-muted">{t.assistant}</p>
            {answer.text && <ChatMarkdown source={answer.text} />}
            {answer.searching && <p className="text-muted">{t.searching}</p>}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 pb-3 pt-2">
        <p className="mb-2 text-xs text-muted">{t.disclaimer}</p>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className="min-h-11 flex-1 resize-none rounded-md border border-border-strong bg-background px-3 py-2 text-base text-foreground placeholder:text-muted md:text-sm"
          />
          <button
            type="button"
            onClick={() => submit(draft)}
            disabled={busy || draft.trim().length === 0 || draft.length > MAX_CHARS}
            aria-label={t.send}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md bg-white px-3 text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
          >
            <span aria-hidden>↑</span>
          </button>
        </div>
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </dialog>
  );
}
