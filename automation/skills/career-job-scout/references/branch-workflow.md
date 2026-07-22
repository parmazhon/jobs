# Persistent review branch workflow

Use `codex/job-scout` as the only scout branch and maintain at most one open draft pull request into the repository's default branch.

1. Fetch the remote and determine the default branch.
2. Inspect whether `codex/job-scout` and an open PR from it already exist.
3. If the branch exists, check it out and incorporate the latest default branch without force-pushing. Stop on conflicts.
4. If the branch does not exist, scan from the latest default branch first. Create `codex/job-scout` only after at least one new draft is confirmed.
5. Restrict commits to new or deliberately updated files under `src/job-drafts`, `reports/job-scans`, and automation-owned state. Do not include unrelated working-tree changes.
6. Push normally. Never force-push.
7. If an open draft PR exists, update its body with the latest cumulative summary. Otherwise, open one titled `Job scout review queue`.
8. Keep the PR in draft state. Never merge it.

When the previous PR has been merged, the next run begins a new review batch. Recreate the scout branch from the latest default branch if GitHub deleted it.
