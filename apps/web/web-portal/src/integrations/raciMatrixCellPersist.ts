import type { RaciMatrixRow } from './raciGovernanceApi';
import { normalizeRaciLettersInput } from './raciGovernanceHelpers';

/** Align with permission matrix debounce in CommandCenterPage (UF-CC-P0-04). */
export const RACI_MATRIX_CELL_SAVE_DEBOUNCE_MS = 600;

export function raciMatrixCellKey(activityId: string, orgColumnId: string): string {
  return `${activityId}:${orgColumnId}`;
}

export function sanitizeRaciMatrixCellInput(raw: string): string {
  return raw.toUpperCase().replace(/[^RACI]/gi, '').slice(0, 4);
}

export function shouldPersistRaciMatrixCell(persistedLetters: string, rawLetters: string): boolean {
  return persistedLetters !== normalizeRaciLettersInput(rawLetters);
}

export function buildPersistedMatrixSnapshot(rows: RaciMatrixRow[]): Map<string, string> {
  const snapshot = new Map<string, string>();
  for (const row of rows) {
    for (const [colId, letters] of Object.entries(row.matrix ?? {})) {
      snapshot.set(raciMatrixCellKey(row.activity_id, colId), letters ?? '');
    }
  }
  return snapshot;
}
