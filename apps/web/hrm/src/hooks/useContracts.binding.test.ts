import { describe, expect, it } from 'vitest';

describe('P1-HRM-PAGESIZE-CRYPTO-8088 — contracts list binding', () => {
  it('useContracts imports listAllEmployeeContracts for full rollup', async () => {
    const mod = await import('@/hooks/useContracts');
    expect(typeof mod.useContracts).toBe('function');
    const api = await import('@/integrations/hrmApi');
    expect(typeof api.listAllEmployeeContracts).toBe('function');
  });
});
