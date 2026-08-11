import { HRM_COMPANY_UUID_BY_SLUG } from '../common/hrm-list-scope';
import {
  expandWorkflowResolverCompanyIds,
  LeaveWorkflowBridge,
} from './leave-workflow.bridge';

describe('expandWorkflowResolverCompanyIds', () => {
  it('maps main → holding + holding UUID', () => {
    const ids = expandWorkflowResolverCompanyIds('main');
    expect(ids).toEqual(expect.arrayContaining(['holding', HRM_COMPANY_UUID_BY_SLUG.holding]));
    expect(ids).not.toContain('main');
  });

  it('maps holding slug → slug + UUID', () => {
    const ids = expandWorkflowResolverCompanyIds('holding');
    expect(ids).toEqual(expect.arrayContaining(['holding', HRM_COMPANY_UUID_BY_SLUG.holding]));
  });

  it('maps pilot UUID → holding slug + UUID', () => {
    const ids = expandWorkflowResolverCompanyIds(HRM_COMPANY_UUID_BY_SLUG.holding);
    expect(ids).toEqual(expect.arrayContaining(['holding', HRM_COMPANY_UUID_BY_SLUG.holding]));
  });
});

describe('LeaveWorkflowBridge.ensureSchema G-DB-03', () => {
  function buildBridge(queryMock: jest.Mock) {
    return new LeaveWorkflowBridge(
      {} as never,
      { query: queryMock } as never,
      { onLeaveRequestDecided: jest.fn() } as never,
    );
  }

  it('CREATE TABLE leave_requests before ALTER workflow_instance_id on terminal callback', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] }) // CREATE
      .mockResolvedValueOnce({ rows: [] }) // ALTER
      .mockResolvedValueOnce({ rows: [{ status: 'approved' }] }); // SELECT status (already decided → skip)
    const bridge = buildBridge(queryMock);
    const out = await bridge.handleTerminalCallback({
      leaveRequestId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      terminalStatus: 'completed',
      reviewerUserId: 'ceo@xe.vn',
    });
    expect(out.applied).toBe(false);
    const ddl = queryMock.mock.calls.map((c) => String(c[0])).join('\n');
    const createIdx = ddl.indexOf('CREATE TABLE IF NOT EXISTS public.leave_requests');
    const alterIdx = ddl.indexOf('ADD COLUMN IF NOT EXISTS workflow_instance_id');
    expect(createIdx).toBeGreaterThanOrEqual(0);
    expect(alterIdx).toBeGreaterThan(createIdx);
    expect(ddl).toMatch(/company_id TEXT NOT NULL/);
  });
});

describe('LeaveWorkflowBridge.startLeaveWorkflowIfConfigured', () => {
  const leaveId = '35cc1f5c-2184-46fd-bc66-d0edf25e8a8f';
  const employeeId = '139ee909-df32-4467-81e1-dfb1281f604d';
  const instanceId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

  function buildBridge(queryMock: jest.Mock, fetchImpl: typeof fetch) {
    const catalogSync = {
      buildXbosUpstreamHeaders: jest.fn().mockReturnValue({
        Authorization: 'Bearer svc',
        'x-internal-api-key': 'xevn-dev-internal-key',
      }),
    };
    return {
      bridge: new LeaveWorkflowBridge(
        catalogSync as never,
        { query: queryMock } as never,
        { onLeaveRequestDecided: jest.fn() } as never,
      ),
      catalogSync,
      fetchImpl,
    };
  }

  it('D-HDSD-WF-LEAVE-BIND-01: spawn persists workflow_instance_id on success', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ workflow_instance_id: instanceId }] });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        code: 'XBOS-WF-201',
        data: { id: instanceId },
      }),
    });
    const prevFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;
    const { bridge, catalogSync } = buildBridge(queryMock, fetchMock);

    try {
      const out = await bridge.startLeaveWorkflowIfConfigured({
        leaveRequestId: leaveId,
        companyId: 'holding',
        employeeId,
        submitterUserId: 'ceo@xe.vn',
        tenantId: 'xevn',
        companySlug: 'main',
        authorization: 'Bearer portal',
      });
      expect(out).toEqual({ workflowInstanceId: instanceId });
      expect(catalogSync.buildXbosUpstreamHeaders).toHaveBeenCalledWith('Bearer portal', {
        tenantId: 'xevn',
        companyId: 'holding',
      });
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const hdrs = init.headers as Record<string, string>;
      expect(hdrs['x-tenant-id']).toBe('xevn');
      expect(hdrs['x-company-id']).toBe('holding');
      const body = JSON.parse(String(init.body));
      expect(body.context.memberCompanyId).toBe('holding');
      expect(body.context.entityCompanyId).toBe('holding');
      const updateCall = queryMock.mock.calls.find((c) =>
        String(c[0]).includes('SET workflow_instance_id'),
      );
      expect(updateCall?.[1]).toEqual([leaveId, instanceId]);
      expect(String(updateCall?.[0])).toContain('RETURNING workflow_instance_id');
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it('D-HDSD-WF-LEAVE-RESP-01: accepts XBOS data.instanceId envelope', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ workflow_instance_id: instanceId }] });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        code: 'XBOS-WF-201',
        data: { instanceId },
      }),
    });
    const prevFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;
    const { bridge } = buildBridge(queryMock, fetchMock);

    try {
      const out = await bridge.startLeaveWorkflowIfConfigured({
        leaveRequestId: leaveId,
        companyId: 'holding',
        employeeId,
        authorization: 'Bearer portal',
      });
      expect(out).toEqual({ workflowInstanceId: instanceId });
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
});

