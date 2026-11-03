// 报价归一化。浏览器与 Node 共用同一份实现，页面与校验脚本不允许各自算一套。

export const BASIS_LABELS = {
  computed_absolute: '绝对单价折算',
  converted_ratio: '分组倍率折算',
  declared: '维护者折算',
  raw_ratio: '站内分组倍率',
  per_request: '按次计费',
  free: '免费额度',
  unknown: '口径待确认',
};

export const FAMILY_LABELS = {
  gpt: 'GPT',
  codex: 'Codex',
  claude: 'Claude',
  grok: 'Grok',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  glm: 'GLM',
  kimi: 'Kimi',
  doubao: '豆包',
  image: '生图',
};

export function round(value, digits = 4) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

// 官方基准价统一折算到人民币 / 百万 Token。智谱本来就是人民币，不需要汇率。
export function officialCny(model, fx) {
  if (!model || !model.official) return null;
  const { currency, inputPer1M, outputPer1M, cacheReadPer1M } = model.official;
  const rate = currency === 'CNY' ? 1 : fx;
  return {
    currency,
    rate,
    input: inputPer1M == null ? null : inputPer1M * rate,
    output: outputPer1M == null ? null : outputPer1M * rate,
    cacheRead: cacheReadPer1M == null ? null : cacheReadPer1M * rate,
  };
}

function ratioOf(cny, official) {
  if (cny == null || official == null || official === 0) return null;
  return cny / official;
}

export function evaluateOffer(offer, model, config, stated = false) {
  const fx = config.fxCnyPerUsd;
  const official = officialCny(model, fx);
  const familyLabel = model ? FAMILY_LABELS[model.family] || model.family : '模型';

  const row = {
    id: offer.id,
    stationId: offer.stationId,
    groupKey: offer.groupKey,
    groupName: offer.groupName || offer.groupKey,
    modelId: offer.modelId,
    modelDisplay: stated && model ? model.displayName : `${familyLabel} 系列（未指定型号）`,
    modelBasis: stated ? 'stated' : 'assumed',
    pricingMode: offer.pricingMode,
    note: offer.note || '',
    sourceKind: offer.sourceKind,
    sourceUrl: offer.sourceUrl,
    verifiedAt: offer.verifiedAt,
    inputCny: null,
    outputCny: null,
    cacheReadCny: null,
    perRequestCny: offer.perRequestCny ?? null,
    effectiveInput: null,
    effectiveOutput: null,
    effectiveBlended: null,
    declaredRatio: offer.ratio ?? offer.declaredEffective ?? null,
    comparable: false,
    basisLabel: BASIS_LABELS.unknown,
    basis: 'unknown',
    official,
  };

  switch (offer.pricingMode) {
    case 'absolute_cny': {
      row.inputCny = offer.inputCnyPer1M ?? null;
      row.outputCny = offer.outputCnyPer1M ?? null;
      row.cacheReadCny = offer.cacheReadCnyPer1M ?? null;
      row.basis = 'computed_absolute';
      row.basisLabel = BASIS_LABELS.computed_absolute;
      break;
    }
    case 'absolute_usd': {
      row.inputCny = offer.inputUsdPer1M == null ? null : offer.inputUsdPer1M * fx;
      row.outputCny = offer.outputUsdPer1M == null ? null : offer.outputUsdPer1M * fx;
      row.cacheReadCny = offer.cacheReadUsdPer1M == null ? null : offer.cacheReadUsdPer1M * fx;
      row.basis = 'computed_absolute';
      row.basisLabel = BASIS_LABELS.computed_absolute;
      break;
    }
    case 'ratio': {
      if (offer.ratioFactor != null) {
        const eff = offer.ratio * offer.ratioFactor;
        row.effectiveInput = eff;
        row.effectiveOutput = eff;
        if (official && official.input != null) row.inputCny = official.input * eff;
        if (official && official.output != null) row.outputCny = official.output * eff;
        row.basis = 'converted_ratio';
        row.basisLabel = BASIS_LABELS.converted_ratio;
        row.comparable = official != null && official.input != null && official.output != null;
      } else {
        row.basis = 'raw_ratio';
        row.basisLabel = BASIS_LABELS.raw_ratio;
        row.comparable = false;
      }
      break;
    }
    case 'declared_effective': {
      const eff = offer.declaredEffective;
      row.effectiveInput = eff;
      row.effectiveOutput = eff;
      if (official && official.input != null) row.inputCny = official.input * eff;
      if (official && official.output != null) row.outputCny = official.output * eff;
      row.basis = 'declared';
      row.basisLabel = BASIS_LABELS.declared;
      row.comparable = official != null && official.input != null && official.output != null;
      break;
    }
    case 'per_request_cny': {
      row.basis = 'per_request';
      row.basisLabel = BASIS_LABELS.per_request;
      break;
    }
    case 'free': {
      row.basis = 'free';
      row.basisLabel = BASIS_LABELS.free;
      break;
    }
    default:
      break;
  }

  // 绝对单价模式由人民币单价反推相对官方价的倍率。
  if (row.basis === 'computed_absolute' && official) {
    row.effectiveInput = ratioOf(row.inputCny, official.input);
    row.effectiveOutput = ratioOf(row.outputCny, official.output);
    row.comparable = row.effectiveInput != null && row.effectiveOutput != null;
  }

  if (row.effectiveInput != null && row.effectiveOutput != null) {
    row.effectiveBlended = (3 * row.effectiveInput + row.effectiveOutput) / 4;
  }

  // 未独立核验的声明值保留展示，但不参与排名。
  if (offer.unverified) {
    row.comparable = false;
    row.basisLabel = `${row.basisLabel}（待核验）`;
  }

  // 站点只给出分组倍率、同类分组折算系数也未披露时，按 0.14 之类的系数外推不可靠，只展示原值。
  if (offer.unverifiedFactor) {
    row.comparable = false;
    row.effectiveInput = null;
    row.effectiveOutput = null;
    row.effectiveBlended = null;
    row.inputCny = null;
    row.outputCny = null;
    row.basisLabel = `${BASIS_LABELS.raw_ratio}（充值系数未披露）`;
  }

  // 分组只写到系列时，不套用任何具体型号的官方价，只保留倍率。
  if (!stated) {
    row.inputCny = null;
    row.outputCny = null;
    row.cacheReadCny = null;
  }

  row.inputCny = round(row.inputCny, 4);
  row.outputCny = round(row.outputCny, 4);
  row.cacheReadCny = round(row.cacheReadCny, 4);
  row.effectiveInput = round(row.effectiveInput, 5);
  row.effectiveOutput = round(row.effectiveOutput, 5);
  row.effectiveBlended = round(row.effectiveBlended, 5);

  return row;
}

