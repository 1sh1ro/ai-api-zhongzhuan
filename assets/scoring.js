// 站点综合评分：只用本站已有数据可复算的信号，不引入外部或主观打分。
// 五个维度合计 100 分；公式写在 method.html，改动会同步更新版本号与文档。

const SOURCE_WEIGHT = {
  "public-pricing-api": 1,
  "official-pricing": 1,
  "official-model-catalog": 1,
  "site-status": 1,
  "official-website": 0.85,
  "official-model-list": 0.85,
  "local-verified": 0.75,
  "historical-offer": 0.6,
  "user-submitted": 0.5,
  "user-submitted-pricing": 0.5,
  "user-provided-screenshot": 0.3,
  "github-issue": 0.3,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function daysBetween(a, b) {
  const left = new Date(`${a}T00:00:00Z`).getTime();
  const right = new Date(`${b}T00:00:00Z`).getTime();
  if (Number.isNaN(left) || Number.isNaN(right)) return Infinity;
  return Math.abs(left - right) / 86400000;
}

// 价格竞争力 0–40：对数刻度，0.01x 满分，1.00x 归零。
export function priceScore(bestEffective) {
  if (bestEffective == null || bestEffective <= 0) return 0;
  return 40 * clamp(Math.log10(1 / bestEffective) / 2, 0, 1);
}

// 同一模型内把站点按倍率排序，换算成 0–1 的相对位置，最好为 1，最差为 0。
export function buildModelPercentiles(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!row.comparable) continue;
    const list = groups.get(row.modelId) || [];
    list.push({ stationId: row.stationId, effective: row.effectiveBlended });
    groups.set(row.modelId, list);
  }
  const percentiles = new Map();
  for (const [modelId, list] of groups) {
    list.sort((a, b) => a.effective - b.effective);
    const map = new Map();
    list.forEach((item, index) => {
      map.set(item.stationId, list.length === 1 ? 1 : 1 - index / (list.length - 1));
    });
    percentiles.set(modelId, map);
  }
  return percentiles;
}

// 价格维度按「同模型相对位置」平均，避免拿不同模型的倍率直接对比。
// 覆盖模型少于 3 个时按比例折减，防止只在一个模型上便宜的站点拿满分。
export function priceScoreFromPercentiles(stationRows, percentiles) {
  const values = [];
  for (const row of stationRows) {
    if (!row.comparable) continue;
    const value = percentiles.get(row.modelId)?.get(row.stationId);
    if (value != null) values.push(value);
  }
  if (values.length === 0) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const coverageFactor = Math.min(1, values.length / 3);
  return 40 * average * coverageFactor;
}

// 数据透明度 0–20：口径统一的报价占比。
export function transparencyScore(stationRows) {
  if (stationRows.length === 0) return 0;
  const comparable = stationRows.filter((row) => row.comparable).length;
  return 20 * (comparable / stationRows.length);
}

// 来源可追溯 0–15：来源权重均值 10 分，最新核验新鲜度 5 分。
export function traceabilityScore(stationRows, lastmod) {
  if (stationRows.length === 0) return 0;
  const weightSum = stationRows.reduce((sum, row) => sum + (SOURCE_WEIGHT[row.sourceKind] ?? 0.4), 0);
  const basis = (weightSum / stationRows.length) * 10;
  const latest = stationRows.map((row) => row.verifiedAt).filter(Boolean).sort().at(-1);
  const age = latest ? daysBetween(lastmod, latest) : Infinity;
  const freshness = age <= 30 ? 5 : age <= 90 ? 3 : age === Infinity ? 0 : 1;
  return basis + freshness;
}

// 覆盖广度 0–15：模型数最多 10 分，系列数最多 5 分。
export function coverageScore(stationRows, modelById) {
  const models = new Set(stationRows.map((row) => row.modelId));
  const families = new Set(
    [...models].map((id) => modelById.get(id)?.family).filter(Boolean),
  );
  return clamp(models.size * 0.5, 0, 10) + clamp(families.size, 0, 5);
}

// 信息完整度 0–10：站点卡片上的可核验字段。
export function completenessScore(site) {
  let score = 0;
  if (site.homepage) score += 2;
  if (site.registrationUrl) score += 1;
  if ((site.summary || "").length >= 60) score += 2;
  if ((site.tags || []).length >= 3) score += 1;
  if ((site.sources || []).length >= 2) score += 2;
  if ((site.sources || []).some((source) => source.type === "official-website")) score += 1;
  if ((site.sources || []).some((source) => /pricing|docs|model/.test(source.type))) score += 1;
  return clamp(score, 0, 10);
}

export function grade(total) {
  if (total >= 75) return "A";
  if (total >= 60) return "B";
  if (total >= 45) return "C";
  return "D";
}

export function scoreStation(site, stationRows, modelById, lastmod, percentiles) {
  const best = stationRows
    .filter((row) => row.comparable)
    .reduce((min, row) => (min == null || row.effectiveBlended < min ? row.effectiveBlended : min), null);

  const parts = {
    price: percentiles ? priceScoreFromPercentiles(stationRows, percentiles) : priceScore(best),
    transparency: transparencyScore(stationRows),
    traceability: traceabilityScore(stationRows, lastmod),
    coverage: coverageScore(stationRows, modelById),
    completeness: completenessScore(site),
  };
  const total = Object.values(parts).reduce((sum, value) => sum + value, 0);
  const rounded = Math.round(total * 10) / 10;
  return { total: rounded, grade: grade(rounded), parts };
}
