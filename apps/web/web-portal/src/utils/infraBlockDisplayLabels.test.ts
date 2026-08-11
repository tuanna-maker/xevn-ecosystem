import { describe, expect, it } from 'vitest';
import {
  INFRA_BASE_BLOCK_LABELS_VI,
  resolveInfraBlockCodeDisplayLabel,
} from './infraBlockDisplayLabels';

describe('resolveInfraBlockCodeDisplayLabel (F-XBOS-09)', () => {
  it('maps base blockCodes to VI labels (no raw key)', () => {
    expect(resolveInfraBlockCodeDisplayLabel('general')).toBe(
      INFRA_BASE_BLOCK_LABELS_VI.general,
    );
    expect(resolveInfraBlockCodeDisplayLabel('location')).toBe(
      INFRA_BASE_BLOCK_LABELS_VI.location,
    );
    expect(resolveInfraBlockCodeDisplayLabel('capacity')).toBe(
      INFRA_BASE_BLOCK_LABELS_VI.capacity,
    );
  });

  it('prefers non-empty titleOverrides for base blocks', () => {
    expect(
      resolveInfraBlockCodeDisplayLabel('general', {
        titleOverrides: { general: 'Khối chung (đã đổi tên)' },
      }),
    ).toBe('Khối chung (đã đổi tên)');
  });

  it('prefers customBlocks.labelVi when blockCode matches', () => {
    expect(
      resolveInfraBlockCodeDisplayLabel('warehouse_extra', {
        customBlocks: [{ blockCode: 'warehouse_extra', labelVi: 'Khối Kho phụ' }],
      }),
    ).toBe('Khối Kho phụ');
  });

  it('fail-closed: unknown / empty → em dash (never echo raw key)', () => {
    expect(resolveInfraBlockCodeDisplayLabel('totally_unknown_xyz')).toBe('—');
    expect(resolveInfraBlockCodeDisplayLabel('')).toBe('—');
    expect(resolveInfraBlockCodeDisplayLabel(null)).toBe('—');
    expect(resolveInfraBlockCodeDisplayLabel(undefined)).toBe('—');
  });

  it('never returns the wire key for known base codes', () => {
    for (const code of ['general', 'location', 'capacity'] as const) {
      const label = resolveInfraBlockCodeDisplayLabel(code);
      expect(label).not.toBe(code);
      expect(label.includes(`${code} -`)).toBe(false);
    }
  });
});
