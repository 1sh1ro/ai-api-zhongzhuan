import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRows,
  comparableRows,
  stationBest,
  modelBest,
  formatCny,
  formatMultiplier,
  formatDiscount,
  FAMILY_LABELS,
} from "../assets/pricing.js";
import { scoreStation } from "../assets/scoring.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const sitesData = readJSON("data/sites.json");
const modelsData = readJSON("data/models.json");
const offersData = readJSON("data/offers.json");
const config = readJSON("data/pricing-config.json");
const scope = readJSON("data/model-scope.json");
const version = readJSON("data/version.json");
const guides = readJSON("data/guides.json").guides;

const BASE = "https://ai.xulas.fun";
const BUILD = version.build;
const LASTMOD = (version.builtAt || "2026-11-04").slice(0, 10);

const sites = sitesData.sites;
const models = modelsData.models;
const offers = offersData.offers;
const statedIds = new Set(scope.statedOfferIds || []);
const rows = buildRows(offers, models, config, statedIds);
const comparable = comparableRows(rows);
const siteById = new Map(sites.map((site) => [site.id, site]));
const modelById = new Map(models.map((model) => [model.id, model]));
const stationBestRow = stationBest(rows);
const modelBestRow = modelBest(rows.filter((row) => row.modelBasis === "stated"));
const stationScores = new Map(
  sites.map((site) => [site.id, scoreStation(site, rows.filter((row) => row.stationId === site.id), modelById, LASTMOD)]),
);

const REFERRAL_PARAM_KEYS = ["aff", "ref", "invite", "code"];
const GENERIC_REGISTER_PATH = /^\/(sign-?up|signup|register|login|dashboard)\/?$/i;

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

function scoreBadge(score, name, suffix = "") {
  if (!score) return '<span class="ratio-muted">—</span>';
  const parts = [score.parts.price, score.parts.transparency, score.parts.traceability, score.parts.coverage, score.parts.completeness]
    .map((value) => value.toFixed(1))
    .join(",");
  return `<span class="score-badge grade-${esc(score.grade)}" data-score="${score.total.toFixed(1)}" data-grade="${esc(score.grade)}" data-name="${esc(name || "")}" data-parts="${parts}" tabindex="0" title="悬停查看五维评分">${score.total.toFixed(1)}${suffix}</span>`;
}

function formatDate(value) {  if (!value) return "—";
  const parts = String(value).split("-");
  return parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : value;
}

function siteLink(site) {
  if (!site) return "#";
  const home = site.homepage || "#";
  const registration = site.registrationUrl;
  if (!registration || registration === home) return home;
  let url;
  try {
    url = new URL(registration);
  } catch {
    return home;
  }
  const hasReferral = [...url.searchParams.keys()].some((key) => REFERRAL_PARAM_KEYS.includes(key.toLowerCase()));
  if (hasReferral) return registration;
  if (!GENERIC_REGISTER_PATH.test(url.pathname)) return registration;
  return home;
}

