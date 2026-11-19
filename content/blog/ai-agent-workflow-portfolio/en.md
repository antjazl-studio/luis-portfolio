---
title: "Guardrails in config, not prompts: letting an AI agent work on my public portfolio"
summary: "How an AI agent works on this public portfolio without being able to push, merge or delete: a read-only bot account, deny rules, a branch ruleset, CI, previews and human review, plus the mistakes along the way."
date: 2026-11-05
---

I am moving into AI engineering, and I wanted an agent to do real work on this portfolio. The
catch: the repository is public, and merging to `master` deploys to production.

With my own credentials, an agent could push straight to `master`, force-push, delete branches
or ship half-finished content live. A prompt that asks it not to is a request, not a
guarantee. I wanted the agent to be fast and the limits to live in configuration.

*Rewritten on 2026-11-19 with the details the first version left out.*

## What an agent with my credentials could do

Every risk below has at least one control that does not depend on the agent behaving:

| Risk | Control |
|---|---|
| Push to `master` | The bot account has no push access to the main repo; a ruleset requires a pull request |
| Force-push | The ruleset blocks non-fast-forward updates; `git push --force` is denied in the agent's settings |
| Delete branches | The ruleset blocks deleting the protected branch; `gh repo delete` is denied |
| Ship unfinished content | A pull request needs one approval and a passing build; draft posts are hidden in production |
| Merge | `gh pr merge` is denied; the merge is mine |

The rest of this post is how each control was built and where it went wrong.

## A bot account that can only ask

I created a separate GitHub account, `antjazlbot`, with read-only access to the organization's
repository. It behaves like an outside contributor: it forks the repo, pushes to its fork
(`origin`) and opens pull requests against the main repo (`upstream`). GitHub confirms what
the bot can do:

```
$ gh api repos/antjazl-studio/luis-portfolio --jq .permissions
{"admin":false,"maintain":false,"pull":true,"push":false,"triage":false}
```

The limit showed up the first time I used it wrong. I tried to create the repository in the
organization while `gh` was still logged in as the bot, and the bot's token got a GraphQL
permission error: it is not allowed to create repositories there. That was the point, so I
switched to my owner account and created the repository myself.

The second surprise went the other way. The bot got "permission denied" pushing to its own
fork. I fixed it by switching accounts with `gh auth switch` and running `gh auth setup-git`.
With two accounts on one machine, every command runs as someone, and it is easy to run it as
the wrong one.

## The tool refuses identity and publishing, so I wrote that down

Claude Code's auto mode declined to run two commands on its own: `gh auth switch` ("Identity
Not Given") and `gh pr create` ("Create Public Surface"). Switching identity and publishing
something public are decisions it leaves to a human. I ran both myself with the `!` prefix,
which runs a command inside the session.

Then I turned that behavior into a policy in `.claude/settings.json`, so it is the same on
every run (trimmed):

```json
"allow": [
  "Bash(npm run lint)",
  "Bash(npm run build)",
  "Bash(git push origin:*)",
  "Bash(gh pr create:*)",
  ...
],
"deny": [
  "Bash(git push upstream:*)",
  "Bash(git push --force:*)",
  "Bash(gh pr merge:*)",
  "Bash(gh auth switch:*)",
  "Bash(gh repo delete:*)"
],
"ask": ["Edit(.specify/memory/constitution.md)"]
```

The agent can lint, build, commit, push to its own fork and open a pull request, which is how
it proposes work. It cannot push to `upstream`, force-push, merge, switch identity or delete
the repository, and it has to ask before editing the constitution.

This list only contains the commands I thought of. That is why the GitHub-side limits in the
next section matter more.

## A ruleset that protected the wrong branch

A ruleset requires a pull request with one approving review and a passing `build` check, and it
blocks force pushes and deletion. GitHub reports no bypass actors, so the rules apply to me too.
This is what the API returns (trimmed):

```json
"name": "protect-master",
"enforcement": "active",
"conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"] } },
"rules": [
  { "type": "deletion" },
  { "type": "non_fast_forward" },
  { "type": "pull_request",
    "parameters": { "required_approving_review_count": 1, ... } },
  { "type": "required_status_checks", ... }
]
```

My first ruleset did not protect `master`. Look at the condition: `~DEFAULT_BRANCH` means
"whatever the default branch is". While `chore/adopt-speckit`, the branch where I adopted Spec
Kit, was the default branch, `master` was not covered. The fix was to make `master` the
default branch.

The ruleset is named `protect-master`, but it protects the default branch, whichever that is.
A ruleset can look right and still point at the wrong branch. Read what it targets, not what
it is called.

## CI, previews and a deliberate bit of friction

Every pull request runs a GitHub Actions workflow on Node 24:

