# Batch 06 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- 新增预警规则模块：`packages/core/src/alerts.ts`。
- 新增 Markdown 报告构建器：`packages/core/src/reports.ts`。
- agent 新增命令：
  - `alerts`
  - `report:md`
- 根目录新增脚本：
  - `pnpm alerts`
  - `pnpm report:md`
- Tauri 侧新增 SQLite dashboard command：`load_dashboard_from_sqlite`。
- 桌面端新增 `@tauri-apps/api` 依赖。
- 桌面端 `MarketDashboardService` 优先尝试 Tauri command，失败回退 mock view model。
- 操作手册更新预警和报告导出章节。

## 预警规则

当前支持：

- 市场温度偏强
- 炸板数量偏高
- 连板高度打开
- 题材涨停扩散
- 题材热度居前
- 重要消息催化

## 可用命令

```bash
pnpm alerts 2026-06-28
pnpm report:md 2026-06-28
pnpm report:md 2026-06-28 reports/2026-06-28-review.md
```

## 尚未完成

- Tauri dashboard command 目前只返回摘要卡片，不返回完整题材/涨停/消息列表。
- Markdown 报告当前不会自动拼接最新 AI 复盘结果，只基于结构化数据和预警生成。
- 还需要实际本地运行修复类型/依赖问题。

## 下一步

Batch 07：本地运行修复、完整 Tauri 数据查询、PR 合并准备。
