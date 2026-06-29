import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';
import { AiAnalysisView, MOCK_AI_ANALYSES } from './ai-analysis.data';

interface TauriAiAnalysisRow {
  id: number;
  trade_date: string;
  target_type: string;
  target_id: string;
  task_type: string;
  provider: string;
  model: string;
  result: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AiAnalysisService {
  loadAnalyses(tradeDate = '2026-06-28'): Observable<AiAnalysisView[]> {
    return from(invoke<TauriAiAnalysisRow[]>('load_ai_analyses', { tradeDate })).pipe(
      map((rows) => rows.map((row) => this.toView(row))),
      catchError(() => of(MOCK_AI_ANALYSES))
    );
  }

  private toView(row: TauriAiAnalysisRow): AiAnalysisView {
    return {
      id: row.id,
      tradeDate: row.trade_date,
      targetType: row.target_type,
      targetId: row.target_id,
      taskType: row.task_type,
      provider: row.provider,
      model: row.model,
      result: row.result,
      createdAt: row.created_at
    };
  }
}
