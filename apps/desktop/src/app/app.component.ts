import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel, MOCK_DASHBOARD } from './market-dashboard.data';
import { MarketDashboardService } from './market-dashboard.service';
import { MODEL_SETTINGS, ModelPresetView, ModelSettingsViewModel } from './model-settings.data';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisView } from './ai-analysis.data';
import { ModelConfigService } from './model-config.service';
import { AgentTask, AgentTaskResult, AgentTaskService } from './agent-task.service';
import { TaskLogService } from './task-log.service';
import { TaskLogView } from './task-log.data';
import { TaskQueueService } from './task-queue.service';
import { TaskQueueItemView } from './task-queue.data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly dashboardService = inject(MarketDashboardService);
  private readonly aiAnalysisService = inject(AiAnalysisService);
  private readonly modelConfigService = inject(ModelConfigService);
  private readonly agentTaskService = inject(AgentTaskService);
  private readonly taskLogService = inject(TaskLogService);
  private readonly taskQueueService = inject(TaskQueueService);

  vm: DashboardViewModel = MOCK_DASHBOARD;
  tradeDate = this.vm.tradeDate;
  moodCards = this.vm.moodCards;
  themes = this.vm.themes;
  limits = this.vm.limits;
  news = this.vm.news;
  aiSummary = this.vm.aiSummary;
  analyses: AiAnalysisView[] = [];
  taskLogs: TaskLogView[] = [];
  queueItems: TaskQueueItemView[] = [];
  configMessage = '模型配置尚未保存';
  taskRunning = false;
  taskMessage = 'AI 任务待执行';
  lastTaskResult?: AgentTaskResult;

  settings: ModelSettingsViewModel = MODEL_SETTINGS;
  selectedPreset = this.settings.presets.find((preset) => preset.id === this.settings.selectedPresetId) ?? this.settings.presets[0];

  constructor() {
    this.refreshDashboard();
    this.refreshAnalyses();
    this.refreshTaskLogs();
    this.refreshQueue();
    this.taskQueueService.items$.subscribe((items) => this.queueItems = items);
    this.modelConfigService.loadConfig().subscribe((config) => {
      this.configMessage = `已读取本地配置：${config.provider} / ${config.model}`;
    });
  }

  selectPreset(preset: ModelPresetView) {
    this.settings = { ...this.settings, selectedPresetId: preset.id };
    this.selectedPreset = preset;
  }

  saveSelectedPreset() {
    this.modelConfigService.saveConfig({
      runtime: this.selectedPreset.runtime,
      provider: this.selectedPreset.provider,
      model: this.selectedPreset.model,
      base_url: this.selectedPreset.baseUrl ?? '',
      api_key_saved_locally: false
    }).subscribe((config) => {
      this.configMessage = `已保存：${config.provider} / ${config.model}`;
    });
  }

  runTask(task: AgentTask) {
    this.taskRunning = true;
    this.taskMessage = `正在执行：${task}`;
    this.agentTaskService.runTask(task, this.tradeDate).subscribe((result) => {
      this.lastTaskResult = result;
      this.taskRunning = false;
      this.taskMessage = result.ok ? `执行完成：${result.command}` : `执行失败：${result.command}`;
      this.refreshDashboard();
      this.refreshAnalyses();
      this.refreshTaskLogs();
      this.refreshQueue();
    });
  }

  enqueueDailyWorkflow() {
    this.taskQueueService.enqueue(['review', 'plan', 'report'], this.tradeDate).subscribe(() => {
      this.taskMessage = '已加入 SQLite 持久队列：review -> plan -> report';
    });
  }

  runNextQueuedTask() {
    this.taskRunning = true;
    this.taskMessage = '正在执行 SQLite 队列下一条任务';
    this.taskQueueService.runNext().subscribe((result) => {
      this.lastTaskResult = result;
      this.taskRunning = false;
      this.taskMessage = result.ok ? `队列任务完成：${result.command}` : `队列任务失败：${result.command}`;
      this.refreshDashboard();
      this.refreshAnalyses();
      this.refreshTaskLogs();
      this.refreshQueue();
    });
  }

  refreshDashboard() {
    this.dashboardService.loadDashboard(this.tradeDate).subscribe((vm) => this.applyViewModel(vm));
  }

  refreshAnalyses() {
    this.aiAnalysisService.loadAnalyses(this.tradeDate).subscribe((items) => this.analyses = items);
  }

  refreshTaskLogs() {
    this.taskLogService.loadLogs().subscribe((items) => this.taskLogs = items);
  }

  refreshQueue() {
    this.taskQueueService.loadQueue().subscribe();
  }

  buildEnvPreview(preset = this.selectedPreset) {
    if (preset.runtime === 'mock') return 'MockLLM：无需环境变量';
    if (preset.runtime === 'ollama') {
      return [`USE_OLLAMA=1`, `OLLAMA_MODEL=${preset.model}`, `OLLAMA_BASE_URL=${preset.baseUrl}`].join('\n');
    }
    return [`USE_CLOUD_LLM=1`, `LLM_PROVIDER=${preset.provider}`, `LLM_BASE_URL=${preset.baseUrl}`, `LLM_MODEL=${preset.model}`, `LLM_API_KEY=你的本地密钥`].join('\n');
  }

  costLabel(level: ModelPresetView['costLevel']) {
    return {
      'free-local': '本地免费',
      low: '低成本',
      medium: '中等成本',
      high: '高成本'
    }[level];
  }

  private applyViewModel(vm: DashboardViewModel) {
    this.vm = vm;
    this.tradeDate = vm.tradeDate;
    this.moodCards = vm.moodCards;
    this.themes = vm.themes;
    this.limits = vm.limits;
    this.news = vm.news;
    this.aiSummary = vm.aiSummary;
  }
}
