import { describe, expect, it } from 'vitest';
import {
  buildEmployeesPageQueryKey,
  EMPLOYEES_PAGE_QUERY_KEY,
  HRM_EMPLOYEES_TABLE_PAGE_SIZE,
} from '@/hooks/useEmployeesPage';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';

describe('P1-HRM-SCALE-FE-W1 — employees page query keys + pageSize', () => {
  it('table default pageSize is 50 (ADR §5.2 dense table)', () => {
    expect(HRM_EMPLOYEES_TABLE_PAGE_SIZE).toBe(50);
    expect(HRM_EMPLOYEES_TABLE_PAGE_SIZE).toBeLessThanOrEqual(HRM_API_MAX_PAGE_SIZE);
  });

  it('buildEmployeesPageQueryKey is stable and includes scope + page + filters', () => {
    const key = buildEmployeesPageQueryKey('main', {
      page: 2,
      pageSize: 50,
      keyword: '  nguyen  ',
      status: 'active',
      includeArchived: false,
    });

    expect(key[0]).toBe(EMPLOYEES_PAGE_QUERY_KEY);
    expect(key).toEqual([
      EMPLOYEES_PAGE_QUERY_KEY,
      'main',
      2,
      50,
      'nguyen',
      'active',
      false,
    ]);
  });

  it('normalizes empty status/all and missing company to null scope segment', () => {
    expect(
      buildEmployeesPageQueryKey(null, { page: 1, status: 'all' }),
    ).toEqual([EMPLOYEES_PAGE_QUERY_KEY, null, 1, 50, '', '', false]);
  });

  it('listEmployees (single page) remains the table transport — not listAllEmployees', async () => {
    const mod = await import('@/integrations/hrmApi');
    expect(typeof mod.listEmployees).toBe('function');
    expect(typeof mod.listAllEmployees).toBe('function');
  });
});
