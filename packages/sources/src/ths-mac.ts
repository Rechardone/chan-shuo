import { readFileSync } from 'node:fs';
import { TextDecoder } from 'node:util';

export interface ThsMacStockNameEntry {
  code: string;
  name: string;
  alias?: string;
  section: string;
  market: 'sz' | 'sh' | 'bj' | 'unknown';
  kind: 'stock' | 'index' | 'fund' | 'bond' | 'unknown';
  raw: string;
}

export interface ThsMacStockNameParseResult {
  configVersion?: string;
  entries: ThsMacStockNameEntry[];
}

export function loadThsMacStockNameIni(filePath: string): ThsMacStockNameParseResult {
  return parseThsMacStockNameIni(readFileSync(filePath));
}

export function parseThsMacStockNameIni(raw: Buffer | Uint8Array | string): ThsMacStockNameParseResult {
  const text = typeof raw === 'string' ? raw : decodeGb18030(raw);
  const entries: ThsMacStockNameEntry[] = [];
  let section = 'default';
  let configVersion: string | undefined;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    if (line.startsWith('[') && line.endsWith(']')) {
      section = line.slice(1, -1);
      continue;
    }

    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (key === 'ConfigVer') {
      configVersion = value;
      continue;
    }
    if (!/^\d{6}$/.test(key) || !value) continue;

    const [display = '', aliasRaw = ''] = value.split('|');
    const name = cleanupStockName(display.split('@')[0] ?? '');
    const alias = cleanupStockName(aliasRaw.split('@')[0] ?? '');
    if (!name) continue;

    entries.push({
      code: key,
      name,
      alias: alias || undefined,
      section,
      market: inferMarket(key, section),
      kind: inferKind(key, name, section),
      raw: value
    });
  }

  return { configVersion, entries };
}

export function filterAStockEntries(entries: ThsMacStockNameEntry[]): ThsMacStockNameEntry[] {
  return entries.filter((entry) => entry.kind === 'stock' && entry.market !== 'unknown');
}

function decodeGb18030(raw: Buffer | Uint8Array): string {
  return new TextDecoder('gb18030').decode(raw);
}

function cleanupStockName(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function inferMarket(code: string, section: string): ThsMacStockNameEntry['market'] {
  if (section.endsWith('_33') || /^6\d{5}$/.test(code)) return 'sh';
  if (section.endsWith('_32') || /^(0|1|2|3)\d{5}$/.test(code)) return 'sz';
  if (section.endsWith('_35') || /^(4|8|9)\d{5}$/.test(code)) return 'bj';
  return 'unknown';
}

function inferKind(code: string, name: string, section: string): ThsMacStockNameEntry['kind'] {
  if (section.endsWith('_32')) {
    if (/^(000|001|002|003|300|301)\d{3}$/.test(code)) return 'stock';
    if (/^(159|160|161|162|163|164|165|166|167|168|169)\d{3}$/.test(code)) return 'fund';
    if (/^(10|11|12)\d{4}$/.test(code)) return 'bond';
    return 'index';
  }

  if (section.endsWith('_33')) {
    if (/^(600|601|603|605|688|689)\d{3}$/.test(code)) return 'stock';
    if (/^(510|511|512|513|515|516|517|518|519|588|589)\d{3}$/.test(code)) return 'fund';
    if (/^(110|113|118)\d{3}$/.test(code)) return 'bond';
    return 'index';
  }

  if (section.endsWith('_35')) {
    if (/^(43|83|87|88|92)\d{4}$/.test(code)) return 'stock';
    return 'unknown';
  }

  if (/退|债|ETF|LOF|基金|指数|转债/.test(name)) return 'unknown';
  return 'unknown';
}
