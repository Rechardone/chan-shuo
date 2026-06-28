import type { DailyReviewInput, ThemeRankItem } from './index.js';

export type AlertLevel = 'info' | 'watch' | 'risk';

export interface AlertItem {
  level: AlertLevel;
  title: string;
  message: string;
  targetType: 'market' | 'theme' | 'stock' | 'news';
  targetId?: string;
  createdAt: string;
}

export interface AlertRuleContext {
  input: DailyReviewInput;
  now?: string;
}

export function evaluateAlerts(context: AlertRuleContext): AlertItem[] {
  const now = context.now ?? new Date().toISOString();
  const input = context.input;
  const alerts: AlertItem[] = [];

  const mood = input.marketMood;
  if (mood) {
    if ((mood.moodScore ?? 0) >= 70) {
      alerts.push({ level: 'watch', title: '市场温度偏强', message: `市场温度 ${mood.moodScore}，短线情绪处于活跃区。`, targetType: 'market', targetId: input.tradeDate, createdAt: now });
    }
    if ((mood.brokenLimitCount ?? 0) >= 20) {
      alerts.push({ level: 'risk', title: '炸板数量偏高', message: `炸板数量 ${mood.brokenLimitCount}，盘面分歧较大。`, targetType: 'market', targetId: input.tradeDate, createdAt: now });
    }
    if ((mood.maxBoardHeight ?? 0) >= 5) {
      alerts.push({ level: 'watch', title: '连板高度打开', message: `最高连板达到 ${mood.maxBoardHeight} 板，关注高标晋级与负反馈。`, targetType: 'market', targetId: input.tradeDate, createdAt: now });
    }
  }

  for (const theme of input.topThemes.slice(0, 5)) {
    const themeAlerts = evaluateTheme(theme, now);
    alerts.push(...themeAlerts);
  }

  for (const news of input.news) {
    if ((news.importanceScore ?? 0) >= 4) {
      alerts.push({ level: 'watch', title: '重要消息催化', message: `${news.title}；关联题材：${(news.relatedThemes ?? []).join('、') || '待识别'}`, targetType: 'news', targetId: news.title, createdAt: now });
    }
  }

  return alerts;
}

function evaluateTheme(theme: ThemeRankItem, now: string): AlertItem[] {
  const alerts: AlertItem[] = [];
  if ((theme.limitUpCount ?? 0) >= 10) {
    alerts.push({ level: 'watch', title: '题材涨停扩散', message: `${theme.themeName} 涨停数达到 ${theme.limitUpCount}，关注是否形成主线。`, targetType: 'theme', targetId: theme.themeName, createdAt: now });
  }
  if ((theme.rankNo ?? 99) <= 3 && (theme.heatScore ?? 0) >= 85) {
    alerts.push({ level: 'info', title: '题材热度居前', message: `${theme.themeName} 位居前排，龙头为 ${theme.leaderName ?? '待确认'}。`, targetType: 'theme', targetId: theme.themeName, createdAt: now });
  }
  return alerts;
}
