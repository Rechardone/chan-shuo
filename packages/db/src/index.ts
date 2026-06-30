import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export * from './repository.js';

export function getDbPath() {
  return process.env.CHAN_SHUO_DB || resolveProjectPath('data/market-core.db');
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

function resolveProjectPath(relativePath: string) {
  return resolve(findWorkspaceRoot(), relativePath);
}

function findWorkspaceRoot() {
  const envRoot = process.env.CHAN_SHUO_ROOT;
  if (envRoot) return envRoot;

  let current = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml')) && existsSync(resolve(current, 'package.json'))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return process.cwd();
}
