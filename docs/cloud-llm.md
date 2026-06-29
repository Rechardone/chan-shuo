# Cloud LLM Provider

`packages/llm` 现在支持 OpenAI-compatible Chat Completions 接口。

## 环境变量

```text
USE_CLOUD_LLM=1
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=你的本地密钥
```

## 测试

```bash
USE_CLOUD_LLM=1 LLM_API_KEY=你的本地密钥 pnpm llm:test
```

## 生成复盘

```bash
USE_CLOUD_LLM=1 LLM_API_KEY=你的本地密钥 pnpm ai:review 2026-06-28
```

## 说明

- `LLM_BASE_URL` 可以替换为任何兼容 `/chat/completions` 的服务地址。
- `LLM_PROVIDER` 只是保存到 `ai_analysis.provider` 的名称。
- `.env` 不要提交到 Git。
- 云端模型仅用于生成复盘文本，不参与自动交易。
