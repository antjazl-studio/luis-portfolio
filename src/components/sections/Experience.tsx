"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type Entry = {
  role:     string;
  company:  string;
  period:   string;
  location?: string;
  bullets:  string[];
  current?: boolean;
};

const EXPERIENCE: Entry[] = [
  {
    role:     "Senior Full Stack Consultant",
    company:  "MyWork",
    period:   "Jun 2020 – Present",
    location: "Quito, Ecuador (Remote)",
    current:  true,
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
    role:    "Full Stack Developer",
    company: "Previous Role",
    period:  "2019 – 2020",
    bullets: [
      ".NET and Angular development for enterprise clients",
      "SQL Server database design and optimization",
    ],
  },
  {
    role:    ".NET Developer",
    company: "IESS — Instituto Ecuatoriano de Seguridad Social",
    period:  "2017 – 2019",
    bullets: [
      "AS400 and legacy system integrations with .NET Framework",
      "Government-scale backend development and maintenance",
    ],
  },
];

export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const anim = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, delay },
  });

  return (
    <section id="experience" ref={ref} className="border-t border-white/5 bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-6xl px-6">

        <motion.p {...anim(0)} className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
          Experience
        </motion.p>
        <motion.h2
          {...anim(0.05)}
          className="mb-14 bg-gradient-to-b from-white to-white/70 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl"
        >
          Where I&apos;ve worked
        </motion.h2>

        <div className="relative border-l border-neutral-800 pl-8 space-y-12">
          {EXPERIENCE.map((entry, i) => (
            <motion.div key={entry.company} {...anim(0.1 + i * 0.07)} className="relative">

              {entry.current && (
                <div className="absolute -left-8 top-0 h-full w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />
              )}

              <span
                className={`absolute -left-[2.0625rem] top-[7px] h-[7px] w-[7px] rounded-full ring-4 ring-[#0a0a0a] ${
                  entry.current ? "bg-cyan-400" : "border border-neutral-700 bg-neutral-900"
                }`}
                style={entry.current ? { boxShadow: "0 0 8px rgba(34,211,238,0.55)" } : undefined}
              />

              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white">{entry.role}</p>
                  <p className="mt-0.5 text-sm text-cyan-400">{entry.company}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-zinc-600">{entry.period}</p>
                  {entry.location && (
                    <p className="mt-0.5 text-xs text-neutral-700">{entry.location}</p>
                  )}
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {entry.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-sm text-zinc-400">
                    <span className="mt-px shrink-0 text-xs text-cyan-400/70">→</span>
                    {bullet}
                  </li>
                ))}
              </ul>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
