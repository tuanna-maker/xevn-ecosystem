import { describe, expect, it } from 'vitest';

describe('P1-HRM-CON-PERF-01 — contracts list binding', () => {
  it('useContracts exports progressive loader (not mount listAllEmployeeContracts)', async () => {
    const mod = await import('@/hooks/useContracts');
    expect(typeof mod.useContracts).toBe('function');
    expect(typeof mod.loadContractsListProgressive).toBe('function');
    expect(mod.HRM_CONTRACTS_LIST_PAGE_SIZE).toBe(100);

    const api = await import('@/integrations/hrmApi');
    expect(typeof api.listEmployeeContracts).toBe('function');
    // listAll remains for dashboard/reports — contracts page must not call it on mount
    expect(typeof api.listAllEmployeeContracts).toBe('function');
  });

  it('Contracts page source defers employees picker (no listAllEmployees on mount)', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const file = path.join(process.cwd(), 'src/pages/Contracts.tsx');
    const src = await fs.readFile(file, 'utf8');
    expect(src).toContain('listEmployees');
    expect(src).not.toMatch(/listAllEmployees\s*\(/);
    expect(src).toContain('needsEmployeePicker');
    expect(src).toContain('HrmListLoadBanner');
    expect(src).toContain('isListFetchFailureEmpty');
    expect(src).toContain('loadFailedEmpty');
  });
});
