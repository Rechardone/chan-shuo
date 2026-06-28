use rusqlite::Connection;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Serialize)]
struct MoodCard {
    label: String,
    value: serde_json::Value,
    hint: String,
}

#[derive(Serialize)]
struct DashboardPayload {
    trade_date: String,
    mood_cards: Vec<MoodCard>,
    theme_count: usize,
    limit_up_count: usize,
    news_count: usize,
}

#[tauri::command]
fn load_dashboard_from_sqlite(db_path: Option<String>, trade_date: String) -> Result<DashboardPayload, String> {
    let path = db_path.map(PathBuf::from).unwrap_or_else(|| PathBuf::from("data/market-core.db"));
    let conn = Connection::open(path).map_err(|err| err.to_string())?;

    let mut mood_stmt = conn
        .prepare("SELECT limit_up_count, limit_down_count, broken_limit_count, max_board_height, mood_score FROM market_mood WHERE trade_date = ?")
        .map_err(|err| err.to_string())?;
    let mood = mood_stmt
        .query_row([trade_date.as_str()], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, i64>(1)?,
                row.get::<_, i64>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, Option<f64>>(4)?,
            ))
        })
        .map_err(|err| err.to_string())?;

    let theme_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM theme_daily_rank WHERE trade_date = ?", [trade_date.as_str()], |row| row.get(0))
        .map_err(|err| err.to_string())?;
    let news_like = format!("{}%", trade_date);
    let news_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM news_flash WHERE news_time LIKE ?", [news_like.as_str()], |row| row.get(0))
        .map_err(|err| err.to_string())?;

    Ok(DashboardPayload {
        trade_date,
        mood_cards: vec![
            MoodCard { label: "涨停".into(), value: mood.0.into(), hint: "短线活跃度".into() },
            MoodCard { label: "跌停".into(), value: mood.1.into(), hint: "风险反馈".into() },
            MoodCard { label: "炸板".into(), value: mood.2.into(), hint: "分歧强度".into() },
            MoodCard { label: "高度".into(), value: format!("{}板", mood.3).into(), hint: "连板空间".into() },
            MoodCard { label: "温度".into(), value: mood.4.unwrap_or_default().into(), hint: "市场情绪".into() },
        ],
        theme_count: theme_count as usize,
        limit_up_count: mood.0 as usize,
        news_count: news_count as usize,
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_dashboard_from_sqlite])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
