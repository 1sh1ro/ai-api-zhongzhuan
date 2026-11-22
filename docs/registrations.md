# 怎样更新人气榜注册量

人气榜按「通过本站推广链接注册的人数」排序。这些数字只有各站的推广后台里才有，需要你从后台抄下来，填进仓库后再构建。没有填写的站点会显示「待更新」，页面不会用估计值或点击数填榜。

## 推荐：改 CSV

1. 打开 [`data/registrations.template.csv`](../data/registrations.template.csv)，里面已经列出全部站点的 `site`（id）和对照用的名称。
2. 复制为 [`data/registrations.csv`](../data/registrations.csv)，或直接在 GitHub 网页上编辑这个文件。
3. 把当月注册人数填到 `registrations` 列，例如：

```csv
site,name,month,registrations,source,updated
znbcode,znbcode,2026-11,12,aff后台导出,2026-11-11
```

4. 没有数据的站点请留空，不要写 0 来占位（除非后台确实是 0）。
5. 保存后重新构建即可。本地可运行：

```bash
npm run validate
npm run build
```

若在 GitHub 上提交这个文件，推送后会自动构建并更新人气榜。

`site` 必须和 `data/sites.json` 里的 id 完全一致。写错 id 时构建会失败，并提示哪个值不认识。同一站点同一个月只保留一条记录。

可选列：`source`（如「aff后台截图」或「aff后台导出」）、`updated`（抄录日期，YYYY-MM-DD）。`name` 只方便对照，构建时不用它。

## 也可以改 JSON

[`data/registrations.json`](../data/registrations.json) 使用同一套字段：

```json
{
  "schemaVersion": 1,
  "updated": "2026-11-11",
  "registrations": [
    {
      "site": "znbcode",
      "month": "2026-11",
      "registrations": 12,
      "source": "aff后台导出",
      "updated": "2026-11-11"
    }
  ]
}
```

CSV 和 JSON 可以同时存在；同一站点同一月份如果数字不一致，构建会报错。

## 口径

- 统计的是通过本站推广链接完成的注册人数，不是站点自己的全部用户量，也不是出站点击。
- 排名不可以付费提升。带推广参数的入口仍会标明「推广」，但不加分、不减分。
- 人气高不等于价格真实或服务稳定。
