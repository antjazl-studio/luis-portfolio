"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/hooks/useLanguage";
import { useChat } from "@/hooks/useChat";
import translations from "@/lib/translations";
import { isChatAvailable } from "@/lib/chatStream";
import { WhatsAppButton } from "./WhatsAppButton";

// Lazy: the panel (and react-markdown usage) loads only after the first open (SC-004, FR-001).
const ChatPanel = dynamic(() => import("./ChatPanel").then((m) => m.ChatPanel), { ssr: false });
const prefetchPanel = () => {
  void import("./ChatPanel");
};

export function ChatWidget() {
  const { language } = useLanguage();
  const t = translations[language].chat;
  const chat = useChat();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [available, setAvailable] = useState(true);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // On close, focus returns to the launcher once it is rendered again (FR-004). Never on first mount.
  useEffect(() => {
    if (!open && everOpened) launcherRef.current?.focus();
  }, [open, everOpened]);

  return (
    <>
      {/* One dock, two segments (spec 009, owner decision 2026-11-17): the assistant leads, WhatsApp is the
          icon-only segment. Each segment carries its own outer radius so focus outlines are never clipped.
          Below md the assistant shows a short label; from md it reads as an input-style field. The hidden
          spans are display:none, so the accessible name always equals the visible text. */}
      {!open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-12 items-stretch rounded-full border border-border-strong bg-surface sm:bottom-6 sm:right-6 sm:h-14">
          <button
            ref={launcherRef}
            type="button"
            onClick={() => {
              // Read the hostname in the click handler, never during render (hydration safety, FR-018).
              setAvailable(isChatAvailable(window.location.hostname));
              setEverOpened(true);
              setOpen(true);
            }}
            onPointerEnter={prefetchPanel}
            onFocus={prefetchPanel}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-l-full px-4 text-sm font-medium text-foreground hover:bg-surface-2 focus-visible:outline-offset-[-2px] md:min-w-[300px] md:gap-3 md:px-[18px]"
          >
            <SparkleIcon />
            <span className="md:hidden">{t.launcher}</span>
            <span className="hidden font-normal text-muted md:inline">{t.launcherInput}</span>{" "}
            <span className="ml-auto hidden rounded-md border border-border px-2 py-0.5 text-xs font-normal text-muted md:inline-flex">
              {t.launcherHint}
            </span>
          </button>
          <span aria-hidden className="w-px self-stretch bg-border-strong" />
          <WhatsAppButton />
        </div>
      )}
      {everOpened && <ChatPanel open={open} onClose={() => setOpen(false)} chat={chat} available={available} />}
    </>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="h-5 w-5 flex-none" aria-hidden>
      <path d="M12 3.5l1.7 5.1 5.1 1.7-5.1 1.7L12 17.1l-1.7-5.1-5.1-1.7 5.1-1.7z M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </svg>
  );
}
