export interface StoredReviewData {
  tradeDate: string;
  marketMood?: unknown;
  topThemes: unknown[];
  limitUps: unknown[];
  news: unknown[];
}

export function normalizeReviewData(input: Partial<StoredReviewData>): StoredReviewData {
  return {
    tradeDate: input.tradeDate ?? new Date().toISOString().slice(0, 10),
    marketMood: input.marketMood,
    topThemes: input.topThemes ?? [],
    limitUps: input.limitUps ?? [],
    news: input.news ?? []
  };
}
