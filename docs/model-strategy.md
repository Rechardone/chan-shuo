# 模型策略

## 原则

不把系统绑定到昂贵模型。默认策略是：

```text
MockLLM 开发调试
→ 本地 Ollama 模型日常复盘
→ DeepSeek / Qwen 等低成本 API 补强
→ 其他 OpenAI-compatible 服务作为可选项
```

## 本地模型

优先支持 Ollama。常用候选：

```text
gemma3:4b
deepseek-r1:7b
qwen2.5:7b
qwen2.5:14b
```

示例：

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
USE_OLLAMA=1 OLLAMA_MODEL=deepseek-r1:7b pnpm ai:review 2026-06-28
```

## 低成本 API

DeepSeek：

```bash
USE_CLOUD_LLM=1 LLM_PROVIDER=deepseek LLM_API_KEY=你的本地密钥 pnpm ai:review 2026-06-28
```

Qwen-compatible：

```bash
USE_CLOUD_LLM=1 LLM_PROVIDER=qwen LLM_API_KEY=你的本地密钥 pnpm ai:review 2026-06-28
```

## Provider 解析规则

`LLM_PROVIDER` 支持：

```text
deepseek
qwen
openai
compatible
```

其中 `openai` 只作为兼容选项，不作为默认推荐。

## 默认配置

`.env.example` 默认给 DeepSeek API 示例，本地模型默认给 Gemma。
