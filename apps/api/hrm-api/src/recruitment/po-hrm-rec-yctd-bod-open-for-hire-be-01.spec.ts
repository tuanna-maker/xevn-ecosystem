/**
 * PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01 — out_of_plan WF terminal unlocks UV mutate gate.
 */
import { assertYctdReceivableForMutateOrThrow } from './yctd-requisition-gates';
import {
  RecruitmentWorkflowBridge,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
} from './recruitment-workflow.bridge';

describe('PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01', () => {
  it('mutate gate: open_for_hire out_of_plan passes (no HRM-YCTD-BOD-REQUIRED)', () => {
    expect(() =>
      assertYctdReceivableForMutateOrThrow({
        status: 'open_for_hire',
        headcount_mode: 'out_of_plan',
      }),
    ).not.toThrow();
  });

  it('mutate gate: approved out_of_plan still blocked (manual path without bod_complete)', () => {
    expect(() =>
      assertYctdReceivableForMutateOrThrow({
        status: 'approved',
        headcount_mode: 'out_of_plan',
      }),
    ).toThrow();
  });

  it('terminal: single inbox complete on pending out_of_plan → open_for_hire', async () => {
    const instanceId = 'c5e626cf-90b8-44b6-94c0-6cc82214d452';
    const requisitionId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const queryMock = jest.fn(async (sql: string) => {
      if (sql.includes('SELECT status') && sql.includes('job_requisitions')) {
        return {
          rows: [
            {
              status: 'pending_approval',
              workflow_instance_id: instanceId,
              headcount_mode: 'out_of_plan',
              pipeline_flags_json: { cv_intake_allowed: false },
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.job_requisitions')) {
        return { rows: [{ status: 'open_for_hire' }] };
      }
      if (sql.includes('ALTER TABLE') || sql.includes('CREATE INDEX') || sql.includes('DO $$')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const bridge = new RecruitmentWorkflowBridge(
      { buildXbosUpstreamHeaders: jest.fn() } as never,
      { query: queryMock } as never,
    );

    const result = await bridge.handleTerminalCallback({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: requisitionId,
      workflowInstanceId: instanceId,
      terminalStatus: 'completed',
      reviewerUserId: 'ceo@xe.vn',
    });

    expect(result.status).toBe('open_for_hire');
    const updateCall = queryMock.mock.calls.find((c) =>
      String(c[0]).includes('UPDATE public.job_requisitions'),
    );
    const flags = JSON.parse(String(updateCall?.[1]?.[3] ?? '{}')) as {
      cv_intake_allowed?: boolean;
    };
    expect(flags.cv_intake_allowed).toBe(true);
  });
});
