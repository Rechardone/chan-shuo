import { MockLLMProvider, buildDailyReviewPrompt } from '@chan-shuo/llm';
import { MockSource } from '@chan-shuo/sources';
import { initDb, loadDailyReviewInput, openDb, saveAiAnalysis, saveLimitUps, saveMarketMood, saveNews, saveThemeRanks } from '@chan-shuo/db';
import type { DailyReviewInput, TradeDate } from '@chan-shuo/core';

function dateArg(defaultDate = '2026-06-28'): TradeDate {
  return process.argv[3] ?? defaultDate;
}

async function collectMock(date: TradeDate): Promise<DailyReviewInput> {
  const source = new MockSource();
  const marketMood = await source.fetchMarketMood(date);
  const topThemes = await source.fetchThemeRank(date);
  const limitUps = await source.fetchLimitUp(date);
  const news = await source.fetchNewsFlash(date);
  return { tradeDate: date, marketMood, topThemes, limitUps, news };
}

async function saveMock(date: TradeDate) {
  const input = await collectMock(date);
  const db = initDb();
  saveMarketMood(db, input.marketMood!);
  saveThemeRanks(db, input.topThemes);
  saveLimitUps(db, input.limitUps);
  saveNews(db, input.news);
  db.close();
  console.log(`mock data saved: ${date}`);
}

async function review(date: TradeDate) {
  const db = openDb();
  const input = loadDailyReviewInput(db, date);
  const prompt = buildDailyReviewPrompt(input);
  const result = await new MockLLMProvider().chat({ prompt, temperature: 0.2 });
  saveAiAnalysis(db, { tradeDate: date, targetType: 'market', targetId: date, taskType: 'daily_review', provider: result.provider, model: result.model, prompt, result: result.content });
  db.close();
  console.log(result.content);
}

const command = process.argv[2] ?? 'mock';
const date = dateArg();
if (command === 'mock') await saveMock(date);
else if (command === 'ai:review') await review(date);
else throw new Error(`unknown command: ${command}`);
