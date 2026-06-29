import type { DailyReviewInput, NewsItem, ThemeRankItem } from '@chan-shuo/core';

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

export interface ProviderPreset {
  provider: string;
  baseUrl: string;
  model: string;
}

export const CLOUD_PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  deepseek: {
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat'
  },
  qwen: {
    provider: 'qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus'
  },
  openai: {
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
  },
  compatible: {
    provider: 'openai-compatible',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
  }
};

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

export class OllamaProvider implements LLMProvider {
  provider = 'ollama';

  constructor(
    public model = process.env.OLLAMA_MODEL || 'gemma3:4b',
    private baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
  ) {}

  async chat(input: LLMChatInput): Promise<LLMChatResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(input.system ? [{ role: 'system', content: input.system }] : []),
          { role: 'user', content: input.prompt }
        ],
        stream: false,
        options: { temperature: input.temperature ?? 0.2 }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { message?: { content?: string } };
    return { provider: this.provider, model: this.model, content: data.message?.content ?? '' };
  }
}

export class OpenAICompatibleProvider implements LLMProvider {
  provider: string;

  constructor(
    public model = resolveCloudPreset().model,
    private apiKey = process.env.LLM_API_KEY || '',
    private baseUrl = resolveCloudPreset().baseUrl,
    provider = resolveCloudPreset().provider
  ) {
    this.provider = provider;
  }

  async chat(input: LLMChatInput): Promise<LLMChatResult> {
    if (!this.apiKey) throw new Error('LLM_API_KEY is required for cloud provider');
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(input.system ? [{ role: 'system', content: input.system }] : []),
          { role: 'user', content: input.prompt }
        ],
        temperature: input.temperature ?? 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`${this.provider} request failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { provider: this.provider, model: this.model, content: data.choices?.[0]?.message?.content ?? '' };
  }
}

export function resolveCloudPreset(): ProviderPreset {
  const key = (process.env.LLM_PROVIDER || 'deepseek').toLowerCase();
  const preset = CLOUD_PROVIDER_PRESETS[key] ?? CLOUD_PROVIDER_PRESETS.compatible;
  return {
    provider: process.env.LLM_PROVIDER || preset.provider,
    baseUrl: process.env.LLM_BASE_URL || preset.baseUrl,
    model: process.env.LLM_MODEL || preset.model
  };
}

export function createProvider() {
  if (process.env.USE_OLLAMA === '1') return new OllamaProvider();
  if (process.env.USE_CLOUD_LLM === '1') return new OpenAICompatibleProvider();
  return new MockLLMProvider();
}

export async function testProvider(provider = createProvider()) {
  return provider.chat({ prompt: '请回复：模型连接正常。', temperature: 0 });
}

export function buildDailyReviewPrompt(input: DailyReviewInput) {
  return `你是A股消息派复盘员。请基于以下结构化数据生成复盘，不要编造数据，不要给确定性买卖建议。\n\n${JSON.stringify(input, null, 2)}\n\n输出结构：\n1. 今日市场情绪\n2. 今日主线题材\n3. 涨停梯队与赚钱效应\n4. 消息催化与扩散阶段\n5. 风险信号\n6. 明日观察计划`;
}

export function buildNewsClassificationPrompt(news: NewsItem) {
  return `请对以下消息做事件分类，输出 JSON，不要编造股票代码。\n\n${JSON.stringify(news, null, 2)}\n\n字段：event_type、themes、related_codes、impact_level、freshness、summary、risk。`;
}

export function buildThemeAnalysisPrompt(theme: ThemeRankItem, context: DailyReviewInput) {
  return `请分析题材状态，不要给确定性买卖建议。\n\n题材：${JSON.stringify(theme, null, 2)}\n\n市场上下文：${JSON.stringify(context, null, 2)}\n\n输出：题材阶段、证据、龙头观察、补涨观察、风险信号、明日验证条件。`;
}

export function buildNextDayPlanPrompt(input: DailyReviewInput) {
  return `请基于今日市场结构生成明日观察计划，必须使用条件句，不输出确定性买卖指令。\n\n${JSON.stringify(input, null, 2)}\n\n输出：总体情绪、重点题材、龙头晋级观察、低位补涨观察、风险回避条件、盘中触发提醒条件。`;
}
