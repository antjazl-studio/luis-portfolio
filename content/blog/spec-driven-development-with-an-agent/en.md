---
title: "Moving the arguments before the code: spec-driven development with an AI agent"
summary: "What writing specs before code changed on my chat widget: what the analysis caught before code existed, a latency guess that would have shipped, the constitution as a gate, where the process drifted, and when I would skip it."
date: 2026-11-20
draft: true
---

When I started using an AI agent on this portfolio, I prompted it directly. The code came fast.
What did not survive was the reasoning. Why a button sat where it did, why a timeout was 30
seconds, which option I had rejected: all of it lived in a chat history that disappears. And
wherever my prompt left a gap, the agent filled it with its own assumption.

So I moved the work through Spec Kit. Nothing is coded until the spec, the plan and the task
list exist as files I can read in a pull request.

My claim is that specs move the arguments to before the code, where they are cheap. I do not
claim they save time, because I did not measure that. The evidence below comes from one feature,
the chat widget, plus the places where the process itself failed. The setup around it (the bot
account, the ruleset, the previews) is in [the previous post](/blog/ai-agent-workflow-portfolio).

## SDD in 60 seconds

Spec-driven development means the feature is written down before it is built. You describe what
it must do and why, turn that into a plan and a list of tasks, check the whole set for gaps, and
only then write code. The files, not the chat, are what the agent works from and what a reviewer
reads. Where a gap would have let the agent guess, the early steps show it while fixing it still
costs one sentence.

