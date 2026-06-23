import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  buildLeaveRequestsQuery,
  mapApiLeaveRequestToDashboardRow,
} from './useLeaveRequestsData';

const hooksDir = dirname(fileURLToPath(import.meta.url));

describe('useLeaveRequestsData portal mode', () => {
  it('uses listLeaveRequests from hrmApi instead of Supabase query stub', () => {
    const source = readFileSync(join(hooksDir, 'useLeaveRequestsData.ts'), 'utf8');
    expect(source).toContain('listLeaveRequests');
    expect(source).not.toContain('await query');
    expect(source).not.toContain('@/integrations/supabase/client');
  });

  it('buildLeaveRequestsQuery coerces group scope and optional status filter', () => {
    expect(buildLeaveRequestsQuery('holding')).toEqual({ company_id: 'main' });
    expect(buildLeaveRequestsQuery('main', 'pending')).toEqual({
      company_id: 'main',
      status: 'pending',
    });
  });

  it('maps Nest leave row to dashboard shape with numeric total_days', () => {
    const mapped = mapApiLeaveRequestToDashboardRow({
      id: 'lr-1',
      company_id: 'main',
      employee_id: 'emp-1',
      employee_code: 'LOG-0001',
      employee_name: 'Nguyễn Văn A',
      leave_type: 'annual',
      start_date: '2026-06-10',
      end_date: '2026-06-12',
      reason: 'Nghỉ phép',
      status: 'pending',
      requested_at: '2026-06-07T00:00:00.000Z',
      reviewed_at: null,
      reviewed_by: null,
      department: 'IT',
      position: 'Dev',
      total_days: '3',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
    });
    expect(mapped.total_days).toBe(3);
    expect(mapped.employee_name).toBe('Nguyễn Văn A');
    expect(mapped.status).toBe('pending');
  });
});
