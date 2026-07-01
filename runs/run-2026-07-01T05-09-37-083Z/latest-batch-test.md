# Chan Shuo Batch Test Report

- Trade date: 2026-06-28
- Sample CSV trade date: 2026-06-27
- Run id: 2026-07-01T05-09-28-110Z
- Workspace root: /Users/kandysmith/dev/chatgpt/chan-shuo
- Batch report: reports/batch-test-2026-06-28-2026-07-01T05-09-28-110Z.md
- Review report: reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md
- Review report absolute path: /Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md
- Latest batch test: reports/latest-batch-test.md
- Latest batch review: reports/latest-batch-review.md
- Started at: 2026-07-01T05:09:28.110Z
- Finished at: 2026-07-01T05:09:36.582Z
- Passed: 24
- Failed: 4

## Summary

| Batch | Case | Result | Duration |
|---|---|---:|---:|
| Batch 1 | DB init and workspace paths | PASS | 342ms |
| Batch 2 | Stock table schema exists | PASS | 4ms |
| Batch 2 | Stock table count is readable | PASS | 3ms |
| Batch 2 | DB stock search helper exists | PASS | 1ms |
| Batch 2 | DB stock get helper exists | PASS | 0ms |
| Batch 2 | Agent stock search command is wired | PASS | 0ms |
| Batch 2 | Root stock scripts are exposed | PASS | 0ms |
| Batch 3 | CSV importer supports compact sample rows | PASS | 0ms |
| Batch 3 | Sample CSV review data import | FAIL | 628ms |
| Batch 3 | Sample CSV theme rows imported | FAIL | 4ms |
| Batch 3 | Sample CSV limit-up rows imported | FAIL | 4ms |
| Batch 3 | Sample CSV news rows imported | FAIL | 4ms |
| Batch 3 | Mock market data import | PASS | 591ms |
| Batch 3 | Mock news import is idempotent | PASS | 4ms |
| Batch 6 | Data quality evaluator | PASS | 607ms |
| Batch 6 | Alert rules | PASS | 605ms |
| Batch 4 | AI daily review with configured provider | PASS | 600ms |
| Batch 4 | Markdown report export | PASS | 602ms |
| Batch 4 | Markdown report file exists | PASS | 0ms |
| Batch 4 | Markdown report contains data quality section | PASS | 0ms |
| Report Center | Generated report is available for preview | PASS | 0ms |
| Report Center | Tauri report preview command exists | PASS | 0ms |
| Report Center | Tauri report preview command is registered | PASS | 0ms |
| Report Center | Desktop report preview service exists | PASS | 0ms |
| Report Center | Desktop report preview UI exists | PASS | 1ms |
| Batch 5 | Queue add workflow | PASS | 602ms |
| Batch 5 | Queue list | PASS | 599ms |
| All | Typecheck workspace | PASS | 3270ms |

## Details

### PASS · Batch 1 · DB init and workspace paths

Command: `pnpm db:init`
Exit status: 0

```text
> chan-shuo@0.1.0 db:init /Users/kandysmith/dev/chatgpt/chan-shuo
> tsx packages/db/src/init.ts

database initialized: /Users/kandysmith/dev/chatgpt/chan-shuo/data/market-core.db
```

### PASS · Batch 2 · Stock table schema exists

Command: `sqlite3 data/market-core.db .schema stock`
Exit status: 0

```text
CREATE TABLE stock (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  market TEXT,
  industry TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### PASS · Batch 2 · Stock table count is readable

Command: `sqlite3 data/market-core.db select count(*) from stock;`
Exit status: 0

```text
3136
```

### PASS · Batch 2 · DB stock search helper exists

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/packages/db/src/repository.ts`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/packages/db/src/repository.ts
```

### PASS · Batch 2 · DB stock get helper exists

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/packages/db/src/repository.ts`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/packages/db/src/repository.ts
```

### PASS · Batch 2 · Agent stock search command is wired

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent/src/db-cli.ts`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent/src/db-cli.ts
```

### PASS · Batch 2 · Root stock scripts are exposed

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/package.json`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/package.json
```

### PASS · Batch 3 · CSV importer supports compact sample rows

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/packages/sources/src/importers.ts`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/packages/sources/src/importers.ts
```

### FAIL · Batch 3 · Sample CSV review data import

Command: `pnpm agent:import:csv data/sample-limit-up.csv 2026-06-27`
Exit status: 1
Missing expected output: csv data imported: data/sample-limit-up.csv -> 2026-06-27

```text
> chan-shuo@0.1.0 agent:import:csv /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent import:csv "data/sample-limit-up.csv" "2026-06-27"


