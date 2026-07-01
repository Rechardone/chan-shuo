# Batch 23 · 本地 latest 报告指针修复

## 本批目标

读取 `test-reports` 分支后发现：

- `latest-local-test.log` 显示 `passed=24 failed=4`。
- 但 `latest-batch-test.md` 却是旧报告，显示 `Passed: 11 / Failed: 1`。

这说明本地发布链路成功了，但 `scripts/local-test-report.mjs` 复制 latest 报告时选错了文件。

## 根因

旧脚本通过文件名排序查找：

```js
findLatestReport(/^batch-test-.*\.md$/)
```

但目录里同时存在：

```text
reports/batch-test-2026-06-28.md
reports/batch-test-2026-06-28-2026-07-01T03-06-37-730Z.md
reports/latest-batch-test.md
```

按文件名排序不等于按运行时间排序，因此可能把旧报告复制成 `latest-batch-test.md`。

## 已修复

更新：

```text
scripts/local-test-report.mjs
```

新的逻辑：

- 不再扫描文件名排序。
- 解析 `pnpm test:batches` 输出中的：

```text
batch test report: ...
review report: ...
latest batch test: ...
latest batch review: ...
```

- 优先信任 `batch-test.mjs` 自己生成的 latest 指针。
- `latest-local-summary.md` 同时记录真实 timestamp 报告和 latest 指针。

## 本批 commit

- `fix(test): keep batch latest pointers fresh`

## 需要重新验证

请本地重新执行：

```bash
cd /Users/kandysmith/dev/chatgpt/chan-shuo
git switch codex/batch-01-bootstrap
git pull
pnpm local:test-report
pnpm report:publish
```

然后告诉我：

```text
已经重新 publish 了
```

我会重新读取：

```text
test-reports:latest/latest-batch-test.md
test-reports:latest/latest-local-test.log
```

这次应该能看到真实的 4 个失败项。
