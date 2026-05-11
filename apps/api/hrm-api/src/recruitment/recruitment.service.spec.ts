import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentService } from './recruitment.service';

describe('RecruitmentService', () => {
  let service: RecruitmentService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new RecruitmentService(db);
  });

  it('throws deterministic error when requisition does not exist for candidate creation', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.createCandidate({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        requisition_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        full_name: 'Candidate One',
        email: 'candidate@xevn.vn',
        source: 'linkedin',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-404' });
  });

  it('throws deterministic error when interview does not exist for status update', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.updateInterviewStatus('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', { status: 'passed' }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-406' });
  });

  it('returns paginated candidates with optional requisition filter', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({
        rows: [{ total: '1' }],
      } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'c1',
            company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
            requisition_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
            full_name: 'Candidate One',
            email: 'candidate@xevn.vn',
            source: 'linkedin',
            status: 'new',
            created_at: '2026-04-23T00:00:00.000Z',
            updated_at: '2026-04-23T00:00:00.000Z',
          },
        ],
      } as never);

    const result = await service.listCandidates({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      requisition_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      page: 2,
      page_size: 10,
    });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.page_size).toBe(10);
    expect(result.data[0]).toMatchObject({ id: 'c1', status: 'new' });
    expect(db.query).toHaveBeenLastCalledWith(expect.stringContaining('LIMIT $3 OFFSET $4'), expect.any(Array));
  });
});
