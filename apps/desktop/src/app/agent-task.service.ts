import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';

export type AgentTask = 'review' | 'plan' | 'news' | 'theme' | 'alerts' | 'report';

export interface AgentTaskResult {
  ok: boolean;
  command: string;
  stdout: string;
  stderr: string;
}

@Injectable({ providedIn: 'root' })
export class AgentTaskService {
  runTask(task: AgentTask, tradeDate = '2026-06-28'): Observable<AgentTaskResult> {
    return from(invoke<AgentTaskResult>('run_agent_task', { task, tradeDate })).pipe(
      catchError((error) => of({ ok: false, command: `run_agent_task ${task} ${tradeDate}`, stdout: '', stderr: String(error) }))
    );
  }
}
