import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_DASHBOARD } from './market-dashboard.data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly vm = MOCK_DASHBOARD;
  readonly tradeDate = this.vm.tradeDate;
  readonly moodCards = this.vm.moodCards;
  readonly themes = this.vm.themes;
  readonly limits = this.vm.limits;
  readonly news = this.vm.news;
  readonly aiSummary = this.vm.aiSummary;
}
