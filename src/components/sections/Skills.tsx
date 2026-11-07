"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

const SEPARATOR = " · ";

export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { language, reduceMotion: reduce } = useLanguage();
  const t = translations[language];
  const groups = [
    t.skills.groups.backend,
    t.skills.groups.frontend,
    t.skills.groups.cloud,
    t.skills.groups.databases,
    t.skills.groups.tools,
  ];

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
    <section id="skills" ref={ref} className="border-t border-border bg-background py-24">
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
              {t.skills.heading}
            </motion.h2>

            <dl className="space-y-6">
              {groups.map((group, i) => (
                <motion.div
                  key={group.name}
                  {...anim(0.1 + i * 0.06)}
                  className="grid gap-1 md:grid-cols-[12rem_1fr] md:gap-8"
                >
                  <dt className="text-sm font-medium text-foreground">{group.name}</dt>
                  <dd className="text-sm leading-relaxed text-muted">
                    {group.items.join(SEPARATOR)}
                  </dd>
                </motion.div>
              ))}

              <motion.div
                {...anim(0.1 + groups.length * 0.06)}
                className="grid gap-1 md:grid-cols-[12rem_1fr] md:gap-8"
              >
                <dt className="text-sm font-medium text-muted">{t.skills.also}</dt>
                <dd className="text-sm leading-relaxed text-muted">
                  {t.skills.secondary.join(SEPARATOR)}
                </dd>
              </motion.div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
