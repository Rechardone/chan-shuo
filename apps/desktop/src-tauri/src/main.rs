use rusqlite::{Connection, OptionalExtension};
use serde::Serialize;
use std::path::PathBuf;

#[derive(Serialize)]
struct MoodCard {
    label: String,
    value: serde_json::Value,
    hint: String,
}

#[derive(Serialize)]
struct ThemeRow {
    rank: i64,
    name: String,
    limit_up_count: i64,
    leader: String,
    status: String,
}

#[derive(Serialize)]
struct LimitRow {
    board: String,
    name: String,
    theme: String,
    reason: String,
}

#[derive(Serialize)]
struct NewsRow {
    time: String,
    title: String,
    tag: String,
}

#[derive(Serialize)]
struct DashboardPayload {
    trade_date: String,
    mood_cards: Vec<MoodCard>,
    themes: Vec<ThemeRow>,
    limits: Vec<LimitRow>,
    news: Vec<NewsRow>,
    ai_summary: String,
}

fn open_db(db_path: Option<String>) -> Result<Connection, String> {
    let path = db_path
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("data/market-core.db"));
    Connection::open(path).map_err(|err| err.to_string())
}

#[tauri::command]
fn load_dashboard_from_sqlite(db_path: Option<String>, trade_date: String) -> Result<DashboardPayload, String> {
    let conn = open_db(db_path)?;

    let mood = conn
        .prepare("SELECT limit_up_count, limit_down_count, broken_limit_count, max_board_height, mood_score FROM market_mood WHERE trade_date = ?")
        .map_err(|err| err.to_string())?
        .query_row([trade_date.as_str()], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, i64>(1)?,
                row.get::<_, i64>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, Option<f64>>(4)?,
            ))
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

fn load_themes(conn: &Connection, trade_date: &str) -> Result<Vec<ThemeRow>, String> {
    let mut stmt = conn
        .prepare("SELECT COALESCE(rank_no, 99), theme_name, limit_up_count, COALESCE(leader_name, '待确认'), COALESCE(heat_score, 0) FROM theme_daily_rank WHERE trade_date = ? ORDER BY rank_no ASC, heat_score DESC LIMIT 12")
        .map_err(|err| err.to_string())?;
    let rows = stmt
        .query_map([trade_date], |row| {
            let rank = row.get::<_, i64>(0)?;
            let heat = row.get::<_, f64>(4)?;
            Ok(ThemeRow {
                rank,
                name: row.get(1)?,
                limit_up_count: row.get(2)?,
                leader: row.get(3)?,
                status: if rank <= 3 && heat >= 85.0 { "主线候选".into() } else { "观察".into() },
            })
        })
        .map_err(|err| err.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn load_limits(conn: &Connection, trade_date: &str) -> Result<Vec<LimitRow>, String> {
    let mut stmt = conn
        .prepare("SELECT board_count, name, COALESCE(themes, '[]'), COALESCE(reason, '') FROM limit_up_daily WHERE trade_date = ? ORDER BY board_count DESC, first_limit_time ASC LIMIT 20")
        .map_err(|err| err.to_string())?;
    let rows = stmt
        .query_map([trade_date], |row| {
            let board = row.get::<_, i64>(0)?;
            let themes_json = row.get::<_, String>(2)?;
            Ok(LimitRow {
                board: format!("{}板", board),
                name: row.get(1)?,
                theme: parse_first_theme(&themes_json),
                reason: row.get(3)?,
            })
        })
        .map_err(|err| err.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn load_news(conn: &Connection, trade_date: &str) -> Result<Vec<NewsRow>, String> {
    let like = format!("{}%", trade_date);
    let mut stmt = conn
        .prepare("SELECT news_time, title, COALESCE(event_type, '未分类') FROM news_flash WHERE news_time LIKE ? ORDER BY news_time ASC LIMIT 20")
        .map_err(|err| err.to_string())?;
    let rows = stmt
        .query_map([like.as_str()], |row| {
            Ok(NewsRow {
                time: compact_time(row.get::<_, String>(0)?),
                title: row.get(1)?,
                tag: row.get(2)?,
            })
        })
        .map_err(|err| err.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}

fn load_latest_ai_summary(conn: &Connection, trade_date: &str) -> Result<Option<String>, String> {
    conn.query_row(
        "SELECT result FROM ai_analysis WHERE trade_date = ? AND task_type = 'daily_review' ORDER BY id DESC LIMIT 1",
        [trade_date],
        |row| row.get(0),
    )
    .optional()
    .map_err(|err| err.to_string())
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
        .invoke_handler(tauri::generate_handler![load_dashboard_from_sqlite])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
