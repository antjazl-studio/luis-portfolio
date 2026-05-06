"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const SKILLS = [
  { category: "Backend",        items: ["C#", ".NET Core", ".NET Framework", "REST APIs", "Microservices", "Azure Functions", "Node.js"] },
  { category: "Frontend",       items: ["Angular", "TypeScript", "JavaScript", "React", "Tailwind CSS"] },
  { category: "Cloud & DevOps", items: ["Microsoft Azure", "Azure DevOps", "Docker", "CI/CD", "App Services"] },
  { category: "Databases",      items: ["SQL Server", "PostgreSQL", "MySQL", "MongoDB"] },
  { category: "Tools & Methods",items: ["Git", "Agile/Scrum", "Power BI", "Layered Architecture"] },
];

export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const anim = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, delay },
  });

  return (
    <section
      id="skills"
      ref={ref}
      className="border-t border-white/5 bg-[#0f0f0f] py-24"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize:  "32px 32px",
      }}
    >
      <div className="relative mx-auto max-w-6xl px-6">

        <motion.p {...anim(0)} className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
          Skills
        </motion.p>
        <motion.h2
          {...anim(0.05)}
          className="mb-14 bg-gradient-to-b from-white to-white/70 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl"
        >
          What I work with
        </motion.h2>

        <div className="space-y-10">
          {SKILLS.map((group, i) => (
            <motion.div key={group.category} {...anim(0.1 + i * 0.06)}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-400">
                {group.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <span
                    key={skill}
                    className="cursor-default rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-400 transition-all duration-150 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-neutral-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
