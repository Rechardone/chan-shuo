# Chan Shuo Batch Testing

The project now includes a local batch test runner.

## Run all batch checks

```bash
pnpm test:batches
```

Optional trade date and report path:

```bash
pnpm test:batches 2026-06-28 reports/batch-test-2026-06-28.md
```

## What it checks

The runner currently covers these flows:

| Batch | Check |
|---|---|
| Batch 1 | DB initialization and workspace data path |
| Batch 3 | Mock market data import |
| Batch 6 | Data quality evaluation |
| Batch 6 | Alert rules |
| Batch 4 | AI daily review |
| Batch 4 | Markdown report export |
| Batch 5 | Queue add workflow |
| Batch 5 | Queue list |
| All | Workspace typecheck |

## Output

The runner writes a Markdown report under `reports/`.

Example:

```text
reports/batch-test-2026-06-28.md
```

The report includes:

- Total passed and failed cases.
- Per-batch summary table.
- Command used for each case.
- Exit status.
- Captured output snippets.
- Missing expected output markers.

## Notes

- Reports are local runtime artifacts and are ignored by Git.
- The AI review case depends on the currently configured provider. With MockLLM it should run offline.
- Tauri desktop UI still needs manual visual verification with `pnpm desktop:dev`.
- When a batch adds new features, add one or more test cases to `scripts/batch-test.mjs` and include expected output markers.
