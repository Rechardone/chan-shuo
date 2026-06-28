import { MockLLMProvider, buildDailyReviewPrompt } from '@chan-shuo/llm';
import { MockSource } from '@chan-shuo/sources';
import type { DailyReviewInput, TradeDate } from '@chan-shuo/core';

function getDateArg(defaultDate = '2026-06-28'): TradeDate {
  return process.argv[3] ?? defaultDate;
}

async function runMock(date: TradeDate) {
  const source = new MockSource();
  const [marketMood, topThemes, limitUps, news] = await Promise.all([
    source.fetchMarketMood(date),
    source.fetchThemeRank(date),
    source.fetchLimitUp(date),
    source.fetchNewsFlash(date)
  ]);
  console.log(JSON.stringify({ tradeDate: date, marketMood, topThemes, limitUps, news }, null, 2));
}

async function runReview(date: TradeDate) {
  const source = new MockSource();
  const input: DailyReviewInput = {
    tradeDate: date,
    marketMood: await source.fetchMarketMood(date),
    topThemes: await source.fetchThemeRank(date),
    limitUps: await source.fetchLimitUp(date),
    news: await source.fetchNewsFlash(date)
  };
  const llm = new MockLLMProvider();
  const prompt = buildDailyReviewPrompt(input);
  const result = await llm.chat({ prompt, temperature: 0.2 });
  console.log(result.content);
}

async function main() {
  const cmd = process.argv[2] ?? 'mock';
  const date = getDateArg();
  if (cmd === 'mock') return runMock(date);
  if (cmd === 'ai:review') return runReview(date);
  console.error(`unknown command: ${cmd}`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
