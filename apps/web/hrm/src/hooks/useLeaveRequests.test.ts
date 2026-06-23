import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { mapApiLeaveRequestToUi } from './useLeaveRequests';

const hooksDir = dirname(fileURLToPath(import.meta.url));

describe('useLeaveRequests portal mode', () => {
  it('uses Nest leave-requests APIs from hrmApi', () => {
    const source = readFileSync(join(hooksDir, 'useLeaveRequests.ts'), 'utf8');
    expect(source).toContain('listLeaveRequests');
    expect(source).toContain('createLeaveRequest');
    expect(source).toContain('approveLeaveRequest');
    expect(source).toContain('rejectLeaveRequest');
    expect(source).not.toContain('setRequests(data || [])');
    expect(source).not.toContain('@/integrations/supabase/client');
  });

  it('maps Nest leave row to attendance LeaveRequest UI model', () => {
    const mapped = mapApiLeaveRequestToUi({
      id: 'lr-2',
      company_id: 'main',
      employee_id: 'emp-2',
      employee_code: 'LOG-0002',
      employee_name: 'Trần Thị B',
      leave_type: 'sick',
      start_date: '2026-06-08',
      end_date: '2026-06-08',
      reason: 'Ốm',
      status: 'approved',
      requested_at: '2026-06-07T08:00:00.000Z',
      reviewed_at: '2026-06-07T10:00:00.000Z',
      reviewed_by: 'HR Manager',
      department: 'Ops',
      position: 'Staff',
      total_days: '1',
      handover_to: 'colleague',
      handover_tasks: 'handover tasks',
      approver_employee_id: 'mgr-1',
      rejected_reason: null,
    });
    expect(mapped.total_days).toBe(1);
    expect(mapped.approved_at).toBe('2026-06-07T10:00:00.000Z');
    expect(mapped.approver_name).toBe('HR Manager');
  });
});
