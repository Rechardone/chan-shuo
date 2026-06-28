# A股消息派 AI 复盘系统（chan-shuo）

目标：做一个面向 Mac 的消息派/涨停复盘/题材情绪/AI 分析工具。

## MVP 路线

1. 先用 Mock / JSON / CSV 数据跑通数据库与看板。
2. 再接合法数据源或用户导出数据。
3. 接入本地 Ollama 模型与线上大模型。
4. 生成盘中摘要、盘后复盘、明日观察计划。

## 技术栈

- pnpm workspace
- apps/desktop: Angular 18 + Tauri（先保留骨架）
- apps/agent: Node.js + TypeScript CLI
- packages/db: better-sqlite3 + schema.sql
- packages/core: 类型定义、规则模型
- packages/llm: 本地/线上模型适配器
- packages/sources: 数据源适配器

## 快速开始

```bash
pnpm install
pnpm db:init
pnpm agent:mock 2026-06-28
pnpm ai:review 2026-06-28
pnpm desktop:dev
```

默认 AI 复盘使用 MockLLM。接本地 Ollama：

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
```

## Codex 开发入口

优先阅读：

```text
docs/codex-master-prompt.md
```

然后按顺序执行：

```text
docs/codex-tasks/batch-01-project-bootstrap.md
docs/codex-tasks/batch-02-db-and-mock-data.md
docs/codex-tasks/batch-03-desktop-tauri-angular.md
docs/codex-tasks/batch-04-llm-integration.md
docs/codex-tasks/batch-05-json-csv-import.md
docs/codex-tasks/batch-06-alerts-and-review.md
```

## 合规边界

本项目只做个人研究、复盘、合法数据导入和 AI 辅助分析。不要实现破解接口、绕过登录、盗用 token、高频抓取、自动交易下单或商业化分发受限数据。