describe('LeaveWorkflowBridge.resolveManagerForWorkflow', () => {
  const employeeId = '8ac84520-0d6b-4737-8341-2f9a929b5f81';
  const managerUserId = 'uat.nv0001@xe.vn';
  const managerEmployeeId = '3796d949-1111-4111-8111-111111111111';

  function buildBridge(queryMock: jest.Mock) {
    return new LeaveWorkflowBridge(
      {} as never,
      { query: queryMock } as never,
      {} as never,
    );
  }

  it('CD-FB-07: company_id=holding (TEXT slug) uses ANY(text[]) — never ::uuid', async () => {
    const queryMock = jest.fn().mockResolvedValue({
      rows: [{ manager_user_id: managerUserId, manager_employee_id: managerEmployeeId }],
    });
    const bridge = buildBridge(queryMock);

    const result = await bridge.resolveManagerForWorkflow(employeeId, 'holding');

    expect(result).toEqual({
      manager_user_id: managerUserId,
      manager_employee_id: managerEmployeeId,
    });
    const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/e\.company_id = ANY\(\$\d+::text\[\]\)/);
    expect(sql).not.toMatch(/e\.company_id\s*=\s*\$\d+::uuid/);
    expect(params[0]).toBe(employeeId);
    expect(params[1]).toEqual(expect.arrayContaining(['holding', HRM_COMPANY_UUID_BY_SLUG.holding]));
  });

  it('CD-FB-07: company_id=<holding UUID> expands to slug match → manager 200 payload', async () => {
    const queryMock = jest.fn().mockResolvedValue({
      rows: [{ manager_user_id: managerUserId, manager_employee_id: managerEmployeeId }],
    });
    const bridge = buildBridge(queryMock);

    const result = await bridge.resolveManagerForWorkflow(
      employeeId,
      HRM_COMPANY_UUID_BY_SLUG.holding,
    );

    expect(result.manager_user_id).toBe(managerUserId);
    const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/e\.company_id = ANY\(\$\d+::text\[\]\)/);
    expect(sql).not.toMatch(/e\.company_id\s*=\s*\$\d+::uuid/);
    expect(params[1]).toEqual(expect.arrayContaining(['holding', HRM_COMPANY_UUID_BY_SLUG.holding]));
  });

  it('omits company filter when company_id absent', async () => {
    const queryMock = jest.fn().mockResolvedValue({
      rows: [{ manager_user_id: managerUserId, manager_employee_id: managerEmployeeId }],
    });
    const bridge = buildBridge(queryMock);

    await bridge.resolveManagerForWorkflow(employeeId);

    const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]];
    expect(sql).not.toContain('company_id');
    expect(params).toEqual([employeeId]);
  });
});
