// 站内人气统计：统计从本站跳转到站点的点击次数，同一浏览器每天对同一站点只计一次。
// 计数存在第三方 Abacus，按自然月和自然日分开，不写 Cookie，不发送页面路径。
const BASE = "https://abacus.jasoncameron.dev";
const NAMESPACE = "ai-xulas-fun";

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
}

function month() {
  return today().slice(0, 7);
}

function monthCounterKey(stationId) {
  return `click-${stationId}-${month()}`;
}

function dayCounterKey(stationId) {
  return `click-${stationId}-${today()}`;
}

async function readCounter(key) {
  try {
    const response = await fetch(`${BASE}/get/${NAMESPACE}/${key}`, {
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) return 0;
    const payload = await response.json();
    return Number(payload.value) || 0;
  } catch {
    return 0;
  }
}

export async function getPopularity(stationIds) {
  const result = new Map();
  const queue = [...stationIds];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const id = queue.shift();
      result.set(id, await readCounter(monthCounterKey(id)));
    }
  });
  await Promise.all(workers);
  return result;
}

export function trackStationClick(stationId) {
  if (!stationId) return;
  const flag = `xulas-click-${stationId}-${today()}`;
  try {
    if (localStorage.getItem(flag)) return;
    localStorage.setItem(flag, "1");
  } catch {
    return;
  }
  const opts = { keepalive: true, referrerPolicy: "no-referrer" };
  fetch(`${BASE}/hit/${NAMESPACE}/${monthCounterKey(stationId)}`, opts).catch(() => {});
  fetch(`${BASE}/hit/${NAMESPACE}/${dayCounterKey(stationId)}`, opts).catch(() => {});
}

export function initPopularity() {
  if (typeof document.addEventListener === "function") {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-station-link]");
      if (link) trackStationClick(link.dataset.stationLink);
    });
  }

  const nodes = [...document.querySelectorAll("[data-click-count]")];
  if (nodes.length === 0) return;
  const ids = [...new Set(nodes.map((node) => node.dataset.clickCount))];
  getPopularity(ids).then((counts) => {
    for (const node of nodes) node.textContent = String(counts.get(node.dataset.clickCount) || 0);
  });
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPopularity);
  } else {
    initPopularity();
  }
}
