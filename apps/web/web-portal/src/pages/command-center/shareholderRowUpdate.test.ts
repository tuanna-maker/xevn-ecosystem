import { describe, expect, it } from 'vitest';
import { applyShareholderRowFieldUpdate } from './shareholderRowUpdate';

const baseRow = {
  id: 'sh-1',
  holderName: 'XeVN Holdings',
  identityCode: '0312345678',
  ratioPercent: 40,
  contributedValue: 200_000_000_000,
  submitted: false,
};

describe('applyShareholderRowFieldUpdate (UC-CC-P0-01)', () => {
  it('updates ratioPercent without recalculating contributedValue', () => {
    const next = applyShareholderRowFieldUpdate(baseRow, 'ratioPercent', 25);
    expect(next.ratioPercent).toBe(25);
    expect(next.contributedValue).toBe(200_000_000_000);
  });

  it('updates contributedValue independently of ratioPercent', () => {
    const next = applyShareholderRowFieldUpdate(baseRow, 'contributedValue', 99_999);
    expect(next.contributedValue).toBe(99_999);
    expect(next.ratioPercent).toBe(40);
  });

  it('updates holderName without touching numeric fields', () => {
    const next = applyShareholderRowFieldUpdate(baseRow, 'holderName', 'Cổ đông B');
    expect(next.holderName).toBe('Cổ đông B');
    expect(next.ratioPercent).toBe(40);
    expect(next.contributedValue).toBe(200_000_000_000);
  });
});