```yaml
- run: npm ci
- run: npm run lint
- run: npm run build
```

Because the bot's pull requests come from a fork, Vercel does not build them on its own. For
every bot pull request I have to authorize the deployment as the owner, and only then does
the preview build. It is friction. I keep it because the alternative is that anyone who forks
a public repository could get code built on my Vercel account.

The preview is also where drafts live. The blog hides posts marked `draft: true` only when
`VERCEL_ENV` is `production`, so previews show them. This rewrite went through the same
route: I read it in the preview before it replaced the live version.

## Specs, a constitution and a supervisor that asks only what is mine to decide

Every feature starts as a written spec, using Spec Kit: specify, clarify, plan, tasks,
analyze, implement. A constitution holds the rules every spec must follow, including that
every visible string exists in English and Spanish, and it can only be changed through its own
command.

I do not drive each step. An `sdd-supervisor` skill runs the pipeline and decides alone only
the small things. This is its escalation policy (trimmed):

```
ASK the owner:
- Taste and brand: colors, theme, typography, ...
- Facts about Luis or his work.
- Scope changes: adding, dropping or splitting user stories ...
- Constitution amendments.
- Anything irreversible or public beyond a PR: ...
DECIDE YOURSELF and log the decision in the hand-off:
- Analyze findings that are consistency, wording, numbering or ordering fixes.
```

A second agent, `sdd-reviewer`, reviews specs and diffs. It has read, search and shell tools,
and its instructions say it never edits files.

On the chat widget (feature 008) this loop paid for itself:

- The analysis report flagged 2 CRITICAL and 2 HIGH issues before any code existed. The report
  is not stored in the repository.
- It also caught a real bug outside the repo it was reviewing. My separate agent API did not
  expose `Retry-After` to cross-origin JavaScript, so the browser could not read the
  rate-limit delay. I fixed it there with `Access-Control-Expose-Headers: Retry-After`.
- Real-browser checks caught two bugs in the widget: focus escaped the dialog (in headless
  Chrome, Tab from the last control moved to the page's skip link), and the panel stayed
  invisible under React StrictMode.
- The supervisor ran 130 scripted browser checks, and Lighthouse stayed at 100/100 on mobile
  and desktop.

The first commit of the feature is at 21:42 and the pull request was merged at 23:27 (UTC-5).
That is about an hour and three quarters from first commit to merge; the thinking before the first commit is
not in the history.

## When the agent is wrong: a syntax error and a latency assumption

**A syntax error, committed.** During 008 the reviewer flagged a low-severity issue: the stream
parser dropped a final line with no trailing newline. The supervisor's first fix had a syntax
error, a string literal broken across two lines, and it committed before running lint
because its command chain was not gated on lint. Lint and the build caught it. The supervisor
reported the slip itself, fixed it and amended the commit a minute and a half later, before
anything was pushed. The broken commit never reached a remote branch. This is the real diff
between the two commits, in `src/hooks/useChat.ts`:

```diff
-  for (const event of parseSseChunk(buffer + decoder.decode() + "
-").events) apply(event);
+  const tail = parseSseChunk(`${buffer}${decoder.decode()}\n`);
+  for (const event of tail.events) apply(event);
```

Remembering to run lint is a habit. A hook would make it a rule, and I have not added that
hook yet.

**A fact the agent could not know.** The plan for the chat widget assumed answers arrive in
about 3 seconds. The real agent calls a tool for 3 to 10 seconds and then streams, and full
answers take 10 to 45 seconds. A total timeout would have cut off normal answers, so the widget
uses a 30-second idle timeout and no total timeout. I should have given the agent the real
latency before it planned.

## What I would change, and what you can copy

What I would change:

1. **Gate commits on lint with a hook** from day one, instead of trusting the agent to remember.
2. **Version helper scripts.** I had a small PowerShell helper that checked out `master`, pulled
   `upstream`, pushed the fork's `master` and deleted the merged branch. It was never committed,
   so it got lost.
3. **Give the agent real-world facts early**, such as latency, instead of letting a plan guess.

What you can copy for your own project:

- Give the agent its own account with no write access to the main repository, and let it work
  by fork and pull request.
- Put the hard limits on the platform (token permissions and a ruleset) and the habits in the
  agent's settings (allow, deny, ask). The settings only list what you thought of.
- Check which branch the ruleset targets, and test it against the branch that deploys.
- Make your merge the only path to production, and give every pull request a preview.
- Let the agent ask you only what is yours to decide: taste, facts about you and anything
  public or irreversible.

None of this stops the agent from proposing a bad change. That is what the review is for. The
agent speeds up the work; the limits, the specs and the person who merges keep it under control.
