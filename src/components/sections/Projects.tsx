"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

type Project = {
  title:       string;
  description: string;
  tech:        string[];
  featured?:   boolean;
  comingSoon?: boolean;
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
    <section id="projects" ref={ref} className="border-t border-white/5 bg-[#0a0a0a] py-24">
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
              {t.projects.label}
            </motion.p>
            <motion.h2
              {...anim(0.05)}
              className="mb-14 bg-gradient-to-b from-white to-white/70 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl"
            >
              {t.projects.heading}
            </motion.h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((project, i) => (
                <motion.div
                  key={project.title}
                  {...anim(0.1 + i * 0.07)}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${
                    project.featured
                      ? "border-white/10 bg-white/[0.06]"
                      : "border-white/[0.07] bg-white/[0.03]"
                  }`}
                >
                  {project.featured && (
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                  )}

                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-snug text-white">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="shrink-0 rounded bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
                        {t.projects.featured}
                      </span>
                    )}
                  </div>

                  <p className="mb-5 flex-1 text-xs leading-relaxed text-zinc-400">
                    {project.description}
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {project.featured && (
                      <p className="text-xs text-neutral-700">{t.projects.case_study}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Placeholder */}
              <motion.div
                {...anim(0.1 + PROJECTS.length * 0.07)}
                className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-neutral-800 p-6 text-center"
              >
                <div>
                  <p className="text-sm text-neutral-600">{t.projects.coming_soon}</p>
                  <p className="mt-1 text-xs text-neutral-700">{t.projects.coming_soon_sub}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
