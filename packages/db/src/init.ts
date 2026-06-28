import { initDb, getDbPath } from './index.js';

const db = initDb();
db.close();
console.log(`database initialized: ${getDbPath()}`);
