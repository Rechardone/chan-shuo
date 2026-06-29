use rusqlite::Connection;
use serde::Serialize;

#[derive(Serialize)]
pub struct QueueMaintenanceRow {
    pub id: i64,
    pub trade_date: String,
    pub task: String,
    pub status: String,
    pub retry_count: i64,
    pub max_retries: i64,
    pub last_error: String,
    pub created_at: String,
    pub updated_at: String,
}

pub fn cancel_task(conn: &Connection, id: i64) -> Result<Vec<QueueMaintenanceRow>, String> {
    conn.prepare("UPDATE task_queue SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('queued', 'running')")
        .map_err(|err| err.to_string())?
        .run(id)
        .map_err(|err| err.to_string())?;
    list_tasks(conn, 50)
}

pub fn retry_task(conn: &Connection, id: i64) -> Result<Vec<QueueMaintenanceRow>, String> {
    conn.prepare("UPDATE task_queue SET status = 'queued', last_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('failed', 'cancelled')")
        .map_err(|err| err.to_string())?
        .run(id)
        .map_err(|err| err.to_string())?;
    list_tasks(conn, 50)
}

pub fn archive_finished_tasks(conn: &Connection) -> Result<Vec<QueueMaintenanceRow>, String> {
    conn.prepare("UPDATE task_queue SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE status IN ('success', 'failed')")
        .map_err(|err| err.to_string())?
        .run([])
        .map_err(|err| err.to_string())?;
    list_tasks(conn, 50)
}

pub fn list_tasks(conn: &Connection, limit: i64) -> Result<Vec<QueueMaintenanceRow>, String> {
    let mut stmt = conn
        .prepare("SELECT id, trade_date, task, status, retry_count, max_retries, COALESCE(last_error, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM task_queue ORDER BY id DESC LIMIT ?")
        .map_err(|err| err.to_string())?;
    let rows = stmt
        .query_map([limit], |row| {
            Ok(QueueMaintenanceRow {
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
        })
        .map_err(|err| err.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|err| err.to_string())
}
