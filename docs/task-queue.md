# 任务队列与失败重试

## 当前实现

现在有两层任务队列：

1. 桌面端前端内存队列：用于 UI 一键执行 `review -> plan -> report`。
2. SQLite 持久队列：用于 agent CLI 和后续 Tauri worker。

## 前端一键工作流

```text
review -> plan -> report
```

前端队列按顺序执行，每个任务默认最多重试 1 次。

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

下一步可由 Tauri 后台 worker 周期调用队列执行逻辑，或者直接在 Rust 层消费 `task_queue`。
