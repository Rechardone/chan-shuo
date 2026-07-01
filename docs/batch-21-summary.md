# Batch 21 · 测试自动化与 latest 报告链路

## 本批目标

减少手动传日志/zip 的成本，让后续开发可以自动获得测试结果。

## 已完成

### 1. GitHub Actions 自动测试

新增：

```text
.github/workflows/batch-test.yml
```

触发条件：

- push 到 `codex/batch-01-bootstrap`
- pull request 到 `main`
- 手动 `workflow_dispatch`

执行内容：

```bash
pnpm install --frozen-lockfile
pnpm test:batches
```

并上传 artifact：

```text
chan-shuo-batch-reports
```

包含：

```text
reports/*.md
reports/*.log
```

### 2. 本地一键测试脚本

新增：

```text
scripts/local-test-report.mjs
```

根命令：

```bash
pnpm local:test-report
```

它会自动运行：

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

### 3. batch-test latest 指针

更新：

```text
scripts/batch-test.mjs
```

每次运行后自动刷新：

```text
reports/latest-batch-test.md
reports/latest-batch-review.md
```

这样以后不用查时间戳文件。

### 4. 测试工作流文档

新增：

```text
docs/test-workflow.md
```

说明：

- GitHub Actions 能测什么。
- 本地 Mac 需要测什么。
- 以后如何快速定位 latest 日志。

## 本批 commits

- `ci: add batch test workflow`
- `test(local): add one-command report runner`
- `test(scripts): expose local report runner`
- `test(batch): refresh latest report pointers`
- `docs: add automated test workflow guide`

## 以后流程

通用链路：

```text
我推代码 → GitHub Actions 自动跑 → 我看 workflow 日志和 artifact
```

Mac 本地链路：

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git pull
pnpm local:test-report
```

如果本地失败，只需要看：

```text
reports/latest-local-test.log
reports/latest-batch-test.md
reports/latest-batch-review.md
```

## 注意

当前执行环境仍不能直接跑 pnpm，但 GitHub Actions 启用后，会在 GitHub runner 上自动跑真实依赖安装和 batch-test。
