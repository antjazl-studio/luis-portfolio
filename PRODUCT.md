# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** US recruiters and hiring managers filling senior remote roles. Typical visit: under 60 seconds on a laptop, deciding whether to reach out (CV download, email, LinkedIn, WhatsApp).

**Secondary:** direct clients looking for consulting or contract engineering. They care about nearshore fit: Quito, UTC−5 year-round: fully overlapping US Eastern and Central business hours, and fluent in English and Spanish.

Spanish-speaking visitors (Ecuador and Latin America) are served by the EN/ES switch; they are not the primary audience.

## Product Purpose

Personal portfolio of Luis Antonio Jacho Zambrano that lets a senior-hire decision-maker verify, quickly, that he is a senior .NET and Azure engineer with real production experience, and then contact him. Success is a visitor who reaches out or downloads the CV after a short visit. The blog is a secondary surface that shows how he works with AI agents.

## Positioning

"Senior .NET & Azure engineer. Nine years shipping for US teams — now building AI agents."

Two claims a neighboring portfolio could not truthfully copy:

1. **Production scale:** the MyWork platform, 30,000+ users.
2. **Building with AI agents in public:** this repository is itself the evidence (spec-driven development, a constitution, pull requests from a least-privilege bot account, human review before merge).

For consulting: nearshore in Quito, UTC−5 year-round: fully overlapping US Eastern and Central business hours; fluent English and Spanish.

## Operating Context

- Career starts in 2017: use "9 years" everywhere (not "8+", which still appears in the current code and constitution and must be corrected through normal copy work).
- Stack in use: Next.js App Router, TypeScript, Tailwind CSS, Framer Motion. Bilingual through the project's own React context (EN/ES), no i18n library.
- The repository follows GitHub Spec Kit. `.specify/memory/constitution.md` governs design and code; it can only be amended through `/speckit-constitution`.
- Contact channels on the site: email, LinkedIn, a floating WhatsApp button, CV download (`public/Luis_Jacho_Resume.pdf`).

## Capabilities and Constraints

- Sections today: Hero, About, Experience, Skills, Projects, Contact, plus a native blog (`/blog`, Markdown in `content/blog`, drafts hidden only in production).
- Every visible string exists in EN and ES; a feature is not done until both are complete.
- Constraints from the constitution that currently bind visual work and are not changed by this file: dark-only theme through CSS variables, accent used only for links and focus rings, neutral CTAs, banned decoration (glows, gradient text, frosted cards, tinted pills, glow overlays), no UI-kit or duplicate-purpose dependencies, no external i18n.
- **Open conflict to resolve before any visual work:** the owner's stated palette (below) and the undecided dark/light theme differ from constitution v1.0.1 (dark-only; `--background #0d1117`, `--accent #0078d4`). Changing them requires a `/speckit-constitution` amendment first.
- Lighthouse Performance and Accessibility on the home page must stay at or above 90.

## Brand Commitments

Stated by the owner as binding:

- **Tone:** calm, precise, senior.
- **Avoid:** flashy, junior-portfolio, template or AI-generated look, salesy copy, clutter, attention-seeking animation.
- **Palette:** Ink Black `#050505`, Paper White `#FFFFFF`, Cornflower Blue `#548CFF` as an accent, used sparingly.
- **Theme:** undecided. After PRODUCT.md and DESIGN.md exist, the hero is to be mocked in dark and in light for comparison.
- **Name and identity:** Luis Antonio Jacho Zambrano, Senior Full Stack Developer (.NET, Angular, Azure), Quito, Ecuador.

## Evidence on Hand

- MyWork platform with 30,000+ users (owner-provided fact; also in the site copy).
- Azure Developer Associate certification (2026).
- Nine years of experience, starting 2017.
- One published blog post: `content/blog/ai-agent-workflow-portfolio` (EN and ES).
- CV PDF at `public/Luis_Jacho_Resume.pdf`; portrait at `public/pic.png`.
- The repository history and specs under `specs/` document the AI-agent workflow.

**Absent, and must not be fabricated or implied:** case studies, testimonials, client logos or names beyond what the owner supplies, additional blog posts, metrics other than those above. The design must not suggest more content than exists (no empty "latest posts" grids, no placeholder galleries).

## Product Principles

1. **Verify in under a minute.** The first screen must state who Luis is and the strongest proof; everything else supports a quick decision to reach out.
2. **Proof over claims.** Prefer concrete evidence (production scale, the public repository) to adjectives; no salesy copy.
3. **Honest scope.** Show only the content that exists; never imply a larger body of work than the one post and the listed experience.
4. **Calm seniority.** Restraint is the brand; motion and decoration must earn their place.
5. **Bilingual parity.** EN and ES are equal; nothing ships in one language only.

## Accessibility & Inclusion

- WCAG AA contrast for text and UI.
- Visible focus states on every interactive element.
- `prefers-reduced-motion` respected for all animation.
- Semantic landmarks and alt text on images; usable at 360px width without horizontal overflow.
