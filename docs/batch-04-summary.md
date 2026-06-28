# Batch 04 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- 在 `packages/llm` 中新增 `OllamaProvider`。
- 新增 `createProvider()`，通过 `USE_OLLAMA=1` 切换本地 Ollama，否则使用 MockLLM。
- 新增模型连通性测试 `testProvider()`。
- 新增四类 Prompt 构建器：
  - 每日复盘
  - 消息分类
  - 题材分析
  - 明日观察计划
- agent 增加 AI 任务命令：
  - `ai:review`
  - `ai:plan`
  - `ai:news`
  - `ai:theme`
  - `ai:test`
- 根目录增加对应脚本。
- 桌面端抽出 dashboard view model，为后续从 SQLite/Tauri 读取数据做准备。

## 可用命令

```bash
pnpm agent:mock 2026-06-28
pnpm ai:review 2026-06-28
pnpm ai:plan 2026-06-28
pnpm ai:news 2026-06-28
pnpm ai:theme 2026-06-28
pnpm llm:test
```

接本地 Ollama：

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm llm:test
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
```

## 尚未完成

- 未接线上大模型 Provider。
- 桌面端尚未调用 Tauri command 读取 SQLite。
- 尚未做 JSON/CSV 导入。

## 下一步

Batch 05：JSON/CSV 导入与桌面端数据服务层。
