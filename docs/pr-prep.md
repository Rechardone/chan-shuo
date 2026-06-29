# PR 合并准备

## 分支

```text
codex/batch-01-bootstrap
```

## 合并前必须验证

```bash
pnpm install
pnpm typecheck
pnpm verify
```

## 推荐 PR 标题

```text
feat: bootstrap chan-shuo market review workspace
```

## 推荐 PR 描述

```markdown
## Summary

- 初始化 pnpm monorepo 工程结构。
- 增加 core/db/sources/llm 包。
- 增加 SQLite schema、mock 数据写入、JSON/CSV 导入。
- 增加 MockLLM 与 OllamaProvider。
- 增加 AI 复盘、明日计划、消息分类、题材分析命令。
- 增加 Angular 18 + Tauri 桌面端骨架。
- 增加预警规则、Markdown 报告导出和操作手册。

## Verification

- [ ] pnpm install
- [ ] pnpm typecheck
- [ ] pnpm verify
- [ ] pnpm desktop:dev
- [ ] USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm llm:test

## Notes

当前版本仍是 MVP 骨架，真实数据源、完整 Tauri 数据读取、线上模型 Provider 和交易接口均未接入。
```

## 合并后下一阶段

Batch 08：真实运行修复、完整桌面端 SQLite 数据展示、线上模型 Provider、预警规则 UI。
