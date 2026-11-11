import {
  buildRows,
  comparableRows,
  modelBest,
  formatCny,
  formatMultiplier,
  formatDiscount,
} from './assets/pricing.js';
import { scoreStation, buildModelPercentiles } from './assets/scoring.js';

const ASSET_VERSION = '2026-11-11c';

const FAMILY_LABELS = {
  gpt: 'GPT',
  claude: 'Claude',
  grok: 'Grok',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  glm: 'GLM',
  kimi: 'Kimi',
  doubao: '豆包',
  image: '生图',
};

const TAG_LABELS = {
  gpt: 'GPT',
  codex: 'Codex',
  claude: 'Claude',
  grok: 'Grok',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  kimi: 'Kimi',
  'domestic-model': '国产模型',
  'public-benefit': '公益站',
  'low-multiplier': '低倍率',
  'low-price': '低价',
  subscription: '订阅',
  'api-relay': '中转',
  'api-gateway': '网关',
  'new-api': 'New API',
  'free-api': '免费 API',
  'image-workbench': '绘图工作台',
  invoice: '发票',
  'manual-check': '人工检查',
  'cc-switch': 'CC Switch',
  'cherry-studio': 'Cherry Studio',
  'linux-do': 'Linux.do',
  'historical-offer': '历史优惠',
  'discounted-pricing': '折扣价',
  maintenance: '维护中',
};

const STATUS_META = {
  'registration-page-reachable': { label: '注册页可达', className: 'is-good' },
  'manual-verification-required': { label: '需要人工核验', className: 'is-review' },
  degraded: { label: '服务降级', className: 'is-degraded' },
  'automated-access-blocked': { label: '自动访问受阻', className: 'is-blocked' },
};

const state = {
  sites: [],
  models: [],
  offers: [],
  config: { fxCnyPerUsd: 6.7 },
  rows: [],
  scores: new Map(),
  percentiles: new Map(),
  modelRank: '',
  family: 'all',
  tag: 'all',
  query: '',
  basis: 'comparable',
  view: 'station',
};

const el = {
  statStations: document.querySelector('#stat-stations'),
  statOffers: document.querySelector('#stat-offers'),
  statComparable: document.querySelector('#stat-comparable'),
  statModels: document.querySelector('#stat-models'),
  statFx: document.querySelector('#stat-fx'),
  heroNote: document.querySelector('#hero-note'),
  familyChips: document.querySelector('#family-chips'),
  tagChips: document.querySelector('#tag-chips'),
  modelSelect: document.querySelector('#model-select'),
  search: document.querySelector('#search'),
  basis: document.querySelector('#basis-filter'),
  view: document.querySelector('#view-mode'),
  reset: document.querySelector('#reset'),
  head: document.querySelector('#rank-head'),
  body: document.querySelector('#rank-body'),
  note: document.querySelector('#rank-note'),
  modelGrid: document.querySelector('#model-grid'),
  siteGrid: document.querySelector('#site-grid'),
  empty: document.querySelector('#empty-state'),
  ledgerBody: document.querySelector('#ledger-body'),
  ledgerNote: document.querySelector('#ledger-note'),
  popularityBody: document.querySelector('#popularity-body'),
};

const SOURCE_LABELS = {
  'public-pricing-api': '站方价格接口',
  'user-submitted-pricing': '用户价格快照',
  'user-provided-screenshot': '用户截图',
  'user-submitted': '用户提交',
  'local-verified': '本地访问核验',
  'local-history-verified': '历史核验',
  'official-website': '官网',
  'official-pricing': '官网价格页',
  'official-model-list': '官网模型页',
  'official-model-catalog': '模型广场',
  'github-issue': 'GitHub Issue',
  'site-status': '站点状态页',
  'linux-do': 'Linux.do',
};

function sourceCell(row) {
  const label = SOURCE_LABELS[row.sourceKind] || row.sourceKind || '来源';
  return `<a class="source-link" href="${escapeHTML(row.sourceUrl)}" target="_blank" rel="noreferrer noopener" title="${escapeHTML(row.sourceUrl)}">${escapeHTML(label)} ↗</a>`;
}

