# AI API 公益站与 Token 中转站导航

> 收录 OpenAI、GPT、Claude、Codex、Grok、Gemini、DeepSeek 等 AI API 公益站、低价中转站与 New API 服务入口。

## 中转站的中转站：BeeAPI

[BeeAPI 注册入口](https://beeapi.ai/signup?aff=75OPR7DQRJCG) — 聚合多家 AI API 商家，提供模型价格对比与渠道选择，方便在一个平台比较、切换不同中转服务。官网介绍支持 OpenAI、Anthropic、Gemini 等模型，也可选择官方直连，并提供统一余额计费与自动故障切换。

最后核验：**2026-09-26**

如果你正在搜索 **AI API 公益站、Token 中转站、API 中转站、免费 API、低价 GPT API、Grok API、Claude API、Codex API、New API 导航**，这个仓库提供一份可追溯、可维护的入口清单。

网站版：<https://1sh1ro.github.io/ai-api-zhongzhuan/>

> [!WARNING]
> 中转站能够看到经其转发的请求。不要提交密码、身份证件、私有代码、生产数据或其他敏感内容；不要在公开 Issue 中粘贴 API Key。免费额度、倍率、模型和注册状态随时可能变化，正式业务优先使用模型厂商官方 API。

## 目录

- [特别优惠](#特别优惠)
- [OpenAI GPT Codex 倍率](#openai-gpt-codex-倍率)
- [Claude 倍率](#claude-倍率)
- [Grok 低价模型与倍率](#grok-低价模型与倍率)
- [Gemini 倍率](#gemini-倍率)
- [多模态模型（图像、视频与音频）](#多模态模型)
- [DeepSeek 与国产模型倍率](#deepseek-与国产模型倍率)
- [综合多模型入口](#综合多模型入口)
- [倍率待补充](#倍率待补充)
- [待恢复或待人工核验](#待恢复或待人工核验)
- [怎么使用 API 中转站](#怎么使用-api-中转站)
- [收录原则](#收录原则)
- [风险说明](#风险说明)
- [致谢](#致谢)
- [ModelRush（付费多模态 API 平台）](#modelrush)

本页按模型生态和能力关键词分类，同一站点会在相关分类重复出现，方便按需求比较；“特别优惠”是横向速览，“综合多模型入口”收录跨模型生态或聚合型入口。

## 特别优惠

优先展示免费、免费额度、明确的低倍率和订阅优惠。以下信息按“免费/免费额度 → 已知低倍率 → 订阅套餐”排列；`限时`、`不稳定` 和 `动态` 均保留站点当前标注。下面的关键词分类会再次列出同一批入口，方便直接比较。

| 站点 | URL | 特别优惠 | 页面状态 | 信息来源 |
| --- | --- | --- | --- | --- |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | 用户补充模型覆盖全面、线路相对稳定、Grok 价格友好；公开价格接口当前返回 13 个活跃分组，覆盖 OpenAI、Claude、Gemini、Grok、Kimi、DeepSeek、智谱等；Grok 企业版页面显示 1x，按官方价折算约 0.14x（1.4 折、节省 86%），支持 Grok 4.6/4.5、图片和视频 | 可访问（公开注册/价格页；2026-09-03） | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups)；本地访问核验 |
| OrcaRouter | [OrcaRouter](https://www.orcarouter.ai/ref/ref_feec389da7083bc9a430) | 当前免费模型（5 个）：`deepseek/deepseek-v4-flash-free`、`fish-audio/s2.1-pro-free`、`qwen/qwen3.8-27b-free`、`s2.1-pro-free`、`tencent/hy3-free` | 可访问（2026-08-27） | [免费模型页](https://www.orcarouter.ai/zh-CN/offers)；[文档](https://docs.orcarouter.ai/)；本地访问核验 |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | 登录后模型广场显示 57 个模型、26 个分组；最低 GPT 扶贫 0.01x、GPT 狂欢 0.05x、Codex 福利 0.06x；另有 Claude、Grok、国产模型和生图/视频分组 | 登录后可访问（2026-08-29） | [模型广场](https://api.aizzz.xyz/pricing)；本地浏览器登录会话核验 |
| onomeo | [onomeo](https://onomeo.com/?ref=AC-9W6NGP) | 公测免费额度：每日签到首日 50,000，连续签到至第 7 天后每天 200,000（1 额度 = 1 token）；可选购买额度。免费模型由第三方服务商提供，模型页提示不同模型的数据处理方式可能不同；付费模型另有每日公共预算。Issue 报告可选购额度为 $5/1,000,000，具体以付款页为准 | 注册/模型/额度说明页可访问（2026-09-25；未实际注册或调用）；公测中 | [模型列表](https://onomeo.com/zh/models)；[免费额度](https://onomeo.com/zh/free-credits)；[免费模型榜](https://onomeo.com/zh/free-models)；[使用条款](https://onomeo.com/zh/terms)；[Issue #14](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/14) |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | `[限时]国模` 0.001x；图片 0.01x；Codex 福利 0.08x；Grok 混池 0.15x；部分分组标注不稳定或受额度影响 | 可访问（登录后；2026-08-27） | [密钥分组选项](https://api.aijws.com/keys)；本地访问核验 |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | 站内充值比 1:5；按页面倍率折算：GPT 特价 0.08x（页面 0.4x）、GPT 稳定 0.17x（页面 0.85x）、GPT Pro 0.2x（页面 1x）、国模羊毛 0.0002x（页面 0.001x）、image 0.2x（页面 1x）；订阅区截图显示 6 种商品，价格 ¥5.6、¥28.1、¥31.5、¥62.5、¥157.5、¥350 | 用户提供截图（2026-08-29） | 用户提供截图；[注册页](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | OpenAI 福利 0.06x（限时）；普通 0.2x、备用 0.25x、Pro 0.3x（均限时）；Claude/国产 0.7x；视频 1x | 可访问（登录后；2026-08-27） | [可用渠道](https://www.fastaitoken.com/available-channels)；本地访问核验 |
| MoLiFang | [MoLiFang](https://molifangapi.com/register?aff=6FBBCBLMAV7C) | Plus 0.08x；稳定Pro 0.17x；系统按渠道动态选择，具体以站内为准 | 可访问（登录后；2026-08-27） | 用户提供；本地访问核验 |
| Token-X | [Token-X](https://token-x.com/sign-up?aff=H4g2) | CodeX-Pro 订阅：Mini 周卡实付 ¥9.9、到账 ¥20（7 天，限购 1，用量参考约 1 亿 Token）；Lite 月卡实付 ¥30、到账 ¥45；Plus 月卡实付 ¥60、到账 ¥100；Pro 月卡实付 ¥169、到账 ¥300；MAX 月卡实付 ¥299、到账 ¥570；Ultra 月卡实付 ¥599、到账 ¥1,200（以上月卡均 30 天）；基础倍率 0.045x，月卡可叠加 5—6.6 折，最低倍率 0.0225x；第二轮抽奖抽 10 份 Plus 月卡，每份内含 ¥100 额度；试运营阶段主要提供 GPT 系列模型，上游统一使用自建 Pro 20× 号池，不混用 Free 或 Plus 账号资源；无生效订阅时自动使用钱包 | 用户提供套餐及活动信息（2026-08-31） | 用户提供；[Token-X](https://token-x.com/)；[注册页](https://token-x.com/sign-up?aff=H4g2) |

## OpenAI GPT Codex 倍率

按当前可见的最低相关分组倍率从低到高排列；无法与官方价统一换算的动态价格接口放在最后，同一站点可能同时出现在其他模型模块。

| 站点 | 入口 | 分组/倍率 | 状态与来源 |
| --- | --- | --- | --- |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | GPT 扶贫 0.01x；GPT 狂欢 0.05x；Codex 福利 0.06x；GPT Terra/GPT 特价 0.09x；GPT 生图专用 0.135x；GPT luna/PLUS 0.2x；GPT PRO 0.25x；企业稳定 0.35x；OpenAI 官Key 3.5x | 登录后可见；[模型广场](https://api.aizzz.xyz/pricing) |
| 杨的中转小站 | [杨的中转小站](https://ai.yangwang.name/dashboard) | GPT luna 0.02x；ChatGPT Plus 福利 0.03x；PRO 0.15x | Issue 自述与用户截图；[Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4) |
| Token-X | [Token-X](https://token-x.com/sign-up?aff=H4g2) | CodeX-Pro 订阅基础倍率 0.045x；月卡叠加 5—6.6 折后最低 0.0225x；试运营主要提供 GPT 系列模型，统一使用自建 Pro 20× 号池 | 用户提供套餐及活动信息；[Token-X](https://token-x.com/) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | OpenAI 福利 0.06x；普通 0.2x、备用 0.25x、Pro 0.3x | 限时标注；[可用渠道](https://www.fastaitoken.com/available-channels) |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | `Codex Pro（仅限Codex）` 约 0.07x（页面 0.5x，约 0.7 折）；`Codex Pro（外接版）` 约 0.09x（页面 0.6x，约 0.9 折）；ChatGPT 生图页面 1x，图片按张计费 | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups) |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | Codex 福利 0.08x | 登录后可见；[密钥分组选项](https://api.aijws.com/keys) |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | GPT 特价 0.08x（页面 0.4x，按 1:5 折算）；GPT 稳定 0.17x；GPT Pro 0.2x | 用户提供截图；[注册页](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | Codex 补贴 0.08x；Codex Pro 0.25x | 用户补充；[当前入口](https://hezubus.cc/p/) |
| KaiGPT | [KaiGPT](https://gptzzz.ai/register) | OpenAI 主流模型 0.1x（官网按官方价 10% 计费） | 官网说明；具体模型与账户分组以[模型广场](https://gptzzz.ai/model-plaza)为准 |
| AntiCode | [AntiCode](https://anticode.cn/register) | ChatGPT 0.12x（限时不稳定）/0.19x（稳定优选） | [模型广场](https://anticode.cn/pricing) |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/sign-up) | Codex Sale 0.15x、Plus 0.2x、Pro 0.3x；GPT-6 Astra / Plus 在长度 < 272K 档位输入 ¥2、输出 ¥10 / 百万 Token，长上下文与缓存另计 | 运营方更新（2026-09-17）；[实时价格](https://api.linktoagi.com/pricing)；[公开价格 JSON](https://api.linktoagi.com/api/pricing) |
| DayWay | [DayWay](https://dayway.site/) | 代表性倍率 0.23x；代表模型 `gpt-5.6-sol`：输入 ¥1.15/1M、输出 ¥6.90/1M；API 接入 URL：`https://dayway.site/v1`；支持支付宝、发票和绘图工作台 | 用户提供价格快照（数据截至 2026-08-23）；[Issue #3](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/3)；[模型广场](https://dayway.site/pricing) |
| 4Router | [4Router](https://4router.net/register) | `GptPro` 0.45x；`GptPro-Fast` 0.8x；`gift` 0.01x 当前不可选 | [模型价格](https://4router.net/pricing) |
| YonshoreAPI | [YonshoreAPI](https://api.yonshore.com/register) | 公开价格接口当前返回 12 个 GPT/Claude 模型 ID 和按模型、上下文计价公式；未将 tiered expression 折算成单一倍率 | [公开价格 JSON](https://api.yonshore.com/api/pricing)；[Issue #10](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/10) |
| HelpCoder | [HelpCoder](https://helpcoder.cc/register) | 公开价格接口当前列出 14 个 GPT/Codex 模型；Issue #6 报告的注册额度为 2026-08-31 用户实测，本次未复验金额 | [公开价格 JSON](https://helpcoder.cc/api/pricing)；[站点状态](https://helpcoder.cc/api/status)；[Issue #6](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/6) |

## Claude 倍率

按当前可见的最低 Claude 相关分组倍率从低到高排列；限时、不稳定和不同套餐分别保留。

| 站点 | 入口 | 分组/倍率 | 状态与来源 |
| --- | --- | --- | --- |
| KaiGPT | [KaiGPT](https://gptzzz.ai/register) | Claude 主流模型 0.1x（官网按官方价 10% 计费） | 官网说明；具体模型与账户分组以[模型广场](https://gptzzz.ai/model-plaza)为准 |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | `Claude Plus（精品）` 约 0.11x（页面 0.8x，约 1.1 折）；`Claude Max（仅限CC）` 约 0.29x（页面 2x，约 2.9 折）；`Claude Max（外接版）` 约 0.31x（页面 2.2x，约 3.1 折）；Claude 官渠约 0.71x（页面 5x，约 7.1 折） | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups) |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | Claude 满缓存渠道 0.25x；CC 长期稳定 0.55x；日区 CC 0.75x；CCMAX 特价 0.8x；CCMAX 官转 1.3x | 登录后可见；[模型广场](https://api.aizzz.xyz/pricing) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | `claudecode-krio逆向` 0.35x；`claude-russia` 1x；`ccmax` 1.4x；`ccmax-外接` 1.6x | 用户补充；[当前入口](https://hezubus.cc/p/) |
| 4Router | [4Router](https://4router.net/register) | `cheapClaude` 0.45x；`ccMax-sale` 0.8x | [模型价格](https://4router.net/pricing) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | Claude 0.7x | [可用渠道](https://www.fastaitoken.com/available-channels) |
| AntiCode | [AntiCode](https://anticode.cn/register) | Claude 0.88x（限时不稳定）/1.5x（稳定优选） | [模型广场](https://anticode.cn/pricing) |
| YonshoreAPI | [YonshoreAPI](https://api.yonshore.com/register) | 公开价格接口当前列出 Claude 模型 ID 和分组/上下文计价公式；未折算成单一倍率 | [公开价格 JSON](https://api.yonshore.com/api/pricing)；[Issue #10](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/10) |

## Grok 低价模型与倍率

按当前可见的有效 Grok 相关倍率从低到高排列；倍率未单列的接入放在最后。

| 站点 | 入口 | 分组/倍率 | 状态与来源 |
| --- | --- | --- | --- |
| BeeAPI | [BeeAPI](https://beeapi.ai/signup?aff=75OPR7DQRJCG) | Grok 0.014x（用户提供；官网公开页暂未列出 Grok 型号或该价格，待核验） | 用户提供（2026-09-26）；[官网](https://beeapi.ai/)；[注册链接](https://beeapi.ai/signup?aff=75OPR7DQRJCG) |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | `Grok 企业版` 约 0.14x（页面 1x，约 1.4 折）；支持 Grok 4.6/4.5、图片和视频 | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups) |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | Grok 混池 0.15x | 登录后可见；[密钥分组选项](https://api.aijws.com/keys) |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | GROK 0.2x | 登录后可见；[模型广场](https://api.aizzz.xyz/pricing) |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/sign-up) | Grok 0.2x | 运营方更新（2026-09-17）；[公开价格 JSON](https://api.linktoagi.com/api/pricing) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | `grok-特惠` 0.3x | 用户补充；[当前入口](https://hezubus.cc/p/) |
| 杨的中转小站 | [杨的中转小站](https://ai.yangwang.name/dashboard) | 接入 Grok 4.6；倍率未单列 | Issue 自述；[Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4) |

## Gemini 倍率

按当前可见的 Gemini 相关分组倍率从低到高排列；未单列价格的入口放在表格后部，使用前请到站内确认模型和计费方式。

| 站点 | 入口 | 分组/覆盖 | 状态与来源 |
| --- | --- | --- | --- |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | Gemini 0.3x | 登录后可见；[模型广场](https://api.aizzz.xyz/pricing) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | `gemini特惠` 0.3x | 用户补充；[当前入口](https://hezubus.cc/p/) |
| AntiCode | [AntiCode](https://anticode.cn/register) | Gemini 0.6x | [模型广场](https://anticode.cn/pricing) |
| BeeAPI | [中转站的中转站：BeeAPI](https://beeapi.ai/signup?aff=75OPR7DQRJCG) | 官网介绍支持 Gemini；未公布可直接比较的单模型倍率，注册和调用尚未实际验证 | [官网](https://beeapi.ai/)；[注册链接](https://beeapi.ai/signup?aff=75OPR7DQRJCG) |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | 公开模型/价格信息包含 Gemini；当前记录未列出单独倍率 | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups) |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/sign-up) | 维护信息列有 Gemini 覆盖；当前价格摘要未列单独倍率 | [实时价格](https://api.linktoagi.com/pricing)；[公开价格 JSON](https://api.linktoagi.com/api/pricing) |
| TokenWorks | [TokenWorks](https://api.token8341.com/sign-up) | 官方价格页列有 Gemini 2.5 Pro、Gemini 2.5 Flash；按具体输入/输出单价计费 | [模型价格](https://www.token8341.com/zh/pricing)；[API 文档](https://www.token8341.com/zh/docs) |
| otter Link | [otter Link](https://otterl.com/) | 当前公开模型分组含 Gemini；价格接口内的站内模型倍率不直接等同于相对官方价倍率 | [公开价格 JSON](https://otterl.com/api/pricing) |

## 多模态模型

这里按公开信息中出现的图像、视频、语音或绘图能力归类。部分入口只提供特定媒体模型或工作台，不代表支持所有多模态任务。

| 站点 | 入口 | 能力/价格信息 | 状态与来源 |
| --- | --- | --- | --- |
| ModelRush | [ModelRush](https://modelrush.ai/) | 文本、图片、视频和语音统一 API；提供图片生成/编辑、视频生成、语音合成/转录等接口，按模型列价 | [模型目录](https://modelrush.ai/models)；[实时价格](https://modelrush.ai/pricing)；[API 文档](https://modelrush.ai/docs) |
| TokenWorks | [TokenWorks](https://api.token8341.com/sign-up) | 官方目录包含图片生成、视频生成、TTS/ASR、嵌入与重排模型；模型价格按用量列出 | [模型价格](https://www.token8341.com/zh/pricing)；[API 文档](https://www.token8341.com/zh/docs) |
| otter Link | [otter Link](https://otterl.com/) | 公开模型列表含“画图”分组及 Gemini 图像模型；各分组模型与倍率以实时价格接口为准 | [公开价格 JSON](https://otterl.com/api/pricing) |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | GPT 生图专用 0.135x；Adobe 生图 0.33x；MiniMax/可灵视频 1x；AzGPT 生图 2x | 登录后可见；[模型广场](https://api.aizzz.xyz/pricing) |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | Grok 4.6/4.5 支持图片和视频；ChatGPT 生图页面按张计费 | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups) |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | 图片 0.01x | 登录后可见，分组稳定性和额度有限制；[密钥分组选项](https://api.aijws.com/keys) |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | image 页面倍率 1x，按 1:5 充值比折算约 0.2x | 用户提供截图；[注册页](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | 视频分组 1x | 登录后可见；具体可用模型以[可用渠道](https://www.fastaitoken.com/available-channels)为准 |
| OrcaRouter | [OrcaRouter](https://www.orcarouter.ai/ref/ref_feec389da7083bc9a430) | 免费模型中含 `fish-audio/s2.1-pro-free` | [免费模型页](https://www.orcarouter.ai/zh-CN/offers)；[文档](https://docs.orcarouter.ai/) |
| 杨的中转小站 | [杨的中转小站](https://ai.yangwang.name/dashboard) | Issue 自述提供免费生图，倍率未列 | [Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4) |
| DayWay | [DayWay](https://dayway.site/) | 提供绘图工作台；该信息描述的是工作台，不等同于已核实的图像 API 分组 | 用户价格快照；[模型广场](https://dayway.site/pricing) |

## DeepSeek 与国产模型倍率

按当前可见的最低国产模型相关分组倍率从低到高排列；免费模型单独标为“免费”，不按 0x 参与数值比较。

| 站点 | 入口 | 分组/倍率 | 支持模型或说明 | 状态与来源 |
| --- | --- | --- | --- | --- |
| OrcaRouter | [OrcaRouter](https://www.orcarouter.ai/ref/ref_feec389da7083bc9a430) | 免费 | DeepSeek、Qwen 等免费模型，完整模型 ID 见上方特别优惠 | [免费模型页](https://www.orcarouter.ai/zh-CN/offers) |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | 国模羊毛 0.0002x（页面 0.001x，按 1:5 折算） | 截图标注限 GPT 订阅用户使用 | 用户提供截图；[注册页](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | `[限时]国模` 0.001x | 国产模型；部分分组受额度和稳定性影响 | [密钥分组选项](https://api.aijws.com/keys) |
| 杨的中转小站 | [杨的中转小站](https://ai.yangwang.name/dashboard) | GLM-5.3/DeepSeek 低至 0.01x | 注册送余额；容量有限 | Issue 自述；[Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4) |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | 国产模型 0.3x；DeepSeek 0.7x | 登录后可见 | [模型广场](https://api.aizzz.xyz/pricing) |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/sign-up) | DeepSeek 0.5x | 站内分组倍率；其他分组倍率各异 | 运营方更新（2026-09-17）；[公开价格 JSON](https://api.linktoagi.com/api/pricing) |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | 智谱 0.5x；DeepSeek 0.75x（自部署精选）/0.9x（官方满血） | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | `glm` 0.7x | 国产模型分组 | 用户补充；[当前入口](https://hezubus.cc/p/) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | 国产模型 0.7x | 具体模型以可用渠道为准 | [可用渠道](https://www.fastaitoken.com/available-channels) |
| 艾可 API | [艾可 API](https://ai.wisech.com/register) | `豆包分组` 1x | 部分模型动态计费 | [模型广场](https://ai.wisech.com/pricing) |

## 综合多模型入口

这些入口面向多个模型生态或聚合多家服务；未公布单一模型的明确倍率时，先查看站内实时目录和计费说明。同一入口也可能出现在上方的模型/能力分类中。

| 站点 | 入口 | 当前可见信息 | 状态与来源 |
| --- | --- | --- | --- |
| BeeAPI | [中转站的中转站：BeeAPI](https://beeapi.ai/signup?aff=75OPR7DQRJCG) | 官网介绍聚合多家 AI API 商家，提供价格对比与渠道选择；覆盖 OpenAI、Anthropic、Gemini 等。注册、实际价格和调用能力尚未实际验证 | [官网](https://beeapi.ai/)；[注册链接](https://beeapi.ai/signup?aff=75OPR7DQRJCG) |
| TokenWorks | [TokenWorks](https://api.token8341.com/sign-up) | 官方定价目录汇总 20 家模型厂商，展示官方价与本站按量价；包含文本、图片、视频、语音等模型 | [模型价格](https://www.token8341.com/zh/pricing)；[关于页面](https://www.token8341.com/zh/about)；[API 文档](https://www.token8341.com/zh/docs) |
| KaiGPT | [KaiGPT](https://gptzzz.ai/register) | OpenAI 与 Claude 主流模型官网标注 0.1x；账户模型和具体价格需从模型广场核对 | [官网](https://gptzzz.ai/)；[模型广场](https://gptzzz.ai/model-plaza)；[文档](https://gptzzz.ai/docs/) |
| YonshoreAPI | [YonshoreAPI](https://api.yonshore.com/register) | 多个 GPT 与 Claude 模型、Responses/Messages 接口；公开价格 API 按模型和上下文提供计价配置 | [公开价格 JSON](https://api.yonshore.com/api/pricing)；[Issue #10](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/10) |
| otter Link | [otter Link](https://otterl.com/) | 公开价格接口列出 49 个模型、11 个分组，覆盖 GPT、Claude、Gemini、绘图及国产模型 | [公开价格 JSON](https://otterl.com/api/pricing)；[站点状态/公告](https://otterl.com/api/status)；[Issue #7](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/7) |
| OrcaRouter | [OrcaRouter](https://www.orcarouter.ai/ref/ref_feec389da7083bc9a430) | 多模型统一入口；当前免费列表含 DeepSeek、Fish Audio、Qwen、Tencent 等模型 | [免费模型页](https://www.orcarouter.ai/zh-CN/offers)；[文档](https://docs.orcarouter.ai/) |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | 其他分组：Gemini 0.3x、Adobe 渠道生图 0.33x、default/即梦/香蕉2/MiniMax/可灵视频 1x、AzGPT 生图 2x | 登录后可见；[模型广场](https://api.aizzz.xyz/pricing) |
| MoLiFang | [MoLiFang](https://molifangapi.com/register?aff=6FBBCBLMAV7C) | Plus 0.08x；稳定Pro 0.17x；系统按渠道动态选择 | 用户提供；本地访问核验 |
| Krill AI | [Krill AI](https://www.krill-ai.com/register?invite=0FZVR9NRFB) | `.net` 会话公告显示 10 人拼团并使用 88 折码后，周卡 0.15x、月卡 0.14x；另有 77 折活动但未展示折后倍率 | [当前会话域名](https://www.krill-ai.net/) |
| APIKEY.FUN | [APIKEY.FUN](https://apikey.fun/register?aff=GLVRZSHR5MKQ) | 覆盖 OpenAI、Claude、Gemini、Grok、Kimi、DeepSeek、智谱等 13 个活跃分组；页面的部分“x 倍率”是站内分组倍率，需按官方价折算；Grok 企业版页面 1x，实际约 0.14x（1.4 折） | [价格页](https://apikey.fun/pricing)；[公开分组数据](https://apikey.fun/api/v1/pricing/groups) |

## 倍率待补充

这些站点目前仍值得关注，但公开信息不足以排出可靠倍率；后续核验到明确价格后再移入上面的排序表。

| 站点 | URL | 当前信息 | 页面状态 | 信息来源 |
| --- | --- | --- | --- | --- |
| Tokens Kingdom | [Tokens Kingdom](https://tokenskingdom.com/register?aff=5FEWPVUHQVJ5) | 本次访问触发 Cloudflare 拦截；倍率未确认 | 本次访问受限（2026-08-27） | 用户提供；本地访问核验 |
| 君の公益 | [君の公益](https://muyuan.do/) | 本次未通过 Cloudflare 安全验证；倍率未确认 | 本次访问受限（2026-08-27） | [站长近况帖](https://linux.do/t/topic/1811633)；本地访问核验 |
| IKunCode | [IKunCode](https://api.ikuncode.cc/register) | 页面提示当前地区不可用；倍率未确认 | 当前地区不可用（2026-08-27） | 本地访问核验 |

表中的页面状态只表示本次核验时观察到的页面结果，**不保证注册一定成功，也不代表模型、额度或服务长期可用**。

## 待恢复或待人工核验

| 站点 | URL | 当前情况 | 来源 |
| --- | --- | --- | --- |
| Huainova 公益站 | [Huainova](https://ai.huaibao.top/register) | 当前公告称渠道几乎全部失效，等待新渠道开放；倍率未确认 | [开放注册帖](https://linux.do/t/topic/2208888)；[站点](https://ai.huaibao.top/register)；本地访问核验（2026-08-27） |
| 黑与白公益站 | [黑与白](https://cdk.hybgzs.com/) | 当前登录页要求 LINUX DO、Catalley、GitHub 或 WebAuthn 等方式，倍率未确认 | [使用教程](https://linux.do/t/topic/2051930)；本地访问核验（2026-08-27） |

## 怎么使用 API 中转站

大多数 New API / One API 兼容站会提供两个关键参数：

```text
Base URL: https://example.com/v1
API Key:  在站点控制台自行创建
```

常见客户端包括 Codex、Claude Code、CC Switch、Cherry Studio、OpenCode 和 OpenClaw。不同站点对 `/v1`、Responses API、Claude 原生协议、客户端 User-Agent 和模型名称的要求不同，请优先阅读该站公告，不要用高频测活请求消耗公益资源。可参考 [LINUX DO 公益站入门讨论](https://linux.do/t/topic/2265743)。

## 收录原则

- 只收录公开注册页、官网或可追溯的公开来源。
- 不收录或传播公共 API Key、Cookie、账号、兑换码、后台链接和疑似泄露凭据。
- 部分 URL 带有推荐参数，可能给链接提供者或注册者带来额度等权益；这不影响收录排序。
- “免费”“倍率”和“支持模型”必须带核验日期或标注为用户提供/历史信息。
- 站点失效、停止注册或争议较大时，移动到待核验区，不静默删除历史。

欢迎通过 [Issue](../../issues/new) 提交可公开访问的 AI API 中转站，并附上官网/注册链接和可追溯的公开来源。

完整结构化数据见 [`data/sites.json`](data/sites.json)，提交新站或更新状态请阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

## 风险说明

第三方 API 中转可能存在日志留存、模型掺水、能力裁剪、限流、突然关站、余额失效和上游合规风险。本站仅做信息导航，不运营、不担保任何第三方服务，也不鼓励绕过模型厂商或站点自身的使用规则。

## 致谢

仓库的信息密度和检索关键词参考了 [bubblevv/ai-api-gongyi-nav](https://github.com/bubblevv/ai-api-gongyi-nav)，本站内容与数据结构为独立整理。

<a id="modelrush"></a>

## ModelRush（付费多模态 API 平台）

[ModelRush 官网](https://modelrush.ai/) 将文本、图片、视频和语音模型整合到统一 API，并提供公开模型目录和按模型定价。API 使用 OpenAI 兼容地址 `https://api.modelrush.ai/v1`；文档列出 Chat Completions、图片生成与编辑、视频生成、语音合成与转录等接口。具体模型、地区和请求格式以实时目录与文档为准。

- **计费**：模型 API 按实际用量从预付额度扣费。价格页当前另列 Agent Basic 订阅：US$10/月，符合条件的新用户可获 30 天试用且需要绑卡；Agent 订阅费不包含模型 API 用量。公开模型价格示例：DeepSeek V4.1 Flash 输入 US$0.33、输出 US$1.32 / 百万 Token；GPT Image 2 US$0.006 / 张；Wan 3 Spicy（480P）US$0.0385 / 秒。价格页标注数据更新于 2026-09-23，实际价格以当前页面为准。
- **年龄限制**：带 Spicy 标识的部分模型要求账号完成成人访问确认；使用前查看对应模型说明和服务条款。
- **状态**：官网、注册页、文档和价格页于 2026-09-25 可访问；未创建账号或发起付费调用。Issue #8 的旧申请称没有试用；当前 Agent Basic 页面已有需绑卡试用说明，且它与模型 API 计费分开。

入口：[注册](https://modelrush.ai/sign-up) · [模型目录](https://modelrush.ai/models) · [实时价格](https://modelrush.ai/pricing) · [API 文档](https://modelrush.ai/docs) · [Issue #8](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/8)
