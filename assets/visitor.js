// 首页每日访问计数：同一浏览器当天只上报一次，计数按上海时区分日。
// 数据存在第三方 Abacus 计数器，不写入 Cookie，不发送页面路径。
(() => {
  const valueNode = document.querySelector("#visitor-count");
  const wrap = document.querySelector("#visitor-stat");
  if (!valueNode || !wrap) return;

  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
  const storageKey = "xulas-visit-day";
  const counterKey = `visits-${day}`;
  const base = "https://abacus.jasoncameron.dev";
  const namespace = "ai-xulas-fun";
  const alreadyCounted = localStorage.getItem(storageKey) === day;

  const request = alreadyCounted
    ? fetch(`${base}/get/${namespace}/${counterKey}`, { referrerPolicy: "no-referrer" })
    : fetch(`${base}/hit/${namespace}/${counterKey}`, { referrerPolicy: "no-referrer" });

  request
    .then((response) => (response.status === 404 ? fetch(`${base}/hit/${namespace}/${counterKey}`, { referrerPolicy: "no-referrer" }) : response))
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((payload) => {
      if (typeof payload.value !== "number") throw new Error("counter value missing");
      valueNode.textContent = String(payload.value);
      wrap.hidden = false;
      localStorage.setItem(storageKey, day);
    })
    .catch(() => {
      wrap.hidden = true;
    });
})();
