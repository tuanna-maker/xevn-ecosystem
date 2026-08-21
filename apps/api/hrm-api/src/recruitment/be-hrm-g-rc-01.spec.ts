/**
 * BE-HRM-G-RC-01 — FR-HRM-RC-01 headcount on job_requisitions.
 * Reject ≤0; accept ≥1; list returns field. Does not touch job_postings / headcount_proposals.
 */
import { validateSync } from 'class-validator';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentService } from './recruitment.service';

describe('BE-HRM-G-RC-01 CreateJobRequisitionDto headcount', () => {
  const base = {
    company_id: 'holding',
    title: 'Lái xe container',
    department: 'Vận tải',
    employment_type: 'full_time',
  };

  it('rejects missing headcount', () => {
    const dto = Object.assign(new CreateJobRequisitionDto(), { ...base });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.some((e) => e.property === 'headcount')).toBe(true);
  });

  it('rejects headcount ≤ 0', () => {
    for (const headcount of [0, -1, -10]) {
      const dto = Object.assign(new CreateJobRequisitionDto(), {
        ...base,
        headcount,
      });
      const errors = validateSync(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      expect(errors.some((e) => e.property === 'headcount')).toBe(true);
    }
  });

  it('accepts headcount ≥ 1', () => {
    for (const headcount of [1, 2, 15]) {
      const dto = Object.assign(new CreateJobRequisitionDto(), {
        ...base,
        headcount,
      });
      const errors = validateSync(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      expect(errors).toHaveLength(0);
      expect(dto.headcount).toBe(headcount);
    }
  });

  it('UpdateJobRequisitionDto rejects optional headcount ≤ 0', () => {
    const dto = Object.assign(new UpdateJobRequisitionDto(), {
      status: 'open',
      headcount: 0,
    });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.some((e) => e.property === 'headcount')).toBe(true);
  });
});

const JD_TEMPLATE_ID = 'c2f1a5d6-9b4e-4c07-8a31-5f6d2e7b4a10';
const JD_TEMPLATE_ROW = {
  id: JD_TEMPLATE_ID,
  code: 'JD-DRV-01',
  title: 'Lái xe tuyến',
  job_description: null,
  requirements: null,
  is_active: true,
  position_code: 'DRV',
  position_name: 'Lái xe',
};

describe('BE-HRM-G-RC-01 RecruitmentService headcount wire', () => {
  let service: RecruitmentService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      assertNotLockedOrThrow: jest.fn(),
      startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
    };
    service = new RecruitmentService(db, bridge as never);
  });

  it('create inserts headcount and returns field', async () => {
    const row = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      title: 'Lái xe container',
      department: 'Vận tải',
      employment_type: 'full_time',
      headcount: 3,
      status: 'open',
      job_description: null,
      requirements: null,
      job_template_id: JD_TEMPLATE_ID,
      created_at: '2026-07-21T00:00:00.000Z',
      updated_at: '2026-07-21T00:00:00.000Z',
    };
    db.query.mockImplementation(async (sql: string) => {
      // BR-YCTD-JD-REF-01 (PO-HRM-JD-YCTD-REF-BE-01) made the JD soft FK mandatory on create.
      if (sql.includes('FROM public.job_description_templates')) {
        return { rows: [JD_TEMPLATE_ROW] } as never;
      }
      if (sql.includes('INSERT INTO public.job_requisitions')) {
        expect(sql).toContain('headcount');
        expect(sql).not.toContain('job_postings');
        expect(sql).not.toContain('headcount_proposals');
        return { rows: [row] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.createJobRequisition({
      company_id: 'holding',
      title: 'Lái xe container',
      department: 'Vận tải',
      employment_type: 'full_time',
      headcount: 3,
      job_template_id: JD_TEMPLATE_ID,
    });

    expect(result.headcount).toBe(3);
    const insertCall = db.query.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO public.job_requisitions'),
    );
    expect(insertCall?.[1]).toEqual(
      expect.arrayContaining([
        'holding',
        'Lái xe container',
        'Vận tải',
        'full_time',
        3,
      ]),
    );
  });

  it('create rejects service-layer headcount ≤ 0', async () => {
    await expect(
      service.createJobRequisition({
        company_id: 'holding',
        title: 'Lái xe container',
        department: 'Vận tải',
        employment_type: 'full_time',
        headcount: 0,
      }),
    ).rejects.toMatchObject({ code: 'HRM-REC-400' });
  });

  it('list returns headcount on each row', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT COUNT(*)')) {
        return { rows: [{ total: '1' }] } as never;
      }
      if (
        sql.includes('FROM public.job_requisitions') &&
        sql.includes('ORDER BY')
      ) {
        expect(sql).toContain('headcount');
        return {
          rows: [
            {
              id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
              company_id: 'holding',
              title: 'Lái xe container',
              department: 'Vận tải',
              employment_type: 'full_time',
              headcount: 5,
              status: 'open',
              job_description: null,
              requirements: null,
              job_template_id: null,
              workflow_instance_id: null,
              created_at: '2026-07-21T00:00:00.000Z',
              updated_at: '2026-07-21T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const page = await service.listJobRequisitions({ company_id: 'holding' });
    expect(page.data[0]?.headcount).toBe(5);
  });

  it('ensureSchema adds job_requisitions.headcount (not postings/proposals)', async () => {
    await service
      .createJobRequisition({
        company_id: 'holding',
        title: 'NV Kho',
        department: 'Kho',
        employment_type: 'full_time',
        headcount: 1,
      })
      .catch(() => undefined);

    const ddl = db.query.mock.calls.map((c) => String(c[0])).join('\n');
    expect(ddl).toMatch(
      /job_requisitions[\s\S]*headcount|ADD COLUMN IF NOT EXISTS headcount/i,
    );
    expect(ddl).not.toMatch(/ALTER TABLE public\.job_postings[\s\S]*headcount/);
  });
});
