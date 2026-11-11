import fs from "node:fs";
import path from "node:path";
import { rankCounts, MIN_SAMPLE } from "./fetch-popularity.mjs";

function readJSON(root, relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}

export function buildPopularPage(ctx) {
  const { root, BASE, LASTMOD, sites, siteById, stationScores, siteLink, hasAffLink, shell, esc, formatDate, snapshot } = ctx;
  const monthClicks = new Map(Object.entries(snapshot.monthClicks || {}));
  const weekClicks = new Map(Object.entries(snapshot.last7Clicks || {}));
  const { ranked, underSample } = rankCounts(monthClicks, snapshot.minSample || MIN_SAMPLE);
  const weekRanked = rankCounts(weekClicks, snapshot.minSample || MIN_SAMPLE).ranked;

  const visitDays = Object.entries(snapshot.visits || {}).sort(([a], [b]) => a.localeCompare(b));
  const maxVisit = Math.max(0, ...visitDays.map(([, value]) => value));

  function stationRow(row, index) {
    const site = siteById.get(row.stationId);
    const score = stationScores.get(row.stationId);
    const aff = hasAffLink(site) ? '<span class="aff-badge">推广</span>' : "";
    return `<tr>
      <td class="col-rank">${String(index + 1).padStart(2, "0")}</td>
      <td><a class="station-name" href="../stations/${esc(row.stationId)}.html">${esc(site?.name || row.stationId)}</a>${aff}</td>
      <td class="col-num">${row.count}</td>
      <td class="col-num">${score ? score.total.toFixed(1) : "—"}</td>
    </tr>`;
  }

  const monthTable = ranked.length
    ? `<div class="table-wrap"><table class="rank-table"><thead><tr><th class="col-rank">#</th><th>站点</th><th class="col-num">本月去重点击</th><th class="col-num">评分</th></tr></thead><tbody>
${ranked.map(stationRow).join("\n")}
      </tbody></table></div>`
    : `<p class="table-note">截至 ${esc(snapshot.fetchedAt || LASTMOD)}，公开计数器里还没有达到门槛（当月 ${snapshot.minSample || MIN_SAMPLE} 次去重点击）的站点。构建时查询了 ${snapshot.stationsQueried} 个站点的当月键，命中 ${snapshot.keysFound} 个已有计数键。页面不会用估计值填榜。</p>`;

  const underTable = underSample.length
    ? `<div class="table-wrap"><table class="rank-table"><thead><tr><th>站点</th><th class="col-num">本月去重点击</th></tr></thead><tbody>
${underSample
  .map((row) => {
    const site = siteById.get(row.stationId);
    return `<tr><td><a class="station-name" href="../stations/${esc(row.stationId)}.html">${esc(site?.name || row.stationId)}</a></td><td class="col-num">${row.count}</td></tr>`;
  })
  .join("\n")}
      </tbody></table></div><p class="table-note">这些站点有点击，但还不到排名门槛，先不编名次。</p>`
    : "";

  const weekTable = weekRanked.length
    ? `<div class="table-wrap"><table class="rank-table"><thead><tr><th class="col-rank">#</th><th>站点</th><th class="col-num">近 7 日去重点击</th></tr></thead><tbody>
${weekRanked.map((row, index) => stationRow(row, index)).join("\n")}
      </tbody></table></div>`
    : `<p class="table-note">近 7 日榜需要按日计数键（click-站点-日期）。在 ${esc(snapshot.today || LASTMOD)} 拉取时，这些键还不存在或全为 0，因此不展示 7 日名次，也不会用月度总数去推算。</p>`;

  const visitChart = visitDays.length
    ? `<div class="visit-bars" aria-label="本站每日去重访问">
${visitDays
  .map(([day, value]) => {
    const height = maxVisit ? Math.max(8, Math.round((value / maxVisit) * 96)) : 8;
    return `        <div class="visit-bar"><strong>${value}</strong><span class="bar" style="height:${height}px"></span><em>${esc(day.slice(5))}</em></div>`;
  })
  .join("\n")}
      </div>
      <p class="table-note">以上是打开本站的去重浏览器数（上海时区按日），合计 ${snapshot.visitsTotal} 次，不能拆到各个中转站，因此不参与人气排名。</p>`
    : `<p class="table-note">构建时没有读到本站访问计数。</p>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AI API 中转站人气榜",
      url: `${BASE}/popular/`,
      dateModified: LASTMOD,
      description: "按本站出站点击去重统计的中转站人气榜，排名不可付费提升。",
      isPartOf: { "@type": "WebSite", name: "AI API 比价雷达", url: `${BASE}/` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "人气榜怎么算？",
          acceptedAnswer: { "@type": "Answer", text: "统计读者从本站点击前往某个中转站的次数。同一浏览器每天对同一站点只计一次，按上海时区的自然月汇总。当月至少 3 次才进入正式排名。" },
        },
        {
          "@type": "Question",
          name: "人气榜可以付费提升吗？",
          acceptedAnswer: { "@type": "Answer", text: "不可以。带推广参数的链接会标明「推广」，但不加分、不减分。点击不等于注册量或真实用户量。" },
        },
        {
          "@type": "Question",
          name: "为什么现在没有站点名次？",
          acceptedAnswer: { "@type": "Answer", text: "公开计数器里还没有达到当月 3 次去重点击门槛的站点。在收集到足够样本之前，本页只展示方法和本站访问量，不会编造点击数。" },
        },
      ],
    },
  ];
  if (ranked.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${snapshot.currentMonth} 中转站人气榜`,
      url: `${BASE}/popular/`,
      numberOfItems: ranked.length,
      itemListElement: ranked.map((row, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: siteById.get(row.stationId)?.name || row.stationId,
        url: `${BASE}/stations/${row.stationId}.html`,
      })),
    });
  }

  const body = `        <section class="hero">
          <p class="eyebrow">POPULARITY</p>
          <h1>AI API 中转站人气榜</h1>
          <p class="lede">按读者从本站点出去的次数排序，同一浏览器每天对同一站点只计一次。这不是各站自己的注册量，也不代表模型真实或服务稳定。排名不可以付费提升。</p>
          <p class="hero-note">快照拉取于 ${esc(snapshot.fetchedAt || LASTMOD)}，时区 ${esc(snapshot.timezone || "Asia/Shanghai")}。当月门槛 ${snapshot.minSample || MIN_SAMPLE} 次去重点击。完整口径见 <a href="../docs/popularity.md">人气榜说明</a> 与 <a href="../method.html">核验方法</a>。</p>
        </section>
        <section class="panel" id="month-rank">
          <div class="panel-head"><div><p class="kicker">THIS MONTH</p><h2>${esc(snapshot.currentMonth || "")} 去重点击榜</h2></div>
          <p class="panel-desc">数据来自公开计数器，构建时预渲染，打开页面后会再读一次当月数字。</p></div>
          ${monthTable}
          ${underTable}
        </section>
        <section class="panel" id="week-rank">
          <div class="panel-head"><div><p class="kicker">LAST 7 DAYS</p><h2>近 7 日去重点击</h2></div>
          <p class="panel-desc">只有按日计数键存在时才公布。不会用月度总数除以天数来估计。</p></div>
          ${weekTable}
        </section>
        <section class="panel" id="site-visits">
          <div class="panel-head"><div><p class="kicker">SITE VISITS</p><h2>本站访问量（不是站点人气）</h2></div>
          <p class="panel-desc">同一浏览器当天只计一次。这只能说明有人打开了比价页，不能用来给中转站排序。</p></div>
          ${visitChart}
        </section>
        <section class="panel notes">
          <div class="panel-head"><div><p class="kicker">METHOD</p><h2>读榜前先看这几条</h2></div></div>
          <div class="notes-grid">
            <div class="note-card"><h3>点击 ≠ 注册</h3><p>这里只统计从本站点出去的次数。通过本站推广链接完成的注册，要等维护者写入 registrations.json 才会另列；目前这份数据是空的。</p></div>
            <div class="note-card"><h3>去重挡不掉全部刷量</h3><p>同一浏览器每天只计一次，但清掉本地存储或换设备仍可再计。样本很少时名次会很不稳定。</p></div>
            <div class="note-card"><h3>推广链接不加分</h3><p>带 aff、ref、invite 等参数的入口会标「推广」，不进人气加分，也不影响价格排名。</p></div>
            <div class="note-card"><h3>人气高也不等于能用</h3><p>比价请看各模型的综合倍率和核验日期。低价、号池或逆向分组的风险说明见 <a href="../guides/free-relay-risks.html">风险指南</a>。</p></div>
          </div>
        </section>`;

  fs.mkdirSync(path.join(root, "popular"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "popular/index.html"),
    shell({
      title: "AI API 中转站人气榜：本月去重点击与口径说明",
      description: "按本站出站点击（同一浏览器每天对同一站点只计一次）排列中转站人气。排名不可付费提升；点击不等于注册量或服务稳定性。",
      canonical: `${BASE}/popular/`,
      body,
      jsonLd,
      prefix: "../",
      breadcrumbs: [
        { name: "首页", href: "../index.html", url: `${BASE}/` },
        { name: "人气榜", href: "./index.html", url: `${BASE}/popular/` },
      ],
    }),
  );

  return { ranked, underSample, weekRanked, visitDays };
}

