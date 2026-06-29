export type PersistentTaskStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

export type PersistentTaskType = 'review' | 'plan' | 'news' | 'theme' | 'alerts' | 'report';

export interface PersistentTaskQueueItem {
  id?: number;
  tradeDate: string;
  task: PersistentTaskType;
  status: PersistentTaskStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnqueueTaskInput {
  tradeDate: string;
  task: PersistentTaskType;
  maxRetries?: number;
}
