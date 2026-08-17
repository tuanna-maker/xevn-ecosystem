import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { SiInsuranceTypeService } from '../contracts-insurance/si-insurance-type.service';
import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';
import { EmployeeInsurancesService } from './employee-insurances.service';

const EMP_ID = '00000000-0000-4000-8000-000000000010';
const ENROLL_ID = '00000000-0000-4000-8000-000000000099';

function groupCeoToken(): string {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

describe('EmployeeInsurancesService', () => {
  let service: EmployeeInsurancesService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new EmployeeInsurancesService(db);
  });

  it('list scopes company_id for group CEO main', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.employee_insurances')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.list({ company_id: 'main', employee_id: EMP_ID }, `Bearer ${token}`);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('getById returns 404 when row missing', async () => {
    await expect(service.getById(ENROLL_ID, 'main')).rejects.toMatchObject({
      code: 'HRM-EINS-404',
    });
  });
});

describe('Create/UpdateEmployeeInsuranceDto — open type (D-PLT-SI-INS-DTO-ISIN)', () => {
  it('DTO: Nest open key ∈ EFF format passes class-validator (no closed IsIn)', async () => {
    const createDto = plainToInstance(CreateEmployeeInsuranceDto, {
      company_id: 'main',
      employee_id: EMP_ID,
      type: 'hr_si_cat_msjaj04x',
      provider: 'BHXH VN',
    });
    const updateDto = plainToInstance(UpdateEmployeeInsuranceDto, {
      company_id: 'main',
      type: 'hr_si_cat_msjaj04x',
    });
    await expect(validate(createDto)).resolves.toHaveLength(0);
    await expect(validate(updateDto)).resolves.toHaveLength(0);
  });

  it('DTO: legacy keys social/health still pass (ADD-only open, not remove legacy)', async () => {
    const dto = plainToInstance(CreateEmployeeInsuranceDto, {
      company_id: 'main',
      employee_id: EMP_ID,
      type: 'social',
      provider: 'BHXH',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('DTO: empty start_date/end_date "" fail IsDateString (OBS-PLT-SI-INS-EMPTY-DATE → 4xx)', async () => {
    const createDto = plainToInstance(CreateEmployeeInsuranceDto, {
      company_id: 'main',
      employee_id: EMP_ID,
      type: 'social',
      provider: 'BHXH',
      start_date: '',
      end_date: '',
    });
    const createErrors = await validate(createDto);
    expect(createErrors.length).toBeGreaterThan(0);
    expect(createErrors.some((e) => e.property === 'start_date')).toBe(true);
    expect(createErrors.some((e) => e.property === 'end_date')).toBe(true);

    const updateDto = plainToInstance(UpdateEmployeeInsuranceDto, {
      company_id: 'main',
      start_date: '',
      end_date: '',
    });
    const updateErrors = await validate(updateDto);
    expect(updateErrors.length).toBeGreaterThan(0);
    expect(updateErrors.some((e) => e.property === 'start_date')).toBe(true);
    expect(updateErrors.some((e) => e.property === 'end_date')).toBe(true);
  });

  it('DTO: valid ISO dates pass IsDateString', async () => {
    const dto = plainToInstance(CreateEmployeeInsuranceDto, {
      company_id: 'main',
      employee_id: EMP_ID,
      type: 'social',
      provider: 'BHXH',
      start_date: '2026-08-01',
      end_date: '2026-12-31',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});

describe('EmployeeInsurancesService — VAL-SI-CNS-02 open EFF gate (BE-02)', () => {
  const openKey = 'hr_si_cat_msjaj04x';

  function mockCatalog(
    impl: SiInsuranceTypeService['assertInsuranceTypeInEffectiveCatalog'],
  ): SiInsuranceTypeService {
    return {
      assertInsuranceTypeInEffectiveCatalog: jest.fn(impl),
    } as unknown as SiInsuranceTypeService;
  }

  function enrollmentRow(overrides: Record<string, unknown> = {}) {
    return {
      id: ENROLL_ID,
      employee_id: EMP_ID,
      company_id: 'holding',
      type: openKey,
      provider: 'BHXH VN',
      policy_number: null,
      start_date: '2026-08-01',
      end_date: null,
      contribution: 0,
      employer_contribution: 0,
      status: 'active',
      notes: null,
      policy_id: null,
      si_number: null,
      archived_at: null,
      created_at: '2026-08-08',
      updated_at: '2026-08-08',
      ...overrides,
    };
  }

  it('create: open key ∈ EFF → 2xx (insert succeeds, not HRM-VAL-001)', async () => {
    const catalog = mockCatalog(async () => ({
      insuranceTypeKey: openKey,
      nameVi: 'Loại open QA',
      source: 'si_native',
      eligibleForRateCfg: true,
    }));
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (sql.includes('INSERT INTO public.employee_insurances')) {
          return { rows: [enrollmentRow()] } as never;
        }
        if (sql.includes('FROM public.hrm_insurance_rate_period')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      }),
    } as unknown as jest.Mocked<HrmDbService>;
    const svc = new EmployeeInsurancesService(db, catalog);

    const out = await svc.create(
      {
        company_id: 'main',
        employee_id: EMP_ID,
        type: openKey,
        provider: 'BHXH VN',
        start_date: '2026-08-01',
        status: 'active',
      },
      `Bearer ${groupCeoToken()}`,
    );

    expect(out.type).toBe(openKey);
    expect(out.id).toBe(ENROLL_ID);
    expect(catalog.assertInsuranceTypeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ insuranceType: openKey, companyId: expect.any(String) }),
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.employee_insurances'),
      expect.arrayContaining([openKey]),
    );
  });

  it('create: invent type when EFF>0 → 400 HRM-INS-TYPE-KEY', async () => {
    const catalog = mockCatalog(async () => {
      throw new ApiException(
        'HRM-INS-TYPE-KEY',
        "insurance_type 'invent_not_in_eff' is not in effective insurance-type catalog (free-text SoT forbidden)",
        400,
      );
    });
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] } as never),
    } as unknown as jest.Mocked<HrmDbService>;
    const svc = new EmployeeInsurancesService(db, catalog);

    await expect(
      svc.create(
        {
          company_id: 'main',
          employee_id: EMP_ID,
          type: 'invent_not_in_eff',
          provider: 'X',
        },
        `Bearer ${groupCeoToken()}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-INS-TYPE-KEY' });

    expect(db.query).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.employee_insurances'),
      expect.anything(),
    );
  });

  it('create: empty start_date "" → 400 HRM-VAL-001 (not 500 SYS / no PG insert)', async () => {
    const catalog = mockCatalog(async () => ({
      insuranceTypeKey: openKey,
      nameVi: 'Loại open QA',
      source: 'si_native',
      eligibleForRateCfg: true,
    }));
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] } as never),
    } as unknown as jest.Mocked<HrmDbService>;
    const svc = new EmployeeInsurancesService(db, catalog);

    await expect(
      svc.create(
        {
          company_id: 'main',
          employee_id: EMP_ID,
          type: openKey,
          provider: 'BHXH VN',
          start_date: '',
          end_date: '',
        },
        `Bearer ${groupCeoToken()}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-001' });

    expect(db.query).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.employee_insurances'),
      expect.anything(),
    );
  });

  it('update: empty end_date "" → 400 HRM-VAL-001 before UPDATE', async () => {
    const catalog = mockCatalog(async () => ({
      insuranceTypeKey: openKey,
      nameVi: 'Loại open QA',
      source: 'si_native',
      eligibleForRateCfg: true,
    }));
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.employee_insurances') && sql.includes('LIMIT 1')) {
          return { rows: [enrollmentRow()] } as never;
        }
        if (sql.includes('FROM public.hrm_insurance_rate_period')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      }),
    } as unknown as jest.Mocked<HrmDbService>;
    const svc = new EmployeeInsurancesService(db, catalog);

    await expect(
      svc.update(
        ENROLL_ID,
        { company_id: 'main', end_date: '' },
        `Bearer ${groupCeoToken()}`,
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-001' });

    expect(db.query).not.toHaveBeenCalledWith(
      expect.stringContaining('UPDATE public.employee_insurances'),
      expect.anything(),
    );
  });

  it('must_keep F-CORE-SI-03: applyAction close still maps enrollment status', async () => {
    let enrollmentStatus = 'active';
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.employee_insurances') && sql.includes('LIMIT 1')) {
          return {
            rows: [enrollmentRow({ type: 'social', status: enrollmentStatus })],
          } as never;
        }
        if (sql.includes('UPDATE public.employee_insurances') && sql.includes('SET status')) {
          enrollmentStatus = 'closed';
          return { rows: [] } as never;
        }
        if (sql.includes('FROM public.hrm_insurance_rate_period') && sql.includes('ORDER BY')) {
          return {
            rows: [
              {
                id: 'p1',
                enrollment_id: ENROLL_ID,
                company_id: 'holding',
                effective_from: '2026-08-01',
                effective_to: null,
                employee_rate_pct: null,
                employer_rate_pct: null,
                employee_amount: 0,
                employer_amount: 0,
                pay_rate_cfg_id: null,
                period_status: 'closed',
                action: 'close',
                change_reason: null,
                suspend_reason: null,
                archived_at: null,
                created_at: '2026-08-01',
                updated_at: '2026-08-01',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      }),
    } as unknown as jest.Mocked<HrmDbService>;
    const svc = new EmployeeInsurancesService(db);

    const out = await svc.applyAction(
      ENROLL_ID,
      { company_id: 'main', action: 'close', effective_from: '2026-08-01' },
      `Bearer ${groupCeoToken()}`,
    );
    expect(out.status).toBe('closed');
    expect(out.periods[0].action).toBe('close');
  });
});
