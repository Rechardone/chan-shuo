import type Database from 'better-sqlite3';
import type { AiAnalysis, DailyReviewInput, EnqueueTaskInput, LimitUpItem, MarketMood, NewsItem, PersistentTaskQueueItem, ThemeRankItem } from '@chan-shuo/core';

export interface StockBasicInput {
  code: string;
  name: string;
  market?: string;
  industry?: string;
}

const encode = (value: unknown) => JSON.stringify(value ?? null);
const decodeList = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function saveStocks(db: Database.Database, items: StockBasicInput[]) {
  const sql = 'INSERT INTO stock (code, name, market, industry, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(code) DO UPDATE SET name = excluded.name, market = excluded.market, industry = COALESCE(excluded.industry, stock.industry), updated_at = CURRENT_TIMESTAMP';
  const stmt = db.prepare(sql);
  const tx = db.transaction((rows: StockBasicInput[]) => {
    for (const item of rows) stmt.run(item.code, item.name, item.market, item.industry);
  });
  tx(items);
}

export function countStocks(db: Database.Database): number {
  const row = db.prepare('SELECT COUNT(*) AS count FROM stock').get() as { count?: number } | undefined;
  return Number(row?.count ?? 0);
}

export function saveMarketMood(db: Database.Database, item: MarketMood) {
  const sql = 'INSERT OR REPLACE INTO market_mood (trade_date, limit_up_count, limit_down_count, broken_limit_count, max_board_height, seal_rate, promotion_rate_1_to_2, promotion_rate_2_to_3, yesterday_limit_avg_return, mood_score, source, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.prepare(sql).run(item.tradeDate, item.limitUpCount, item.limitDownCount, item.brokenLimitCount, item.maxBoardHeight, item.sealRate, item.promotionRate1To2, item.promotionRate2To3, item.yesterdayLimitAvgReturn, item.moodScore, item.source, encode(item.raw ?? item));
}

export function saveLimitUps(db: Database.Database, items: LimitUpItem[]) {
  const sql = 'INSERT OR REPLACE INTO limit_up_daily (trade_date, code, name, first_limit_time, last_limit_time, break_count, board_count, reason, themes, amount, float_market_cap, source, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const stmt = db.prepare(sql);
  for (const item of items) stmt.run(item.tradeDate, item.code, item.name, item.firstLimitTime, item.lastLimitTime, item.breakCount ?? 0, item.boardCount ?? 1, item.reason, encode(item.themes ?? []), item.amount, item.floatMarketCap, item.source, encode(item.raw ?? item));
}

export function saveThemeRanks(db: Database.Database, items: ThemeRankItem[]) {
  const sql = 'INSERT OR REPLACE INTO theme_daily_rank (trade_date, theme_name, limit_up_count, board_count, leader_code, leader_name, rank_no, heat_score, source, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const stmt = db.prepare(sql);
  for (const item of items) stmt.run(item.tradeDate, item.themeName, item.limitUpCount, item.boardCount ?? 0, item.leaderCode, item.leaderName, item.rankNo, item.heatScore, item.source, encode(item.raw ?? item));
}

export function saveNews(db: Database.Database, items: NewsItem[]) {
  const sql = 'INSERT INTO news_flash (news_time, source, title, content, related_codes, related_themes, event_type, importance_score, ai_summary, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const stmt = db.prepare(sql);
  for (const item of items) stmt.run(item.newsTime, item.source, item.title, item.content, encode(item.relatedCodes ?? []), encode(item.relatedThemes ?? []), item.eventType, item.importanceScore, item.aiSummary, encode(item.raw ?? item));
}

export function saveAiAnalysis(db: Database.Database, item: AiAnalysis) {
  const sql = 'INSERT INTO ai_analysis (trade_date, target_type, target_id, task_type, provider, model, prompt, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.prepare(sql).run(item.tradeDate, item.targetType, item.targetId, item.taskType, item.provider, item.model, item.prompt, item.result);
}

