import { readFileSync } from 'node:fs';
import type { DailyReviewInput, LimitUpItem, MarketMood, NewsItem, ThemeRankItem, TradeDate } from '@chan-shuo/core';

export interface ImportPayload extends DailyReviewInput {
  source?: string;
}

export function loadJsonPayload(filePath: string): ImportPayload {
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as Partial<ImportPayload>;
  if (!data.tradeDate) throw new Error('JSON import requires tradeDate');
  return normalizeImportPayload(data as ImportPayload);
}

export function loadCsvPayload(filePath: string, tradeDate: TradeDate): ImportPayload {
  const raw = readFileSync(filePath, 'utf8');
  const rows = parseCsv(raw);
  const limitUps: LimitUpItem[] = [];
  const themes = new Map<string, ThemeRankItem>();
  const news: NewsItem[] = [];

  for (const row of rows) {
    const type = cell(row.type, row.kind, 'limit_up');
    if (type === 'theme') {
      const name = cell(row.themeName, row.theme_name, row.theme, row.name);
      if (!name) continue;
      themes.set(name, {
        tradeDate,
        themeName: name,
        limitUpCount: requiredNumberValue(cell(row.limitUpCount, row.limit_up_count, row.limitUps, row.limit_ups, row.reason), 0),
        boardCount: numberValue(cell(row.boardCount, row.board_count, row.board, row.height), 0),
        leaderCode: cell(row.leaderCode, row.leader_code, row.leader),
        leaderName: cell(row.leaderName, row.leader_name),
        rankNo: numberValue(cell(row.rankNo, row.rank_no), themes.size + 1),
        heatScore: numberValue(cell(row.heatScore, row.heat_score, row.score), undefined),
        source: cell(row.source, 'csv'),
        raw: row
      });
      continue;
    }

    if (type === 'news') {
      const rawNewsTime = cell(row.newsTime, row.news_time, row.time, row.firstLimitTime, row.first_limit_time);
      news.push({
        newsTime: normalizeNewsTime(rawNewsTime, tradeDate),
        source: cell(row.source, 'csv'),
        title: cell(row.title, row.name),
        content: cell(row.content, row.reason),
        relatedCodes: splitList(cell(row.relatedCodes, row.related_codes, row.code)),
        relatedThemes: splitList(cell(row.relatedThemes, row.related_themes, row.themes, row.theme)),
        eventType: cell(row.eventType, row.event_type, row.type2),
        importanceScore: numberValue(cell(row.importanceScore, row.importance_score, row.score), undefined),
        raw: row
      });
      continue;
    }

    const code = cell(row.code);
    const name = cell(row.name);
    if (!code || !name) continue;

    limitUps.push({
      tradeDate,
      code,
      name,
      firstLimitTime: cell(row.firstLimitTime, row.first_limit_time, row.time),
      lastLimitTime: cell(row.lastLimitTime, row.last_limit_time),
      breakCount: numberValue(cell(row.breakCount, row.break_count), 0),
      boardCount: numberValue(cell(row.boardCount, row.board_count, row.board, row.height), 1),
      reason: cell(row.reason),
      themes: splitList(cell(row.themes, row.theme)),
      amount: numberValue(cell(row.amount), undefined),
      floatMarketCap: numberValue(cell(row.floatMarketCap, row.float_market_cap), undefined),
      source: cell(row.source, 'csv'),
      raw: row
    });
  }

  const marketMood: MarketMood = {
    tradeDate,
    limitUpCount: limitUps.length,
    limitDownCount: 0,
    brokenLimitCount: limitUps.reduce((sum, row) => sum + (row.breakCount && row.breakCount > 0 ? 1 : 0), 0),
    maxBoardHeight: limitUps.reduce((max, row) => Math.max(max, row.boardCount ?? 1), 0),
    source: 'csv'
  };

  return { tradeDate, marketMood, topThemes: [...themes.values()], limitUps, news, source: 'csv' };
}

export function normalizeImportPayload(payload: ImportPayload): ImportPayload {
  return {
    tradeDate: payload.tradeDate,
    marketMood: payload.marketMood,
    topThemes: payload.topThemes ?? [],
    limitUps: payload.limitUps ?? [],
    news: payload.news ?? [],
    source: payload.source ?? 'json'
  };
}

function parseCsv(raw: string): Array<Record<string, string>> {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const [headerLine, ...bodyLines] = lines;
  const headers = splitCsvLine(headerLine).map((h) => h.trim());
  return bodyLines.map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function cell(...values: Array<unknown>): string {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

function normalizeNewsTime(value: string, tradeDate: TradeDate): string {
  if (!value) return `${tradeDate} 09:30:00`;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) return `${tradeDate} ${value.length === 5 ? `${value}:00` : value}`;
  return `${tradeDate} ${value}`;
}

function splitList(value?: string) {
  if (!value) return [];
  return value.split(/[|,，、;]/).map((item) => item.trim()).filter(Boolean);
}

function requiredNumberValue(value: unknown, fallback: number): number {
  return numberValue(value, fallback) ?? fallback;
}

function numberValue(value: unknown, fallback: number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
