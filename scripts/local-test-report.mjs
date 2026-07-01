import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, resolve } from 'node:path';

const workspaceRoot = process.cwd();
const tradeDate = process.argv[2] ?? '2026-06-28';
const reportsDir = resolve(workspaceRoot, 'reports');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = resolve(reportsDir, `local-test-${tradeDate}-${runId}.log`);
const latestLogPath = resolve(reportsDir, 'latest-local-test.log');
const latestSummaryPath = resolve(reportsDir, 'latest-local-summary.md');

mkdirSync(reportsDir, { recursive: true });

const command = ['pnpm', ['test:batches', tradeDate]];
const startedAt = new Date().toISOString();
const result = spawnSync(command[0], command[1], {
  cwd: workspaceRoot,
  encoding: 'utf8',
  env: {
    ...process.env,
    NG_CLI_ANALYTICS: 'false',
    CHAN_SHUO_ROOT: workspaceRoot,
    LLM_PROVIDER: process.env.LLM_PROVIDER ?? 'mock'
  }
});

const stdout = result.stdout ?? '';
const stderr = result.stderr ?? '';
const combined = `${stdout}\n${stderr}`.trim();
writeFileSync(logPath, combined, 'utf8');
writeFileSync(latestLogPath, combined, 'utf8');

const latestBatchTest = findLatestReport(/^batch-test-.*\.md$/);
const latestBatchReview = findLatestReport(/^batch-review-.*\.md$/);
if (latestBatchTest) copyFileSync(latestBatchTest, resolve(reportsDir, 'latest-batch-test.md'));
if (latestBatchReview) copyFileSync(latestBatchReview, resolve(reportsDir, 'latest-batch-review.md'));

const lines = [
  '# Chan Shuo Local Test Summary',
  '',
  `- Trade date: ${tradeDate}`,
  `- Started at: ${startedAt}`,
  `- Finished at: ${new Date().toISOString()}`,
  `- Exit status: ${result.status ?? 'unknown'}`,
  `- Log: ${relative(logPath)}`,
  `- Latest log: ${relative(latestLogPath)}`,
  `- Latest batch test: ${latestBatchTest ? relative(latestBatchTest) : 'not found'}`,
  `- Latest batch review: ${latestBatchReview ? relative(latestBatchReview) : 'not found'}`,
  '',
  '## Next step',
  '',
  result.status === 0
    ? '本地 batch-test 已通过。'
    : '本地 batch-test 未通过，请查看 `reports/latest-local-test.log` 和 `reports/latest-batch-test.md`。'
];
writeFileSync(latestSummaryPath, lines.join('\n'), 'utf8');

console.log(`local test log: ${logPath}`);
console.log(`latest log: ${latestLogPath}`);
console.log(`latest summary: ${latestSummaryPath}`);
if (latestBatchTest) console.log(`latest batch test: ${latestBatchTest}`);
if (latestBatchReview) console.log(`latest batch review: ${latestBatchReview}`);
process.exit(result.status ?? 1);

function findLatestReport(pattern) {
  if (!existsSync(reportsDir)) return undefined;
  const files = readdirSync(reportsDir)
    .filter((name) => pattern.test(name))
    .map((name) => resolve(reportsDir, name))
    .sort((a, b) => basename(b).localeCompare(basename(a)));
  return files[0];
}

function relative(path) {
  return path.replace(`${workspaceRoot}/`, '');
}
