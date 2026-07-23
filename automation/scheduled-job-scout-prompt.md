# Scheduled job scout prompt

Use the repository skill at `automation/skills/career-job-scout/SKILL.md` to perform the daily career-page scan against the latest default branch.

Check every non-empty `careers_url` in `src/brands`. Identify genuinely relevant creative strategy, performance creative, UGC, content production, and conversion-focused editing roles. Compare candidates against both `src/jobs` and `src/job-drafts` using external job IDs, canonical application URLs, and normalized brand/title/location combinations.

For every genuinely new role, create a factual Markdown draft under `src/job-drafts` with `draft: true`, `review_status: needs-review`, and the closest allowed `role_type` from the repository skill. Do not modify `src/jobs`, invent missing details, or publish jobs.

Maintain the single persistent branch `codex/job-scout` and at most one open draft pull request into the default branch. If that branch already has an open PR, update it. If a previous batch was merged, recreate the branch from the latest default branch only after finding a new role. Never force-push or merge the PR.

When meaningful changes exist, add a dated report under `reports/job-scans`, validate drafts, build the site, commit only scout-owned files, push the branch, and create or update the draft PR titled `Job scout review queue`. If nothing meaningfully changed, do not create a branch, commit, report, or pull request.

In the run summary, report brands checked, drafts created, duplicates skipped, ambiguous roles, inaccessible pages, validation results, and the draft PR link when applicable.
