# 比价数据核对记录

核验日期：2026-11-03
核对范围：`data/offers.json` 全部报价、`data/models.json` 全部官方基准价。

## 核对方法

1. 报价逐条回查 `README.md` 的 GPT / Claude / Grok / Gemini / 多模态 / 国产模型六张倍率表与「特别优惠」表。
2. 官方价逐条回查厂商定价页：OpenAI、Anthropic、Google AI Studio、xAI、DeepSeek、智谱。
3. 用 `assets/pricing.js` 复算，`scripts/validate-data.mjs` 校验结构与数值。
4. 判定分四种：一致、修正、存疑、未录入。

## 官方基准价

| 模型 | 官方价（每百万 Token） | 来源 | 结论 |
| --- | --- | --- | --- |
| GPT-6 Astra | $10 / $50，缓存 $1 | OpenAI 定价页 | 一致 |
| GPT-6.1 Sol | $2 / $10，缓存 $0.10 | OpenAI 定价页 | 一致 |
| GPT-6.1 Terra | $1 / $5，缓存 $0.05 | OpenAI 定价页 | 一致 |
| GPT-6 Luna | $0.10 / $0.50，缓存 $0.01 | OpenAI 定价页 | 一致 |
| GPT-6 Sol | $2 / $10，缓存 $0.20 | OpenAI 定价页 | 一致 |
| GPT-5.6 Sol | $4 / $20，缓存 $0.40 | OpenAI 定价页 | 一致 |
| GPT-5.6 Terra | $2 / $12，缓存 $0.20 | OpenAI 定价页 | 一致 |
| GPT-5.6 Luna | $0.20 / $1.20，缓存 $0.02 | OpenAI 定价页 | 一致 |
| GPT-5.5 | $5 / $30，缓存 $0.50 | OpenAI 定价页 | 一致 |
| GPT-5.3 Codex | $1.75 / $14，缓存 $0.175 | OpenAI 定价页 | 价格一致，已按用户要求移除该系列 |
| Claude Fable 5 / 5.1 | $10 / $50；5.1 缓存 $0.25 | Anthropic 定价页 | 一致 |
| Claude Opus 5.5 | $4 / $20，缓存 $0.20 | Anthropic 定价页 | 一致 |
| Claude Opus 5 / 4.8 | $5 / $25，缓存 $0.50 | Anthropic 定价页 | 一致 |
| Claude Sonnet 5.5 | $2 / $10，缓存 $0.10 | Anthropic 定价页 | 一致 |
| Claude Sonnet 5 | $2 / $10，缓存 $0.20 | Anthropic 定价页 | 一致 |
| Claude Sonnet 4.6 | $3 / $15，缓存 $0.30 | Anthropic 定价页 | 一致 |
| Gemini 4 Argon | $2 / $10，缓存 $0.10 | Google AI Studio | 一致，已注明为促销价，12-01 起 $4 / $20 |
| Gemini 3.8 Flash | $0.75 / $3.75，缓存 $0.075 | Google AI Studio | 一致 |
| Gemini 3.1 Pro Preview | $2 / $12，缓存 $0.20 | Google AI Studio | 一致 |
| Grok 4.7 / 4.6 | $2 / $6，缓存 $0.50 | xAI 定价页 | 一致 |
| Grok 4.5 | $2 / $6，缓存 $0.30 | xAI 定价页 | 一致 |
| DeepSeek V4.1 Flash | 高峰 $0.30 / $1.20，缓存命中 $0.006 | DeepSeek 定价页 | 一致，已注明取高峰价 |
| GLM-5.3 | ¥8 / ¥28，缓存命中 ¥2 | 智谱定价页 | 一致 |
| GLM-5.3-Flash | ¥0.8 / ¥2.8，缓存命中 ¥0.23 | 智谱定价页 | 一致 |
| Kimi K3 / K3.1 Pro | 未取到 | 定价页表格为空 | 缺基准 |
| Gemini 4 Barium / GPT Image 2 | 未取到 | 定价页未按单张或未列该型号 | 缺基准 |
| 豆包 Pro | 未取到 | — | 缺基准 |

## 逐站点核对

