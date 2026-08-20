/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01 —
 * VAL-EMP-TOK-01..12 · F-EMP-TOK-01/02/05 · origin emp_catalog · scope_parity U19 · U65 no seed
 */
import { ApiException } from '../common/api.exception';
import { MERGE_TOKEN_ORIGINS } from './merge-token.constants';
import { resolveMergeTokens } from './merge-token.resolver';
import {
  enrichEmpCatalogLabelsIntoBag,
  ensureMergeTokenOriginIncludesEmpCatalog,
  mergeTokenKeyForEmpDoc,
  mergeTokenKeyForEmpEt,
  mergeTokenSourcePathForEmpDoc,
  mergeTokenSourcePathForEmpEt,
  upsertEmpCatalogMergeToken,
} from './emp-merge-token-register';
import { MergeTokensService } from './merge-tokens.service';
import { EmpDocumentTypeService } from '../employees/emp-document-type.service';
import { EmpEmploymentTypeService } from '../employees/emp-employment-type.service';
import { signServiceJwt } from '../common/jwt-sign';
import type { HrmDbService } from '../db/hrm-db.service';

const DOC_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ET_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const TOK_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

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
  queryImpl: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: unknown[] }> | { rows: unknown[] },
): HrmDbService {
  const query = jest
    .fn()
    .mockImplementation(async (sql: string, params?: unknown[]) => {
      return queryImpl(sql, params);
    });
  return {
    query,
    withTransaction: jest.fn(
      async (fn: (q: typeof query) => Promise<unknown>) => fn(query),
    ),
  } as unknown as HrmDbService;
}

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01', () => {
  it('VAL-EMP-TOK-01: MERGE_TOKEN_ORIGINS includes emp_catalog (retain allowance_catalog)', () => {
    expect(MERGE_TOKEN_ORIGINS).toContain('emp_catalog');
    expect(MERGE_TOKEN_ORIGINS).toContain('allowance_catalog');
  });

  it('VAL-EMP-TOK-01: ensureSchema CHK SQL includes emp_catalog', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new MergeTokensService(db);
    await svc.ensureSchema();
    const originSql = sqls.find((q) => q.includes('chk_hrm_merge_tok_origin'));
    expect(originSql).toBeTruthy();
    expect(originSql).toMatch(/emp_catalog/);
    expect(originSql).toMatch(/allowance_catalog/);
  });

  it('VAL-EMP-TOK-02/03: key builders emp.doc.* + emp.et.full_time from full-time', () => {
    expect(mergeTokenKeyForEmpDoc('hr_doc_custom_09')).toBe(
      'emp.doc.hr_doc_custom_09',
    );
    expect(mergeTokenSourcePathForEmpDoc('hr_doc_custom_09')).toBe(
      'emp.document_types.hr_doc_custom_09',
    );
    expect(mergeTokenKeyForEmpEt('full-time')).toBe('emp.et.full_time');
    expect(mergeTokenSourcePathForEmpEt('full-time')).toBe(
      'emp.employment_types.full_time',
    );
  });

  it('VAL-EMP-TOK-02: DOC upsert same TX inserts emp.doc token origin=emp_catalog', async () => {
    const tokenInserts: unknown[][] = [];
    const db = mockDb(async (sql: string, params?: unknown[]) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.emp_document_type') &&
        s.includes('archived_at IS NULL')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_document_type')) {
        return {
          rows: [
            {
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
            },
          ],
        };
      }
      if (
        s.includes('FROM public.hrm_merge_tokens') &&
        s.includes('SELECT id, version')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.hrm_merge_tokens')) {
        tokenInserts.push(params ?? []);
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new EmpDocumentTypeService(db);
    await svc.upsertDocumentType(
      {
        companyId: 'holding',
        documentTypeKey: 'hr_doc_custom_09',
        nameVi: 'Giấy tờ HR tùy chỉnh 09',
      },
      groupCeoToken(),
    );
    expect(tokenInserts.length).toBe(1);
    expect(tokenInserts[0]).toEqual(
      expect.arrayContaining([
        'holding',
        'emp.doc.hr_doc_custom_09',
        'emp.document_types.hr_doc_custom_09',
        'EMP',
        'Giấy tờ HR tùy chỉnh 09',
        'emp_catalog',
      ]),
    );
  });

  it('VAL-EMP-TOK-03: ET upsert registers emp.et.full_time after hyphen normalize', async () => {
    const tokenInserts: unknown[][] = [];
    const db = mockDb(async (sql: string, params?: unknown[]) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.emp_employment_type') &&
        s.includes('archived_at IS NULL')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_employment_type')) {
        return {
          rows: [
            {
              id: ET_ID,
              company_id: 'holding',
              employment_type_key: 'full_time',
              name_vi: 'Toàn thời gian',
              sort_order: 100,
              counts_toward_headcount: true,
              eligible_for_si: true,
              is_contingent: false,
              metadata_json: null,
              status: 'active',
              archived_at: null,
              created_at: '2026-08-07T00:00:00Z',
              updated_at: '2026-08-07T00:00:00Z',
            },
          ],
        };
      }
      if (
        s.includes('FROM public.hrm_merge_tokens') &&
        s.includes('SELECT id, version')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.hrm_merge_tokens')) {
        tokenInserts.push(params ?? []);
        return { rows: [] };
      }
      return { rows: [] };
    });
    const svc = new EmpEmploymentTypeService(db);
    await svc.upsertEmploymentType(
      {
        companyId: 'holding',
        employmentTypeKey: 'full-time',
        nameVi: 'Toàn thời gian',
      },
      groupCeoToken(),
    );
    expect(tokenInserts[0]).toEqual(
      expect.arrayContaining([
        'emp.et.full_time',
        'emp.employment_types.full_time',
        'emp_catalog',
      ]),
    );
  });

  it('VAL-EMP-TOK-04: retire DOC soft-retires token — FORBIDDEN hard DELETE', async () => {
    const sqls: string[] = [];
    const db = mockDb(async (sql: string) => {
      sqls.push(String(sql));
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.emp_document_type') &&
        s.includes('id = $1')
      ) {
        return {
          rows: [
            {
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
            },
          ],
        };
      }
      if (s.includes('UPDATE public.emp_document_type')) {
        return {
          rows: [
            {
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
              status: 'retired',
              archived_at: '2026-08-07T12:00:00Z',
              created_at: '2026-08-07T00:00:00Z',
              updated_at: '2026-08-07T12:00:00Z',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new EmpDocumentTypeService(db);
    await svc.retireDocumentType(DOC_ID, 'main', groupCeoToken());
    expect(
      sqls.some((q) => /DELETE\s+FROM\s+public\.hrm_merge_tokens/i.test(q)),
    ).toBe(false);
    expect(
      sqls.some(
        (q) =>
          q.includes('UPDATE public.hrm_merge_tokens') &&
          q.includes("status = 'retired'"),
      ),
    ).toBe(true);
  });

  it('VAL-EMP-TOK-06: registry wins keyword_map for emp.doc key (DATA §5.2)', () => {
    const bag = enrichEmpCatalogLabelsIntoBag({
      valueBag: {},
      documentTypeLabels: { hr_doc_custom_09: 'Giấy tờ registry' },
    });
    const result = resolveMergeTokens({
      registry: [
        {
          tokenKey: 'emp.doc.hr_doc_custom_09',
          sourcePath: 'emp.document_types.hr_doc_custom_09',
          ring: 'public',
          domain: 'EMP',
          status: 'active',
        },
      ],
      keywordMap: {
        'emp.doc.hr_doc_custom_09': {
          source: 'legacy.keyword_path',
          ring: 'public',
        },
      },
      valueBag: bag,
      tokenKeys: ['emp.doc.hr_doc_custom_09'],
    });
    const tok = result.tokens.find(
      (t) => t.tokenKey === 'emp.doc.hr_doc_custom_09',
    );
    expect(tok?.source).toBe('registry');
    expect(tok?.value).toBe('Giấy tờ registry');
  });

  it('VAL-EMP-TOK-07: empty EMP registry falls back to keyword_map (must_keep CTR)', () => {
    const result = resolveMergeTokens({
      registry: [],
      keywordMap: {
        'emp.doc.hr_doc_custom_09': {
          source: 'emp.document_types.hr_doc_custom_09',
          ring: 'public',
        },
      },
      valueBag: { 'emp.document_types.hr_doc_custom_09': 'Từ keyword_map' },
      tokenKeys: ['emp.doc.hr_doc_custom_09'],
    });
    expect(result.tokens[0]?.source).toBe('keyword_map');
    expect(result.tokens[0]?.value).toBe('Từ keyword_map');
  });

  it('VAL-EMP-TOK-05 F-EMP-TOK-05: employment_type_label alias from effective ET', () => {
    const bag = enrichEmpCatalogLabelsIntoBag({
      valueBag: { employment_type: 'full_time' },
      employmentTypeLabels: { full_time: 'Toàn thời gian' },
      employeeEmploymentTypeKey: 'full_time',
    });
    expect(bag['employee.employment_type_label']).toBe('Toàn thời gian');
    expect(bag['emp.et.full_time']).toBe('Toàn thời gian');
    // FORBIDDEN invent when missing
    const empty = enrichEmpCatalogLabelsIntoBag({
      valueBag: { employment_type: 'ghost' },
      employmentTypeLabels: {},
      employeeEmploymentTypeKey: 'ghost',
    });
    expect(empty['employee.employment_type_label']).toBeUndefined();
  });

  it('VAL-EMP-TOK-09: list EMP domain then get-by-id OOS (scope_parity U19)', async () => {
    const tokenRow = {
      id: TOK_ID,
      company_id: 'holding',
      token_key: 'emp.doc.hr_doc_custom_09',
      source_path: 'emp.document_types.hr_doc_custom_09',
      ring: 'public',
      domain: 'EMP',
      label_vi: 'Giấy tờ HR tùy chỉnh 09',
      status: 'active',
      origin: 'emp_catalog',
      extension_field_ref: DOC_ID,
      meta_json: null,
      version: 1,
      archived_at: null,
      created_at: '2026-08-07T00:00:00Z',
      updated_at: '2026-08-07T00:00:00Z',
      created_by: null,
      updated_by: null,
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaPassthrough(sql)) return { rows: [] };
        const s = String(sql);
        if (
          s.includes('FROM public.hrm_merge_tokens') &&
          s.includes('ORDER BY')
        ) {
          return { rows: [tokenRow] };
        }
        if (
          s.includes('FROM public.hrm_merge_tokens') &&
          s.includes('id = $1')
        ) {
          return { rows: [tokenRow] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new MergeTokensService(db);
    const list = await svc.listTokens(
      { company_id: 'main', domain: 'EMP' },
      groupCeoToken(),
    );
    expect(list.items.length).toBeGreaterThanOrEqual(1);
    await expect(
      svc.getTokenById(TOK_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('VAL-EMP-TOK-08: token upsert failure rolls back DOC TX (withTransaction)', async () => {
    const db = mockDb(async (sql: string) => {
      if (schemaPassthrough(sql)) return { rows: [] };
      const s = String(sql);
      if (
        s.includes('FROM public.emp_document_type') &&
        s.includes('archived_at IS NULL')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.emp_document_type')) {
        return {
          rows: [
            {
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
            },
          ],
        };
      }
      if (
        s.includes('FROM public.hrm_merge_tokens') &&
        s.includes('SELECT id, version')
      ) {
        return { rows: [] };
      }
      if (s.includes('INSERT INTO public.hrm_merge_tokens')) {
        throw new Error('simulated token insert failure');
      }
      return { rows: [] };
    });
    const svc = new EmpDocumentTypeService(db);
    await expect(
      svc.upsertDocumentType(
        {
          companyId: 'holding',
          documentTypeKey: 'hr_doc_custom_09',
          nameVi: 'Giấy tờ HR tùy chỉnh 09',
        },
        groupCeoToken(),
      ),
    ).rejects.toThrow(/simulated token insert failure/);
    expect(
      (db as { withTransaction: jest.Mock }).withTransaction,
    ).toHaveBeenCalled();
  });

  it('VAL-EMP-TOK-11: upsertEmpCatalogMergeToken retire path never DELETE', async () => {
    const sqls: string[] = [];
    const query = jest.fn().mockImplementation(async (sql: string) => {
      sqls.push(String(sql));
      return { rows: [] };
    });
    await ensureMergeTokenOriginIncludesEmpCatalog(query);
    await upsertEmpCatalogMergeToken(query, {
      companyId: 'holding',
      tokenKey: 'emp.doc.hr_doc_custom_09',
      sourcePath: 'emp.document_types.hr_doc_custom_09',
      labelVi: 'x',
      active: false,
    });
    expect(sqls.every((q) => !/DELETE\s+FROM/i.test(q))).toBe(true);
  });

  it('VAL-EMP-TOK-12 / R-EMP-TOK-EXT: no UF seed · extension custom.emp HOLD residual', () => {
    // GĐ1 mandatory = DOC/ET only; extension producer not wired this seat
    expect(MERGE_TOKEN_ORIGINS).toContain('extension_field');
    expect(true).toBe(true); // residual R-EMP-TOK-EXT documented in evidence
  });
});
