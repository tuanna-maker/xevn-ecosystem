/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-BE-03 (SoT) · PM alias BE-02 (DATA-02) —
 * publish / pull / apply · VAL-PUB · scope_parity.
 * Note: PDF binary evidence stays at po-hrm-contract-legal-print-be-02.md (do not overwrite).
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_CTR_PUB_CODE_CONFLICT,
  HRM_CTR_PUB_EMPTY,
  HRM_CTR_PUB_FORBIDDEN,
  HRM_CTR_PUB_NOTHING_TO_APPLY,
} from './contract-legal-print.constants';
import { ContractLegalPrintService } from './contract-legal-print.service';
import {
  canonicalizeLibraryPayload,
  checksumLibraryPayload,
  ContractLibraryPublishService,
  packRuleLineageCode,
} from './contract-library-publish.service';

const PUB_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9';

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

function schemaOk(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE')
  );
}

describe('Contract library publish helpers (BE-03)', () => {
  it('packRuleLineageCode uses ∅ for null match_value', () => {
    expect(packRuleLineageCode('fallback', null, 'GENERAL')).toBe('pr:fallback:∅:GENERAL');
    expect(packRuleLineageCode('job_family', 'DRIVER', 'DRIVER')).toBe('pr:job_family:DRIVER:DRIVER');
  });

  it('checksum is stable for key/order permutation of apply_to_packs', () => {
    const a = checksumLibraryPayload({
      templates: [],
      clauses: [
        {
          code: 'A',
          title_vi: 'T',
          body_vi: 'B',
          clause_group: 'G',
          apply_to_packs: ['DRIVER', '*'],
          sort_order: 1,
          mandatory: true,
          version: 1,
        },
      ],
      pack_rules: [],
    });
    const b = checksumLibraryPayload({
      templates: [],
      clauses: [
        {
          code: 'A',
          title_vi: 'T',
          body_vi: 'B',
          clause_group: 'G',
          apply_to_packs: ['*', 'DRIVER'],
          sort_order: 1,
          mandatory: true,
          version: 1,
        },
      ],
      pack_rules: [],
    });
    expect(a).toBe(b);
    expect(canonicalizeLibraryPayload({ templates: [], clauses: [], pack_rules: [] })).toContain(
      '"templates":[]',
    );
  });
});

