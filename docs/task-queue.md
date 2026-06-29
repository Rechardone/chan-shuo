# 任务队列与失败重试

## 当前实现

当前队列已经切换为 SQLite 持久队列：

```text
SQLite task_queue
  -> Tauri queue commands
  -> Angular TaskQueueService
  -> 桌面端任务队列面板
```

## 默认工作流

```text
review -> plan -> report
```

点击桌面端“入库队列：复盘+计划+报告”后，会把三条任务写入 SQLite。

## SQLite 持久队列

表结构：

```text
task_queue(
  id,
  trade_date,
  task,
  status,
  retry_count,
  max_retries,
  last_error,
  created_at,
  updated_at
)
```

状态：

```text
queued
running
success
failed
cancelled
```

## Tauri Commands

```text
enqueue_persistent_tasks
load_persistent_tasks
run_next_persistent_task
```

`run_next_persistent_task` 当前内部调用：

```bash
pnpm --filter @chan-shuo/agent queue:run-once
```

## CLI 命令

添加任务：

```bash
pnpm queue:add 2026-06-28 review,plan,report
```

查看任务：

```bash
pnpm queue:list
```

执行一个排队任务：

```bash
pnpm queue:run-once
```

`queue:run-once` 会：

1. claim 最早的 `queued` 任务。
2. 标记为 `running`。
3. 执行对应 agent 任务。
4. 成功则标记 `success`。
5. 失败则增加 `retry_count`，未超过 `max_retries` 时回到 `queued`，否则标记 `failed`。

## 后续增强

下一步可以把 `run_next_persistent_task` 升级成 Tauri 后台 worker 定时自动消费队列，而不是用户手动点击“执行下一条”。
