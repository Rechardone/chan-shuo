import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildDailyReviewPrompt, buildNewsClassificationPrompt, buildNextDayPlanPrompt, buildThemeAnalysisPrompt, createProvider, testProvider } from '@chan-shuo/llm';
import { loadCsvPayload, loadJsonPayload, MockSource } from '@chan-shuo/sources';
import { claimNextTask, enqueueTask, initDb, listTasks, loadDailyReviewInput, markTaskFailed, markTaskSuccess, openDb, saveAiAnalysis, saveLimitUps, saveMarketMood, saveNews, saveThemeRanks } from '@chan-shuo/db';
import { buildMarkdownReport, evaluateAlerts } from '@chan-shuo/core';
import type { DailyReviewInput, PersistentTaskType, TradeDate } from '@chan-shuo/core';

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
  if (task === 'news_classification' && input.news.length === 0) throw new Error(`no news rows for ${date}`);
  if (task === 'theme_mapping' && input.topThemes.length === 0) throw new Error(`no theme rows for ${date}`);
  const provider = createProvider();
  const prompt = task === 'daily_review'
    ? buildDailyReviewPrompt(input)
    : task === 'next_day_plan'
      ? buildNextDayPlanPrompt(input)
      : task === 'news_classification'
        ? buildNewsClassificationPrompt(input.news[0])
        : buildThemeAnalysisPrompt(input.topThemes[0], input);
  const result = await provider.chat({ prompt, temperature: 0.2 });
  saveAiAnalysis(db, { tradeDate: date, targetType: task === 'news_classification' ? 'news' : task === 'theme_mapping' ? 'theme' : task === 'next_day_plan' ? 'plan' : 'market', targetId: date, taskType: task, provider: result.provider, model: result.model, prompt, result: result.content });
  db.close();
  console.log(result.content);
}

function runAlerts(date: TradeDate) {
  const db = openDb();
  const input = loadDailyReviewInput(db, date);
  db.close();
  console.log(JSON.stringify(evaluateAlerts({ input }), null, 2));
}

function exportReport(date: TradeDate, outputPath = `reports/${date}.md`) {
  const db = openDb();
  const input = loadDailyReviewInput(db, date);
  const aiReview = loadLatestAnalysis(db, date, 'daily_review');
  const nextDayPlan = loadLatestAnalysis(db, date, 'next_day_plan');
  db.close();
  const alerts = evaluateAlerts({ input });
  const markdown = buildMarkdownReport({ input, alerts, aiReview, nextDayPlan });
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`markdown report exported: ${outputPath}`);
}

function addQueue(date: TradeDate, tasks: PersistentTaskType[]) {
  const db = initDb();
  const ids = tasks.map((task) => enqueueTask(db, { tradeDate: date, task, maxRetries: 1 }));
  db.close();
  console.log(JSON.stringify({ queued: ids }, null, 2));
}

function showQueue() {
  const db = initDb();
  const rows = listTasks(db, 50);
  db.close();
  console.log(JSON.stringify(rows, null, 2));
}

async function runQueueOnce() {
  const db = initDb();
  const item = claimNextTask(db);
  db.close();
  if (!item?.id) {
    console.log('no queued task');
    return;
  }
  try {
    await runPersistentTask(item.tradeDate, item.task);
    const nextDb = openDb();
    markTaskSuccess(nextDb, item.id);
    nextDb.close();
    console.log(`queue task success: ${item.id}`);
  } catch (error) {
    const nextDb = openDb();
    markTaskFailed(nextDb, item.id, error instanceof Error ? error.message : String(error));
    nextDb.close();
    throw error;
  }
}

async function runPersistentTask(date: TradeDate, task: PersistentTaskType) {
  if (task === 'review') return runTask(date, 'daily_review');
  if (task === 'plan') return runTask(date, 'next_day_plan');
  if (task === 'news') return runTask(date, 'news_classification');
  if (task === 'theme') return runTask(date, 'theme_mapping');
  if (task === 'alerts') return runAlerts(date);
  if (task === 'report') return exportReport(date);
}

function loadLatestAnalysis(db: ReturnType<typeof openDb>, date: string, taskType: string): string | undefined {
  const row = db.prepare('SELECT result FROM ai_analysis WHERE trade_date = ? AND task_type = ? ORDER BY id DESC LIMIT 1').get(date, taskType) as { result?: string } | undefined;
  return row?.result;
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
else if (command === 'alerts') runAlerts(date);
else if (command === 'report:md') exportReport(date, process.argv[4]);
else if (command === 'queue:add') addQueue(date, (process.argv[4]?.split(',') as PersistentTaskType[]) ?? ['review', 'plan', 'report']);
else if (command === 'queue:list') showQueue();
else if (command === 'queue:run-once') await runQueueOnce();
else if (command === 'ai:test') console.log((await testProvider()).content);
else throw new Error(`unknown command: ${command}`);
