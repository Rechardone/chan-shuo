# 测试工作流

本项目现在支持三条测试路径：

1. GitHub Actions 自动跑通用 batch-test。
2. 本地 Mac 一键生成 latest 测试报告。
3. 本地测试报告发布到独立 `test-reports` 分支，方便 ChatGPT 读取。

## 1. GitHub Actions 自动测试

当代码推送到 `codex/batch-01-bootstrap` 时，会自动触发：

```text
.github/workflows/batch-test.yml
```

自动执行：

```bash
pnpm install --frozen-lockfile
pnpm test:batches
```

并上传 artifact：

```text
chan-shuo-batch-reports
```

artifact 中包含：

```text
reports/*.md
reports/*.log
```

### 能覆盖的内容

- DB schema 初始化。
- Agent CLI。
- mock 数据导入。
- sample CSV 导入。
- 数据质量检查。
- 风控告警。
- AI mock/provider 复盘。
- Markdown 报告生成。
- 报告中心静态链路。
- workspace typecheck。

### 不能完全覆盖的内容

GitHub Actions 是 Linux 环境，不是你的 Mac 本地环境，所以不能完整覆盖：

- 同花顺 Mac 本地缓存路径。
- 你的真实 `32_0_base.ini` 文件。
- macOS 权限弹窗。
- Tauri 桌面端真实窗口体验。

这些仍然需要用本地一键脚本验证。

## 2. 本地一键测试

在 Mac 本地执行：

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git pull
pnpm local:test-report
```

也可以指定交易日：

```bash
pnpm local:test-report 2026-06-28
```

脚本会自动执行：

```bash
pnpm test:batches <tradeDate>
```

并生成：

```text
reports/latest-local-test.log
reports/latest-local-summary.md
reports/latest-batch-test.md
reports/latest-batch-review.md
```

以后排错时，只需要看这几个 latest 文件，不用手动找最新时间戳文件。

## 3. 发布本地报告到独立分支

本地测试跑完后，执行：

```bash
pnpm report:publish
```

默认会把 latest 报告发布到：

```text
test-reports
```

这个分支只放报告，不放业务代码。

报告路径固定为：

```text
latest/manifest.json
latest/latest-local-test.log
latest/latest-local-summary.md
latest/latest-batch-test.md
latest/latest-batch-review.md
```

历史报告会保存到：

```text
runs/run-<timestamp>/
```

完整说明见：

```text
docs/report-branch-workflow.md
```

## 4. 推荐日常流程

### 我提交代码后

不用手动传 zip，先看 GitHub Actions 是否通过。

### 如果 GitHub Actions 通过，但你的 Mac 桌面端还有问题

本地运行：

```bash
pnpm local:test-report
pnpm report:publish
```

然后告诉我：

```text
我已经 pnpm report:publish 了，你读取 test-reports 最新报告继续修。
```

### 如果涉及同花顺本地文件

先确认本地路径可用，再运行：

```bash
pnpm agent:import:ths-stockname ~/Library/Containers/cn.com.10jqka.macstockPro/Data/Documents/stockname/32_0_base.ini
pnpm stock:search 平安
pnpm stock:search 300750
```

## 5. 注意事项

- `LLM_PROVIDER` 默认会在本地脚本里设成 `mock`，避免测试时意外调用云模型。
- GitHub Actions artifact 默认保留 14 天。
- `reports/latest-*.md` 和 `reports/*.log` 是运行产物，不应提交到开发分支。
- `test-reports` 是专用报告分支，不要 merge 回 `codex/batch-01-bootstrap`。
- 如果需要长期保留某次测试结论，请手动复制到 `docs/` 下作为正式文档。
