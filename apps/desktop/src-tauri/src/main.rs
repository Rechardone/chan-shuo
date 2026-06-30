use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize)]
struct MoodCard { label: String, value: serde_json::Value, hint: String }

#[derive(Serialize)]
struct ThemeRow { rank: i64, name: String, limit_up_count: i64, leader: String, status: String }

#[derive(Serialize)]
struct LimitRow { board: String, name: String, theme: String, reason: String }

#[derive(Serialize)]
struct NewsRow { time: String, title: String, tag: String }

#[derive(Serialize)]
struct DashboardPayload {
    trade_date: String,
    mood_cards: Vec<MoodCard>,
    themes: Vec<ThemeRow>,
    limits: Vec<LimitRow>,
    news: Vec<NewsRow>,
    ai_summary: String,
}

#[derive(Serialize)]
struct AiAnalysisRow {
    id: i64,
    trade_date: String,
    target_type: String,
    target_id: String,
    task_type: String,
    provider: String,
    model: String,
    result: String,
    created_at: String,
}

#[derive(Serialize)]
struct AgentTaskResult { ok: bool, command: String, stdout: String, stderr: String }

#[derive(Serialize)]
struct PersistentTaskRow {
    id: i64,
    trade_date: String,
    task: String,
    status: String,
    retry_count: i64,
    max_retries: i64,
    last_error: String,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize)]
struct StockSourceStatus {
    default_path: String,
    file_exists: bool,
    stock_count: i64,
    message: String,
}

#[derive(Serialize)]
struct StockBasicRow {
    code: String,
    name: String,
    market: String,
    industry: String,
    updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct TaskLogEntry {
    id: String,
    task: String,
    trade_date: String,
    command: String,
    ok: bool,
    stdout: String,
    stderr: String,
    created_at: String,
}

#[derive(Serialize, Deserialize)]
struct ModelConfig {
    runtime: String,
    provider: String,
    model: String,
    base_url: String,
    api_key_saved_locally: bool,
}

impl Default for ModelConfig {
    fn default() -> Self {
        Self {
            runtime: "ollama".into(),
            provider: "ollama".into(),
            model: "gemma3:4b".into(),
            base_url: "http://127.0.0.1:11434".into(),
            api_key_saved_locally: false,
        }
    }
}

fn workspace_root() -> PathBuf {
    let mut current = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    for _ in 0..8 {
        if current.join("pnpm-workspace.yaml").exists() && current.join("package.json").exists() {
            return current;
        }
        if !current.pop() { break; }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

fn project_data_path(file_name: &str) -> PathBuf {
    workspace_root().join("data").join(file_name)
}

fn open_db(db_path: Option<String>) -> Result<Connection, String> {
    let path = db_path.map(PathBuf::from).unwrap_or_else(|| project_data_path("market-core.db"));
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    Connection::open(path).map_err(|err| err.to_string())
}

fn config_path() -> PathBuf { project_data_path("model-config.json") }
fn task_log_path() -> PathBuf { project_data_path("task-log.json") }
fn now_id() -> String {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs().to_string()
}

#[tauri::command]
fn load_dashboard_from_sqlite(db_path: Option<String>, trade_date: String) -> Result<DashboardPayload, String> {
    let conn = open_db(db_path)?;
    let mood = conn
        .prepare("SELECT limit_up_count, limit_down_count, broken_limit_count, max_board_height, mood_score FROM market_mood WHERE trade_date = ?")
        .map_err(|err| err.to_string())?
        .query_row([trade_date.as_str()], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?, row.get::<_, i64>(2)?, row.get::<_, i64>(3)?, row.get::<_, Option<f64>>(4)?))
        })
        .optional()
        .map_err(|err| err.to_string())?
        .unwrap_or((0, 0, 0, 0, Some(0.0)));

