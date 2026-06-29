CREATE TABLE IF NOT EXISTS stock (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  market TEXT,
  industry TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS limit_up_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_date TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  first_limit_time TEXT,
  last_limit_time TEXT,
  break_count INTEGER DEFAULT 0,
  board_count INTEGER DEFAULT 1,
  reason TEXT,
  themes TEXT,
  amount REAL,
  float_market_cap REAL,
  source TEXT,
  raw_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(trade_date, code)
);

CREATE TABLE IF NOT EXISTS limit_broken_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_date TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  high_pct REAL,
  broken_time TEXT,
  break_count INTEGER DEFAULT 0,
  close_pct REAL,
  themes TEXT,
  source TEXT,
  raw_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(trade_date, code)
);

CREATE TABLE IF NOT EXISTS theme_daily_rank (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_date TEXT NOT NULL,
  theme_name TEXT NOT NULL,
  limit_up_count INTEGER DEFAULT 0,
  board_count INTEGER DEFAULT 0,
  leader_code TEXT,
  leader_name TEXT,
  rank_no INTEGER,
  heat_score REAL,
  source TEXT,
  raw_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(trade_date, theme_name)
);

CREATE TABLE IF NOT EXISTS market_mood (
  trade_date TEXT PRIMARY KEY,
  limit_up_count INTEGER,
  limit_down_count INTEGER,
  broken_limit_count INTEGER,
  max_board_height INTEGER,
  seal_rate REAL,
  promotion_rate_1_to_2 REAL,
  promotion_rate_2_to_3 REAL,
  yesterday_limit_avg_return REAL,
  mood_score REAL,
  source TEXT,
  raw_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_flash (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  news_time TEXT,
  source TEXT,
  title TEXT NOT NULL,
  content TEXT,
  related_codes TEXT,
  related_themes TEXT,
  event_type TEXT,
  importance_score REAL,
  ai_summary TEXT,
  raw_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_date TEXT,
  target_type TEXT,
  target_id TEXT,
  task_type TEXT,
  provider TEXT,
  model TEXT,
  prompt TEXT,
  result TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_date TEXT NOT NULL,
  task TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_queue_status_created ON task_queue(status, created_at);

CREATE TABLE IF NOT EXISTS watchlist (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_name TEXT,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_note (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_date TEXT,
  title TEXT,
  content TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
