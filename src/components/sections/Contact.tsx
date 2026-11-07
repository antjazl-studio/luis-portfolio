"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

const LINK_CLASS =
  "inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-[3px] transition-colors duration-150 hover:text-accent-hover";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const { language, reduceMotion: reduce } = useLanguage();
  const t = translations[language];

  // Reduced motion: no entrance animation at all, content is simply present.
  const anim = (delay = 0) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial:    { opacity: 0, y: 16 },
          animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
          transition: { duration: 0.5, delay },
        };

  return (
    <section id="contact" ref={ref} className="border-t border-border bg-background py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={language}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.15 }}
          >
            <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-start">

              {/* Left */}
              <div>
                <motion.h2
                  {...anim(0.05)}
                  className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl"
                >
                  {t.contact.heading}
                </motion.h2>
                <motion.p {...anim(0.1)} className="mb-8 text-sm leading-relaxed text-muted">
                  {t.contact.sub}
                </motion.p>

                <motion.div {...anim(0.15)} className="mb-8 flex flex-col">
                  <a href="mailto:antjazl@gmail.com" className={LINK_CLASS}>
                    antjazl@gmail.com
                  </a>
                  <a
                    href="https://linkedin.com/in/luis-jacho-zambrano-843558139"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                  >
                    linkedin.com/in/luis-jacho-zambrano-843558139
                  </a>
                  <span className="inline-flex min-h-11 items-center text-sm text-muted">
                    {t.contact.location}
                  </span>
                </motion.div>

                <motion.div {...anim(0.2)}>
                  <a
                    href="mailto:antjazl@gmail.com"
                    className="inline-flex min-h-11 items-center rounded-[10px] bg-white px-[22px] text-[0.9375rem] font-medium text-neutral-900 transition-colors duration-150 hover:bg-zinc-200"
                  >
                    {t.contact.button}
                  </a>
                </motion.div>
              </div>

              {/* Right: availability panel */}
              <motion.div {...anim(0.15)}>
                <div className="rounded-[10px] border border-border bg-surface p-6">
                  <div className="mb-5 flex items-center gap-2">
                    {/* Static status dot (Principle IV). Decorative: the text carries the meaning. */}
                    <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-status-available" />
                    <span className="text-sm font-medium text-foreground">{t.contact.availability}</span>
                  </div>
                  <div className="space-y-2.5 text-sm text-muted">
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
