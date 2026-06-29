# Batch 14 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- Tauri 新增任务日志结构 `TaskLogEntry`。
- `run_agent_task` 执行完成后会追加日志到：

```text
data/task-log.json
```

- Tauri 新增 `load_task_logs` command，返回最近 50 条日志。
- 日志最多保留 200 条，避免文件无限增长。
- 桌面端新增：
  - `task-log.data.ts`
  - `TaskLogService`
  - 任务日志面板
- AI 任务执行完成后自动刷新任务日志。
- `.gitignore` 已更新，忽略：
  - `.env`
  - `data/*.db`
  - `data/model-config.json`
  - `data/task-log.json`
  - `reports/*.md`
- 新增 `docs/keychain-security.md`，明确 Keychain/密钥管理后续方案。

## 安全边界

- 当前仍不保存 API Key。
- 模型配置只保存 provider/model/baseUrl。
- 任务日志不应记录密钥。
- 后续如需保存密钥，应接 macOS Keychain 或 Tauri Stronghold。

## 尚未完成

- 尚未接真实 Keychain。
- 尚未实现任务队列并发控制。
- 任务日志当前是 JSON 文件，不是 SQLite 表。

## 下一步

Batch 15：真实 Keychain/Stronghold、任务队列并发控制、失败重试策略。