function modelSlug(id) {
  return String(id).replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function modelDisplay(row) {
  return row.modelDisplay;
}

function rawValue(row) {
  if (row.pricingMode === "free") return "免费额度";
  if (row.perRequestCny != null) return `${formatCny(row.perRequestCny)}/次`;
  if (row.pricingMode === "absolute_cny" || row.pricingMode === "absolute_usd") {
    return `${formatCny(row.inputCny)} / ${formatCny(row.outputCny)} 元每百万`;
  }
  if (row.declaredRatio != null) return `${formatMultiplier(row.declaredRatio)} 站内倍率`;
  return "—";
}

const STATUS_LABELS = {
  "registration-page-reachable": "注册页可达",
  "manual-verification-required": "需要人工核验",
  degraded: "服务降级",
  "automated-access-blocked": "自动访问受阻",
};

const SOURCE_LABELS = {  "public-pricing-api": "站方价格接口",
  "user-submitted-pricing": "用户价格快照",
  "user-provided-screenshot": "用户截图",
  "user-submitted": "用户提交",
  "local-verified": "本地访问核验",
  "official-website": "官网",
  "official-pricing": "官网价格页",
  "official-model-list": "官网模型页",
  "official-model-catalog": "模型广场",
  "github-issue": "GitHub Issue",
  "site-status": "站点状态页",
};

function sourceCell(row) {
  const label = SOURCE_LABELS[row.sourceKind] || row.sourceKind || "来源";
  return `<a href="${esc(row.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(label)} ↗</a>`;
}

function shell({ title, description, canonical, body, jsonLd }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#f6f7f5" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="AI API 比价雷达" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta name="twitter:card" content="summary" />
    <link rel="stylesheet" href="../styles.css?v=${esc(BUILD)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head>
  <body>
    <div class="page">
      <header class="topbar">
        <a class="brand" href="../index.html" aria-label="AI API 比价雷达首页">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-text"><strong>AI API 比价雷达</strong><small>RELAY PRICE RADAR</small></span>
        </a>
        <nav class="topnav" aria-label="主导航">
          <a href="../index.html">中转价格榜</a>
          <a href="../index.html#models">模型对照</a>
          <a href="../index.html#directory">站点目录</a>
          <a href="../index.html#ledger">核验明细</a>
          <a href="../guides/index.html">指南</a>
          <a href="../method.html">方法</a>
        </nav>
      </header>
      <main>
${body}
      </main>
      <footer class="footer">
        <span>AI API 比价雷达 · RELAY PRICE RADAR</span>
        <span>数据构建 ${esc(BUILD)} · 最后更新 ${esc(LASTMOD)}</span>
      </footer>
    </div>
    <script src="../assets/score-tip.js?v=${esc(BUILD)}" defer></script>
  </body>
</html>
`;
}

function offerTable(rowsForTable, { showStation = false, showModel = false }) {
  if (rowsForTable.length === 0) {
    return `<p class="table-note">暂无公开报价。</p>`;
  }
  const head = `
        <tr>
          ${showStation ? "<th>站点</th>" : ""}
          <th>分组</th>
          ${showModel ? "<th>模型</th>" : ""}
          <th>口径</th>
          <th>原始值</th>
          <th class="col-num">综合倍率</th>
          <th class="col-num">输入 ¥/M</th>
          <th class="col-num">输出 ¥/M</th>
          <th>来源</th>
          <th>核验</th>
        </tr>`;
  const body = rowsForTable
    .map((row) => {
      const station = siteById.get(row.stationId);
      return `
        <tr>
          ${showStation ? `<td><a class="station-name" href="../stations/${esc(row.stationId)}.html">${esc(station ? station.name : row.stationId)}</a></td>` : ""}
          <td class="group-cell">${esc(row.groupName)}</td>
          ${showModel ? `<td>${esc(modelDisplay(row))}</td>` : ""}
          <td><span class="basis basis-${esc(row.basis)}">${esc(row.basisLabel)}</span></td>
          <td class="raw-cell">${esc(rawValue(row))}</td>
          <td class="col-num">${row.comparable ? `<strong class="ratio ${row.effectiveBlended < 1 ? "is-low" : ""}">${formatMultiplier(row.effectiveBlended)}</strong>` : '<span class="ratio-muted">—</span>'}</td>
          <td class="col-num">${formatCny(row.inputCny)}</td>
          <td class="col-num">${formatCny(row.outputCny)}</td>
          <td>${sourceCell(row)}</td>
          <td class="date-cell">${formatDate(row.verifiedAt)}</td>
        </tr>`;
    })
    .join("");
  return `<div class="table-wrap"><table class="rank-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

/* ---------- 站点页 ---------- */
fs.mkdirSync(path.join(root, "stations"), { recursive: true });
for (const site of sites) {
  const stationRows = rows.filter((row) => row.stationId === site.id);
  const best = stationBestRow.get(site.id);
  const comparableCount = stationRows.filter((row) => row.comparable).length;
  const statusLabel = {
    "registration-page-reachable": "注册页可达",
    "manual-verification-required": "需要人工核验",
    degraded: "服务降级",
    "automated-access-blocked": "自动访问受阻",
  }[site.status] || site.status || "状态未知";
  const score = stationScores.get(site.id);

  const summaryLine = best
    ? `当前最低综合倍率 ${formatMultiplier(best.effectiveBlended)}（${esc(best.groupName)}）。`
    : "暂无口径统一的可比报价。";

  const body = `        <section class="hero">
          <p class="eyebrow">STATION · ${esc(site.id)}</p>
          <h1>${esc(site.name)} 的 API 报价与核验记录</h1>
          <p class="lede">${esc(site.summary)}</p>
          <p class="hero-note">状态 ${esc(statusLabel)} · 核验 ${esc(formatDate(site.verifiedAt))} · ${stationRows.length} 条报价，其中 ${comparableCount} 条口径统一可比。${summaryLine}综合评分 ${score.total.toFixed(1)}（${score.grade}）。</p>
          <p><a class="button button-primary" href="${esc(siteLink(site))}" rel="nofollow noopener" target="_blank">打开站点 ↗</a></p>
        </section>
        <section class="panel">
          <div class="panel-head"><div><p class="kicker">SCORE</p><h2>综合评分 ${score.total.toFixed(1)}</h2></div>
          <p class="panel-desc">五个维度合计 100 分，等级 ${score.grade}。公式与权重见 <a href="../method.html">方法与评分规则</a>。</p></div>
          <div class="table-wrap"><table class="rank-table">
            <thead><tr><th>维度</th><th class="col-num">满分</th><th class="col-num">得分</th></tr></thead>
            <tbody>
              <tr><td>价格竞争力</td><td class="col-num">40</td><td class="col-num">${score.parts.price.toFixed(1)}</td></tr>
              <tr><td>数据透明度</td><td class="col-num">20</td><td class="col-num">${score.parts.transparency.toFixed(1)}</td></tr>
              <tr><td>来源可追溯</td><td class="col-num">15</td><td class="col-num">${score.parts.traceability.toFixed(1)}</td></tr>
              <tr><td>覆盖广度</td><td class="col-num">15</td><td class="col-num">${score.parts.coverage.toFixed(1)}</td></tr>
              <tr><td>信息完整度</td><td class="col-num">10</td><td class="col-num">${score.parts.completeness.toFixed(1)}</td></tr>
            </tbody>
          </table></div>
        </section>
        <section class="panel">
          <div class="panel-head"><div><p class="kicker">OFFERS</p><h2>全部报价</h2></div>
          <p class="panel-desc">每条报价保留原始口径、来源与核验日期。口径未统一的只显示原值。</p></div>
          ${offerTable(stationRows, { showModel: true })}
        </section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${site.name} 的 API 报价与核验记录`,
    url: `${BASE}/stations/${site.id}.html`,
    dateModified: LASTMOD,
    isPartOf: { "@type": "WebSite", name: "AI API 比价雷达", url: `${BASE}/` },
  };

  fs.writeFileSync(
    path.join(root, "stations", `${site.id}.html`),
    shell({
      title: `${site.name} API 报价与倍率 · AI API 比价雷达`,
      description: `${site.name} 的中转 API 报价：${stationRows.length} 条记录，${comparableCount} 条口径统一可比。${best ? `最低综合倍率 ${formatMultiplier(best.effectiveBlended)}。` : "暂无可比报价。"}数据核验于 ${formatDate(site.verifiedAt)}。`,
      canonical: `${BASE}/stations/${site.id}.html`,
      body,
      jsonLd,
    }),
  );
}

/* ---------- 站点索引 ---------- */
fs.writeFileSync(
  path.join(root, "stations", "index.html"),
  shell({
    title: "全部中转站列表 · AI API 比价雷达",
    description: `共收录 ${sites.length} 个 AI API 中转站，逐个列出报价条数、最低综合倍率与核验日期。`,
    canonical: `${BASE}/stations/index.html`,
    body: `        <section class="hero">
          <p class="eyebrow">STATIONS</p>
          <h1>全部中转站</h1>
          <p class="lede">共 ${sites.length} 个站点，按综合评分从高到低排序。每页列出该站点的评分明细、全部报价与核验日期。</p>
        </section>
        <section class="panel">
          <div class="table-wrap"><table class="rank-table">
            <thead><tr><th>站点</th><th class="col-num">评分</th><th>状态</th><th class="col-num">报价</th><th class="col-num">可比</th><th class="col-num">最低倍率</th><th>核验</th></tr></thead>
            <tbody>
${[...sites]
  .sort((a, b) => (stationScores.get(b.id)?.total ?? 0) - (stationScores.get(a.id)?.total ?? 0))
  .map((site) => {
    const stationRows = rows.filter((row) => row.stationId === site.id);
    const best = stationBestRow.get(site.id);
    const score = stationScores.get(site.id);
    return `              <tr><td><a class="station-name" href="${esc(site.id)}.html">${esc(site.name)}</a></td><td class="col-num">${scoreBadge(score, site.name)}</td><td class="group-cell">${esc(STATUS_LABELS[site.status] || site.status)}</td><td class="col-num">${stationRows.length}</td><td class="col-num">${stationRows.filter((row) => row.comparable).length}</td><td class="col-num">${best ? formatMultiplier(best.effectiveBlended) : "—"}</td><td class="date-cell">${formatDate(site.verifiedAt)}</td></tr>`;
  })
  .join("\n")}
            </tbody>
          </table></div>
        </section>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "全部中转站列表",
      url: `${BASE}/stations/index.html`,
      dateModified: LASTMOD,
    },
  }),
);

/* ---------- 模型页 ---------- */
fs.mkdirSync(path.join(root, "models"), { recursive: true });
for (const model of models) {
  const slug = modelSlug(model.id);
  const modelRows = rows
    .filter((row) => row.modelId === model.id)
    .sort((a, b) => {
      if (a.comparable && b.comparable) return a.effectiveBlended - b.effectiveBlended;
      if (a.comparable) return -1;
      if (b.comparable) return 1;
      return String(a.stationId).localeCompare(String(b.stationId));
    });
  const best = modelBestRow.get(model.id);
  const rate = model.official && model.official.currency === "CNY" ? 1 : config.fxCnyPerUsd;
  const officialLine = model.official
    ? `官方价 ${formatCny(model.official.inputPer1M * rate)} / ${formatCny(model.official.outputPer1M * rate)} 每百万 Token，核验 ${formatDate(model.officialCheckedAt)}。`
    : model.officialNote || "官方基准价缺失。";

  const body = `        <section class="hero">
          <p class="eyebrow">MODEL · ${esc(slug)}</p>
          <h1>${esc(model.displayName)} 各中转站报价对比</h1>
          <p class="lede">${esc(officialLine)}当前 ${modelRows.length} 条报价，${modelRows.filter((row) => row.comparable).length} 条口径统一可比。${best ? `最低综合倍率 ${formatMultiplier(best.effectiveBlended)}。` : ""}</p>
          <p class="hero-note">系列：<a href="../families/${esc(model.family)}.html">${esc(FAMILY_LABELS[model.family] || model.family)}</a> · 官方价来源：<a href="${esc(model.officialSourceUrl)}" rel="nofollow noopener" target="_blank">${esc(model.officialSourceUrl)}</a> · 最后更新 ${esc(LASTMOD)}</p>
        </section>
        <section class="panel">
          <div class="panel-head"><div><p class="kicker">QUOTES</p><h2>按综合倍率排序</h2></div>
          <p class="panel-desc">倍率越低越便宜，1.00x 等于官方价。口径未统一的条目排在后面，只显示原值。</p></div>
          ${offerTable(modelRows, { showStation: true })}
        </section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${model.displayName} 各中转站报价对比`,
    url: `${BASE}/models/${slug}.html`,
    dateModified: LASTMOD,
    isPartOf: { "@type": "WebSite", name: "AI API 比价雷达", url: `${BASE}/` },
  };

  fs.writeFileSync(
    path.join(root, "models", `${slug}.html`),
    shell({
      title: `${model.displayName} 中转站报价对比 · AI API 比价雷达`,
      description: `${model.displayName} 官方价与各中转站报价对比，共 ${modelRows.length} 条记录。${best ? `当前最低综合倍率 ${formatMultiplier(best.effectiveBlended)}。` : ""}数据更新于 ${LASTMOD}。`,
      canonical: `${BASE}/models/${slug}.html`,
      body,
      jsonLd,
    }),
  );
}

/* ---------- 模型索引 ---------- */
fs.writeFileSync(
  path.join(root, "models", "index.html"),
  shell({
    title: "全部模型与官方价 · AI API 比价雷达",
    description: `共 ${models.filter((model) => model.official).length} 个模型的官方基准价，以及每个模型当前报价最低的中转站。`,
    canonical: `${BASE}/models/index.html`,
    body: `        <section class="hero">
          <p class="eyebrow">MODELS</p>
          <h1>全部模型与官方价</h1>
          <p class="lede">官方价作为分母，每个模型页列出所有站点报价与综合倍率。</p>
        </section>
        <section class="panel">
          <div class="table-wrap"><table class="rank-table">
            <thead><tr><th>模型</th><th>厂商</th><th class="col-num">官方输入</th><th class="col-num">官方输出</th><th class="col-num">最低倍率</th><th>最低站点</th></tr></thead>
            <tbody>
${models
  .map((model) => {
    const slug = modelSlug(model.id);
    const best = modelBestRow.get(model.id);
    const rate = model.official ? (model.official.currency === "CNY" ? 1 : config.fxCnyPerUsd) : 1;
    const input = model.official ? formatCny(model.official.inputPer1M * rate) : "—";
    const output = model.official ? formatCny(model.official.outputPer1M * rate) : "—";
    return `              <tr><td><a class="station-name" href="${esc(slug)}.html">${esc(model.displayName)}</a></td><td class="group-cell">${esc(model.vendor)}</td><td class="col-num">${input}</td><td class="col-num">${output}</td><td class="col-num">${best ? formatMultiplier(best.effectiveBlended) : "—"}</td><td class="group-cell">${best ? esc(siteById.get(best.stationId)?.name || best.stationId) : "—"}</td></tr>`;
  })
  .join("\n")}
            </tbody>
          </table></div>
        </section>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "全部模型与官方价",
      url: `${BASE}/models/index.html`,
      dateModified: LASTMOD,
    },
  }),
);

