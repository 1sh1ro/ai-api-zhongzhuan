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
import { scoreStation, buildModelPercentiles } from "../assets/scoring.js";
import { fetchPopularitySnapshot, writePopularitySnapshot, MIN_SAMPLE } from "./fetch-popularity.mjs";
import { buildPopularPage, buildTopicPages } from "./seo-builders.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const sitesData = readJSON("data/sites.json");
const modelsData = readJSON("data/models.json");
const offersData = readJSON("data/offers.json");
const config = readJSON("data/pricing-config.json");
const scope = readJSON("data/model-scope.json");
const version = readJSON("data/version.json");
const guides = readJSON("data/guides.json").guides;
const registrationsData = readJSON("data/registrations.json");

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
const registrationsByStation = new Map(
  (registrationsData.registrations || []).map((item) => [item.stationId, item]),
);
const modelById = new Map(models.map((model) => [model.id, model]));
const stationBestRow = stationBest(rows);
const modelBestRow = modelBest(rows.filter((row) => row.modelBasis === "stated"));
const percentiles = buildModelPercentiles(rows);
const stationScores = new Map(
  sites.map((site) => [site.id, scoreStation(site, rows.filter((row) => row.stationId === site.id), modelById, LASTMOD, percentiles)]),
);

function bestStationRowsForModel(modelId) {
  const byStation = new Map();
  for (const row of rows) {
    if (!row.comparable || row.modelId !== modelId) continue;
    const current = byStation.get(row.stationId);
    if (!current || row.effectiveBlended < current.effectiveBlended) byStation.set(row.stationId, row);
  }
  return [...byStation.values()].sort((a, b) => a.effectiveBlended - b.effectiveBlended);
}

function modelRankFor(stationId, modelId) {
  const list = bestStationRowsForModel(modelId);
  const index = list.findIndex((row) => row.stationId === stationId);
  return { rank: index + 1, total: list.length, best: list[0] ? list[0].effectiveBlended : null };
}

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

function socialTags({ title, description, canonical, type = "article", prefix = "../" }) {
  return `    <link rel="canonical" href="${esc(canonical)}" />
    <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="${prefix}assets/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="${prefix}assets/apple-touch-icon.png" />
    <link rel="alternate" type="text/plain" href="${BASE}/llms.txt" title="LLM digest" />
    <meta property="og:type" content="${esc(type)}" />
    <meta property="og:site_name" content="AI API 比价雷达" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:image" content="${BASE}/assets/og-cover.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="zh_CN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${BASE}/assets/og-cover.png" />`;
}

function navBar(prefix) {
  return `      <header class="topbar">
        <a class="brand" href="${prefix}index.html" aria-label="AI API 比价雷达首页">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-text"><strong>AI API 比价雷达</strong><small>RELAY PRICE RADAR</small></span>
        </a>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" />
        <label for="nav-toggle" class="nav-toggle-label" aria-label="打开菜单"><span></span></label>
        <nav class="topnav" aria-label="主导航">
          <a href="${prefix}index.html">价格榜</a>
          <a href="${prefix}popular/index.html">人气榜</a>
          <a href="${prefix}stations/index.html">站点</a>
          <a href="${prefix}models/index.html">模型</a>
          <a href="${prefix}guides/index.html">指南</a>
          <a href="${prefix}method.html">方法</a>
          <a href="${prefix}faq.html">常见问题</a>
          <a href="https://github.com/1sh1ro/ai-api-zhongzhuan" target="_blank" rel="noreferrer noopener">GitHub ↗</a>
        </nav>
      </header>`;
}

function crumbsHtml(items) {
  if (!items?.length) return "";
  return `        <nav class="crumbs" aria-label="面包屑">${items
    .map((item, index) => (index === items.length - 1
      ? `<span aria-current="page">${esc(item.name)}</span>`
      : `<a href="${esc(item.href)}">${esc(item.name)}</a><span aria-hidden="true">/</span>`))
    .join("")}</nav>`;
}

function crumbsJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function renderJsonLd(jsonLd) {
  const list = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);
  return list.map((item) => `    <script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n");
}

function groupRisk(groupName = "", note = "") {
  const text = `${groupName} ${note}`;
  if (/kiro|krio|逆向/i.test(text)) return { level: "kiro", label: "疑似 Kiro/逆向" };
  if (/号池/.test(text)) return { level: "pool", label: "号池" };
  if (/cc\s*-?max|ccmax/i.test(text)) return { level: "ccmax", label: "疑似 Max 号池" };
  return null;
}

function riskBadge(groupName, note) {
  const risk = groupRisk(groupName, note);
  if (!risk) return "";
  return `<span class="risk-badge risk-${esc(risk.level)}" title="根据分组名称标注，未做实际调用验真">${esc(risk.label)}</span>`;
}

function hasAffLink(site) {
  if (!site) return false;
  for (const value of [site.homepage, site.registrationUrl]) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if ([...url.searchParams.keys()].some((key) => REFERRAL_PARAM_KEYS.includes(key.toLowerCase()))) return true;
    } catch {
      /* ignore invalid */
    }
  }
  return false;
}

function shell({ title, description, canonical, body, jsonLd, prefix = "../", breadcrumbs = [] }) {
  const allLd = [...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []), breadcrumbs.length ? crumbsJsonLd(breadcrumbs) : null];
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#f6f7f5" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
${socialTags({ title, description, canonical, prefix })}
    <link rel="stylesheet" href="${prefix}styles.css?v=${esc(BUILD)}" />
${renderJsonLd(allLd)}
  </head>
  <body>
    <a class="skip-link" href="#main">跳到正文</a>
    <div class="page">
${navBar(prefix)}
      <main id="main">
${crumbsHtml(breadcrumbs)}
${body}
      </main>
      <footer class="footer">
        <div class="footer-meta">
          <span>AI API 比价雷达 · RELAY PRICE RADAR</span>
          <p class="disclosure">部分注册链接带有推广参数，已在对应站点页标明。排序与综合评分不按推广收益计算。本站只整理公开信息，不运营、不担保任何第三方中转服务。</p>
        </div>
        <span>数据构建 ${esc(BUILD)} · 最后更新 ${esc(LASTMOD)} · <a href="${prefix}llms.txt">llms.txt</a></span>
      </footer>
    </div>
    <script src="${prefix}assets/score-tip.js?v=${esc(BUILD)}" defer></script>
    <script type="module" src="${prefix}assets/popularity.js?v=${esc(BUILD)}"></script>
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
          <td class="group-cell">${esc(row.groupName)}${riskBadge(row.groupName, row.note)}</td>
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
  const comparableCount = stationRows.filter((row) => row.comparable).length;
  const comparableModels = [...new Set(stationRows.filter((row) => row.comparable).map((row) => row.modelId))];
  const rankedModels = comparableModels
    .map((modelId) => ({ modelId, info: modelRankFor(site.id, modelId) }))
    .filter((item) => item.info.total >= 2)
    .sort((a, b) => b.info.total - a.info.total);
  const statusLabel = {
    "registration-page-reachable": "注册页可达",
    "manual-verification-required": "需要人工核验",
    degraded: "服务降级",
    "automated-access-blocked": "自动访问受阻",
  }[site.status] || site.status || "状态未知";
  const score = stationScores.get(site.id);
  const registration = registrationsByStation.get(site.id);
  const registrationLine = registration
    ? `通过本站链接注册 ${registration.count} 人（${esc(registration.period)}）。`
    : "";

  const summaryLine = comparableModels.length
    ? `覆盖 ${comparableModels.length} 个可比模型，其中 ${rankedModels.length} 个模型有多站可比。`
    : "暂无口径统一的可比报价。";

  const modelRankTable = rankedModels.length
    ? `<div class="table-wrap"><table class="rank-table"><thead><tr><th>模型</th><th class="col-num">本店倍率</th><th class="col-num">同模型排名</th><th class="col-num">可比站点</th></tr></thead><tbody>
${rankedModels
  .map(({ modelId, info }) => {
    const row = stationRows.find((item) => item.modelId === modelId && item.comparable);
    return `              <tr><td><a class="station-name" href="../models/${esc(modelSlug(modelId))}.html">${esc(modelById.get(modelId)?.displayName || modelId)}</a></td><td class="col-num">${row ? formatMultiplier(row.effectiveBlended) : "—"}</td><td class="col-num">${info.rank} / ${info.total}</td><td class="col-num">${info.total}</td></tr>`;
  })
  .join("\n")}
            </tbody></table></div>`
    : `<p class="table-note">该站暂没有与其他站点重叠的可比模型。</p>`;

  const body = `        <section class="hero">
          <p class="eyebrow">STATION · ${esc(site.id)}</p>
          <h1>${esc(site.name)} 的 API 报价与核验记录</h1>
          <p class="lede">${esc(site.summary)}</p>
          <p class="hero-note">状态 ${esc(statusLabel)} · 核验 ${esc(formatDate(site.verifiedAt))} · ${stationRows.length} 条报价，其中 ${comparableCount} 条口径统一可比。${summaryLine}综合评分 ${score.total.toFixed(1)}（${score.grade}）。本月站内点击 <strong data-click-count="${esc(site.id)}">—</strong> 次。${registrationLine}${hasAffLink(site) ? "该页「打开站点」带推广参数。" : ""}</p>
          ${stationRows.some((row) => groupRisk(row.groupName, row.note)) ? '<p class="hero-note">该站部分分组名称含 Kiro、逆向、号池或 CC Max，已在报价表中标注；这是根据名称做的风险提示，未做实际调用验真。</p>' : ""}
          <p><a class="button button-primary" href="${esc(siteLink(site))}" rel="nofollow noopener" target="_blank" data-station-link="${esc(site.id)}">打开站点 ↗</a>${hasAffLink(site) ? '<span class="aff-badge">推广</span>' : ""}</p>
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
          <div class="panel-head"><div><p class="kicker">MODEL RANK</p><h2>同模型排名</h2></div>
          <p class="panel-desc">只在同一个模型内和其他站点比较，不同模型的倍率不放在一起排名。</p></div>
          ${modelRankTable}
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
      title: `${site.name} API 中转报价与综合倍率 · AI API 比价雷达`,
      description: `${site.name} 的 API 中转报价：${stationRows.length} 条记录，${comparableCount} 条口径统一可比。${stationBestRow.get(site.id) ? `当前最低综合倍率 ${formatMultiplier(stationBestRow.get(site.id).effectiveBlended)}。` : "暂无可比综合倍率。"}${comparableModels.length ? `覆盖 ${comparableModels.length} 个可比模型。` : ""}核验于 ${formatDate(site.verifiedAt)}。`,
      canonical: `${BASE}/stations/${site.id}.html`,
      body,
      jsonLd,
      breadcrumbs: [
        { name: "首页", href: "../index.html", url: `${BASE}/` },
        { name: "站点", href: "./index.html", url: `${BASE}/stations/` },
        { name: site.name, href: `./${site.id}.html`, url: `${BASE}/stations/${site.id}.html` },
      ],
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
          <p class="lede">共 ${sites.length} 个站点，按综合评分从高到低排序。每页列出该站点的评分明细、同模型排名、全部报价与核验日期。</p>
        </section>
        <section class="panel">
          <div class="table-wrap"><table class="rank-table">
            <thead><tr><th>站点</th><th class="col-num">评分</th><th>状态</th><th class="col-num">报价</th><th class="col-num">可比条目</th><th class="col-num">可比模型</th><th>核验</th></tr></thead>
            <tbody>
${[...sites]
  .sort((a, b) => (stationScores.get(b.id)?.total ?? 0) - (stationScores.get(a.id)?.total ?? 0))
  .map((site) => {
    const stationRows = rows.filter((row) => row.stationId === site.id);
    const modelCount = new Set(stationRows.filter((row) => row.comparable).map((row) => row.modelId)).size;
    const score = stationScores.get(site.id);
    return `              <tr><td><a class="station-name" href="${esc(site.id)}.html">${esc(site.name)}</a></td><td class="col-num">${scoreBadge(score, site.name)}</td><td class="group-cell">${esc(STATUS_LABELS[site.status] || site.status)}</td><td class="col-num">${stationRows.length}</td><td class="col-num">${stationRows.filter((row) => row.comparable).length}</td><td class="col-num">${modelCount}</td><td class="date-cell">${formatDate(site.verifiedAt)}</td></tr>`;
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
    breadcrumbs: [
      { name: "首页", href: "../index.html", url: `${BASE}/` },
      { name: "模型", href: "./index.html", url: `${BASE}/models/` },
    ],
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
    breadcrumbs: [
      { name: "首页", href: "../index.html", url: `${BASE}/` },
      { name: "指南", href: "./index.html", url: `${BASE}/guides/` },
    ],
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
      breadcrumbs: [
        { name: "首页", href: "../index.html", url: `${BASE}/` },
        { name: `${label} 系列`, href: `./${family}.html`, url: `${BASE}/families/${family}.html` },
      ],
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

function writeLlmsFiles() {
  const leaderLines = models
    .map((model) => {
      const list = bestStationRowsForModel(model.id);
      if (!list.length) return null;
      const best = list[0];
      const station = siteById.get(best.stationId)?.name || best.stationId;
      return `- ${model.displayName}：最低 ${formatMultiplier(best.effectiveBlended)}（${station}，${list.length} 站可比） · ${BASE}/models/${modelSlug(model.id)}.html`;
    })
    .filter(Boolean);

  const digest = `# AI API 比价雷达

> 中文开源目录：以厂商官方价为分母，把各中转站的充值系数、分组倍率与绝对单价折算成综合倍率。最后更新 ${LASTMOD}（构建 ${BUILD}）。

- 网站：${BASE}/
- 站点索引：${BASE}/stations/index.html
- 模型索引：${BASE}/models/index.html
- 使用指南：${BASE}/guides/index.html
- 人气榜：${BASE}/popular/
- 专题：${BASE}/topics/
- 核验方法：${BASE}/method.html
- 常见问题：${BASE}/faq.html
- 完整机器可读摘要：${BASE}/llms-full.txt
- 原始数据：${BASE}/data/sites.json 、 ${BASE}/data/offers.json 、 ${BASE}/data/models.json
- 源代码：https://github.com/1sh1ro/ai-api-zhongzhuan

## 当前规模

收录 ${sites.length} 个站点、${rows.length} 条报价，其中 ${comparable.length} 条口径统一可比；官方基准模型 ${models.filter((model) => model.official).length} 个；折算汇率 1 USD = ${config.fxCnyPerUsd} CNY。

口径没有公开充值系数的报价只展示原值，不进入排名。低倍率不等于可用、稳定或模型真实。中转站能看到经它转发的请求，不要提交密钥、证件或私有代码。部分注册链接带推广参数，已在站点页标明，不影响排序。本站不运营任何中转服务。

## 各模型当前最低可比价

${leaderLines.join("\n")}

## 关键术语

- 综合倍率：站点单价 ÷ 官方单价（均为人民币 / 百万 tokens）。1.00x 等于官方价，0.10x 约为官方价的一折。
- 充值系数：充 1 元人民币能换多少站内额度。
- 分组倍率：同一模型不同线路的站内乘数，需结合充值系数才能和官方价比较。
`;

  const stationLines = sites
    .map((site) => {
      const score = stationScores.get(site.id);
      const stationRows = rows.filter((row) => row.stationId === site.id);
      const comparableCount = stationRows.filter((row) => row.comparable).length;
      const best = stationBestRow.get(site.id);
      const status = STATUS_LABELS[site.status] || site.status || "状态未知";
      const bestText = best ? `最低综合倍率 ${formatMultiplier(best.effectiveBlended)}` : "暂无可比报价";
      return `- ${site.name}（${status}，评分 ${score ? score.total.toFixed(1) : "—"}，${stationRows.length} 条报价 / ${comparableCount} 条可比，${bestText}）：${BASE}/stations/${site.id}.html`;
    })
    .join("\n");

  const full = `${digest}

## 全部站点

${stationLines}

## 引用与局限

## 专题与人气

- ${BASE}/topics/claude-api-zhongzhuan.html
- ${BASE}/topics/pianyi-claude-api.html
- ${BASE}/topics/deepseek-api-mianfei.html
- ${BASE}/topics/gpt-api-zhongzhuan.html
- ${BASE}/topics/gemini-api-mianfei.html
- ${BASE}/topics/gongyi-zhan.html
- 人气榜 ${BASE}/popular/ ：按本站出站点击去重，当月至少 3 次才进入正式排名；点击不等于注册量。构建时若计数器尚无足够样本，页面会如实留空，不编造数字。

## 引用与局限

价格来自站点公开价格页或接口、用户提交与截图，每条记录保留来源链接和核验日期。本站不做真实 API 调用验真，数字会过期。完整方法见 ${BASE}/method.html 。人气口径见 ${BASE}/docs/popularity.md 。
`;

  fs.writeFileSync(path.join(root, "llms.txt"), digest);
  fs.writeFileSync(path.join(root, "llms-full.txt"), full);
}

/* ---------- sitemap / robots ---------- */
const urls = [
  { loc: `${BASE}/`, priority: "1.0", freq: "daily" },
  { loc: `${BASE}/stations/index.html`, priority: "0.8", freq: "daily" },
  { loc: `${BASE}/models/index.html`, priority: "0.8", freq: "daily" },
  { loc: `${BASE}/guides/index.html`, priority: "0.8", freq: "weekly" },
  { loc: `${BASE}/popular/`, priority: "0.7", freq: "daily" },
  { loc: `${BASE}/topics/`, priority: "0.75", freq: "weekly" },
  ...((JSON.parse(fs.readFileSync(path.join(root, "data/topics.json"), "utf8")).topics) || []).map((topic) => ({ loc: `${BASE}/topics/${topic.slug}.html`, priority: "0.75", freq: "weekly" })),
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
fs.writeFileSync(
  path.join(root, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n\n# Machine-readable summary for AI assistants:\n# ${BASE}/llms.txt\n# ${BASE}/llms-full.txt\n`,
);

/* ---------- 首页静态快照 ---------- */
const indexFile = path.join(root, "index.html");
let indexHtml = fs.readFileSync(indexFile, "utf8");
const modelLeaders = models
  .map((model) => {
    const list = bestStationRowsForModel(model.id);
    return list.length >= 2 ? { model, best: list[0], count: list.length } : null;
  })
  .filter(Boolean)
  .sort((a, b) => b.count - a.count || a.model.displayName.localeCompare(b.model.displayName, "zh-CN"))
  .slice(0, 12);

const snapshot = `<!-- SNAPSHOT:START -->
        <section class="panel" id="snapshot">
          <div class="panel-head">
            <div>
              <p class="kicker">00 / DATA SNAPSHOT</p>
              <h2>数据快照</h2>
            </div>
            <p class="panel-desc">按模型查看当前最低价站点，点站点名进入详情。数据核验截至 ${esc(LASTMOD)}。</p>
          </div>
          <p class="table-note">收录 ${sites.length} 个站点、${rows.length} 条报价，其中 ${comparable.length} 条口径统一可比。下表每个模型单独比较，列出该模型当前最低价的站点。</p>
          <div class="table-wrap">
            <table class="rank-table">
              <thead><tr><th>模型</th><th class="col-num">官方输入 ¥/M</th><th class="col-num">官方输出 ¥/M</th><th>最低站点</th><th class="col-num">本模型倍率</th><th class="col-num">可比站点</th></tr></thead>
              <tbody>
${modelLeaders
  .map(({ model, best, count }) => {
    const rate = model.official ? (model.official.currency === "CNY" ? 1 : config.fxCnyPerUsd) : 1;
    return `                <tr><td><a class="station-name" href="models/${esc(modelSlug(model.id))}.html">${esc(model.displayName)}</a></td><td class="col-num">${model.official ? formatCny(model.official.inputPer1M * rate) : "—"}</td><td class="col-num">${model.official ? formatCny(model.official.outputPer1M * rate) : "—"}</td><td><a class="station-name" href="stations/${esc(best.stationId)}.html">${esc(siteById.get(best.stationId)?.name || best.stationId)}</a></td><td class="col-num"><strong class="ratio is-low">${formatMultiplier(best.effectiveBlended)}</strong></td><td class="col-num">${count}</td></tr>`;
  })
  .join("\n")}
              </tbody>
            </table>
          </div>
          <details class="index-fold">
            <summary>展开模型、站点与指南索引（供检索与引用）</summary>
            <p class="table-note">模型索引：${models
            .map((model) => `<a href="models/${modelSlug(model.id)}.html">${esc(model.displayName)}</a>`)
            .join(" · ")}</p>
            <p class="table-note">指南：${guides.map((guide) => `<a href="guides/${esc(guide.slug)}.html">${esc(guide.title)}</a>`).join(" · ")}</p>
            <p class="table-note">站点索引：${sites.map((site) => `<a href="stations/${esc(site.id)}.html">${esc(site.name)}</a>`).join(" · ")}</p>
            <p class="table-note">按系列：${familyPages.map((page) => `<a href="families/${esc(page.family)}.html">${esc(page.label)}</a>`).join(" · ")}</p>
            <p class="table-note">说明：<a href="method.html">收录原则与核验方法</a> · <a href="faq.html">常见问题</a> · <a href="changelog.html">数据变更记录</a> · <a href="popular/index.html">人气榜</a> · <a href="topics/index.html">专题</a></p>
          </details>
        </section>
        <!-- SNAPSHOT:END -->`;

const registrationEntries = [...registrationsByStation.values()]
  .filter((item) => siteById.has(item.stationId))
  .sort((a, b) => b.count - a.count || a.stationId.localeCompare(b.stationId));
const registrationsHtml = registrationEntries.length
  ? `
        <section class="panel" id="registrations">
          <div class="panel-head">
            <div>
              <p class="kicker">REGISTRATIONS</p>
              <h2>通过本站链接注册</h2>
            </div>
            <p class="panel-desc">由维护者从各站点推广后台手工抄录，按统计周期记录。注册量只有站点自己知道，这里只统计能确认的推广数据。</p>
          </div>
          <div class="table-wrap">
            <table class="rank-table">
              <thead><tr><th class="col-rank">#</th><th>站点</th><th class="col-num">注册人数</th><th>统计周期</th><th>更新时间</th><th>来源</th></tr></thead>
              <tbody>
${registrationEntries
  .map(
    (item, index) => `                <tr><td class="col-rank">${String(index + 1).padStart(2, "0")}</td><td><a class="station-name" href="stations/${esc(item.stationId)}.html">${esc(siteById.get(item.stationId)?.name || item.stationId)}</a></td><td class="col-num"><strong class="ratio is-low">${item.count}</strong></td><td>${esc(item.period)}</td><td class="date-cell">${esc(item.updatedAt)}</td><td class="group-cell">${esc(item.source || "")}</td></tr>`,
  )
  .join("\n")}
              </tbody>
            </table>
          </div>
          <p class="table-note">更新方式见 docs/registrations.md。该榜单不参与价格排名和评分。</p>
        </section>`
  : "";
const registrationBlock = `<!-- REGISTRATIONS:START -->${registrationsHtml}<!-- REGISTRATIONS:END -->`;
if (indexHtml.includes("<!-- REGISTRATIONS:START -->") && indexHtml.includes("<!-- REGISTRATIONS:END -->")) {
  indexHtml = indexHtml.replace(/<!-- REGISTRATIONS:START -->[\s\S]*?<!-- REGISTRATIONS:END -->/, registrationBlock);
} else {
  indexHtml = indexHtml.replace(/(<section class="panel" id="models">)/, `${registrationBlock}\n\n        $1`);
}

if (indexHtml.includes("<!-- SNAPSHOT:START -->") && indexHtml.includes("<!-- SNAPSHOT:END -->")) {
  indexHtml = indexHtml.replace(/<!-- SNAPSHOT:START -->[\s\S]*?<!-- SNAPSHOT:END -->/, snapshot);
} else {
  indexHtml = indexHtml.replace(/(<section class="panel" id="ranking">)/, `${snapshot}\n\n        $1`);
}

const officialModels = models.filter((model) => model.official);
const stationsWithOffer = new Set(rows.map((row) => row.stationId)).size;
const latestVerified = rows.map((row) => row.verifiedAt).filter(Boolean).sort().at(-1);
const heroStats = `<!-- HERO-STATS:START -->
          <div class="hero-stats" id="hero-stats">
            <div class="stat"><span>收录站点</span><strong id="stat-stations">${sites.length}</strong></div>
            <div class="stat"><span>报价条目</span><strong id="stat-offers">${rows.length}</strong></div>
            <div class="stat"><span>可比条目</span><strong id="stat-comparable">${comparable.length}</strong></div>
            <div class="stat"><span>官方基准</span><strong id="stat-models">${officialModels.length}</strong></div>
            <div class="stat"><span>折算汇率</span><strong id="stat-fx">1:${esc(config.fxCnyPerUsd)}</strong></div>
          </div>
          <p class="hero-note" id="hero-note">最近一次报价核验 ${formatDate(latestVerified)} · 其中 ${sites.length - stationsWithOffer} 个站点暂无可用报价（见站点目录）</p>
          <!-- HERO-STATS:END -->`;
if (indexHtml.includes("<!-- HERO-STATS:START -->") && indexHtml.includes("<!-- HERO-STATS:END -->")) {
  indexHtml = indexHtml.replace(/<!-- HERO-STATS:START -->[\s\S]*?<!-- HERO-STATS:END -->/, heroStats);
}

const defaultModel = modelLeaders[0];
if (defaultModel && indexHtml.includes("<!-- RANK-PRERENDER:START -->")) {
  const defaultRows = bestStationRowsForModel(defaultModel.model.id);
  const rankHead = `              <thead id="rank-head"><tr><th class="col-rank">#</th><th>站点</th><th class="col-num">评分</th><th>分组</th><th class="col-num">本模型倍率</th><th class="col-num">输入 ¥/M</th><th class="col-num">输出 ¥/M</th><th class="col-num">相对官方价</th><th>核验</th></tr></thead>`;
  const rankBody = `              <tbody id="rank-body">
${defaultRows
  .map((row, index) => {
    const score = stationScores.get(row.stationId);
    const discount = row.effectiveBlended != null ? formatDiscount(row.effectiveBlended) : "—";
    return `                <tr><td class="col-rank">${String(index + 1).padStart(2, "0")}</td><td><a class="station-name" href="stations/${esc(row.stationId)}.html">${esc(siteById.get(row.stationId)?.name || row.stationId)}</a></td><td class="col-num">${score ? score.total.toFixed(1) : "—"}</td><td class="group-cell">${esc(row.groupName)}</td><td class="col-num"><strong class="ratio ${row.effectiveBlended < 1 ? "is-low" : ""}">${formatMultiplier(row.effectiveBlended)}</strong></td><td class="col-num">${formatCny(row.inputCny)}</td><td class="col-num">${formatCny(row.outputCny)}</td><td class="col-num">${esc(discount)}</td><td class="date-cell">${formatDate(row.verifiedAt)}</td></tr>`;
  })
  .join("\n")}
              </tbody>`;
  const prerender = `<!-- RANK-PRERENDER:START -->\n${rankHead}\n${rankBody}\n              <!-- RANK-PRERENDER:END -->`;
  indexHtml = indexHtml.replace(/<!-- RANK-PRERENDER:START -->[\s\S]*?<!-- RANK-PRERENDER:END -->/, prerender);
}

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "各模型当前最低价中转站",
  url: `${BASE}/`,
  numberOfItems: modelLeaders.length,
  itemListElement: modelLeaders.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: `${item.model.displayName} · ${siteById.get(item.best.stationId)?.name || item.best.stationId} ${formatMultiplier(item.best.effectiveBlended)}`,
    url: `${BASE}/models/${modelSlug(item.model.id)}.html`,
  })),
};
const itemListBlock = `    <!-- ITEM-LIST-JSONLD:START -->
    <script type="application/ld+json">${JSON.stringify(itemList)}</script>
    <!-- ITEM-LIST-JSONLD:END -->`;
if (indexHtml.includes("<!-- ITEM-LIST-JSONLD:START -->")) {
  indexHtml = indexHtml.replace(/<!-- ITEM-LIST-JSONLD:START -->[\s\S]*?<!-- ITEM-LIST-JSONLD:END -->/, itemListBlock);
} else {
  indexHtml = indexHtml.replace("</head>", `${itemListBlock}\n  </head>`);
}

/* ---------- 人气快照与专题页 ---------- */
const popularitySnapshot = await fetchPopularitySnapshot(sites.map((site) => site.id));
writePopularitySnapshot(root, popularitySnapshot);

const monthEntries = Object.entries(popularitySnapshot.monthClicks || {}).sort((a, b) => b[1] - a[1]);
const popularPreview = monthEntries
  .filter(([, count]) => count >= (popularitySnapshot.minSample || MIN_SAMPLE))
  .slice(0, 10);
const popularBlock = popularPreview.length
  ? popularPreview
      .map(([stationId, count], index) => {
        const score = stationScores.get(stationId);
        return `                <tr><td class="col-rank">${String(index + 1).padStart(2, "0")}</td><td><a class="station-name" href="stations/${esc(stationId)}.html">${esc(siteById.get(stationId)?.name || stationId)}</a></td><td class="col-num">${count}</td><td class="col-num">${score ? score.total.toFixed(1) : "—"}</td></tr>`;
      })
      .join("\n")
  : `                <tr><td class="empty-cell" colspan="4">本月公开计数器里还没有达到 ${popularitySnapshot.minSample || MIN_SAMPLE} 次去重点击门槛的站点。完整口径见 <a href="popular/index.html">人气榜</a>。</td></tr>`;
if (indexHtml.includes("<!-- POPULARITY-PRERENDER:START -->")) {
  indexHtml = indexHtml.replace(
    /<!-- POPULARITY-PRERENDER:START -->[\s\S]*?<!-- POPULARITY-PRERENDER:END -->/,
    `<!-- POPULARITY-PRERENDER:START -->\n              <tbody id="popularity-body">\n${popularBlock}\n              </tbody>\n              <!-- POPULARITY-PRERENDER:END -->`,
  );
}

fs.writeFileSync(indexFile, indexHtml);

const seoCtx = {
  root,
  BASE,
  LASTMOD,
  sites,
  siteById,
  stationScores,
  siteLink,
  hasAffLink,
  shell,
  esc,
  formatDate,
  formatMultiplier,
  formatCny,
  modelSlug,
  models,
  modelById,
  rows,
  comparableRows,
  offerTable,
  groupRisk,
  config,
  snapshot: popularitySnapshot,
};
buildPopularPage(seoCtx);
buildTopicPages(seoCtx);
writeLlmsFiles();

console.log(`generated ${sites.length} station pages, ${models.filter((model) => model.official).length} model pages, sitemap with ${urls.length} urls, popularity keys found ${popularitySnapshot.keysFound}`);
