import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const tradeDate = process.argv[2] ?? '2026-06-28';
const reportPath = process.argv[3] ?? `reports/batch-test-${tradeDate}.md`;
const startedAt = new Date().toISOString();

const cases = [
  {
    batch: 'Batch 1',
    name: 'DB init and workspace paths',
    command: ['pnpm', ['db:init']],
    expect: ['database initialized']
  },
  {
    batch: 'Batch 3',
    name: 'Mock market data import',
    command: ['pnpm', ['agent:mock', tradeDate]],
    expect: [`mock data saved: ${tradeDate}`]
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
    expect: []
  },
  {
    batch: 'Batch 4',
    name: 'Markdown report export',
    command: ['pnpm', ['report:md', tradeDate, `reports/batch-review-${tradeDate}.md`]],
    expect: ['markdown report exported']
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
  const [cmd, args] = testCase.command;
  const start = Date.now();
  const output = spawnSync(cmd, args, { encoding: 'utf8', env: { ...process.env, NG_CLI_ANALYTICS: 'false' } });
  const stdout = output.stdout ?? '';
  const stderr = output.stderr ?? '';
  const combined = `${stdout}\n${stderr}`;
  const expectsPassed = testCase.expect.every((item) => combined.includes(item));
  const ok = output.status === 0 && expectsPassed;
  results.push({
    ...testCase,
    ok,
    status: output.status,
    durationMs: Date.now() - start,
    stdout,
    stderr,
    missing: testCase.expect.filter((item) => !combined.includes(item))
  });
}

const passed = results.filter((item) => item.ok).length;
const failed = results.length - passed;
const lines = [];
lines.push(`# Chan Shuo Batch Test Report`);
lines.push('');
lines.push(`- Trade date: ${tradeDate}`);
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
  lines.push(`Command: \`${item.command[0]} ${item.command[1].join(' ')}\``);
  lines.push(`Exit status: ${item.status}`);
  if (item.missing.length) lines.push(`Missing expected output: ${item.missing.join(', ')}`);
  lines.push('');
  lines.push('```text');
  lines.push(truncate(`${item.stdout}\n${item.stderr}`.trim(), 4000));
  lines.push('```');
}
lines.push('');
lines.push('> This report is generated locally and should not be committed when it contains runtime output.');

mkdirSync(reportPath.split('/').slice(0, -1).join('/') || '.', { recursive: true });
writeFileSync(reportPath, lines.join('\n'), 'utf8');
console.log(`batch test report: ${reportPath}`);
console.log(`passed=${passed} failed=${failed}`);
process.exit(failed === 0 ? 0 : 1);

function truncate(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}\n... truncated ...`;
}