> @chan-shuo/agent@0.1.0 import:csv /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/db-cli.ts import:csv "data/sample-limit-up.csv" "2026-06-27"

/Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @chan-shuo/agent@0.1.0 import:csv: `tsx src/db-cli.ts import:csv "data/sample-limit-up.csv" "2026-06-27"`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.

node:fs:589
  handleErrorFromBinding(ctx);
  ^

Error: ENOENT: no such file or directory, open 'data/sample-limit-up.csv'
    at Object.openSync (node:fs:589:3)
    at readFileSync (node:fs:457:35)
    at loadCsvPayload (/Users/kandysmith/dev/chatgpt/chan-shuo/packages/sources/src/importers.ts:16:15)
    at importCsv (/Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent/src/db-cli.ts:54:17)
    at <anonymous> (/Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent/src/db-cli.ts:192:36)
    at ModuleJob.run (node:internal/modules/esm/module_job:193:25) {
  errno: -2,
  syscall: 'open',
  code: 'ENOENT',
  path: 'data/sample-limit-up.csv'
}

Node.js v19.9.0
```

### FAIL · Batch 3 · Sample CSV theme rows imported

Command: `sqlite3 data/market-core.db select count(*) from theme_daily_rank where trade_date = '2026-06-27';`
Exit status: 0
Missing expected output: regex:^2$

```text
0
```

### FAIL · Batch 3 · Sample CSV limit-up rows imported

Command: `sqlite3 data/market-core.db select count(*) from limit_up_daily where trade_date = '2026-06-27';`
Exit status: 0
Missing expected output: regex:^2$

```text
0
```

### FAIL · Batch 3 · Sample CSV news rows imported

Command: `sqlite3 data/market-core.db select count(*) from news_flash where news_time like '2026-06-27%';`
Exit status: 0
Missing expected output: regex:^1$

```text
0
```

### PASS · Batch 3 · Mock market data import

Command: `pnpm agent:mock 2026-06-28`
Exit status: 0

```text
> chan-shuo@0.1.0 agent:mock /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent mock "2026-06-28"


> @chan-shuo/agent@0.1.0 mock /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/db-cli.ts mock "2026-06-28"

mock data saved: 2026-06-28
```

### PASS · Batch 3 · Mock news import is idempotent

Command: `sqlite3 data/market-core.db select count(*) from news_flash where news_time like '2026-06-28%';`
Exit status: 0

```text
1
```

### PASS · Batch 6 · Data quality evaluator

Command: `pnpm quality 2026-06-28`
Exit status: 0

```text
> chan-shuo@0.1.0 quality /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent quality "2026-06-28"


> @chan-shuo/agent@0.1.0 quality /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/quality-cli.ts "2026-06-28"

{
  tradeDate: '2026-06-28',
  level: 'good',
  score: 100,
  checks: [
    {
      key: 'market_mood',
      label: '市场情绪',
      ok: true,
      count: 1,
      message: '已读取市场情绪'
    },
    {
      key: 'limit_up_daily',
      label: '涨停池',
      ok: true,
      count: 2,
      message: '已读取 2 条涨停数据'
    },
    {
      key: 'theme_daily_rank',
      label: '题材排行',
      ok: true,
      count: 2,
      message: '已读取 2 条题材数据'
    },
    {
      key: 'news_flash',
      label: '新闻快讯',
      ok: true,
      count: 1,
      message: '已读取 1 条新闻数据'
    }
  ],
  summary: '数据较完整，可以生成复盘。'
}
```

### PASS · Batch 6 · Alert rules

Command: `pnpm alerts 2026-06-28`
Exit status: 0

```text
> chan-shuo@0.1.0 alerts /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent alerts "2026-06-28"


> @chan-shuo/agent@0.1.0 alerts /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/db-cli.ts alerts "2026-06-28"

