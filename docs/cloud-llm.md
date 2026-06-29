# 多模型配置：本地优先，低成本 API 其次

目标：不要把系统绑定到昂贵模型。默认优先使用本地模型，线上优先 DeepSeek / Qwen 等 OpenAI-compatible 服务。

## 1. 本地 Ollama 模型

推荐日常复盘优先用本地模型：

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
USE_OLLAMA=1 OLLAMA_MODEL=deepseek-r1:7b pnpm ai:review 2026-06-28
USE_OLLAMA=1 OLLAMA_MODEL=qwen2.5:7b pnpm ai:review 2026-06-28
```

常用本地模型候选：

```text
gemma3:4b
deepseek-r1:7b
qwen2.5:7b
qwen2.5:14b
```

## 2. DeepSeek API

DeepSeek 使用 OpenAI-compatible 调用方式，配置：

```text
USE_CLOUD_LLM=1
LLM_PROVIDER=deepseek
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
LLM_API_KEY=你的本地密钥
```

测试：

```bash
USE_CLOUD_LLM=1 LLM_PROVIDER=deepseek LLM_API_KEY=你的本地密钥 pnpm llm:test
```

生成复盘：

```bash
USE_CLOUD_LLM=1 LLM_PROVIDER=deepseek LLM_API_KEY=你的本地密钥 pnpm ai:review 2026-06-28
```

## 3. Qwen-compatible API

```text
USE_CLOUD_LLM=1
LLM_PROVIDER=qwen
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL=qwen-plus
LLM_API_KEY=你的本地密钥
```

## 4. 其他 OpenAI-compatible 服务

只要服务兼容 `/chat/completions`，都可以配置：

```text
USE_CLOUD_LLM=1
LLM_PROVIDER=你的服务名
LLM_BASE_URL=https://your-provider.example.com/v1
LLM_MODEL=你的模型名
LLM_API_KEY=你的本地密钥
```

## 5. 模型选择策略

```text
日常盘后复盘：本地 gemma / qwen / deepseek-r1
需要更强中文推理：DeepSeek API
需要稳定格式化 JSON：Qwen-compatible API 或 DeepSeek API
不建议默认使用昂贵模型
```

`.env` 不要提交到 Git。云端模型仅用于生成复盘文本，不参与自动交易。
