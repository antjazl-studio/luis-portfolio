# Contract: Post content files

Location: `content/blog/<slug>/en.md` and `content/blog/<slug>/es.md` (both required).

```markdown
---
title: "Post title"
summary: "One or two sentences shown on the index and in metadata."
date: 2026-11-05
draft: true        # optional, default false; must match in en.md and es.md
---

Body in Markdown.
```

## Supported Markdown
Headings, paragraphs, emphasis, ordered/unordered lists, links, block quotes, fenced code blocks,
GFM tables/strikethrough/task lists, images `![alt](/blog/<slug>/file.png)` (site-local only,
alt text required in practice).

## Not supported / ignored
- Raw HTML and `<script>`: dropped, never rendered.
- Remote images: only the alt text is rendered.
- Review notes: use an HTML comment, e.g. `<!-- REVIEW: confirm branch protection setup -->`.
  It is never rendered or counted in reading time, and can be found with
  `grep -r "REVIEW:" content/`.

## Publishing a draft
Remove `draft: true` (or set `false`) in both files. No code change.

## Build-time failures
See "Validation errors" in [data-model.md](../data-model.md).