/* ---------- 指南索引 ---------- */
fs.writeFileSync(
  path.join(root, "guides", "index.html"),
  shell({
    title: "使用指南 · AI API 比价雷达",
    description: "中转站 API 的基础概念、倍率计算方法、价格核验步骤与风险提示。",
    canonical: `${BASE}/guides/index.html`,
    body: `        <section class="hero">
          <p class="eyebrow">GUIDES</p>
          <h1>使用指南</h1>
          <p class="lede">先把概念和算法弄清楚，再看价格榜，结论会稳很多。</p>
        </section>
        <section class="panel">
          <div class="table-wrap"><table class="rank-table">
            <thead><tr><th>指南</th><th>更新</th></tr></thead>
            <tbody>
${guides
  .map(
    (guide) => `              <tr><td><a class="station-name" href="${esc(guide.slug)}.html">${esc(guide.title)}</a><div class="group-cell">${esc(guide.description)}</div></td><td class="date-cell">${esc(guide.updated)}</td></tr>`,
  )
  .join("\n")}
            </tbody>
          </table></div>
        </section>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "使用指南",
      url: `${BASE}/guides/index.html`,
      dateModified: LASTMOD,
    },
  }),
);

/* ---------- 系列页 ---------- */
const FAMILY_ORDER = ["gpt", "claude", "grok", "gemini", "deepseek", "glm", "kimi", "doubao", "domestic", "image"];
const familyPages = [];
fs.mkdirSync(path.join(root, "families"), { recursive: true });
for (const family of FAMILY_ORDER) {
  const familyModels = models.filter((model) => model.family === family);
  if (familyModels.length === 0) continue;
  const familyRows = rows.filter((row) => modelById.get(row.modelId)?.family === family);
  const label = FAMILY_LABELS[family] || family;
  familyPages.push({ family, label, loc: `${BASE}/families/${family}.html` });

  const stationAgg = new Map();
  for (const row of familyRows) {
    const current = stationAgg.get(row.stationId) || { count: 0, best: null, models: new Set() };
    current.count += 1;
    current.models.add(modelById.get(row.modelId)?.displayName || row.modelId);
    if (row.comparable && (current.best == null || row.effectiveBlended < current.best)) current.best = row.effectiveBlended;
    stationAgg.set(row.stationId, current);
  }

  const body = `        <section class="hero">
          <p class="eyebrow">FAMILY · ${esc(family)}</p>
          <h1>${esc(label)} 中转站与报价</h1>
          <p class="lede">${esc(label)} 系列在收录站点里的报价情况，共 ${familyModels.length} 个模型、${familyRows.length} 条报价。综合倍率相对官方价计算，1.00x 等于官方价。</p>
        </section>
        <section class="panel">
          <div class="panel-head"><div><p class="kicker">MODELS</p><h2>${esc(label)} 模型</h2></div><p class="panel-desc">点进模型页看全部站点报价。</p></div>
          <div class="table-wrap"><table class="rank-table">
            <thead><tr><th>模型</th><th>厂商</th><th class="col-num">官方输入</th><th class="col-num">官方输出</th><th class="col-num">最低倍率</th></tr></thead>
            <tbody>
${familyModels
  .map((model) => {
    const best = modelBestRow.get(model.id);
    const rate = model.official ? (model.official.currency === "CNY" ? 1 : config.fxCnyPerUsd) : 1;
    return `              <tr><td><a class="station-name" href="../models/${esc(modelSlug(model.id))}.html">${esc(model.displayName)}</a></td><td class="group-cell">${esc(model.vendor)}</td><td class="col-num">${model.official ? formatCny(model.official.inputPer1M * rate) : "—"}</td><td class="col-num">${model.official ? formatCny(model.official.outputPer1M * rate) : "—"}</td><td class="col-num">${best ? formatMultiplier(best.effectiveBlended) : "—"}</td></tr>`;
  })
  .join("\n")}
            </tbody>
          </table></div>
        </section>
        <section class="panel">
          <div class="panel-head"><div><p class="kicker">STATIONS</p><h2>提供 ${esc(label)} 的站点</h2></div><p class="panel-desc">按该系列最低综合倍率排序。</p></div>
${(() => {
  const list = [...stationAgg.entries()]
    .map(([stationId, agg]) => ({ stationId, agg }))
    .sort((a, b) => (a.agg.best ?? 9) - (b.agg.best ?? 9));
  if (list.length === 0) return `<p class="table-note">暂无报价。</p>`;
  return `<div class="table-wrap"><table class="rank-table"><thead><tr><th>站点</th><th class="col-num">报价</th><th class="col-num">最低倍率</th><th>涉及模型</th></tr></thead><tbody>
${list
  .map(
    ({ stationId, agg }) => `              <tr><td><a class="station-name" href="../stations/${esc(stationId)}.html">${esc(siteById.get(stationId)?.name || stationId)}</a></td><td class="col-num">${agg.count}</td><td class="col-num">${agg.best != null ? formatMultiplier(agg.best) : "—"}</td><td class="group-cell">${esc([...agg.models].slice(0, 4).join("、"))}</td></tr>`,
  )
  .join("\n")}
            </tbody></table></div>`;
})()}
        </section>
        <section class="panel">
          <p class="table-note">其他系列：${FAMILY_ORDER.filter((item) => item !== family)
            .map((item) => `<a href="${item}.html">${esc(FAMILY_LABELS[item] || item)}</a>`)
            .join(" · ")} · <a href="../index.html">返回价格榜</a></p>
        </section>`;

  fs.writeFileSync(
    path.join(root, "families", `${family}.html`),
    shell({
      title: `${label} 中转站与报价对比 · AI API 比价雷达`,
      description: `${label} 系列在 ${stationAgg.size} 个中转站的报价对比，共 ${familyModels.length} 个模型、${familyRows.length} 条记录，含官方价与综合倍率。`,
      canonical: `${BASE}/families/${family}.html`,
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${label} 中转站与报价`,
        url: `${BASE}/families/${family}.html`,
        dateModified: LASTMOD,
      },
    }),
  );
}

