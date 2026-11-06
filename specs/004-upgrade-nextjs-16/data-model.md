# Data Model: Upgrade records

This feature has no runtime data. The entities from the spec are documentation records kept in
`research.md` (breaking changes) and filled in during implementation (audit, baseline).

## Audit finding

| Field | Meaning |
|-------|---------|
| package | npm package name and installed version |
| severity | critical / high / moderate / low |
| scope | runtime or dev-only |
| status | fixed / residual |
| reason, mitigation | required when status = residual |

Rule: after the upgrade, no `critical` or `high` row may be `residual` without a reason and mitigation (FR-002, SC-001).
Source of the before state: `specs/003-quick-fixes/research.md` R-04 (17 findings: 1 critical, 8 high, 8 moderate on 2026-11-05).

## Breaking-change record

| Field | Meaning |
|-------|---------|
| item | Change named in the Next 15 / 16 or React 19 guide |
| applies | yes / no |
| handled by | codemod name, manual edit, or "not applicable: <evidence>" |

State: seeded in research.md R-02..R-10 at planning; implementation updates `applies` with what the codemod actually changed (FR-009, SC-005).

## Baseline

| Field | Meaning |
|-------|---------|
| lighthouse | Performance / Accessibility / Best Practices / SEO for `/` and one blog post (mobile) |
| screenshots | `/`, `/blog`, post, general 404, `/blog/x` 404; EN and ES; 390px and 1280px |
| route table | `next build` output listing static/dynamic routes |
| audit | `npm audit` summary before the upgrade |

Captured from `master` before any change; compared after (FR-008, SC-002, SC-004).
