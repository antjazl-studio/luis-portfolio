"use client";

import { useEffect, useRef, type KeyboardEvent, type UIEvent } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ChatErrorKind, useChat } from "@/hooks/useChat";
import translations from "@/lib/translations";
import { MAX_CHARS } from "@/lib/chatStream";
import { ChatMarkdown } from "./ChatMarkdown";

type ChatState = ReturnType<typeof useChat>;

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
  chat: ChatState;
  /** False on any site address other than production and local development (FR-018). */
  available: boolean;
};

// Same contact targets the rest of the site already uses (Footer, WhatsAppButton).
const CONTACT_LINKS = {
  email: "mailto:antjazl@gmail.com",
  linkedin: "https://linkedin.com/in/luis-jacho-zambrano-843558139",
  whatsapp: "https://wa.me/593960138279",
};
const linkClass = "text-accent underline underline-offset-[3px] hover:text-accent-hover";
const secondaryButton =
  "min-h-11 rounded-md border border-border-strong px-3 text-sm text-foreground hover:bg-surface-2";

export function ChatPanel({ open, onClose, chat, available }: ChatPanelProps) {
  const { language } = useLanguage();
  const a11y = translations[language].a11y;
  const t = translations[language].chat;
  const { messages, status, error, answer, secondsLeft, waitSeconds, draft, setDraft, canRetry, send, retry, startNewConversation } = chat;
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
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
        // Unavailable view has no input: focus goes to the close control.
        (inputRef.current ?? closeRef.current)?.focus();
      }
      // Not cancelled in a cleanup: StrictMode re-runs this effect and would otherwise leave opacity at 0.
      requestAnimationFrame(() => {
        dialog.style.opacity = "1";
      });
      return;
    }
    if (dialog.open) dialog.close();
  }, [open]);

  // Explicit Tab wrap-around: focus never leaves the panel, whatever the browser does at the dialog edge.
  const onDialogKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), textarea:not([disabled]), a[href]"),
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
  }, [messages, answer, error, status]);
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
  const full = status === "full";
  const waiting = status === "rate-limited";
  const overLimit = draft.length > MAX_CHARS;
  const canSend = !busy && !full && !waiting && draft.trim().length > 0 && !overLimit;

  const submit = (text: string, fromInput: boolean) => {
    if (send(text) && fromInput) setDraft("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(draft, true);
    }
  };

  const errorText: Record<ChatErrorKind, string> = {
    invalid: t.invalid,
    budget: t.budget,
    unavailable: t.unavailable,
    incomplete: t.incomplete,
    empty: t.emptyAnswer,
    timeout: t.timedOut,
  };
  const partialShown = error === "incomplete" && last?.role === "assistant";
  const showContacts = error === "budget" || error === "unavailable";
  const rateText = t.rateLimited.replace("{seconds}", String(secondsLeft));
  const rateAnnounce = t.rateLimited.replace("{seconds}", String(waitSeconds));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="chat-title"
      onClose={onClose}
      onKeyDown={onDialogKeyDown}
      className="fixed inset-0 m-0 h-[100dvh] max-h-none w-full max-w-none flex-col rounded-none bg-surface p-0 text-foreground transition-opacity duration-150 open:flex backdrop:bg-transparent md:inset-auto md:bottom-6 md:right-6 md:h-[min(640px,calc(100dvh-3rem))] md:w-[400px] md:rounded-[14px] md:border md:border-border-strong"
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <h2 id="chat-title" className="text-base font-semibold text-foreground">{t.title}</h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <span aria-hidden>✕</span>
        </button>
      </header>

      {!available ? (
        <p className="px-4 py-6 text-sm text-foreground">{t.unavailableHere}</p>
      ) : (
        <>
      <div ref={listRef} onScroll={onListScroll} role="group" aria-label={t.messagesLabel} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
        {messages.length === 0 && !answer && (
          <div>
            <p className="mb-2 text-sm text-muted">{t.startersLabel}</p>
            <ul className="space-y-2">
              {t.starters.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => submit(s, false)}
                    disabled={busy || waiting}
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
              <>
                <ChatMarkdown source={m.content} />
                {m.incomplete && <p className="mt-1 text-xs text-muted">{t.incomplete}</p>}
              </>
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

        {waiting && (
          <div className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
            {/* The ticking number is visual only; assistive tech gets one alert with the initial wait. */}
            <p aria-hidden>{rateText}</p>
            <p role="alert" className="sr-only">{rateAnnounce}</p>
          </div>
        )}

        {error && !waiting && (
          <div role="alert" className="space-y-2 rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
            {/* An incomplete answer already carries its own note under the partial text. */}
            <p className={partialShown ? "sr-only" : undefined}>{errorText[error]}</p>
            {showContacts && (
              <p className="flex flex-wrap gap-x-4 gap-y-1">
                <a href={CONTACT_LINKS.email} className={linkClass}>{a11y.email}</a>
                <a href={CONTACT_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>{a11y.linkedin}</a>
                <a href={CONTACT_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp</a>
              </p>
            )}
          </div>
        )}

        {canRetry && !waiting && (
          <button type="button" onClick={retry} className={secondaryButton}>
            {t.retry}
          </button>
        )}

        {full && (
          <div className="space-y-2 rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
            <p role="alert">{t.limitReached}</p>
            <button type="button" onClick={startNewConversation} className={secondaryButton}>
              {t.newConversation}
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 pb-3 pt-2">
        {messages.length > 0 && !full && (
          <button type="button" onClick={startNewConversation} className="mb-1 min-h-11 text-sm text-muted underline underline-offset-[3px] hover:text-foreground">
            {t.newConversation}
          </button>
        )}
        <p className="mb-2 text-xs text-muted">{t.disclaimer}</p>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={full}
            rows={2}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            aria-describedby="chat-counter"
            aria-invalid={overLimit}
            className="min-h-11 flex-1 resize-none rounded-md border border-border-strong bg-background px-3 py-2 text-base text-foreground placeholder:text-muted disabled:opacity-60 md:text-sm"
          />
          <button
            type="button"
            onClick={() => submit(draft, true)}
            disabled={!canSend}
            aria-label={t.send}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md bg-white px-3 text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
          >
            <span aria-hidden>↑</span>
          </button>
        </div>
        <div id="chat-counter" className="mt-1 flex justify-between gap-2 text-xs">
          <span className={overLimit ? "text-foreground" : "text-muted"}>
            {overLimit ? t.overLimit.replace("{max}", String(MAX_CHARS)) : ""}
          </span>
          <span className="shrink-0 text-muted">
            {t.counter.replace("{used}", String(draft.length)).replace("{max}", String(MAX_CHARS))}
          </span>
        </div>
      </div>

        </>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </dialog>
  );
}
