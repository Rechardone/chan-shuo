import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel, MOCK_DASHBOARD } from './market-dashboard.data';
import { MarketDashboardService } from './market-dashboard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly dashboardService = inject(MarketDashboardService);

  vm: DashboardViewModel = MOCK_DASHBOARD;
  tradeDate = this.vm.tradeDate;
  moodCards = this.vm.moodCards;
  themes = this.vm.themes;
  limits = this.vm.limits;
  news = this.vm.news;
  aiSummary = this.vm.aiSummary;

  constructor() {
    this.dashboardService.loadDashboard().subscribe((vm) => this.applyViewModel(vm));
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
