import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const workspaceRoot = process.cwd();
const tradeDate = process.argv[2] ?? '2026-06-28';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const defaultReportPath = `reports/batch-test-${tradeDate}-${runId}.md`;
const reportPath = process.argv[3] ?? defaultReportPath;
const reportAbsPath = resolve(workspaceRoot, reportPath);
const reviewReportPath = `reports/batch-review-${tradeDate}-${runId}.md`;
const reviewReportAbsPath = resolve(workspaceRoot, reviewReportPath);
const startedAt = new Date().toISOString();

const cases = [
  {
    batch: 'Batch 1',
    name: 'DB init and workspace paths',
    command: ['pnpm', ['db:init']],
    expect: ['database initialized']
  },
  {
    batch: 'Batch 2',
    name: 'Stock table schema exists',
    command: ['sqlite3', ['data/market-core.db', '.schema stock']],
    expect: ['CREATE TABLE', 'stock']
  },
  {
    batch: 'Batch 2',
    name: 'Stock table count is readable',
    command: ['sqlite3', ['data/market-core.db', 'select count(*) from stock;']],
    expectRegex: ['^[0-9]+']
  },
  {
    batch: 'Batch 3',
    name: 'Mock market data import',
    command: ['pnpm', ['agent:mock', tradeDate]],
    expect: [`mock data saved: ${tradeDate}`]
  },
  {
    batch: 'Batch 3',
    name: 'Mock news import is idempotent',
    command: ['sqlite3', ['data/market-core.db', `select count(*) from news_flash where news_time like '${tradeDate}%';`]],
    expectRegex: ['^1$']
  },
  {
    batch: 'Batch 6',
    name: 'Data quality evaluator',
    command: ['pnpm', ['quality', tradeDate]],
    expect: ['score', 'level', 'checks']
  },
  {
    batch: 'Batch 6',
    name: 'Alert rules',
    command: ['pnpm', ['alerts', tradeDate]],
    expect: ['level', 'title', 'message']
  },
  {
    batch: 'Batch 4',
    name: 'AI daily review with configured provider',
    command: ['pnpm', ['ai:review', tradeDate]],
    expect: ['复盘']
  },
  {
    batch: 'Batch 4',
    name: 'Markdown report export',
    command: ['pnpm', ['report:md', tradeDate, reviewReportAbsPath]],
    expect: ['markdown report exported']
  },
  {
    batch: 'Batch 4',
    name: 'Markdown report file exists',
    fileExists: reviewReportAbsPath
  },
  {
    batch: 'Batch 4',
    name: 'Markdown report contains data quality section',
    fileContains: { path: reviewReportAbsPath, text: '## 0. 数据质量' }
  },
  {
    batch: 'Report Center',
    name: 'Generated report is available for preview',
    fileContains: { path: reviewReportAbsPath, text: '# Chan Shuo' }
  },
  {
    batch: 'Report Center',
    name: 'Tauri report preview command exists',
    fileContains: { path: resolve(workspaceRoot, 'apps/desktop/src-tauri/src/main.rs'), text: 'fn read_report' }
  },
  {
    batch: 'Report Center',
    name: 'Tauri report preview command is registered',
    fileContains: { path: resolve(workspaceRoot, 'apps/desktop/src-tauri/src/main.rs'), text: 'read_report,' }
  },
  {
    batch: 'Report Center',
    name: 'Desktop report preview service exists',
    fileContains: { path: resolve(workspaceRoot, 'apps/desktop/src/app/report-center.service.ts'), text: "invoke<ReportContentView>('read_report'" }
  },
  {
    batch: 'Report Center',
    name: 'Desktop report preview UI exists',
    fileContains: { path: resolve(workspaceRoot, 'apps/desktop/src/app/app.component.html'), text: 'report-preview' }
  },
  {
    batch: 'Batch 5',
    name: 'Queue add workflow',
    command: ['pnpm', ['queue:add', tradeDate, 'review,plan,report']],
    expect: ['queued']
  },
  {
    batch: 'Batch 5',
    name: 'Queue list',
    command: ['pnpm', ['queue:list']],
    expect: ['status', 'task']
  },
  {
    batch: 'All',
    name: 'Typecheck workspace',
    command: ['pnpm', ['-r', 'typecheck']],
    expect: []
  }
];

