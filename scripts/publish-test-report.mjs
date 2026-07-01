import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const reportBranch = process.env.CHAN_SHUO_REPORT_BRANCH ?? process.argv[2] ?? 'test-reports';
const sourceBranch = currentBranch();
const reportsDir = resolve(workspaceRoot, 'reports');
const publishDir = resolve(workspaceRoot, '.tmp/test-report-publish');
const timestamp = new Date().toISOString();
const safeTimestamp = timestamp.replace(/[:.]/g, '-');
const runDirName = `run-${safeTimestamp}`;

const requiredReports = [
  'latest-local-test.log',
  'latest-local-summary.md',
  'latest-batch-test.md',
  'latest-batch-review.md'
];

for (const name of requiredReports) {
  const path = resolve(reportsDir, name);
  if (!existsSync(path)) {
    throw new Error(`missing report file: ${path}. Run pnpm local:test-report first.`);
  }
}

run('git', ['diff', '--quiet', '--', ':!reports', ':!data', ':!.tmp'], { allowFailure: true });
const worktreeExists = existsSync(publishDir);
if (!worktreeExists) {
  mkdirSync(resolve(workspaceRoot, '.tmp'), { recursive: true });
  const branchExists = run('git', ['rev-parse', '--verify', reportBranch], { allowFailure: true }).status === 0;
  if (branchExists) run('git', ['worktree', 'add', publishDir, reportBranch]);
  else run('git', ['worktree', 'add', '-b', reportBranch, publishDir]);
} else {
  run('git', ['-C', publishDir, 'checkout', reportBranch]);
  run('git', ['-C', publishDir, 'pull', '--ff-only'], { allowFailure: true });
}

const targetLatestDir = resolve(publishDir, 'latest');
const targetRunDir = resolve(publishDir, 'runs', runDirName);
mkdirSync(targetLatestDir, { recursive: true });
mkdirSync(targetRunDir, { recursive: true });

for (const name of requiredReports) {
  copyFileSync(resolve(reportsDir, name), resolve(targetLatestDir, name));
  copyFileSync(resolve(reportsDir, name), resolve(targetRunDir, name));
}

const manifest = {
  publishedAt: timestamp,
  sourceBranch,
  sourceCommit: currentCommit(),
  reportBranch,
  runDir: `runs/${runDirName}`,
  latestDir: 'latest',
  files: requiredReports
};
writeFileSync(resolve(targetLatestDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
writeFileSync(resolve(targetRunDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
writeFileSync(resolve(publishDir, 'README.md'), buildReadme(manifest), 'utf8');

run('git', ['-C', publishDir, 'add', 'README.md', 'latest', 'runs']);
const hasChanges = run('git', ['-C', publishDir, 'diff', '--cached', '--quiet'], { allowFailure: true }).status !== 0;
if (!hasChanges) {
  console.log('no report changes to publish');
  process.exit(0);
}

run('git', ['-C', publishDir, 'commit', '-m', `test(report): publish ${safeTimestamp}`]);
run('git', ['-C', publishDir, 'push', 'origin', reportBranch]);
console.log(`published reports to branch: ${reportBranch}`);
console.log(`latest manifest: latest/manifest.json`);
console.log(`run dir: runs/${runDirName}`);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit'
  });
  if (!options.allowFailure && result.status !== 0) {
    throw new Error(`command failed: ${command} ${args.join(' ')}`);
  }
  return result;
}

function currentBranch() {
  const result = spawnSync('git', ['branch', '--show-current'], { cwd: workspaceRoot, encoding: 'utf8' });
  return result.stdout.trim() || 'unknown';
}

function currentCommit() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: workspaceRoot, encoding: 'utf8' });
  return result.stdout.trim() || 'unknown';
}

function buildReadme(manifest) {
  const summaryPath = resolve(targetLatestDir, 'latest-local-summary.md');
  const summary = existsSync(summaryPath) ? readFileSync(summaryPath, 'utf8') : '';
  return [
    '# Chan Shuo Test Reports',
    '',
    '这个分支只保存测试报告，不参与业务代码开发。',
    '',
    '## Latest',
    '',
    `- Published at: ${manifest.publishedAt}`,
    `- Source branch: ${manifest.sourceBranch}`,
    `- Source commit: ${manifest.sourceCommit}`,
    `- Run dir: ${manifest.runDir}`,
    '',
    '## Files',
    '',
    '- `latest/latest-local-test.log`',
    '- `latest/latest-local-summary.md`',
    '- `latest/latest-batch-test.md`',
    '- `latest/latest-batch-review.md`',
    '- `latest/manifest.json`',
    '',
    '## Summary snapshot',
    '',
    '```md',
    summary.trim(),
    '```',
    ''
  ].join('\n');
}
