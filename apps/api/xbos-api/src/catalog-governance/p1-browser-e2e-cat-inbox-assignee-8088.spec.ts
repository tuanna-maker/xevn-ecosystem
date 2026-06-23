import { CatalogGovernanceService } from './catalog-governance.service';
import { WorkflowEngineService } from '../workflow-engine/workflow-engine.service';
import { GROUP_APPROVER_USER } from '../workflow-engine/workflow-catalog.constants';

/** P1-BROWSER-E2E-CAT-INBOX-ASSIGNEE-8088 — stale graph ceo@xevn.vn must not leak to inbox tasks */
describe('P1-BROWSER-E2E-CAT-INBOX-ASSIGNEE-8088 catalog governance assignee', () => {
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

  const staleGraph = {
    steps: [
      { stepKey: 'subsidiary_submit', order: 1, autoComplete: true },
      {
        stepKey: 'group_catalog_approval',
        hatKey: 'group_ceo',
        assigneeUserId: 'ceo@xevn.vn',
        order: 2,
      },
    ],
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.HRM_API_URL = 'http://127.0.0.1:28001';
    service = new CatalogGovernanceService(workflow);
    (workflow.findActiveDefinitionByCode as jest.Mock).mockResolvedValue({
      id: 'def-stale-1',
      name: 'Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN',
      graph: staleGraph,
    });
    (workflow.startInstance as jest.Mock).mockResolvedValue({ id: 'inst-assignee-fix' });
  });

  it('ensureXeDuLichCatalogWorkflow refreshes definition when graph assignee is stale', async () => {
    (workflow.upsertDefinition as jest.Mock).mockResolvedValue({
      id: 'def-stale-1',
      graph: {
        steps: [
          {
            stepKey: 'group_catalog_approval',
            assigneeUserId: GROUP_APPROVER_USER,
          },
        ],
      },
    });

    await service.ensureXeDuLichCatalogWorkflow();

    expect(workflow.upsertDefinition).toHaveBeenCalledWith(
      'xevn',
      'holding',
      'def-stale-1',
      expect.objectContaining({
        graph: expect.objectContaining({
          steps: expect.arrayContaining([
            expect.objectContaining({
              stepKey: 'group_catalog_approval',
              assigneeUserId: GROUP_APPROVER_USER,
            }),
          ]),
        }),
      }),
    );
  });

  it('startCatalogApprovalWorkflow spawns task for ceo@xe.vn even when definition graph has ceo@xevn.vn', async () => {
    (workflow.upsertDefinition as jest.Mock).mockResolvedValue({
      id: 'def-stale-1',
      graph: staleGraph,
    });

    jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('/batches/batch-assignee') && init?.method === 'GET') {
        return {
          ok: true,
          text: async () =>
            JSON.stringify({
              success: true,
              data: { batchId: 'batch-assignee', items: [{ code: 'ext_a', label: 'A' }] },
            }),
        } as Response;
      }
      if (url.includes('/batches/batch-assignee/workflow')) {
        return {
          ok: true,
          text: async () =>
            JSON.stringify({
              success: true,
              data: { batchId: 'batch-assignee', workflowInstanceId: 'inst-assignee-fix' },
            }),
        } as Response;
      }
      throw new Error(`unexpected fetch ${url}`);
    });

    await service.startCatalogApprovalWorkflow({
      batchId: 'batch-assignee',
      memberTenantId: 'xe-du-lich',
      memberCompanyId: 'main',
    });

    expect(workflow.startInstance).toHaveBeenCalledWith(
      'xevn',
      'holding',
      expect.objectContaining({
        steps: [
          expect.objectContaining({
            stepKey: 'group_catalog_approval',
            assigneeUserId: GROUP_APPROVER_USER,
          }),
        ],
      }),
    );
    expect(workflow.startInstance).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        steps: [expect.objectContaining({ assigneeUserId: 'ceo@xevn.vn' })],
      }),
    );
  });

  it('listApprovalInbox queries workflow engine with canonical assignee filter', async () => {
    (workflow.listStepTasks as jest.Mock).mockResolvedValue([{ id: 'task-1' }]);

    const out = await service.listApprovalInbox(GROUP_APPROVER_USER);

    expect(workflow.listStepTasks).toHaveBeenCalledWith({
      assigneeUserId: GROUP_APPROVER_USER,
      tenantId: 'xevn',
      status: 'pending',
      businessType: 'hrm_catalog_extension',
    });
    expect(out.items).toHaveLength(1);
  });
});
