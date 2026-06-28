import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MoodCard {
  label: string;
  value: string | number;
  hint: string;
}

interface ThemeRow {
  rank: number;
  name: string;
  limitUpCount: number;
  leader: string;
  status: string;
}

interface LimitRow {
  board: string;
  name: string;
  theme: string;
  reason: string;
}

interface NewsRow {
  time: string;
  title: string;
  tag: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly tradeDate = '2026-06-28';
  readonly moodCards: MoodCard[] = [
    { label: '涨停', value: 78, hint: '短线活跃度' },
    { label: '跌停', value: 5, hint: '风险反馈' },
    { label: '炸板', value: 21, hint: '分歧强度' },
    { label: '高度', value: '5板', hint: '连板空间' },
    { label: '温度', value: 72, hint: '市场情绪' }
  ];

  readonly themes: ThemeRow[] = [
    { rank: 1, name: '机器人', limitUpCount: 14, leader: '样例机器人', status: '主线候选' },
    { rank: 2, name: 'PCB', limitUpCount: 9, leader: '样例PCB', status: '扩散观察' },
    { rank: 3, name: 'AI硬件', limitUpCount: 7, leader: '样例AI', status: '分歧中' }
  ];

  readonly limits: LimitRow[] = [
    { board: '五板', name: '高标样例', theme: '机器人', reason: '政策催化 + 梯队晋级' },
    { board: '三板', name: '样例机器人', theme: '减速器', reason: '人形机器人消息扩散' },
    { board: '二板', name: '样例PCB', theme: 'PCB', reason: 'AI硬件补涨' }
  ];

  readonly news: NewsRow[] = [
    { time: '09:12', title: '工信部发布机器人产业相关政策', tag: '政策扶持' },
    { time: '10:08', title: 'AI硬件方向盘中异动扩散', tag: '题材发酵' },
    { time: '13:37', title: '高位股出现分歧，炸板率上升', tag: '风险信号' }
  ];

  readonly aiSummary = '今日市场情绪偏修复，机器人为主线候选。明日重点观察龙头晋级、昨日涨停溢价与炸板率变化。';
}
