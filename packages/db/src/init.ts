import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';

const dbPath = process.env.STOCK_AI_DB ?? 'data/market-core.db';
mkdirSync(dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.exec(readFileSync(resolve('packages/db/src/schema.sql'), 'utf8'));
db.close();
console.log(`database initialized: ${dbPath}`);
