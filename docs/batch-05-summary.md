# Batch 05 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- 新增 JSON 导入助手：`loadJsonPayload()`。
- 新增 CSV 导入助手：`loadCsvPayload()`。
- CSV 支持三类记录：
  - `type=limit_up`
  - `type=theme`
  - `type=news`
- agent 新增数据导入命令：
  - `import:json`
  - `import:csv`
- 根目录新增数据导入脚本：
  - `pnpm agent:import:json`
  - `pnpm agent:import:csv`
- 新增 CSV 示例文件：`data/sample-limit-up.csv`。
- 桌面端新增 `MarketDashboardService`，为后续从 Tauri/SQLite 读取数据做准备。
- 更新 README。
- 新增完整操作手册：`docs/operation-manual.md`。

## 可用命令

```bash
pnpm agent:import:json data/sample-day.json
pnpm agent:import:csv data/sample-limit-up.csv 2026-06-28
```

## 尚未完成

- 桌面端仍未真正读取 SQLite。
- CSV 当前是轻量解析器，适合简单导入，不适合复杂 Excel 兼容场景。
- 尚未实现预警规则。

## 下一步

Batch 06：预警规则、复盘报告导出、Tauri SQLite 读取接口。
