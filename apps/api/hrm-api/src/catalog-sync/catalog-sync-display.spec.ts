import {
  buildSyncedCatalogDisplayReady,
  catalogItemStatusLabelVi,
  catalogItemStatusTone,
  extractPublishedVersion,
  parseSyncedCatalogPayloadMeta,
} from './catalog-sync-display';

describe('catalog-sync-display (W1-B-03-TC-CAT · OS 28)', () => {
  it('maps active/draft status to VI label + tone', () => {
    expect(catalogItemStatusLabelVi('active')).toBe('Đang dùng');
    expect(catalogItemStatusLabelVi('draft')).toBe('Nháp');
    expect(catalogItemStatusTone('active')).toBe('success');
    expect(catalogItemStatusTone('draft')).toBe('warning');
    expect(catalogItemStatusLabelVi(null)).toBe('—');
  });

  it('extracts XBOS published version from payload (FR-UC-B04 khóa mang)', () => {
    expect(extractPublishedVersion({ version: 7, items: [] }, 1)).toBe(7);
    expect(extractPublishedVersion({ version: '3' }, 1)).toBe(3);
    expect(extractPublishedVersion({}, 4)).toBe(4);
    expect(extractPublishedVersion(null, 0)).toBe(1);
  });

  it('parses items display-ready — code/label/status_label without FE join', () => {
    const meta = parseSyncedCatalogPayloadMeta({
      name: 'Chức danh',
      domain: 'hrm',
      version: 5,
      items: [
        { code: 'CEO', label: 'Tổng giám đốc', status: 'active' },
        { code: 'DRAFT_ROLE', label: 'Nháp', status: 'draft', unit: '%' },
        { code: '', label: 'skip' },
      ],
    });
    expect(meta.name).toBe('Chức danh');
    expect(meta.domain).toBe('hrm');
    expect(meta.items).toHaveLength(2);
    expect(meta.items[0]).toEqual(
      expect.objectContaining({
        code: 'CEO',
        label: 'Tổng giám đốc',
        status: 'active',
        status_label: 'Đang dùng',
        status_tone: 'success',
        origin: 'xbos',
      }),
    );
    expect(meta.items[1]).toEqual(
      expect.objectContaining({
        code: 'DRAFT_ROLE',
        unit: '%',
        status_label: 'Nháp',
        status_tone: 'warning',
      }),
    );
  });

  it('buildSyncedCatalogDisplayReady exposes item_count + published_version', () => {
    const ready = buildSyncedCatalogDisplayReady(
      {
        name: 'Phòng ban',
        domain: 'org',
        version: 9,
        items: [{ code: 'OPS', label: 'Vận hành', status: 'active' }],
      },
      1,
    );
    expect(ready.published_version).toBe(9);
    expect(ready.item_count).toBe(1);
    expect(ready.items[0].label).toBe('Vận hành');
  });

  it('honest empty when payload missing items (no invent)', () => {
    const ready = buildSyncedCatalogDisplayReady({ name: 'Empty' }, 2);
    expect(ready.items).toEqual([]);
    expect(ready.item_count).toBe(0);
    expect(ready.published_version).toBe(2);
  });
});
