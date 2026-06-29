# Batch 10 开发小结

分支：`codex/batch-01-bootstrap`

## 用户纠正

用户明确要求：不要默认强调 OpenAI，因为成本太高。系统需要支持多款模型，重点包括：

- Gemma 本地模型
- DeepSeek 本地模型
- Qwen 本地模型
- DeepSeek API
- Qwen-compatible API
- 其他 OpenAI-compatible 服务作为可选兼容项

## 已完成

- `.env.example` 改为默认 DeepSeek API 示例，本地默认 Gemma。
- `packages/llm` 增加 provider presets：
  - `deepseek`
  - `qwen`
  - `openai`
  - `compatible`
- `OpenAICompatibleProvider` 改为通用兼容 Provider，不再把 OpenAI 作为默认推荐。
- README 更新为“多模型低成本策略”。
- 操作手册更新为 Gemma / DeepSeek / Qwen 优先。
- `docs/cloud-llm.md` 改写为多模型低成本说明。
- 新增 `docs/model-strategy.md`。

## 推荐模型策略

```text
开发调试：MockLLM
日常低成本：本地 Gemma / DeepSeek / Qwen
中文推理补强：DeepSeek API
稳定 JSON 输出：Qwen-compatible 或 DeepSeek API
昂贵模型：只作为兼容选项，不作为默认推荐
```

## 示例命令

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
USE_OLLAMA=1 OLLAMA_MODEL=deepseek-r1:7b pnpm ai:review 2026-06-28
USE_CLOUD_LLM=1 LLM_PROVIDER=deepseek LLM_API_KEY=你的本地密钥 pnpm ai:review 2026-06-28
```

## 下一步

Batch 11：桌面端模型设置页面，让用户在 UI 里选择 Gemma / DeepSeek / Qwen / 自定义兼容接口。
