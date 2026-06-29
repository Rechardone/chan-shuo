# Batch 17 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- Tauri 新增 SQLite 持久队列 commands：
  - `enqueue_persistent_tasks`
  - `load_persistent_tasks`
  - `run_next_persistent_task`
- `enqueue_persistent_tasks` 写入 SQLite `task_queue` 表。
- `load_persistent_tasks` 读取最近 50 条持久队列任务。
- `run_next_persistent_task` 调用 agent CLI：

```bash
pnpm --filter @chan-shuo/agent queue:run-once
```

- 桌面端 `TaskQueueService` 从前端内存队列切换为 Tauri + SQLite 持久队列。
- 桌面端队列面板改为展示 SQLite `task_queue`。
- UI 新增“执行下一条”按钮，用于消费 SQLite 队列。
- `docs/task-queue.md` 已更新为 SQLite-backed desktop queue 说明。

## 当前队列流程

```text
点击入库队列
  -> enqueue_persistent_tasks
  -> SQLite task_queue
  -> 点击执行下一条
  -> run_next_persistent_task
  -> pnpm queue:run-once
  -> 更新 task_queue 状态
  -> UI 刷新队列
```

## 尚未完成

- 还没有 Tauri 后台 worker 自动消费队列。
- 还没有队列暂停/取消/重排。
- 还没有真实 Keychain/Stronghold。

## 下一步

Batch 18：Tauri 后台 worker 自动消费 SQLite 队列，或者先做取消/重试/清理队列操作。
