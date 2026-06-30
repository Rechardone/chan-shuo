# Chan Shuo Local Development

## Start

Run from the workspace root:

```bash
pnpm install
pnpm db:init
pnpm desktop:dev
```

The desktop app should open a Tauri window. A browser page at localhost port 4200 is only the Angular preview and cannot call Tauri commands.

## Database path

The default database path is:

```text
data/market-core.db
```

All Node agent commands and the Tauri desktop app should use this same database.

## Stop

Recommended order:

1. Close the Chan Shuo desktop window.
2. Press Ctrl C in the terminal.
3. If port 4200 is still occupied, inspect it with `lsof -i :4200` and stop the related local development process.

## Check SQLite

```bash
sqlite3 data/market-core.db "PRAGMA integrity_check;"
sqlite3 data/market-core.db "select count(*) from stock;"
```

## Git hygiene

Local database files, task logs, reports, model settings and Tauri build outputs should not be committed.

Before pulling remote changes:

```bash
git status --short
```

If there are many local runtime changes, stash them first:

```bash
git stash push -u -m "local runtime files before sync"
```

Then pull:

```bash
git pull
```

Review stash contents before restoring:

```bash
git stash list
git stash show --stat stash@{0}
```

Runtime files usually do not need to be restored.

## Backup database

```bash
mkdir -p local-backup
cp -f data/market-core.db local-backup/market-core.backup.db
```
