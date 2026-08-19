/**
 * D-HRM-SETTINGS-MD-JT-BE-01 — job-template position_code catalog SoT (AC-SET-FS-03).
 * U65: no seed — catalog assert mocked.
 */
import 'reflect-metadata';
import { HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import {
  HRM_REC_JD_POS,
  RecruitmentCatalogService,
} from './recruitment-catalog.service';

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

function ceoAuth(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'group_ceo',
  })}`;
}

function ddlAwareQuery(handlers: {
  onDup?: () => { rows: unknown[] };
  onInsert?: (params: unknown[]) => { rows: unknown[] };
  onPeek?: () => { rows: unknown[] };
  onUpdate?: (params: unknown[]) => { rows: unknown[] };
}) {
  return jest.fn().mockImplementation((sql: string, params?: unknown[]) => {
    const s = String(sql);
    if (
      s.includes('CREATE TABLE') ||
      s.includes('ALTER TABLE') ||
      s.includes('CREATE INDEX') ||
      s.includes('CREATE UNIQUE') ||
      s.includes('DROP CONSTRAINT') ||
      s.includes('ADD CONSTRAINT') ||
      s.includes('DO $$')
    ) {
      return Promise.resolve({ rows: [] });
    }
    // DATA-01 status backfill — ignore (not product UPDATE … WHERE id).
    if (
      s.includes('UPDATE public.job_description_templates') &&
      (s.includes("SET status = 'active'") ||
        s.includes("SET status = 'retired'") ||
        s.includes("SET status = 'draft'")) &&
      !s.includes('WHERE id')
    ) {
      return Promise.resolve({ rows: [] });
    }
    if (s.includes('SELECT id FROM public.job_description_templates WHERE company_id')) {
      return Promise.resolve(handlers.onDup?.() ?? { rows: [] });
    }
    if (s.includes('INSERT INTO public.job_description_templates')) {
      return Promise.resolve(handlers.onInsert?.(params ?? []) ?? { rows: [] });
    }
    if (
      s.includes('FROM public.job_description_templates WHERE id = $1::uuid') &&
      s.includes('position_code')
    ) {
      return Promise.resolve(handlers.onPeek?.() ?? { rows: [] });
    }
    if (s.includes('UPDATE public.job_description_templates SET') && s.includes('WHERE id')) {
      return Promise.resolve(handlers.onUpdate?.(params ?? []) ?? { rows: [] });
    }
    return Promise.resolve({ rows: [] });
  });
}

describe('D-HRM-SETTINGS-MD-JT-BE-01 CreateJobTemplateDto', () => {
  it('rejects invent-only free SoT — position_code required on create', async () => {
    const dto = plainToInstance(CreateJobTemplateDto, {
      company_id: 'holding',
      code: 'JD-01',
      title: 'Nhân viên Kinh doanh',
      position_name: 'Nhân viên Kinh doanh',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'position_code')).toBe(true);
  });

  it('accepts position_code + title (catalog key present)', async () => {
    const dto = plainToInstance(CreateJobTemplateDto, {
      company_id: 'holding',
      code: 'JD-01',
      title: 'Mẫu JD KD',
      position_code: 'NV_KD',
      position_name: 'Nhân viên Kinh doanh',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('D-HRM-SETTINGS-MD-JT-BE-01 RecruitmentCatalogService JD position', () => {
  it('create rejects missing position_code (HRM-REC-JD-POS)', async () => {
    const db = { query: ddlAwareQuery({}), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn(),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
      catalogs as never,
    );
    await expect(
      svc.createJobDescriptionTemplate(
        {
          company_id: 'holding',
          code: 'JD-FREE',
          title: 'Free title only',
          position_name: 'Invented label',
        },
        ceoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_JD_POS });
    expect(catalogs.assertCodeInEffectiveCatalog).not.toHaveBeenCalled();
  });

  it('create rejects position_code not in job_titles catalog', async () => {
    const db = { query: ddlAwareQuery({}), onModuleDestroy: jest.fn() };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockRejectedValue(
        new ApiException(
          HRM_REC_JD_POS,
          "position_code 'FAKE' is not in job_titles catalog (free-text SoT forbidden)",
          HttpStatus.BAD_REQUEST,
        ),
      ),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
      catalogs as never,
    );
    await expect(
      svc.createJobDescriptionTemplate(
        {
          company_id: 'holding',
          code: 'JD-BAD',
          title: 'Bad code',
          position_code: 'FAKE',
        },
        ceoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_JD_POS });
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'job_titles',
        code: 'FAKE',
        companyId: 'holding',
        tenantId: 'xevn',
        errorCode: HRM_REC_JD_POS,
      }),
    );
  });

  it('create persists catalog position_code and denormalizes label when position_name omitted', async () => {
    const insertParams: unknown[][] = [];
    const db = {
      query: ddlAwareQuery({
        onInsert: (params) => {
          insertParams.push(params);
          return {
            rows: [
              {
                id: params[0],
                company_id: params[1],
                code: params[2],
                title: params[3],
                position_name: params[4],
                position_code: params[5],
                is_active: true,
              },
            ],
          };
        },
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'NV_KD',
        label: 'Nhân viên Kinh doanh',
        status: 'active',
      }),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
      catalogs as never,
    );
    const row = await svc.createJobDescriptionTemplate(
      {
        company_id: 'holding',
        code: 'JD-OK',
        title: 'Mẫu JD KD',
        position_code: 'NV_KD',
      },
      ceoAuth(),
      { tenantId: 'xevn' },
    );
    expect(row.position_code).toBe('NV_KD');
    expect(row.position_name).toBe('Nhân viên Kinh doanh');
    expect(insertParams[0]?.[5]).toBe('NV_KD');
    expect(insertParams[0]?.[4]).toBe('Nhân viên Kinh doanh');
  });

  it('update rejects clearing position_code', async () => {
    const db = {
      query: ddlAwareQuery({
        onPeek: () => ({
          rows: [{ company_id: 'holding', code: 'JD-OK', position_code: 'NV_KD' }],
        }),
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn(),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
      catalogs as never,
    );
    await expect(
      svc.updateJobDescriptionTemplate(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'holding',
        { position_code: '   ' },
        ceoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_JD_POS });
  });

  it('update rejects invent-only position_name when existing has no position_code', async () => {
    const db = {
      query: ddlAwareQuery({
        onPeek: () => ({
          rows: [{ company_id: 'holding', code: 'JD-LEGACY', position_code: null }],
        }),
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn(),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
      catalogs as never,
    );
    await expect(
      svc.updateJobDescriptionTemplate(
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        'holding',
        { position_name: 'Free invented' },
        ceoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_JD_POS });
    expect(catalogs.assertCodeInEffectiveCatalog).not.toHaveBeenCalled();
  });

  it('update with valid position_code asserts catalog and persists', async () => {
    const updateParams: unknown[][] = [];
    const db = {
      query: ddlAwareQuery({
        onPeek: () => ({
          rows: [{ company_id: 'holding', code: 'JD-OK', position_code: 'OLD' }],
        }),
        onUpdate: (params) => {
          updateParams.push(params);
          return {
            rows: [
              {
                id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                company_id: 'holding',
                code: 'JD-OK',
                position_code: 'NV_KD',
                position_name: 'Nhân viên Kinh doanh',
              },
            ],
          };
        },
      }),
      onModuleDestroy: jest.fn(),
    };
    const catalogs = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'NV_KD',
        label: 'Nhân viên Kinh doanh',
        status: 'active',
      }),
    };
    const svc = new RecruitmentCatalogService(
      db as never,
      mockBridge() as never,
      catalogs as never,
    );
    const row = await svc.updateJobDescriptionTemplate(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'holding',
      { position_code: 'NV_KD' },
      ceoAuth(),
      { tenantId: 'xevn' },
    );
    expect(row.position_code).toBe('NV_KD');
    expect(catalogs.assertCodeInEffectiveCatalog).toHaveBeenCalled();
    expect(updateParams[0]).toEqual(expect.arrayContaining(['NV_KD']));
  });
});
