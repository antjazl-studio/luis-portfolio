"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

const STAGGER  = 0.11;
const DURATION = 0.55;

const fadeUp = (delay: number) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: DURATION, delay: delay * STAGGER },
});

const techStack = [".NET", "Angular", "Azure", "TypeScript", "Node.js"];

export function Hero() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-[#0a0a0a] px-6 py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col-reverse items-center gap-12 md:grid md:grid-cols-2 md:gap-16 md:items-center">

        {/* ── LEFT: text + CTAs — animates on language change ── */}
        <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={language}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center text-center md:items-start md:text-left"
            >
              <motion.div {...fadeUp(0)} className="mb-7">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {t.hero.badge}
                </span>
              </motion.div>

              <motion.h1
                {...fadeUp(1)}
                className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Luis Antonio{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Jacho Zambrano
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(2)}
                className="mb-3 text-lg font-light text-slate-400 sm:text-xl"
              >
                {t.hero.subtitle}
              </motion.p>

              <motion.p
                {...fadeUp(3)}
                className="mb-6 max-w-md text-xs leading-relaxed text-slate-500"
              >
                {t.hero.impact}
              </motion.p>

              <motion.div
                {...fadeUp(4)}
                className="mb-7 flex flex-wrap justify-center gap-2 md:justify-start"
              >
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300"
                  >
                    {tech}
                  </span>
                ))}
              </motion.div>

              <motion.p
                {...fadeUp(5)}
                className="mb-9 max-w-md text-base leading-relaxed text-slate-400"
              >
                {t.hero.bio}
              </motion.p>

              <motion.div
                {...fadeUp(6)}
                className="mb-10 flex flex-wrap justify-center gap-4 md:justify-start"
              >
                <a
                  href="#projects"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500"
                >
                  {t.hero.cta_work}
                </a>
                <a
                  href="/Luis_Jacho_Resume.pdf"
                  download="Luis_Jacho_Resume.pdf"
                  className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors duration-200 hover:border-slate-400 hover:text-white"
                >
                  {t.hero.cta_cv}
                </a>
              </motion.div>

              <motion.div
                {...fadeUp(7)}
                className="flex justify-center gap-5 md:justify-start"
              >
                <a
                  href="https://linkedin.com/in/luis-jacho-zambrano-843558139"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-slate-500 transition-colors duration-200 hover:text-blue-400"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href="mailto:antjazl@gmail.com"
                  aria-label="Email"
                  className="text-slate-500 transition-colors duration-200 hover:text-blue-400"
                >
                  <EmailIcon />
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT: profile image — static, no language animation ── */}
        <motion.div {...fadeUp(1)} className="flex justify-center">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-3xl bg-cyan-400/[0.12] blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-72 w-56 overflow-hidden rounded-2xl ring-1 ring-white/[0.07] sm:h-80 sm:w-64 md:h-96 md:w-80"
            >
              <Image
                src="/pic.png"
                alt="Luis Antonio Jacho Zambrano"
                fill
                className="object-cover object-top"
                priority
              />
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
