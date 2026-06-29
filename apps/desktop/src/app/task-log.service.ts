import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';
import { MOCK_TASK_LOGS, TaskLogView } from './task-log.data';

interface TauriTaskLogEntry {
  id: string;
  task: string;
  trade_date: string;
  command: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class TaskLogService {
  loadLogs(): Observable<TaskLogView[]> {
    return from(invoke<TauriTaskLogEntry[]>('load_task_logs')).pipe(
      map((rows) => rows.map((row) => this.toView(row))),
      catchError(() => of(MOCK_TASK_LOGS))
    );
  }

  private toView(row: TauriTaskLogEntry): TaskLogView {
    return {
      id: row.id,
      task: row.task,
      tradeDate: row.trade_date,
      command: row.command,
      ok: row.ok,
      stdout: row.stdout,
      stderr: row.stderr,
      createdAt: row.created_at
    };
  }
}