export function enqueueTask(db: Database.Database, item: EnqueueTaskInput): number {
  const sql = 'INSERT INTO task_queue (trade_date, task, status, retry_count, max_retries) VALUES (?, ?, ?, ?, ?)';
  const result = db.prepare(sql).run(item.tradeDate, item.task, 'queued', 0, item.maxRetries ?? 1);
  return Number(result.lastInsertRowid);
}

export function listTasks(db: Database.Database, limit = 50): PersistentTaskQueueItem[] {
  const rows = db.prepare('SELECT * FROM task_queue ORDER BY id DESC LIMIT ?').all(limit) as any[];
  return rows.map(toTaskItem);
}

export function claimNextTask(db: Database.Database): PersistentTaskQueueItem | undefined {
  const row = db.prepare("SELECT * FROM task_queue WHERE status = 'queued' ORDER BY id ASC LIMIT 1").get() as any | undefined;
  if (!row) return undefined;
  db.prepare("UPDATE task_queue SET status = 'running', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(row.id);
  return { ...toTaskItem(row), status: 'running' };
}

export function markTaskSuccess(db: Database.Database, id: number) {
  db.prepare("UPDATE task_queue SET status = 'success', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
}

export function markTaskFailed(db: Database.Database, id: number, error: string) {
  const row = db.prepare('SELECT retry_count, max_retries FROM task_queue WHERE id = ?').get(id) as any | undefined;
  if (!row) return;
  const retryCount = Number(row.retry_count ?? 0) + 1;
  const maxRetries = Number(row.max_retries ?? 1);
  const status = retryCount <= maxRetries ? 'queued' : 'failed';
  db.prepare('UPDATE task_queue SET status = ?, retry_count = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, retryCount, error, id);
}

export function loadDailyReviewInput(db: Database.Database, tradeDate: string): DailyReviewInput {
  const mood = db.prepare('SELECT * FROM market_mood WHERE trade_date = ?').get(tradeDate) as any;
  const themeRows = db.prepare('SELECT * FROM theme_daily_rank WHERE trade_date = ? ORDER BY rank_no ASC').all(tradeDate) as any[];
  const limitRows = db.prepare('SELECT * FROM limit_up_daily WHERE trade_date = ? ORDER BY board_count DESC').all(tradeDate) as any[];
  const newsRows = db.prepare('SELECT * FROM news_flash WHERE news_time LIKE ? ORDER BY news_time ASC').all(`${tradeDate}%`) as any[];
  return {
    tradeDate,
    marketMood: mood ? { tradeDate: mood.trade_date, limitUpCount: mood.limit_up_count, limitDownCount: mood.limit_down_count, brokenLimitCount: mood.broken_limit_count, maxBoardHeight: mood.max_board_height, sealRate: mood.seal_rate, promotionRate1To2: mood.promotion_rate_1_to_2, promotionRate2To3: mood.promotion_rate_2_to_3, yesterdayLimitAvgReturn: mood.yesterday_limit_avg_return, moodScore: mood.mood_score, source: mood.source } : undefined,
    topThemes: themeRows.map((r) => ({ tradeDate: r.trade_date, themeName: r.theme_name, limitUpCount: r.limit_up_count, boardCount: r.board_count, leaderCode: r.leader_code, leaderName: r.leader_name, rankNo: r.rank_no, heatScore: r.heat_score, source: r.source })),
    limitUps: limitRows.map((r) => ({ tradeDate: r.trade_date, code: r.code, name: r.name, firstLimitTime: r.first_limit_time, lastLimitTime: r.last_limit_time, breakCount: r.break_count, boardCount: r.board_count, reason: r.reason, themes: decodeList(r.themes), amount: r.amount, floatMarketCap: r.float_market_cap, source: r.source })),
    news: newsRows.map((r) => ({ newsTime: r.news_time, source: r.source, title: r.title, content: r.content, relatedCodes: decodeList(r.related_codes), relatedThemes: decodeList(r.related_themes), eventType: r.event_type, importanceScore: r.importance_score, aiSummary: r.ai_summary }))
  };
}

function toTaskItem(row: any): PersistentTaskQueueItem {
  return {
    id: row.id,
    tradeDate: row.trade_date,
    task: row.task,
    status: row.status,
    retryCount: row.retry_count,
    maxRetries: row.max_retries,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
