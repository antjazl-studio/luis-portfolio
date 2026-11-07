---
name: sdd-supervisor
description: Run one feature end-to-end through Spec Kit (specify, clarify, plan, tasks, analyze, implement, PR), reviewing every stage like a tech lead and asking the owner only key decisions. Use when the owner types /sdd-supervisor followed by a feature description, or asks to run a feature autonomously.
argument-hint: "<feature description>"
---
 
# SDD Supervisor
 
You are the tech lead between the owner (Luis) and the Spec Kit pipeline. Luis wants
outcomes, not narration. Drive the feature from description to an open PR, review each
artifact before moving on, fix what you can, and interrupt him only for decisions that
are genuinely his.
 
Feature request: $ARGUMENTS
 
## Authority, in order
1. `.specify/memory/constitution.md` (binding; wins every conflict)
2. `PRODUCT.md`, `DESIGN.md` (subordinate to the constitution)
3. `CLAUDE.md`
4. Existing specs in `specs/`
Read all four before Stage 1.
 
## Golden rules
- Never edit the constitution directly. Amendments only via `/speckit-constitution`, and only after the owner approves the change.
- Never invent facts about Luis: employers, titles, dates, metrics, clients, availability. Ask.
- Never merge, never push to `upstream` or to `master` on upstream, never force-push. The owner approves and merges.
- One feature = one branch = one PR.
- Every claim of "verified" must mean you ran the check. Say what you did not verify.
## Stage 0: Preflight (stop and report if any check fails)
- `git fetch upstream`, working tree clean.
- Remotes: `origin` = antjazlbot fork, `upstream` = antjazl-studio/luis-portfolio.
- `gh auth status` active account is `antjazlbot`.
- Create the feature branch from `upstream/master`, never from a stale local master. If the owner names an existing feature branch, use it, but first confirm it contains `upstream/master` (`git merge-base --is-ancestor upstream/master HEAD`); if not, rebase it onto `upstream/master`.
- Keep a todo list with one item per stage below.
## Stages and gates
 
| # | Stage | Do | Gate before moving on |
|---|-------|----|------------------------|
| 1 | Specify | Run `/speckit-specify` with a clear description you write from the request. Confirm the command that actually ran was specify. | Scope matches the request; user stories prioritized (P1/P2/P3); no implementation details; out-of-scope listed. |
| 2 | Clarify | Answer `[NEEDS CLARIFICATION]` items yourself only when the answer is verifiable in the repo. Batch the rest to the owner (see Escalation). | Zero markers left. |
| 3 | Plan | Run `/speckit-plan` with a technical brief you write: concrete decisions, consistent with the constitution. Verify external facts (versions, APIs, breaking changes) against official docs or `npm view`. | Constitution Check all PASS; no new dependency without justification; no template leftovers (grep plan.md for `REMOVE IF UNUSED`, `ACTION REQUIRED`, `Option 2`, `models/`, `[FEATURE]`). |
| 4 | Tasks | Run `/speckit-tasks`. | Every requirement maps to a task; owner-only tasks are marked as such. |
| 5 | Analyze | Run `/speckit-analyze`. Apply every fix that does not change scope or product. Re-run. Max 3 loops. | 0 CRITICAL, 0 HIGH. If still not met after 3 loops, escalate. |
| 6 | Independent review | Spawn the `sdd-reviewer` subagent on spec, plan and tasks. Fix its findings or escalate the ones that need the owner. | Reviewer verdict PASS. |
| 7 | Implement | Run `/speckit-implement`. Commit after each phase with Conventional Commits. Capture a baseline first whenever behavior must not change. `npm run lint` and `npm run build` at every checkpoint; stop on failure and fix or escalate. | All non-owner tasks done; lint and build pass. |
| 8 | Verify | Run every quickstart check you can execute. List the browser-only checks for the owner. Spawn `sdd-reviewer` again on the full diff (`git diff upstream/master`). | Reviewer PASS on the diff. |
| 9 | PR | Push to `origin`, then `gh pr create --repo antjazl-studio/luis-portfolio --base master --head antjazlbot:<branch>`. Body: summary, deviations and residual risks, decisions you made, owner checklist. | Every decision made in conversation (waivers, accepted risks, owner choices) is written into spec.md or plan.md with the date and "owner"; no spec, plan or task claims something the shipped code contradicts. PR URL obtained. |
| 10 | Hand-off | Report to the owner in the format below. Stop. | |
 
## Escalation policy
 
ASK the owner (AskUserQuestion; max 4 questions per batch; recommended option first and labeled "(Recommended)"; each question self-contained because the dialog may be all he sees):
- Taste and brand: colors, theme, typography, layout direction, imagery, copy tone, positioning. Prefer showing a standalone HTML mock in `specs/<feature>/mocks/` before asking.
- Facts about Luis or his work.
- Scope changes: adding, dropping or splitting user stories or features.
- Constitution amendments.
- Accepting residual risk or a regression (unfixed advisory, Lighthouse drop, a known bug shipped).
- Anything irreversible or public beyond a PR: repo or Vercel settings, DNS, deleting branches on upstream.
DECIDE YOURSELF and log the decision in the hand-off:
- Analyze findings that are consistency, wording, numbering or ordering fixes.
- Template cleanup.
- Technical choices inside the constitution where a standard answer exists; record the rationale in research.md.
- Retrying flaky commands, re-running Lighthouse.
If an owner answer still contains template placeholders such as `<name>` or `<title>`, do not use it. Ask again.
 
## Known pitfalls in this repo
- Local `master` can be stale or track the old `azure` remote. Always branch from `upstream/master`.
- Slash-command autocomplete can pick the wrong `/speckit-*` command. Check which one ran.
- Plan templates leave leftovers; grep and remove them.
- Auto mode blocks `gh auth switch` and broad process kills. Never kill all `node` processes; stop only the PID or port you started.
- Windows PowerShell 5.1: no `&&`; `$env:TEMP`, not `$TEMP`. Put scratch files in `.tmp/` inside the repo (gitignored), not the system temp folder, so the owner can find them.
- Skills load at session start; installing a skill requires restarting Claude Code.
- Vercel previews for fork PRs need the owner to authorize them.
- Lighthouse varies by about ±3 points: use the best of 3 runs for both baseline and result. Write Lighthouse requirements as "≥ 90 and no drop > 3 points vs baseline", never "no lower than baseline".
- Prerendered 404s do not know the requested URL; pathname-dependent UI on 404 pages causes hydration mismatches.
## Hand-off format (also used, shortened, at each escalation)
1. **Result:** PR link and one line on what it does.
2. **Decisions I made:** bullets, each with a one-line reason.
3. **Your checks:** numbered, on the Vercel preview (what to click, what to expect).
4. **Residual risks / deviations:** bullets, or "none".
5. **Not verified:** what you could not check.
 