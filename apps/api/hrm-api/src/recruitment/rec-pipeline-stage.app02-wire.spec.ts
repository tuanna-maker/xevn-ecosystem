/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01 —
 * F-REC-APP-02 wire: catalog >0 → to_stage ∈ effective else HRM-REC-STAGE-UNKNOWN
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { isHiredStage } from './hire-employee-link';
import { RecruitmentCatalogService } from './recruitment-catalog.service';

const APP_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const CAND_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

describe('F-REC-APP-02 stage catalog wire (PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01)', () => {
  it('rejects to_stage ∉ effective when catalog >0 → HRM-REC-STAGE-UNKNOWN', async () => {
    const assertStageInEffectiveCatalog = jest
      .fn()
      .mockRejectedValue(
        new ApiException('HRM-REC-STAGE-UNKNOWN', 'not in catalog', HttpStatus.BAD_REQUEST),
      );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.candidate_applications ca')) {
          return {
            rows: [
              {
                id: APP_ID,
                candidate_id: CAND_ID,
                company_id: 'holding',
                cand_employee_id: null,
                cand_company_id: 'holding',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertStageInEffectiveCatalog } as never,
    );

    await expect(
      catalog.updateCandidateApplicationStage(
        APP_ID,
        'holding',
        'not_in_catalog',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-REC-STAGE-UNKNOWN' });
    expect(assertStageInEffectiveCatalog).toHaveBeenCalled();
  });

  it('empty catalog soft-allows free-text stage (U65)', async () => {
    const assertStageInEffectiveCatalog = jest.fn().mockResolvedValue(null);
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.candidate_applications ca')) {
          return {
            rows: [
              {
                id: APP_ID,
                candidate_id: CAND_ID,
                company_id: 'holding',
                cand_employee_id: null,
                cand_company_id: 'holding',
              },
            ],
          };
        }
        if (s.includes('UPDATE public.candidate_applications')) {
          return { rows: [{ id: APP_ID, stage: 'screening' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertStageInEffectiveCatalog } as never,
    );

    const row = await catalog.updateCandidateApplicationStage(
      APP_ID,
      'holding',
      'screening',
      groupCeoToken(),
    );
    expect(row.stage).toBe('screening');
  });

  it('pool stage also asserts effective catalog', async () => {
    const assertStageInEffectiveCatalog = jest
      .fn()
      .mockRejectedValue(
        new ApiException('HRM-REC-STAGE-UNKNOWN', 'not in catalog', HttpStatus.BAD_REQUEST),
      );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ') || s.includes('CREATE INDEX')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.candidates WHERE id')) {
          return {
            rows: [
              {
                id: CAND_ID,
                company_id: 'holding',
                stage: 'applied',
                workflow_instance_id: null,
                employee_id: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      assertNotLockedOrThrow: jest.fn(),
    };
    const catalog = new RecruitmentCatalogService(
      db,
      bridge as never,
      undefined,
      undefined,
      { assertStageInEffectiveCatalog } as never,
    );

    await expect(
      catalog.updateCandidatePoolStage(CAND_ID, 'holding', 'ghost_stage', groupCeoToken()),
    ).rejects.toMatchObject({ code: 'HRM-REC-STAGE-UNKNOWN' });
  });
});

describe('isHiredStage hiredOutcomeKey (PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01)', () => {
  it('uses catalog hiredOutcomeKey when provided', () => {
    expect(isHiredStage('custom_hire', 'custom_hire')).toBe(true);
    expect(isHiredStage('hired', 'custom_hire')).toBe(false);
    expect(isHiredStage('hired')).toBe(true);
  });
});
