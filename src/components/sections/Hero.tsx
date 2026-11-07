"use client";

import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

const TECH_STACK = [".NET", "Angular", "Azure", "TypeScript", "Node.js"];

const LINK_CLASS =
  "inline-flex min-h-11 items-center text-accent underline underline-offset-[3px] hover:text-accent-hover";

export function Hero() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="flex min-h-svh items-start bg-background px-6 pb-16 pt-24 md:items-center md:pt-28"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-12">
        {/* Text first in reading order; the portrait follows on mobile and sits right on desktop. */}
        <div className="max-w-2xl animate-rise">
          <h1
            id="hero-title"
            className="mb-4 text-balance text-[clamp(2.5rem,5.4vw,4rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground"
          >
            {t.hero.title}
          </h1>

          <p className="mb-8 text-[clamp(1.125rem,1.9vw,1.375rem)] leading-[1.4] text-muted">
            {t.hero.subline}
          </p>

          <p className="mb-3 text-lg font-medium leading-[1.4] text-foreground">{t.hero.who}</p>

          <p className="mb-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-muted">
            {t.hero.impact}
          </p>

          <p className="mb-8 text-[0.9375rem] text-muted">{TECH_STACK.join(" · ")}</p>

          <div className="mb-6 flex flex-wrap gap-3">
            <a
              href="/Luis_Jacho_Resume.pdf"
              download="Luis_Jacho_Resume.pdf"
              className="inline-flex min-h-11 items-center rounded-[10px] bg-white px-[22px] text-[0.9375rem] font-medium text-neutral-900 transition-colors duration-150 hover:bg-zinc-200"
            >
              {t.hero.cta_cv}
            </a>
            <a
              href="#projects"
              className="inline-flex min-h-11 items-center rounded-[10px] border border-border-strong px-[22px] text-[0.9375rem] font-medium text-foreground transition-colors duration-150 hover:bg-surface"
            >
              {t.hero.cta_work}
            </a>
          </div>

          <p className="mb-6 flex flex-wrap gap-x-6 text-[0.9375rem]">
            <a href="mailto:antjazl@gmail.com" className={LINK_CLASS}>
              antjazl@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/luis-jacho-zambrano-843558139"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              LinkedIn
            </a>
          </p>

          <div className="grid gap-1.5 border-t border-border pt-5 text-sm text-muted">
            <span className="inline-flex items-center gap-2 text-foreground">
              {/* Static status dot (Principle IV). Decorative: the text carries the meaning. */}
              <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-status-available" />
              {t.hero.availability}
            </span>
            <span>{t.hero.timezone}</span>
          </div>
        </div>

        <figure className="m-0 w-full max-w-56 animate-rise justify-self-start overflow-hidden rounded-[14px] bg-surface ring-1 ring-white/[0.07] [animation-delay:80ms] md:max-w-80 md:justify-self-end">
          <div className="aspect-[4/5]">
            <Image
              src="/pic.png"
              alt={t.hero.portraitAlt}
              width={1086}
              height={1448}
              priority
              sizes="(min-width: 768px) 320px, 224px"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
