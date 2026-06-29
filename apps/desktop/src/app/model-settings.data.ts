export type ModelRuntime = 'mock' | 'ollama' | 'cloud';

export interface ModelPresetView {
  id: string;
  name: string;
  runtime: ModelRuntime;
  provider: string;
  model: string;
  baseUrl?: string;
  costLevel: 'free-local' | 'low' | 'medium' | 'high';
  useCase: string;
  recommended: boolean;
}

export interface ModelSettingsViewModel {
  selectedPresetId: string;
  presets: ModelPresetView[];
  customProvider: string;
  customModel: string;
  customBaseUrl: string;
  apiKeySavedLocally: boolean;
}

export const MODEL_SETTINGS: ModelSettingsViewModel = {
  selectedPresetId: 'ollama-gemma3-4b',
  customProvider: 'compatible',
  customModel: '',
  customBaseUrl: '',
  apiKeySavedLocally: false,
  presets: [
    {
      id: 'mock',
      name: 'MockLLM 开发调试',
      runtime: 'mock',
      provider: 'mock',
      model: 'mock-reviewer',
      costLevel: 'free-local',
      useCase: '无模型环境下验证流程',
      recommended: true
    },
    {
      id: 'ollama-gemma3-4b',
      name: '本地 Gemma 3 4B',
      runtime: 'ollama',
      provider: 'ollama',
      model: 'gemma3:4b',
      baseUrl: 'http://127.0.0.1:11434',
      costLevel: 'free-local',
      useCase: '日常盘后复盘，速度快，成本低',
      recommended: true
    },
    {
      id: 'ollama-deepseek-r1-7b',
      name: '本地 DeepSeek R1 7B',
      runtime: 'ollama',
      provider: 'ollama',
      model: 'deepseek-r1:7b',
      baseUrl: 'http://127.0.0.1:11434',
      costLevel: 'free-local',
      useCase: '需要更强推理时使用',
      recommended: true
    },
    {
      id: 'ollama-qwen2.5-7b',
      name: '本地 Qwen 2.5 7B',
      runtime: 'ollama',
      provider: 'ollama',
      model: 'qwen2.5:7b',
      baseUrl: 'http://127.0.0.1:11434',
      costLevel: 'free-local',
      useCase: '中文复盘和格式化输出',
      recommended: true
    },
    {
      id: 'deepseek-api',
      name: 'DeepSeek API',
      runtime: 'cloud',
      provider: 'deepseek',
      model: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com',
      costLevel: 'low',
      useCase: '低成本云端补强',
      recommended: true
    },
    {
      id: 'qwen-api',
      name: 'Qwen-compatible API',
      runtime: 'cloud',
      provider: 'qwen',
      model: 'qwen-plus',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      costLevel: 'low',
      useCase: '稳定中文输出和 JSON 任务',
      recommended: true
    },
    {
      id: 'custom-compatible',
      name: '自定义兼容接口',
      runtime: 'cloud',
      provider: 'compatible',
      model: 'custom-model',
      baseUrl: 'https://your-provider.example.com/v1',
      costLevel: 'medium',
      useCase: '接入其他 OpenAI-compatible 服务',
      recommended: false
    }
  ]
};
