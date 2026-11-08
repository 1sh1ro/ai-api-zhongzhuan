# 注册转化数据

`data/registrations.json` 记录通过本站推广链接产生的注册人数，由维护者从各站点后台手工抄录。这个数据只用于“通过本站链接注册”榜单，不参与价格排名和评分。

## 字段

| 字段 | 说明 |
| --- | --- |
| `stationId` | 对应 `data/sites.json` 里的站点 id |
| `count` | 统计周期内的注册人数，整数 |
| `period` | 统计周期，格式 `YYYY-MM` |
| `source` | 数据来源，例如 `affiliate-dashboard`、`station-report` |
| `updatedAt` | 抄录日期，格式 `YYYY-MM-DD` |
| `note` | 可选说明 |

## 示例

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-11-09",
  "registrations": [
    {
      "stationId": "znbcode",
      "count": 12,
      "period": "2026-11",
      "source": "affiliate-dashboard",
      "updatedAt": "2026-11-09",
      "note": "后台推广数据"
    }
  ]
}
```

## 更新流程

1. 登录各站点后台，找到推广或邀请数据页，抄下当月注册人数。
2. 修改 `data/registrations.json`，保留没有变化的条目。
3. 更新顶层 `updatedAt`。
4. 提交并推送，构建会自动在首页生成“通过本站链接注册”榜单，并在对应站点页显示人数。

同一站点同一周期只保留一条记录，更新时直接改 `count`，不要追加重复条目。
