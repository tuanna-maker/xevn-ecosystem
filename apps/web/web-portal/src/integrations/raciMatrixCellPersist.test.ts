import { describe, expect, it } from 'vitest';
import {
  buildPersistedMatrixSnapshot,
  raciMatrixCellKey,
  sanitizeRaciMatrixCellInput,
  shouldPersistRaciMatrixCell,
} from './raciMatrixCellPersist';
import type { RaciMatrixRow } from './raciGovernanceApi';

describe('raciMatrixCellPersist', () => {
  it('builds stable cell keys', () => {
    expect(raciMatrixCellKey('act-1', 'hdqt')).toBe('act-1:hdqt');
  });

  it('sanitizes RACI letters for controlled input', () => {
    expect(sanitizeRaciMatrixCellInput('r')).toBe('R');
    expect(sanitizeRaciMatrixCellInput('ar/x')).toBe('AR');
    expect(sanitizeRaciMatrixCellInput('rrrrr')).toBe('RRRR');
  });

  it('skips PUT when persisted value unchanged', () => {
    expect(shouldPersistRaciMatrixCell('I', 'I')).toBe(false);
    expect(shouldPersistRaciMatrixCell('I', ' R ')).toBe(true);
    expect(shouldPersistRaciMatrixCell('', 'R')).toBe(true);
  });

  it('builds persisted snapshot from matrix rows', () => {
    const rows: RaciMatrixRow[] = [
      {
        activity_id: 'a1',
        activity_code: 'BDH-001',
        domain_code: 'phong_hdqt',
        domain_label: 'HĐQT',
        seq_no: 1,
        name: 'Test',
        matrix: { hdqt: 'I', ceo: '' },
      },
    ];
    const snap = buildPersistedMatrixSnapshot(rows);
    expect(snap.get('a1:hdqt')).toBe('I');
    expect(snap.get('a1:ceo')).toBe('');
  });
});
