import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_REC_JD_POS, RecruitmentCatalogService } from './recruitment-catalog.service';

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

describe('RecruitmentCatalogService', () => {
  it('D-U84: createJobDescriptionTemplate Group CEO trsport asserts job_titles on holding partition', async () => {
    const created = {
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      company_id: 'trsport',
      code: 'JD-LX-TMDV',
      title: 'Lái xe TM-DV',
      position_name: 'Đội trưởng Lái xe',
      position_code: 'DRIVER_LEAD',
      job_description: null,
      requirements: null,
      notes: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('INSERT INTO public.job_description_templates')) {
          return { rows: [created] };
        }
        // ensureWave2Schema + dup SELECT → empty
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    const assertCode = jest.fn().mockResolvedValue({
      code: 'DRIVER_LEAD',
      label: 'Đội trưởng Lái xe',
      status: 'active',
      origin: 'xbos',
    });
    const settingsCatalogs = { assertCodeInEffectiveCatalog: assertCode };
    const service = new RecruitmentCatalogService(db, mockBridge() as never, settingsCatalogs as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const row = await service.createJobDescriptionTemplate(
      {
        company_id: 'trsport',
        code: 'JD-LX-TMDV',
        title: 'Lái xe TM-DV',
        position_code: 'DRIVER_LEAD',
      },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );

    expect(assertCode).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'xevn',
        companyId: 'holding',
        catalogKey: 'job_titles',
        code: 'DRIVER_LEAD',
        errorCode: HRM_REC_JD_POS,
      }),
    );
    expect(row.company_id).toBe('trsport');
    expect(row.position_code).toBe('DRIVER_LEAD');
  });

  it('D-U84: invent position_code still rejects HRM-REC-JD-POS (holding SoT)', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const assertCode = jest.fn().mockRejectedValue(
      new ApiException(HRM_REC_JD_POS, 'not in catalog', 400),
    );
    const service = new RecruitmentCatalogService(
      db,
      mockBridge() as never,
      { assertCodeInEffectiveCatalog: assertCode } as never,
    );
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await expect(
      service.createJobDescriptionTemplate(
        {
          company_id: 'trsport',
          code: 'JD-FAKE',
          title: 'Fake',
          position_code: 'NOT_A_REAL_CODE',
        },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_REC_JD_POS });
    expect(assertCode).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 'holding', code: 'NOT_A_REAL_CODE' }),
    );
  });

  it('listJobPostings scopes company_id', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await service.listJobPostings({ company_id: 'main' }, `Bearer ${token}`);
    const listCall = db.query.mock.calls.find(([sql]) => String(sql).includes('FROM public.job_postings'));
    expect(listCall?.[1]).toEqual(expect.arrayContaining([expect.any(Array)]));
  });

  it('listCandidateEvaluations qualifies e.company_id on JOIN (group CEO main rollup)', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await service.listCandidateEvaluations('main', `Bearer ${token}`, {
      candidateId: '289a9388-22c5-49be-a795-f498a0c72436',
      includeLegacy: true,
    });
    const listCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('FROM public.candidate_evaluations e'),
    );
    expect(listCall?.[0]).toMatch(/e\.company_id = ANY/);
    expect(listCall?.[0]).toMatch(/e\.candidate_id = \$2::uuid/);
    expect(listCall?.[0]).not.toMatch(/WHERE company_id =/);
  });
});