[
  {
    "level": "watch",
    "title": "市场温度偏强",
    "message": "市场温度 72，短线情绪处于活跃区。",
    "targetType": "market",
    "targetId": "2026-06-28",
    "createdAt": "2026-07-01T05:09:30.893Z"
  },
  {
    "level": "risk",
    "title": "炸板数量偏高",
    "message": "炸板数量 21，盘面分歧较大。",
    "targetType": "market",
    "targetId": "2026-06-28",
    "createdAt": "2026-07-01T05:09:30.893Z"
  },
  {
    "level": "watch",
    "title": "连板高度打开",
    "message": "最高连板达到 5 板，关注高标晋级与负反馈。",
    "targetType": "market",
    "targetId": "2026-06-28",
    "createdAt": "2026-07-01T05:09:30.893Z"
  },
  {
    "level": "watch",
    "title": "题材涨停扩散",
    "message": "机器人 涨停数达到 14，关注是否形成主线。",
    "targetType": "theme",
    "targetId": "机器人",
    "createdAt": "2026-07-01T05:09:30.893Z"
  },
  {
    "level": "info",
    "title": "题材热度居前",
    "message": "机器人 位居前排，龙头为 样例机器人。",
    "targetType": "theme",
    "targetId": "机器人",
    "createdAt": "2026-07-01T05:09:30.893Z"
  },
  {
    "level": "watch",
    "title": "重要消息催化",
    "message": "工信部发布机器人产业相关政策；关联题材：机器人、人形机器人",
    "targetType": "news",
    "targetId": "工信部发布机器人产业相关政策",
    "createdAt": "2026-07-01T05:09:30.893Z"
  }
]
```

### PASS · Batch 4 · AI daily review with configured provider

Command: `pnpm ai:review 2026-06-28`
Exit status: 0

```text
> chan-shuo@0.1.0 ai:review /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent review "2026-06-28"


> @chan-shuo/agent@0.1.0 review /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/db-cli.ts ai:review "2026-06-28"

【Mock AI 复盘】
今日市场情绪偏修复，涨停数量与题材扩散显示短线资金活跃。
机器人为当前主线候选，PCB/AI硬件作为扩散方向。
明日重点观察：龙头晋级、昨日涨停溢价、炸板率是否继续下降。

输入摘要：
你是A股消息派复盘员。请基于以下结构化数据生成复盘，不要编造数据，不要给确定性买卖建议。

