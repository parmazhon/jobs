# Creative Strategy Jobs

An Eleventy job board with Git-based editing through Pages CMS.

## Local development

```bash
npm install
npm run dev
```

Eleventy serves the site at `http://localhost:8080`.

## Pages CMS

1. Push this repository to GitHub.
2. Sign in at [pagescms.org](https://pagescms.org).
3. Connect the repository and select the branch containing this project.
4. Pages CMS will read `.pages.yml` from the repository root and expose jobs, homepage content, and site settings.

Job posts live in `src/jobs`. Add or edit them either in Pages CMS or as Markdown files.

## Automated job scout

Potential jobs are written to `src/job-drafts` and appear in Pages CMS under **Jobs to review**. They are never included in the public Eleventy job collection.

The repo-scoped Codex workflow lives at `automation/skills/career-job-scout/SKILL.md`. Use the prompt in `automation/scheduled-job-scout-prompt.md` for a cloud scheduled task. It maintains one `codex/job-scout` branch and one draft pull request per review batch.

```bash
npm run jobs:inventory
npm run jobs:validate
```
