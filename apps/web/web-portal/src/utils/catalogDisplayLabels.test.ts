import { describe, expect, it } from 'vitest';
import {
  resolveCatalogKeyDisplayLabel,
  resolveHatKeyDisplayLabel,
  shortenUuidForDisplay,
} from './catalogDisplayLabels';

describe('catalogDisplayLabels', () => {
  it('maps known catalog keys to Vietnamese labels', () => {
    expect(resolveCatalogKeyDisplayLabel('positions')).toBe('Chức danh');
    expect(resolveCatalogKeyDisplayLabel('job_levels')).toBe('Cấp bậc');
  });

  it('prefers API name when human-readable', () => {
    expect(resolveCatalogKeyDisplayLabel('positions', 'Chức vụ')).toBe('Chức vụ');
  });

  it('maps hat_key to Vietnamese role labels', () => {
    expect(resolveHatKeyDisplayLabel('group_ceo')).toBe('Phê duyệt tập đoàn');
  });

  it('shortens UUID for muted display', () => {
    expect(shortenUuidForDisplay('8219900a-bbbb-cccc-dddd-eeeeeeeeeeee')).toBe('8219900a…');
  });
});
