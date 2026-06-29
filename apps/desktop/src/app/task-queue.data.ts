import type { AgentTask } from './agent-task.service';

export type QueueItemStatus = 'queued' | 'running' | 'success' | 'failed';

export interface TaskQueueItemView {
  id: string;
  task: AgentTask;
  tradeDate: string;
  status: QueueItemStatus;
  retryCount: number;
  maxRetries: number;
  message: string;
}

export const DEFAULT_TASK_QUEUE: TaskQueueItemView[] = [];
