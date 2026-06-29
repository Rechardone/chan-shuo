# Batch 11 开发小结

分支：`codex/batch-01-bootstrap`

## 已完成

- 桌面端新增模型设置数据：`apps/desktop/src/app/model-settings.data.ts`。
- UI 新增“模型设置”面板。
- 支持在界面中选择：
  - MockLLM 开发调试
  - 本地 Gemma 3 4B
  - 本地 DeepSeek R1 7B
  - 本地 Qwen 2.5 7B
  - DeepSeek API
  - Qwen-compatible API
  - 自定义兼容接口
- 当前选择会显示对应环境变量预览。
- AI 复盘员面板会显示当前选择的模型名称。
- 新增模型设置样式，突出低成本和本地模型优先。

## 说明

本轮先做前端静态设置面板，不把 API Key 写入前端，也不保存密钥。后续如果要保存配置，需要通过 Tauri command 写入本地安全配置文件，不能提交到 Git。

## 下一步

Batch 12：AI 分析结果回看、Tauri 配置保存接口、生成复盘按钮真正触发 agent/command。