function rawValue(row) {
  if (row.pricingMode === 'free') return '免费额度';
  if (row.perRequestCny != null) return `${formatCny(row.perRequestCny)}/次`;
  if (row.pricingMode === 'absolute_cny' || row.pricingMode === 'absolute_usd') {
    return `${formatCny(row.inputCny)} / ${formatCny(row.outputCny)} 元每百万`;
  }
  if (row.declaredRatio != null) return `${formatMultiplier(row.declaredRatio)} 站内倍率`;
  return '—';
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function formatDate(value) {
  if (!value) return '—';
  const parts = String(value).split('-');
  return parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : value;
}

function siteById(id) {
  return state.sites.find((site) => site.id === id) || null;
}

function modelById(id) {
  return state.models.find((model) => model.id === id) || null;
}

function siteName(id) {
  const site = siteById(id);
  return site ? site.name : id;
}

const REFERRAL_PARAM_KEYS = ['aff', 'ref', 'invite', 'code', 'i'];
const GENERIC_REGISTER_PATH = /^\/(sign-?up|signup|register|login|dashboard)\/?$/i;

// 优先使用带推广参数的注册链接；没有推广参数时回到官网首页。
function siteLink(id) {
  const site = siteById(id);
  if (!site) return '#';
  const home = site.homepage || '#';
  const registration = site.registrationUrl;
  if (!registration || registration === home) return home;

  let url;
  try {
    url = new URL(registration);
  } catch {
    return home;
  }

  const hasReferralParam = [...url.searchParams.keys()].some((key) =>
    REFERRAL_PARAM_KEYS.includes(key.toLowerCase()),
  );
  if (hasReferralParam) return registration;

  // 路径式推广链接，例如 apinebula.ai/A89Bk1；通用注册页则退回官网。
  if (!GENERIC_REGISTER_PATH.test(url.pathname)) return registration;
  return home;
}

function modelName(id) {
  const model = modelById(id);
  return model ? model.displayName : id;
}

function familyOf(row) {
  const model = modelById(row.modelId);
  return model ? model.family : 'other';
}

function matchesFamily(row) {
  return state.family === 'all' || familyOf(row) === state.family;
}

function matchesQuery(row) {
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const hay = [siteName(row.stationId), row.groupName, modelName(row.modelId), row.modelId].join(' ').toLowerCase();
  return hay.includes(q);
}

function rowPassesBasis(row) {
  if (state.basis === 'all') return true;
  if (state.basis === 'raw') return !row.comparable && row.basis !== 'per_request' && row.basis !== 'free';
  return row.comparable;
}

function renderHero() {
  const comparable = comparableRows(state.rows);
  const stationsWithOffer = new Set(state.rows.map((row) => row.stationId)).size;
  el.statStations.textContent = String(state.sites.length);
  el.statOffers.textContent = String(state.rows.length);
  el.statComparable.textContent = String(comparable.length);
  el.statModels.textContent = String(state.models.filter((model) => model.official).length);
  el.statFx.textContent = `1:${state.config.fxCnyPerUsd}`;
  const dates = state.rows.map((row) => row.verifiedAt).filter(Boolean).sort();
  const latest = dates[dates.length - 1];
  const stale = state.sites.length - stationsWithOffer;
  el.heroNote.textContent = `最近一次报价核验 ${formatDate(latest)} · 其中 ${stale} 个站点暂无可用报价（见站点目录）`;
}

function renderFamilyChips() {
  const families = ['all', 'gpt', 'claude', 'grok', 'gemini', 'deepseek', 'glm', 'kimi'];
  const counts = new Map();
  for (const row of state.rows) {
    if (!row.comparable) continue;
    const family = familyOf(row);
    counts.set(family, (counts.get(family) || 0) + 1);
  }
  el.familyChips.innerHTML = families
    .map((family) => {
      const label = family === 'all' ? '全部' : FAMILY_LABELS[family] || family;
      const count = family === 'all' ? comparableRows(state.rows).length : counts.get(family) || 0;
      const active = state.family === family ? ' is-active' : '';
      return `<button class="chip${active}" type="button" data-family="${family}" aria-pressed="${state.family === family}">${escapeHTML(label)}<small>${count}</small></button>`;
    })
    .join('');
}

const HEAD_STATION = `
  <tr>
    <th class="col-rank">#</th>
    <th>站点</th>
    <th class="col-num">评分</th>
    <th>分组</th>
    <th class="col-num">本模型倍率</th>
    <th class="col-num">输入 ¥/M</th>
    <th class="col-num">输出 ¥/M</th>
    <th class="col-num">相对官方价</th>
    <th>核验</th>
  </tr>`;

const HEAD_OFFER = `
  <tr>
    <th class="col-rank">#</th>
    <th>站点</th>
    <th>分组</th>
    <th>代表模型</th>
    <th class="col-num">综合倍率</th>
    <th class="col-num">输入 ¥/M</th>
    <th class="col-num">输出 ¥/M</th>
    <th class="col-num">相对官方价</th>
    <th>口径</th>
    <th>备注</th>
    <th>核验</th>
  </tr>`;

function modelCell(row) {
  const tag = row.modelBasis === 'stated' ? '' : '<span class="mini-tag">未指定型号</span>';
  return `<span class="model-name">${escapeHTML(row.modelDisplay)}</span>${tag}`;
}

function scoreBadge(score, name, suffix = '') {
  const parts = [score.parts.price, score.parts.transparency, score.parts.traceability, score.parts.coverage, score.parts.completeness]
    .map((value) => value.toFixed(1))
    .join(',');
  return `<span class="score-badge grade-${score.grade}" data-score="${score.total.toFixed(1)}" data-grade="${score.grade}" data-name="${escapeHTML(name || '')}" data-parts="${parts}" tabindex="0" title="悬停查看五维评分">${score.total.toFixed(1)}${suffix}</span>`;
}

function scoreCell(stationId) {
  const score = state.scores.get(stationId);
  if (!score) return '<span class="ratio-muted">—</span>';
  return scoreBadge(score, siteName(stationId));
}

function ratioCell(row) {  if (row.comparable) {
    return `<strong class="ratio ${row.effectiveBlended < 1 ? 'is-low' : ''}">${formatMultiplier(row.effectiveBlended)}</strong>`;
  }
  if (row.declaredRatio != null) {
    return `<span class="ratio-muted">${formatMultiplier(row.declaredRatio)}<em>原值</em></span>`;
  }
  if (row.perRequestCny != null) {
    return `<span class="ratio-muted">${formatCny(row.perRequestCny)}<em>/次</em></span>`;
  }
  return '<span class="ratio-muted">—</span>';
}

function renderEmptyTable(cols) {
  el.body.innerHTML = `<tr><td class="empty-cell" colspan="${cols}">没有符合条件的报价，试试重置筛选。</td></tr>`;
}

function modelRankOptions() {
  const stationsByModel = new Map();
  for (const row of comparableRows(state.rows)) {
    const set = stationsByModel.get(row.modelId) || new Set();
    set.add(row.stationId);
    stationsByModel.set(row.modelId, set);
  }
  return state.models
    .filter((model) => (stationsByModel.get(model.id)?.size || 0) >= 2)
    .map((model) => ({ id: model.id, name: model.displayName, count: stationsByModel.get(model.id).size }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

function populateModelSelect(options, selected) {
  el.modelSelect.innerHTML = options
    .map((option) => `<option value="${escapeHTML(option.id)}"${option.id === selected ? ' selected' : ''}>${escapeHTML(option.name)}（${option.count} 站）</option>`)
    .join('');
}

function renderStationView() {
  const options = modelRankOptions();
  if (options.length === 0) {
    el.head.innerHTML = '';
    renderEmptyTable(9);
    el.note.textContent = '暂无可比模型。';
    return;
  }
  const selected = options.some((option) => option.id === state.modelRank) ? state.modelRank : options[0].id;
  state.modelRank = selected;
  populateModelSelect(options, selected);

  const bestByStation = new Map();
  for (const row of state.rows) {
    if (row.modelId !== selected || !row.comparable || !matchesQuery(row)) continue;
    const current = bestByStation.get(row.stationId);
    if (!current || row.effectiveBlended < current.effectiveBlended) bestByStation.set(row.stationId, row);
  }
  const rows = [...bestByStation.values()].sort((a, b) => a.effectiveBlended - b.effectiveBlended);

  el.head.innerHTML = HEAD_STATION;
  el.body.innerHTML = rows
    .map((row, index) => {
      const site = siteById(row.stationId);
      return `<tr>
        <td class="col-rank">${String(index + 1).padStart(2, '0')}</td>
        <td>
          <a class="station-name" href="${escapeHTML(siteLink(row.stationId))}" target="_blank" rel="noreferrer noopener" data-station-link="${escapeHTML(row.stationId)}">${escapeHTML(siteName(row.stationId))}</a>
          <a class="station-host" href="${escapeHTML(siteLink(row.stationId))}" target="_blank" rel="noreferrer noopener" data-station-link="${escapeHTML(row.stationId)}">${escapeHTML(((site && site.homepage) || '').replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>
        </td>
        <td class="col-num">${scoreCell(row.stationId)}</td>
        <td class="group-cell">${escapeHTML(row.groupName)}</td>
        <td class="col-num">${ratioCell(row)}</td>
        <td class="col-num">${formatCny(row.inputCny)}</td>
        <td class="col-num">${formatCny(row.outputCny)}</td>
        <td class="col-num"><span class="discount">${formatDiscount(row.effectiveBlended)}</span></td>
        <td class="date-cell">${formatDate(row.verifiedAt)}</td>
      </tr>`;
    })
    .join('');

  const model = state.models.find((item) => item.id === selected);
  el.note.textContent = `${model ? model.displayName : selected} 有 ${rows.length} 个站点给出可换算的报价，按本模型倍率升序。换一个模型请用上方的模型选择，跨模型的倍率不做比较。`;
  if (rows.length === 0) renderEmptyTable(9);
}

function renderOfferView() {
  const rows = state.rows
    .filter((row) => matchesFamily(row) && matchesQuery(row) && rowPassesBasis(row))
    .sort((a, b) => {
      if (a.comparable && b.comparable) return a.effectiveBlended - b.effectiveBlended;
      if (a.comparable) return -1;
      if (b.comparable) return 1;
      return String(a.stationId).localeCompare(String(b.stationId));
    });

  el.head.innerHTML = HEAD_OFFER;
  let rank = 0;
  el.body.innerHTML = rows
    .map((row) => {
      const rankCell = row.comparable ? String(++rank).padStart(2, '0') : '—';
      return `<tr class="${row.comparable ? '' : 'is-unranked'}">
        <td class="col-rank">${rankCell}</td>
        <td><a class="station-name" href="${escapeHTML(siteLink(row.stationId))}" target="_blank" rel="noreferrer noopener" data-station-link="${escapeHTML(row.stationId)}">${escapeHTML(siteName(row.stationId))}</a></td>
        <td class="group-cell">${escapeHTML(row.groupName)}</td>
        <td>${modelCell(row)}</td>
        <td class="col-num">${ratioCell(row)}</td>
        <td class="col-num">${formatCny(row.inputCny)}</td>
        <td class="col-num">${formatCny(row.outputCny)}</td>
        <td class="col-num"><span class="discount">${row.comparable ? formatDiscount(row.effectiveBlended) : '—'}</span></td>
        <td><span class="basis basis-${row.basis}">${escapeHTML(row.basisLabel)}</span></td>
        <td class="note-cell" title="${escapeHTML(row.note)}">${escapeHTML(row.note)}</td>
        <td class="date-cell">${formatDate(row.verifiedAt)}</td>
      </tr>`;
    })
    .join('');

  const comparable = rows.filter((row) => row.comparable).length;
  el.note.textContent = `共 ${rows.length} 条报价，其中 ${comparable} 条口径统一参与排名。带「站内分组倍率」标签的条目因充值口径未披露，只展示原值。`;
  if (rows.length === 0) renderEmptyTable(10);
}

function renderRanking() {
  if (state.view === 'offer') renderOfferView();
  else renderStationView();
}

function renderModels() {
  const best = modelBest(state.rows.filter((row) => row.modelBasis === 'stated'));
  el.modelGrid.innerHTML = state.models
    .filter((model) => model.official)
    .map((model) => {
      const top = best.get(model.id);
      const rate = model.official.currency === 'CNY' ? 1 : state.config.fxCnyPerUsd;
      const officialInput = model.official.inputPer1M * rate;
      const officialOutput = model.official.outputPer1M * rate;
      const bestBlock = top
        ? `<a class="model-best" href="${escapeHTML(siteLink(top.stationId))}" target="_blank" rel="noreferrer noopener">
             <span class="model-best-ratio">${formatMultiplier(top.effectiveBlended)}</span>
             <span class="model-best-site">${escapeHTML(siteName(top.stationId))} · ${escapeHTML(top.groupName)}</span>
           </a>`
        : '<p class="model-best empty">暂无口径统一的报价</p>';
      return `<article class="model-card">
        <header>
          <h3>${escapeHTML(model.displayName)}</h3>
          <span class="vendor">${escapeHTML(model.vendor)}</span>
        </header>
        <p class="official">官方价 ${formatCny(officialInput)} / ${formatCny(officialOutput)} <em>每百万 Token</em></p>
        ${bestBlock}
      </article>`;
    })
    .join('');
}

function renderTagChips() {
  const counts = new Map();
  for (const site of state.sites) for (const tag of site.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  const order = ['all', 'gpt', 'claude', 'grok', 'gemini', 'deepseek', 'kimi', 'domestic-model', 'public-benefit', 'low-multiplier', 'low-price', 'free-api', 'api-gateway'];
  el.tagChips.innerHTML = order
    .filter((tag) => tag === 'all' || counts.has(tag))
    .map((tag) => {
      const label = tag === 'all' ? '全部' : TAG_LABELS[tag] || tag;
      const count = tag === 'all' ? state.sites.length : counts.get(tag) || 0;
      const active = state.tag === tag ? ' is-active' : '';
      return `<button class="chip${active}" type="button" data-tag="${escapeHTML(tag)}" aria-pressed="${state.tag === tag}">${escapeHTML(label)}<small>${count}</small></button>`;
    })
    .join('');
}

function renderSites() {
  const offerCount = new Map();
  for (const row of state.rows) offerCount.set(row.stationId, (offerCount.get(row.stationId) || 0) + 1);
  const q = state.query.trim().toLowerCase();

  const sites = state.sites.filter((site) => {
    const hay = [site.name, site.summary, ...(site.tags || [])].join(' ').toLowerCase();
    const matchesQuery = !q || hay.includes(q);
    const matchesTag = state.tag === 'all' || (site.tags || []).includes(state.tag);
    return matchesQuery && matchesTag;
  });

  el.siteGrid.innerHTML = sites
    .map((site) => {
      const status = STATUS_META[site.status] || { label: site.status || '状态未知', className: 'is-blocked' };
      const count = offerCount.get(site.id) || 0;
      const modelCount = new Set(
        state.rows.filter((row) => row.stationId === site.id && row.comparable).map((row) => row.modelId),
      ).size;
      const priceLine = modelCount
        ? `<span class="site-price">${modelCount} 个模型可比</span>`
        : '<span class="site-price is-muted">暂无可用报价</span>';
      const tags = (site.tags || []).slice(0, 4).map((tag) => `<span class="tag">${escapeHTML(TAG_LABELS[tag] || tag)}</span>`).join('');
      const score = state.scores.get(site.id);
      const scoreLine = score ? scoreBadge(score, site.name, ` 分 · ${score.grade}`) : '';
      return `<article class="site-card">
        <div class="site-card-top">
          <h3>${escapeHTML(site.name)}</h3>
          <span class="status ${status.className}">${escapeHTML(status.label)}</span>
        </div>
        <a class="site-card-host" href="${escapeHTML(siteLink(site.id))}" target="_blank" rel="noreferrer noopener" data-station-link="${escapeHTML(site.id)}">${escapeHTML(site.homepage.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>
        <p class="site-card-summary">${escapeHTML(site.summary)}</p>
        <div class="site-card-tags">${tags}</div>
        <div class="site-card-foot">
          <span>${count} 条报价 · 核验 ${formatDate(site.verifiedAt)}</span>
          <span class="site-card-score">${scoreLine}${priceLine}</span>
        </div>
      </article>`;
    })
    .join('');

  el.empty.hidden = sites.length !== 0;
}

function hasReferralLink(site) {
  for (const value of [site?.homepage, site?.registrationUrl]) {
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

function renderRecommend() {
  const section = document.querySelector('#recommend');
  const list = document.querySelector('#recommend-list');
  if (!list) return;
  const pinned = state.sites.filter((site) => site.pinned === true);
  if (section) section.hidden = pinned.length === 0;
  list.innerHTML = pinned
    .map((site) => {
      const summary = String(site.summary || '');
      const cautionAt = summary.indexOf('价格随上游浮动');
      const body = cautionAt > 0 ? summary.slice(0, cautionAt).trim() : summary;
      const caution = cautionAt > 0 ? summary.slice(cautionAt).trim() : '';
      const href = siteLink(site.id);
      const action = hasReferralLink(site) ? '推广入口' : '打开站点';
      return `<article class="recommend-card">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span>置顶推荐</p>
        <h2>${escapeHTML(site.name)}</h2>
        <p>${escapeHTML(body)}</p>
        ${caution ? `<p class="recommend-caution">${escapeHTML(caution)}</p>` : ''}
        <p class="recommend-actions"><a class="button button-primary" href="${escapeHTML(href)}" rel="nofollow noopener" target="_blank" data-station-link="${escapeHTML(site.id)}">${action}</a><a class="button" href="stations/${escapeHTML(site.id)}.html">站点详情</a></p>
      </article>`;
    })
    .join('');
}

function renderAll() {
  renderRecommend();
  renderFamilyChips();
  renderRanking();
  renderModels();
  renderTagChips();
  renderSites();
  renderLedger();
}

async function renderPopularity() {
  // 首页人气榜以构建时预渲染的注册量为准，避免被出站点击覆盖。
}

function renderLedger() {
  const rows = [...state.rows].sort((a, b) => {
    const stationOrder = String(siteName(a.stationId)).localeCompare(String(siteName(b.stationId)), 'zh-CN');
    if (stationOrder) return stationOrder;
    return String(a.groupName).localeCompare(String(b.groupName), 'zh-CN');
  });

  el.ledgerBody.innerHTML = rows
    .map((row) => `<tr>
        <td><a class="station-name" href="${escapeHTML(siteLink(row.stationId))}" target="_blank" rel="noreferrer noopener">${escapeHTML(siteName(row.stationId))}</a></td>
        <td class="group-cell">${escapeHTML(row.groupName)}</td>
        <td>${modelCell(row)}</td>
        <td><span class="basis basis-${row.basis}">${escapeHTML(row.basisLabel)}</span></td>
        <td class="raw-cell">${escapeHTML(rawValue(row))}</td>
        <td class="col-num">${row.comparable ? `<strong class="ratio ${row.effectiveBlended < 1 ? 'is-low' : ''}">${formatMultiplier(row.effectiveBlended)}</strong>` : '<span class="ratio-muted">—</span>'}</td>
        <td>${sourceCell(row)}</td>
        <td class="date-cell">${formatDate(row.verifiedAt)}</td>
      </tr>`)
    .join('');

  const comparable = rows.filter((row) => row.comparable).length;
  el.ledgerNote.textContent = `共 ${rows.length} 条报价，其中 ${comparable} 条口径统一可换算成相对官方价的综合倍率。其余条目保留原始倍率与来源，不参与排名。`;
}

function bindEvents() {
  const heroSearch = document.querySelector('#hero-search');
  const heroForm = document.querySelector('#hero-search-form');
  const syncQuery = (value) => {
    state.query = value;
    if (el.search && el.search.value !== value) el.search.value = value;
    if (heroSearch && heroSearch.value !== value) heroSearch.value = value;
    renderRanking();
    renderSites();
  };
  el.search.addEventListener('input', (event) => {
    syncQuery(event.target.value);
  });
  if (heroSearch) {
    heroSearch.addEventListener('input', (event) => syncQuery(event.target.value));
  }
  if (heroForm) {
    heroForm.addEventListener('submit', (event) => {
      event.preventDefault();
      syncQuery(heroSearch ? heroSearch.value : el.search.value);
      document.querySelector('#ranking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  el.basis.addEventListener('change', (event) => {
    state.basis = event.target.value;
    renderRanking();
  });
  el.view.addEventListener('change', (event) => {
    state.view = event.target.value;
    renderRanking();
  });
  if (el.modelSelect) {
    el.modelSelect.addEventListener('change', (event) => {
      state.modelRank = event.target.value;
      renderRanking();
    });
  }
  el.reset.addEventListener('click', () => {
    state.query = '';
    state.family = 'all';
    state.tag = 'all';
    state.basis = 'comparable';
    state.view = 'station';
    state.modelRank = '';
    el.search.value = '';
    const heroSearchInput = document.querySelector('#hero-search');
    if (heroSearchInput) heroSearchInput.value = '';
    el.basis.value = 'comparable';
    el.view.value = 'station';
    renderAll();
  });
  el.familyChips.addEventListener('click', (event) => {
    const button = event.target.closest('[data-family]');
    if (!button) return;
    state.family = button.dataset.family;
    renderFamilyChips();
    renderRanking();
  });
  el.tagChips.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tag]');
    if (!button) return;
    state.tag = button.dataset.tag;
    renderTagChips();
    renderSites();
  });
}

async function loadJSON(path) {
  const response = await fetch(new URL(`${path}?v=${ASSET_VERSION}`, document.baseURI));
  if (!response.ok) throw new Error(`${path} HTTP ${response.status}`);
  return response.json();
}

async function loadBuild() {
  try {
    const payload = await loadJSON('data/version.json');
    const stamp = document.querySelector('#build-stamp');
    if (stamp && payload.build) stamp.textContent = `数据构建 ${payload.build}`;
  } catch {
    /* 版本文件缺失不影响主流程 */
  }
}

async function init() {
  try {
    const [sitesPayload, modelsPayload, offersPayload, configPayload, scopePayload] = await Promise.all([
      loadJSON('data/sites.json'),
      loadJSON('data/models.json'),
      loadJSON('data/offers.json'),
      loadJSON('data/pricing-config.json'),
      loadJSON('data/model-scope.json'),
    ]);
    state.sites = sitesPayload.sites || [];
    state.models = modelsPayload.models || [];
    state.offers = offersPayload.offers || [];
    state.config = configPayload;
    state.rows = buildRows(state.offers, state.models, state.config, new Set(scopePayload.statedOfferIds || []));
    const modelById = new Map(state.models.map((model) => [model.id, model]));
    state.percentiles = buildModelPercentiles(state.rows);
    state.scores = new Map(
      state.sites.map((site) => [
        site.id,
        scoreStation(site, state.rows.filter((row) => row.stationId === site.id), modelById, state.config.dataDate || '2026-11-04', state.percentiles),
      ]),
    );
    renderHero();
    bindEvents();
    renderAll();
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => renderPopularity(), { timeout: 4000 });
    } else {
      setTimeout(renderPopularity, 2500);
    }
    loadBuild();
  } catch (error) {
    console.error('数据加载失败', error);
    el.heroNote.textContent = `数据加载失败：${error.message}。请通过 HTTP 服务打开页面，例如 python -m http.server。`;
    el.body.innerHTML = '<tr><td class="empty-cell" colspan="10">数据加载失败，请检查 data/ 目录与本地服务。</td></tr>';
  }
}

init();
