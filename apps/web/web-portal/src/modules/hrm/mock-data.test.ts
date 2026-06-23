import { describe, expect, it } from 'vitest';
import * as hrmModuleExports from './mock-data';

describe('hrm mock-data catalog (M-CC-02)', () => {
  it('exports only table shell constants — no legacy mock catalog', () => {
    const legacyPrefix = ['HRM', 'MOCK', '_'].join('');
    const mockExports = Object.keys(hrmModuleExports).filter((key) => key.startsWith(legacyPrefix));
    expect(mockExports).toEqual([]);
    expect(hrmModuleExports.HRM_TABLE_SHELL).toContain('overflow-x-auto');
    expect(hrmModuleExports.HRM_TABLE_CLASS).toContain('w-full');
  });
});
