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

const FILTER_TAGS = ['all', 'gpt', 'codex', 'claude', 'grok', 'gemini', 'domestic-model', 'public-benefit', 'low-multiplier'];
const state = { sites: [], query: '', tag: 'all', status: 'all', sort: 'verified' };
const elements = {
  grid: document.querySelector('#site-grid'),
  empty: document.querySelector('#empty-state'),
  error: document.querySelector('#load-error'),
  resultNote: document.querySelector('#result-note'),
  search: document.querySelector('#site-search'),
  status: document.querySelector('#status-filter'),
  sort: document.querySelector('#sort-select'),
  clear: document.querySelector('#clear-filters'),
  emptyClear: document.querySelector('#empty-clear'),
  tagFilters: document.querySelector('#tag-filters'),
  heroCount: document.querySelector('#hero-count'),
  heroDate: document.querySelector('#hero-date'),
  statTotal: document.querySelector('#stat-total'),
  statReachable: document.querySelector('#stat-reachable'),
  statTags: document.querySelector('#stat-tags'),
};

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function formatDate(value) {
  if (!value) return '—';
  const parts = String(value).split('-');
  return parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : value;
}

function getTagLabel(tag) { return TAG_LABELS[tag] || tag; }

function getStatusMeta(status) { return STATUS_META[status] || { label: status || '状态未知', className: 'is-blocked' }; }

function getInitials(name) {
  const clean = String(name || '?').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 1 && /^[A-Za-z]/.test(clean)) return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return Array.from(clean).slice(0, 2).join('');
}

function getFilteredSites() {
  const query = state.query.trim().toLocaleLowerCase();
  const filtered = state.sites.filter((site) => {
    const haystack = [site.name, site.summary, ...(site.tags || [])].join(' ').toLocaleLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesTag = state.tag === 'all' || (site.tags || []).includes(state.tag);
    const matchesStatus = state.status === 'all' || site.status === state.status;
    return matchesQuery && matchesTag && matchesStatus;
  });

  return filtered.sort((a, b) => {
    if (state.sort === 'name') return String(a.name).localeCompare(String(b.name), 'zh-CN');
    if (state.sort === 'status') {
      const rank = { 'registration-page-reachable': 0, 'manual-verification-required': 1, degraded: 2, 'automated-access-blocked': 3 };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || String(a.name).localeCompare(String(b.name), 'zh-CN');
    }
    return String(b.verifiedAt || '').localeCompare(String(a.verifiedAt || '')) || String(a.name).localeCompare(String(b.name), 'zh-CN');
  });
}

function renderTagFilters() {
  const counts = new Map();
  state.sites.forEach((site) => (site.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
  elements.tagFilters.innerHTML = FILTER_TAGS.map((tag) => {
    const label = tag === 'all' ? '全部' : getTagLabel(tag);
    const count = tag === 'all' ? state.sites.length : (counts.get(tag) || 0);
    return `<button class="tag-filter${state.tag === tag ? ' is-active' : ''}" type="button" data-tag="${escapeHTML(tag)}" aria-pressed="${state.tag === tag}">${escapeHTML(label)} <small>${count}</small></button>`;
  }).join('');
}

function renderCard(site, index) {
  const status = getStatusMeta(site.status);
  const tags = (site.tags || []).slice(0, 5).map((tag) => `<span class="tag">${escapeHTML(getTagLabel(tag))}</span>`).join('');
  const moreCount = Math.max(0, (site.tags || []).length - 5);
  const registration = site.registrationUrl && site.registrationUrl !== site.homepage
    ? `<a class="card-link" href="${escapeHTML(site.registrationUrl)}" target="_blank" rel="noreferrer noopener">注册 ↗</a>`
    : '';
  return `<article class="site-card" style="animation-delay:${Math.min(index * 35, 300)}ms">
    <div class="card-top">
      <div class="site-identity">
        <span class="site-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
        <div><h3 title="${escapeHTML(site.name)}">${escapeHTML(site.name)}</h3><a class="site-domain" href="${escapeHTML(site.homepage)}" target="_blank" rel="noreferrer noopener">${escapeHTML(site.homepage.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></div>
      </div>
      <span class="status-badge ${status.className}">${escapeHTML(status.label)}</span>
    </div>
    <p class="summary">${escapeHTML(site.summary)}</p>
    <div class="tag-list">${tags}${moreCount ? `<span class="tag tag-more">+${moreCount}</span>` : ''}</div>
    <div class="card-footer"><span class="verified-date">核验 ${escapeHTML(formatDate(site.verifiedAt))}</span><div class="card-actions"><a class="card-link" href="${escapeHTML(site.homepage)}" target="_blank" rel="noreferrer noopener">打开 ↗</a>${registration}</div></div>
  </article>`;
}

function render() {
  const sites = getFilteredSites();
  elements.grid.innerHTML = sites.map(renderCard).join('');
  elements.grid.hidden = sites.length === 0;
  elements.empty.hidden = sites.length !== 0;
  elements.resultNote.textContent = `${sites.length} / ${state.sites.length} 个入口匹配当前条件`;
  elements.clear.hidden = !(state.query || state.tag !== 'all' || state.status !== 'all' || state.sort !== 'verified');
}

function clearFilters() {
  state.query = '';
  state.tag = 'all';
  state.status = 'all';
  state.sort = 'verified';
  elements.search.value = '';
  elements.status.value = 'all';
  elements.sort.value = 'verified';
  renderTagFilters();
  render();
}

function updateStats(payload) {
  const sites = payload.sites || [];
  const tags = new Set(sites.flatMap((site) => site.tags || []));
  const reachable = sites.filter((site) => site.status === 'registration-page-reachable').length;
  elements.heroCount.textContent = String(sites.length).padStart(2, '0');
  elements.heroDate.textContent = formatDate(payload.lastVerified);
  elements.statTotal.textContent = sites.length;
  elements.statReachable.textContent = reachable;
  elements.statTags.textContent = tags.size;
}

async function loadData() {
  try {
    const response = await fetch(new URL('data/sites.json', document.baseURI));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.sites)) throw new Error('Invalid data shape');
    state.sites = payload.sites;
    updateStats(payload);
    renderTagFilters();
    render();
  } catch (error) {
    console.error('Unable to load directory data', error);
    elements.grid.hidden = true;
    elements.error.hidden = false;
    elements.resultNote.textContent = '数据加载失败';
  }
}

elements.search.addEventListener('input', (event) => { state.query = event.target.value; render(); });
elements.status.addEventListener('change', (event) => { state.status = event.target.value; render(); });
elements.sort.addEventListener('change', (event) => { state.sort = event.target.value; render(); });
elements.clear.addEventListener('click', clearFilters);
elements.emptyClear.addEventListener('click', clearFilters);
elements.tagFilters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-tag]');
  if (!button) return;
  state.tag = button.dataset.tag;
  renderTagFilters();
  render();
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== elements.search && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    elements.search.focus();
  }
});

loadData();
