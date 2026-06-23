import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./businessMasterApi', () => ({
  listBusinessMasterItems: vi.fn(),
  upsertBusinessMasterItem: vi.fn(),
}));

import { listBusinessMasterItems, upsertBusinessMasterItem } from './businessMasterApi';
import {
  createCcMeasurementRow,
  createCcPricingRow,
  createCcRegulationRow,
  loadCcCatalogRows,
  saveAndReloadCcCatalogRows,
  saveCcCatalogRows,
} from './commandCenterCatalogApi';

const listMock = vi.mocked(listBusinessMasterItems);
const upsertMock = vi.mocked(upsertBusinessMasterItem);

describe('commandCenterCatalogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadCcCatalogRows returns empty array when API has no matching kind (no seed fallback)', async () => {
    listMock.mockResolvedValueOnce([]);
    await expect(loadCcCatalogRows('regulations')).resolves.toEqual([]);
  });

  it('loadCcCatalogRows returns rows from matching catalog entry only', async () => {
    listMock.mockResolvedValueOnce([
      { id: 'pricing', rows: [{ priceCode: 'X', label: 'Y', amount: 1 }] },
      { id: 'regulations', rows: [{ code: 'QĐ-1', title: 'T', version: 'v1', active: true }] },
    ]);
    const rows = await loadCcCatalogRows('regulations');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.code).toBe('QĐ-1');
  });

  it('loadCcCatalogRows merges flat per-item autosave rows (UF-XBOS-14)', async () => {
    listMock.mockResolvedValueOnce([
      { id: 'qa-uf14-1', code: 'qa-uf14-1', title: 'Probe row', category: 'regulations' },
      { id: 'regulations', rows: [{ code: 'QĐ-1', title: 'Bucket', version: 'v1', active: true }] },
    ]);
    const rows = await loadCcCatalogRows('regulations');
    expect(rows).toHaveLength(2);
    expect(rows.some((r) => r.code === 'qa-uf14-1')).toBe(true);
  });

  it('saveCcCatalogRows upserts payload under command_center_catalogs domain', async () => {
    upsertMock.mockResolvedValue(undefined);
    const rows = [createCcRegulationRow(42)];
    await saveCcCatalogRows('regulations', rows);
    expect(upsertMock).toHaveBeenCalledWith(
      'command_center_catalogs',
      'regulations',
      { rows },
      expect.any(String),
      'holding',
    );
    expect(upsertMock).toHaveBeenCalledWith(
      'command_center_catalogs',
      rows[0]!.code,
      expect.objectContaining({ code: rows[0]!.code, category: 'regulations' }),
      expect.any(String),
      'holding',
    );
  });

  it('saveAndReloadCcCatalogRows hydrates from API after flat sync (UF-XBOS-14)', async () => {
    upsertMock.mockResolvedValue(undefined);
    listMock.mockResolvedValueOnce([
      { id: 'qa-uf14-1', code: 'qa-uf14-1', title: 'Probe row', category: 'regulations' },
    ]);
    const rows = [createCcRegulationRow(99)];
    const reloaded = await saveAndReloadCcCatalogRows('regulations', rows);
    expect(upsertMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(reloaded.some((r) => r.code === 'qa-uf14-1')).toBe(true);
  });

  it('create helpers produce editable blank rows (not demo seed content)', () => {
    const reg = createCcRegulationRow(1);
    expect(reg.title).toBe('');
    expect(reg.code).toContain('QĐ-');

    const measure = createCcMeasurementRow(2);
    expect(measure.unit).toBe('');
    expect(measure.key).toContain('METRIC-');

    const price = createCcPricingRow(3);
    expect(price.label).toBe('');
    expect(price.amount).toBe(0);
  });
});
