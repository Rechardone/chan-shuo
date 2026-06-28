# Batch 02：DB 与 mock 数据闭环

## 目标

让 `apps/agent` 可以把 mock 数据写入 SQLite，并读取数据生成 AI 复盘。

## 任务

1. 完成 `packages/db/src/index.ts`。
2. 增加 upsert market mood、limit up、theme rank、news 方法。
3. agent 的 mock 命令写入数据库。
4. ai review 命令从数据库读取数据。
5. 输出结果写入 `ai_analysis` 表。

## 验收

- 初始化数据库成功。
- mock 数据写入成功。
- AI 复盘结果写入成功。
