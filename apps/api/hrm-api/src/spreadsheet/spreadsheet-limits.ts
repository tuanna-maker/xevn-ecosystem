/** Defaults align with SA contract `2026-05-04 | SA -> Dev-BE` (M2). Env overrides optional. */
export function getSpreadsheetLimits() {
  const maxUploadBytes = numEnv('SPREADSHEET_MAX_UPLOAD_BYTES', 10 * 1024 * 1024);
  const maxCsvDataRows = numEnv('SPREADSHEET_MAX_CSV_ROWS', 50_000);
  const maxXlsxDataRows = numEnv('SPREADSHEET_MAX_XLSX_ROWS', 20_000);
  const maxCellChars = numEnv('SPREADSHEET_MAX_CELL_CHARS', 32 * 1024);
  const maxSyncMs = numEnv('SPREADSHEET_MAX_SYNC_MS', 30_000);
  const maxColumns = numEnv('SPREADSHEET_MAX_COLUMNS', 256);
  const maxPreviewRows = numEnv('SPREADSHEET_MAX_PREVIEW_ROWS', 100);
  return {
    maxUploadBytes,
    maxCsvDataRows,
    maxXlsxDataRows,
    maxCellChars,
    maxSyncMs,
    maxColumns,
    maxPreviewRows,
  };
}

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
