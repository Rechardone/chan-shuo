# Codex Task Queue

## 当前分支

`codex/batch-01-bootstrap`

## 当前 PR 目标

完成工程骨架、包配置、开发文档、Prompt 模板与 mock 数据。

## 下一个 Codex 指令

请从 `docs/next-codex-task.md` 开始，继续 Batch 02。

重点：

1. 完成 DB DAO。
2. 将 `apps/agent` 的 mock 数据写入 SQLite。
3. 从 SQLite 读取数据生成每日复盘。
4. 将 AI 复盘保存到 `ai_analysis`。
5. 修复 package scripts，确保命令可运行。

## 不要做

- 不接真实受限接口。
- 不做自动交易。
- 不处理账号、密码、token。
