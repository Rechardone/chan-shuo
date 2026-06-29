# 任务队列与失败重试

## 当前实现

桌面端新增 `TaskQueueService`，用于把多个 agent 任务按顺序执行。

默认“一键工作流”：

```text
review -> plan -> report
```

每个任务默认最多重试 1 次。

## 设计边界

当前队列是前端内存队列：

- 页面刷新后队列会清空。
- 单个任务实际执行仍通过 Tauri `run_agent_task`。
- 每次执行都会写入 `data/task-log.json`。

## 为什么先做前端队列

agent 任务通常是本地个人复盘任务，不需要复杂后台调度。先用前端队列验证体验，再决定是否迁移到 Tauri 持久队列或 SQLite 队列表。

## 后续增强

Batch 16 可将队列持久化到 SQLite：

```text
task_queue(id, task, trade_date, status, retry_count, max_retries, created_at, updated_at)
```

并由 Tauri 后台 worker 串行消费。
