import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { WorkflowEngineService } from './workflow-engine.service';

describe('WorkflowEngineService (UC-XBOS-13 / W3-5)', () => {
  const query = jest.fn();
  const service = new WorkflowEngineService({ query } as unknown as XbosDbService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates definition with graph object without unused SQL params (W3-5)', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'def-1', name: 'QA WF', workflow_code: 'QA-WF' }] });
    const result = await service.upsertDefinition('xevn', 'main', 'def-1', {
      name: 'QA WF',
      code: 'QA-WF',
      graph: { nodes: [{ id: 'start', type: 'start' }], edges: [] },
      status: 'active',
    });
    expect(result).toMatchObject({ id: 'def-1' });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE public.xbos_workflow_definition'),
      expect.arrayContaining(['def-1', 'xevn', 'QA WF']),
    );
    const params = query.mock.calls[0][1] as unknown[];
    expect(params).toHaveLength(8);
    expect(typeof params[5]).toBe('string');
    expect(JSON.parse(String(params[5]))).toMatchObject({ nodes: expect.any(Array) });
  });

  it('accepts workflow_code alias on create', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'new-def' }] });
    await service.upsertDefinition('xevn', null, null, {
      workflow_code: 'WF-DEMO',
      name: 'Demo',
      graph: {},
    });
    expect(query.mock.calls[0][1]).toEqual(
      expect.arrayContaining(['xevn', 'WF-DEMO', 'Demo']),
    );
  });

  it('requires name on PUT', async () => {
    await expect(
      service.upsertDefinition('xevn', 'main', 'def-1', { code: 'WF-1', graph: {} }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-WF-400',
      getStatus: expect.any(Function),
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('returns 404 when UPDATE matches no row', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(
      service.upsertDefinition('xevn', 'main', '00000000-0000-4000-8000-000000000099', {
        name: 'Missing',
        graph: {},
      }),
    ).rejects.toMatchObject({ code: 'XBOS-WF-404' });
  });
});