| 站点 | README 声明 | 数据记录 | 判定 |
| --- | --- | --- | --- |
| API Nebula | GPT ¥0.78 / ¥3.90；Astra ¥3.90 / ¥19.50；5.6-sol ¥1.95 / ¥11.70；Claude 0.0747x、Fable 0.2541x；Grok ¥1 / ¥3；Gemini ¥1.60 / ¥8、0.1196x；生图 ¥0.05/次 | 29 条，数值逐条一致 | 一致；本次补齐 10 条站内分组口径 |
| APIKEY.FUN | Codex Pro 0.5x→约 0.07x；外接 0.6x→0.09x；Claude Plus 0.8x→0.11x；Max 2x→0.29x；外接 2.2x→0.31x；官渠 5x→0.71x；Grok 1x→0.14x | 系数改 0.142 后为 0.071 / 0.085 / 0.114 / 0.284 / 0.312 / 0.71 / 0.142 | 修正；智谱 0.5x、DeepSeek 0.75x / 0.9x 改为不参与排名 |
| OrcaRouter | 5 个免费模型 | 无记录 | 缺口，站点不在 `data/sites.json` |
| AIZZZ | GPT 扶贫 0.01x、狂欢 0.05x、特价 0.09x、luna 0.2x、PRO 0.25x、企业 0.35x、官Key 3.5x；Claude 0.25 / 0.55 / 0.75 / 0.8 / 1.3x；Grok 0.2x；Gemini 0.3x；国产 0.3x；DeepSeek 0.7x | 17 条，均为站内倍率，不参与排名 | 一致；本次补齐 8 条 |
| onomeo | 免费模型按次数 | 1 条免费额度 | 一致 |
| AIJWS | 国模 0.001x、图片 0.01x、Codex 0.08x、Grok 0.15x | 3 条，缺图片 0.01x | 基本一致，缺 1 条 |
| Horizon API | 页面 0.4 / 0.85 / 1 / 0.001，按 1:5 折算 0.08 / 0.17 / 0.2 / 0.0002；image 1x→0.2x | 4 条，换算一致 | 一致，缺 image 一条；国模羊毛只有截图来源、限 GPT 订阅用户，已标待核验并退出排名 |
| FastAI | OpenAI 0.06 / 0.2 / 0.25 / 0.3；Claude 0.7x；国产 0.7x；视频 1x | 6 条 | 一致，缺视频一条 |
| MoLiFang | Plus 0.08x；稳定Pro 0.17x | 2 条 | 一致 |
| Token-X | 基础 0.045x；月卡最低 0.0225x | 2 条 | 一致，充值为订阅口径，不参与排名 |
| 杨的中转小站 | GPT luna 0.02x；Plus 福利 0.03x；PRO 0.15x；GLM/DeepSeek 0.01x；Grok 未列倍率 | 5 条 | 一致 |
| 合租巴士 | Codex 补贴 0.08x、Pro 0.25x；krio 0.35x、russia 1x、ccmax 1.4x、外接 1.6x；gemini 0.3x、glm 0.7x、grok 0.3x | 9 条 | 一致，本次补齐 2 条 |
| 4Router | GptPro 0.45x、Fast 0.8x、gift 0.01x、cheapClaude 0.45x、ccMax-sale 0.8x | 5 条 | 一致 |
| KaiGPT | OpenAI 0.1x；Claude 0.1x | 2 条 | 一致 |
| AntiCode | ChatGPT 0.12 / 0.19x；Claude 0.88 / 1.5x；Gemini 0.6x | 5 条 | 一致 |
| LinkAGI | Codex Sale 0.15x、Plus 0.18x、Pro 0.25x；Grok 0.2x；DeepSeek 0.4x；gpt-6.1-sol ¥0.36 / ¥1.80 | 6 条 | 一致，本次补齐 Plus / Pro |
| DayWay | 代表性倍率 0.23x；gpt-5.6-sol ¥1.15 / ¥6.90 | 单价复算 0.043x 输入、0.051x 输出，加权 0.045x | 冲突：0.23x 与单价不符，采用单价并在备注记录 |
| YonshoreAPI | 只有按模型计价公式 | 无 | 未录入，符合 README 口径 |
| HelpCoder | 14 个模型，未折算 | 无 | 未录入 |
| BeeAPI | Grok 0.014x，待核验 | 1 条，标待核验不排名 | 一致 |
| znbcode | GPT 0.09 / 0.2 / 0.3 / 0.5x；Claude 0.3 / 0.8 / 1.5 / 2x；Grok 0.15x；Gemini 0.4x；DeepSeek / GLM / Kimi 0.3x；生图 ¥0.06 / ¥0.12 | 14 条，按 6.70 折算一致 | 一致，本次补齐 Claude 2x，未录 Kimi 与 nano-banana |
| 艾可 API | 豆包分组 1x | 原记录误挂 GLM-5.3 | 修正为豆包 Pro |
| Zerouter | gpt-5.5 0.075x；5.6-terra 0.075x；6.1-sol 0.19 / 0.22x；Claude opus-5-5 0.29x、sonnet-5-5 与 opus-5 0.23x；Gemini 0.15x；Grok 0.15x；Kimi 0.5x | 9 条 | 一致，本次补齐 5.6-terra |
| ModelRush | DeepSeek $0.33 / $1.32；GPT Image 2 $0.006/张 | 2 条 | 一致 |
| TokenWorks | 20 家厂商按量价目 | 无 | 未录入 |
| otter Link | 49 模型 11 分组 | 无 | 未录入 |
| Tokens Kingdom / 君の公益 / IKunCode / Huainova / 黑与白 | 待核验，无倍率 | 无 | 一致，无报价 |

## 本次修正清单

