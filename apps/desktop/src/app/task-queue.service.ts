import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatMap, from, of } from 'rxjs';
import { AgentTask, AgentTaskService } from './agent-task.service';
import { DEFAULT_TASK_QUEUE, TaskQueueItemView } from './task-queue.data';

@Injectable({ providedIn: 'root' })
export class TaskQueueService {
  private readonly itemsSubject = new BehaviorSubject<TaskQueueItemView[]>(DEFAULT_TASK_QUEUE);
  readonly items$: Observable<TaskQueueItemView[]> = this.itemsSubject.asObservable();

  constructor(private readonly agentTaskService: AgentTaskService) {}

  enqueue(tasks: AgentTask[], tradeDate: string, maxRetries = 1) {
    const created = tasks.map((task) => ({
      id: `${Date.now()}-${task}`,
      task,
      tradeDate,
      status: 'queued' as const,
      retryCount: 0,
      maxRetries,
      message: '等待执行'
    }));
    this.itemsSubject.next([...created, ...this.itemsSubject.value]);
    from(created).pipe(concatMap((item) => this.runItem(item))).subscribe();
  }

  private runItem(item: TaskQueueItemView): Observable<void> {
    this.patch(item.id, { status: 'running', message: '执行中' });
    return new Observable<void>((subscriber) => {
      this.agentTaskService.runTask(item.task, item.tradeDate).subscribe((result) => {
        if (result.ok) {
          this.patch(item.id, { status: 'success', message: '执行成功' });
          subscriber.next();
          subscriber.complete();
          return;
        }
        const nextRetry = item.retryCount + 1;
        if (nextRetry <= item.maxRetries) {
          const retried = { ...item, retryCount: nextRetry };
          this.patch(item.id, { retryCount: nextRetry, message: `失败，准备第 ${nextRetry} 次重试` });
          this.runItem(retried).subscribe(() => {
            subscriber.next();
            subscriber.complete();
          });
          return;
        }
        this.patch(item.id, { status: 'failed', message: result.stderr || '执行失败' });
        subscriber.next();
        subscriber.complete();
      });
    });
  }

  private patch(id: string, patch: Partial<TaskQueueItemView>) {
    this.itemsSubject.next(this.itemsSubject.value.map((item) => item.id === id ? { ...item, ...patch } : item));
  }
}
