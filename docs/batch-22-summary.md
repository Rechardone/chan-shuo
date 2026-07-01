# Batch 22 · 测试报告分支发布链路

## 本批目标

把本地测试报告自动发布到独立分支，避免手动传 zip/log，也避免报告文件污染开发分支。

## 已完成

### 1. 新增报告发布脚本

新增：

```text
scripts/publish-test-report.mjs
```

根命令：

```bash
pnpm report:publish
```

默认发布到：

```text
test-reports
```

也可以指定：

```bash
pnpm report:publish test-reports
```

或：

```bash
CHAN_SHUO_REPORT_BRANCH=test-reports pnpm report:publish
```

### 2. 报告分支目录结构

```text
README.md
latest/
  latest-local-test.log
  latest-local-summary.md
  latest-batch-test.md
  latest-batch-review.md
  manifest.json
runs/
  run-<timestamp>/
    latest-local-test.log
    latest-local-summary.md
    latest-batch-test.md
    latest-batch-review.md
    manifest.json
```

### 3. 脚本暴露

更新：

```text
package.json
```

新增：

```json
"report:publish": "node scripts/publish-test-report.mjs"
```

### 4. 文档

新增：

```text
docs/report-branch-workflow.md
```

更新：

```text
docs/test-workflow.md
```

## 后续固定操作

你本地只需要：

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git switch codex/batch-01-bootstrap
git pull
pnpm local:test-report
pnpm report:publish
```

然后告诉我：

```text
我已经 pnpm report:publish 了，你读取 test-reports 最新报告继续修。
```

我会读取：

```text
test-reports:latest/manifest.json
test-reports:latest/latest-local-summary.md
test-reports:latest/latest-batch-test.md
test-reports:latest/latest-local-test.log
```

然后继续在开发分支：

```text
codex/batch-01-bootstrap
```

上开发和提交。

## 不会冲突的原因

- 开发分支只放代码、脚本、schema、文档。
- `test-reports` 分支只放测试报告。
- 两个分支不互相 merge。
- 报告文件不会进入开发分支。

## 本批 commits

- `test(report): add report branch publisher`
- `test(scripts): expose report publisher`
- `docs: add report branch workflow`
- `docs(test): link report branch workflow`
