import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';
import { DashboardViewModel, MOCK_DASHBOARD } from './market-dashboard.data';

interface TauriDashboardPayload {
  trade_date: string;
  mood_cards: Array<{ label: string; value: string | number; hint: string }>;
  themes: Array<{ rank: number; name: string; limit_up_count: number; leader: string; status: string }>;
  limits: Array<{ board: string; name: string; theme: string; reason: string }>;
  news: Array<{ time: string; title: string; tag: string }>;
  ai_summary: string;
}

@Injectable({ providedIn: 'root' })
export class MarketDashboardService {
  loadDashboard(tradeDate = '2026-06-28'): Observable<DashboardViewModel> {
    return from(invoke<TauriDashboardPayload>('load_dashboard_from_sqlite', { tradeDate })).pipe(
      map((payload) => this.toViewModel(payload)),
      catchError(() => of(MOCK_DASHBOARD))
    );
  }

  private toViewModel(payload: TauriDashboardPayload): DashboardViewModel {
    return {
      tradeDate: payload.trade_date,
      moodCards: payload.mood_cards,
      themes: payload.themes.map((row) => ({
        rank: row.rank,
        name: row.name,
        limitUpCount: row.limit_up_count,
        leader: row.leader,
        status: row.status
      })),
      limits: payload.limits,
      news: payload.news,
      aiSummary: payload.ai_summary
    };
  }
}
