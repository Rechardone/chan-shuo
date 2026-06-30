# Batch 19 · 股票基础库查询 CLI 补齐

## 本批目标

继续主链路开发，先补齐股票基础库在 DB repository 与 Agent CLI 层的查询能力，为后续真实行情导入、个股匹配、题材/涨停数据标准化做基础。

## 已完成

- `packages/db/src/repository.ts` 新增股票查询 helper：
  - `getStockByCode(db, code)`：按代码精确查询。
  - `listStocks(db, { market, limit })`：按市场分页/限量列出。
  - `searchStocks(db, { query, market, limit })`：按代码或名称模糊查询，支持市场筛选。
- `apps/agent/src/db-cli.ts` 新增 CLI 命令：
  - `stock:list [market] [limit]`
  - `stock:search <query> [market] [limit]`
  - `stock:get <code>`
- `apps/agent/package.json` 暴露 agent scripts：
  - `stock:list`
  - `stock:search`
  - `stock:get`
- 根 `package.json` 暴露 root scripts：
  - `pnpm stock:list`
  - `pnpm stock:search`
  - `pnpm stock:get`
- `scripts/batch-test.mjs` 增加股票查询链路覆盖：
  - DB `searchStocks` helper 存在。
  - DB `getStockByCode` helper 存在。
  - Agent `stock:search` 命令已接入。
  - 根脚本已暴露 `stock:search`。

## 使用示例

```bash
pnpm stock:list
pnpm stock:list SZ 20
pnpm stock:search 平安
pnpm stock:search 300750
pnpm stock:get 000001
```

## 本批 commits

- `feat(db): add stock lookup helpers`
- `feat(agent): add stock query commands`
- `feat(agent): expose stock query scripts`
- `feat(scripts): add root stock query commands`
- `test(batch): cover stock query cli`

## 测试方式

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git pull
pnpm test:batches
```

测试报告会生成到：

```text
reports/batch-test-<tradeDate>-<runId>.md
reports/batch-review-<tradeDate>-<runId>.md
```

## 备注

当前执行环境只能通过 GitHub connector 修改仓库，无法访问你的本地工作区执行 `pnpm test:batches`。本批已提交测试脚本覆盖，真实测试报告需要在本地运行后生成。
