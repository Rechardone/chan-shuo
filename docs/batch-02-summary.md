# Batch 02 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- 新增 `packages/db/src/repository.ts`。
- 新增 `packages/db/src/index.ts`，暴露数据库初始化、打开数据库和 repository 方法。
- 调整 `packages/db/src/init.ts`，复用统一初始化方法。
- 新增 `apps/agent/src/db-cli.ts`。
- agent mock 命令现在可以采集 MockSource 数据并写入 SQLite。
- agent review 命令现在可以从 SQLite 读取结构化数据、生成 Mock AI 复盘，并保存到 `ai_analysis`。
- 补齐 root / db / core / llm / sources / agent 的脚本配置。

## 可用命令

```bash
pnpm install
pnpm db:init
pnpm agent:mock 2026-06-28
pnpm ai:review 2026-06-28
```

## 尚未验证

本轮通过 GitHub 直接写入，未在本地安装依赖或运行命令。下一步需要在本地或 Codex 运行并修复类型/依赖问题。
