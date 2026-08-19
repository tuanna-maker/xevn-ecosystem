/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01 —
 * ensureSchema · open DOC catalog · scope_parity U19 · soft retire · EFF assert
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmpDocumentTypeService } from './emp-document-type.service';

const DOC_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

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
    id: DOC_ID,
    company_id: 'holding',
    document_type_key: 'hr_doc_custom_09',
    name_vi: 'Giấy tờ HR tùy chỉnh 09',
    sort_order: 100,
    required_by_default: false,
    requires_expiry: false,
    blocks_activation: false,
    is_identity_doc: false,
    allowed_mime_json: null,
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

describe('EmpDocumentTypeService (PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01)', () => {
  it('ensureSchema ADD emp_document_type + CHKs; FORBIDDEN closed document_type_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpDocumentTypeService(db);
    await svc.ensureSchema();
    expect(sqls.some((q) => q.includes('CREATE TABLE IF NOT EXISTS public.emp_document_type'))).toBe(
      true,
    );
    expect(sqls.some((q) => q.includes('uq_emp_document_type_company_key_active'))).toBe(true);
    expect(sqls.some((q) => q.includes('chk_emp_doc_type_key_format'))).toBe(true);
    expect(sqls.every((q) => !q.includes("document_type_key IN ("))).toBe(true);
    expect(sqls.every((q) => !q.includes("'cccd'"))).toBe(true);
  });

  it('VAL-EMP-DOC-02: reject uppercase / invalid format (not closed enum)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpDocumentTypeService(db);
    await expect(
      svc.upsertDocumentType(
        {
          companyId: 'holding',
          documentTypeKey: 'CCCD',
          nameVi: 'Căn cước',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('VAL-EMP-DOC-04: open catalog accepts hr_doc_custom_09 (N+)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.emp_document_type') && s.includes('archived_at IS NULL')) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_document_type')) {
        return { rows: [baseRow()] };
      }
      if (s.includes('FROM public.hrm_merge_tokens')) return { rows: [] };
      if (s.includes('INSERT INTO public.hrm_merge_tokens')) return { rows: [] };
      return { rows: [] };
    });
    const svc = new EmpDocumentTypeService(db);
    const row = await svc.upsertDocumentType(
      {
        companyId: 'holding',
        documentTypeKey: 'hr_doc_custom_09',
        nameVi: 'Giấy tờ HR tùy chỉnh 09',
      },
      groupCeoToken(),
    );
    expect(row.documentTypeKey).toBe('hr_doc_custom_09');
    expect(row.source).toBe('emp_native');
    expect((db as { withTransaction: jest.Mock }).withTransaction).toHaveBeenCalled();
  });

  it('scope_parity: list id → getById 200 (group CEO main→holding)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (s.includes('FROM public.emp_document_type') && s.includes('ORDER BY sort_order')) {
          expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
          return { rows: [baseRow()] };
        }
        if (s.includes('FROM public.emp_document_type') && s.includes('id = $1')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpDocumentTypeService(db);
    const auth = groupCeoToken();
    const list = await svc.listDocumentTypes({ company_id: 'main' }, auth);
    expect(list.data).toHaveLength(1);
    const detail = await svc.getDocumentTypeById(DOC_ID, 'main', auth);
    expect(detail.id).toBe(DOC_ID);
    expect(detail.documentTypeKey).toBe('hr_doc_custom_09');
  });

  it('scope_parity VAL-EMP-DOC-08: member CEO cannot get holding DOC (OOS)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.emp_document_type') && String(sql).includes('id = $1')) {
          return { rows: [baseRow({ company_id: 'holding' })] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpDocumentTypeService(db);
    await expect(
      svc.getDocumentTypeById(DOC_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('VAL-EMP-DOC-05: retire soft — status=retired + archived_at; no hard DELETE', async () => {
    const retired = baseRow({
      status: 'retired',
      archived_at: '2026-08-07T12:00:00Z',
    });
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (s.includes('FROM public.emp_document_type') && s.includes('id = $1')) {
        return { rows: [baseRow()] };
      }
      if (s.includes('UPDATE public.emp_document_type') && s.includes("status = 'retired'")) {
        expect(s).toMatch(/archived_at = NOW/);
        expect(s).not.toMatch(/DELETE/i);
        return { rows: [retired] };
      }
      if (s.includes('UPDATE public.hrm_merge_tokens')) {
        expect(s).toMatch(/status = 'retired'/);
        expect(s).not.toMatch(/DELETE/i);
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new EmpDocumentTypeService(db);
    const row = await svc.retireDocumentType(DOC_ID, 'main', groupCeoToken());
    expect(row.status).toBe('retired');
    expect(row.archivedAt).toBeTruthy();
  });

  it('VAL-EMP-DOC-07: assert UNKNOWN when catalog >0 and key missing', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        if (String(sql).includes('FROM public.emp_document_type') && String(sql).includes('ORDER BY')) {
          return { rows: [baseRow()] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpDocumentTypeService(db);
    await expect(
      svc.assertDocumentTypeInEffectiveCatalog({
        companyId: 'holding',
        documentTypeKey: 'not_in_catalog',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: 'HRM-EMP-DOC-TYPE-UNKNOWN' });
  });

  it('empty effective soft-allows unknown key (U65 no fake starter)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new EmpDocumentTypeService(db);
    const hit = await svc.assertDocumentTypeInEffectiveCatalog({
      companyId: 'holding',
      documentTypeKey: 'anything',
      authorization: groupCeoToken(),
    });
    expect(hit).toBeNull();
  });
});
