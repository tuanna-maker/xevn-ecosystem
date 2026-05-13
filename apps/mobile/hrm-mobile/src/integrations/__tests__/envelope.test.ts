import { describe, expect, it } from 'vitest';
import { readListRows, readListTotal } from '../envelope';

describe('readListRows', () => {
  it('reads paged payload', () => {
    const rows = readListRows<{ id: string }>({ total: 2, data: [{ id: 'a' }, { id: 'b' }] });
    expect(rows).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('reads bare array (service-requests)', () => {
    expect(readListRows([{ x: 1 }])).toEqual([{ x: 1 }]);
  });

  it('returns empty for invalid', () => {
    expect(readListRows(null)).toEqual([]);
    expect(readListRows({})).toEqual([]);
  });
});

describe('readListTotal', () => {
  it('prefers numeric total', () => {
    expect(readListTotal({ total: 5, data: [] })).toBe(5);
  });
});
