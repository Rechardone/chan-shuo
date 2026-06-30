# Chan Shuo 开发计划

更新日期：2026-06-30  
当前阶段：桌面端已能启动，SQLite/Agent/Tauri 基础链路已打通，但产品功能仍处于 MVP 初期。

## 当前已完成

- Monorepo 基础结构：`packages/core`、`packages/db`、`packages/sources`、`packages/llm`、`apps/agent`、`apps/desktop`。
- SQLite 基础库：市场情绪、涨停、题材、新闻、AI 分析、任务队列、股票基础库。
- Agent CLI：mock 数据、JSON/CSV 导入、AI 复盘、明日计划、消息分类、题材分析、告警、Markdown 报告、任务队列。
- 多模型策略：MockLLM、本地 Ollama、OpenAI-compatible 云模型配置。
- 桌面端：Angular 18 + Tauri 2 基础界面，已能读取 SQLite、执行 Agent 任务、显示任务日志和模型设置。
- Mac 同花顺股票基础库：可解析 `32_0_base.ini`，并导入真实股票基础库。
- 稳定性修复：Tauri dev 脚本、Angular analytics 非交互启动、Rust stable 工具链、Tauri icon、DB 路径统一。

## 近期目标

短期目标不是先做漂亮页面，而是把“真实数据 → SQLite → AI 复盘 → 桌面可操作”这条链路跑稳。

### Batch 1：本地运行与 Git 冲突治理

目标：让本地启动、初始化、导入数据时不会污染 Git，也不会产生线上/本地冲突。

待做：

1. `.gitignore` 补齐运行产物：
   - `data/*.db`
   - `data/*.db-wal`
   - `data/*.db-shm`
   - `data/task-log.json`
   - `data/model-config.json`
   - `apps/desktop/src-tauri/target/`
   - `apps/desktop/src-tauri/icons/`
   - `reports/*.md`
2. 增加 `data/.gitkeep`，只保留目录，不提交本地数据库。
3. 增加本地环境模板：`.env.example`。
4. 增加 `docs/local-dev.md`：说明启动、停止、清理端口、备份 SQLite、处理 stash。
5. 固化 DB 路径：默认统一为项目根目录 `data/market-core.db`。
6. 确认 `pnpm db:init`、`pnpm agent:import:ths-stockname`、`pnpm desktop:dev` 不产生必须提交的运行文件。

验收标准：

- `git status --short` 不再出现大量运行产物。
- 本地初始化 DB 后不会和远端代码发生冲突。
- 新机器按文档能启动桌面端。

### Batch 2：股票基础库功能完善

目标：把同花顺股票基础库从“数量显示”变成可用功能。

待做：

1. Agent CLI 增加股票查询命令：
   - 按代码查询
   - 按名称模糊查询
   - 按市场筛选：沪/深/北
2. DB repository 增加：
   - `searchStocks()`
   - `listStocks()`
   - `getStockByCode()`
3. Tauri 增加股票查询命令。
4. 桌面端增加“股票基础库”面板：
   - 搜索框
   - 只在输入关键词后显示搜索结果
   - code / name / market / industry
   - 当前总数
5. 支持从桌面端重新导入股票基础库。

验收标准：

- 导入 `32_0_base.ini` 后，桌面端显示 `3136` 左右股票。
- 默认不展开全部股票，避免首页过长。
- 输入 `平安` 能搜到 `000001 平安银行`。
- 输入 `300750` 能搜到 `宁德时代`。

### Batch 3：真实行情/复盘数据源探索

目标：找到稳定、合规、可维护的数据来源，替换 mock 复盘数据。

候选路线：

1. Mac 同花顺本地缓存：
   - WebKit NetworkCache
   - LocalStorage / IndexedDB
   - 同花顺 cache manifest
2. 问财/同花顺页面接口线索：
   - 只在用户本地授权环境中读取
   - 保持低频率，不绕过认证，不做破坏性请求
3. CSV/JSON 半自动导入：
   - 先接受用户从同花顺/问财导出的数据
   - 保证数据结构稳定后再自动化
4. 其他可公开访问的数据源：
   - 涨停池
   - 炸板池
   - 题材排行
   - 新闻快讯

优先级：

1. 涨停池
2. 炸板池
3. 题材排行
4. 新闻快讯
5. 个股详情

验收标准：

- 能导入一个真实交易日的涨停/题材/新闻数据。
- 桌面端不再只显示 mock 数据。
- AI 复盘基于真实数据生成。

### Batch 4：AI 复盘工作流产品化

目标：把 CLI 能力变成桌面端可点击、可回看、可导出的完整流程。

待做：

1. 一键生成“每日复盘”：
   - 数据检查
   - AI 复盘
   - 明日计划
   - 风险提醒
   - Markdown 报告
