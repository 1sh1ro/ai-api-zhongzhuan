// 悬浮评分徽章时显示五维雷达图。数据来自元素的 data-parts 属性，不请求网络。
const DIMENSIONS = [
  { key: "price", label: "价格", max: 40 },
  { key: "transparency", label: "透明", max: 20 },
  { key: "traceability", label: "来源", max: 15 },
  { key: "coverage", label: "覆盖", max: 15 },
  { key: "completeness", label: "完整", max: 10 },
];

const SIZE = 188;
const CENTER = SIZE / 2;
const RADIUS = 62;

let tip = null;

function pointAt(index, ratio) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / DIMENSIONS.length;
  return [CENTER + Math.cos(angle) * RADIUS * ratio, CENTER + Math.sin(angle) * RADIUS * ratio];
}

function polygon(ratios) {
  return ratios.map((ratio, index) => pointAt(index, ratio).map((value) => value.toFixed(1)).join(",")).join(" ");
}

function radarSvg(parts) {
  const ratios = DIMENSIONS.map((dimension, index) => {
    const value = Number(parts[index]) || 0;
    return Math.max(0.04, Math.min(1, value / dimension.max));
  });

  const rings = [0.25, 0.5, 0.75, 1]
    .map(
      (ring) =>
        `<polygon points="${polygon(DIMENSIONS.map(() => ring))}" fill="none" stroke="#dfe3da" stroke-width="1"/>`,
    )
    .join("");

  const axes = DIMENSIONS.map((_, index) => {
    const [x, y] = pointAt(index, 1);
    return `<line x1="${CENTER}" y1="${CENTER}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6e9e1" stroke-width="1"/>`;
  }).join("");

  const labels = DIMENSIONS.map((dimension, index) => {
    const [x, y] = pointAt(index, 1.2);
    return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="middle" font-size="11" fill="#6b7065">${dimension.label}</text>`;
  }).join("");

  return `<svg class="score-tip-radar" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="五维评分雷达图">
    ${rings}${axes}
    <polygon points="${polygon(ratios)}" fill="rgba(63,107,47,0.18)" stroke="#3f6b2f" stroke-width="1.6"/>
    ${ratios
      .map((ratio, index) => {
        const [x, y] = pointAt(index, ratio);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#3f6b2f"/>`;
      })
      .join("")}
    ${labels}
  </svg>`;
}

function buildTip(element) {
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "score-tip";
    tip.hidden = true;
    document.body.appendChild(tip);
  }
  const parts = (element.dataset.parts || "").split(",").map((value) => Number(value) || 0);
  const total = Number(element.dataset.score) || 0;
  const grade = element.dataset.grade || "";
  const name = element.dataset.name || "";
  const rows = DIMENSIONS.map(
    (dimension, index) =>
      `<li><span>${dimension.label}</span><b>${parts[index].toFixed(1)} / ${dimension.max}</b></li>`,
  ).join("");

  tip.innerHTML = `<div class="score-tip-head">
      <strong>${name ? `${name} 综合评分` : "综合评分"}</strong>
      <span class="score-badge grade-${grade}">${total.toFixed(1)} 分 · ${grade}</span>
    </div>
    ${radarSvg(parts)}
    <ul class="score-tip-list">${rows}</ul>
    <p class="score-tip-foot">价格竞争力按对数刻度折算，其余按各维度占比。规则见方法页。</p>`;
}

function placeTip(element) {
  const rect = element.getBoundingClientRect();
  const width = 232;
  const height = 320;
  let left = rect.left + rect.width / 2 - width / 2;
  let top = rect.bottom + 10;
  if (top + height > window.innerHeight) top = rect.top - height - 10;
  left = Math.max(8, Math.min(window.innerWidth - width - 8, left));
  top = Math.max(8, top);
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}

function show(element) {
  buildTip(element);
  placeTip(element);
  tip.hidden = false;
}

function hide() {
  if (tip) tip.hidden = true;
}

document.addEventListener("mouseover", (event) => {
  const element = event.target.closest("[data-parts]");
  if (element) show(element);
});
document.addEventListener("mouseout", (event) => {
  const element = event.target.closest("[data-parts]");
  if (!element) return;
  const next = event.relatedTarget;
  if (!next || !next.closest || !next.closest(".score-tip")) hide();
});
document.addEventListener("focusin", (event) => {
  const element = event.target.closest("[data-parts]");
  if (element) show(element);
});
document.addEventListener("focusout", hide);
window.addEventListener("scroll", hide, { passive: true });