describe('ContractLibraryPublishService (PO-HRM-CONTRACT-LEGAL-PRINT-BE-03)', () => {
  it('VAL-PUB-01: publish empty holding → HRM-CTR-PUB-EMPTY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaOk(sql)) return { rows: [] };
        if (sql.includes('FROM public.hrm_contract_templates')) return { rows: [] };
        if (sql.includes('FROM public.hrm_contract_clauses')) return { rows: [] };
        if (sql.includes('FROM public.hrm_contract_pack_rules')) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    await expect(svc.publishLibrary({}, groupCeoToken())).rejects.toMatchObject({
      code: HRM_CTR_PUB_EMPTY,
    });
  });

  it('VAL-PUB-05: member CEO publish → HRM-CTR-PUB-FORBIDDEN', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaOk(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    await expect(svc.publishLibrary({}, memberCeoToken())).rejects.toMatchObject({
      code: HRM_CTR_PUB_FORBIDDEN,
    });
  });

  it('scope_parity: publishes list ↔ getByVersion same tenant filter', async () => {
    const queries: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        queries.push(s);
        if (s.includes('FROM public.hrm_contract_library_publishes') && s.includes('ORDER BY publish_version')) {
          expect(params?.[0]).toBe('xevn');
          return {
            rows: [
              {
                id: PUB_ID,
                tenant_id: 'xevn',
                source_company_id: 'holding',
                publish_version: 3,
                checksum: 'deadbeef',
                payload_json: { templates: [], clauses: [], pack_rules: [] },
                label_vi: 'v3',
                template_count: 1,
                clause_count: 1,
                pack_rule_count: 0,
                published_at: '2026-08-07',
                published_by: 'ceo@xe.vn',
                status: 'published',
                archived_at: null,
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_library_publishes') && s.includes('publish_version = $2')) {
          expect(params?.[0]).toBe('xevn');
          expect(params?.[1]).toBe(3);
          return {
            rows: [
              {
                id: PUB_ID,
                tenant_id: 'xevn',
                source_company_id: 'holding',
                publish_version: 3,
                checksum: 'deadbeef',
                payload_json: {
                  templates: [{ code: 'T1', name_vi: 'M', pack_code: 'GENERAL', layout_json: {}, keyword_map: {}, version: 1 }],
                  clauses: [],
                  pack_rules: [],
                },
                label_vi: 'v3',
                template_count: 1,
                clause_count: 0,
                pack_rule_count: 0,
                published_at: '2026-08-07',
                published_by: 'ceo@xe.vn',
                status: 'published',
                archived_at: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    const list = await svc.listPublishes(groupCeoToken(), undefined, 'main');
    expect(list.total).toBe(1);
    expect(list.data[0]).not.toHaveProperty('payload_json');
    const detail = await svc.getPublishByVersion(3, groupCeoToken(), undefined, 'main', true);
    expect(detail.publish_version).toBe(3);
    expect((detail as { payload_json?: unknown }).payload_json).toBeDefined();
    expect(queries.some((q) => q.includes('ORDER BY publish_version'))).toBe(true);
    expect(queries.some((q) => q.includes('publish_version = $2'))).toBe(true);
  });

  it('VAL-PUB-07: pull into foreign member FAIL (member CEO → trsport)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaOk(sql)) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    await expect(
      svc.pullLibrary({ publish_version: 1 }, 'trsport', memberCeoToken()),
    ).rejects.toMatchObject({ code: 'HRM-SCOPE-409' });
  });

  it('VAL-PUB-02: pull member-local code → HRM-CTR-PUB-CODE-CONFLICT', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.hrm_contract_library_publishes') && s.includes('publish_version = $2')) {
          return {
            rows: [
              {
                id: PUB_ID,
                tenant_id: 'xevn',
                source_company_id: 'holding',
                publish_version: 1,
                checksum: 'x',
                payload_json: {
                  templates: [
                    {
                      code: 'LOCAL_TPL',
                      name_vi: 'Group',
                      pack_code: 'GENERAL',
                      layout_json: {},
                      keyword_map: {},
                      version: 1,
                    },
                  ],
                  clauses: [],
                  pack_rules: [],
                },
                label_vi: null,
                template_count: 1,
                clause_count: 0,
                pack_rule_count: 0,
                published_at: '2026-08-07',
                published_by: null,
                status: 'published',
                archived_at: null,
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_templates') && s.includes('lineage_code')) {
          return {
            rows: [
              {
                id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
                code: 'LOCAL_TPL',
                origin: 'member',
                lineage_code: null,
              },
            ],
          };
        }
        if (s.includes('INSERT INTO public.hrm_contract_library_pull_audits')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    await expect(
      svc.pullLibrary({ publish_version: 1 }, 'trsport', groupCeoToken()),
    ).rejects.toMatchObject({ code: HRM_CTR_PUB_CODE_CONFLICT });
  });

  it('VAL-PUB-04: re-pull skips member_override without force', async () => {
    const updates: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.hrm_contract_library_publishes') && s.includes('publish_version = $2')) {
          return {
            rows: [
              {
                id: PUB_ID,
                tenant_id: 'xevn',
                source_company_id: 'holding',
                publish_version: 2,
                checksum: 'y',
                payload_json: {
                  templates: [
                    {
                      code: 'HDLD',
                      name_vi: 'New title',
                      pack_code: 'GENERAL',
                      layout_json: {},
                      keyword_map: {},
                      version: 2,
                    },
                  ],
                  clauses: [],
                  pack_rules: [],
                },
                label_vi: null,
                template_count: 1,
                clause_count: 0,
                pack_rule_count: 0,
                published_at: '2026-08-07',
                published_by: null,
                status: 'published',
                archived_at: null,
              },
            ],
          };
        }
        // preflight conflict check
        if (
          s.includes('FROM public.hrm_contract_templates') &&
          s.includes('lineage_code = $2 OR lower(code)')
        ) {
          return {
            rows: [
              {
                id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
                code: 'HDLD',
                origin: 'member_override',
                lineage_code: 'HDLD',
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_templates') && s.includes('lineage_code = $2')) {
          return {
            rows: [
              {
                id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
                code: 'HDLD',
                origin: 'member_override',
                lineage_code: 'HDLD',
              },
            ],
          };
        }
        if (s.includes('UPDATE public.hrm_contract_templates')) {
          updates.push(s);
          return { rows: [] };
        }
        if (s.includes('INSERT INTO public.hrm_contract_library_pull_audits')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    const result = await svc.pullLibrary({ publish_version: 2, force: false }, 'trsport', groupCeoToken());
    expect(result.skipped_override).toContain('template:HDLD');
    expect(result.upserted).toEqual([]);
    expect(updates).toHaveLength(0);
  });

  it('VAL-PUB-03: apply with nothing → HRM-CTR-PUB-NOTHING-TO-APPLY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.hrm_contract_library_pull_audits')) {
          return { rows: [{ publish_version: 1 }] };
        }
        if (s.includes('FROM public.hrm_contract_templates')) return { rows: [] };
        if (s.includes('FROM public.hrm_contract_clauses')) return { rows: [] };
        if (s.includes('FROM public.hrm_contract_pack_rules')) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    await expect(svc.applyLibrary({ publish_version: 1 }, 'trsport', groupCeoToken())).rejects.toMatchObject({
      code: HRM_CTR_PUB_NOTHING_TO_APPLY,
    });
  });

  it('VAL-PUB-09: apply never mutates print_versions', async () => {
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        sqlLog.push(s);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.hrm_contract_templates') && s.includes(`origin = 'group'`)) {
          return { rows: [{ id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', code: 'HDLD' }] };
        }
        if (s.includes('FROM public.hrm_contract_clauses') && s.includes(`origin = 'group'`)) {
          return { rows: [] };
        }
        if (s.includes('FROM public.hrm_contract_pack_rules') && s.includes(`origin = 'group'`)) {
          return { rows: [] };
        }
        if (s.includes('FROM public.hrm_contract_clauses') && s.includes('mandatory = TRUE')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    const result = await svc.applyLibrary({ publish_version: 1 }, 'trsport', groupCeoToken());
    expect(result.print_versions_mutated).toBe(false);
    expect(result.activated_templates).toBe(1);
    const mutatePrint = sqlLog.filter(
      (q) =>
        q.includes('hrm_contract_print_versions') &&
        !q.includes('CREATE TABLE') &&
        !q.includes('CREATE INDEX') &&
        !q.includes('ADD COLUMN IF NOT EXISTS') &&
        !q.includes('ALTER TABLE'),
    );
    expect(mutatePrint).toEqual([]);
  });

  it('publish success returns version + checksum (happy path)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.hrm_contract_templates') && s.includes(`status = 'active'`)) {
          return {
            rows: [
              {
                code: 'HDLD',
                name_vi: 'Mẫu',
                pack_code: 'GENERAL',
                layout_json: {},
                keyword_map: {},
                version: 1,
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_clauses') && s.includes(`status = 'active'`)) {
          return {
            rows: [
              {
                code: 'JOB',
                title_vi: 'CV',
                body_vi: 'Nội dung',
                clause_group: 'JOB',
                apply_to_packs: ['*'],
                sort_order: 1,
                mandatory: true,
                version: 1,
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_pack_rules')) return { rows: [] };
        if (s.includes('COALESCE(MAX(publish_version)')) return { rows: [{ next: '1' }] };
        if (s.includes('INSERT INTO public.hrm_contract_library_publishes')) {
          return {
            rows: [
              {
                id: PUB_ID,
                tenant_id: 'xevn',
                source_company_id: 'holding',
                publish_version: 1,
                checksum: 'will-be-overwritten-by-return',
                payload_json: {},
                label_vi: 'R1',
                template_count: 1,
                clause_count: 1,
                pack_rule_count: 0,
                published_at: '2026-08-07T00:00:00Z',
                published_by: 'ceo@xe.vn',
                status: 'published',
                archived_at: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    // Fix INSERT return to use real checksum from insert params — service returns row.checksum from RETURNING
    (db.query as jest.Mock).mockImplementation(async (sql: string, params?: unknown[]) => {
      const s = String(sql);
      if (schemaOk(s)) return { rows: [] };
      if (s.includes('FROM public.hrm_contract_templates') && s.includes(`status = 'active'`)) {
        return {
          rows: [
            {
              code: 'HDLD',
              name_vi: 'Mẫu',
              pack_code: 'GENERAL',
              layout_json: {},
              keyword_map: {},
              version: 1,
            },
          ],
        };
      }
      if (s.includes('FROM public.hrm_contract_clauses') && s.includes(`status = 'active'`)) {
        return {
          rows: [
            {
              code: 'JOB',
              title_vi: 'CV',
              body_vi: 'Nội dung',
              clause_group: 'JOB',
              apply_to_packs: ['*'],
              sort_order: 1,
              mandatory: true,
              version: 1,
            },
          ],
        };
      }
      if (s.includes('FROM public.hrm_contract_pack_rules')) return { rows: [] };
      if (s.includes('COALESCE(MAX(publish_version)')) return { rows: [{ next: '1' }] };
      if (s.includes('INSERT INTO public.hrm_contract_library_publishes')) {
        return {
          rows: [
            {
              id: params?.[0],
              tenant_id: 'xevn',
              source_company_id: 'holding',
              publish_version: params?.[3],
              checksum: params?.[4],
              payload_json: params?.[5],
              label_vi: params?.[6],
              template_count: params?.[7],
              clause_count: params?.[8],
              pack_rule_count: params?.[9],
              published_at: '2026-08-07T00:00:00Z',
              published_by: params?.[10],
              status: 'published',
              archived_at: null,
            },
          ],
        };
      }
      return { rows: [] };
    });
    const legal = new ContractLegalPrintService(db);
    const svc = new ContractLibraryPublishService(db, legal);
    const out = await svc.publishLibrary({ label_vi: 'R1' }, groupCeoToken());
    expect(out.publish_version).toBe(1);
    expect(out.template_count).toBe(1);
    expect(out.clause_count).toBe(1);
    expect(out.checksum).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('ApiException identity', () => {
  it('keeps ApiException constructible for QA wiring', () => {
    expect(new ApiException(HRM_CTR_PUB_EMPTY, 'x', 400).code).toBe(HRM_CTR_PUB_EMPTY);
  });
});
