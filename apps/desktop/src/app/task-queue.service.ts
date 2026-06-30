import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';
import { AgentTask, AgentTaskResult } from './agent-task.service';
import { DEFAULT_TASK_QUEUE, QueueItemStatus, TaskQueueItemView } from './task-queue.data';

interface TauriPersistentTaskRow {
  id: number;
  trade_date: string;
  task: AgentTask;
  status: QueueItemStatus;
  retry_count: number;
  max_retries: number;
  last_error: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class TaskQueueService {
  private readonly itemsSubject = new BehaviorSubject<TaskQueueItemView[]>(DEFAULT_TASK_QUEUE);
  readonly items$: Observable<TaskQueueItemView[]> = this.itemsSubject.asObservable();

  loadQueue(): Observable<TaskQueueItemView[]> {
    return from(invoke<TauriPersistentTaskRow[]>('load_persistent_tasks')).pipe(
      map((rows) => rows.map((row) => this.toView(row))),
      tap((items) => this.itemsSubject.next(items)),
      catchError(() => of(this.itemsSubject.value))
    );
  }

  enqueue(tasks: AgentTask[], tradeDate: string): Observable<TaskQueueItemView[]> {
    return from(invoke<TauriPersistentTaskRow[]>('enqueue_persistent_tasks', { tradeDate, tasks })).pipe(
      map((rows) => rows.map((row) => this.toView(row))),
      tap((items) => this.itemsSubject.next(items)),
      catchError(() => of(this.itemsSubject.value))
    );
  }

  cancelQueued(): Observable<TaskQueueItemView[]> {
    return this.updateQueueFromCommand('cancel_queued_tasks');
  }

  clearFinished(): Observable<TaskQueueItemView[]> {
    return this.updateQueueFromCommand('clear_finished_tasks');
  }

  runNext(): Observable<AgentTaskResult> {
    return from(invoke<AgentTaskResult>('run_next_persistent_task')).pipe(
      tap(() => this.loadQueue().subscribe()),
      catchError((error) => of({ ok: false, command: 'run_next_persistent_task', stdout: '', stderr: String(error) }))
    );
  }

  private updateQueueFromCommand(command: 'cancel_queued_tasks' | 'clear_finished_tasks'): Observable<TaskQueueItemView[]> {
    return from(invoke<TauriPersistentTaskRow[]>(command)).pipe(
      map((rows) => rows.map((row) => this.toView(row))),
      tap((items) => this.itemsSubject.next(items)),
      catchError(() => of(this.itemsSubject.value))
    );
  }

  private toView(row: TauriPersistentTaskRow): TaskQueueItemView {
    return {
      id: String(row.id),
      task: row.task,
      tradeDate: row.trade_date,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      message: row.last_error || this.statusMessage(row.status),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private statusMessage(status: QueueItemStatus) {
    return {
      queued: '等待执行',
      running: '执行中',
      success: '执行成功',
      failed: '执行失败',
      cancelled: '已取消'
    }[status];
  }
}
