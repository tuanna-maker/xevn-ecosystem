import { describe, expect, it, beforeEach } from 'vitest';
import { buildRaciMatrixCellBody } from './raciGovernanceApi';
import {
  isRaciCatalogSeedOnly,
  normalizeRaciLettersInput,
  raciCatalogSeedHint,
  raciColumnBindingsStorageKey,
  readRaciColumnBindings,
  writeRaciColumnBinding,
} from './raciGovernanceHelpers';

describe('raciGovernanceHelpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes RACI letters for matrix cells', () => {
    expect(normalizeRaciLettersInput('  a / r  ')).toBe('A/R');
  });

  it('detects seed-only catalog rows', () => {
    expect(isRaciCatalogSeedOnly([{ id: 'seed-HCNS-01' }])).toBe(true);
    expect(isRaciCatalogSeedOnly([{ id: 'uuid-1' }])).toBe(false);
  });

  it('returns seed hint when catalog empty or seed ids', () => {
    expect(raciCatalogSeedHint(0, [])).toContain('seed:raci:catalog');
    expect(raciCatalogSeedHint(2, [{ id: 'seed-x' }])).toContain('seed:raci:catalog');
    expect(raciCatalogSeedHint(2, [{ id: 'db-id' }])).toBeNull();
  });

  it('buildRaciMatrixCellBody normalizes letters for PUT', () => {
    expect(buildRaciMatrixCellBody('act-1', 'hcns', ' r ')).toEqual({
      activity_id: 'act-1',
      org_column_id: 'hcns',
      raci_letters: 'R',
    });
  });

  it('persists column bindings per tenant+company', () => {
    const key = raciColumnBindingsStorageKey('xe-vietnam', 'co-1');
    expect(key).toContain('xe-vietnam');
    const saved = writeRaciColumnBinding('xe-vietnam', 'co-1', 'hcns', 'dtpl-1');
    expect(saved.hcns).toBe('dtpl-1');
    expect(readRaciColumnBindings('xe-vietnam', 'co-1').hcns).toBe('dtpl-1');
    writeRaciColumnBinding('xe-vietnam', 'co-1', 'hcns', '');
    expect(readRaciColumnBindings('xe-vietnam', 'co-1').hcns).toBeUndefined();
  });
});