{
  "tradeDate": "2026-06-28",
  "marketMood": {
    "tradeDate": "2026-06-28",
    "limitUpCount": 78,
    "limitDownCount": 5,
    "brokenLimitCount": 21,
    "maxBoardHeight": 5,
    "sealRate": 78.8,
    "promotionRate1To2": 18.2,
    "promotionRate2To3": 11.6,
    "yesterdayLimitAvgReturn": 2.1,
    "moodScore": 72,
    "source": "mock"
  },
  "to
```

### PASS · Batch 4 · Markdown report export

Command: `pnpm report:md 2026-06-28 /Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md`
Exit status: 0

```text
> chan-shuo@0.1.0 report:md /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent report:md "2026-06-28" "/Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md"


> @chan-shuo/agent@0.1.0 report:md /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/db-cli.ts report:md "2026-06-28" "/Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md"

markdown report exported: /Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md
```

### PASS · Batch 4 · Markdown report file exists

Command: file exists: `/Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md`
Exit status: 0

```text
file exists: /Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md
```

### PASS · Batch 4 · Markdown report contains data quality section

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md
```

### PASS · Report Center · Generated report is available for preview

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/reports/batch-review-2026-06-28-2026-07-01T05-09-28-110Z.md
```

### PASS · Report Center · Tauri report preview command exists

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src-tauri/src/main.rs`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src-tauri/src/main.rs
```

### PASS · Report Center · Tauri report preview command is registered

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src-tauri/src/main.rs`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src-tauri/src/main.rs
```

### PASS · Report Center · Desktop report preview service exists

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src/app/report-center.service.ts`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src/app/report-center.service.ts
```

### PASS · Report Center · Desktop report preview UI exists

Command: file contains: `/Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src/app/app.component.html`
Exit status: 0

```text
found text in file: /Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/src/app/app.component.html
```

### PASS · Batch 5 · Queue add workflow

Command: `pnpm queue:add 2026-06-28 review,plan,report`
Exit status: 0

```text
> chan-shuo@0.1.0 queue:add /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent queue:add "2026-06-28" "review,plan,report"


> @chan-shuo/agent@0.1.0 queue:add /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/db-cli.ts queue:add "2026-06-28" "review,plan,report"

{
  "queued": [
    52,
    53,
    54
  ]
}
```

### PASS · Batch 5 · Queue list

Command: `pnpm queue:list`
Exit status: 0

```text
> chan-shuo@0.1.0 queue:list /Users/kandysmith/dev/chatgpt/chan-shuo
> pnpm --filter @chan-shuo/agent queue:list


> @chan-shuo/agent@0.1.0 queue:list /Users/kandysmith/dev/chatgpt/chan-shuo/apps/agent
> tsx src/db-cli.ts queue:list

[
  {
    "id": 54,
    "tradeDate": "2026-06-28",
    "task": "report",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 05:09:32",
    "updatedAt": "2026-07-01 05:09:32"
  },
  {
    "id": 53,
    "tradeDate": "2026-06-28",
    "task": "plan",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 05:09:32",
    "updatedAt": "2026-07-01 05:09:32"
  },
  {
    "id": 52,
    "tradeDate": "2026-06-28",
    "task": "review",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 05:09:32",
    "updatedAt": "2026-07-01 05:09:32"
  },
  {
    "id": 51,
    "tradeDate": "2026-06-28",
    "task": "report",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 04:57:14",
    "updatedAt": "2026-07-01 04:57:14"
  },
  {
    "id": 50,
    "tradeDate": "2026-06-28",
    "task": "plan",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 04:57:14",
    "updatedAt": "2026-07-01 04:57:14"
  },
  {
    "id": 49,
    "tradeDate": "2026-06-28",
    "task": "review",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 04:57:14",
    "updatedAt": "2026-07-01 04:57:14"
  },
  {
    "id": 48,
    "tradeDate": "2026-06-28",
    "task": "report",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 03:12:28",
    "updatedAt": "2026-07-01 03:12:28"
  },
  {
    "id": 47,
    "tradeDate": "2026-06-28",
    "task": "plan",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 03:12:28",
    "updatedAt": "2026-07-01 03:12:28"
  },
  {
    "id": 46,
    "tradeDate": "2026-06-28",
    "task": "review",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 03:12:28",
    "updatedAt": "2026-07-01 03:12:28"
  },
  {
    "id": 45,
    "tradeDate": "2026-06-28",
    "task": "report",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 03:06:42",
    "updatedAt": "2026-07-01 03:06:42"
  },
  {
    "id": 44,
    "tradeDate": "2026-06-28",
    "task": "plan",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 03:06:42",
    "updatedAt": "2026-07-01 03:06:42"
  },
  {
    "id": 43,
    "tradeDate": "2026-06-28",
    "task": "review",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 03:06:42",
    "updatedAt": "2026-07-01 03:06:42"
  },
  {
    "id": 42,
    "tradeDate": "2026-06-28",
    "task": "report",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 02:14:13",
    "updatedAt": "2026-07-01 02:14:13"
  },
  {
    "id": 41,
    "tradeDate": "2026-06-28",
    "task": "plan",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 02:14:13",
    "updatedAt": "2026-07-01 02:14:13"
  },
  {
    "id": 40,
    "tradeDate": "2026-06-28",
    "task": "review",
    "status": "queued",
    "retryCount": 0,
    "maxRetries": 1,
    "lastError": null,
    "createdAt": "2026-07-01 02:14:13",
    "updatedAt": "2026-07-01 02:14:13"
  },
  {
    "id": 39,
    "tradeDate": "2026-06-28",
    "task": "report",
    "status": "queued",
    "retryCount": 0
... truncated ...
```

### PASS · All · Typecheck workspace

Command: `pnpm -r typecheck`
Exit status: 0

```text
Scope: 6 of 7 workspace projects
apps/desktop typecheck$ NG_CLI_ANALYTICS=false ng build
packages/core typecheck$ tsc --noEmit -p tsconfig.json
apps/desktop typecheck: Node.js version v19.9.0 detected.
apps/desktop typecheck: Odd numbered Node.js versions will not enter LTS status and should not be used for production. For more information, please see https://nodejs.org/en/about/previous-releases/.
apps/desktop typecheck: ❯ Building...
packages/core typecheck: Done
apps/desktop typecheck: ✔ Building...
apps/desktop typecheck: Initial chunk files | Names         |  Raw size | Estimated transfer size
apps/desktop typecheck: main.js             | main          | 171.05 kB |                46.61 kB
apps/desktop typecheck: polyfills.js        | polyfills     |  34.52 kB |                11.28 kB
apps/desktop typecheck: styles.css          | styles        |  79 bytes |                79 bytes
apps/desktop typecheck:                     | Initial total | 205.65 kB |                57.97 kB
apps/desktop typecheck: Application bundle generation complete. [1.673 seconds]
apps/desktop typecheck: Output location: /Users/kandysmith/dev/chatgpt/chan-shuo/apps/desktop/dist/desktop
apps/desktop typecheck: Done
packages/db typecheck$ tsc --noEmit -p tsconfig.json
packages/llm typecheck$ tsc --noEmit -p tsconfig.json
packages/sources typecheck$ tsc --noEmit -p tsconfig.json
packages/llm typecheck: Done
packages/db typecheck: Done
packages/sources typecheck: Done
apps/agent typecheck$ tsc --noEmit -p tsconfig.json
apps/agent typecheck: Done
```

> This report is generated locally and should not be committed when it contains runtime output.