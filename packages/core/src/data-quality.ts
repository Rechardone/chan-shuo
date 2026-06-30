import type { DailyReviewInput } from './index.js';

export type DataQualityLevel = 'good' | 'partial' | 'empty';

export interface DataQualityCheck {
  key: string;
  label: string;
  ok: boolean;
  count: number;
  message: string;
}

export interface DataQualityReport {
  tradeDate: string;
  level: DataQualityLevel;
  score: number;
  checks: DataQualityCheck[];
  summary: string;
}

export function evaluateDataQuality(input: DailyReviewInput): DataQualityReport {
  const checks: DataQualityCheck[] = [
    {
      key: 'market_mood',
      label: '市场情绪',
      ok: Boolean(input.marketMood),
      count: input.marketMood ? 1 : 0,
      message: input.marketMood ? '已读取市场情绪' : '缺少市场情绪数据'
    },
    {
      key: 'limit_up_daily',
      label: '涨停池',
      ok: input.limitUps.length > 0,
      count: input.limitUps.length,
      message: input.limitUps.length > 0 ? `已读取 ${input.limitUps.length} 条涨停数据` : '缺少涨停池数据'
    },
    {
      key: 'theme_daily_rank',
      label: '题材排行',
      ok: input.topThemes.length > 0,
      count: input.topThemes.length,
      message: input.topThemes.length > 0 ? `已读取 ${input.topThemes.length} 条题材数据` : '缺少题材排行数据'
    },
    {
      key: 'news_flash',
      label: '新闻快讯',
      ok: input.news.length > 0,
      count: input.news.length,
      message: input.news.length > 0 ? `已读取 ${input.news.length} 条新闻数据` : '缺少新闻快讯数据'
    }
  ];

  const passed = checks.filter((item) => item.ok).length;
  const score = Math.round((passed / checks.length) * 100);
  const level: DataQualityLevel = score >= 75 ? 'good' : score >= 25 ? 'partial' : 'empty';
  const summary = level === 'good'
    ? '数据较完整，可以生成复盘。'
    : level === 'partial'
      ? '数据不完整，复盘可生成但需要谨慎解读。'
      : '核心数据缺失，请先导入行情或 mock 数据。';

  return { tradeDate: input.tradeDate, level, score, checks, summary };
}
