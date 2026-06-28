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
    const type = (row.type || row.kind || 'limit_up').trim();
    if (type === 'theme') {
      const name = row.themeName || row.theme || row.name;
      if (!name) continue;
      themes.set(name, {
        tradeDate,
        themeName: name,
        limitUpCount: numberValue(row.limitUpCount || row.limit_up_count, 0),
        boardCount: numberValue(row.boardCount || row.board_count, 0),
        leaderCode: row.leaderCode || row.leader_code,
        leaderName: row.leaderName || row.leader_name,
        rankNo: numberValue(row.rankNo || row.rank_no, themes.size + 1),
        heatScore: numberValue(row.heatScore || row.heat_score, undefined),
        source: 'csv',
        raw: row
      });
      continue;
    }

    if (type === 'news') {
      news.push({
        newsTime: row.newsTime || row.news_time || `${tradeDate} ${row.time || '09:30:00'}`,
        source: row.source || 'csv',
        title: row.title || row.name || '',
        content: row.content,
        relatedCodes: splitList(row.relatedCodes || row.related_codes || row.code),
        relatedThemes: splitList(row.relatedThemes || row.related_themes || row.theme),
        eventType: row.eventType || row.event_type,
        importanceScore: numberValue(row.importanceScore || row.importance_score, undefined),
        raw: row
      });
      continue;
    }

    limitUps.push({
      tradeDate,
      code: row.code,
      name: row.name,
      firstLimitTime: row.firstLimitTime || row.first_limit_time,
      lastLimitTime: row.lastLimitTime || row.last_limit_time,
      breakCount: numberValue(row.breakCount || row.break_count, 0),
      boardCount: numberValue(row.boardCount || row.board_count, 1),
      reason: row.reason,
      themes: splitList(row.themes || row.theme),
      amount: numberValue(row.amount, undefined),
      floatMarketCap: numberValue(row.floatMarketCap || row.float_market_cap, undefined),
      source: row.source || 'csv',
      raw: row
    });
  }

  const marketMood: MarketMood = {
    tradeDate,
    limitUpCount: limitUps.length,
    limitDownCount: 0,
    brokenLimitCount: 0,
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
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
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

function splitList(value?: string) {
  if (!value) return [];
  return value.split(/[|,，、;]/).map((item) => item.trim()).filter(Boolean);
}

function numberValue(value: unknown, fallback: number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
