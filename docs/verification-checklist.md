# Verification Checklist

## 环境

- Node.js 19.9.0 或 Node.js 20。
- pnpm 9.12.3。
- macOS 桌面端需要 Rust 与 Tauri 依赖。

## 基础验证

```bash
pnpm install
pnpm typecheck
```

## 数据闭环验证

```bash
pnpm db:init
pnpm agent:mock 2026-06-28
pnpm ai:review 2026-06-28
pnpm alerts 2026-06-28
pnpm report:md 2026-06-28 reports/verify.md
```

也可以一键执行：

```bash
pnpm verify
```

## JSON/CSV 导入验证

```bash
pnpm agent:import:json data/sample-day.json
pnpm agent:import:csv data/sample-limit-up.csv 2026-06-28
```

## Ollama 验证

```bash
ollama serve
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm llm:test
USE_OLLAMA=1 OLLAMA_MODEL=gemma3:4b pnpm ai:review 2026-06-28
```

## 桌面端验证

浏览器开发模式：

```bash
pnpm desktop:dev
```

Tauri 运行模式需要进入 `apps/desktop` 后使用 Tauri CLI。当前仓库已包含 Tauri 配置与 Rust 入口，但还需要本地安装 Tauri CLI 后验证。

## 常见问题

### better-sqlite3 安装失败

先确认 Node 版本、Python、Xcode Command Line Tools 是否可用。macOS 可执行：

```bash
xcode-select --install
```

### Angular 构建失败

先只验证后端闭环：

```bash
pnpm db:init
pnpm agent:mock 2026-06-28
pnpm ai:review 2026-06-28
```

再单独进入 `apps/desktop` 排查 Angular/Tauri 依赖。

### Tauri 读取不到数据库

当前默认路径是：

```text
data/market-core.db
```

先在仓库根目录执行：

```bash
pnpm db:init
pnpm agent:mock 2026-06-28
```
