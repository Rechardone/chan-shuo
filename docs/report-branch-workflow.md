# 测试报告分支工作流

## 目标

本地测试报告不再手动打包上传，也不污染开发分支。

固定流程：

```text
开发分支 codex/batch-01-bootstrap
        ↓
本地 pnpm local:test-report
        ↓
本地 pnpm report:publish
        ↓
报告进入独立分支 test-reports
        ↓
ChatGPT 从 test-reports 读取 latest 报告继续修代码
```

## 分支约定

### 开发分支

```text
codex/batch-01-bootstrap
```

只放代码、脚本、schema、文档。

### 报告分支

```text
test-reports
```

只放测试报告，不参与业务代码开发。

报告分支目录：

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

## 本地使用方式

在开发分支执行：

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git switch codex/batch-01-bootstrap
git pull
pnpm local:test-report
pnpm report:publish
```

如果要指定报告分支：

```bash
CHAN_SHUO_REPORT_BRANCH=test-reports pnpm report:publish
```

或者：

```bash
pnpm report:publish test-reports
```

## ChatGPT 读取方式

我会读取：

```text
test-reports:latest/manifest.json
test-reports:latest/latest-local-summary.md
test-reports:latest/latest-batch-test.md
test-reports:latest/latest-local-test.log
```

然后继续在：

```text
codex/batch-01-bootstrap
```

上修代码并提交。

## 不会冲突的原因

- `codex/batch-01-bootstrap` 只保存开发代码。
- `test-reports` 只保存运行报告。
- 两个分支的提交内容不同，不需要互相 merge。
- 报告文件不进入开发分支，因此不会和代码变更冲突。

## 如果 report:publish 报错

### 1. 提示没有 latest 文件

先跑：

```bash
pnpm local:test-report
```

### 2. 推送失败

确认本地有 GitHub 推送权限：

```bash
git remote -v
git push origin test-reports
```

### 3. worktree 已存在但状态异常

可以清理后重试：

```bash
git worktree remove .tmp/test-report-publish --force
pnpm report:publish
```

## 推荐以后对话里的说法

当你跑完后，只需要告诉我：

```text
我已经 pnpm report:publish 了，你读取 test-reports 最新报告继续修。
```