export function buildTopicPages(ctx) {
  const { root, BASE, LASTMOD, sites, siteById, rows, comparableRows, models, modelById, modelSlug, formatMultiplier, formatCny, formatDate, shell, esc, offerTable, groupRisk, config } = ctx;
  const topics = readJSON(root, "data/topics.json").topics;
  const comparable = comparableRows(rows);

  function familyRows(family) {
    return rows.filter((row) => (modelById.get(row.modelId)?.family || "") === family);
  }

  function bestByStation(list) {
    const map = new Map();
    for (const row of list) {
      if (!row.comparable) continue;
      const current = map.get(row.stationId);
      if (!current || row.effectiveBlended < current.effectiveBlended) map.set(row.stationId, row);
    }
    return [...map.values()].sort((a, b) => a.effectiveBlended - b.effectiveBlended);
  }

  function modelLeaders(family) {
    const familyModels = models.filter((model) => model.family === family);
    return familyModels
      .map((model) => {
        const list = comparable.filter((row) => row.modelId === model.id);
        const byStation = new Map();
        for (const row of list) {
          const current = byStation.get(row.stationId);
          if (!current || row.effectiveBlended < current.effectiveBlended) byStation.set(row.stationId, row);
        }
        const ranked = [...byStation.values()].sort((a, b) => a.effectiveBlended - b.effectiveBlended);
        return ranked[0] ? { model, best: ranked[0], count: ranked.length } : { model, best: null, count: 0 };
      })
      .filter((item) => item.model.official);
  }

  fs.mkdirSync(path.join(root, "topics"), { recursive: true });
  const generated = [];

  for (const topic of topics) {
    const family = topic.family;
    const topicRows = family ? familyRows(family) : [];
    const leaders = family ? modelLeaders(family) : [];
    const freeRows = topicRows.filter((row) => row.pricingMode === "free" || row.basis === "free");
    const riskRows = topicRows.filter((row) => groupRisk(row.groupName, row.note));
    const benefitSites = sites.filter((site) => (site.tags || []).some((tag) => tag === "public-benefit" || tag === "free-api"));

    let tables = "";
    if (topic.focus === "public-benefit") {
      tables += `<div class="table-wrap"><table class="rank-table"><thead><tr><th>站点</th><th>状态</th><th>标签</th><th>核验</th></tr></thead><tbody>
${benefitSites
  .map((site) => {
    const status = { "registration-page-reachable": "注册页可达", "manual-verification-required": "需要人工核验", degraded: "服务降级", "automated-access-blocked": "自动访问受阻" }[site.status] || site.status;
    const tags = (site.tags || []).filter((tag) => tag === "public-benefit" || tag === "free-api" || tag === "free-image").join("、") || "—";
    return `<tr><td><a class="station-name" href="../stations/${esc(site.id)}.html">${esc(site.name)}</a></td><td>${esc(status)}</td><td>${esc(tags)}</td><td class="date-cell">${formatDate(site.verifiedAt)}</td></tr>`;
  })
  .join("\n")}
        </tbody></table></div>`;
    } else {
      if (topic.focus === "free") {
        tables += `<h2>免费额度</h2>`;
        tables += freeRows.length
          ? offerTable(freeRows, { showStation: true, showModel: true })
          : `<p class="table-note">目录里目前没有口径写明的「${esc(family)} 免费额度」报价。下面只列出可比较的按量价格，避免把付费条目说成免费。</p>`;
        if (family === "gemini" || topic.slug === "gemini-api-mianfei") {
          tables += `<h2>带公益或免费标签的站点</h2>
          <div class="table-wrap"><table class="rank-table"><thead><tr><th>站点</th><th>状态</th><th>核验</th></tr></thead><tbody>
${benefitSites
  .map((site) => {
    const status = { "registration-page-reachable": "注册页可达", "manual-verification-required": "需要人工核验", degraded: "服务降级", "automated-access-blocked": "自动访问受阻" }[site.status] || site.status;
    return `<tr><td><a class="station-name" href="../stations/${esc(site.id)}.html">${esc(site.name)}</a></td><td>${esc(status)}</td><td class="date-cell">${formatDate(site.verifiedAt)}</td></tr>`;
  })
  .join("\n")}
          </tbody></table></div>`;
        }
      }
      if (leaders.length) {
        tables += `<h2>${esc(family === "claude" ? "Claude" : family === "gpt" ? "GPT" : family === "gemini" ? "Gemini" : family === "deepseek" ? "DeepSeek" : family)} 各型号当前最低可比价</h2>
        <div class="table-wrap"><table class="rank-table"><thead><tr><th>模型</th><th class="col-num">官方输入 ¥/M</th><th class="col-num">官方输出 ¥/M</th><th>最低站点</th><th class="col-num">综合倍率</th><th class="col-num">可比站点</th></tr></thead><tbody>
${leaders
  .map(({ model, best, count }) => {
    const rate = model.official ? (model.official.currency === "CNY" ? 1 : config.fxCnyPerUsd) : 1;
    const risk = best ? groupRisk(best.groupName, best.note) : null;
    const riskMark = risk ? `<span class="risk-badge risk-${esc(risk.level)}">${esc(risk.label)}</span>` : "";
    return `<tr><td><a class="station-name" href="../models/${esc(modelSlug(model.id))}.html">${esc(model.displayName)}</a></td><td class="col-num">${model.official ? formatCny(model.official.inputPer1M * rate) : "—"}</td><td class="col-num">${model.official ? formatCny(model.official.outputPer1M * rate) : "—"}</td><td>${best ? `<a class="station-name" href="../stations/${esc(best.stationId)}.html">${esc(siteById.get(best.stationId)?.name || best.stationId)}</a>${riskMark}` : "—"}</td><td class="col-num">${best ? formatMultiplier(best.effectiveBlended) : "—"}</td><td class="col-num">${count || "—"}</td></tr>`;
  })
  .join("\n")}
        </tbody></table></div>`;
      }
      const comparableTopic = topicRows.filter((row) => row.comparable).sort((a, b) => a.effectiveBlended - b.effectiveBlended);
      const preview = (topic.focus === "cheap" ? comparableTopic.slice(0, 20) : comparableTopic.slice(0, 24));
      if (preview.length) {
        tables += `<h2>可比较的报价明细${comparableTopic.length > preview.length ? `（先列出 ${preview.length} 条最低价）` : ""}</h2>`;
        tables += offerTable(preview, { showStation: true, showModel: true });
        if (family) tables += `<p class="table-note">完整系列表见 <a href="../families/${esc(family)}.html">${esc(family)} 系列页</a>。</p>`;
      }
      if (riskRows.length && topic.family === "claude") {
        tables += `<h2>分组名含 Kiro、逆向、号池或 CC Max 的条目</h2>`;
        tables += offerTable(riskRows, { showStation: true, showModel: true });
        tables += `<p class="table-note">这些标注只根据分组名称，未做实际调用验真。</p>`;
      }
    }

    const faqs = topic.faqs
      .map(
        (item, index) => `        <div class="topic-faq">
          <h2 id="q${index + 1}">${esc(item.q)}</h2>
          <p>${esc(item.a)}</p>
        </div>`,
      )
      .join("\n");

    const intro = topic.intro.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("\n");

    const body = `        <section class="hero">
          <p class="eyebrow">TOPIC · ${esc(topic.query)}</p>
          <h1>${esc(topic.h1)}</h1>
          <p class="lede">${esc(topic.description)}</p>
          <p class="hero-note">数据构建于 ${esc(LASTMOD)}。价格会过期，请以各条核验日期为准。</p>
        </section>
        <article class="panel guide">
          ${intro}
          ${tables}
          <h2>常见问题</h2>
${faqs}
          <p class="table-note"><a href="../guides/what-is-api-relay.html">中转站是什么</a> · <a href="../guides/verify-relay-price.html">怎么核验价格</a> · <a href="../guides/free-relay-risks.html">免费和公益站风险</a> · <a href="../method.html">收录与排序方法</a> · <a href="./index.html">全部专题</a></p>
        </article>`;

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: topic.h1,
        description: topic.description,
        dateModified: LASTMOD,
        datePublished: "2026-11-11",
        author: { "@type": "Organization", name: "AI API 比价雷达" },
        mainEntityOfPage: `${BASE}/topics/${topic.slug}.html`,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: topic.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];

    fs.writeFileSync(
      path.join(root, "topics", `${topic.slug}.html`),
      shell({
        title: `${topic.title} · AI API 比价雷达`,
        description: topic.description,
        canonical: `${BASE}/topics/${topic.slug}.html`,
        body,
        jsonLd,
        prefix: "../",
        breadcrumbs: [
          { name: "首页", href: "../index.html", url: `${BASE}/` },
          { name: "专题", href: "./index.html", url: `${BASE}/topics/` },
          { name: topic.query, href: `./${topic.slug}.html`, url: `${BASE}/topics/${topic.slug}.html` },
        ],
      }),
    );
    generated.push(topic);
  }

  const indexBody = `        <section class="hero">
          <p class="eyebrow">TOPICS</p>
          <h1>按常见问题看中转站比价</h1>
          <p class="lede">这些页面针对「Claude API 中转」「便宜 Claude API」「DeepSeek API 免费」等具体问题，用同一套核验过的报价表回答，不另造数字。</p>
        </section>
        <section class="panel">
          <div class="table-wrap"><table class="rank-table"><thead><tr><th>专题</th><th>对应问题</th><th>更新</th></tr></thead><tbody>
${generated
  .map((topic) => `<tr><td><a class="station-name" href="./${esc(topic.slug)}.html">${esc(topic.h1)}</a></td><td>${esc(topic.query)}</td><td class="date-cell">${esc(LASTMOD)}</td></tr>`)
  .join("\n")}
          </tbody></table></div>
        </section>`;

  fs.writeFileSync(
    path.join(root, "topics/index.html"),
    shell({
      title: "中转站比价专题：Claude / GPT / Gemini / DeepSeek / 公益站 · AI API 比价雷达",
      description: "按常见搜索问题整理的中转站比价专题，包括 Claude API 中转、便宜 Claude API、DeepSeek 与 Gemini 免费额度，以及公益站名单。",
      canonical: `${BASE}/topics/`,
      body: indexBody,
      jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "中转站比价专题", url: `${BASE}/topics/`, dateModified: LASTMOD },
      prefix: "../",
      breadcrumbs: [
        { name: "首页", href: "../index.html", url: `${BASE}/` },
        { name: "专题", href: "./index.html", url: `${BASE}/topics/` },
      ],
    }),
  );

  return generated;
}
