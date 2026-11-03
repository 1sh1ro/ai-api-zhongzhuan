// 在 Node 里用最小 DOM 桩加载 app.js，验证渲染逻辑与真实数据能跑通。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildRows, comparableRows, stationBest } from "../assets/pricing.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

/* ---------- 1. 静态结构检查 ---------- */
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const requiredIds = [
  "stat-stations", "stat-offers", "stat-comparable", "stat-models", "stat-fx", "hero-note",
  "family-chips", "tag-chips", "search", "basis-filter", "view-mode", "reset",
  "rank-head", "rank-body", "rank-note", "model-grid", "site-grid", "empty-state",
];
for (const id of requiredIds) assert(html.includes(`id="${id}"`), `index.html 缺少 #${id}`);
assert(/type="module" src="app\.js(\?v=[^"]+)?"/.test(html), "index.html 必须以 module 方式加载 app.js");
for (const asset of ["styles.css", "app.js", "assets/pricing.js", "data/sites.json", "data/models.json", "data/offers.json", "data/pricing-config.json"]) {
  assert(fs.existsSync(path.join(root, asset)), `缺少资源文件 ${asset}`);
}

/* ---------- 2. 渲染逻辑检查 ---------- */
const nodes = new Map();
function makeElement(selector) {
  return {
    selector,
    innerHTML: "",
    textContent: "",
    hidden: false,
    value: "",
    listeners: {},
    addEventListener(type, handler) {
      (this.listeners[type] ||= []).push(handler);
    },
    closest() {
      return null;
    },
  };
}

globalThis.document = {
  baseURI: "http://local.test/",
  querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, makeElement(selector));
    return nodes.get(selector);
  },
};
globalThis.fetch = async (url) => {
  const relative = decodeURIComponent(new URL(String(url)).pathname).replace(/^\//, "");
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return { ok: false, status: 404, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, "utf8")) };
};

await import(pathToFileURL(path.join(root, "app.js")).href);
await new Promise((resolve) => setTimeout(resolve, 120));

const node = (selector) => nodes.get(selector);
const sites = readJSON("data/sites.json").sites;
const models = readJSON("data/models.json").models;
const offers = readJSON("data/offers.json").offers;
const config = readJSON("data/pricing-config.json");
const scope = readJSON("data/model-scope.json");
const rows = buildRows(offers, models, config, new Set(scope.statedOfferIds));

assert(node("#stat-offers").textContent === String(offers.length), `报表条目数应为 ${offers.length}，实际 ${node("#stat-offers").textContent}`);
assert(node("#stat-stations").textContent === String(sites.length), `站点数应为 ${sites.length}`);
assert(node("#stat-comparable").textContent === String(comparableRows(rows).length), "可比条目数不一致");
assert(Number(node("#stat-models").textContent) === models.filter((model) => model.official).length, "官方基准模型数不一致");

