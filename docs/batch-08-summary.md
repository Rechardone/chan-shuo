# Batch 08 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- Tauri SQLite command 从摘要读取升级为完整 dashboard 数据读取。
- `load_dashboard_from_sqlite` 现在返回：
  - 市场情绪卡片
  - 题材排行榜
  - 涨停梯队
  - 消息流
  - 最新 AI 复盘摘要
- 桌面端 `MarketDashboardService` 已适配完整 Tauri payload。
- 根目录新增 `packageManager` 字段。
- 根目录新增 `pnpm verify` 一键验证脚本。
- 新增 GitHub Actions CI。
- 新增验证清单和 PR 准备文档。

## 关键命令

```bash
pnpm install
pnpm typecheck
pnpm verify
```

## 桌面端数据流

```text
SQLite data/market-core.db
  -> Tauri command load_dashboard_from_sqlite
  -> Angular MarketDashboardService
  -> DashboardViewModel
  -> AppComponent
```

## 尚未完成

- 还未实际看到 CI 运行结果。
- Tauri command 暂时只读取 dashboard 需要的数据，没有拆分独立详情接口。
- 还没有线上模型 Provider。

## 下一步

Batch 09：修复 CI 或本地运行错误；增加独立详情接口与线上模型 Provider。
