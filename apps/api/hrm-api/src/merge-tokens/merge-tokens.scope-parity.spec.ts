/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01 — scope_parity list ↔ get-by-id (U19)
 * + ensureSchema omits closed token enum / no XEVN code CHECK reintroduce
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { MergeTokensService } from './merge-tokens.service';

const TOKEN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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

describe('MergeTokens scope_parity + ensureSchema (PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01)', () => {
  it('list id → getById 200 with same scope resolver (group CEO main→holding)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          sqls.push(s);
          if (
            s.includes('CREATE TABLE') ||
            s.includes('CREATE INDEX') ||
            s.includes('CREATE UNIQUE') ||
            s.includes('ALTER TABLE') ||
            s.includes('DO $$')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('FROM public.hrm_merge_tokens') &&
            s.includes('ORDER BY token_key')
          ) {
            expect(JSON.stringify(params ?? [])).toMatch(/holding|main/);
            return {
              rows: [
                {
                  id: TOKEN_ID,
                  company_id: 'holding',
                  token_key: 'custom.emp.badge',
                  source_path: 'custom.emp.badge',
                  ring: 'custom',
                  domain: 'EMP',
                  label_vi: 'Mã thẻ',
                  status: 'active',
                  origin: 'extension_field',
                  extension_field_ref: 'badge',
                  meta_json: null,
                  version: 1,
                  archived_at: null,
                  created_at: '2026-08-07T00:00:00Z',
                  updated_at: '2026-08-07T00:00:00Z',
                  created_by: null,
                  updated_by: null,
                },
              ],
            };
          }
          if (
            s.includes('FROM public.hrm_merge_tokens') &&
            s.includes('id = $1')
          ) {
            expect(s).toMatch(/company_id/);
            return {
              rows: [
                {
                  id: TOKEN_ID,
                  company_id: 'holding',
                  token_key: 'custom.emp.badge',
                  source_path: 'custom.emp.badge',
                  ring: 'custom',
                  domain: 'EMP',
                  label_vi: 'Mã thẻ',
                  status: 'active',
                  origin: 'extension_field',
                  extension_field_ref: 'badge',
                  meta_json: null,
                  version: 1,
                  archived_at: null,
                  created_at: '2026-08-07T00:00:00Z',
                  updated_at: '2026-08-07T00:00:00Z',
                  created_by: null,
                  updated_by: null,
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;

    const svc = new MergeTokensService(db);
    const auth = groupCeoToken();
    const list = await svc.listTokens({ company_id: 'main' }, auth);
    expect(list.items).toHaveLength(1);
    const detail = await svc.getTokenById(TOKEN_ID, 'main', auth);
    expect(detail.id).toBe(TOKEN_ID);
    expect(detail.tokenKey).toBe('custom.emp.badge');
  });

  it('member CEO cannot get holding token (scope mismatch)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.hrm_merge_tokens') &&
          s.includes('id = $1')
        ) {
          // Out of member scope — empty (filter) OR return row then assert fails
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const svc = new MergeTokensService(db);
    await expect(
      svc.getTokenById(TOKEN_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('upsert rejects invalid tokenKey format only (not closed enum)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new MergeTokensService(db);
    await expect(
      svc.upsertToken(
        {
          companyId: 'holding',
          tokenKey: 'BAD KEY!!',
          sourcePath: 'x',
          ring: 'custom',
          domain: 'EMP',
          labelVi: 'Bad',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-PLT-CAT-CODE-INVALID' });
  });

  it('ensureSchema ADD hrm_merge_tokens + CHKs; FORBIDDEN closed token_key IN / XEVN code CHECK', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new MergeTokensService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('CREATE TABLE IF NOT EXISTS public.hrm_merge_tokens'),
      ),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('chk_hrm_merge_tok_key_format'))).toBe(
      true,
    );
    expect(
      sqls.some((q) => q.includes('uq_hrm_merge_tok_company_key_active')),
    ).toBe(true);
    expect(sqls.every((q) => !q.includes('token_key IN ('))).toBe(true);
    expect(
      sqls.every((q) => !q.includes("code IN ('XEVN_PROBATION_OFFICE'")),
    ).toBe(true);
    expect(sqls.every((q) => !q.includes('chk_hrm_ctr_tpl_xevn_code'))).toBe(
      true,
    );
  });

  it('resolvePreview empty registry + keyword_map still returns 200 path shape', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.hrm_merge_tokens')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.hrm_contract_templates')) {
          return {
            rows: [
              {
                id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                company_id: 'holding',
                keyword_map: {
                  '{{contract_number}}': {
                    source: 'employee_contracts.contract_code',
                    ring: 'contract',
                  },
                },
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new MergeTokensService(db);
    const out = await svc.resolvePreview(
      {
        companyId: 'main',
        templateId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        tokenKeys: ['contract_number'],
        fieldOverrides: { contract_number: 'HD-PREV-01' },
      },
      groupCeoToken(),
    );
    expect(out.resolveOrder).toMatch(/keyword_map|override/);
    expect(out.tokens.length).toBeGreaterThan(0);
    expect(out.mergedPreview.contract_number).toBe('HD-PREV-01');
  });
});
