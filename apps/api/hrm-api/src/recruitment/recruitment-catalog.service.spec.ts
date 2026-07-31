import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

describe('RecruitmentCatalogService', () => {
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
    await service.listCandidateEvaluations(
      'main',
      `Bearer ${token}`,
      '289a9388-22c5-49be-a795-f498a0c72436',
    );
    const listCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('FROM public.candidate_evaluations e'),
    );
    expect(listCall?.[0]).toMatch(/e\.company_id = ANY/);
    expect(listCall?.[0]).toMatch(/e\.candidate_id = \$2::uuid/);
    expect(listCall?.[0]).not.toMatch(/WHERE company_id =/);
  });
});
