import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Submit the sitemap URLs to IndexNow (Bing / Yandex / etc.).
// Usage: INDEXNOW_KEY=... node scripts/indexnow.mjs
// Place the same key as a file at /<key>.txt on the site (committed or deployed).
// This script never runs in CI unless you add the secret and a workflow step.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const key = process.env.INDEXNOW_KEY || "";
const host = "ai.xulas.fun";

if (!key) {
  console.log("INDEXNOW_KEY is not set; skipping submission.");
  process.exit(0);
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const endpoint = "https://api.indexnow.org/indexnow";
const body = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList,
};

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
console.log(`IndexNow ${response.status} for ${urlList.length} URLs`);
if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}
