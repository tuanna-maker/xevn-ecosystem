import { CatalogGovernanceService } from './catalog-governance.service';
import { WorkflowEngineService } from '../workflow-engine/workflow-engine.service';

/** P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6 — UF-XBOS-09/15 HRM batch scope on S2S fetch */
describe('P1-BROWSER-E2E-CAT-INBOX-SPAWN-R6 catalog governance HRM upstream', () => {
  const workflow = {
    findActiveDefinitionByCode: jest.fn(),
    upsertDefinition: jest.fn(),
    startInstance: jest.fn(),
    listStepTasks: jest.fn(),
    getInstanceWithTasks: jest.fn(),
    getTaskById: jest.fn(),
    completeStepTask: jest.fn(),
    rejectStepTask: jest.fn(),
  } as unknown as WorkflowEngineService;

  let service: CatalogGovernanceService;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.HRM_API_URL = 'http://127.0.0.1:28001';
    service = new CatalogGovernanceService(workflow);
    (workflow.findActiveDefinitionByCode as jest.Mock).mockResolvedValue({
      id: 'def-cat-1',
      graph: {
        steps: [
          {
            stepKey: 'group_catalog_approval',
            hatKey: 'group_ceo',
            assigneeUserId: 'ceo@xe.vn',
          },
        ],
      },
    });
    (workflow.startInstance as jest.Mock).mockResolvedValue({ id: 'inst-cat-r6' });
  });

  it('startCatalogApprovalWorkflow passes member tenant/company headers to HRM batch GET+POST', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (input, init) => {
        const url = String(input);
        if (url.includes('/batches/batch-r6') && init?.method === 'GET') {
          const headers = init.headers as Record<string, string>;
          expect(headers['x-tenant-id']).toBe('xe-du-lich');
          expect(headers['x-company-id']).toBe('main');
          expect(headers['x-internal-api-key']).toBe('test-key');
          return {
            ok: true,
            text: async () =>
              JSON.stringify({
                success: true,
                data: { batchId: 'batch-r6', items: [{ code: 'ext_qa', label: 'QA' }] },
              }),
          } as Response;
        }
        if (url.includes('/batches/batch-r6/workflow')) {
          const headers = init?.headers as Record<string, string>;
          expect(headers['x-tenant-id']).toBe('xe-du-lich');
          expect(headers['x-company-id']).toBe('main');
          return {
            ok: true,
            text: async () =>
              JSON.stringify({
                success: true,
                data: { batchId: 'batch-r6', workflowInstanceId: 'inst-cat-r6' },
              }),
          } as Response;
        }
        throw new Error(`unexpected fetch ${url}`);
      });

    const out = await service.startCatalogApprovalWorkflow({
      batchId: 'batch-r6',
      memberTenantId: 'xe-du-lich',
      memberCompanyId: 'main',
      requesterUserId: 'ceo@xe.vn',
    });

    expect(out.workflowInstanceId).toBe('inst-cat-r6');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(workflow.startInstance).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        businessId: 'batch-r6',
        context: expect.objectContaining({
          memberTenantId: 'xe-du-lich',
          memberCompanyId: 'main',
          itemCount: 1,
        }),
        steps: [
          expect.objectContaining({
            stepKey: 'group_catalog_approval',
            assigneeUserId: 'ceo@xe.vn',
          }),
        ],
      }),
    );
  });
});
