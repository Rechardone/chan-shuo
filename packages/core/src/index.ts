export type TradeDate = string;
export type StockCode = string;

export interface Stock {
  code: StockCode;
  name: string;
  market?: string;
  industry?: string;
}

export interface LimitUpItem {
  tradeDate: TradeDate;
  code: StockCode;
  name: string;
  firstLimitTime?: string;
  lastLimitTime?: string;
  breakCount?: number;
  boardCount?: number;
  reason?: string;
  themes?: string[];
  amount?: number;
  floatMarketCap?: number;
  source?: string;
  raw?: unknown;
}

export interface BrokenLimitItem {
  tradeDate: TradeDate;
  code: StockCode;
  name: string;
  highPct?: number;
  brokenTime?: string;
  breakCount?: number;
  closePct?: number;
  themes?: string[];
  source?: string;
  raw?: unknown;
}

export interface ThemeRankItem {
  tradeDate: TradeDate;
  themeName: string;
  limitUpCount: number;
  boardCount?: number;
  leaderCode?: string;
  leaderName?: string;
  rankNo?: number;
  heatScore?: number;
  source?: string;
  raw?: unknown;
}

export interface MarketMood {
  tradeDate: TradeDate;
  limitUpCount: number;
  limitDownCount: number;
  brokenLimitCount: number;
  maxBoardHeight: number;
  sealRate?: number;
  promotionRate1To2?: number;
  promotionRate2To3?: number;
  yesterdayLimitAvgReturn?: number;
  moodScore?: number;
  source?: string;
  raw?: unknown;
}

export interface NewsItem {
  newsTime: string;
  source: string;
  title: string;
  content?: string;
  relatedCodes?: string[];
  relatedThemes?: string[];
  eventType?: string;
  importanceScore?: number;
  aiSummary?: string;
  raw?: unknown;
}

export interface DailyReviewInput {
  tradeDate: TradeDate;
  marketMood?: MarketMood;
  topThemes: ThemeRankItem[];
  limitUps: LimitUpItem[];
  news: NewsItem[];
}

export interface AiAnalysis {
  tradeDate?: TradeDate;
  targetType: 'market' | 'theme' | 'stock' | 'news' | 'plan';
  targetId?: string;
  taskType: 'daily_review' | 'news_classification' | 'theme_mapping' | 'stock_limit_reason' | 'next_day_plan';
  provider: string;
  model: string;
  prompt: string;
  result: string;
}

export interface MarketSource {
  name: string;
  fetchLimitUp(date: TradeDate): Promise<LimitUpItem[]>;
  fetchBrokenLimit(date: TradeDate): Promise<BrokenLimitItem[]>;
  fetchMarketMood(date: TradeDate): Promise<MarketMood>;
  fetchNewsFlash(date: TradeDate): Promise<NewsItem[]>;
  fetchThemeRank(date: TradeDate): Promise<ThemeRankItem[]>;
}

export * from './alerts.js';