1. 艾可 API 的「豆包分组」原记录挂在 GLM-5.3，模型归属错误，改为豆包 Pro；豆包官方价未采集，因此不参与倍率排名。
2. APIKEY.FUN 的分组倍率折算系数由 0.14 改为 0.142，结果与 README 的 0.11x / 0.29x / 0.31x / 0.71x 相符。
3. APIKEY.FUN 的智谱 0.5x、DeepSeek 0.75x / 0.9x 在 README 里没有给出折算后倍率，原先套用 0.142 属于外推，改为只显示原值、不参与排名。
4. DayWay 的 0.23x 与它自己公布的单价比价结果 0.045x 冲突，采用可复算的单价口径，并把冲突写进备注。
5. 补齐 26 条此前漏录的报价：API Nebula 站内分组 10 条、znbcode Claude 2x、AIZZZ 8 条、合租巴士 2 条、4Router gift、LinkAGI Plus / Pro、FastAI 备用、Zerouter gpt-5.6-terra。
6. 报价表头统一为「代表模型」，并在页面说明：分组只写到模型系列时取代表模型，分组倍率型报价的排名与选定模型无关。
7. Gemini 4 Argon 官方价注明为促销价，2026-12-01 起翻倍。

## 2026-11-03 追加修正

本节之前的条数按移除 Codex 之前的 136 条统计；移除 Codex 后为 124 条。

1. 撤销把系列分组映射到具体型号的做法。此前「Codex 福利」「Codex Pro」「Claude Max」等分组被挂到 `gpt-5.3-codex`、`claude-opus-5`，属于没有依据的推断。现在这类分组在页面显示「未指定型号」，不再套用任何型号的官方价。
2. 分组倍率型报价不再计算每百万 Token 单价。倍率本身（分组倍率 × 折算系数）与型号无关，保留并参与排名；单价需要具体型号才能算，故显示为空。
3. 只有 README 明确点名型号的报价列入 `data/model-scope.json`，共 21 条；绝对单价与按次计费报价按定义视为指定型号。
4. 模型对照页只使用指定型号的报价，避免把「GPT 特惠」这类通用分组算成某个具体模型的最低价。
5. 修正艾可 API 报价的内部 id，与新的豆包型号保持一致。
6. 按用户要求彻底移除 Codex 系列：删除 12 条 Codex 分组报价（APIKEY.FUN 2 条、AIZZZ 1 条、AIJWS 1 条、Token-X 2 条、合租巴士 2 条、LinkAGI 3 条、API Nebula 1 条）和 `gpt-5.3-codex` 官方模型条目。Codex 不再作为模型系列或筛选项出现。
7. 「国模」分组按用户实际使用确认归到 DeepSeek：Horizon 国模羊毛与 AIJWS 限时国模改指 `deepseek-v4.1-flash`；「国产模型」是更宽泛的统称，FastAI 与 AIZZZ 的国产分组仍用 `domestic-model` 占位。Horizon 国模羊毛仍保留截图来源与「限 GPT 订阅用户」说明。
8. 折扣显示精度修正，极小倍率不再四舍五入成「省 100%」。

## 仍然存疑

- **未指定型号的分组**：多数中转站按系列售卖，未点名版本（如「GPT 特价」「Claude Max」「Codex 福利」）。这类报价在页面上显示「未指定型号」，只参与倍率排名，不显示每百万 Token 单价，也不再映射到任何具体型号。指定型号的报价见 `data/model-scope.json`，其余按系列处理。
- **模型归属假设**：APIKEY.FUN 的 Codex / Claude 分组、KaiGPT、FastAI、AntiCode、4Router、合租巴士等按系列映射到具体型号，属于推断。
- **Kimi 官方价**：Kimi 定价页的价格表由前端渲染，抓取为空，K3 与 K3.1 Pro 没有官方基准，相关报价只显示原值。
- **未录入站点**：OrcaRouter 出现在 README 但不在 `data/sites.json`；TokenWorks、otter Link、Yonshore、HelpCoder 只有计价公式，没有单一倍率，保留在站点目录并标注暂无报价。
- **数据来源强度**：API Nebula、Horizon 的单价来自用户提供的截图或价格快照，未实测扣费；znbcode、LinkAGI、APIKEY.FUN 来自公开价格接口。

## 复算样例

| 报价 | 计算 | 结果 |
| --- | --- | --- |
| znbcode znb-gpt-特惠 | 0.09 × (1 / 6.70) | 0.0134x |
| Horizon GPT 特价 | 0.4 ÷ 5 | 0.08x |
| APIKEY.FUN Claude Plus | 0.8 × 0.142 | 0.1136x |
| API Nebula gpt-6-sol | ¥0.78 ÷ (2 × 6.70) | 0.0582x |
| API Nebula Gemini 4 Argon | ¥1.60 ÷ (2 × 6.70) | 0.1194x |
| LinkAGI gpt-6.1-sol | ¥0.36 ÷ (2 × 6.70) | 0.0269x |
| DayWay gpt-5.6-sol | ¥1.15 ÷ (4 × 6.70)，加权输出 | 0.045x |
| ModelRush DeepSeek | $0.33 ÷ $0.30 | 1.10x |