    let themes = load_themes(&conn, &trade_date)?;
    let limits = load_limits(&conn, &trade_date)?;
    let news = load_news(&conn, &trade_date)?;
    let ai_summary = load_latest_ai_summary(&conn, &trade_date)?.unwrap_or_else(|| {
        format!("已从本地 SQLite 读取：题材 {} 个，涨停 {} 只，消息 {} 条。", themes.len(), limits.len(), news.len())
    });

    Ok(DashboardPayload {
        trade_date,
        mood_cards: vec![
            MoodCard { label: "涨停".into(), value: mood.0.into(), hint: "短线活跃度".into() },
            MoodCard { label: "跌停".into(), value: mood.1.into(), hint: "风险反馈".into() },
            MoodCard { label: "炸板".into(), value: mood.2.into(), hint: "分歧强度".into() },
            MoodCard { label: "高度".into(), value: format!("{}板", mood.3).into(), hint: "连板空间".into() },
            MoodCard { label: "温度".into(), value: mood.4.unwrap_or_default().into(), hint: "市场情绪".into() },
        ],
        themes,
        limits,
        news,
        ai_summary,
    })
}

#[tauri::command]
fn load_ai_analyses(db_path: Option<String>, trade_date: String) -> Result<Vec<AiAnalysisRow>, String> {
    let conn = open_db(db_path)?;
    let mut stmt = conn
        .prepare("SELECT id, COALESCE(trade_date, ''), target_type, COALESCE(target_id, ''), task_type, provider, model, result, created_at FROM ai_analysis WHERE trade_date = ? ORDER BY id DESC LIMIT 20")
        .map_err(|err| err.to_string())?;
    let rows = stmt
        .query_map([trade_date.as_str()], |row| {
            Ok(AiAnalysisRow {
                id: row.get(0)?, trade_date: row.get(1)?, target_type: row.get(2)?, target_id: row.get(3)?, task_type: row.get(4)?,
                provider: row.get(5)?, model: row.get(6)?, result: row.get(7)?, created_at: row.get(8)?,
            })
        })
        .map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

#[tauri::command]
fn run_agent_task(task: String, trade_date: String) -> Result<AgentTaskResult, String> {
    let script = match task.as_str() {
        "review" => "review",
        "plan" => "plan",
        "news" => "news",
        "theme" => "theme",
        "alerts" => "alerts",
        "report" => "report:md",
        _ => return Err(format!("unsupported agent task: {}", task)),
    };
    let command = format!("pnpm --filter @chan-shuo/agent {} {}", script, trade_date);
    let output = Command::new("pnpm").current_dir(workspace_root()).args(["--filter", "@chan-shuo/agent", script, trade_date.as_str()]).output().map_err(|err| err.to_string())?;
    let result = AgentTaskResult {
        ok: output.status.success(),
        command: command.clone(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
    };
    append_task_log(TaskLogEntry {
        id: now_id(),
        task,
        trade_date,
        command,
        ok: result.ok,
        stdout: result.stdout.clone(),
        stderr: result.stderr.clone(),
        created_at: now_id(),
    })?;
    Ok(result)
}

#[tauri::command]
fn enqueue_persistent_tasks(db_path: Option<String>, trade_date: String, tasks: Vec<String>) -> Result<Vec<PersistentTaskRow>, String> {
    let conn = open_db(db_path)?;
    for task in tasks {
        validate_queue_task(&task)?;
        conn.prepare("INSERT INTO task_queue (trade_date, task, status, retry_count, max_retries) VALUES (?, ?, 'queued', 0, 1)")
            .map_err(|err| err.to_string())?
            .execute(params![trade_date.as_str(), task.as_str()])
            .map_err(|err| err.to_string())?;
    }
    load_persistent_tasks_from_conn(&conn, 50)
}

#[tauri::command]
fn load_persistent_tasks(db_path: Option<String>) -> Result<Vec<PersistentTaskRow>, String> {
    let conn = open_db(db_path)?;
    load_persistent_tasks_from_conn(&conn, 50)
}

#[tauri::command]
fn cancel_queued_tasks(db_path: Option<String>) -> Result<Vec<PersistentTaskRow>, String> {
    let conn = open_db(db_path)?;
    conn.prepare("UPDATE task_queue SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE status IN ('queued', 'running')")
        .map_err(|err| err.to_string())?
        .execute([])
        .map_err(|err| err.to_string())?;
    load_persistent_tasks_from_conn(&conn, 50)
}

#[tauri::command]
fn clear_finished_tasks(db_path: Option<String>) -> Result<Vec<PersistentTaskRow>, String> {
    let conn = open_db(db_path)?;
    conn.prepare("DELETE FROM task_queue WHERE status IN ('success', 'failed', 'cancelled')")
        .map_err(|err| err.to_string())?
        .execute([])
        .map_err(|err| err.to_string())?;
    load_persistent_tasks_from_conn(&conn, 50)
}

#[tauri::command]
fn run_next_persistent_task() -> Result<AgentTaskResult, String> {
    let command = "pnpm --filter @chan-shuo/agent queue:run-once".to_string();
    let output = Command::new("pnpm")
        .current_dir(workspace_root())
        .args(["--filter", "@chan-shuo/agent", "queue:run-once"])
        .output()
        .map_err(|err| err.to_string())?;
    Ok(AgentTaskResult {
        ok: output.status.success(),
        command,
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
    })
}

#[tauri::command]
fn load_stock_source_status(db_path: Option<String>) -> Result<StockSourceStatus, String> {
    let default_path = default_ths_stockname_path();
    let file_exists = default_path.exists();
    let stock_count = open_db(db_path).map(|conn| count_stock_rows(&conn)).unwrap_or(0);
    let message = if stock_count > 0 && file_exists {
        format!("已导入股票基础库 {} 条，且可访问 Mac 同花顺默认路径", stock_count)
    } else if stock_count > 0 {
        format!("已导入股票基础库 {} 条；当前 App 无权限或无法直接访问 Mac 同花顺容器路径", stock_count)
    } else if file_exists {
        "检测到 Mac 同花顺股票基础库，可点击导入".into()
    } else {
        "未检测到 Mac 同花顺股票基础库，可能是未安装、路径不同，或 App 没有访问权限".into()
    };
    Ok(StockSourceStatus { default_path: default_path.to_string_lossy().to_string(), file_exists, stock_count, message })
}

#[tauri::command]
fn search_stocks(db_path: Option<String>, query: String, limit: Option<i64>) -> Result<Vec<StockBasicRow>, String> {
    let conn = open_db(db_path)?;
    let safe_limit = limit.unwrap_or(50).clamp(1, 200);
    let keyword = query.trim().to_string();
    if keyword.is_empty() {
        load_stock_rows(&conn, safe_limit)
    } else {
        search_stock_rows(&conn, &keyword, safe_limit)
    }
}

#[tauri::command]
fn import_ths_stock_names(path: Option<String>) -> Result<StockSourceStatus, String> {
    let stock_path = path.map(PathBuf::from).unwrap_or_else(default_ths_stockname_path);
    let command = format!("pnpm --filter @chan-shuo/agent import:ths-stockname {}", stock_path.to_string_lossy());
    let output = Command::new("pnpm")
        .current_dir(workspace_root())
        .args(["--filter", "@chan-shuo/agent", "import:ths-stockname", stock_path.to_string_lossy().as_ref()])
        .output()
        .map_err(|err| err.to_string())?;
    append_task_log(TaskLogEntry {
        id: now_id(),
        task: "import:ths-stockname".into(),
        trade_date: "stock-basic".into(),
        command,
        ok: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        created_at: now_id(),
    })?;
    if !output.status.success() {
        return Err(format!("{}\n{}", String::from_utf8_lossy(&output.stderr), String::from_utf8_lossy(&output.stdout)));
    }
    load_stock_source_status(None)
}

#[tauri::command]
fn load_task_logs() -> Result<Vec<TaskLogEntry>, String> {
    let path = task_log_path();
    if !path.exists() { return Ok(vec![]); }
    let raw = fs::read_to_string(path).map_err(|err| err.to_string())?;
    let mut logs = serde_json::from_str::<Vec<TaskLogEntry>>(&raw).map_err(|err| err.to_string())?;
    logs.reverse();
    Ok(logs.into_iter().take(50).collect())
}

#[tauri::command]
fn load_model_config() -> Result<ModelConfig, String> {
    let path = config_path();
    if !path.exists() { return Ok(ModelConfig::default()); }
    let raw = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&raw).map_err(|err| err.to_string())
}

#[tauri::command]
fn save_model_config(config: ModelConfig) -> Result<ModelConfig, String> {
    let path = config_path();
    if let Some(parent) = path.parent() { fs::create_dir_all(parent).map_err(|err| err.to_string())?; }
    let safe_config = ModelConfig { api_key_saved_locally: false, ..config };
    let raw = serde_json::to_string_pretty(&safe_config).map_err(|err| err.to_string())?;
    fs::write(path, raw).map_err(|err| err.to_string())?;
    Ok(safe_config)
}

fn append_task_log(entry: TaskLogEntry) -> Result<(), String> {
    let path = task_log_path();
    if let Some(parent) = path.parent() { fs::create_dir_all(parent).map_err(|err| err.to_string())?; }
    let mut logs = if path.exists() {
        let raw = fs::read_to_string(&path).map_err(|err| err.to_string())?;
        serde_json::from_str::<Vec<TaskLogEntry>>(&raw).unwrap_or_default()
    } else { vec![] };
    logs.push(entry);
    if logs.len() > 200 { logs = logs.split_off(logs.len() - 200); }
    let raw = serde_json::to_string_pretty(&logs).map_err(|err| err.to_string())?;
    fs::write(path, raw).map_err(|err| err.to_string())
}

fn validate_queue_task(task: &str) -> Result<(), String> {
    match task {
        "review" | "plan" | "news" | "theme" | "alerts" | "report" => Ok(()),
        _ => Err(format!("unsupported queue task: {}", task)),
    }
}

fn count_stock_rows(conn: &Connection) -> i64 {
    conn.query_row("SELECT COUNT(*) FROM stock", [], |row| row.get(0)).unwrap_or(0)
}

fn default_ths_stockname_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_default();
    PathBuf::from(home).join("Library/Containers/cn.com.10jqka.macstockPro/Data/Documents/stockname/32_0_base.ini")
}

