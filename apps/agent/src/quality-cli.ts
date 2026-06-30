import { evaluateDataQuality } from '@chan-shuo/core';
import { loadDailyReviewInput, openDb } from '@chan-shuo/db';

const tradeDate = process.argv[2] ?? '2026-06-28';
const db = openDb();
const input = loadDailyReviewInput(db, tradeDate);
db.close();

const report = evaluateDataQuality(input);
console.log(report);
