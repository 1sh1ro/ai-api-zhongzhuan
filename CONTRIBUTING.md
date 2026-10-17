# 贡献指南

欢迎通过 Issue 或 Pull Request 补充 AI API 公益站、Token 中转站和 New API 服务。

## 提交信息

请至少提供：

- 站点名称、官网和公开注册入口
- 支持的协议或模型
- 免费额度、倍率或收费方式，以及信息日期
- 来源链接，例如站长公告、官网说明或 linux.do 原帖
- 当前注册是否开放，是否需要社区等级或特定登录方式

## 不接受的内容

- API Key、Cookie、账号密码、会话令牌和带敏感参数的后台链接
- 来历不明的公共密钥、破解服务、盗刷或绕过计费教程
- 无法追溯来源的夸张宣传
- 隐藏 URL 中的推广参数或把推荐链接描述为官方裸链接

URL 参数或路径包含推广标识的入口可以提交，但仓库会披露这些标识。推荐位由维护者选择并明确标记为置顶；其余目录条目按用户选择的方式排序，模型倍率表按条目注明的价格口径排序，不按推广收益排序。

## 状态定义

- `registration-page-reachable`：注册页返回正常页面，不保证注册一定成功。
- `automated-access-blocked`：自动请求被防护拦截，需要人工检查。
- `manual-verification-required`：登录、邀请码或其他条件使自动核验不可行。
- `degraded`：站点公告或近期来源显示服务明显降级。

修改 `data/sites.json` 后运行：

```powershell
node scripts/validate-data.mjs
```
