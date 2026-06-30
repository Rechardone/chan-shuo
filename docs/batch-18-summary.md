# Batch 18 · 报告中心预览链路

## 本批目标

继续开发报告中心主链路，不做页面选项卡/多页面重构，先补齐本地 Markdown 报告的读取、最近报告展示、内容预览、打开目录和重新生成入口。

## 已完成

- Tauri 新增 `read_report` 命令：
  - 只允许读取 `reports` 目录下的 `.md` 文件。
  - 使用文件名归一化，避免前端传入任意路径直接读取。
  - 返回报告名称、路径、大小、修改时间和 Markdown 内容。
- 桌面端 `ReportCenterService` 新增 `readReport(name)`。
- 桌面端报告中心 UI 增加：
  - 最近 Markdown 报告列表。
  - 点击报告后预览 Markdown 原文。
  - 刷新列表、打开 reports 目录、重新生成今日报告按钮。
  - 默认自动预览最近一份报告。
- `scripts/batch-test.mjs` 增加 Report Center 覆盖：
  - 生成的报告可被预览用例命中。
  - Tauri `read_report` 命令存在并已注册。
  - 桌面服务已调用 `read_report`。
  - 桌面 UI 已包含 `report-preview` 预览面板。

## 本批 commits

- `feat(tauri): add report preview command`
- `feat(desktop): add report preview service`
- `feat(desktop): wire report preview state`
- `feat(desktop): add report markdown preview UI`
- `feat(desktop): style report preview panel`
- `test(batch): cover report center preview`
- `test(batch): align report preview assertion`

## 测试方式

本批已补充 batch-test 覆盖。请在本地仓库执行：

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git pull
pnpm test:batches
```

脚本会生成唯一文件名的测试报告：

```text
reports/batch-test-<tradeDate>-<runId>.md
reports/batch-review-<tradeDate>-<runId>.md
```

## 备注

当前执行环境只能通过 GitHub connector 修改仓库，无法访问你的本地 `/Users/kandysmith/dev/chatgpt/chan-shuo` 工作区，也无法直接运行 `pnpm test:batches` 生成真实本地报告。因此本批已提交测试脚本覆盖，真实测试报告需要在你的本地环境运行脚本生成。