fn load_persistent_tasks_from_conn(conn: &Connection, limit: i64) -> Result<Vec<PersistentTaskRow>, String> {
    let mut stmt = conn
        .prepare("SELECT id, trade_date, task, status, retry_count, max_retries, COALESCE(last_error, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM task_queue ORDER BY id DESC LIMIT ?")
        .map_err(|err| err.to_string())?;
    let rows = stmt.query_map([limit], |row| {
        Ok(PersistentTaskRow {
            id: row.get(0)?,
            trade_date: row.get(1)?,
            task: row.get(2)?,
            status: row.get(3)?,
            retry_count: row.get(4)?,
            max_retries: row.get(5)?,
            last_error: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    }).map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn load_stock_rows(conn: &Connection, limit: i64) -> Result<Vec<StockBasicRow>, String> {
    let mut stmt = conn
        .prepare("SELECT code, name, COALESCE(market, ''), COALESCE(industry, ''), COALESCE(updated_at, '') FROM stock ORDER BY market, code LIMIT ?")
        .map_err(|err| err.to_string())?;
    let rows = stmt.query_map([limit], stock_row_from_sql).map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn search_stock_rows(conn: &Connection, keyword: &str, limit: i64) -> Result<Vec<StockBasicRow>, String> {
    let like = format!("%{}%", keyword);
    let prefix = format!("{}%", keyword);
    let mut stmt = conn
        .prepare("SELECT code, name, COALESCE(market, ''), COALESCE(industry, ''), COALESCE(updated_at, '') FROM stock WHERE code LIKE ? OR name LIKE ? ORDER BY CASE WHEN code = ? THEN 0 WHEN code LIKE ? THEN 1 WHEN name = ? THEN 2 ELSE 3 END, code LIMIT ?")
        .map_err(|err| err.to_string())?;
    let rows = stmt
        .query_map(params![like, like, keyword, prefix, keyword, limit], stock_row_from_sql)
        .map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn stock_row_from_sql(row: &rusqlite::Row<'_>) -> rusqlite::Result<StockBasicRow> {
    Ok(StockBasicRow {
        code: row.get(0)?,
        name: row.get(1)?,
        market: row.get(2)?,
        industry: row.get(3)?,
        updated_at: row.get(4)?,
    })
}

fn load_themes(conn: &Connection, trade_date: &str) -> Result<Vec<ThemeRow>, String> {
    let mut stmt = conn
        .prepare("SELECT COALESCE(rank_no, 99), theme_name, limit_up_count, COALESCE(leader_name, '待确认'), COALESCE(heat_score, 0) FROM theme_daily_rank WHERE trade_date = ? ORDER BY rank_no ASC, heat_score DESC LIMIT 12")
        .map_err(|err| err.to_string())?;
    let rows = stmt.query_map([trade_date], |row| {
        let rank = row.get::<_, i64>(0)?;
        let heat = row.get::<_, f64>(4)?;
        Ok(ThemeRow { rank, name: row.get(1)?, limit_up_count: row.get(2)?, leader: row.get(3)?, status: if rank <= 3 && heat >= 85.0 { "主线候选".into() } else { "观察".into() } })
    }).map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn load_limits(conn: &Connection, trade_date: &str) -> Result<Vec<LimitRow>, String> {
    let mut stmt = conn
        .prepare("SELECT board_count, name, COALESCE(themes, '[]'), COALESCE(reason, '') FROM limit_up_daily WHERE trade_date = ? ORDER BY board_count DESC, first_limit_time ASC LIMIT 20")
        .map_err(|err| err.to_string())?;
    let rows = stmt.query_map([trade_date], |row| {
        let board = row.get::<_, i64>(0)?;
        let themes_json = row.get::<_, String>(2)?;
        Ok(LimitRow { board: format!("{}板", board), name: row.get(1)?, theme: parse_first_theme(&themes_json), reason: row.get(3)? })
    }).map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn load_news(conn: &Connection, trade_date: &str) -> Result<Vec<NewsRow>, String> {
    let like = format!("{}%", trade_date);
    let mut stmt = conn
        .prepare("SELECT news_time, title, COALESCE(event_type, '未分类') FROM news_flash WHERE news_time LIKE ? ORDER BY news_time ASC LIMIT 20")
        .map_err(|err| err.to_string())?;
    let rows = stmt.query_map([like.as_str()], |row| {
        Ok(NewsRow { time: compact_time(row.get::<_, String>(0)?), title: row.get(1)?, tag: row.get(2)? })
    }).map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn load_latest_ai_summary(conn: &Connection, trade_date: &str) -> Result<Option<String>, String> {
    conn.query_row(
        "SELECT result FROM ai_analysis WHERE trade_date = ? AND task_type = 'daily_review' ORDER BY id DESC LIMIT 1",
        [trade_date],
        |row| row.get(0),
    ).optional().map_err(|err| err.to_string())
}

fn parse_first_theme(raw: &str) -> String {
    let parsed = serde_json::from_str::<Vec<String>>(raw).unwrap_or_default();
    parsed.first().cloned().unwrap_or_else(|| "未归类".into())
}

fn compact_time(value: String) -> String {
    value.split_whitespace().last().unwrap_or(&value).chars().take(5).collect()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_dashboard_from_sqlite,
            load_ai_analyses,
            run_agent_task,
            enqueue_persistent_tasks,
            load_persistent_tasks,
            cancel_queued_tasks,
            clear_finished_tasks,
            run_next_persistent_task,
            load_stock_source_status,
            search_stocks,
            import_ths_stock_names,
            load_task_logs,
            load_model_config,
            save_model_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
