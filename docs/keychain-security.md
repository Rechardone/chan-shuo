# Keychain / 密钥安全方案

## 当前状态

当前版本不会把 API Key 写入前端，也不会提交到 Git。

已做处理：

- `.env` 已加入 `.gitignore`。
- `data/model-config.json` 已加入 `.gitignore`。
- `data/task-log.json` 已加入 `.gitignore`。
- `save_model_config` 会强制 `api_key_saved_locally=false`，不会保存密钥。

## 推荐策略

### 阶段 1：环境变量

开发阶段使用本地环境变量：

```bash
USE_CLOUD_LLM=1 LLM_PROVIDER=deepseek LLM_API_KEY=你的本地密钥 pnpm ai:review 2026-06-28
```

### 阶段 2：macOS Keychain

桌面端稳定后，再接 macOS Keychain：

```text
Tauri UI
  -> save_secret(provider, apiKey)
  -> macOS Keychain
  -> run_agent_task 时临时注入环境变量
```

### 阶段 3：任务执行时注入

Tauri 执行 agent 时，不把密钥写文件，只在进程环境里注入：

```text
Command::new("pnpm")
  .env("LLM_API_KEY", keychain_value)
```

## 不允许

- 不把 API Key 写入 Angular 前端源码。
- 不把 API Key 写入 Git。
- 不把 API Key 写入任务日志。
- 不在 stdout/stderr 中输出 API Key。
- 不把密钥放入 SQLite `ai_analysis`。

## 后续实现

Batch 15 可考虑引入：

```text
tauri-plugin-stronghold
或 macOS Keychain 原生调用
```

在实现前，继续使用 `.env` 或 shell 临时环境变量。
