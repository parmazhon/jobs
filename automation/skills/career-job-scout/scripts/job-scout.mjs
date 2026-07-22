#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const brandDir = path.join(root, "src", "brands");
const publishedDir = path.join(root, "src", "jobs");
const draftDir = path.join(root, "src", "job-drafts");

function filesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(dir, name));
}

function scalar(value = "") {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed;
}

function readFrontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (field) data[field[1]] = scalar(field[2]);
  }
  return { data, body: text.slice(match[0].length) };
}

function record(file, kind) {
  const { data } = readFrontmatter(file);
  return {
    kind,
    file: path.relative(root, file),
    slug: path.basename(file, ".md"),
    ...data
  };
}

function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeUrl(value = "") {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    }
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString().replace(/\/$/, "");
  } catch {
    return String(value).trim().replace(/\/$/, "");
  }
}

function inventory() {
  const brands = filesIn(brandDir).map((file) => record(file, "brand"));
  const jobs = [
    ...filesIn(publishedDir).map((file) => record(file, "published")),
    ...filesIn(draftDir).map((file) => record(file, "draft"))
  ];
  return { brands, jobs };
}

function argsFrom(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    result[argv[index].slice(2)] = argv[index + 1] ?? "";
    index += 1;
  }
  return result;
}

function duplicateFor(candidate, jobs) {
  const candidateId = normalizeText(candidate.sourceJobId);
  const candidateUrl = normalizeUrl(candidate.applyUrl);
  const candidateKey = [candidate.brand, candidate.title, candidate.location]
    .map(normalizeText).join("|");

  return jobs.find((job) => {
    if (candidateId && normalizeText(job.source_job_id) === candidateId) return true;
    if (candidateUrl && normalizeUrl(job.apply_url) === candidateUrl) return true;
    const jobKey = [job.brand, job.title, job.location].map(normalizeText).join("|");
    return candidateKey !== "||" && jobKey === candidateKey;
  });
}

function validate() {
  const { brands, jobs } = inventory();
  const brandSlugs = new Set(brands.map((brand) => brand.slug));
  const drafts = jobs.filter((job) => job.kind === "draft");
  const errors = [];
  const required = ["title", "brand", "location", "apply_url", "posted", "source_url", "discovered_at", "review_status"];

  for (const draft of drafts) {
    for (const field of required) {
      if (!draft[field]) errors.push(`${draft.file}: missing ${field}`);
    }
    if (draft.draft !== true) errors.push(`${draft.file}: draft must be true`);
    if (draft.brand && !brandSlugs.has(String(draft.brand))) errors.push(`${draft.file}: unknown brand ${draft.brand}`);
    for (const field of ["apply_url", "source_url"]) {
      if (draft[field]) {
        try { new URL(String(draft[field])); } catch { errors.push(`${draft.file}: invalid ${field}`); }
      }
    }
  }

  for (let left = 0; left < jobs.length; left += 1) {
    for (let right = left + 1; right < jobs.length; right += 1) {
      const a = jobs[left];
      const b = jobs[right];
      if (a.kind !== "draft" && b.kind !== "draft") continue;
      const sameId = a.source_job_id && b.source_job_id && normalizeText(a.source_job_id) === normalizeText(b.source_job_id);
      const sameUrl = a.apply_url && b.apply_url && normalizeUrl(a.apply_url) === normalizeUrl(b.apply_url);
      const sameKey = a.brand && a.title && a.location &&
        [a.brand, a.title, a.location].map(normalizeText).join("|") ===
        [b.brand, b.title, b.location].map(normalizeText).join("|");
      if (sameId || sameUrl || sameKey) errors.push(`${a.file} duplicates ${b.file}`);
    }
  }

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Validated ${drafts.length} draft job(s) against ${brands.length} brand(s) and ${jobs.length} total job(s).`);
}

const command = process.argv[2];
if (command === "inventory") {
  console.log(JSON.stringify(inventory(), null, 2));
} else if (command === "candidate") {
  const options = argsFrom(process.argv.slice(3));
  for (const field of ["brand", "title", "apply-url"]) {
    if (!options[field]) {
      console.error(`Missing --${field}`);
      process.exit(1);
    }
  }
  const duplicate = duplicateFor({
    brand: options.brand,
    title: options.title,
    location: options.location,
    applyUrl: options["apply-url"],
    sourceJobId: options["source-job-id"]
  }, inventory().jobs);
  console.log(JSON.stringify({ duplicate: Boolean(duplicate), match: duplicate ?? null }, null, 2));
  if (duplicate) process.exitCode = 2;
} else if (command === "validate") {
  validate();
} else {
  console.error("Usage: job-scout.mjs <inventory|candidate|validate>");
  process.exitCode = 1;
}
