/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01 —
 * ensureSchema · open catalog · hiredOutcomeKey · scope_parity U19 · APP-02 UNKNOWN
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecPipelineStageService } from './rec-pipeline-stage.service';

const STG_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const HIRED_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function memberCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  })}`;
}

function baseRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: STG_ID,
    company_id: 'holding',
    stage_key: 'hr_custom_stage_07',
    name_vi: 'Giai đoạn HR tùy chỉnh 07',
    sort_order: 70,
    is_terminal: false,
    is_hired_outcome: false,
    is_reject_outcome: false,
    allows_interview_schedule: true,
    wf_task_type_key: null,
    color_token: null,
    metadata_json: null,
    status: 'active',
    archived_at: null,
    created_at: '2026-08-07T00:00:00Z',
    updated_at: '2026-08-07T00:00:00Z',
    ...overrides,
  };
}

function schemaPassthrough(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    s.includes('DO $$')
  );
}

describe('RecPipelineStageService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01)', () => {
  it('ensureSchema ADD rec_pipeline_stage + UQ/CHK; FORBIDDEN closed stage_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('CREATE TABLE IF NOT EXISTS public.rec_pipeline_stage'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) => q.includes('uq_rec_pipeline_stage_company_key_active')),
    ).toBe(true);
    expect(
      sqls.some((q) =>
        q.includes('uq_rec_pipeline_stage_hired_outcome_active'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) => q.includes('chk_rec_pipeline_stage_key_format')),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('chk_rec_pipeline_stage_flags'))).toBe(
      true,
    );
    expect(sqls.every((q) => !q.includes('stage_key IN ('))).toBe(true);
    expect(sqls.every((q) => !q.includes("'screening'"))).toBe(true);
  });

  it('VAL-REC-STG-02: reject uppercase Interview (format only — not closed enum)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await expect(
      svc.upsertStage(
        {
          companyId: 'holding',
          stageKey: 'Interview',
          nameVi: 'Phỏng vấn',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-REC-STG-04: open catalog accepts hr_custom_stage_07 (7th+)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.rec_pipeline_stage') &&
          s.includes('archived_at IS NULL')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.rec_pipeline_stage')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    const row = await svc.upsertStage(
      {
        companyId: 'holding',
        stageKey: 'hr_custom_stage_07',
        nameVi: 'Giai đoạn HR tùy chỉnh 07',
        sortOrder: 70,
      },
      groupCeoToken(),
    );
    expect(row.stageKey).toBe('hr_custom_stage_07');
    expect(row.source).toBe('rec_native');
    expect(row.catalogKind).toBe('rec_pipeline_stage');
  });

  it('VAL-REC-STG-06: isHiredOutcome without isTerminal → HRM-VAL-400', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await expect(
      svc.upsertStage(
        {
          companyId: 'holding',
          stageKey: 'custom_hired',
          nameVi: 'Thuê',
          isHiredOutcome: true,
          isTerminal: false,
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('VAL-REC-STG-07: hired + reject both true → HRM-VAL-400', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await expect(
      svc.upsertStage(
        {
          companyId: 'holding',
          stageKey: 'bad_flags',
          nameVi: 'Bad',
          isHiredOutcome: true,
          isRejectOutcome: true,
          isTerminal: true,
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('VAL-REC-STG-05: second hired outcome UQ → HRM-REC-STG-HIRED-DUP', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.rec_pipeline_stage') &&
          s.includes('archived_at IS NULL')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.rec_pipeline_stage')) {
          throw new Error(
            'duplicate key value violates unique constraint "uq_rec_pipeline_stage_hired_outcome_active"',
          );
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await expect(
      svc.upsertStage(
        {
          companyId: 'holding',
          stageKey: 'hired_alt',
          nameVi: 'Thuê alt',
          isHiredOutcome: true,
          isTerminal: true,
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-REC-STG-HIRED-DUP' });
  });

  it('scope_parity: list id → getById 200 (group CEO main→holding)', async () => {
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          if (schemaPassthrough(sql)) return { rows: [] };
          const s = String(sql);
          if (
            s.includes('FROM public.rec_pipeline_stage') &&
            s.includes('ORDER BY sort_order')
          ) {
            expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
            return { rows: [baseRow()] };
          }
          if (
            s.includes('FROM public.rec_pipeline_stage') &&
            s.includes('id = $1')
          ) {
            return { rows: [baseRow()] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    const auth = groupCeoToken();
    const list = await svc.listStages({ company_id: 'main' }, auth);
    expect(list.data).toHaveLength(1);
    const detail = await svc.getStageById(STG_ID, 'main', auth);
    expect(detail.id).toBe(STG_ID);
    expect(detail.stageKey).toBe('hr_custom_stage_07');
  });

  it('scope_parity: member CEO cannot get holding stage (OOS)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (
          String(sql).includes('FROM public.rec_pipeline_stage') &&
          String(sql).includes('id = $1')
        ) {
          return { rows: [baseRow({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await expect(
      svc.getStageById(STG_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('F-REC-CAT-EFF-01: hiredOutcomeKey from active is_hired_outcome', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.rec_pipeline_stage')) {
          return {
            rows: [
              baseRow({
                id: HIRED_ID,
                stage_key: 'hired',
                name_vi: 'Đã tuyển',
                is_terminal: true,
                is_hired_outcome: true,
                sort_order: 400,
              }),
              baseRow({
                stage_key: 'screening',
                name_vi: 'Sàng lọc',
                sort_order: 10,
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    const effective = await svc.listEffective(
      { company_id: 'holding' },
      groupCeoToken(),
    );
    expect(effective.total).toBe(2);
    expect(effective.hiredOutcomeKey).toBe('hired');
  });

  it('VAL-REC-STG-12: assert unknown when effective >0 → HRM-REC-STAGE-UNKNOWN', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.rec_pipeline_stage')) {
          return {
            rows: [baseRow({ stage_key: 'screening', name_vi: 'Sàng lọc' })],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await expect(
      svc.assertStageInEffectiveCatalog({
        companyId: 'holding',
        stageKey: 'not_in_catalog',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: 'HRM-REC-STAGE-UNKNOWN' });
  });

  it('VAL-REC-STG-13: empty effective catalog soft-allows (U65 — no fake starter)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    const hit = await svc.assertStageInEffectiveCatalog({
      companyId: 'holding',
      stageKey: 'anything',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('VAL-REC-STG-10: retire sole hired-outcome → HRM-REC-STG-HIRED-REQUIRED', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.rec_pipeline_stage') &&
          s.includes('id = $1')
        ) {
          return {
            rows: [
              baseRow({
                id: HIRED_ID,
                stage_key: 'hired',
                is_hired_outcome: true,
                is_terminal: true,
              }),
            ],
          };
        }
        if (s.includes('is_hired_outcome = TRUE') && s.includes('id <>')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    await expect(
      svc.retireStage(HIRED_ID, 'holding', groupCeoToken()),
    ).rejects.toMatchObject({ code: 'HRM-REC-STG-HIRED-REQUIRED' });
  });

  it('retire soft-deletes — status=retired + archived_at (no hard DELETE)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.rec_pipeline_stage') &&
          s.includes('id = $1')
        ) {
          return { rows: [baseRow()] };
        }
        if (
          s.includes('UPDATE public.rec_pipeline_stage') &&
          s.includes("status = 'retired'")
        ) {
          return {
            rows: [
              baseRow({
                status: 'retired',
                archived_at: '2026-08-07T12:00:00Z',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    const row = await svc.retireStage(STG_ID, 'holding', groupCeoToken());
    expect(row.status).toBe('retired');
    expect(row.archivedAt).toBeTruthy();
    expect(
      sqls.every((q) => !q.includes('DELETE FROM public.rec_pipeline_stage')),
    ).toBe(true);
  });

  it('VAL-REC-STG-15: wf_task_type_key ops map does not invent second catalog row', async () => {
    let insertCount = 0;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.rec_pipeline_stage') &&
          s.includes('archived_at IS NULL')
        ) {
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.rec_pipeline_stage')) {
          insertCount += 1;
          return {
            rows: [
              baseRow({
                stage_key: 'screening',
                name_vi: 'Sàng lọc',
                wf_task_type_key: 'rec_screening',
              }),
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new RecPipelineStageService(db);
    const row = await svc.upsertStage(
      {
        companyId: 'holding',
        stageKey: 'screening',
        nameVi: 'Sàng lọc',
        wfTaskTypeKey: 'rec_screening',
      },
      groupCeoToken(),
    );
    expect(row.wfTaskTypeKey).toBe('rec_screening');
    expect(insertCount).toBe(1);
  });
});
