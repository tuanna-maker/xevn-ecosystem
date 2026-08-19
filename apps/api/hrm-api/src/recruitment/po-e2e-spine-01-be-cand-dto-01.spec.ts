/**
 * PO-E2E-SPINE-01-BE-CAND-DTO-01 — FE CandidateFormDialog payload must not hit HRM-VAL-001.
 */
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidatePoolDto } from './dto/update-candidate-pool.dto';
import { RecruitmentCatalogService } from './recruitment-catalog.service';

/** Mirror CandidateFormDialog onSubmit body (create path, stage applied). */
const FE_SHAPED_CREATE_BODY = {
  company_id: 'main',
  full_name: 'Nguyen Hire Pay SP4SDE70SZ',
  email: 'sp4sde70sz@xe.vn',
  phone: null,
  position: 'SP4SDE70SZ Specialist',
  source: null,
  stage: 'applied',
  rating: 0,
  applied_date: '2026-08-03',
  expected_start_date: null,
  nationality: 'Việt Nam',
  hometown: null,
  marital_status: null,
  notes: null,
};

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

describe('PO-E2E-SPINE-01-BE-CAND-DTO-01 CreateCandidateDto FE parity', () => {
  it('accepts CandidateFormDialog FE-shaped payload (forbidNonWhitelisted)', () => {
    const dto = plainToInstance(CreateCandidateDto, FE_SHAPED_CREATE_BODY);
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });

  it('still rejects unknown non-FE property', () => {
    const dto = plainToInstance(CreateCandidateDto, {
      ...FE_SHAPED_CREATE_BODY,
      invent_only_field: 'nope',
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(JSON.stringify(errors)).toMatch(/invent_only_field/);
  });

  it('UpdateCandidatePoolDto accepts same form fields', () => {
    const dto = plainToInstance(UpdateCandidatePoolDto, {
      full_name: 'Updated',
      email: 'u@xe.vn',
      phone: null,
      position: 'Lead',
      source: null,
      stage: 'interview',
      rating: 3,
      applied_date: '2026-08-03',
      expected_start_date: '2026-09-01',
      nationality: 'Việt Nam',
      hometown: 'HN',
      marital_status: 'single',
      notes: null,
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });
});

describe('PO-E2E-SPINE-01-BE-CAND-DTO-01 createCandidatePool persist', () => {
  it('INSERT includes FE form columns (position/rating/expected_start_date/…) and keeps hire path', async () => {
    const inserted = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      company_id: 'holding',
      full_name: FE_SHAPED_CREATE_BODY.full_name,
      position: FE_SHAPED_CREATE_BODY.position,
      rating: 0,
      stage: 'applied',
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (String(sql).includes('INSERT INTO public.candidates')) {
          return { rows: [inserted] };
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const row = await service.createCandidatePool(
      {
        company_id: 'main',
        full_name: FE_SHAPED_CREATE_BODY.full_name,
        email: FE_SHAPED_CREATE_BODY.email,
        phone: null,
        position: FE_SHAPED_CREATE_BODY.position,
        source: null as unknown as undefined,
        stage: 'applied',
        rating: 0,
        applied_date: '2026-08-03',
        expected_start_date: null,
        nationality: 'Việt Nam',
        hometown: null,
        marital_status: null,
        notes: null,
      },
      `Bearer ${token}`,
    );

    expect(row).toEqual(inserted);
    const insertCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.candidates'),
    );
    expect(insertCall?.[0]).toMatch(/position/);
    expect(insertCall?.[0]).toMatch(/rating/);
    expect(insertCall?.[0]).toMatch(/expected_start_date/);
    expect(insertCall?.[0]).toMatch(/nationality/);
    expect(insertCall?.[0]).toMatch(/hometown/);
    expect(insertCall?.[0]).toMatch(/marital_status/);
    expect(insertCall?.[0]).toMatch(/employee_id/);
    expect(insertCall?.[1]).toEqual(
      expect.arrayContaining([
        FE_SHAPED_CREATE_BODY.full_name,
        FE_SHAPED_CREATE_BODY.position,
        0,
        'Việt Nam',
      ]),
    );
  });

  it('G-DB-01 hire bind still requires employee_id when stage=hired', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    await expect(
      service.createCandidatePool({
        company_id: 'holding',
        full_name: 'Hired Without Link',
        email: 'hired@xe.vn',
        stage: 'hired',
        position: 'X',
        rating: 0,
      }),
    ).rejects.toMatchObject({ code: 'HRM-REC-HIRE-400' });
    expect(
      db.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO public.candidates')),
    ).toBe(false);
  });
});

describe('G-DB-01 updateCandidatePool hired bind (PO-SPEC-UNIT-TEST-IMPL-01)', () => {
  const candidateId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  const employeeId = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

  it('PATCH stage=hired without employee_id → HRM-REC-HIRE-400 (no stage stamp)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (
          String(sql).includes('FROM public.candidates WHERE id') &&
          String(sql).includes('SELECT company_id')
        ) {
          return {
            rows: [
              {
                company_id: 'holding',
                stage: 'offer',
                workflow_instance_id: null,
                employee_id: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await expect(
      service.updateCandidatePool(
        candidateId,
        'main',
        { stage: 'hired' },
        `Bearer ${token}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-REC-HIRE-400' });

    expect(
      db.query.mock.calls.some(
        ([sql]) =>
          String(sql).includes('UPDATE public.candidates') && String(sql).includes('stage'),
      ),
    ).toBe(false);
  });

  it('PATCH stage=hired with explicit employee_id same company → stamps employee_id', async () => {
    const stamped = {
      id: candidateId,
      company_id: 'holding',
      stage: 'hired',
      employee_id: employeeId,
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        if (
          String(sql).includes('FROM public.candidates WHERE id') &&
          String(sql).includes('SELECT company_id')
        ) {
          return {
            rows: [
              {
                company_id: 'holding',
                stage: 'offer',
                workflow_instance_id: null,
                employee_id: null,
              },
            ],
          };
        }
        if (
          String(sql).includes('FROM public.employees') &&
          String(sql).includes('WHERE id =')
        ) {
          return { rows: [{ id: employeeId, company_id: 'holding' }] };
        }
        if (String(sql).includes('UPDATE public.candidates SET')) {
          expect(params?.[15]).toBe(employeeId);
          expect(params?.[6]).toBe('hired');
          return { rows: [stamped] };
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const row = await service.updateCandidatePool(
      candidateId,
      'main',
      { stage: 'hired', employee_id: employeeId },
      `Bearer ${token}`,
    );

    expect(row).toEqual(stamped);
    expect(
      db.query.mock.calls.some(([sql]) => String(sql).includes('UPDATE public.candidates SET')),
    ).toBe(true);
  });
});
