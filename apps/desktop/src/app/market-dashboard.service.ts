import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';
import { DashboardViewModel, MOCK_DASHBOARD } from './market-dashboard.data';

interface TauriDashboardPayload {
  trade_date: string;
  mood_cards: Array<{ label: string; value: string | number; hint: string }>;
  theme_count: number;
  limit_up_count: number;
  news_count: number;
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
      ...MOCK_DASHBOARD,
      tradeDate: payload.trade_date,
      moodCards: payload.mood_cards,
      aiSummary: `已从本地 SQLite 读取：题材 ${payload.theme_count} 个，涨停 ${payload.limit_up_count} 只，消息 ${payload.news_count} 条。`
    };
  }
}
