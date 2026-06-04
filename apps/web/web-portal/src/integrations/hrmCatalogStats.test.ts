import { describe, expect, it } from 'vitest';
import { sumEffectiveCatalogItems } from './hrmCatalogStats';

describe('sumEffectiveCatalogItems', () => {
  it('counts catalogs and active effective rows', () => {
    const stats = sumEffectiveCatalogItems([
      {
        catalogKey: 'departments',
        effectiveItems: [
          { code: 'a', status: 'active' },
          { code: 'b', status: 'draft' },
        ],
      },
      { catalogKey: 'positions', effectiveItems: [{ code: 'p1', status: 'active' }] },
    ]);
    expect(stats.catalogCount).toBe(2);
    expect(stats.effectiveItemCount).toBe(2);
  });

  it('returns zero when no catalogs', () => {
    expect(sumEffectiveCatalogItems([])).toEqual({ catalogCount: 0, effectiveItemCount: 0 });
  });
});
