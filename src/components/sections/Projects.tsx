"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

type Project = {
  title:     string;
  description: string;
  tech:      string[];
  featured?: boolean;
};

const PROJECTS: Project[] = [
  {
    title:       "MyWork — Workforce Management Platform",
    description: "Enterprise platform managing daily operations for 30,000+ field workers. Built with .NET, Angular, and Azure from the ground up.",
    tech:        [".NET Core", "Angular", "Azure", "SQL Server", "CI/CD"],
    featured:    true,
  },
  {
    title:       "Azure Functions Migration",
    description: "Migrated a monolithic .NET Framework app to isolated Azure Functions model with zero downtime deployment.",
    tech:        ["Azure Functions", ".NET 8", "Docker", "Azure DevOps"],
  },
  {
    title:       "Dynamic Forms Engine",
    description: "Built a configurable form engine allowing non-technical teams to create operational workflows — DVIR inspections, checklists, and field reports.",
    tech:        ["Angular", "TypeScript", ".NET", "SQL Server"],
  },
];

export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { language } = useLanguage();
  const t = translations[language];

  const anim = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, delay },
  });

  return (
    <section id="projects" ref={ref} className="border-t border-border bg-background py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.h2
              {...anim(0.05)}
              className="mb-14 text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {t.projects.heading}
            </motion.h2>

            {/* Flat, non-interactive panels: no hover lift, shadow or accent. */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((project, i) => (
                <motion.div
                  key={project.title}
                  {...anim(0.1 + i * 0.07)}
                  className="flex flex-col rounded-[10px] border border-border bg-surface p-6"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="shrink-0 text-xs text-muted">{t.projects.featured}</span>
                    )}
                  </div>

                  <p className="mb-5 flex-1 text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>

                  <p className="text-xs text-muted">{project.tech.join(" · ")}</p>
                </motion.div>
              ))}

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
