import { writeFileSync } from "node:fs";
import path from "node:path";

export const ABACUS_BASE = "https://abacus.jasoncameron.dev";
export const ABACUS_NAMESPACE = "ai-xulas-fun";
export const MIN_SAMPLE = 3;
export const TIMEZONE = "Asia/Shanghai";

export function shanghaiDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

export function monthKey(day) {
  return day.slice(0, 7);
}

export function clickMonthKey(stationId, month) {
  return `click-${stationId}-${month}`;
}

export function clickDayKey(stationId, day) {
  return `click-${stationId}-${day}`;
}

export function visitDayKey(day) {
  return `visits-${day}`;
}

async function readKey(key) {
  const response = await fetch(`${ABACUS_BASE}/get/${ABACUS_NAMESPACE}/${key}`, {
    referrerPolicy: "no-referrer",
    signal: AbortSignal.timeout(12000),
  });
  if (response.status === 404) return { key, found: false, value: 0 };
  if (!response.ok) return { key, found: false, value: 0, error: `HTTP ${response.status}` };
  const payload = await response.json();
  const value = Number(payload.value) || 0;
  return { key, found: true, value };
}

async function readAll(keys, concurrency = 6) {
  const queue = [...keys];
  const result = new Map();
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const key = queue.shift();
      try {
        result.set(key, await readKey(key));
      } catch (error) {
        result.set(key, { key, found: false, value: 0, error: String(error.message || error) });
      }
    }
  });
  await Promise.all(workers);
  return result;
}

function recentDays(today, count) {
  const days = [];
  const [year, month, day] = today.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  for (let offset = 0; offset < count; offset += 1) {
    const date = new Date(utc - offset * 24 * 60 * 60 * 1000);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    days.push(`${y}-${m}-${d}`);
  }
  return days;
}

export function rankCounts(countMap, minSample = MIN_SAMPLE) {
  const entries = [...countMap.entries()].map(([stationId, count]) => ({ stationId, count }));
  const ranked = entries.filter((row) => row.count >= minSample).sort((a, b) => b.count - a.count || a.stationId.localeCompare(b.stationId));
  const underSample = entries.filter((row) => row.count > 0 && row.count < minSample).sort((a, b) => b.count - a.count || a.stationId.localeCompare(b.stationId));
  return { ranked, underSample };
}

export async function fetchPopularitySnapshot(stationIds, options = {}) {
  const today = options.today || shanghaiDate();
  const currentMonth = monthKey(today);
  const days = recentDays(today, options.visitDays || 11);
  const last7 = days.slice(0, 7);
  const prevMonthDate = recentDays(today, 32).at(-1);
  const previousMonth = monthKey(prevMonthDate);

  const keys = [
    ...days.map((day) => visitDayKey(day)),
    ...stationIds.flatMap((id) => [clickMonthKey(id, currentMonth), clickMonthKey(id, previousMonth), ...last7.map((day) => clickDayKey(id, day))]),
  ];

  const raw = await readAll(keys);
  const visits = {};
  for (const day of days) {
    const item = raw.get(visitDayKey(day));
    if (item?.found && item.value > 0) visits[day] = item.value;
  }

  const monthClicks = {};
  const previousClicks = {};
  const last7Clicks = {};
  for (const id of stationIds) {
    const monthItem = raw.get(clickMonthKey(id, currentMonth));
    if (monthItem?.found && monthItem.value > 0) monthClicks[id] = monthItem.value;
    const prevItem = raw.get(clickMonthKey(id, previousMonth));
    if (prevItem?.found && prevItem.value > 0) previousClicks[id] = prevItem.value;
    let week = 0;
    let weekFound = false;
    for (const day of last7) {
      const item = raw.get(clickDayKey(id, day));
      if (item?.found) {
        weekFound = true;
        week += item.value;
      }
    }
    if (weekFound && week > 0) last7Clicks[id] = week;
  }

  const errors = [...raw.values()].filter((item) => item.error).length;
  const found = [...raw.values()].filter((item) => item.found).length;

  return {
    schemaVersion: 1,
    fetchedAt: `${today}T${new Intl.DateTimeFormat("en-GB", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date())}+08:00`,
    timezone: TIMEZONE,
    currentMonth,
    previousMonth,
    today,
    minSample: MIN_SAMPLE,
    source: ABACUS_BASE,
    namespace: ABACUS_NAMESPACE,
    stationsQueried: stationIds.length,
    keysQueried: keys.length,
    keysFound: found,
    keyErrors: errors,
    visits,
    visitsTotal: Object.values(visits).reduce((sum, value) => sum + value, 0),
    monthClicks,
    previousClicks,
    last7Clicks,
    note: "出站点击按上海时区自然月计数，同一浏览器每天对同一站点只计一次。7 日点击来自按日计数器；若按日键尚不存在，则 last7Clicks 为空。全站 visits 是本站去重访问量，不是各中转站人气。",
  };
}

export function writePopularitySnapshot(root, snapshot) {
  writeFileSync(path.join(root, "data/popularity-snapshot.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
}
