import { buildDailyReviewPrompt, buildNewsClassificationPrompt, buildNextDayPlanPrompt, buildThemeAnalysisPrompt, createProvider, testProvider } from '@chan-shuo/llm';
import { loadCsvPayload, loadJsonPayload, MockSource } from '@chan-shuo/sources';
import { initDb, loadDailyReviewInput, openDb, saveAiAnalysis, saveLimitUps, saveMarketMood, saveNews, saveThemeRanks } from '@chan-shuo/db';
import type { DailyReviewInput, TradeDate } from '@chan-shuo/core';

function dateArg(defaultDate = '2026-06-28'): TradeDate {
  return process.argv[3] ?? defaultDate;
}

function persistInput(input: DailyReviewInput) {
  const db = initDb();
  if (input.marketMood) saveMarketMood(db, input.marketMood);
  saveThemeRanks(db, input.topThemes);
  saveLimitUps(db, input.limitUps);
  saveNews(db, input.news);
  db.close();
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
  persistInput(input);
  console.log(`mock data saved: ${date}`);
}

function importJson(filePath: string) {
  const input = loadJsonPayload(filePath);
  persistInput(input);
  console.log(`json data imported: ${filePath} -> ${input.tradeDate}`);
}

function importCsv(filePath: string, tradeDate: TradeDate) {
  const input = loadCsvPayload(filePath, tradeDate);
  persistInput(input);
  console.log(`csv data imported: ${filePath} -> ${input.tradeDate}`);
}

async function runTask(date: TradeDate, task: 'daily_review' | 'next_day_plan' | 'news_classification' | 'theme_mapping') {
  const db = openDb();
  const input = loadDailyReviewInput(db, date);
  const provider = createProvider();
  const prompt = task === 'daily_review'
    ? buildDailyReviewPrompt(input)
    : task === 'next_day_plan'
      ? buildNextDayPlanPrompt(input)
      : task === 'news_classification'
        ? buildNewsClassificationPrompt(input.news[0])
        : buildThemeAnalysisPrompt(input.topThemes[0], input);
  const result = await provider.chat({ prompt, temperature: 0.2 });
  saveAiAnalysis(db, { tradeDate: date, targetType: task === 'news_classification' ? 'news' : task === 'theme_mapping' ? 'theme' : 'market', targetId: date, taskType: task, provider: result.provider, model: result.model, prompt, result: result.content });
  db.close();
  console.log(result.content);
}

const command = process.argv[2] ?? 'mock';
const date = dateArg();
if (command === 'mock') await saveMock(date);
else if (command === 'import:json') importJson(process.argv[3]);
else if (command === 'import:csv') importCsv(process.argv[3], process.argv[4] ?? '2026-06-28');
else if (command === 'ai:review') await runTask(date, 'daily_review');
else if (command === 'ai:plan') await runTask(date, 'next_day_plan');
else if (command === 'ai:news') await runTask(date, 'news_classification');
else if (command === 'ai:theme') await runTask(date, 'theme_mapping');
else if (command === 'ai:test') console.log((await testProvider()).content);
else throw new Error(`unknown command: ${command}`);
