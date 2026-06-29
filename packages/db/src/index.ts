import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export * from './repository.js';

export function getDbPath() {
  return process.env.CHAN_SHUO_DB || 'data/market-core.db';
}

export function openDb(path = getDbPath()) {
  mkdirSync(dirname(path), { recursive: true });
  return new Database(path);
}

export function initDb(path = getDbPath()) {
  const db = openDb(path);
  const schema = readFileSync(resolvePackageSchemaPath(), 'utf8');
  db.exec(schema);
  return db;
}

function resolvePackageSchemaPath() {
  return resolve(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
}
