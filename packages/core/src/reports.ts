import type { AlertItem, DailyReviewInput } from './index.js';

export interface MarkdownReportInput {
  input: DailyReviewInput;
  aiReview?: string;
  nextDayPlan?: string;
  alerts?: AlertItem[];
}

export function buildMarkdownReport(report: MarkdownReportInput) {
  const { input, aiReview, nextDayPlan, alerts = [] } = report;
  const mood = input.marketMood;
  const lines: string[] = [];

  lines.push(`# ${input.tradeDate} A股消息派复盘`);
  lines.push('');
  lines.push('## 1. 市场情绪');
  if (mood) {
    lines.push(`- 涨停：${mood.limitUpCount}`);
    lines.push(`- 跌停：${mood.limitDownCount}`);
    lines.push(`- 炸板：${mood.brokenLimitCount}`);
    lines.push(`- 最高连板：${mood.maxBoardHeight}`);
    if (mood.moodScore !== undefined) lines.push(`- 市场温度：${mood.moodScore}`);
  } else {
    lines.push('- 暂无市场情绪数据。');
  }

  lines.push('');
  lines.push('## 2. 题材排行榜');
  if (input.topThemes.length === 0) lines.push('- 暂无题材数据。');
  for (const theme of input.topThemes) {
    lines.push(`- ${theme.rankNo ?? '-'}｜${theme.themeName}｜涨停 ${theme.limitUpCount}｜龙头 ${theme.leaderName ?? '待确认'}｜热度 ${theme.heatScore ?? '-'}`);
  }

  lines.push('');
  lines.push('## 3. 涨停梯队');
  if (input.limitUps.length === 0) lines.push('- 暂无涨停数据。');
  for (const item of input.limitUps) {
    lines.push(`- ${item.boardCount ?? 1}板｜${item.code} ${item.name}｜${(item.themes ?? []).join('、') || '未归类'}｜${item.reason ?? '无原因'}`);
  }

  lines.push('');
  lines.push('## 4. 重要消息');
  if (input.news.length === 0) lines.push('- 暂无消息数据。');
  for (const item of input.news) {
    lines.push(`- ${item.newsTime}｜${item.eventType ?? '未分类'}｜${item.title}`);
  }

  lines.push('');
  lines.push('## 5. 预警信号');
  if (alerts.length === 0) lines.push('- 暂无预警。');
  for (const alert of alerts) {
    lines.push(`- 【${alert.level}】${alert.title}：${alert.message}`);
  }

  lines.push('');
  lines.push('## 6. AI 复盘');
  lines.push(aiReview?.trim() || '暂无 AI 复盘。');

  lines.push('');
  lines.push('## 7. 明日观察计划');
  lines.push(nextDayPlan?.trim() || '暂无明日观察计划。');

  lines.push('');
  lines.push('> 本报告仅用于个人复盘与研究，不构成投资建议。');
  lines.push('');

  return lines.join('\n');
}
