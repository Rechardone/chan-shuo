export interface TaskLogView {
  id: string;
  task: string;
  tradeDate: string;
  command: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  createdAt: string;
}

export const MOCK_TASK_LOGS: TaskLogView[] = [
  {
    id: 'mock',
    task: 'review',
    tradeDate: '2026-06-28',
    command: 'pnpm --filter @chan-shuo/agent review 2026-06-28',
    ok: true,
    stdout: 'Mock task completed.',
    stderr: '',
    createdAt: 'mock'
  }
];
