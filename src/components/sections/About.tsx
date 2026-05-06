"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

export function About() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const { language } = useLanguage();
  const t = translations[language];

  const anim = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.5, delay },
  });

  const STATS = [
    { value: "8+",   label: t.about.stat1_label },
    { value: "30k+", label: t.about.stat2_label },
    { value: "1",    label: t.about.stat3_label },
  ];

  return (
    <section id="about" ref={ref} className="border-t border-white/5 bg-[#0f0f0f] py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-start">

              {/* Left */}
              <div>
                <motion.p {...anim(0)} className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
                  {t.about.label}
                </motion.p>
                <motion.h2
                  {...anim(0.05)}
                  className="mb-8 bg-gradient-to-b from-white to-white/70 bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl"
                >
                  {t.about.heading}
                </motion.h2>

                <div className="space-y-4">
                  <motion.p {...anim(0.1)} className="text-sm leading-relaxed text-zinc-400">{t.about.p1}</motion.p>
                  <motion.p {...anim(0.15)} className="text-sm leading-relaxed text-zinc-400">{t.about.p2}</motion.p>
                  <motion.p {...anim(0.2)} className="text-sm leading-relaxed text-zinc-400">{t.about.p3}</motion.p>
                </div>

                <motion.div {...anim(0.25)} className="mt-8">
                  <span className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400">
                    <AzureIcon />
                    {t.about.azure_badge}
                  </span>
                </motion.div>
              </div>

              {/* Right — stat cards */}
              <div className="flex flex-col gap-4">
                {STATS.map(({ value, label }, i) => (
                  <motion.div
                    key={label}
                    {...anim(0.1 + i * 0.08)}
                    className="rounded-xl border border-white/10 bg-white/5 p-6"
                  >
                    <p className="mb-1 text-5xl font-bold text-cyan-400">{value}</p>
                    <p className="text-sm uppercase tracking-wider text-zinc-500">{label}</p>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function AzureIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 96 96" fill="none" aria-hidden>
      <defs>
        <linearGradient id="az-a" x1="0.863" y1="53.578" x2="79.582" y2="27.43" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#114a8b" />
          <stop offset="1" stopColor="#0669bc" />
        </linearGradient>
        <linearGradient id="az-b" x1="41.371" y1="47.566" x2="52.503" y2="51.189" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopOpacity=".3" />
          <stop offset=".071" stopOpacity=".2" />
          <stop offset=".321" stopOpacity=".1" />
          <stop offset=".623" stopOpacity=".05" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="az-c" x1="33.386" y1="21.371" x2="52.942" y2="84.667" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3ccbf4" />
          <stop offset="1" stopColor="#2892df" />
        </linearGradient>
      </defs>
      <path d="M33.338 6.544h26.038L31.666 89.456a4.167 4.167 0 0 1-3.946 2.8H8.663a4.167 4.167 0 0 1-3.942-5.533l25-73.56a4.167 4.167 0 0 1 3.617-2.619z" fill="url(#az-a)" />
      <path d="M71.175 60.226H31.666l-1.4 9.282 30.317 19.948a8.333 8.333 0 0 0 4.633 1.8h15.983z" fill="url(#az-b)" />
      <path d="M33.338 6.544a4.12 4.12 0 0 0-3.625 2.662L4.748 82.659a4.167 4.167 0 0 0 3.915 5.597H28.8a4.481 4.481 0 0 0 3.44-2.8l4.928-14.514 17.606 16.3a4.267 4.267 0 0 0 2.662.958h23.24L71.175 60.226l-26.38.006L59.376 6.544z" fill="url(#az-c)" />
    </svg>
  );
}