const stationRowCount = (node("#rank-body").innerHTML.match(/<tr[\s>]/g) || []).length;
const rawBestStations = new Set(
  rows.filter((row) => !row.comparable && row.declaredRatio != null).map((row) => row.stationId),
);
const expectedStationRows = stationBest(rows).size + rawBestStations.size + (rawBestStations.size ? 1 : 0);
assert(stationRowCount === expectedStationRows, `站点总榜应有 ${expectedStationRows} 行，实际 ${stationRowCount}`);
assert(node("#rank-body").innerHTML.includes("znbcode"), "站点总榜应包含 znbcode");
assert(node("#rank-body").innerHTML.includes("API Nebula"), "站点总榜应包含 API Nebula");
assert(node("#rank-body").innerHTML.includes("is-low"), "低价倍率应附带高亮样式");
assert(node("#rank-body").innerHTML.includes("未指定"), "只写到系列的分组应显示「未指定型号」");
assert(!node("#rank-body").innerHTML.includes("Codex"), "页面不应再出现 Codex 系列");
assert(!node("#rank-body").innerHTML.includes("GPT-5.3 Codex"), "不应出现 gpt-5.3-codex");
assert(node("#rank-body").innerHTML.includes("apikey.fun/register?aff="), "有推广参数的站点应链到推广链接");
assert(node("#rank-body").innerHTML.includes("apinebula.ai/A89Bk1"), "路径式推广链接应保留");
assert(!node("#rank-body").innerHTML.includes("modelrush.ai/sign-up"), "没有推广参数的站点应回到官网首页");
assert(node("#rank-body").innerHTML.includes("0.0002x"), "国模羊毛应按 DeepSeek 计入 0.0002x");
assert(!node("#rank-body").innerHTML.includes("省 100%"), "折扣不应显示为省 100%");
assert(node("#rank-body").innerHTML.includes("sep-row"), "应存在站内倍率与综合倍率的分隔行");
assert(node("#model-grid").innerHTML.includes("GPT-6 Sol"), "模型对照应包含 GPT-6 Sol");
assert(node("#site-grid").innerHTML.includes("AIZZZ"), "站点目录应包含 AIZZZ");
const ledgerRows = (node("#ledger-body").innerHTML.match(/<tr[\s>]/g) || []).length;
assert(ledgerRows === offers.length, `核验明细应有 ${offers.length} 行，实际 ${ledgerRows}`);
assert(node("#ledger-body").innerHTML.includes("source-link"), "核验明细每行应有来源链接");
assert(node("#ledger-body").innerHTML.includes("znbcode.com/api/v1/model-plaza"), "来源链接应指向原始价格接口");
assert(node("#family-chips").innerHTML.includes("data-family=\"claude\""), "模型系列筛选缺失");

/* ---------- 3. 交互检查：切到报价明细并只看待统一 ---------- */
const viewHandler = node("#view-mode").listeners.change?.[0];
assert(viewHandler, "缺少视图切换事件");
viewHandler({ target: { value: "offer" } });
assert(node("#rank-head").innerHTML.includes("口径"), "报价明细表头应包含口径列");
assert(node("#rank-head").innerHTML.includes("备注"), "报价明细表头应包含备注列");
const defaultOfferRows = node("#rank-body").innerHTML.match(/<tr/g)?.length || 0;
assert(defaultOfferRows === comparableRows(rows).length, `默认只看可比时应展示 ${comparableRows(rows).length} 条，实际 ${defaultOfferRows}`);

const basisHandler = node("#basis-filter").listeners.change?.[0];
basisHandler({ target: { value: "all" } });
const allRows = node("#rank-body").innerHTML.match(/<tr/g)?.length || 0;
assert(allRows === offers.length, `全部口径应展示 ${offers.length} 条，实际 ${allRows}`);
assert(node("#rank-body").innerHTML.includes("用户确认该分组跑 DeepSeek"), "备注应写入国模羊毛归到 DeepSeek 的说明");

basisHandler({ target: { value: "raw" } });
const rawCount = node("#rank-body").innerHTML.match(/<tr/g)?.length || 0;
const expectedRaw = rows.filter((row) => !row.comparable && row.basis !== "per_request" && row.basis !== "free").length;
assert(rawCount === expectedRaw, `待统一口径应 ${expectedRaw} 条，实际 ${rawCount}`);
assert(node("#rank-body").innerHTML.includes("basis-raw_ratio"), "待统一视图应出现站内分组倍率标签");

/* ---------- 4. 搜索与筛选 ---------- */
const searchHandler = node("#search").listeners.input?.[0];
node("#basis-filter").listeners.change?.[0]({ target: { value: "all" } });
searchHandler({ target: { value: "claude" } });
const claudeRows = node("#rank-body").innerHTML.match(/<tr/g)?.length || 0;
assert(claudeRows > 0 && claudeRows < offers.length, "搜索 claude 应缩小结果集");
assert(node("#rank-body").innerHTML.toLowerCase().includes("claude"), "搜索结果应包含 claude");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`渲染校验通过：站点 ${sites.length} 个，报价 ${offers.length} 条，站点总榜 ${stationBest(rows).size} 行，模型卡片 ${models.filter((m) => m.official).length} 个。`);
