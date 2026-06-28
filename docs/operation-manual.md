# chan-shuo 操作手册

## 1. 拉取开发分支

```bash
git clone https://github.com/lpearf-pixel/chan-shuo.git
cd chan-shuo
git checkout codex/batch-01-bootstrap
```

## 2. 安装依赖

```bash
pnpm install
```

建议 Node.js 使用 19.9.0 或更高兼容版本。

## 3. 初始化数据库

```bash
pnpm db:init
```

默认数据库路径：

```text
data/market-core.db
```

自定义数据库路径：

```bash
CHAN_SHUO_DB=/your/path/market-core.db pnpm db:init
```

## 4. 导入 Mock 数据

```bash
pnpm agent:mock 2026-06-28
```

## 5. 导入 JSON 数据

JSON 文件格式参考：

```text
data/sample-day.json
```

导入命令：

```bash
pnpm agent:import:json data/sample-day.json
```

JSON 顶层字段：

```text
tradeDate
marketMood
topThemes
limitUps
news
```

## 6. 导入 CSV 数据

CSV 文件格式参考：

```text
data/sample-limit-up.csv
```

导入命令：

```bash
pnpm agent:import:csv data/sample-limit-up.csv 2026-06-28
```

CSV 支持三类记录：

```text
type=limit_up  涨停股
type=theme     题材排行
type=news      消息流
```

常用字段：

```text
type,code,name,theme,themes,firstLimitTime,lastLimitTime,breakCount,boardCount,reason,amount,floatMarketCap,source
```

## 7. 生成 AI 复盘

先确保数据库里有当天数据：

```bash
pnpm agent:mock 2026-06-28
```

生成每日复盘：

```bash
pnpm ai:review 2026-06-28
```

生成明日观察计划：

```bash
pnpm ai:plan 2026-06-28
```

消息分类：

```bash
pnpm ai:news 2026-06-28
```

题材分析：

```bash
pnpm ai:theme 2026-06-28
```

## 8. 接入本地 Ollama

先确认 Ollama 已启动：

```bash
ollama serve
```

测试模型：

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm llm:test
```

使用本地模型生成复盘：

```bash
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
```

可选环境变量：

```text
USE_OLLAMA=1
OLLAMA_MODEL=gemma3:4b
OLLAMA_BASE_URL=http://127.0.0.1:11434
CHAN_SHUO_DB=data/market-core.db
```

## 9. 启动桌面端

```bash
pnpm desktop:dev
```

当前桌面端仍使用 mock view model。后续版本会通过 Tauri command 读取 SQLite。

## 10. 类型检查

```bash
pnpm typecheck
```

## 11. 推荐开发顺序

1. 先跑通 `pnpm install`。
2. 执行 `pnpm db:init`。
3. 执行 `pnpm agent:mock 2026-06-28`。
4. 执行 `pnpm ai:review 2026-06-28`。
5. 执行 `pnpm desktop:dev`。
6. 再测试 JSON/CSV 导入。
7. 最后接 Ollama。

## 12. 合规边界

本项目只做个人研究、复盘、合法数据导入和 AI 辅助分析。不要实现破解接口、绕过登录、盗用 token、高频抓取、自动交易下单或商业化分发受限数据。
