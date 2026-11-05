---
title: "How I built an AI-agent workflow for my portfolio"
summary: "How this portfolio is changed through Spec Kit, a constitution, a least-privilege bot account, pull requests, CI and human review."
date: 2026-11-05
draft: true
---

This portfolio is maintained with the help of an AI coding agent. I did not want that to mean
"the agent edits whatever it likes", so the workflow is built from a few explicit guardrails.

## Specs first, with Spec Kit

Every feature starts as a written specification instead of a prompt. I use Spec Kit, which
splits the work into steps: a specification of what the feature should do, a plan for how to
build it, a list of tasks, and only then the implementation. Each step leaves a file in the
repository, so the reasoning behind a change can be reviewed together with the change itself.

## A constitution the agent has to follow

The repository contains a constitution: a short document with the rules that every spec, plan
and change must respect. It covers things such as the technology stack, component conventions,
the visual style, and the requirement that every visible string exists in both English and
Spanish. When a plan conflicts with the constitution, the plan has to change, not the rule.

## A bot account with minimal permissions

The agent does not push to the main repository. It uses a separate bot account with the least
privileges needed. The bot works on its own fork of the repository and proposes changes through
pull requests, the same way an outside contributor would.

<!-- REVIEW: owner to confirm the exact permissions the bot account has -->

## Continuous integration

<!-- REVIEW: owner to confirm that passing lint and build is required before merging -->
Every pull request runs a workflow that installs the dependencies, runs the linter and builds
the site. A change that does not lint or build does not get merged.

## Branch protection

<!-- REVIEW: owner to confirm how branch protection is configured on the main branch -->
The main branch is protected, so changes arrive through pull requests rather than direct pushes.

## Preview deployments

<!-- REVIEW: owner to confirm how Vercel preview deployments are set up for pull requests -->
Pull requests can be previewed on Vercel before anything reaches production. This is also how
draft content, like this post, can be reviewed in a realistic environment without being public.

## A human reviews every change

None of this removes the human from the loop. I read every pull request, and I decide what gets
merged. The agent speeds up the work; the specs, the constitution, the checks and the review are
what keep it under control.