/* ---------- sitemap / robots ---------- */
const urls = [
  { loc: `${BASE}/`, priority: "1.0", freq: "hourly" },
  { loc: `${BASE}/stations/index.html`, priority: "0.8", freq: "daily" },
  { loc: `${BASE}/models/index.html`, priority: "0.8", freq: "daily" },
  { loc: `${BASE}/guides/index.html`, priority: "0.8", freq: "weekly" },
  ...guides.map((guide) => ({ loc: `${BASE}/guides/${guide.slug}.html`, priority: "0.75", freq: "monthly" })),
  ...familyPages.map((page) => ({ loc: page.loc, priority: "0.7", freq: "daily" })),
  { loc: `${BASE}/method.html`, priority: "0.5", freq: "monthly" },
  { loc: `${BASE}/faq.html`, priority: "0.6", freq: "monthly" },
  { loc: `${BASE}/changelog.html`, priority: "0.4", freq: "weekly" },
  ...sites.map((site) => ({ loc: `${BASE}/stations/${site.id}.html`, priority: "0.6", freq: "daily" })),
  ...models.map((model) => ({ loc: `${BASE}/models/${modelSlug(model.id)}.html`, priority: "0.7", freq: "daily" })),
];
fs.writeFileSync(
  path.join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url><loc>${url.loc}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${url.freq}</changefreq><priority>${url.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`,
);
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

/* ---------- 首页静态快照 ---------- */
const indexFile = path.join(root, "index.html");
let indexHtml = fs.readFileSync(indexFile, "utf8");
const ranked = [...comparable].sort((a, b) => a.effectiveBlended - b.effectiveBlended);
const topStations = [...stationBestRow.entries()]
  .sort((a, b) => a[1].effectiveBlended - b[1].effectiveBlended)
  .slice(0, 10);

const snapshot = `<!-- SNAPSHOT:START -->
        <section class="panel" id="snapshot">
          <div class="panel-head">
            <div>
              <p class="kicker">00 / DATA SNAPSHOT</p>
              <h2>数据快照</h2>
            </div>
            <p class="panel-desc">这一块是构建时写入的静态内容，不依赖脚本，供搜索引擎与无 JS 环境读取。最后更新 ${esc(LASTMOD)}。</p>
          </div>
          <p class="table-note">收录 ${sites.length} 个站点、${rows.length} 条报价，其中 ${comparable.length} 条口径统一可比。官方基准价覆盖 ${models.filter((model) => model.official).length} 个模型。</p>
          <div class="table-wrap">
            <table class="rank-table">
              <thead><tr><th class="col-rank">#</th><th>站点</th><th class="col-num">评分</th><th>最低分组</th><th>代表模型</th><th class="col-num">综合倍率</th><th class="col-num">输入 ¥/M</th><th class="col-num">输出 ¥/M</th><th>核验</th></tr></thead>
              <tbody>
${topStations
  .map(
    ([stationId, row], index) => `                <tr><td class="col-rank">${String(index + 1).padStart(2, "0")}</td><td><a class="station-name" href="stations/${esc(stationId)}.html">${esc(siteById.get(stationId)?.name || stationId)}</a></td><td class="col-num">${scoreBadge(stationScores.get(stationId), siteById.get(stationId)?.name || stationId)}</td><td class="group-cell">${esc(row.groupName)}</td><td>${esc(modelDisplay(row))}</td><td class="col-num"><strong class="ratio is-low">${formatMultiplier(row.effectiveBlended)}</strong></td><td class="col-num">${formatCny(row.inputCny)}</td><td class="col-num">${formatCny(row.outputCny)}</td><td class="date-cell">${formatDate(row.verifiedAt)}</td></tr>`,
  )
  .join("\n")}
              </tbody>
            </table>
          </div>
          <p class="table-note">模型索引：${models
            .map((model) => `<a href="models/${modelSlug(model.id)}.html">${esc(model.displayName)}</a>`)
            .join(" · ")}</p>
          <p class="table-note">指南：${guides.map((guide) => `<a href="guides/${esc(guide.slug)}.html">${esc(guide.title)}</a>`).join(" · ")}</p>
          <p class="table-note">站点索引：${sites.map((site) => `<a href="stations/${esc(site.id)}.html">${esc(site.name)}</a>`).join(" · ")}</p>
          <p class="table-note">按系列：${familyPages.map((page) => `<a href="families/${esc(page.family)}.html">${esc(page.label)}</a>`).join(" · ")}</p>
          <p class="table-note">说明：<a href="method.html">收录原则与核验方法</a> · <a href="faq.html">常见问题</a> · <a href="changelog.html">数据变更记录</a></p>
        </section>
        <!-- SNAPSHOT:END -->`;

if (indexHtml.includes("<!-- SNAPSHOT:START -->") && indexHtml.includes("<!-- SNAPSHOT:END -->")) {
  indexHtml = indexHtml.replace(/<!-- SNAPSHOT:START -->[\s\S]*?<!-- SNAPSHOT:END -->/, snapshot);
} else {
  indexHtml = indexHtml.replace(/(<section class="panel" id="ranking">)/, `${snapshot}\n\n        $1`);
}
fs.writeFileSync(indexFile, indexHtml);

console.log(`generated ${sites.length} station pages, ${models.filter((model) => model.official).length} model pages, sitemap with ${urls.length} urls`);
