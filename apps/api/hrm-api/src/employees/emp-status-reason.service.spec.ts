/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01 —
 * reason companion catalog · invent KEY · applies_to · empty EFF soft
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_EMP_STATUS_REASON_KEY } from './emp-status-reason.constants';
import { EmpStatusReasonService } from './emp-status-reason.service';

const STR_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function baseRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: STR_ID,
    company_id: 'holding',
    reason_key: 'resign_personal',
    name_vi: 'Nghỉ việc lý do cá nhân',
    sort_order: 100,
    applies_to_status_keys_json: ['resigned'],
    metadata_json: null,
    status: 'active',
    archived_at: null,
    created_at: '2026-08-08T00:00:00Z',
    updated_at: '2026-08-08T00:00:00Z',
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

function mockDb(
  queryImpl: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> | { rows: unknown[] },
): HrmDbService {
  const query = jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
    return queryImpl(sql, params);
  });
  return {
    query,
    withTransaction: jest.fn(async (fn: (q: typeof query) => Promise<unknown>) => fn(query)),
  } as unknown as HrmDbService;
}

describe('EmpStatusReasonService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01)', () => {
  it('VAL-EMP-STR-CAT ensureSchema ADD emp_status_reason; FORBIDDEN closed reason_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpStatusReasonService(db);
    await svc.ensureSchema();
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.emp_status_reason'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('uq_emp_status_reason_company_key_active'))).toBe(true);
    expect(sqls.every((q) => !q.includes('reason_key IN ('))).toBe(true);
  });

  it('VAL-EMP-STR-CAT-01: create open reason N+1', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.emp_status_reason') && s.includes('archived_at IS NULL')) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_status_reason')) {
        return { rows: [baseRow({ reason_key: 'term_custom_x' })] };
      }
      return { rows: [] };
    });
    const svc = new EmpStatusReasonService(db);
    const row = await svc.upsertStatusReason(
      {
        companyId: 'holding',
        reasonKey: 'term_custom_x',
        nameVi: 'Lý do tùy chỉnh',
      },
      groupCeoToken(),
    );
    expect(row.reasonKey).toBe('term_custom_x');
  });

  it('VAL-EMP-STR-CNS-01: invent reason when EFF>0 → HRM-EMP-STATUS-REASON-KEY', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.emp_status_reason')) {
        return { rows: [baseRow()] };
      }
      return { rows: [] };
    });
    const svc = new EmpStatusReasonService(db);
    await expect(
      svc.assertStatusReasonInEffectiveCatalog({
        companyId: 'holding',
        reasonKey: 'invent_reason',
        statusKey: 'resigned',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_EMP_STATUS_REASON_KEY });
  });

  it('VAL-EMP-STR-CNS-02: reason not in applies_to → KEY', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.emp_status_reason')) {
        return { rows: [baseRow()] };
      }
      return { rows: [] };
    });
    const svc = new EmpStatusReasonService(db);
    // listEffective filters applies_to — invent for wrong status yields empty or mismatch
    await expect(
      svc.assertStatusReasonInEffectiveCatalog({
        companyId: 'holding',
        reasonKey: 'resign_personal',
        statusKey: 'active',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_EMP_STATUS_REASON_KEY });
  });

  it('VAL-EMP-STR-CAT-05: empty EFF + not required → soft skip', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      return { rows: [] };
    });
    const svc = new EmpStatusReasonService(db);
    const hit = await svc.assertStatusReasonInEffectiveCatalog({
      companyId: 'holding',
      reasonKey: 'free_text_ok',
      requiresReason: false,
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('requires_reason=true + missing reason → KEY', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      return { rows: [] };
    });
    const svc = new EmpStatusReasonService(db);
    await expect(
      svc.assertStatusReasonInEffectiveCatalog({
        companyId: 'holding',
        reasonKey: '',
        requiresReason: true,
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_EMP_STATUS_REASON_KEY });
  });

  it('soft-retire reason', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('SELECT') && s.includes('id = $1')) {
        return { rows: [baseRow()] };
      }
      if (s.includes('UPDATE') && s.includes('archived_at = NOW()')) {
        return { rows: [baseRow({ status: 'retired', archived_at: '2026-08-08T02:00:00Z' })] };
      }
      return { rows: [] };
    });
    const svc = new EmpStatusReasonService(db);
    const row = await svc.retireStatusReason(STR_ID, 'holding', groupCeoToken());
    expect(row.archivedAt).toBeTruthy();
  });
});
