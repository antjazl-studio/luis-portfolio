"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/hooks/useLanguage";
import { useChat } from "@/hooks/useChat";
import translations from "@/lib/translations";

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
  const launcherRef = useRef<HTMLButtonElement>(null);

  // On close, focus returns to the launcher once it is rendered again (FR-004). Never on first mount.
  useEffect(() => {
    if (!open && everOpened) launcherRef.current?.focus();
  }, [open, everOpened]);

  return (
    <>
      {/* Stacked directly above WhatsAppButton (same right margin). The bottom offsets are tied to that
          component: WhatsApp is h-12 at bottom-4 (mobile) and h-14 at bottom-6 (sm+), so 16+48+12 = 76px and
          24+56+12 = 92px. If WhatsAppButton's size or offsets change, change these with them (research R7). */}
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => {
            setEverOpened(true);
            setOpen(true);
          }}
          onPointerEnter={prefetchPanel}
          onFocus={prefetchPanel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="fixed bottom-[76px] right-4 z-50 min-h-[44px] rounded-full border border-border-strong bg-surface px-4 text-sm text-foreground hover:bg-surface-2 sm:bottom-[92px] sm:right-6"
        >
          {t.launcher}
        </button>
      )}
      {everOpened && <ChatPanel open={open} onClose={() => setOpen(false)} chat={chat} />}
    </>
  );
}
