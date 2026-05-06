"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const MESSAGES = {
  en: "Hi Luis! I saw your portfolio and I'd like to talk.",
  es: "Hola Luis! Vi tu portafolio y me gustaría conversar.",
};

const TOOLTIP = {
  en: "Chat on WhatsApp",
  es: "Chatea por WhatsApp",
};

export function WhatsAppButton() {
  const { language } = useLanguage();
  const [hovered, setHovered] = useState(false);

  const href = `https://wa.me/593960138279?text=${encodeURIComponent(MESSAGES[language])}`;

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 sm:bottom-6 sm:right-6"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 2, ease: "easeOut" }}
    >
      {/* Tooltip — desktop only */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="hidden whitespace-nowrap rounded-full border border-white/10 bg-neutral-900 px-3 py-1.5 text-sm text-white sm:block"
          >
            {TOOLTIP[language]}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Button wrapper — pulse ring + button */}
      <div className="relative">
        {/* Idle pulse ring */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "#25D366" }}
          animate={{ scale: [1, 1.45], opacity: [0.45, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 2.5, ease: "easeOut" }}
        />

        {/* Button */}
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={TOOLTIP[language]}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg shadow-black/40 sm:h-14 sm:w-14"
          style={{ backgroundColor: "#25D366" }}
        >
          <WhatsAppIcon />
        </motion.a>
      </div>
    </motion.div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 sm:h-7 sm:w-7"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
