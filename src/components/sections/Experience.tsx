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

const buildExperience = (t: Translations): Entry[] => [
  {
    role:     "Senior Full Stack Consultant",
    company:  "MyWork",
    start:    "Jun 2020",
    current:  true,
    location: "Quito, Ecuador (Remote)",
    bullets: [
      "Led architectural decisions for workforce management platform (.NET + Angular + Azure), 30,000+ active users",
      "Designed REST APIs and Azure Functions using the isolated worker model",
      "Implemented Azure autoscaling policies, eliminating peak-load performance issues",
      "CI/CD pipelines with deployment slot swapping, cutting release downtime ~60%",
      "Optimized SQL Server schemas for a high-traffic multi-tenant system",
      "Mentored a 4-person dev team through code reviews and pair programming",
    ],
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
    role:    ".NET Developer",
    company: "IESS — Instituto Ecuatoriano de Seguridad Social",
    start:   "2017",
    current: false,
    period:  "2017 – 2019",
    location: "",
    bullets: [
      "AS400 and legacy system integrations with .NET Framework",
      "Government-scale backend development and maintenance",
    ],
  },
];

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { language } = useLanguage();
  const t = translations[language];
  const experience = buildExperience(t);

  const anim = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, delay },
  });

  return (
    <section id="experience" ref={ref} className="border-t border-white/5 bg-[#0a0a0a] py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.p {...anim(0)} className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
              {t.experience.label}
            </motion.p>
            <motion.h2
              {...anim(0.05)}
              className="mb-14 bg-gradient-to-b from-white to-white/70 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl"
            >
              {t.experience.heading}
            </motion.h2>

            <div className="relative border-l border-neutral-800 pl-8 space-y-12">
              {experience.map((entry, i) => (
                <motion.div key={entry.company} {...anim(0.1 + i * 0.07)} className="relative">

                  {i === 0 && (
                    <div className="absolute -left-8 top-0 h-full w-0.5 bg-cyan-400/40" />
                  )}

                  <span
                    className={`absolute -left-[2.0625rem] top-[6px] h-[7px] w-[7px] rounded-full ring-4 ring-[#0a0a0a] ${
                      i === 0 ? "bg-cyan-400" : "border border-neutral-700 bg-neutral-900"
                    }`}
                    style={i === 0 ? { boxShadow: "0 0 8px rgba(34,211,238,0.55)" } : {}}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{entry.role}</p>
                      <p className="mt-0.5 text-sm text-cyan-400">{entry.company}</p>
                    </div>
                    <p className="shrink-0 font-mono text-xs text-zinc-600">
                      {entry.current
                        ? `${entry.start} – ${t.experience.present}`
                        : entry.period}
                    </p>
                  </div>

                  {entry.location && (
                    <p className="mt-1 text-xs text-neutral-600">{entry.location}</p>
                  )}

                  <ul className="mt-4 space-y-1.5">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-sm text-zinc-400">
                        <span className="mt-px shrink-0 text-xs text-cyan-400/70">→</span>
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
