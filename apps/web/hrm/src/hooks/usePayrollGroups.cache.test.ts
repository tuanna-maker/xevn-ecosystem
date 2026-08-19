import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import type { HrmPayrollGroupApiRow } from '@/integrations/hrmApi';
import {
  payrollGroupsQueryKey,
  upsertPayrollGroupInListCache,
} from '@/hooks/usePayrollGroups';

const baseRow = (id: string, code: string): HrmPayrollGroupApiRow => ({
  id,
  company_id: 'main',
  code,
  name_vi: `Nhóm ${code}`,
  priority: 0,
  match_rule_json: {},
  status: 'active',
  created_at: '2026-08-10T00:00:00.000Z',
  updated_at: '2026-08-10T00:00:00.000Z',
});

describe('PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01 cache', () => {
  it('payrollGroupsQueryKey omits undefined status segment', () => {
    expect(payrollGroupsQueryKey('main')).toEqual(['payroll-groups', 'main']);
    expect(payrollGroupsQueryKey('main', 'active')).toEqual(['payroll-groups', 'main', 'active']);
  });

  it('upsertPayrollGroupInListCache appends then replaces by id', () => {
    const qc = new QueryClient();
    const key = payrollGroupsQueryKey('main');
    qc.setQueryData(key, [baseRow('a', 'OLD')]);

    upsertPayrollGroupInListCache(qc, 'main', baseRow('b', 'NEW'));
    expect(qc.getQueryData<HrmPayrollGroupApiRow[]>(key)?.map((r) => r.id)).toEqual(['a', 'b']);

    upsertPayrollGroupInListCache(qc, 'main', { ...baseRow('b', 'NEW'), name_vi: 'Đổi tên' });
    expect(qc.getQueryData<HrmPayrollGroupApiRow[]>(key)?.find((r) => r.id === 'b')?.name_vi).toBe('Đổi tên');
  });
});
