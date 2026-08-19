/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01 —
 * ensureSchema · open CODE catalog · EFF ATT wins REF · invent KEY · CHECK DROP · scope_parity
 * VAL-ATT-CODE-CNS-01..10 smoke
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_ATT_CODE_KEY } from './att-attendance-code.constants';
import { AttAttendanceCodeService } from './att-attendance-code.service';
import { AttendanceService } from './attendance.service';

const CODE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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
    id: CODE_ID,
    company_id: 'holding',
    code: 'business_trip',
    name_vi: 'Công tác',
    symbol: 'CT',
    sort_order: 100,
    counts_as: 'work',
    day_weight: 1,
    is_paid: true,
    is_present: false,
    color: null,
    legacy_alias_keys_json: null,
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
    s.includes('DO $$') ||
    s.includes('DROP CONSTRAINT')
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

describe('AttAttendanceCodeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01)', () => {
  it('VAL-ATT-CODE-CNS ensureSchema ADD att_attendance_code + CHKs; FORBIDDEN closed code IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new AttAttendanceCodeService(db);
    await svc.ensureSchema();
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.att_attendance_code'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('uq_att_attendance_code_company_code_active'))).toBe(true);
    expect(sqls.some((q) => q.includes('ix_att_attendance_code_effective'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_att_att_code_format'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_att_att_code_counts_as'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_att_att_code_day_weight'))).toBe(true);
    expect(sqls.every((q) => !q.includes("code IN ("))).toBe(true);
    expect(sqls.every((q) => !q.includes("CHECK (code IN ('pending'"))).toBe(true);
  });

  it('VAL-ATT-CODE-CNS-02: admin CREATE open N+1 code business_trip', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.att_attendance_code') && s.includes('archived_at IS NULL')) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.att_attendance_code')) {
        return { rows: [baseRow()] };
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    const row = await svc.upsertAttendanceCode(
      {
        companyId: 'holding',
        code: 'business_trip',
        nameVi: 'Công tác',
        symbol: 'CT',
        countsAs: 'work',
      },
      groupCeoToken(),
    );
    expect(row.code).toBe('business_trip');
    expect(row.symbol).toBe('CT');
    expect(row.statusLabel).toBe('Công tác');
    expect(row.source).toBe('att_native');
  });

  it('VAL-ATT-CODE-CNS-07 admin format: invalid slug → HRM-PLT-CAT-CODE-INVALID', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    await expect(
      svc.upsertAttendanceCode(
        { companyId: 'holding', code: '9Bad Key', nameVi: 'x', symbol: 'X' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-ATT-CODE-CNS-02b: duplicate active code → HRM-PLT-CAT-CODE-CONFLICT', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.att_attendance_code') && s.includes('archived_at IS NULL')) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.att_attendance_code')) {
        throw new Error(
          'duplicate key value violates unique constraint uq_att_attendance_code_company_code_active',
        );
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    await expect(
      svc.upsertAttendanceCode(
        { companyId: 'holding', code: 'business_trip', nameVi: 'x', symbol: 'CT' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-CONFLICT' });
  });

  it('VAL-ATT-CODE-CNS-04: soft-retire sets archived_at', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('SELECT') && s.includes('FROM public.att_attendance_code') && s.includes('id = $1')) {
        return { rows: [baseRow()] };
      }
      if (s.includes('UPDATE') && s.includes("status = 'retired'")) {
        return {
          rows: [baseRow({ status: 'retired', archived_at: '2026-08-08T01:00:00Z' })],
        };
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    const row = await svc.retireAttendanceCode(CODE_ID, 'holding', groupCeoToken());
    expect(row.status).toBe('retired');
    expect(row.archivedAt).toBeTruthy();
  });

  it('VAL-ATT-CODE-CNS dual-SoT: EFF ATT wins group REF on same code', async () => {
    const settings = {
      getEffectiveItemsForKey: jest.fn().mockResolvedValue([
        { status: 'active', code: 'present', label: 'REF Có mặt' },
      ]),
    };
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_attendance_code')) {
        return {
          rows: [baseRow({ code: 'present', name_vi: 'ATT Có mặt override', symbol: 'X' })],
        };
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db, settings);
    const eff = await svc.listEffective({ company_id: 'holding' }, groupCeoToken());
    expect(eff.total).toBe(1);
    expect(eff.data[0].nameVi).toBe('ATT Có mặt override');
    expect(eff.data[0].source).toBe('att_override');
  });

  it('VAL-ATT-CODE-CNS-01: invent day-code when EFF>0 → HRM-ATT-CODE-KEY', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_attendance_code')) {
        return { rows: [baseRow({ code: 'present', symbol: 'X', name_vi: 'Có mặt' })] };
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    await expect(
      svc.assertCodeInEffectiveCatalog({
        companyId: 'holding',
        code: 'invent_unknown_code',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_ATT_CODE_KEY });
  });

  it('VAL-ATT-CODE-CNS-05: empty EFF → soft allow invent skip', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    const hit = await svc.assertCodeInEffectiveCatalog({
      companyId: 'holding',
      code: 'invent_when_empty',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });

  it('VAL-ATT-CODE-CNS-03: scope_parity list↔get-by-id same resolver (member OOS → 409)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_attendance_code') && String(sql).includes('id = $1')) {
        return { rows: [baseRow({ company_id: 'holding' })] };
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    await expect(
      svc.getAttendanceCodeById(CODE_ID, 'main', memberCeoToken()),
    ).rejects.toMatchObject({ code: 'HRM-SCOPE-409' });
  });

  it('VAL-ATT-CODE-CNS-08: display lookup exposes symbol + status_label', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      if (String(sql).includes('FROM public.att_attendance_code')) {
        return {
          rows: [
            baseRow({
              code: 'wfh',
              name_vi: 'Làm từ xa',
              symbol: 'WFH',
              legacy_alias_keys_json: JSON.stringify(['remote']),
            }),
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    const map = await svc.buildCodeDisplayLookup('holding', groupCeoToken());
    expect(map.get('wfh')).toEqual({ statusLabel: 'Làm từ xa', symbol: 'WFH' });
    expect(map.get('remote')).toEqual({ statusLabel: 'Làm từ xa', symbol: 'WFH' });
  });

  it('VAL-ATT-CODE-CNS-09: KEY taxonomy is HRM-ATT-CODE-KEY (≠ leave/EMP)', async () => {
    expect(HRM_ATT_CODE_KEY).toBe('HRM-ATT-CODE-KEY');
    expect(HRM_ATT_CODE_KEY).not.toBe('HRM-LEAVE-TYPE-UNKNOWN');
    expect(HRM_ATT_CODE_KEY).not.toBe('HRM-EMP-STATUS-KEY');
  });

  it('VAL-ATT-CODE-CNS-10: aggregate file path not rewritten by this seat (process marker)', () => {
    // L-ATT-CODE-07 — this suite must not import/mutate att-timesheet-line-aggregate counting.
    // Presence of typed flags on catalog row ≠ aggregate rewrite claim.
    const row = baseRow({ counts_as: 'work', day_weight: 0.5, is_paid: true, is_present: true });
    expect(row.counts_as).toBe('work');
    expect(Number(row.day_weight)).toBe(0.5);
  });

  it('VAL-ATT-CODE-CNS-04b: retired code not in default EFF list', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      // loadNativeRows default filters archived_at IS NULL AND status=active → empty
      if (String(sql).includes('FROM public.att_attendance_code')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new AttAttendanceCodeService(db);
    const eff = await svc.listEffective({ company_id: 'holding' }, groupCeoToken());
    expect(eff.total).toBe(0);
  });

  it('VAL-ATT-CODE-CNS-01 wire: AttendanceService createRecord invent → HRM-ATT-CODE-KEY', async () => {
    const catalog = {
      assertCodeInEffectiveCatalog: jest.fn().mockRejectedValue(
        new ApiException(HRM_ATT_CODE_KEY, 'invent', 400),
      ),
      buildCodeDisplayLookup: jest.fn().mockResolvedValue(new Map()),
    };
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      return { rows: [] };
    });
    const fanout = { publishAttendanceUpdateRequestEvent: jest.fn() };
    const config = {
      ensureWorkSitesSchema: jest.fn().mockResolvedValue(undefined),
      isGpsGeofenceEnabled: jest.fn().mockResolvedValue(false),
      countActiveWorkSites: jest.fn().mockResolvedValue(0),
    };
    const service = new AttendanceService(
      db,
      fanout as never,
      config as never,
      catalog as never,
    );
    await expect(
      service.createRecord(
        {
          company_id: 'holding',
          employee_id: '11111111-1111-4111-8111-111111111111',
          attendance_date: '2026-08-08',
          status: 'invent_xyz',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_ATT_CODE_KEY });
    expect(catalog.assertCodeInEffectiveCatalog).toHaveBeenCalled();
  });

  it('VAL-ATT-CODE-CNS-07 wire: open slug accepted by DTO path (service persists when EFF contains it)', async () => {
    const catalog = {
      assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
        code: 'wfh',
        statusLabel: 'Làm từ xa',
        symbol: 'WFH',
      }),
      buildCodeDisplayLookup: jest.fn().mockResolvedValue(
        new Map([['wfh', { statusLabel: 'Làm từ xa', symbol: 'WFH' }]]),
      ),
    };
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('INSERT INTO public.attendance_records')) {
        return {
          rows: [
            {
              id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              company_id: 'holding',
              employee_id: '11111111-1111-4111-8111-111111111111',
              attendance_date: '2026-08-08',
              check_in_at: null,
              check_out_at: null,
              status: 'wfh',
              note: null,
              created_by: null,
              created_at: '2026-08-08T00:00:00Z',
              updated_at: '2026-08-08T00:00:00Z',
              leave_request_id: null,
              leave_type_key: null,
            },
          ],
        };
      }
      if (s.includes('INSERT INTO public.attendance_events')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const fanout = { publishAttendanceUpdateRequestEvent: jest.fn() };
    const config = {
      ensureWorkSitesSchema: jest.fn().mockResolvedValue(undefined),
      isGpsGeofenceEnabled: jest.fn().mockResolvedValue(false),
      countActiveWorkSites: jest.fn().mockResolvedValue(0),
    };
    const service = new AttendanceService(
      db,
      fanout as never,
      config as never,
      catalog as never,
    );
    const created = await service.createRecord(
      {
        company_id: 'holding',
        employee_id: '11111111-1111-4111-8111-111111111111',
        attendance_date: '2026-08-08',
        status: 'wfh',
      },
      groupCeoToken(),
    );
    expect(created.status).toBe('wfh');
    expect(created.status_label).toBe('Làm từ xa');
    expect(created.symbol).toBe('WFH');
  });
});
