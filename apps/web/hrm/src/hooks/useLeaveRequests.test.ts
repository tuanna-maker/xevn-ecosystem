import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HRM_HOLDING_COMPANY_UUID } from '@/lib/hrmMetadataCompany';
import { buildLeaveCreatePayload, mapApiLeaveRequestToUi } from './useLeaveRequests';

const hooksDir = dirname(fileURLToPath(import.meta.url));

const baseForm = {
  employee_id: 'emp-2',
  employee_code: 'HLD-0006',
  employee_name: 'Huỳnh Văn An',
  leave_type: 'LVT_01',
  start_date: '2026-07-28',
  end_date: '2026-07-29',
  total_days: 2,
  reason: 'Nghỉ phép',
} as const;

describe('useLeaveRequests portal mode', () => {
  it('uses Nest leave-requests APIs from hrmApi via React Query', () => {
    const source = readFileSync(join(hooksDir, 'useLeaveRequests.ts'), 'utf8');
    expect(source).toContain('listLeaveRequests');
    expect(source).toContain('createLeaveRequest');
    expect(source).toContain('approveLeaveRequest');
    expect(source).toContain('rejectLeaveRequest');
    expect(source).toContain('useQuery');
    expect(source).toContain('buildLeaveCreatePayload');
    expect(source).toContain('resolveHrmLeaveCreateCompanyId');
    expect(source).toContain('toErrorMessage');
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

describe('D-HRM-LEAVE-REQ-CREATE-FE-01 — leave create company_id TEXT slug', () => {
  it('maps employee holding slug to holding TEXT when portal scope is main', () => {
    const payload = buildLeaveCreatePayload(
      { ...baseForm, company_id: 'holding' },
      'main',
    );
    expect(payload).not.toBeNull();
    expect(payload!.company_id).toBe('holding');
    expect(payload!.employee_code).toBe('HLD-0006');
    expect(payload!.leave_type).toBe('LVT_01');
    expect(payload!.company_id).not.toBe(HRM_HOLDING_COMPANY_UUID);
    expect(payload!.company_id).not.toBe('main');
  });

  it('maps portal rollup main → holding TEXT when employee company omitted', () => {
    const payload = buildLeaveCreatePayload({ ...baseForm }, 'main');
    expect(payload).not.toBeNull();
    expect(payload!.company_id).toBe('holding');
  });

  it('maps employee holding UUID → holding TEXT slug (Settings catalog partition)', () => {
    const payload = buildLeaveCreatePayload(
      { ...baseForm, company_id: HRM_HOLDING_COMPANY_UUID },
      'main',
    );
    expect(payload!.company_id).toBe('holding');
  });

  it('maps member company UUID to operating slug', () => {
    const uuid = '10000000-0000-4000-8000-000000000002';
    const payload = buildLeaveCreatePayload(
      { ...baseForm, company_id: uuid },
      'main',
    );
    expect(payload!.company_id).toBe('trsport');
  });

  it('returns null when company slug cannot be resolved', () => {
    expect(buildLeaveCreatePayload({ ...baseForm, company_id: 'unknown-slug' }, null)).toBeNull();
  });
});
