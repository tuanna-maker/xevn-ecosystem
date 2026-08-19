/**
 * D-BE-ERP-E1A-POS-KEY-01 — Layer A position_key assert + ensureSchema A–E.
 * U65: no seed — catalog assert mocked.
 */
import 'reflect-metadata';
import { HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiException } from './common/api.exception';
import { signServiceJwt } from './common/jwt-sign';
import {
  HRM_CON_POS_KEY,
  HRM_CON_SIGNER_POS_KEY,
  ContractsInsuranceService,
} from './contracts-insurance/contracts-insurance.service';
import { CreateContractDto } from './contracts-insurance/dto/create-contract.dto';
import {
  HRM_DEC_POS_KEY,
  HRM_DEC_SIGNER_POS_KEY,
  DecisionsService,
} from './decisions/decisions.service';
import { CreateDecisionDto } from './decisions/dto/create-decision.dto';
import {
  EmployeeProfileService,
  HRM_WH_POS_KEY,
} from './employees/employee-profile.service';
import { CreateJobPostingDto } from './recruitment/dto/create-job-posting.dto';
import {
  HRM_HCP_POS_KEY,
  HRM_JP_POS_KEY,
  HRM_REC_JD_POS,
  RecruitmentCatalogService,
} from './recruitment/recruitment-catalog.service';

function ceoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'group_ceo',
  })}`;
}

function ddlAwareQuery(extra?: (sql: string, params?: unknown[]) => { rows: unknown[] } | null) {
  return jest.fn().mockImplementation((sql: string, params?: unknown[]) => {
    const s = String(sql);
    if (
      s.includes('CREATE TABLE') ||
      s.includes('ALTER TABLE') ||
      s.includes('CREATE INDEX') ||
      s.includes('CREATE UNIQUE') ||
      s.includes('DROP CONSTRAINT') ||
      s.includes('ADD CONSTRAINT')
    ) {
      return Promise.resolve({ rows: [] });
    }
    if (s.includes('SELECT COUNT(*)')) {
      return Promise.resolve({ rows: [{ total: '1' }] });
    }
    const hit = extra?.(s, params);
    if (hit) return Promise.resolve(hit);
    return Promise.resolve({ rows: [] });
  });
}

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

describe('D-BE-ERP-E1A-POS-KEY-01 DTO allowlist', () => {
  it('CreateJobPostingDto requires position_key', async () => {
    const dto = plainToInstance(CreateJobPostingDto, {
      company_id: 'holding',
      title: 'Tin TD',
      position: 'Nhân viên KD',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'position_key')).toBe(true);
  });

  it('CreateDecisionDto requires position_key', async () => {
    const dto = plainToInstance(CreateDecisionDto, {
      company_id: 'holding',
      decision_type: 'appointment',
      employee_name: 'NV A',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'position_key')).toBe(true);
  });

  it('CreateContractDto allows omit position_key (UF-HRM-05 resolve at service)', async () => {
    const dto = plainToInstance(CreateContractDto, {
      company_id: 'holding',
      employee_id: '11111111-1111-4111-8111-111111111111',
      contract_type: 'indefinite',
      start_date: '2026-01-01',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'position_key')).toBe(false);
  });
});

describe('D-BE-ERP-E1A-POS-KEY-01 Work timeline (WH)', () => {
  it('ensureSchema emits position_key / department_key ALTER', async () => {
    const ddl: string[] = [];
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        ddl.push(String(sql));
        return Promise.resolve({ rows: [] });
      }),
      onModuleDestroy: jest.fn(),
    };
    const employees = {
      getEmployeeById: jest.fn().mockResolvedValue({
        id: 'e1',
        company_id: 'holding',
      }),
    };
    const svc = new EmployeeProfileService(db as never, employees as never);
    await svc.listWorkTimeline('e1', { company_id: 'holding' }, ceoAuth());
    const joined = ddl.join('\n');
    expect(joined).toMatch(/employee_work_timeline[\s\S]*position_key/);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS position_key/);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS department_key/);
  });

  it('create rejects missing position_key (HRM-WH-POS-KEY)', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const employees = {
      getEmployeeById: jest.fn().mockResolvedValue({ id: 'e1', company_id: 'holding' }),
    };
    const catalogs = { assertCodeInEffectiveCatalog: jest.fn() };
    const svc = new EmployeeProfileService(db as never, employees as never, catalogs as never);
    await expect(
      svc.createWorkTimelineItem(
        'e1',
        { company_id: 'holding' },
        { event_date: '2026-01-01', title: 'Bổ nhiệm', position: 'Invented' },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_WH_POS_KEY });
    expect(catalogs.assertCodeInEffectiveCatalog).not.toHaveBeenCalled();
  });

  it('create asserts job_titles and denorms position label', async () => {
    const insertParams: unknown[][] = [];
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('INSERT INTO public.employee_work_timeline')) {
          insertParams.push(params ?? []);
          return {
            rows: [
              {
                id: params?.[0],
                position_key: 'NV_KD',
                position: 'Nhân viên Kinh doanh',
              },
            ],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const employees = {
      getEmployeeById: jest.fn().mockResolvedValue({ id: 'e1', company_id: 'holding' }),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'NV_KD',
        label: 'Nhân viên Kinh doanh',
        status: 'active',
      }),
    };
    const svc = new EmployeeProfileService(db as never, employees as never, catalogs as never);
    const row = await svc.createWorkTimelineItem(
      'e1',
      { company_id: 'holding' },
      { event_date: '2026-01-01', title: 'Bổ nhiệm', position_key: 'NV_KD' },
      ceoAuth(),
    );
    expect(row.position_key).toBe('NV_KD');
    expect(row.position).toBe('Nhân viên Kinh doanh');
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'job_titles',
        code: 'NV_KD',
        errorCode: HRM_WH_POS_KEY,
      }),
    );
  });

  it('update invent-only position without key → HRM-WH-POS-KEY', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const employees = {
      getEmployeeById: jest.fn().mockResolvedValue({ id: 'e1', company_id: 'holding' }),
    };
    const svc = new EmployeeProfileService(db as never, employees as never, {
      assertCodeInEffectiveCatalog: jest.fn(),
    } as never);
    await expect(
      svc.updateWorkTimelineItem(
        'item-1',
        'e1',
        { company_id: 'holding' },
        { position: 'Free text only' },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_WH_POS_KEY });
  });
});

describe('D-BE-ERP-E1A-POS-KEY-01 Decisions (DEC)', () => {
  it('ensureSchema adds position_key / signer_position_key', async () => {
    const ddl: string[] = [];
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        ddl.push(String(sql));
        if (String(sql).includes('FROM public.hr_decisions')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new DecisionsService(db as never);
    await svc.listDecisions({ company_id: 'holding', page: '1', page_size: '20' }, ceoAuth());
    const joined = ddl.join('\n');
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS position_key/);
    expect(joined).toMatch(/ADD COLUMN IF NOT EXISTS signer_position_key/);
  });

  it('create rejects missing position_key', async () => {
    const empId = '11111111-1111-4111-8111-111111111111';
    const db = {
      query: ddlAwareQuery((sql) => {
        if (sql.includes('FROM public.employees') && sql.includes('id = $1::uuid')) {
          return {
            rows: [{ id: empId, full_name: 'NV A', employee_code: 'HLD-0001' }],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = { assertCodeInEffectiveCatalog: jest.fn() };
    const svc = new DecisionsService(db as never, catalogs as never);
    await expect(
      svc.createDecision(
        {
          company_id: 'holding',
          decision_type: 'appointment',
          employee_id: empId,
          employee_name: 'NV A',
          position_key: '',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_DEC_POS_KEY });
  });

  it('create asserts position_key + decision_type; signer key when signer present', async () => {
    const empId = '11111111-1111-4111-8111-111111111111';
    const insertParams: unknown[][] = [];
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('FROM public.employees') && sql.includes('id = $1::uuid')) {
          return {
            rows: [{ id: empId, full_name: 'NV A', employee_code: 'HLD-0001' }],
          };
        }
        if (sql.includes('INSERT INTO public.hr_decisions')) {
          insertParams.push(params ?? []);
          return {
            rows: [
              {
                id: params?.[0],
                position_key: 'NV_KD',
                signer_position_key: 'TP_NS',
                decision_type: 'appointment',
              },
            ],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockImplementation(async (opts: { code: string }) => ({
        code: opts.code,
        label: opts.code === 'TP_NS' ? 'Trưởng phòng NS' : 'Nhân viên KD',
        status: 'active',
      })),
    };
    const svc = new DecisionsService(db as never, catalogs as never);
    await svc.createDecision(
      {
        company_id: 'holding',
        decision_type: 'appointment',
        employee_id: empId,
        employee_name: 'NV A',
        position_key: 'NV_KD',
        signer_name: 'Giám đốc',
        signer_position_key: 'TP_NS',
      },
      ceoAuth(),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'HRM-DEC-TYPE' }),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: HRM_DEC_POS_KEY, catalogKey: 'job_titles' }),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: HRM_DEC_SIGNER_POS_KEY }),
    );
  });
});

describe('D-BE-ERP-E1A-POS-KEY-01 Job postings / Headcount (JP/HCP)', () => {
  it('ensureWave2Schema adds JP/HCP position_key columns', async () => {
    const ddl: string[] = [];
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        ddl.push(String(sql));
        return Promise.resolve({ rows: [] });
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new RecruitmentCatalogService(db as never, mockBridge() as never);
    await svc.listJobPostings({ company_id: 'holding' }, ceoAuth());
    const joined = ddl.join('\n');
    expect(joined).toMatch(/job_postings[\s\S]*position_key|ADD COLUMN IF NOT EXISTS position_key/);
    expect(joined).toMatch(/headcount_proposals/);
  });

  it('createJobPosting rejects invent-only position (HRM-JP-POS-KEY)', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = { assertCodeInEffectiveCatalog: jest.fn() };
    const svc = new RecruitmentCatalogService(db as never, mockBridge() as never, catalogs as never);
    await expect(
      svc.createJobPosting(
        {
          company_id: 'holding',
          title: 'Tin',
          position: 'Free text',
          position_key: '',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_JP_POS_KEY });
  });

  it('createJobPosting asserts catalog and persists position_key', async () => {
    const insertParams: unknown[][] = [];
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('INSERT INTO public.job_postings')) {
          insertParams.push(params ?? []);
          return {
            rows: [{ id: params?.[0], position_key: 'NV_KD', position: 'Nhân viên KD' }],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'NV_KD',
        label: 'Nhân viên KD',
        status: 'active',
      }),
    };
    const svc = new RecruitmentCatalogService(db as never, mockBridge() as never, catalogs as never);
    const row = await svc.createJobPosting(
      { company_id: 'holding', title: 'Tin TD', position_key: 'NV_KD' },
      ceoAuth(),
    );
    expect(row.position_key).toBe('NV_KD');
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: HRM_JP_POS_KEY, catalogKey: 'job_titles' }),
    );
  });

  it('createHeadcountProposal requires position_key (HRM-HCP-POS-KEY)', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const svc = new RecruitmentCatalogService(db as never, mockBridge() as never, {
      assertCodeInEffectiveCatalog: jest.fn(),
    } as never);
    await expect(
      svc.createHeadcountProposal(
        {
          company_id: 'holding',
          title: 'Đề xuất',
          department: 'KD',
          position_name: 'NV KD',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_HCP_POS_KEY });
  });

  it('must_keep: JD position_code still uses HRM-REC-JD-POS (regression)', async () => {
    const db = { query: ddlAwareQuery(), onModuleDestroy: jest.fn() };
    const catalogs = { assertCodeInEffectiveCatalog: jest.fn() };
    const svc = new RecruitmentCatalogService(db as never, mockBridge() as never, catalogs as never);
    await expect(
      svc.createJobDescriptionTemplate(
        {
          company_id: 'holding',
          code: 'JD-1',
          title: 'JD',
          position_name: 'Invented',
        },
        ceoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_JD_POS });
  });
});

describe('D-BE-ERP-E1A-POS-KEY-01 Contracts (CI)', () => {
  it('ensureSchema adds CI position/signer key columns', async () => {
    const ddl: string[] = [];
    const db = {
      query: jest.fn().mockImplementation((sql: string) => {
        ddl.push(String(sql));
        if (String(sql).includes('SELECT COUNT(*)')) {
          return Promise.resolve({ rows: [{ total: '1' }] });
        }
        return Promise.resolve({ rows: [] });
      }),
      onModuleDestroy: jest.fn(),
    };
    const svc = new ContractsInsuranceService(db as never);
    await svc.listContracts({ company_id: 'holding' }, ceoAuth());
    const joined = ddl.join('\n');
    expect(joined).toMatch(/employee_contracts[\s\S]*position_key|ADD COLUMN IF NOT EXISTS position_key/);
    expect(joined).toMatch(/signer_position_key/);
  });

  it('create rejects missing position_key after end_date policy', async () => {
    const db = {
      query: ddlAwareQuery((sql) => {
        if (sql.includes('FROM public.employees') && sql.includes('job_title_key')) {
          return { rows: [{ job_title_key: null }] };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    // E2: contract_types assert runs before position_key — mock must resolve type, then POS-KEY fails.
    // UF-HRM-05 resolveContractPositionKey also calls getEffectiveItemsForKey (empty → POS-KEY).
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockImplementation(async (opts: { catalogKey: string; code: string }) => {
        if (opts.catalogKey === 'contract_types') {
          return { code: opts.code, label: opts.code, status: 'active' };
        }
        throw new ApiException(HRM_CON_POS_KEY, 'position', HttpStatus.BAD_REQUEST);
      }),
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([]),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await expect(
      svc.createContract(
        {
          company_id: 'holding',
          employee_id: '11111111-1111-4111-8111-111111111111',
          contract_type: 'indefinite',
          start_date: '2026-01-01',
          position_key: '',
        },
        ceoAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_CON_POS_KEY });
  });

  it('create asserts position_key + signer_position_key when signer present', async () => {
    const db = {
      query: ddlAwareQuery((sql, params) => {
        if (sql.includes('INSERT INTO public.employee_contracts')) {
          return {
            rows: [
              {
                id: params?.[0],
                position_key: 'NV_KD',
                signer_position_key: 'TP_NS',
                end_date: null,
              },
            ],
          };
        }
        return null;
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockImplementation(async (opts: { code: string }) => ({
        code: opts.code,
        label: opts.code,
        status: 'active',
      })),
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([
        { code: 'NV_KD', label: 'NV KD', status: 'active' },
        { code: 'TP_NS', label: 'TP NS', status: 'active' },
      ]),
    };
    const svc = new ContractsInsuranceService(db as never, catalogs as never);
    await svc.createContract(
      {
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
        signer_name: 'GD',
        signer_position_key: 'TP_NS',
      },
      ceoAuth(),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: HRM_CON_POS_KEY }),
    );
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: HRM_CON_SIGNER_POS_KEY }),
    );
  });
});
