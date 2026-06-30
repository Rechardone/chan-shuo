# Batch 20 · CSV 导入兼容性修复

## 本批目标

根据本地上传包中的 `data/sample-limit-up.csv` 做导入链路模拟检查，修复 CSV importer 对紧凑样例格式支持不足的问题，让半自动真实数据导入更稳。

## 发现的问题

上传包里的 `data/sample-limit-up.csv` 使用了复用列的紧凑格式：

- `theme` 行把题材涨停数放在 `reason` 列。
- `news` 行把新闻时间放在 `firstLimitTime` 列。
- `news` 行把新闻正文放在 `reason` 列。

旧 importer 只能稳定读取 `limit_up` 行，对上述 `theme/news` 行会丢失关键信息。

## 已完成

- `packages/sources/src/importers.ts`
  - 增加 `cell()`，统一处理空值、空格、fallback。
  - `theme` 行支持从 `limitUpCount / limit_up_count / limitUps / limit_ups / reason` 读取涨停数。
  - `news` 行支持从 `newsTime / news_time / time / firstLimitTime / first_limit_time` 读取时间。
  - `news` 行支持从 `content / reason` 读取正文。
  - 新增 `normalizeNewsTime()`，支持 `09:12` 自动转成 `<tradeDate> 09:12:00`。
  - `limit_up` 行缺少 code/name 时跳过，避免插入脏数据。
  - `marketMood.brokenLimitCount` 根据 `breakCount > 0` 自动估算。

- `scripts/batch-test.mjs`
  - 增加 `sampleCsvTradeDate = '2026-06-27'`。
  - 增加 `data/sample-limit-up.csv` 导入测试。
  - 增加样例 CSV 的题材、涨停、新闻行数断言。

## 模拟验证结果

在当前沙盒中无法安装 pnpm/依赖，但已用等价解析逻辑对上传包内的 `data/sample-limit-up.csv` 做模拟：

```text
主题：机器人=14，PCB=9
涨停：300001 样例机器人，002001 样例PCB
新闻：2026-06-27 09:12:00 工信部发布机器人产业相关政策
```

## 本批 commits

- `fix(sources): support compact csv review rows`
- `test(batch): cover sample csv import`

## 本地测试方式

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git pull
pnpm test:batches
```

单独验证 CSV：

```bash
pnpm db:init
pnpm agent:import:csv data/sample-limit-up.csv 2026-06-27
sqlite3 data/market-core.db "select count(*) from theme_daily_rank where trade_date = '2026-06-27';"
sqlite3 data/market-core.db "select count(*) from limit_up_daily where trade_date = '2026-06-27';"
sqlite3 data/market-core.db "select count(*) from news_flash where news_time like '2026-06-27%';"
```

预期结果分别是：

```text
2
2
1
```
