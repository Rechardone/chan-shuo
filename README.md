# A股消息派 AI 复盘系统（chan-shuo）

目标：做一个面向 Mac 的消息派/涨停复盘/题材情绪/AI 分析工具。

## MVP 路线

1. 先用 Mock / JSON / CSV 数据跑通数据库与看板。
2. 再接合法数据源或用户导出数据。
3. 接入本地 Ollama 模型与 OpenAI-compatible 线上模型。
4. 生成盘中摘要、盘后复盘、明日观察计划。

## 技术栈

- pnpm workspace
- apps/desktop: Angular 18 + Tauri
- apps/agent: Node.js + TypeScript CLI
- packages/db: better-sqlite3 + schema.sql
- packages/core: 类型定义、规则模型、预警、报告导出
- packages/llm: Mock / Ollama / OpenAI-compatible 适配器
- packages/sources: Mock / JSON / CSV 数据源适配器

## 快速开始

```bash
pnpm install
pnpm db:init
pnpm agent:mock 2026-06-28
pnpm ai:review 2026-06-28
pnpm alerts 2026-06-28
pnpm report:md 2026-06-28
pnpm desktop:dev
```

默认 AI 复盘使用 MockLLM。接本地 Ollama：

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
```

接 OpenAI-compatible 线上模型：

```bash
USE_CLOUD_LLM=1 LLM_API_KEY=你的本地密钥 pnpm ai:review 2026-06-28
```

## 数据导入

JSON 导入：

```bash
pnpm agent:import:json data/sample-day.json
```

CSV 导入：

```bash
pnpm agent:import:csv data/sample-limit-up.csv 2026-06-28
```

## 验证

```bash
pnpm typecheck
pnpm verify
```

## 操作手册

完整操作说明见：

```text
docs/operation-manual.md
```

## Codex 开发入口

优先阅读：

```text
docs/codex-master-prompt.md
```

后续阶段总结：

```text
docs/batch-05-summary.md
docs/batch-06-summary.md
docs/batch-07-summary.md
docs/batch-08-summary.md
docs/batch-09-summary.md
```

## 合规边界

本项目只做个人研究、复盘、合法数据导入和 AI 辅助分析。不要实现破解接口、绕过登录、盗用 token、高频抓取、自动交易下单或商业化分发受限数据。
