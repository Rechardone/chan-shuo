# Batch 16 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- `packages/core` 新增持久任务队列类型：
  - `PersistentTaskStatus`
  - `PersistentTaskType`
  - `PersistentTaskQueueItem`
  - `EnqueueTaskInput`
- SQLite schema 新增 `task_queue` 表。
- SQLite schema 新增 `idx_task_queue_status_created` 索引。
- `packages/db` 新增持久队列 repository helper：
  - `enqueueTask`
  - `listTasks`
  - `claimNextTask`
  - `markTaskSuccess`
  - `markTaskFailed`
- agent CLI 新增持久队列命令：
  - `queue:add`
  - `queue:list`
  - `queue:run-once`
- 根目录新增脚本：
  - `pnpm queue:add`
  - `pnpm queue:list`
  - `pnpm queue:run-once`
- `docs/task-queue.md` 更新为 SQLite 持久队列说明。

## 持久队列命令

```bash
pnpm queue:add 2026-06-28 review,plan,report
pnpm queue:list
pnpm queue:run-once
```

## 执行语义

`queue:run-once` 会：

1. claim 最早的 `queued` 任务。
2. 标记为 `running`。
3. 执行对应 agent 任务。
4. 成功标记为 `success`。
5. 失败时增加 `retry_count`，未超过 `max_retries` 回到 `queued`，超过则 `failed`。

## 尚未完成

- Tauri 后台 worker 还没有自动消费 SQLite 队列。
- 队列 UI 目前仍使用前端内存队列。
- 真实 Keychain / Stronghold 仍未接入。

## 下一步

Batch 17：Tauri 后台 worker 消费 SQLite 队列，或将队列 UI 切换到 SQLite 持久队列。