export function buildRows(offers, models, config, statedIds = new Set()) {
  const modelById = new Map(models.map((model) => [model.id, model]));
  return offers.map((offer) => {
    const modelSpecific =
      statedIds.has(offer.id) ||
      offer.pricingMode === "absolute_cny" ||
      offer.pricingMode === "absolute_usd" ||
      offer.pricingMode === "per_request_cny";
    return evaluateOffer(offer, modelById.get(offer.modelId) || null, config, modelSpecific);
  });
}

// 只让口径统一的报价参与数值排行，其余报价保留展示但不参与名次。
export function comparableRows(rows) {
  return rows.filter((row) => row.comparable && row.effectiveBlended != null);
}

export function rankRows(rows) {
  return [...rows].sort((a, b) => {
    if (a.effectiveBlended !== b.effectiveBlended) return a.effectiveBlended - b.effectiveBlended;
    return String(a.stationId).localeCompare(String(b.stationId));
  });
}

// 每个站点取口径统一报价里的最低综合倍率，用于站点总榜。
export function stationBest(rows) {
  const best = new Map();
  for (const row of comparableRows(rows)) {
    const current = best.get(row.stationId);
    if (!current || row.effectiveBlended < current.effectiveBlended) best.set(row.stationId, row);
  }
  return best;
}

export function modelBest(rows) {
  const best = new Map();
  for (const row of comparableRows(rows)) {
    const current = best.get(row.modelId);
    if (!current || row.effectiveBlended < current.effectiveBlended) best.set(row.modelId, row);
  }
  return best;
}

export function formatCny(value) {
  if (value == null) return '—';
  if (value >= 100) return `¥${value.toFixed(1)}`;
  if (value >= 1) return `¥${value.toFixed(2)}`;
  return `¥${value.toFixed(3)}`;
}

export function formatRatio(value) {
  if (value == null) return '—';
  const pct = value * 100;
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(3)}%`;
}

export function formatMultiplier(value) {
  if (value == null) return '—';
  if (value >= 1) return `${value.toFixed(2)}x`;
  if (value >= 0.01) return `${value.toFixed(3)}x`;
  return `${value.toFixed(4)}x`;
}

export function formatDiscount(value) {
  if (value == null) return '—';
  const saved = (1 - value) * 100;
  return saved > 0 ? `省 ${saved.toFixed(saved >= 10 ? 0 : 1)}%` : `贵 ${(-saved).toFixed(0)}%`;
}
