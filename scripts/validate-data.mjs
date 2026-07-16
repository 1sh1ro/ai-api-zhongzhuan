import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "data", "sites.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const allowedStatuses = new Set([
  "registration-page-reachable",
  "automated-access-blocked",
  "manual-verification-required",
  "degraded",
]);
const allowedInviteParams = new Set(["aff", "invite", "ref"]);
const forbiddenParams = /^(api_?key|access_?token|token|key|secret|session|code)$/i;
const ids = new Set();
const errors = [];

if (data.schemaVersion !== 1) errors.push("schemaVersion must be 1");
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.lastVerified ?? "")) {
  errors.push("lastVerified must use YYYY-MM-DD");
}

for (const [index, site] of (data.sites ?? []).entries()) {
  const label = site.id || `sites[${index}]`;
  for (const field of ["id", "name", "homepage", "registrationUrl", "summary", "status", "verifiedAt"]) {
    if (!site[field]) errors.push(`${label}: missing ${field}`);
  }
  if (ids.has(site.id)) errors.push(`${label}: duplicate id`);
  ids.add(site.id);
  if (!allowedStatuses.has(site.status)) errors.push(`${label}: unsupported status ${site.status}`);
  if (!Array.isArray(site.tags) || site.tags.length === 0) errors.push(`${label}: tags must not be empty`);
  if (!Array.isArray(site.sources) || site.sources.length === 0) errors.push(`${label}: sources must not be empty`);

  for (const [kind, rawUrl] of [["homepage", site.homepage], ["registrationUrl", site.registrationUrl]]) {
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== "https:") errors.push(`${label}: ${kind} must use HTTPS`);
      if (url.username || url.password || url.hash) errors.push(`${label}: ${kind} contains credentials or a fragment`);
      for (const key of url.searchParams.keys()) {
        if (forbiddenParams.test(key)) errors.push(`${label}: ${kind} contains forbidden parameter ${key}`);
        if (kind === "registrationUrl" && !allowedInviteParams.has(key)) {
          errors.push(`${label}: unreviewed registration parameter ${key}`);
        }
      }
    } catch {
      errors.push(`${label}: invalid ${kind}`);
    }
  }

  for (const source of site.sources ?? []) {
    try {
      const url = new URL(source.url);
      if (url.protocol !== "https:") errors.push(`${label}: source must use HTTPS`);
      if (url.search || url.hash || url.username || url.password) {
        errors.push(`${label}: source URL must not contain query, fragment, or credentials`);
      }
    } catch {
      errors.push(`${label}: invalid source URL`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${data.sites.length} sites; no sensitive URL parameters found.`);

