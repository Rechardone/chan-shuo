import type { BrokenLimitItem, LimitUpItem, MarketMood, MarketSource, NewsItem, ThemeRankItem, TradeDate } from '@chan-shuo/core';
export * from './importers.js';
export * from './ths-mac.js';

export class MockSource implements MarketSource {
  name = 'mock';

  async fetchLimitUp(date: TradeDate): Promise<LimitUpItem[]> {
    return [
      { tradeDate: date, code: '300001', name: '样例机器人', firstLimitTime: '09:42', lastLimitTime: '14:51', breakCount: 1, boardCount: 3, reason: '机器人政策催化', themes: ['机器人', '减速器'], amount: 12.3, floatMarketCap: 86, source: this.name },
      { tradeDate: date, code: '002001', name: '样例PCB', firstLimitTime: '10:18', lastLimitTime: '10:18', breakCount: 0, boardCount: 2, reason: 'AI硬件扩散', themes: ['PCB', 'AI硬件'], amount: 9.2, floatMarketCap: 64, source: this.name }
    ];
  }

  async fetchBrokenLimit(date: TradeDate): Promise<BrokenLimitItem[]> {
    return [
      { tradeDate: date, code: '600001', name: '样例炸板', highPct: 10.0, brokenTime: '13:37', breakCount: 2, closePct: 6.2, themes: ['消费电子'], source: this.name }
    ];
  }

  async fetchMarketMood(date: TradeDate): Promise<MarketMood> {
    return { tradeDate: date, limitUpCount: 78, limitDownCount: 5, brokenLimitCount: 21, maxBoardHeight: 5, sealRate: 78.8, promotionRate1To2: 18.2, promotionRate2To3: 11.6, yesterdayLimitAvgReturn: 2.1, moodScore: 72, source: this.name };
  }

  async fetchNewsFlash(date: TradeDate): Promise<NewsItem[]> {
    return [
      { newsTime: `${date} 09:12:00`, source: 'mock-news', title: '工信部发布机器人产业相关政策', content: '政策推动机器人产业链标准化与应用落地。', relatedThemes: ['机器人', '人形机器人'], eventType: '政策扶持', importanceScore: 4 }
    ];
  }

  async fetchThemeRank(date: TradeDate): Promise<ThemeRankItem[]> {
    return [
      { tradeDate: date, themeName: '机器人', limitUpCount: 14, boardCount: 4, leaderCode: '300001', leaderName: '样例机器人', rankNo: 1, heatScore: 92, source: this.name },
      { tradeDate: date, themeName: 'PCB', limitUpCount: 9, boardCount: 2, leaderCode: '002001', leaderName: '样例PCB', rankNo: 2, heatScore: 83, source: this.name }
    ];
  }
}
