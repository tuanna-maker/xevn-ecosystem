import { describe, expect, it } from 'vitest';
import { coerceHrmListCompanyId } from './hrmListScope';

describe('hrmListScope (EX-SA01-P1-03)', () => {
  it('maps holding and all to main for list APIs', () => {
    expect(coerceHrmListCompanyId('holding')).toBe('main');
    expect(coerceHrmListCompanyId('all')).toBe('main');
    expect(coerceHrmListCompanyId('')).toBe('main');
  });

  it('keeps member operating slugs and main', () => {
    expect(coerceHrmListCompanyId('main')).toBe('main');
    expect(coerceHrmListCompanyId('trsport')).toBe('trsport');
    expect(coerceHrmListCompanyId('xe-du-lich')).toBe('xe-du-lich');
  });

  it('maps master tenant slug to main (embed query typo)', () => {
    expect(coerceHrmListCompanyId('xevn')).toBe('main');
  });
});
