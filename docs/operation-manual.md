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

## 8. 预警与报告导出

查看当日预警信号：

```bash
pnpm alerts 2026-06-28
```

导出 Markdown 复盘报告：

```bash
pnpm report:md 2026-06-28
```

指定导出路径：

```bash
pnpm report:md 2026-06-28 reports/2026-06-28-review.md
```

当前预警规则包括：

```text
市场温度偏强
炸板数量偏高
连板高度打开
题材涨停扩散
题材热度居前
重要消息催化
```

## 9. 接入本地 Ollama

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

## 10. 启动桌面端

```bash
pnpm desktop:dev
```

当前桌面端会优先尝试通过 Tauri command 读取本地 SQLite。普通浏览器开发模式下，如果 Tauri API 不可用，会自动回退到 mock view model。

## 11. 类型检查

```bash
pnpm typecheck
```

## 12. 推荐开发顺序

1. 先跑通 `pnpm install`。
2. 执行 `pnpm db:init`。
3. 执行 `pnpm agent:mock 2026-06-28`。
4. 执行 `pnpm ai:review 2026-06-28`。
5. 执行 `pnpm alerts 2026-06-28`。
6. 执行 `pnpm report:md 2026-06-28`。
7. 执行 `pnpm desktop:dev`。
8. 再测试 JSON/CSV 导入。
9. 最后接 Ollama。

## 13. 合规边界

本项目只做个人研究、复盘、合法数据导入和 AI 辅助分析。不要实现破解接口、绕过登录、盗用 token、高频抓取、自动交易下单或商业化分发受限数据。