const results = [];
for (const testCase of cases) {
  const start = Date.now();
  if (testCase.fileExists) {
    const ok = existsSync(testCase.fileExists);
    results.push({ ...testCase, ok, status: ok ? 0 : 1, durationMs: Date.now() - start, stdout: ok ? `file exists: ${testCase.fileExists}` : '', stderr: ok ? '' : `missing file: ${testCase.fileExists}`, missing: ok ? [] : [testCase.fileExists] });
    continue;
  }
  if (testCase.fileContains) {
    const exists = existsSync(testCase.fileContains.path);
    const content = exists ? readFileSync(testCase.fileContains.path, 'utf8') : '';
    const ok = exists && content.includes(testCase.fileContains.text);
    results.push({ ...testCase, ok, status: ok ? 0 : 1, durationMs: Date.now() - start, stdout: ok ? `found text in file: ${testCase.fileContains.path}` : content, stderr: exists ? '' : `missing file: ${testCase.fileContains.path}`, missing: ok ? [] : [exists ? testCase.fileContains.text : testCase.fileContains.path] });
    continue;
  }

  const [cmd, args] = testCase.command;
  const output = spawnSync(cmd, args, { encoding: 'utf8', env: { ...process.env, NG_CLI_ANALYTICS: 'false' }, cwd: workspaceRoot });
  const stdout = output.stdout ?? '';
  const stderr = output.stderr ?? '';
  const combined = `${stdout}\n${stderr}`;
  const expectsPassed = (testCase.expect ?? []).every((item) => combined.includes(item));
  const regexPassed = (testCase.expectRegex ?? []).every((pattern) => new RegExp(pattern, 'm').test(combined.trim()));
  const ok = output.status === 0 && expectsPassed && regexPassed;
  results.push({
    ...testCase,
    ok,
    status: output.status,
    durationMs: Date.now() - start,
    stdout,
    stderr,
    missing: [
      ...(testCase.expect ?? []).filter((item) => !combined.includes(item)),
      ...(testCase.expectRegex ?? []).filter((pattern) => !new RegExp(pattern, 'm').test(combined.trim())).map((pattern) => `regex:${pattern}`)
    ]
  });
}

const passed = results.filter((item) => item.ok).length;
const failed = results.length - passed;
const lines = [];
lines.push(`# Chan Shuo Batch Test Report`);
lines.push('');
lines.push(`- Trade date: ${tradeDate}`);
lines.push(`- Run id: ${runId}`);
lines.push(`- Workspace root: ${workspaceRoot}`);
lines.push(`- Batch report: ${reportPath}`);
lines.push(`- Review report: ${reviewReportPath}`);
lines.push(`- Review report absolute path: ${reviewReportAbsPath}`);
lines.push(`- Started at: ${startedAt}`);
lines.push(`- Finished at: ${new Date().toISOString()}`);
lines.push(`- Passed: ${passed}`);
lines.push(`- Failed: ${failed}`);
lines.push('');
lines.push(`## Summary`);
lines.push('');
lines.push('| Batch | Case | Result | Duration |');
lines.push('|---|---|---:|---:|');
for (const item of results) {
  lines.push(`| ${item.batch} | ${item.name} | ${item.ok ? 'PASS' : 'FAIL'} | ${item.durationMs}ms |`);
}
lines.push('');
lines.push('## Details');
for (const item of results) {
  lines.push('');
  lines.push(`### ${item.ok ? 'PASS' : 'FAIL'} · ${item.batch} · ${item.name}`);
  lines.push('');
  lines.push(`Command: ${formatCommand(item)}`);
  lines.push(`Exit status: ${item.status}`);
  if (item.missing.length) lines.push(`Missing expected output: ${item.missing.join(', ')}`);
  lines.push('');
  lines.push('```text');
  lines.push(truncate(`${item.stdout}\n${item.stderr}`.trim(), 4000));
  lines.push('```');
}
lines.push('');
lines.push('> This report is generated locally and should not be committed when it contains runtime output.');

mkdirSync(dirname(reportAbsPath), { recursive: true });
writeFileSync(reportAbsPath, lines.join('\n'), 'utf8');
console.log(`batch test report: ${reportAbsPath}`);
console.log(`review report: ${reviewReportAbsPath}`);
console.log(`passed=${passed} failed=${failed}`);
process.exit(failed === 0 ? 0 : 1);

function formatCommand(item) {
  if (item.command) return `\`${item.command[0]} ${item.command[1].join(' ')}\``;
  if (item.fileExists) return `file exists: \`${item.fileExists}\``;
  if (item.fileContains) return `file contains: \`${item.fileContains.path}\``;
  return '`internal check`';
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}\n... truncated ...`;
}
