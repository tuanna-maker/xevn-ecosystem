import { describe, expect, it } from 'vitest';
import { coerceHrmListCompanyId, normalizeHrmApiListCompanyId } from './hrmListScope';

describe('hrmListScope (EX-SA01-P1-03 + U39)', () => {
  it('maps holding and all to main for legacy embed/upload coercion', () => {
    expect(coerceHrmListCompanyId('holding')).toBe('main');
    expect(coerceHrmListCompanyId('all')).toBe('main');
    expect(coerceHrmListCompanyId('')).toBe('main');
  });

  it('preserves holding as operating slug for explicit filter queries', () => {
    expect(normalizeHrmApiListCompanyId('holding')).toBe('holding');
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
