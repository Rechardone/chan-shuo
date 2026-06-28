import type { DailyReviewInput } from '@chan-shuo/core';

export interface LLMChatInput {
  system?: string;
  prompt: string;
  temperature?: number;
}

export interface LLMChatResult {
  provider: string;
  model: string;
  content: string;
}

export interface LLMProvider {
  provider: string;
  model: string;
  chat(input: LLMChatInput): Promise<LLMChatResult>;
}

export class MockLLMProvider implements LLMProvider {
  provider = 'mock';
  model = 'mock-reviewer';

  async chat(input: LLMChatInput): Promise<LLMChatResult> {
    return {
      provider: this.provider,
      model: this.model,
      content: [
        '【Mock AI 复盘】',
        '今日市场情绪偏修复，涨停数量与题材扩散显示短线资金活跃。',
        '机器人为当前主线候选，PCB/AI硬件作为扩散方向。',
        '明日重点观察：龙头晋级、昨日涨停溢价、炸板率是否继续下降。',
        '',
        '输入摘要：',
        input.prompt.slice(0, 400)
      ].join('\n')
    };
  }
}

export function buildDailyReviewPrompt(input: DailyReviewInput) {
  return `你是A股消息派复盘员。请基于以下结构化数据生成复盘，不要编造数据，不要给确定性买卖建议。\n\n${JSON.stringify(input, null, 2)}\n\n输出结构：\n1. 今日市场情绪\n2. 今日主线题材\n3. 涨停梯队与赚钱效应\n4. 消息催化与扩散阶段\n5. 风险信号\n6. 明日观察计划`;
}
