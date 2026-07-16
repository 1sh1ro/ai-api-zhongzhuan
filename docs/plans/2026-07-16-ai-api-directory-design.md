# AI API 公益站导航设计

## 目标

创建一个以中文检索为主、同时对搜索引擎和 AI 易于理解的 GitHub 导航仓库。核心关键词覆盖 AI API 公益站、Token 中转站、API 中转、免费 API、低价 API、GPT、Claude、Codex、Grok、Gemini、DeepSeek 和 New API。

## 结构

`README.md` 提供人类可读的入口表、风险说明和使用指南；`data/sites.json` 保存可复用的结构化记录；`CONTRIBUTING.md` 定义收录规则；`scripts/validate-data.mjs` 和 GitHub Actions 检查必填字段、HTTPS 链接及敏感参数。

## 数据来源

首版来源分为用户明确提供、本地浏览历史中经授权筛选出的公开域名、linux.do 公开主题和站点公开状态页。所有浏览历史链接在处理时移除查询参数和片段，不发布后台页面、API Key、Cookie、邮箱或私人社区路径。

## 状态与风险

“注册页可访问”仅代表 HTTP 页面可达，不等于注册成功或服务稳定。倍率和模型能力若无法从公开来源复核，标为用户提供或历史信息。站点公告显示资源失效时进入降级区；自动化访问被防护拦截时进入人工核验区。

