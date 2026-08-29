# AI API 公益站与 Token 中转站导航

> 收录 OpenAI、GPT、Claude、Codex、Grok、Gemini、DeepSeek 等 AI API 公益站、低价中转站与 New API 服务入口。

最后核验：**2026-08-29**

如果你正在搜索 **AI API 公益站、Token 中转站、API 中转站、免费 API、低价 GPT API、Grok API、Claude API、Codex API、New API 导航**，这个仓库提供一份可追溯、可维护的入口清单。

> [!WARNING]
> 中转站能够看到经其转发的请求。不要提交密码、身份证件、私有代码、生产数据或其他敏感内容；不要在公开 Issue 中粘贴 API Key。免费额度、倍率、模型和注册状态随时可能变化，正式业务优先使用模型厂商官方 API。

## 目录

- [特别优惠](#特别优惠)
- [OpenAI GPT Codex 倍率](#openai-gpt-codex-倍率)
- [Claude 倍率](#claude-倍率)
- [Grok 倍率](#grok-倍率)
- [国产模型倍率](#国产模型倍率)
- [综合入口](#综合入口)
- [倍率待补充](#倍率待补充)
- [待恢复或待人工核验](#待恢复或待人工核验)
- [怎么使用 API 中转站](#怎么使用-api-中转站)
- [收录原则](#收录原则)
- [风险说明](#风险说明)
- [致谢](#致谢)

## 特别优惠

优先展示免费、免费额度和明确的低倍率入口。以下信息按“免费/免费额度 → 已知低倍率”排列；`限时`、`不稳定` 和 `动态` 均保留站点当前标注。下面的模型模块会按模型生态再次整理同一批入口，方便直接比较。

| 站点 | URL | 特别优惠 | 页面状态 | 信息来源 |
| --- | --- | --- | --- | --- |
| OrcaRouter | [OrcaRouter](https://www.orcarouter.ai/ref/ref_feec389da7083bc9a430) | 当前免费模型（5 个）：`deepseek/deepseek-v4-flash-free`、`fish-audio/s2.1-pro-free`、`qwen/qwen3.8-27b-free`、`s2.1-pro-free`、`tencent/hy3-free` | 可访问（2026-08-27） | [免费模型页](https://www.orcarouter.ai/zh-CN/offers)；[文档](https://docs.orcarouter.ai/)；本地访问核验 |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | `[限时]国模` 0.001x；图片 0.01x；Codex 福利 0.08x；Grok 混池 0.15x；部分分组标注不稳定或受额度影响 | 可访问（登录后；2026-08-27） | [密钥分组选项](https://api.aijws.com/keys)；本地访问核验 |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | 站内充值比 1:5；按页面倍率折算：GPT 特价 0.08x（页面 0.4x）、GPT 稳定 0.17x（页面 0.85x）、GPT Pro 0.2x（页面 1x）、国模羊毛 0.0002x（页面 0.001x）、image 0.2x（页面 1x）；订阅区截图显示 6 种商品，价格 ¥5.6、¥28.1、¥31.5、¥62.5、¥157.5、¥350 | 用户提供截图（2026-08-29） | 用户提供截图；[注册页](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) |
| 杨的中转小站 | [**杨的中转小站**](https://ai.yangwang.name/dashboard) | 个人自建非盈利；免费生图入口；每日一个低倍率 GPT-5.6 全模型 Plus 号；接入 Grok 4.6；GLM-5.3/DeepSeek 国模分组低至 0.01x；注册送余额，容量有限且稳定性不作承诺 | Issue 自述可访问（2026-08-29） | [Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4)；用户提供截图 |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | OpenAI 福利 0.06x（限时）；普通 0.2x、备用 0.25x、Pro 0.3x（均限时）；Claude/国产 0.7x；视频 1x | 可访问（登录后；2026-08-27） | [可用渠道](https://www.fastaitoken.com/available-channels)；本地访问核验 |
| MoLiFang | [MoLiFang](https://molifangapi.com/register?aff=6FBBCBLMAV7C) | Plus 0.08x；稳定Pro 0.17x；系统按渠道动态选择，具体以站内为准 | 可访问（登录后；2026-08-27） | 用户提供；本地访问核验 |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | 所有分组：ccmax-外接 1.6x、ccmax 1.4x、claude-russia 1x、claudecode-krio逆向 0.35x、codex-pro 0.25x、codex-补贴 0.08x、gemini特惠 0.3x、glm 0.7x、grok-特惠 0.3x；原生4k 仅标注为 `x`，未给出数值 | 用户补充（2026-08-29） | [当前入口](https://hezubus.cc/p/)；用户补充 |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/register) | `default` 0.1x；Codex Sale 0.15x、Plus 0.2x、Pro 0.3x；Grok/DeepSeek 0.2x | 可访问（2026-08-27） | [实时价格](https://api.linktoagi.com/pricing)；[Issue #1](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/1)；本地访问核验 |
| Krill AI | [Krill AI](https://www.krill-ai.com/register?invite=0FZVR9NRFB) | 原 `.com` 入口本次连接重置；已登录的 `.net` 会话公告显示 10 人拼团并使用 88 折码后，周卡 0.15x、月卡 0.14x；另有 77 折限时活动但未展示折后倍率 | 原入口未确认；新域名会话可见（2026-08-27） | [当前会话域名](https://www.krill-ai.net/)；本地访问核验 |

## OpenAI GPT Codex 倍率

按当前可见的最低相关分组倍率从低到高排列；不可选分组不参与排序，同一站点可能同时出现在其他模型模块。

| 站点 | 入口 | 分组/倍率 | 状态与来源 |
| --- | --- | --- | --- |
| 杨的中转小站 | [杨的中转小站](https://ai.yangwang.name/dashboard) | GPT luna 0.02x；ChatGPT Plus 福利 0.03x；PRO 0.15x | Issue 自述与用户截图；[Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | OpenAI 福利 0.06x；普通 0.2x、备用 0.25x、Pro 0.3x | 限时标注；[可用渠道](https://www.fastaitoken.com/available-channels) |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | Codex 福利 0.08x | 登录后可见；[密钥分组选项](https://api.aijws.com/keys) |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | GPT 特价 0.08x（页面 0.4x，按 1:5 折算）；GPT 稳定 0.17x；GPT Pro 0.2x | 用户提供截图；[注册页](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | Codex 补贴 0.08x；Codex Pro 0.25x | 用户补充；[当前入口](https://hezubus.cc/p/) |
| AntiCode | [AntiCode](https://anticode.cn/register) | ChatGPT 0.12x（限时不稳定）/0.19x（稳定优选） | [模型广场](https://anticode.cn/pricing) |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/register) | Codex Sale 0.15x、Plus 0.2x、Pro 0.3x | [实时价格](https://api.linktoagi.com/pricing) |
| 4Router | [4Router](https://4router.net/register) | `GptPro` 0.45x；`GptPro-Fast` 0.8x；`gift` 0.01x 当前不可选 | [模型价格](https://4router.net/pricing) |

## Claude 倍率

按当前可见的最低 Claude 相关分组倍率从低到高排列；限时、不稳定和不同套餐分别保留。

| 站点 | 入口 | 分组/倍率 | 状态与来源 |
| --- | --- | --- | --- |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | `claudecode-krio逆向` 0.35x；`claude-russia` 1x；`ccmax` 1.4x；`ccmax-外接` 1.6x | 用户补充；[当前入口](https://hezubus.cc/p/) |
| 4Router | [4Router](https://4router.net/register) | `cheapClaude` 0.45x；`ccMax-sale` 0.8x | [模型价格](https://4router.net/pricing) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | Claude 0.7x | [可用渠道](https://www.fastaitoken.com/available-channels) |
| AntiCode | [AntiCode](https://anticode.cn/register) | Claude 0.88x（限时不稳定）/1.5x（稳定优选） | [模型广场](https://anticode.cn/pricing) |

## Grok 倍率

按当前可见的最低 Grok 相关分组倍率从低到高排列；倍率未单列的接入放在最后。

| 站点 | 入口 | 分组/倍率 | 状态与来源 |
| --- | --- | --- | --- |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | Grok 混池 0.15x | 登录后可见；[密钥分组选项](https://api.aijws.com/keys) |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/register) | Grok 0.2x | [实时价格](https://api.linktoagi.com/pricing) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | `grok-特惠` 0.3x | 用户补充；[当前入口](https://hezubus.cc/p/) |
| 杨的中转小站 | [杨的中转小站](https://ai.yangwang.name/dashboard) | 接入 Grok 4.6；倍率未单列 | Issue 自述；[Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4) |

## 国产模型倍率

按当前可见的最低国产模型相关分组倍率从低到高排列；免费模型单独标为“免费”，不按 0x 参与数值比较。

| 站点 | 入口 | 分组/倍率 | 支持模型或说明 | 状态与来源 |
| --- | --- | --- | --- | --- |
| OrcaRouter | [OrcaRouter](https://www.orcarouter.ai/ref/ref_feec389da7083bc9a430) | 免费 | DeepSeek、Qwen 等免费模型，完整模型 ID 见上方特别优惠 | [免费模型页](https://www.orcarouter.ai/zh-CN/offers) |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | 国模羊毛 0.0002x（页面 0.001x，按 1:5 折算） | 截图标注限 GPT 订阅用户使用 | 用户提供截图；[注册页](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | `[限时]国模` 0.001x | 国产模型；部分分组受额度和稳定性影响 | [密钥分组选项](https://api.aijws.com/keys) |
| 杨的中转小站 | [杨的中转小站](https://ai.yangwang.name/dashboard) | GLM-5.3/DeepSeek 低至 0.01x | 注册送余额；容量有限 | Issue 自述；[Issue #4](https://github.com/1sh1ro/ai-api-zhongzhuan/issues/4) |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/register) | DeepSeek 0.2x | 其他分组倍率各异 | [实时价格](https://api.linktoagi.com/pricing) |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | `glm` 0.7x | 国产模型分组 | 用户补充；[当前入口](https://hezubus.cc/p/) |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | 国产模型 0.7x | 具体模型以可用渠道为准 | [可用渠道](https://www.fastaitoken.com/available-channels) |
| 艾可 API | [艾可 API](https://ai.wisech.com/register) | `豆包分组` 1x | 部分模型动态计费 | [模型广场](https://ai.wisech.com/pricing) |

## 综合入口

这些入口覆盖多个模型生态，或当前页面没有按单一模型公布完整倍率，适合从站点内的分组列表继续筛选。

| 站点 | 入口 | 当前可见信息 | 状态与来源 |
| --- | --- | --- | --- |
| MoLiFang | [MoLiFang](https://molifangapi.com/register?aff=6FBBCBLMAV7C) | Plus 0.08x；稳定Pro 0.17x；系统按渠道动态选择 | 用户提供；本地访问核验 |
| Krill AI | [Krill AI](https://www.krill-ai.com/register?invite=0FZVR9NRFB) | `.net` 会话公告显示 10 人拼团并使用 88 折码后，周卡 0.15x、月卡 0.14x；另有 77 折活动但未展示折后倍率 | [当前会话域名](https://www.krill-ai.net/) |

## 倍率待补充

这些站点目前仍值得关注，但公开信息不足以排出可靠倍率；后续核验到明确价格后再移入上面的排序表。

| 站点 | URL | 当前信息 | 页面状态 | 信息来源 |
| --- | --- | --- | --- | --- |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | 注册页和首页本次均返回 403；倍率未确认 | 本次访问受限（2026-08-27） | 用户提供；本地访问核验 |
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
