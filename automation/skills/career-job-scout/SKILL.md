---
name: career-job-scout
description: Scan the career pages defined by this repository, identify creative-strategy and adjacent performance-creative roles, deduplicate them against published jobs and review drafts, create factual Markdown drafts, and maintain the persistent codex/job-scout review branch and draft pull request. Use for manual or scheduled job-discovery runs for the Creative Strategy Jobs site.
---

# Career Job Scout

Find relevant roles without publishing them. Treat `src/brands/*.md` as the source of career-page URLs, `src/jobs/*.md` as published records, and `src/job-drafts/*.md` as the review queue.

## Run the scan

1. Start from an up-to-date checkout. For a cloud run, follow [references/branch-workflow.md](references/branch-workflow.md).
2. Run `node automation/skills/career-job-scout/scripts/job-scout.mjs inventory` and use its JSON output as the authoritative brand and job inventory.
3. Read [references/relevance-rules.md](references/relevance-rules.md).
4. Visit every non-empty `careers_url`. Prefer the employer's job board or ATS listing over search-result snippets. Follow individual job links to verify responsibilities.
5. Record pages that are inaccessible or ambiguous. Never interpret an inaccessible page as having no jobs.
6. For each candidate, run `node automation/skills/career-job-scout/scripts/job-scout.mjs candidate --brand <slug> --title <title> --apply-url <url> [--location <location>] [--source-job-id <id>]`. Skip candidates reported as duplicates.
7. Create a Markdown file in `src/job-drafts` only when the role satisfies the relevance rules and enough factual information is available.
8. Run `node automation/skills/career-job-scout/scripts/job-scout.mjs validate` and `npm run build`.
9. If drafts were created, write `reports/job-scans/YYYY-MM-DD.md` with checked sources, created drafts, duplicates, ambiguous roles, and failures. Do not add a report or commit when nothing meaningfully changed.

## Draft requirements

Use this frontmatter shape:

```yaml
---
title: Senior Creative Strategist
brand: example-brand
location: Remote, US
workplace: Remote
employment_type: Full-time
salary: $100,000–$125,000
apply_url: https://employer.example/jobs/123
posted: 2026-07-22
featured: false
draft: true
review_status: needs-review
source_url: https://employer.example/jobs/123
source_job_id: "123"
source_title: Senior Creative Strategist
discovered_at: 2026-07-22
last_seen_at: 2026-07-22
match_keywords:
  - creative strategist
---
```

Use the employer's wording for facts. Omit optional facts that the source does not provide; never infer salary, workplace, location, employment type, qualifications, or responsibilities. Set `posted` to the source's posting date when available, otherwise the discovery date. Write a concise, neutral summary and preserve important responsibilities and qualifications in the body.

## Safety boundaries

- Never modify, move, or create files in `src/jobs`.
- Never set `draft: false`.
- Never merge a pull request or publish a job.
- Never overwrite human edits to an existing draft.
- Never use a third-party repost as authoritative when an employer listing is available.
- Stop and report branch conflicts, missing GitHub write access, authentication failures, or validation failures.

## Finish the cloud run

Follow [references/branch-workflow.md](references/branch-workflow.md). Keep one open draft PR from `codex/job-scout` into the default branch. Update that PR instead of creating a dated branch. If the prior PR was merged and the branch no longer exists, recreate it from the latest default branch when a new draft is found.
