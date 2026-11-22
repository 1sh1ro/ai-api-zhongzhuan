import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRows, comparableRows, formatMultiplier } from "../assets/pricing.js";
import { loadRegistrationRecords } from "./registrations.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const sitesData = readJSON("data/sites.json");
const modelsData = readJSON("data/models.json");
const offersData = readJSON("data/offers.json");
const configData = readJSON("data/pricing-config.json");
const scopeData = readJSON("data/model-scope.json");
const versionData = readJSON("data/version.json");

const allowedStatuses = new Set([
  "registration-page-reachable",
  "automated-access-blocked",
  "manual-verification-required",
  "degraded",
]);
const allowedInviteParams = new Set(["aff", "invite", "ref", "i"]);
const safeRedirectPath = /^\/(?!\/)[A-Za-z0-9/_-]*$/;
const forbiddenParams = /^(api_?key|access_?token|token|key|secret|session|code)$/i;
const allowedPricingModes = new Set([
  "absolute_cny",
  "absolute_usd",
  "ratio",
  "declared_effective",
  "per_request_cny",
  "free",
]);
const allowedFamilies = new Set(["gpt", "claude", "grok", "gemini", "deepseek", "glm", "kimi", "doubao", "domestic", "image"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isHttps = (value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const errors = [];
const warnings = [];

/* ---------------- 站点 ---------------- */
const siteIds = new Set();
if (sitesData.schemaVersion !== 1) errors.push("sites.json: schemaVersion must be 1");
if (!datePattern.test(sitesData.lastVerified ?? "")) errors.push("sites.json: lastVerified must use YYYY-MM-DD");

for (const [index, site] of (sitesData.sites ?? []).entries()) {
  const label = site.id || `sites[${index}]`;
  for (const field of ["id", "name", "homepage", "registrationUrl", "summary", "status", "verifiedAt"]) {
    if (!site[field]) errors.push(`${label}: missing ${field}`);
  }
  if (siteIds.has(site.id)) errors.push(`${label}: duplicate id`);
  if (site.pinned !== undefined && typeof site.pinned !== "boolean") errors.push(`${label}: pinned must be a boolean`);
  siteIds.add(site.id);
  if (!allowedStatuses.has(site.status)) errors.push(`${label}: unsupported status ${site.status}`);
  if (!Array.isArray(site.tags) || site.tags.length === 0) errors.push(`${label}: tags must not be empty`);
  if (!Array.isArray(site.sources) || site.sources.length === 0) errors.push(`${label}: sources must not be empty`);

  for (const [kind, rawUrl] of [["homepage", site.homepage], ["registrationUrl", site.registrationUrl]]) {
    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      errors.push(`${label}: invalid ${kind}`);
      continue;
    }
    if (url.protocol !== "https:") errors.push(`${label}: ${kind} must use HTTPS`);
    if (url.username || url.password || url.hash) errors.push(`${label}: ${kind} contains credentials or a fragment`);
    for (const key of url.searchParams.keys()) {
      if (forbiddenParams.test(key)) errors.push(`${label}: ${kind} contains forbidden parameter ${key}`);
      if (kind === "registrationUrl" && key === "redirect" && !safeRedirectPath.test(url.searchParams.get(key) ?? "")) {
        errors.push(`${label}: registration redirect must be a safe relative path`);
      } else if (kind === "registrationUrl" && key !== "redirect" && !allowedInviteParams.has(key)) {
        errors.push(`${label}: unreviewed registration parameter ${key}`);
      }
    }
  }

  for (const source of site.sources ?? []) {
    let url;
    try {
      url = new URL(source.url);
    } catch {
      errors.push(`${label}: invalid source URL`);
      continue;
    }
    if (url.protocol !== "https:") errors.push(`${label}: source must use HTTPS`);
    if (url.search || url.hash || url.username || url.password) {
      errors.push(`${label}: source URL must not contain query, fragment, or credentials`);
    }
  }
}

/* ---------------- 官方基准价 ---------------- */
const modelIds = new Set();
for (const [index, model] of (modelsData.models ?? []).entries()) {
  const label = model.id || `models[${index}]`;
  if (!model.id) errors.push(`${label}: missing id`);
  if (modelIds.has(model.id)) errors.push(`${label}: duplicate id`);
  modelIds.add(model.id);
  if (!model.vendor) errors.push(`${label}: missing vendor`);
  if (!allowedFamilies.has(model.family)) errors.push(`${label}: unsupported family ${model.family}`);
  if (model.official === null) {
    if (!model.officialNote) warnings.push(`${label}: official 为空但没有 officialNote`);
  } else {
    const official = model.official;
    if (!official || !["USD", "CNY"].includes(official.currency)) errors.push(`${label}: official.currency must be USD or CNY`);
    for (const field of ["inputPer1M", "outputPer1M"]) {
      if (typeof official?.[field] !== "number" || official[field] <= 0) errors.push(`${label}: official.${field} must be a positive number`);
    }
  }
  if (!isHttps(model.officialSourceUrl)) errors.push(`${label}: officialSourceUrl must be HTTPS`);
  if (!datePattern.test(model.officialCheckedAt ?? "")) errors.push(`${label}: officialCheckedAt must use YYYY-MM-DD`);
}

/* ---------------- 报价 ---------------- */
const offerIds = new Set();
const offerKeys = new Set();
for (const [index, offer] of (offersData.offers ?? []).entries()) {
  const label = offer.id || `offers[${index}]`;
  if (!offer.id) errors.push(`${label}: missing id`);
  if (offerIds.has(offer.id)) errors.push(`${label}: duplicate id`);
  offerIds.add(offer.id);

  if (!siteIds.has(offer.stationId)) errors.push(`${label}: unknown stationId ${offer.stationId}`);
  if (!modelIds.has(offer.modelId)) errors.push(`${label}: unknown modelId ${offer.modelId}`);
  if (!offer.groupKey) errors.push(`${label}: missing groupKey`);
  if (!allowedPricingModes.has(offer.pricingMode)) errors.push(`${label}: unsupported pricingMode ${offer.pricingMode}`);
  if (!isHttps(offer.sourceUrl)) errors.push(`${label}: sourceUrl must be HTTPS`);
  if (!datePattern.test(offer.verifiedAt ?? "")) errors.push(`${label}: verifiedAt must use YYYY-MM-DD`);
  if (!offer.note) warnings.push(`${label}: 缺少原文口径说明 note`);
  for (const flag of ["unverified", "unverifiedFactor"]) {
    if (offer[flag] !== undefined && typeof offer[flag] !== "boolean") errors.push(`${label}: ${flag} must be a boolean`);
  }

  const compositeKey = `${offer.stationId}::${offer.groupKey}::${offer.modelId}`;
  if (offerKeys.has(compositeKey)) errors.push(`${label}: duplicate station/group/model combination ${compositeKey}`);
  offerKeys.add(compositeKey);

  switch (offer.pricingMode) {
    case "absolute_cny":
      if (typeof offer.inputCnyPer1M !== "number" || offer.inputCnyPer1M <= 0) errors.push(`${label}: inputCnyPer1M invalid`);
      if (typeof offer.outputCnyPer1M !== "number" || offer.outputCnyPer1M <= 0) errors.push(`${label}: outputCnyPer1M invalid`);
      break;
    case "absolute_usd":
      if (typeof offer.inputUsdPer1M !== "number" || offer.inputUsdPer1M <= 0) errors.push(`${label}: inputUsdPer1M invalid`);
      if (typeof offer.outputUsdPer1M !== "number" || offer.outputUsdPer1M <= 0) errors.push(`${label}: outputUsdPer1M invalid`);
      break;
    case "ratio":
      if (typeof offer.ratio !== "number" || offer.ratio <= 0) errors.push(`${label}: ratio invalid`);
      if (offer.ratioFactor != null && (typeof offer.ratioFactor !== "number" || offer.ratioFactor <= 0)) {
        errors.push(`${label}: ratioFactor invalid`);
      }
      break;
    case "declared_effective":
      if (typeof offer.declaredEffective !== "number" || offer.declaredEffective <= 0) errors.push(`${label}: declaredEffective invalid`);
      break;
    case "per_request_cny":
      if (typeof offer.perRequestCny !== "number" || offer.perRequestCny <= 0) errors.push(`${label}: perRequestCny invalid`);
      break;
    default:
      break;
  }
}

/* ---------------- 归一化结果 ---------------- */
if (typeof configData.fxCnyPerUsd !== "number" || configData.fxCnyPerUsd <= 0) errors.push("pricing-config.json: fxCnyPerUsd invalid");

const statedIds = new Set(scopeData.statedOfferIds ?? []);
if (!versionData.build) errors.push("version.json: 缺少 build");
if (statedIds.size !== (scopeData.statedOfferIds ?? []).length) errors.push("model-scope.json: statedOfferIds 存在重复");
for (const id of statedIds) {
  if (!offerIds.has(id)) errors.push(`model-scope.json: 未知报价 id ${id}`);
}

// 泛称「国模 / 国产」的分组，除非已登记为指定型号，否则必须使用 domestic-model。
for (const offer of offersData.offers ?? []) {
  if (/国模|国产/.test(offer.groupName ?? "") && !statedIds.has(offer.id) && offer.modelId !== "domestic-model") {
    errors.push(`${offer.id}: 泛称国产分组必须使用 domestic-model，或先在 model-scope.json 登记为指定型号`);
  }
}

const rows = buildRows(offersData.offers ?? [], modelsData.models ?? [], configData, statedIds);
for (const row of rows) {
  if (row.modelBasis === "assumed" && row.inputCny != null) {
    errors.push(`${row.id}: 未指定型号的报价不应带每百万 Token 单价`);
  }
  if (row.comparable) {
    if (!Number.isFinite(row.effectiveBlended) || row.effectiveBlended <= 0) {
      errors.push(`${row.id}: comparable row has invalid blended multiplier`);
    }
    if (row.modelBasis === "stated" && (!Number.isFinite(row.inputCny) || row.inputCny <= 0)) {
      errors.push(`${row.id}: comparable row has invalid inputCny`);
    }
  }
}

const comparable = comparableRows(rows);
const ranked = [...comparable].sort((a, b) => a.effectiveBlended - b.effectiveBlended);
const stationsWithOffers = new Set(rows.map((row) => row.stationId));
const uncovered = [...siteIds].filter((id) => !stationsWithOffers.has(id));

// 备注里写了「约 Xx」的，与复算值比对；偏差超过 25% 说明原文口径与算式不一致。
for (const row of rows) {
  if (row.effectiveBlended == null || !row.note) continue;
  const matches = [...row.note.matchAll(/约\s*([0-9]+(?:\.[0-9]+)?)\s*x/g)];
  for (const match of matches) {
    const declared = Number(match[1]);
    if (!Number.isFinite(declared) || declared <= 0) continue;
    const deviation = Math.abs(row.effectiveBlended - declared) / declared;
    if (deviation > 0.25) {
      warnings.push(
        `${row.id}: 备注声明约 ${declared}x，复算 ${row.effectiveBlended}x，偏差 ${(deviation * 100).toFixed(0)}%`,
      );
    }
  }
}

/* ---------------- 注册转化数据 ---------------- */
try {
  const registrationRecords = loadRegistrationRecords(root, siteIds);
  console.log(`注册量记录 ${registrationRecords.length} 条`);
} catch (error) {
  for (const line of error.registrationErrors || [error.message]) errors.push(line);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

if (warnings.length) {
  console.warn(warnings.map((warning) => `! ${warning}`).join("\n"));
}

console.log(`站点 ${siteIds.size} 个 · 官方基准模型 ${modelIds.size} 个 · 报价 ${rows.length} 条 · 可比 ${comparable.length} 条`);
console.log(`暂无报价的站点 ${uncovered.length} 个：${uncovered.join(", ") || "无"}`);
console.log("");
console.log("综合倍率最低的 10 条报价：");
for (const [index, row] of ranked.slice(0, 10).entries()) {
  const official = row.official ? `官方 ¥${row.official.input.toFixed(2)}/¥${row.official.output.toFixed(2)}` : "官方基准缺失";
  console.log(
    `  ${String(index + 1).padStart(2, "0")}. ${formatMultiplier(row.effectiveBlended)}  ${row.stationId} · ${row.groupName} · ${row.modelDisplay}  (${row.basisLabel}, ${official})`,
  );
}
console.log("\n校验通过。");
