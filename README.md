# AI API 公益站与 Token 中转站导航

> 收录 OpenAI、GPT、Claude、Codex、Grok、Gemini、DeepSeek 等 AI API 公益站、低价中转站与 New API 服务入口。

最后核验：**2026-08-11**

如果你正在搜索 **AI API 公益站、Token 中转站、API 中转站、免费 API、低价 GPT API、Grok API、Claude API、Codex API、New API 导航**，这个仓库提供一份可追溯、可维护的入口清单。

> [!WARNING]
> 中转站能够看到经其转发的请求。不要提交密码、身份证件、私有代码、生产数据或其他敏感内容；不要在公开 Issue 中粘贴 API Key。免费额度、倍率、模型和注册状态随时可能变化，正式业务优先使用模型厂商官方 API。

## 快速导航

| 站点 | URL | 已知特点 | 页面状态 | 信息来源 |
| --- | --- | --- | --- | --- |
| OrcaRouter | [OrcaRouter](https://www.orcarouter.ai/ref/ref_feec389da7083bc9a430) | 把 200+ 模型塞进一把 Key：自动路由、上游故障切换；当前免费模型（5 个）：`deepseek/deepseek-v4-flash-free`、`fish-audio/s2.1-pro-free`、`qwen/qwen3.8-27b-free`、`s2.1-pro-free`、`tencent/hy3-free` | 可访问（2026-08-26） | [官网](https://www.orcarouter.ai/zh-CN)；[文档](https://docs.orcarouter.ai/)；本地访问核验 |
| AIZZZ | [AIZZZ](https://api.aizzz.xyz/sign-up?aff=zAnM) | 用户提供并确认可用；注册页已本地访问核验 | 可访问（2026-07-23） | 用户提供；本地访问核验 |
| 合租巴士 | [合租巴士](https://hezu.ink/register) | Codex 补贴分组 0.08x | 可访问（2026-07-24） | [Linux.do](https://linux.do/t/topic/2540812)；本地访问核验 |
| 艾可 API | [艾可 API](https://ai.wisech.com/register) | 国产模型 7 折 | 可访问（2026-07-24） | [Linux.do](https://linux.do/t/topic/2514782)；本地访问核验 |
| 4Router | [4Router](https://4router.net/register) | cheapClaude 0.45x | 可访问（2026-07-24） | [Linux.do](https://linux.do/t/topic/2589048)；本地访问核验 |
| LinkAGI | [LinkAGI](https://api.linktoagi.com/register) | GPT/Codex、Claude、Gemini 按量计费 | 可访问（2026-08-11） | [Issue #1](https://github.com/1sh1ro/ai-api-gongyi-nav/issues/1)；本地访问核验 |
| Krill AI | [Krill AI](https://www.krill-ai.com/register?invite=0FZVR9NRFB) | Grok 免费额度 | 可访问 | 用户提供；2026-07-16 检查 |
| FastAI 模型 | [FastAI](https://www.fastaitoken.com/register?aff=AAYGR6B5HJA8) | Grok 约 0.03 倍率 | 可访问 | 用户提供；2026-07-16 检查 |
| Horizon API | [Horizon API](https://api.honglin.asia/register?aff=FFEYRLUHUVMH) | 低价 GPT | 可访问 | 用户提供；2026-07-16 检查 |
| Tokens Kingdom | [Tokens Kingdom](https://tokenskingdom.com/register?aff=5FEWPVUHQVJ5) | 模型与活动信息待补充 | 可访问 | 用户提供；2026-07-16 检查 |
| AIJWS | [AIJWS](https://api.aijws.com/register?aff=RMW5KZQC2PWJ) | 曾提供 0.001 倍率 Grok，当前倍率待核验 | 自动访问受限（403） | 用户提供；历史信息 |
| 君の公益 | [君の公益](https://muyuan.do/) | Claude、Codex 等；客户端和 IP 可能受限 | 可访问 | [站长近况帖](https://linux.do/t/topic/1811633)；本地访问核验 |
| GGBOOM 公益站 | [GGBOOM](https://ai.qaq.al/register) | 曾提供 Codex/GPT 兑换活动，当前模型与额度以站内公告为准 | 可访问 | [linux.do 讨论](https://linux.do/t/topic/1631249) |
| IKunCode | [IKunCode](https://api.ikuncode.cc/register) | New API 兼容站，具体模型和价格以站内为准 | 可访问 | 本地访问核验 |
| AntiCode | [AntiCode](https://anticode.cn/register) | 支持 CC Switch、Cherry Studio 等客户端配置 | 可访问 | 站点公开状态页；本地访问核验 |

表中的“可访问”只表示注册页面在核验时返回正常页面，**不保证注册一定成功，也不代表模型、额度或服务长期可用**。

## 待恢复或待人工核验

| 站点 | URL | 当前情况 | 来源 |
| --- | --- | --- | --- |
| Huainova 公益站 | [Huainova](https://ai.huaibao.top/register) | 页面可访问，但公开公告称渠道大多失效，等待新渠道开放 | [开放注册帖](https://linux.do/t/topic/2208888)；站点公告 |
| 黑与白公益站 | [黑与白](https://cdk.hybgzs.com/) | 自动检查返回 403；可能需要 LINUX DO 登录或社区资格，需浏览器人工确认 | [使用教程](https://linux.do/t/topic/2051930) |

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
