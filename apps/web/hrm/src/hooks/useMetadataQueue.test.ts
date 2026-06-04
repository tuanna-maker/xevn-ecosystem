import { describe, expect, it } from 'vitest';
import { formatMetadataDisplayValue } from './useMetadataQueue';

describe('formatMetadataDisplayValue', () => {
  it('returns em dash for empty values', () => {
    expect(formatMetadataDisplayValue(null)).toBe('—');
    expect(formatMetadataDisplayValue('')).toBe('—');
  });

  it('unwraps JSON string values from API', () => {
    expect(formatMetadataDisplayValue('"Nguyen Van A"')).toBe('Nguyen Van A');
  });

  it('stringifies object values', () => {
    expect(formatMetadataDisplayValue({ code: 'A1' })).toBe('{"code":"A1"}');
  });
});
