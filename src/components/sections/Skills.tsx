"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

const PRIMARY_SKILLS = [
  { category: "Backend",        items: ["C#", ".NET Core", ".NET Framework", "REST APIs", "Microservices", "Azure Functions"] },
  { category: "Frontend",       items: ["Angular", "TypeScript", "JavaScript"] },
  { category: "Cloud & DevOps", items: ["Microsoft Azure", "Azure DevOps", "Docker", "CI/CD", "App Services"] },
  { category: "Databases",      items: ["SQL Server", "PostgreSQL"] },
  { category: "Tools & Methods",items: ["Git", "Agile/Scrum", "Layered Architecture"] },
];

const SECONDARY_SKILLS = ["React", "Node.js", "MongoDB", "MySQL", "Power BI"];

const SEPARATOR = " · ";

export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
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
              {PRIMARY_SKILLS.map((group, i) => (
                <motion.div
                  key={group.category}
                  {...anim(0.1 + i * 0.06)}
                  className="grid gap-1 md:grid-cols-[12rem_1fr] md:gap-8"
                >
                  <dt className="text-sm font-medium text-foreground">{group.category}</dt>
                  <dd className="text-sm leading-relaxed text-muted">
                    {group.items.join(SEPARATOR)}
                  </dd>
                </motion.div>
              ))}

              <motion.div
                {...anim(0.1 + PRIMARY_SKILLS.length * 0.06)}
                className="grid gap-1 md:grid-cols-[12rem_1fr] md:gap-8"
              >
                <dt className="text-sm font-medium text-muted">{t.skills.also}</dt>
                <dd className="text-sm leading-relaxed text-muted">
                  {SECONDARY_SKILLS.join(SEPARATOR)}
                </dd>
              </motion.div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
