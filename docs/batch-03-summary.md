# Batch 03 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- 将 `apps/desktop` 从静态占位改为 Angular 18 应用骨架。
- 新增 Angular 配置和 TypeScript 配置。
- 新增 standalone `AppComponent`。
- 新增市场情绪卡片、题材排行榜、涨停梯队、消息流、AI 复盘员面板。
- 新增基础响应式样式。
- 新增 Tauri v2 配置占位、Rust 入口、Cargo manifest。

## 尚未完成

- 桌面端仍使用静态 mock 数据。
- 还没有通过 Tauri 命令读取 SQLite。
- 还没有接真实 agent API。

## 下一步

Batch 04：接入 OllamaProvider 与 AI 任务队列；同时补桌面端数据服务层。
