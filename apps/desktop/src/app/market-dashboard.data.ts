export interface MoodCardView {
  label: string;
  value: string | number;
  hint: string;
}

export interface ThemeRowView {
  rank: number;
  name: string;
  limitUpCount: number;
  leader: string;
  status: string;
}

export interface LimitRowView {
  board: string;
  name: string;
  theme: string;
  reason: string;
}

export interface NewsRowView {
  time: string;
  title: string;
  tag: string;
}

export interface DataQualityCheckView {
  key: string;
  label: string;
  ok: boolean;
  count: number;
  message: string;
}

export interface DataQualityView {
  level: 'good' | 'partial' | 'empty';
  score: number;
  summary: string;
  checks: DataQualityCheckView[];
}

export interface DashboardViewModel {
  tradeDate: string;
  moodCards: MoodCardView[];
  themes: ThemeRowView[];
  limits: LimitRowView[];
  news: NewsRowView[];
  aiSummary: string;
  dataQuality: DataQualityView;
}

export const MOCK_DASHBOARD: DashboardViewModel = {
  tradeDate: '2026-06-28',
  moodCards: [
    { label: '涨停', value: 78, hint: '短线活跃度' },
    { label: '跌停', value: 5, hint: '风险反馈' },
    { label: '炸板', value: 21, hint: '分歧强度' },
    { label: '高度', value: '5板', hint: '连板空间' },
    { label: '温度', value: 72, hint: '市场情绪' }
  ],
  themes: [
    { rank: 1, name: '机器人', limitUpCount: 14, leader: '样例机器人', status: '主线候选' },
    { rank: 2, name: 'PCB', limitUpCount: 9, leader: '样例PCB', status: '扩散观察' },
    { rank: 3, name: 'AI硬件', limitUpCount: 7, leader: '样例AI', status: '分歧中' }
  ],
  limits: [
    { board: '五板', name: '高标样例', theme: '机器人', reason: '政策催化 + 梯队晋级' },
    { board: '三板', name: '样例机器人', theme: '减速器', reason: '人形机器人消息扩散' },
    { board: '二板', name: '样例PCB', theme: 'PCB', reason: 'AI硬件补涨' }
  ],
  news: [
    { time: '09:12', title: '工信部发布机器人产业相关政策', tag: '政策扶持' },
    { time: '10:08', title: 'AI硬件方向盘中异动扩散', tag: '题材发酵' },
    { time: '13:37', title: '高位股出现分歧，炸板率上升', tag: '风险信号' }
  ],
  aiSummary: '今日市场情绪偏修复，机器人为主线候选。明日重点观察龙头晋级、昨日涨停溢价与炸板率变化。',
  dataQuality: {
    level: 'good',
    score: 100,
    summary: '数据较完整，可以生成复盘。',
    checks: [
      { key: 'market_mood', label: '市场情绪', ok: true, count: 1, message: '已读取市场情绪' },
      { key: 'limit_up_daily', label: '涨停池', ok: true, count: 3, message: '已读取 3 条涨停数据' },
      { key: 'theme_daily_rank', label: '题材排行', ok: true, count: 3, message: '已读取 3 条题材数据' },
      { key: 'news_flash', label: '新闻快讯', ok: true, count: 3, message: '已读取 3 条新闻数据' }
    ]
  }
};
