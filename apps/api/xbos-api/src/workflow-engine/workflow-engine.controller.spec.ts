import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { WorkflowEngineController } from './workflow-engine.controller';
import { WorkflowEngineService } from './workflow-engine.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('WorkflowEngineController (UC-XBOS-WF)', () => {
  let controller: WorkflowEngineController;

  const serviceMock = {
    listDefinitions: jest.fn().mockResolvedValue([]),
    upsertDefinition: jest.fn().mockResolvedValue({ id: 'def-1' }),
    startInstance: jest.fn().mockResolvedValue({ id: 'inst-1', status: 'running' }),
    listInstances: jest.fn().mockResolvedValue([]),
    listStepTasks: jest.fn().mockResolvedValue([]),
    getInstanceWithTasks: jest.fn().mockResolvedValue({ id: 'inst-1', tasks: [] }),
    completeStepTask: jest.fn().mockResolvedValue({ id: 'task-1', status: 'completed' }),
    rejectStepTask: jest.fn().mockResolvedValue({ id: 'task-1', status: 'rejected' }),
    listReportingRoutes: jest.fn().mockResolvedValue([]),
    upsertReportingRoute: jest.fn().mockResolvedValue({ id: 'route-1' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowEngineController],
      providers: [{ provide: WorkflowEngineService, useValue: serviceMock }],
    }).compile();
    controller = module.get<WorkflowEngineController>(WorkflowEngineController);
  });

  it('rejects unauthenticated task list', async () => {
    await expect(controller.listTasks(undefined, undefined, 'pending', undefined, undefined, undefined)).rejects.toMatchObject<
      ApiException
    >({ code: 'XBOS-AUTH-001' });
    expect(serviceMock.listStepTasks).not.toHaveBeenCalled();
  });

  it('UC-XBOS-WF-01: creates workflow definition on canvas', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.createDefinition(
      {
        definitionKey: 'CAT-APPROVAL',
        name: 'Catalog approval',
        steps: [{ stepKey: 'review', roleHat: 'catalog_approver' }],
        payload: { graph: { nodes: [], edges: [] } },
      },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-WF-201');
    expect(serviceMock.upsertDefinition).toHaveBeenCalledWith(
      'xevn',
      'holding',
      null,
      expect.objectContaining({ definitionKey: 'CAT-APPROVAL' }),
    );
  });

  it('UC-XBOS-13: updates definition with steps via PUT', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.updateDefinition(
      'def-1',
      {
        definitionKey: 'CAT-APPROVAL',
        steps: [{ stepKey: 'review', roleHat: 'catalog_approver' }],
      },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-WF-201');
    expect(serviceMock.upsertDefinition).toHaveBeenCalledWith(
      'xevn',
      'holding',
      'def-1',
      expect.objectContaining({ definitionKey: 'CAT-APPROVAL' }),
    );
  });

  it('W3-5: PUT definition accepts graph-only body (portal probe shape)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const result = await controller.updateDefinition(
      '00000000-0000-4000-8000-000000000001',
      {
        name: 'QA WF',
        code: 'QA-WF',
        graph: { nodes: [{ id: 'start', type: 'start' }], edges: [] },
        status: 'active',
      },
      'xevn',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-WF-201');
    expect(serviceMock.upsertDefinition).toHaveBeenCalledWith(
      'xevn',
      'main',
      '00000000-0000-4000-8000-000000000001',
      expect.objectContaining({ name: 'QA WF', code: 'QA-WF' }),
    );
  });

  it('UC-XBOS-CC-06: persists canvas graph payload on definition save', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const graph = { nodes: [{ id: 'n1' }], edges: [] };
    await controller.updateDefinition(
      'def-canvas',
      { definitionKey: 'CC-WF', payload: { graph } },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(serviceMock.upsertDefinition).toHaveBeenCalledWith(
      'xevn',
      'holding',
      'def-canvas',
      expect.objectContaining({ payload: { graph } }),
    );
  });

  it('UC-XBOS-14: lists running workflow instances', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.listInstances('running', 'xevn', 'holding', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-WF-200');
    expect(serviceMock.listInstances).toHaveBeenCalledWith('xevn', 'holding', 'running');
  });

  it('UC-XBOS-15: lists reporting routes with scope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.listRoutes('xevn', 'holding', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-WF-200');
    expect(serviceMock.listReportingRoutes).toHaveBeenCalledWith('xevn', 'holding');
  });

  it('UC-XBOS-15: upserts reporting route configuration', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.createRoute(
      { routeKey: 'exec-summary', rollupTargets: ['holding'] },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-WF-201');
    expect(serviceMock.upsertReportingRoute).toHaveBeenCalledWith(
      'xevn',
      'holding',
      expect.objectContaining({ routeKey: 'exec-summary' }),
    );
  });

  it('rejects scope mismatch on definition list', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.listDefinitions('xevn', 'main', `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.listDefinitions).not.toHaveBeenCalled();
  });

  it('UC-XBOS-WF-02: lists workflow definitions with scope', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.listDefinitions('xevn', 'holding', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-WF-200');
    expect(serviceMock.listDefinitions).toHaveBeenCalledWith('xevn', 'holding');
  });

  it('UC-XBOS-WF-03: starts workflow instance', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.startInstance(
      { workflowCode: 'CAT-APPROVAL', businessType: 'catalog_extension', businessId: 'ext-1' },
      'xevn',
      'holding',
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-WF-201');
    expect(serviceMock.startInstance).toHaveBeenCalledWith(
      'xevn',
      'holding',
      expect.objectContaining({ workflowCode: 'CAT-APPROVAL' }),
    );
  });

  it('UC-XBOS-WF-04: completes step task', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    const result = await controller.completeTask(
      'task-1',
      { decision: 'approve', comment: 'ok' },
      `Bearer ${token}`,
      'test-key',
    );
    expect(result.code).toBe('XBOS-WF-200');
    expect(serviceMock.completeStepTask).toHaveBeenCalledWith('task-1', expect.objectContaining({ decision: 'approve' }));
  });

  it('UC-XBOS-WF-05: loads instance detail', async () => {
    const result = await controller.instanceDetail('inst-1', undefined, 'test-key');
    expect(result.code).toBe('XBOS-WF-204');
    expect(serviceMock.getInstanceWithTasks).toHaveBeenCalledWith('inst-1');
  });

  it('UC-XBOS-WF-06: rejects step task', async () => {
    const result = await controller.rejectTask('task-2', { comment: 'no' }, undefined, 'test-key');
    expect(result.code).toBe('XBOS-WF-205');
    expect(serviceMock.rejectStepTask).toHaveBeenCalledWith('task-2', expect.objectContaining({ comment: 'no' }));
  });

  it('UC-CC-P0-06: lists pending inbox tasks', async () => {
    const result = await controller.listTasks(undefined, 'xevn', 'pending', 'catalog_extension', undefined, 'test-key');
    expect(result.code).toBe('XBOS-WF-203');
    expect(serviceMock.listStepTasks).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'xevn', status: 'pending', businessType: 'catalog_extension' }),
    );
  });
});
