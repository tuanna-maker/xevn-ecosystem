import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ATTENDANCE_SHEETS_QUERY_KEY,
  buildAttendanceSheetsQueryKey,
} from './useAttendanceSheets';
import {
  LEAVE_REQUESTS_QUERY_KEY,
  buildLeaveRequestsQuery,
  buildLeaveRequestsQueryKey,
  mapApiLeaveRequestToUi,
} from './useLeaveRequests';

const hooksDir = dirname(fileURLToPath(import.meta.url));

describe('D-HRM-ATT-LEAVE-FETCH-STORM — leave / sheets fetch stability', () => {
  it('leave-requests uses React Query with stable company queryKey (no toast/h fetch deps)', () => {
    const source = readFileSync(join(hooksDir, 'useLeaveRequests.ts'), 'utf8');
    expect(source).toContain('useQuery');
    expect(source).toContain('LEAVE_REQUESTS_QUERY_KEY');
    expect(source).toContain('refetchOnWindowFocus: false');
    expect(source).not.toContain('}, [currentCompanyId, toast, t, h]);');
    expect(source).not.toContain('useEffect(() => { void fetchRequests(); }, [fetchRequests]);');
  });

  it('attendance-sheets uses React Query with stable company queryKey (no toast/h fetch deps)', () => {
    const source = readFileSync(join(hooksDir, 'useAttendanceSheets.ts'), 'utf8');
    expect(source).toContain('useQuery');
    expect(source).toContain('ATTENDANCE_SHEETS_QUERY_KEY');
    expect(source).toContain('refetchOnWindowFocus: false');
    expect(source).not.toContain('}, [currentCompanyId, toast, t, h]);');
    expect(source).not.toContain('void fetchSheets();');
  });

  it('builds stable leave and sheets query keys for singleflight', () => {
    expect(LEAVE_REQUESTS_QUERY_KEY).toBe('leave-requests');
    expect(ATTENDANCE_SHEETS_QUERY_KEY).toBe('attendance-sheets');
    expect(buildLeaveRequestsQueryKey('main')).toEqual(['leave-requests', 'main', '']);
    expect(buildLeaveRequestsQueryKey('main', 'pending')).toEqual([
      'leave-requests',
      'main',
      'pending',
    ]);
    expect(buildAttendanceSheetsQueryKey('main')).toEqual(['attendance-sheets', 'main']);
    expect(buildLeaveRequestsQuery('holding')).toEqual({ company_id: 'main' });
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
