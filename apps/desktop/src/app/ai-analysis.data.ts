export interface AiAnalysisView {
  id: number;
  tradeDate: string;
  targetType: string;
  targetId: string;
  taskType: string;
  provider: string;
  model: string;
  result: string;
  createdAt: string;
}

export const MOCK_AI_ANALYSES: AiAnalysisView[] = [
  {
    id: 1,
    tradeDate: '2026-06-28',
    targetType: 'market',
    targetId: '2026-06-28',
    taskType: 'daily_review',
    provider: 'mock',
    model: 'mock-reviewer',
    result: '今日市场情绪偏修复，机器人为主线候选，明日观察龙头晋级与炸板率变化。',
    createdAt: 'mock'
  }
];