2. 增加运行状态：
   - 当前任务
   - 进度
   - stdout/stderr
   - 成功/失败
3. 增加 AI 分析历史：
   - 按交易日筛选
   - 按任务类型筛选
   - 点击查看完整结果
4. 增加报告中心：
   - Markdown 预览
   - 打开 reports 目录
   - 重新生成报告

验收标准：

- 用户能在桌面端点击一次，生成当天复盘报告。
- 失败时能看到明确错误，而不是静默失败。

### Batch 5：任务队列与后台 worker

目标：任务队列不只是手动 run-once，而是可持续消费。

待做：

1. Tauri 后台 worker 自动消费 SQLite `task_queue`。
2. 支持暂停/继续。
3. 支持失败重试、取消、归档。
4. UI 增加队列管理：
   - queued
   - running
   - success
   - failed
   - cancelled
5. 接入已有 `queue_maintenance.rs`。

验收标准：

- 任务加入队列后可以自动执行。
- 失败任务可一键重试。
- 队列可取消等待任务、清理历史任务。

### Batch 6：数据质量与风控规则

目标：让复盘结果不只是总结，还能提供风险信号。

待做：

1. 数据完整性检查：
   - 今日是否有 market_mood
   - 是否有涨停数据
   - 是否有题材排行
   - 是否有新闻
2. 风控规则扩展：
   - 炸板率过高
   - 高位股断板
   - 题材退潮
   - 连板高度压缩
   - 新闻强但市场弱
3. AI prompt 加入风险结构化输入。
4. UI 增加风险卡片。

验收标准：

- 每日复盘前先给出数据质量评分。
- 风险规则结果可被 AI 引用。

### Batch 7：桌面端体验与打包

目标：从开发环境可用，走向普通用户可安装。

待做：

1. 打包 DMG。
2. 处理 macOS 权限：
   - 文件选择授权
   - 完整磁盘访问说明
   - 本地缓存路径配置
3. 增加 App 内诊断页：
   - Node/pnpm 可用性
   - Rust/Tauri 版本
   - DB 路径
   - 同花顺文件可访问性
   - 4200 端口状态

验收标准：

- 新机器安装后能按引导完成初始化。
- 不再依赖用户理解内部目录结构。

### Batch 8：页面体验与选项卡优化

目标：当前桌面端功能已经堆到一个长页面里，查看不友好。后续要把它拆成清晰的应用结构。

待做：

1. 增加左侧导航或顶部选项卡：
   - 总览
   - 数据源
   - 股票库
   - 复盘工作台
   - 报告中心
   - 任务队列
   - 模型设置
   - 诊断
2. 总览页只保留核心信息：
   - 市场情绪
   - 数据质量
   - 主线题材
   - AI 最新复盘摘要
3. 数据源页独立展示：
   - 同花顺股票库状态
   - CSV/JSON 导入
   - 真实行情源状态
4. 股票库页只做搜索，不默认展示全部股票。
5. 复盘工作台整合：
   - 一键复盘
   - 运行进度
   - stdout/stderr
   - 失败原因
6. 报告中心独立展示：
   - Markdown 报告列表
   - 预览
   - 打开目录
   - 重新生成
7. 任务队列页独立展示：
   - 队列统计
   - 执行下一条
   - 取消等待任务
   - 清理历史任务
8. 诊断页独立展示：
   - DB 路径
   - Node/pnpm 状态
   - Tauri 状态
   - 权限提示

验收标准：

- 首页不再是一个超长页面。
- 用户可以通过选项卡快速找到功能。
- 每个页面只显示当前场景最需要的信息。

## 本地/线上冲突处理原则

1. 代码、schema、脚本、文档进入 Git。
2. 本地数据库、日志、模型配置、报告、Tauri build 产物不进 Git。
3. 需要保留目录时用 `.gitkeep`，不要提交真实数据文件。
4. 每次启动前如果本地有大量修改，先执行：

```bash
git status --short
```

5. 如果修改多且不确定，先保护现场：

```bash
git switch -c local/wip-before-sync-$(date +%Y%m%d-%H%M%S)
git stash push -u -m "local runtime files before sync"
```

6. 同步远端后再决定是否恢复 stash：

```bash
git switch codex/batch-01-bootstrap
git pull
git stash list
git stash show --stat stash@{0}
```

## 推荐下一步执行顺序

1. 先做 Batch 1，彻底解决本地运行文件污染 Git 的问题。
2. 再做 Batch 2，让股票基础库在桌面端真正可用。
3. 然后做 Batch 3，接入真实涨停/题材/新闻数据。
4. 再强化 Batch 4/5/6，让 AI 复盘、任务队列、数据质量形成闭环。
5. 最后做 Batch 8，把长页面拆成选项卡/多页面结构。