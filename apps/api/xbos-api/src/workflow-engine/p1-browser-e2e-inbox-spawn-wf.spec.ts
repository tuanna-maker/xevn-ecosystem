import { XbosDbService } from '../db/xbos-db.service';
import {
  GROUP_APPROVER_USER,
  WF_BUSINESS_TYPE_DEFINITION_REVIEW,
} from './workflow-catalog.constants';
import { WorkflowEngineService } from './workflow-engine.service';

/** P1-BROWSER-E2E-INBOX-08-09 — UF-XBOS-08 definition save spawns inbox (U64 no seed). */
describe('P1-BROWSER-E2E-INBOX-08 UF-XBOS-08 workflow spawn', () => {
  const query = jest.fn();
  const service = new WorkflowEngineService({ query } as unknown as XbosDbService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('spawns pending inbox task when active definition is created from canvas save', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ max_v: null }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'def-qa-r4',
            workflow_code: 'QA-R4-WF-493761',
            name: 'QA R4 Workflow Browser',
            status: 'active',
            graph: {
              steps: [
                {
                  id: 'wf-step-1',
                  order: 1,
                  handlerRoleId: 'dept_head',
                  taskName: 'Trưởng BP duyệt',
                },
                {
                  id: 'wf-step-2',
                  order: 2,
                  handlerRoleId: 'bod',
                  taskName: 'HĐQT phê duyệt',
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ exists: false }] })
      .mockResolvedValueOnce({ rows: [{ id: 'inst-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'task-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'task-2' }] });

    const saved = await service.upsertDefinition('xevn', 'main', null, {
      workflowCode: 'QA-R4-WF-493761',
      name: 'QA R4 Workflow Browser',
      status: 'active',
      graph: {
        steps: [
          { id: 'wf-step-1', order: 1, handlerRoleId: 'dept_head' },
          { id: 'wf-step-2', order: 2, handlerRoleId: 'bod' },
        ],
      },
    });

    expect(saved).toMatchObject({ id: 'def-qa-r4' });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.xbos_workflow_instance'),
      expect.arrayContaining(['xevn', 'holding', 'def-qa-r4', WF_BUSINESS_TYPE_DEFINITION_REVIEW, 'def-qa-r4']),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.xbos_workflow_step_task'),
      expect.arrayContaining(['inst-1', 'wf-step-1', 'dept_head', GROUP_APPROVER_USER]),
    );
  });

  it('does not duplicate inbox task when pending task already exists on create', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ max_v: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ id: 'def-existing', workflow_code: 'WF-EXIST', name: 'Existing', status: 'active', graph: {} }],
      })
      .mockResolvedValueOnce({ rows: [{ exists: true }] });

    await service.upsertDefinition('xevn', 'holding', null, {
      workflowCode: 'WF-EXIST',
      name: 'Existing',
      status: 'active',
      graph: { steps: [{ id: 's1', order: 1, handlerRoleId: 'bod' }] },
    });

    expect(query).toHaveBeenCalledTimes(3);
    expect(String(query.mock.calls[2]?.[0] ?? '')).toContain('EXISTS');
  });

  it('skips spawn when definition status is draft', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ max_v: null }] })
      .mockResolvedValueOnce({
        rows: [{ id: 'def-draft', workflow_code: 'WF-DRAFT', name: 'Draft', status: 'draft', graph: {} }],
      });

    await service.upsertDefinition('xevn', 'main', null, {
      workflowCode: 'WF-DRAFT',
      name: 'Draft',
      status: 'draft',
      graph: {},
    });

    expect(query).toHaveBeenCalledTimes(2);
  });
});
