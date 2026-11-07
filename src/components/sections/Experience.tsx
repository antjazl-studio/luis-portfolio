"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";
import type { Language } from "@/context/LanguageContext";

type Entry = {
  role:     string;
  company:  string;
  start:    string;
  current:  boolean;
  period?:  string;
  location?: string;
  bullets:  string[];
};

type Translations = (typeof translations)[Language];

// Company names, years and the "Jun 2020" start are language-neutral (spec FR-010); every sentence comes
// from the shared translation table.
const buildExperience = (t: Translations): Entry[] => [
  {
    role:     t.experience.mywork.role,
    company:  "MyWork",
    start:    "Jun 2020",
    current:  true,
    location: t.experience.mywork.location,
    bullets:  t.experience.mywork.bullets,
  },
  {
    role:    t.experience.logiztik.role,
    company: "Logiztik Alliance Group",
    start:   "Oct 2019",
    current: false,
    period:  t.experience.logiztik.period,
    location: "",
    bullets: t.experience.logiztik.bullets,
  },
  {
    role:    t.experience.iess.role,
    company: "IESS — Instituto Ecuatoriano de Seguridad Social",
    start:   "2017",
    current: false,
    period:  "2017 – 2019",
    location: "",
    bullets: t.experience.iess.bullets,
  },
];

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { language, reduceMotion: reduce } = useLanguage();
  const t = translations[language];
  const experience = buildExperience(t);

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
    <section id="experience" ref={ref} className="border-t border-border bg-background py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={language}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.15 }}
          >
            <motion.h2
              {...anim(0.05)}
              className="mb-14 text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t.experience.heading}
            </motion.h2>

            <div className="relative border-l border-border pl-8 space-y-12">
              {experience.map((entry, i) => (
                <motion.div key={entry.company} {...anim(0.1 + i * 0.07)} className="relative">

                  <span
                    className={`absolute -left-[2.0625rem] top-[6px] h-[7px] w-[7px] rounded-full ring-4 ring-background ${
                      i === 0 ? "bg-foreground" : "border border-border-strong bg-background"
                    }`}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.role}</p>
                      <p className="mt-0.5 text-sm text-muted">{entry.company}</p>
                    </div>
                    <p className="shrink-0 font-mono text-xs text-muted">
                      {entry.current
                        ? `${entry.start} – ${t.experience.present}`
                        : entry.period}
                    </p>
                  </div>

                  {entry.location && (
                    <p className="mt-1 text-xs text-muted">{entry.location}</p>
                  )}

                  <ul className="mt-4 space-y-1.5">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-sm text-muted">
                        <span aria-hidden className="mt-px shrink-0 text-xs text-muted">→</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