I use [Spec Kit](https://github.com/github/spec-kit), which runs this as a series of steps. Each
step leaves something in the repository:

| Step | What it leaves |
|---|---|
| specify | `spec.md` with prioritized user stories and numbered requirements, and a quality checklist |
| clarify | the answers, written back into `spec.md` |
| plan | `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` |
| tasks | `tasks.md`, each task tied to a requirement |
| analyze | a report on screen; it is read-only and writes no file |
| implement | one commit per phase |

A separate constitution file holds the project's rules, such as the stack and bilingual parity,
and every spec and plan is checked against it. Setup and usage are in the
[official Spec Kit documentation](https://github.github.io/spec-kit/).

My repository has ten folders under `specs/` (`001` is the baseline of the site that already
existed) and 17 merged pull requests as of 2026-11-20. The analyze step writes no file, so
whatever it finds has to be fixed in the other files, or it is gone.

## What the spec stage changed on the chat widget

The widget (feature 008) talks to my separate agent API over server-sent events. Before any code
existed, the analysis report flagged 2 CRITICAL and 2 HIGH issues:

- A CSS transition where the constitution requires Framer Motion.
- `"use client"` on a component that did not need it.
- No plan for a failed lazy-load of the chat panel.
- No timeout.

The report is not in the repository, so you cannot open it. This list is my summary of what it
flagged.

A latency guess. The plan assumed answers in about 3 seconds, with a 10-second timeout. I
told the agent how the real service behaves: it calls a tool for 3 to 10 seconds, then streams,
and a full answer takes 10 to 45 seconds. The requirement changed to this:

> FR-026: The widget MUST NOT apply a total request timeout (normal answers take 10 to 45 s).
> It MUST apply an idle timeout instead: if no bytes arrive from the service for 30 seconds
> (counted from sending, and restarted on every received chunk), the request is aborted and the
> error state is shown with a distinct "took too long" message. The visitor's message is kept,
> and one action (Retry) resends it. ...

The mock agent server I used for testing changed with it. The `tool` and `ok` scenarios emit the
tool event after about 5 seconds and then stream text over about 10, and a `stall` scenario goes
silent for more than 30. In the browser checks the idle timeout fired at 30.04 seconds, and a
14-second answer was not cut off.

My reading is that, with the original plan, tests against an instant mock would likely have
passed and the first slow answer would have failed in production. I cannot prove it, because I
never built that version.

A bug in a different repository. Reading the contract for the widget, the analysis also
found that my API did not expose `Retry-After` to cross-origin JavaScript. A browser could not
read the rate-limit delay, so the countdown the spec asked for was impossible. I fixed the API
first, with `Access-Control-Expose-Headers: Retry-After`, and then built the widget.

The git history gives the shape of the day, in my local timezone (UTC-5). I switched to the feature
branch at 16:59. The spec, plan and tasks went in as one commit at 21:42, and the first code commit is
at 21:46. The pull request merged at 23:27. I cannot split the hours before 21:42 into work and
breaks, so I will not claim an effort figure for them.

## The decision the agent did not make for me

The launcher layout was a matter of taste, so the agent did not pick. It produced an HTML mock
with three options and asked me. Here is a screenshot of that file:

![Three mock layouts of a launcher button next to the WhatsApp button at 360 px: A is a round "AI" icon stacked above WhatsApp, B is a labelled "Ask about Luis" pill stacked above it, C is the pill placed beside it.](/blog/spec-driven-development/launcher-options.png)

I chose B, a labelled pill stacked above the WhatsApp button. An icon-only button is less
discoverable, and C is tight at 360 px. The choice went into the spec as FR-002 with the date.
Feature 009 later replaced the stacked buttons with a single dock, and that change got its own
spec.

## The constitution as a gate

The constitution is a short file of rules that every spec, plan and review must check. Two of its
rules did the work on 008. Principle I fixes the stack, including Framer Motion for animation.
Principle II allows `"use client"` only where a component needs interactivity. They match the
first two findings in the list above.

The parity rule is the one I would show:

> ### VI. Bilingual Parity (NON-NEGOTIABLE)
> Every user-facing string MUST exist in both English (EN) and Spanish (ES) and be served through
> the existing React Context language switcher (`LanguageContext`, `useLanguage`,
> `lib/translations.ts`). External i18n libraries MUST NOT be added. A feature is not done until
> both languages are complete. ...

Part of that rule is enforced by the type checker. The strings live in a typed object, so I
deleted one navigation key from one language while writing this post and ran `npx tsc --noEmit`:

```
src/lib/translations.ts(148,5): error TS2741: Property 'about' is
missing in type '{ experience: string; ... }' but required in
type '{ about: string; experience: string; ... }'.
```

I restored the file afterwards. Whether the translation reads well is still a human check.

The constitution also got in my way once. Principle II listed the files in `src/`, and in
feature 007 a fix needed a new hook file. Under the old wording that required an amendment.
Amendments are versioned like an API, with a Sync Impact Report at the top of the file. This
is the entry for version 1.3.0:

```
- Version change: 1.2.0 -> 1.3.0 (MINOR: materially changed
  guidance in Principle II on when the structure list needs
  an amendment; owner decision 2026-11-07, raised by PR #10
  where a new hook file would otherwise have required an
  amendment)
```

New files inside the existing folders no longer need an amendment. A new top-level folder or a
change to the layout still does.

## Where the process failed

Decisions never reached the spec. I made choices in conversation, such as accepting a risk
or picking an option, and the spec and plan did not get updated. The spec and the code drifted
apart. Feature 008 ended with a commit named "final reconciliation of spec, plan and tasks" to
fix that after the fact. The supervisor skill that runs the pipeline now has a gate before the
pull request:

> Every decision made in conversation (waivers, accepted risks, owner choices) is written into
> spec.md or plan.md with the date and "owner"; no spec, plan or task claims something the
> shipped code contradicts.

Template leftovers. The plan template leaves placeholder text behind, and an unedited plan
looks finished. A second gate, at the plan stage, greps `plan.md` for the leftover markers
(`REMOVE IF UNUSED`, `ACTION REQUIRED`, `Option 2`, `models/`, `[FEATURE]`) before moving on.

Ceremony. A full run is many steps and a lot of reading, and I have no overhead figure to
give you. For a feature with new behavior I think it is worth it. For small changes it is not.

## When I skip it, and what I would change

A copy fix or a favicon does not need a spec, and the latest favicon change on this site has no
spec folder. But I have not written down a lighter path, and feature 010, a menu bug and a page
title, still went through the whole pipeline. That is the first thing I would change.

The others:

1. Define a fast lane for trivial changes from day one.
2. Block commits until lint passes, with a hook. I have not added that hook yet.
3. Put real-world facts, such as latency and rate limits, into the spec at the start, instead of
   leaving the plan to guess and the analysis to catch it.

## What to copy

If you want to try this with an agent, three things made it work for me:

- A constitution: a short list of rules written as MUST and MUST NOT, which every spec is
  checked against. Start with a handful.
- An analyze step before implementation. Do not let the agent write code while it still has
  CRITICAL or HIGH findings, and write the fixes into the files, because the report is gone once
  you close it.
- A human who answers only two kinds of question: taste and facts about you or your system.
  Everything else the agent decides and logs.

Then decide per change whether it deserves the full run. The chat widget did. A favicon does not.
