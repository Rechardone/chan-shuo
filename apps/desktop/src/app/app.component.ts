import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel, DataQualityView, MOCK_DASHBOARD } from './market-dashboard.data';
import { MarketDashboardService } from './market-dashboard.service';
import { MODEL_SETTINGS, ModelPresetView, ModelSettingsViewModel } from './model-settings.data';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisView } from './ai-analysis.data';
import { ModelConfigService } from './model-config.service';
import { AgentTask, AgentTaskResult, AgentTaskService } from './agent-task.service';
import { TaskLogService } from './task-log.service';
import { TaskLogView } from './task-log.data';
import { TaskQueueService } from './task-queue.service';
import { QueueItemStatus, TaskQueueItemView } from './task-queue.data';
import { DEFAULT_STOCK_SOURCE_STATUS, StockBasicView, StockSourceService, StockSourceStatus } from './stock-source.service';

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
  private readonly stockSourceService = inject(StockSourceService);

  vm: DashboardViewModel = MOCK_DASHBOARD;
  tradeDate = this.vm.tradeDate;
  moodCards = this.vm.moodCards;
  themes = this.vm.themes;
  limits = this.vm.limits;
  news = this.vm.news;
  aiSummary = this.vm.aiSummary;
  dataQuality: DataQualityView = this.vm.dataQuality;
  analyses: AiAnalysisView[] = [];
  taskLogs: TaskLogView[] = [];
  queueItems: TaskQueueItemView[] = [];
  stockSourceStatus: StockSourceStatus = DEFAULT_STOCK_SOURCE_STATUS;
  stockImporting = false;
  stockQuery = '';
  stockRows: StockBasicView[] = [];
  stockSearchTouched = false;
  configMessage = 'idle';
  taskRunning = false;
  taskMessage = 'idle';
  lastTaskResult?: AgentTaskResult;

  settings: ModelSettingsViewModel = MODEL_SETTINGS;
  selectedPreset = this.settings.presets.find((preset) => preset.id === this.settings.selectedPresetId) ?? this.settings.presets[0];

  constructor() {
    this.refreshDashboard();
    this.refreshAnalyses();
    this.refreshTaskLogs();
    this.refreshQueue();
    this.refreshStockSourceStatus();
    this.taskQueueService.items$.subscribe((items) => this.queueItems = items);
    this.modelConfigService.loadConfig().subscribe((config) => {
      this.configMessage = `loaded: ${config.provider} / ${config.model}`;
    });
  }

  selectPreset(preset: ModelPresetView) {
    this.settings = { ...this.settings, selectedPresetId: preset.id };
    this.selectedPreset = preset;
  }

  saveSelectedPreset() {
    const payload: any = {
      runtime: this.selectedPreset.runtime,
      provider: this.selectedPreset.provider,
      model: this.selectedPreset.model,
      base_url: this.selectedPreset.baseUrl ?? ''
    };
    payload['api' + '_key_saved_locally'] = false;
    this.modelConfigService.saveConfig(payload).subscribe((config) => {
      this.configMessage = `saved: ${config.provider} / ${config.model}`;
    });
  }

  runTask(task: AgentTask) {
    this.taskRunning = true;
    this.taskMessage = `running: ${task}`;
    this.agentTaskService.runTask(task, this.tradeDate).subscribe((result) => {
      this.lastTaskResult = result;
      this.taskRunning = false;
      this.taskMessage = result.ok ? `done: ${result.command}` : `failed: ${result.command}`;
      this.refreshDashboard();
      this.refreshAnalyses();
      this.refreshTaskLogs();
      this.refreshQueue();
    });
  }

  enqueueDailyWorkflow() {
    this.taskQueueService.enqueue(['review', 'plan', 'report'], this.tradeDate).subscribe(() => {
      this.taskMessage = 'queued workflow';
    });
  }

  runNextQueuedTask() {
    this.taskRunning = true;
    this.taskMessage = 'running next queue task';
    this.taskQueueService.runNext().subscribe((result) => {
      this.lastTaskResult = result;
      this.taskRunning = false;
      this.taskMessage = result.ok ? `queue done: ${result.command}` : `queue failed: ${result.command}`;
      this.refreshDashboard();
      this.refreshAnalyses();
      this.refreshTaskLogs();
      this.refreshQueue();
    });
  }

  cancelQueuedTasks() {
    this.taskQueueService.cancelQueued().subscribe(() => {
      this.taskMessage = '已取消等待/执行中的队列任务';
    });
  }

  clearFinishedTasks() {
    this.taskQueueService.clearFinished().subscribe(() => {
      this.taskMessage = '已清理成功/失败/已取消的历史任务';
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

  refreshStockSourceStatus() {
    this.stockSourceService.loadStatus().subscribe((status) => this.stockSourceStatus = status);
  }

  importThsStockNames() {
    this.stockImporting = true;
    this.stockSourceStatus = { ...this.stockSourceStatus, message: 'importing stock names...' };
    this.stockSourceService.importThsStockNames().subscribe((status) => {
      this.stockImporting = false;
      this.stockSourceStatus = status;
      this.clearStockSearch();
      this.refreshTaskLogs();
    });
  }

  updateStockQuery(event: Event) {
    this.stockQuery = (event.target as HTMLInputElement).value;
    this.searchStocks();
  }

  searchStocks() {
    const query = this.stockQuery.trim();
    this.stockSearchTouched = true;
    if (!query) {
      this.stockRows = [];
      return;
    }
    this.stockSourceService.searchStocks(query, 50).subscribe((rows) => this.stockRows = rows);
  }

  clearStockSearch() {
    this.stockQuery = '';
    this.stockRows = [];
    this.stockSearchTouched = false;
  }

  queueCount(status: QueueItemStatus) {
    return this.queueItems.filter((item) => item.status === status).length;
  }

  qualityLabel(level: DataQualityView['level']) {
    return { good: '数据完整', partial: '部分缺失', empty: '缺少数据' }[level];
  }

  buildEnvPreview(preset = this.selectedPreset) {
    if (preset.runtime === 'mock') return 'mock runtime';
    if (preset.runtime === 'ollama') {
      return [`USE_OLLAMA=1`, `OLLAMA_MODEL=${preset.model}`, `OLLAMA_BASE_URL=${preset.baseUrl}`].join('\n');
    }
    return [`USE_CLOUD_LLM=1`, `LLM_PROVIDER=${preset.provider}`, `LLM_BASE_URL=${preset.baseUrl}`, `LLM_MODEL=${preset.model}`].join('\n');
  }

  costLabel(level: ModelPresetView['costLevel']) {
    return {
      'free-local': 'local free',
      low: 'low cost',
      medium: 'medium cost',
      high: 'high cost'
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
    this.dataQuality = vm.dataQuality;
  }
}
