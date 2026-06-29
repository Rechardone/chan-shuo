# Development Log

## 2026-06-28

- 建立开发分支 `codex/batch-01-bootstrap`。
- 补齐 monorepo 包配置。
- 增加静态桌面端占位页面。
- 增加 Prompt 模板和后续开发计划。
- 增加 sample trading day 数据。
- 完成 Batch 02：SQLite repository、mock 数据写入、AI 复盘保存闭环。
- 完成 Batch 03：Angular 18 桌面端骨架、看板 UI、Tauri v2 占位配置。
- 完成 Batch 04：OllamaProvider、AI 任务命令、Prompt 构建器、桌面端 view model。
- 完成 Batch 05：JSON/CSV 导入、桌面端数据服务层、操作手册。
- 完成 Batch 06：预警规则、Markdown 报告导出、Tauri SQLite dashboard command。
- 完成 Batch 07：CI、verify 脚本、验证清单、PR 准备文档。
- 完成 Batch 08：完整 Tauri dashboard 数据读取、桌面端完整 payload 映射。
- 完成 Batch 09：OpenAI-compatible Provider、云端模型文档、报告拼接最新 AI 输出。
- 完成 Batch 10：按用户纠正改为多模型低成本策略，优先 Gemma / DeepSeek / Qwen。
- 完成 Batch 11：桌面端模型设置面板，支持 Gemma / DeepSeek / Qwen / 自定义兼容接口选择。
- 完成 Batch 12：AI 分析结果回看、Tauri 模型配置保存接口、配置不保存 API Key。
- 完成 Batch 13：生成复盘、明日计划、导出报告按钮触发本地 agent 命令，并显示任务状态。
- 完成 Batch 14：任务日志持久化、任务日志面板、运行时文件忽略、Keychain 安全方案。
- 完成 Batch 15：前端任务队列、串行执行、失败重试、队列面板。
- 完成 Batch 16：SQLite 持久任务队列 schema、repository、agent CLI 队列命令。
- 完成 Batch 17：桌面端队列 UI 切换到 SQLite 持久队列，Tauri 暴露入队/读取/执行下一条命令。

## 下一步

继续 Batch 18：Tauri 后台 worker 自动消费 SQLite 队列，或者先做取消/重试/清理队列操作。
