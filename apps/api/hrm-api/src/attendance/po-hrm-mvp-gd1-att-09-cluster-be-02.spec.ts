import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HRM_ATT_SHEET_LOCKED } from './leave-attendance-funnel.service';
import { LeaveRequestsService } from './leave-requests.service';

function noopBridge() {
  return { startLeaveWorkflowIfConfigured: jest.fn().mockResolvedValue(null) };
}

describe('PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02', () => {
  it('approveLeaveRequest: defer funnel HRM-ATT-SHEET-LOCKED but settle still succeeds (203 path)', async () => {
    const requestId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const approvedRow = {
      id: requestId,
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      employee_code: 'NV0001',
      employee_name: 'Nguyen Van A',
      leave_type: 'annual',
      start_date: '2026-09-07',
      end_date: '2026-09-08',
      reason: null,
      status: 'approved',
      requested_at: '2026-09-01T00:00:00.000Z',
      reviewed_at: '2026-09-02T00:00:00.000Z',
      reviewed_by: 'CEO',
      department: null,
      position: null,
      total_days: '2',
      handover_to: null,
      handover_tasks: null,
      approver_employee_id: null,
      rejected_reason: null,
      attachment_url: null,
    };
    const queryMock = jest.fn().mockImplementation((sql: string) => {
      const s = String(sql);
      if (s.includes('SELECT company_id::text')) {
        return Promise.resolve({
          rows: [{ company_id: 'holding', status: 'pending' }],
        });
      }
      if (s.includes("SET status = 'approved'")) {
        return Promise.resolve({ rows: [approvedRow] });
      }
      if (s.includes('CREATE TABLE') || s.includes('CREATE INDEX')) {
        return Promise.resolve({ rows: [] });
      }
      if (
        s.includes('UPDATE public.employee_leave_balances') &&
        s.includes('used_days')
      ) {
        return Promise.resolve({ rowCount: 1, rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });
    const fanoutMock = {
      onLeaveRequestDecided: jest.fn().mockResolvedValue(undefined),
    };
    const funnelMock = {
      materializeApprovedLeave: jest
        .fn()
        .mockRejectedValue(
          new ApiException(
            HRM_ATT_SHEET_LOCKED,
            'sheet locked',
            HttpStatus.CONFLICT,
          ),
        ),
    };
    const svc = new LeaveRequestsService(
      { query: queryMock } as never,
      fanoutMock as never,
      noopBridge() as never,
      undefined,
      undefined,
      undefined,
      funnelMock as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = await svc.approveLeaveRequest(
      requestId,
      { reviewer_name: 'CEO' },
      'main',
      `Bearer ${token}`,
      'xevn',
    );
    expect(row.status).toBe('approved');
    expect(row.leave_funnel_deferred).toBe(true);
    expect(row.leave_funnel_deferred_code).toBe(HRM_ATT_SHEET_LOCKED);
    expect(funnelMock.materializeApprovedLeave).toHaveBeenCalled();
    const settle = queryMock.mock.calls.find(
      (c) =>
        String(c[0]).includes('UPDATE public.employee_leave_balances') &&
        String(c[0]).includes('used_days = used_days +'),
    );
    expect(settle).toBeDefined();
  });
});
