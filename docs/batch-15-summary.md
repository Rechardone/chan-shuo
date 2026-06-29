# Batch 15 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- 桌面端新增任务队列视图模型：`task-queue.data.ts`。
- 桌面端新增 `TaskQueueService`。
- 队列按顺序执行任务，使用 `concatMap` 串行消费。
- 单个任务失败后默认最多重试 1 次。
- AI 复盘员面板新增按钮：
  - `排队：复盘+计划+报告`
- UI 新增“任务队列”面板，显示：
  - task
  - status
  - retryCount / maxRetries
  - message
- 新增 `docs/task-queue.md`。

## 当前队列边界

当前队列是前端内存队列：

- 页面刷新后队列清空。
- 每个任务实际仍通过 Tauri `run_agent_task` 执行。
- 执行结果仍会落到 `data/task-log.json`。

## Keychain 状态

真实 Keychain / Stronghold 还没有引入依赖和写入实现。当前仍维持安全策略：

- 不保存 API Key。
- 不写入前端。
- 不写入 Git。
- 不写入任务日志。

## 下一步

Batch 16：把任务队列持久化到 SQLite 或 Tauri 后台 worker，并评估是否接入 `tauri-plugin-stronghold`。
