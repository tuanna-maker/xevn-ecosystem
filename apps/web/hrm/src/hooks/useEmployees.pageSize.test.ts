import { describe, expect, it } from 'vitest';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';

describe('P1-HRM-PAGESIZE-CRYPTO-8088 — employees list cap', () => {
  it('HRM_API_MAX_PAGE_SIZE is 100 (Nest @Max)', () => {
    expect(HRM_API_MAX_PAGE_SIZE).toBe(100);
  });

  it('listAllEmployees is exported for paginated fetch', async () => {
    const mod = await import('@/integrations/hrmApi');
    expect(typeof mod.listAllEmployees).toBe('function');
    expect(typeof mod.listEmployees).toBe('function');
  });
});
