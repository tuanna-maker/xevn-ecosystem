import { describe, expect, it } from 'vitest';
import type { HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';
import {
  EM_DASH,
  FLEET_REQUIRED_CATALOG_KEY,
  buildFleetFieldLabelMap,
  isFleetCatalogMissing,
  resolveFleetEmptyCopy,
  resolveFleetFieldDisplayLabel,
  resolveFleetStatusDisplay,
  resolveFleetVehicleDisplayName,
} from './fleetCatalogUx';

function catalogRow(
  partial: Partial<HrmSettingsCatalogOverviewRow> & { catalogKey: string },
): HrmSettingsCatalogOverviewRow {
  return {
    catalogKey: partial.catalogKey,
    name: partial.name ?? null,
    domain: partial.domain ?? 'hrm_fleet',
    xbosVersion: partial.xbosVersion ?? null,
    xbosSyncedAt: partial.xbosSyncedAt ?? null,
    xbosItems: partial.xbosItems ?? [],
    hrmExtensionItems: partial.hrmExtensionItems ?? [],
    effectiveItems: partial.effectiveItems ?? [],
  };
}

describe('fleetCatalogUx (G-FL-07)', () => {
  it('resolves status to VI — never raw unknown', () => {
    expect(resolveFleetStatusDisplay('active')).toBe('Đang hoạt động');
    expect(resolveFleetStatusDisplay('inactive')).toBe('Ngừng hoạt động');
    expect(resolveFleetStatusDisplay('weird')).toBe(EM_DASH);
    expect(resolveFleetStatusDisplay(null)).toBe(EM_DASH);
  });

  it('never prints raw field codes when catalog/fallback missing', () => {
    expect(resolveFleetFieldDisplayLabel('driver_name')).toBe('Tên lái xe');
    expect(resolveFleetFieldDisplayLabel('totally_unknown_key')).toBe(EM_DASH);
    expect(resolveFleetFieldDisplayLabel('')).toBe(EM_DASH);
    const map = new Map([['model', 'Kiểu xe']]);
    expect(resolveFleetFieldDisplayLabel('model', map)).toBe('Kiểu xe');
  });

  it('builds vehicle display name from soft fields only', () => {
    expect(resolveFleetVehicleDisplayName({ vehicle_name: 'Xe 16 chỗ' })).toBe('Xe 16 chỗ');
    expect(resolveFleetVehicleDisplayName({ manufacturer: 'Hyundai', model: 'Solati' })).toBe(
      'Hyundai Solati',
    );
    expect(resolveFleetVehicleDisplayName({})).toBe(EM_DASH);
    expect(resolveFleetVehicleDisplayName(null)).toBe(EM_DASH);
  });

  it('detects catalog-missing only after settle + empty vehicle fields', () => {
    expect(isFleetCatalogMissing(undefined, { catalogsSettled: false })).toBe(false);
    expect(isFleetCatalogMissing([], { catalogsSettled: true })).toBe(true);
    expect(
      isFleetCatalogMissing(
        [catalogRow({ catalogKey: FLEET_REQUIRED_CATALOG_KEY, effectiveItems: [] })],
        { catalogsSettled: true },
      ),
    ).toBe(true);
    expect(
      isFleetCatalogMissing(
        [
          catalogRow({
            catalogKey: FLEET_REQUIRED_CATALOG_KEY,
            effectiveItems: [{ code: 'model', label: 'Model', unit: 'text', status: 'active', origin: 'xbos' }],
          }),
        ],
        { catalogsSettled: true },
      ),
    ).toBe(false);
  });

  it('builds label map from hrm_fleet_* effective items only', () => {
    const map = buildFleetFieldLabelMap([
      catalogRow({
        catalogKey: 'hrm_fleet_driver_fields',
        effectiveItems: [
          { code: 'driver_name', label: 'Tên lái xe', unit: 'text', status: 'active', origin: 'xbos' },
        ],
      }),
      catalogRow({
        catalogKey: 'leave_types',
        effectiveItems: [{ code: 'AL', label: 'Phép năm', unit: null, status: 'active', origin: 'xbos' }],
      }),
    ]);
    expect(map.get('driver_name')).toBe('Tên lái xe');
    expect(map.has('AL')).toBe(false);
  });

  it('empty copy: honest / keyword / catalog-missing (no fake rows)', () => {
    expect(resolveFleetEmptyCopy({ vehicleTotal: 0, keyword: '', catalogMissing: false }).kind).toBe(
      'honest_empty',
    );
    expect(resolveFleetEmptyCopy({ vehicleTotal: 0, keyword: '29A', catalogMissing: false }).kind).toBe(
      'keyword_empty',
    );
    const missing = resolveFleetEmptyCopy({ vehicleTotal: 0, keyword: '', catalogMissing: true });
    expect(missing.kind).toBe('catalog_missing');
    expect(missing.body.toLowerCase()).not.toContain('hrm_fleet_');
    expect(missing.title).toMatch(/danh mục/i);
  });
});
