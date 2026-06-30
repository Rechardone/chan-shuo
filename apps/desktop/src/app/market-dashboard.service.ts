import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';
import { DashboardViewModel, DataQualityCheckView, DataQualityView, MOCK_DASHBOARD } from './market-dashboard.data';

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
    const themes = payload.themes.map((row) => ({
      rank: row.rank,
      name: row.name,
      limitUpCount: row.limit_up_count,
      leader: row.leader,
      status: row.status
    }));
    const limits = payload.limits;
    const news = payload.news;
    return {
      tradeDate: payload.trade_date,
      moodCards: payload.mood_cards,
      themes,
      limits,
      news,
      aiSummary: payload.ai_summary,
      dataQuality: this.evaluateDataQuality(payload.mood_cards, themes.length, limits.length, news.length)
    };
  }

  private evaluateDataQuality(moodCards: Array<{ value: string | number }>, themeCount: number, limitCount: number, newsCount: number): DataQualityView {
    const hasMood = moodCards.some((card) => Number(card.value) > 0 || String(card.value).includes('板'));
    const checks: DataQualityCheckView[] = [
      { key: 'market_mood', label: '市场情绪', ok: hasMood, count: hasMood ? 1 : 0, message: hasMood ? '已读取市场情绪' : '缺少市场情绪数据' },
      { key: 'limit_up_daily', label: '涨停池', ok: limitCount > 0, count: limitCount, message: limitCount > 0 ? `已读取 ${limitCount} 条涨停数据` : '缺少涨停池数据' },
      { key: 'theme_daily_rank', label: '题材排行', ok: themeCount > 0, count: themeCount, message: themeCount > 0 ? `已读取 ${themeCount} 条题材数据` : '缺少题材排行数据' },
      { key: 'news_flash', label: '新闻快讯', ok: newsCount > 0, count: newsCount, message: newsCount > 0 ? `已读取 ${newsCount} 条新闻数据` : '缺少新闻快讯数据' }
    ];
    const passed = checks.filter((item) => item.ok).length;
    const score = Math.round((passed / checks.length) * 100);
    const level: DataQualityView['level'] = score >= 75 ? 'good' : score >= 25 ? 'partial' : 'empty';
    const summary = level === 'good' ? '数据较完整，可以生成复盘。' : level === 'partial' ? '数据不完整，复盘可生成但需要谨慎解读。' : '核心数据缺失，请先导入行情或 mock 数据。';
    return { level, score, summary, checks };
  }
}
