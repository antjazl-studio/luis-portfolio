"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const { language } = useLanguage();
  const t = translations[language];

  const anim = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, delay },
  });

  return (
    <section id="contact" ref={ref} className="border-t border-white/5 bg-[#0f0f0f] py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-start">

              {/* Left */}
              <div>
                <motion.p {...anim(0)} className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
                  {t.contact.label}
                </motion.p>
                <motion.h2
                  {...anim(0.05)}
                  className="mb-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl"
                >
                  {t.contact.heading}
                </motion.h2>
                <motion.p {...anim(0.1)} className="mb-8 text-sm leading-relaxed text-zinc-400">
                  {t.contact.sub}
                </motion.p>

                <motion.div {...anim(0.15)} className="mb-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-base text-cyan-400">✉</span>
                    <a
                      href="mailto:antjazl@gmail.com"
                      className="text-sm text-zinc-400 transition-colors duration-150 hover:text-white"
                    >
                      antjazl@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-cyan-400">💼</span>
                    <a
                      href="https://linkedin.com/in/luis-jacho-zambrano-843558139"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-400 transition-colors duration-150 hover:text-white"
                    >
                      linkedin.com/in/luis-jacho-zambrano-843558139
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-cyan-400">📍</span>
                    <span className="text-sm text-zinc-400">Quito, Ecuador (GMT-5)</span>
                  </div>
                </motion.div>

                <motion.div {...anim(0.2)}>
                  <a
                    href="mailto:antjazl@gmail.com"
                    className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors duration-150 hover:bg-cyan-300"
                  >
                    {t.contact.button}
                  </a>
                </motion.div>
              </div>

              {/* Right — availability card */}
              <motion.div {...anim(0.15)} className="md:pt-[3.25rem]">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                    <span className="text-sm font-medium text-white">{t.contact.availability}</span>
                  </div>
                  <div className="space-y-2.5 text-sm text-zinc-400">
                    <p>{t.contact.open_to}</p>
                    <p>{t.contact.response}</p>
                    <p>{t.contact.timezone}</p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
