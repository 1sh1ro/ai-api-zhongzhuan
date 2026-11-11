import fs from "node:fs";
import path from "node:path";

const MONTH_RE = /^\d{4}-\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseCsv(text) {
  const source = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function trim(value) {
  return String(value ?? "").trim();
}

function normalizeRecord(raw, label, errors) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    errors.push(`${label}：不是一条有效记录`);
    return null;
  }
  const site = trim(raw.site || raw.stationId);
  const month = trim(raw.month || raw.period);
  const source = trim(raw.source);
  const updated = trim(raw.updated || raw.updatedAt);
  const rawCount = raw.registrations ?? raw.count;
  const countText = rawCount === undefined || rawCount === null ? "" : String(rawCount).trim();
  if (!site && !month && !countText && !source && !updated) return null;
  if (!site) {
    errors.push(`${label}：缺少站点 id（字段 site）`);
    return null;
  }
  if (!MONTH_RE.test(month)) {
    errors.push(`${label}：月份 month 必须是 YYYY-MM（当前是 ${month || "空"}）`);
  }
  if (countText === "") return null;
  if (!/^\d+$/.test(countText)) {
    errors.push(`${label}：registrations 必须是大于等于 0 的整数，不要填估计值（当前是 ${countText}）`);
    return null;
  }
  if (updated && !DATE_RE.test(updated)) {
    errors.push(`${label}：updated 必须是 YYYY-MM-DD（当前是 ${updated}）`);
  }
  return {
    site,
    month,
    registrations: Number(countText),
    source,
    updated,
  };
}

function collectFromJson(data, errors) {
  if (Array.isArray(data)) {
    return data.map((item, index) => normalizeRecord(item, `registrations.json 第 ${index + 1} 条`, errors)).filter(Boolean);
  }
  if (!data || typeof data !== "object") {
    errors.push("registrations.json：格式必须是数组，或带 registrations 数组的对象");
    return [];
  }
  if (data.schemaVersion != null && data.schemaVersion !== 1) {
    errors.push("registrations.json：schemaVersion 必须是 1");
  }
  const updated = trim(data.updated || data.updatedAt);
  if (updated && !DATE_RE.test(updated)) {
    errors.push(`registrations.json：顶层 updated 必须是 YYYY-MM-DD（当前是 ${updated}）`);
  }
  const list = data.registrations;
  if (list == null) return [];
  if (!Array.isArray(list)) {
    errors.push("registrations.json：registrations 必须是数组");
    return [];
  }
  return list.map((item, index) => normalizeRecord(item, `registrations.json 第 ${index + 1} 条`, errors)).filter(Boolean);
}

function collectFromCsv(text, errors) {
  const rows = parseCsv(text).filter((row) => row.some((cell) => trim(cell)));
  if (!rows.length) return [];
  const first = rows[0].map((cell) => trim(cell).replace(/^#\s*/, "").toLowerCase());
  const isHeader = first.includes("site") || first.includes("stationid");
  const start = isHeader ? 1 : 0;
  const header = isHeader ? first : [];
  const indexOf = (...names) => header.findIndex((name) => names.includes(name));
  const records = [];
  for (let i = start; i < rows.length; i += 1) {
    const row = rows[i];
    const firstCell = trim(row[0]);
    if (firstCell.startsWith("#")) continue;
    let raw;
    if (isHeader) {
      raw = {
        site: row[indexOf("site", "stationid")] ?? "",
        month: row[indexOf("month", "period")] ?? "",
        registrations: row[indexOf("registrations", "count")] ?? "",
        source: indexOf("source") >= 0 ? row[indexOf("source")] : "",
        updated: indexOf("updated", "updatedat") >= 0 ? row[indexOf("updated", "updatedat")] : "",
      };
    } else {
      raw = { site: row[0], month: row[1], registrations: row[2], source: row[3], updated: row[4] };
    }
    const item = normalizeRecord(raw, `registrations.csv 第 ${i + 1} 行`, errors);
    if (item) records.push(item);
  }
  return records;
}

export function loadRegistrationRecords(root, siteIds) {
  const errors = [];
  const known = siteIds instanceof Set ? siteIds : new Set(siteIds || []);
  const records = [];
  const jsonPath = path.join(root, "data/registrations.json");
  const csvPath = path.join(root, "data/registrations.csv");

  if (fs.existsSync(jsonPath)) {
    try {
      records.push(...collectFromJson(JSON.parse(fs.readFileSync(jsonPath, "utf8")), errors));
    } catch (error) {
      errors.push(`registrations.json：无法解析 JSON（${error.message}）`);
    }
  }

  if (fs.existsSync(csvPath)) {
    records.push(...collectFromCsv(fs.readFileSync(csvPath, "utf8"), errors));
  }

  const seen = new Map();
  const unique = [];
  for (const item of records) {
    if (!known.has(item.site)) {
      errors.push(`${item.site}：未知站点 id，请使用 data/sites.json 里的 id（可参考 data/registrations.template.csv）`);
      continue;
    }
    const key = `${item.site}|${item.month}`;
    const prev = seen.get(key);
    if (prev) {
      if (prev.registrations !== item.registrations) {
        errors.push(`${item.site}（${item.month}）：CSV 与 JSON 中的注册量不一致（${prev.registrations} 与 ${item.registrations}），请只保留一条`);
      }
      continue;
    }
    seen.set(key, item);
    unique.push(item);
  }

  if (errors.length) {
    const error = new Error(`注册量数据校验失败：\n${errors.map((line) => `- ${line}`).join("\n")}`);
    error.registrationErrors = errors;
    throw error;
  }
  return unique;
}

export function registrationsForMonth(records, month) {
  const map = new Map();
  for (const item of records) {
    if (item.month === month) map.set(item.site, item);
  }
  return map;
}

export function latestRegistrationBySite(records) {
  const map = new Map();
  for (const item of records) {
    const current = map.get(item.site);
    if (!current || item.month > current.month || (item.month === current.month && (item.updated || "") > (current.updated || ""))) {
      map.set(item.site, item);
    }
  }
  return map;
}
