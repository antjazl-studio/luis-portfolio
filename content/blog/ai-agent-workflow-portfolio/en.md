---
title: "How I built an AI-agent workflow for my portfolio"
summary: "How this portfolio is changed through Spec Kit, a constitution, a least-privilege bot account, pull requests, CI and human review."
date: 2026-11-05
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

## A bot account with no access to the main repository

The agent does not push to the main repository. It uses a separate bot account that has no
access to it at all. Because the repository is public, the bot forks it, pushes its work to its
own fork and opens a pull request, the same way any outside contributor would.

## Continuous integration

Every pull request runs a GitHub Actions workflow that installs the dependencies with `npm ci`,
runs the linter and builds the site. It has to pass before a pull request can be merged.

## Branch protection

A GitHub ruleset on the main branch requires a pull request with one approving review and
requires the build check to pass. It also blocks force pushes and branch deletions, and its
bypass list is empty, so the rules apply to everyone, including me.

## Preview deployments

Every pull request gets a preview deployment on Vercel. Because the bot's pull requests come
from a fork, I have to authorize each deployment first; that is Vercel's fork protection at
work. Draft content, like this post, is visible only in previews and never in production, so I
can review it in a realistic environment before it is public.

## A human reviews every change

None of this removes the human from the loop. Only I approve and merge pull requests, and
merging to the main branch is what triggers the production deploy. The agent speeds up the
work; the specs, the constitution, the checks and the review are what keep it under control.
