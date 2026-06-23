import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
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
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.createCandidate({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        requisition_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        full_name: 'Candidate One',
        email: 'candidate@xe.vn',
        source: 'linkedin',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-404' });
  });

  it('throws deterministic error when interview does not exist for status update', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.updateInterviewStatus('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', { status: 'passed' }, 'main'),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-406' });
  });

  it('rejects interview status update when row company_id is outside rollup scope (P1-02)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_interviews WHERE id')) {
        return { rows: [{ company_id: 'other-co' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.updateInterviewStatus(
        '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        { status: 'passed' },
        'main',
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-409' });
  });

  it('updates holding requisition status when group CEO uses company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const requisitionId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT company_id::text AS company_id FROM public.job_requisitions')) {
        return { rows: [{ company_id: 'holding' }] } as never;
      }
      if (sql.includes('UPDATE public.job_requisitions')) {
        return {
          rows: [
            {
              id: requisitionId,
              company_id: 'holding',
              title: 'Backend Engineer',
              department: 'Engineering',
              employment_type: 'full_time',
              status: 'on_hold',
              created_at: '2026-04-23T00:00:00.000Z',
              updated_at: '2026-06-07T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.updateJobRequisition(
      requisitionId,
      { status: 'on_hold' },
      { company_id: 'main' },
      `Bearer ${token}`,
    );

    expect(result.status).toBe('on_hold');
    expect(result.company_id).toBe('holding');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining(['on_hold', requisitionId, expect.any(Array)]),
    );
  });

  it('throws deterministic error when requisition does not exist for status update', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT company_id::text AS company_id FROM public.job_requisitions')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.updateJobRequisition(
        '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        { status: 'closed' },
        { company_id: 'main' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-REC-404' });
  });

  it('returns paginated candidates with optional requisition filter', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
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
            email: 'candidate@xe.vn',
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

  it('finds holding requisition when group CEO creates candidate with company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const requisitionId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.job_requisitions WHERE') && sql.includes('LIMIT 1')) {
        return { rows: [{ id: requisitionId, company_id: 'holding' }] } as never;
      }
      if (sql.includes('INSERT INTO public.recruitment_candidates')) {
        return {
          rows: [
            {
              id: 'c1',
              company_id: 'holding',
              requisition_id: requisitionId,
              full_name: 'Candidate One',
              email: 'candidate@xe.vn',
              source: 'linkedin',
              status: 'new',
              created_at: '2026-04-23T00:00:00.000Z',
              updated_at: '2026-04-23T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.createCandidate(
      {
        company_id: 'main',
        requisition_id: requisitionId,
        full_name: 'Candidate One',
        email: 'candidate@xe.vn',
        source: 'linkedin',
      },
      `Bearer ${token}`,
    );

    expect(result.company_id).toBe('holding');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([requisitionId, expect.any(Array)]),
    );
  });

  it('lists candidates when group CEO uses company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_candidates')) {
        if (sql.includes('COUNT')) return { rows: [{ total: '0' }] } as never;
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.listCandidates({ company_id: 'main' }, `Bearer ${token}`);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('finds holding candidate when group CEO schedules interview with company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const candidateId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_candidates WHERE') && sql.includes('LIMIT 1')) {
        return { rows: [{ id: candidateId, company_id: 'holding' }] } as never;
      }
      if (sql.includes('INSERT INTO public.recruitment_interviews')) {
        return {
          rows: [
            {
              id: 'int-1',
              company_id: 'holding',
              candidate_id: candidateId,
              scheduled_at: '2026-04-25T09:00:00.000Z',
              interviewer: 'HR Lead',
              status: 'scheduled',
              created_at: '2026-04-23T00:00:00.000Z',
              updated_at: '2026-04-23T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.scheduleInterview(
      {
        company_id: 'main',
        candidate_id: candidateId,
        scheduled_at: '2026-04-25T09:00:00.000Z',
        interviewer: 'HR Lead',
      },
      `Bearer ${token}`,
    );

    expect(result.company_id).toBe('holding');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([candidateId, expect.any(Array)]),
    );
  });
});
