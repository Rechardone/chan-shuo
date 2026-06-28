# Codex 总提示词

你现在在开发 `chan-shuo`，这是一个 A股消息派 AI 复盘系统。

## 产品目标

做一个 Mac 桌面软件，支持：

- 涨停池
- 炸板池
- 连板梯队
- 题材排行榜
- 市场情绪
- 消息流
- 本地或线上大模型 AI 复盘
- 明日观察计划

## 技术约束

- 使用 pnpm workspace。
- Node.js 兼容 19.9.0。
- TypeScript strict。
- 数据库使用 SQLite，优先 `better-sqlite3`。
- 桌面端使用 Angular 18 + Tauri。
- 本地模型通过 Ollama 接入。
- 第一阶段只做 Mock / JSON / CSV 导入，不接交易接口。

## 开发原则

1. 先跑通最小闭环，再做真实数据源。
2. 所有 AI 输出都必须可追溯、可保存。
3. 不输出确定性买卖指令。
4. 数据源适配必须模块化，便于替换。
5. 每个 batch 做完后更新 README 或 docs。
