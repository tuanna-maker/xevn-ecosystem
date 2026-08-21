/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-BE-01/02 — pack resolve · mandatory · scope · PDF binary Q-CTR-02.
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_CTR_CL_REQUIRED,
  HRM_CTR_CL_CODE_CONFLICT,
  HRM_CTR_ISSUE_BLOCKED,
  HRM_CTR_PACK_INVALID,
  HRM_CTR_TPL_404,
  HRM_CTR_TPL_CODE_INVALID,
  HRM_CTR_TPL_KEY,
  HRM_CTR_TPL_NONE,
  HRM_CTR_VERSION_NOT_ISSUED,
} from './contract-legal-print.constants';
import {
  computeMissingMandatoryClauses,
  ContractLegalPrintService,
  resolveContractPackFromRules,
} from './contract-legal-print.service';
import { renderContractPrintPdfBuffer } from './contract-print-pdf.renderer';

const TPL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const CL_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
const CL_MAND = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
const CONTRACT_ID = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1';
const EMP_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1';

describe('contract-print-pdf.renderer (BE-02)', () => {
  it('renderContractPrintPdfBuffer starts with %PDF', async () => {
    const buf = await renderContractPrintPdfBuffer({
      contract_id: CONTRACT_ID,
      version_no: 1,
      pack_code: 'GENERAL',
      merged_fields: {
        contract_code: 'HD-R',
        employee_full_name: 'Lê Thị C',
        job_title: 'Kế toán',
        work_location: 'Đà Nẵng',
        effective_from: '2026-01-01',
        effective_to: '—',
      },
      clauses: [
        {
          code: 'JOB',
          title_vi: 'Điều 1',
          body_vi: 'Nội dung điều khoản có dấu tiếng Việt.',
          sort_order: 1,
        },
      ],
    });
    expect(buf.subarray(0, 4).toString('utf8')).toBe('%PDF');
  });
});

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

describe('Contract legal print (PO-HRM-CONTRACT-LEGAL-PRINT-BE-01)', () => {
  it('pack resolve: job_family DRIVER → DRIVER; unknown → GENERAL', () => {
    const rules = [
      {
        match_type: 'job_family',
        match_value: 'DRIVER',
        pack_code: 'DRIVER',
        priority: 10,
      },
      {
        match_type: 'job_family',
        match_value: 'IT',
        pack_code: 'IT_OFFICE',
        priority: 10,
      },
      {
        match_type: 'fallback',
        match_value: null,
        pack_code: 'GENERAL',
        priority: 100,
      },
    ];
    expect(resolveContractPackFromRules('DRIVER_OPS', rules)).toEqual({
      suggested_pack: 'DRIVER',
      reason: 'job_family:DRIVER',
    });
    expect(
      resolveContractPackFromRules('UNKNOWN_X', rules).suggested_pack,
    ).toBe('GENERAL');
    expect(resolveContractPackFromRules('', []).suggested_pack).toBe('GENERAL');
  });

  it('mandatory clause gate: missing mandatory for pack blocks', () => {
    const library = [
      {
        code: 'JOB_DUTIES',
        title_vi: 'Công việc',
        mandatory: true,
        apply_to_packs: ['*'],
      },
      {
        code: 'DRIVER_VEHICLE',
        title_vi: 'Phương tiện',
        mandatory: true,
        apply_to_packs: ['DRIVER'],
      },
      {
        code: 'NDA',
        title_vi: 'Bảo mật',
        mandatory: false,
        apply_to_packs: ['IT_OFFICE'],
      },
    ];
    const missing = computeMissingMandatoryClauses('DRIVER', library, [
      'JOB_DUTIES',
    ]);
    expect(missing).toEqual([
      { code: 'DRIVER_VEHICLE', title_vi: 'Phương tiện' },
    ]);
    expect(
      computeMissingMandatoryClauses('GENERAL', library, ['JOB_DUTIES']),
    ).toEqual([]);
  });

  it('invalid pack_code → HRM-CTR-PACK-INVALID', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.listTemplates(
        { company_id: 'holding', pack_code: 'NOT_A_PACK' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_PACK_INVALID });
  });

  it('clause create empty body → HRM-CTR-CL-REQUIRED', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.createClause(
        {
          company_id: 'holding',
          code: 'X',
          title_vi: 'T',
          body_vi: '   ',
          clause_group: 'LEGAL_BASIS',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_CL_REQUIRED });
  });

  it('scope_parity: template list id → getById with same company_id filter (group CEO main→holding)', async () => {
    const queries: string[] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          queries.push(s);
          if (
            s.includes('CREATE TABLE') ||
            s.includes('CREATE INDEX') ||
            s.includes('CREATE UNIQUE') ||
            s.includes('ALTER TABLE')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('FROM public.hrm_contract_templates') &&
            s.includes('ORDER BY code')
          ) {
            expect(s).toMatch(/company_id/);
            // group CEO main expands to rollup array (ANY) or list — holding must be in scope
            const flat = JSON.stringify(params ?? []);
            expect(flat).toContain('holding');
            return {
              rows: [
                {
                  id: TPL_ID,
                  company_id: 'holding',
                  code: 'HDLD_STANDARD',
                  name_vi: 'Mẫu chuẩn',
                  pack_code: 'GENERAL',
                  layout_json: {},
                  keyword_map: {},
                  status: 'active',
                  version: 1,
                  archived_at: null,
                  created_at: '2026-08-06',
                  updated_at: '2026-08-06',
                },
              ],
            };
          }
          if (s.includes('FROM public.hrm_contract_template_clauses')) {
            return { rows: [] };
          }
          if (
            s.includes('FROM public.hrm_contract_templates') &&
            s.includes('id = $1::uuid')
          ) {
            expect(s).toMatch(/company_id/);
            expect(params?.[0]).toBe(TPL_ID);
            const flat = JSON.stringify(params ?? []);
            expect(flat).toContain('holding');
            return {
              rows: [
                {
                  id: TPL_ID,
                  company_id: 'holding',
                  code: 'HDLD_STANDARD',
                  name_vi: 'Mẫu chuẩn',
                  pack_code: 'GENERAL',
                  layout_json: {},
                  keyword_map: {},
                  status: 'active',
                  version: 1,
                  archived_at: null,
                  created_at: '2026-08-06',
                  updated_at: '2026-08-06',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    const list = await svc.listTemplates(
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(list.data[0].id).toBe(TPL_ID);
    const got = await svc.getTemplateById(TPL_ID, 'main', groupCeoToken());
    expect(got.id).toBe(TPL_ID);
    expect(
      queries.some(
        (q) => q.includes('company_id') && q.includes('id = $1::uuid'),
      ),
    ).toBe(true);
  });

  it('scope_parity: member CEO cannot get holding clause (404/409)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.hrm_contract_clauses') &&
          s.includes('id = $1')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.getClauseById(CL_ID, 'holding', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('preview with 0 active template → HRM-CTR-TPL-NONE', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.employee_contracts ec')) {
          return {
            rows: [
              {
                id: CONTRACT_ID,
                company_id: 'holding',
                employee_id: EMP_ID,
                contract_code: 'HD-1',
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                notes: null,
                position: 'NV',
                position_key: 'NV',
                department: null,
                work_location: 'HN',
                work_location_scope: null,
                term_type: 'indefinite',
                job_description_text: null,
                probation_days: null,
                probation_end: null,
                license_class: null,
                vehicle_plate: null,
                route_or_region: null,
                pack_code: null,
                template_id: null,
                compensation_package_id: null,
                signer_name: null,
                signer_position: null,
                employee_name: 'Nguyen A',
                employee_code: 'NV001',
                employee_email: 'a@xe.vn',
                employee_custom_fields: {},
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_templates')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.previewContract(
        CONTRACT_ID,
        { pack_code: 'GENERAL' },
        'main',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_NONE });
  });

  it('issue blocked when mandatory clause missing → HRM-CTR-ISSUE-BLOCKED', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.employee_contracts ec')) {
          return {
            rows: [
              {
                id: CONTRACT_ID,
                company_id: 'holding',
                employee_id: EMP_ID,
                contract_code: 'HD-1',
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                notes: null,
                position: 'NV',
                position_key: 'NV',
                department: null,
                work_location: 'HN',
                work_location_scope: null,
                term_type: 'indefinite',
                job_description_text: 'JD',
                probation_days: null,
                probation_end: null,
                license_class: null,
                vehicle_plate: null,
                route_or_region: null,
                pack_code: null,
                template_id: null,
                compensation_package_id: null,
                signer_name: null,
                signer_position: null,
                employee_name: 'Nguyen A',
                employee_code: 'NV001',
                employee_email: 'a@xe.vn',
                employee_custom_fields: {},
              },
            ],
          };
        }
        if (
          s.includes('FROM public.hrm_contract_templates') &&
          s.includes(`status = 'active'`)
        ) {
          return {
            rows: [
              {
                id: TPL_ID,
                company_id: 'holding',
                code: 'HDLD_STANDARD',
                name_vi: 'Mẫu',
                pack_code: 'GENERAL',
                layout_json: {},
                keyword_map: {},
                status: 'active',
                version: 1,
                archived_at: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          };
        }
        if (
          s.includes('FROM public.hrm_contract_templates') &&
          s.includes('id = $1')
        ) {
          return {
            rows: [
              {
                id: TPL_ID,
                company_id: 'holding',
                code: 'HDLD_STANDARD',
                name_vi: 'Mẫu',
                pack_code: 'GENERAL',
                layout_json: {},
                keyword_map: {},
                status: 'active',
                version: 1,
                archived_at: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_template_clauses')) {
          // Attached optional only — mandatory JOB_DUTIES missing from template → ISSUE_BLOCKED
          return {
            rows: [
              {
                id: CL_ID,
                company_id: 'holding',
                code: 'OPTIONAL_NOTE',
                title_vi: 'Ghi chú',
                body_vi: 'Optional placeholder',
                clause_group: 'NOTES',
                apply_to_packs: ['*'],
                sort_order: 1,
                mandatory: false,
                status: 'active',
                version: 1,
                effective_from: null,
                archived_at: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          };
        }
        if (
          s.includes('FROM public.hrm_contract_clauses') &&
          s.includes('ORDER BY sort_order')
        ) {
          // Library mandatory for pack
          return {
            rows: [
              {
                id: CL_MAND,
                company_id: 'holding',
                code: 'JOB_DUTIES',
                title_vi: 'Công việc',
                body_vi: 'Placeholder title only — not copyrighted body',
                clause_group: 'JOB_DUTIES',
                apply_to_packs: ['*'],
                sort_order: 1,
                mandatory: true,
                status: 'active',
                version: 1,
                effective_from: null,
                archived_at: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.createPrintVersion(
        CONTRACT_ID,
        { pack_code: 'GENERAL' },
        'main',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_ISSUE_BLOCKED });
  });

  it('company_id body/query: persist uses resolveHrmPersistCompanyIdText (main→holding)', async () => {
    const inserts: unknown[][] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (
            s.includes('CREATE TABLE') ||
            s.includes('CREATE INDEX') ||
            s.includes('CREATE UNIQUE') ||
            s.includes('ALTER TABLE')
          ) {
            return { rows: [] };
          }
          if (s.includes('INSERT INTO public.hrm_contract_clauses')) {
            inserts.push(params ?? []);
            return {
              rows: [
                {
                  id: CL_ID,
                  company_id: params?.[1],
                  code: 'LEGAL_BASIS_01',
                  title_vi: 'Căn cứ PL',
                  body_vi: 'Placeholder citation title',
                  clause_group: 'LEGAL_BASIS',
                  apply_to_packs: ['*'],
                  sort_order: 0,
                  mandatory: false,
                  status: 'draft',
                  version: 1,
                  effective_from: null,
                  archived_at: null,
                  created_at: '2026-08-06',
                  updated_at: '2026-08-06',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    const row = await svc.createClause(
      {
        company_id: 'main',
        code: 'LEGAL_BASIS_01',
        title_vi: 'Căn cứ PL',
        body_vi: 'Placeholder citation title',
        clause_group: 'LEGAL_BASIS',
      },
      groupCeoToken(),
    );
    expect(row.company_id).toBe('holding');
    expect(inserts[0]?.[1]).toBe('holding');
  });

  it('PDF binary: content-type application/pdf + magic bytes %PDF (Q-CTR-02)', async () => {
    const PV_ID = 'ffffffff-ffff-4fff-8fff-fffffffffff1';
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.hrm_contract_print_versions') &&
          s.includes('id = $1')
        ) {
          expect(s).toMatch(/archived_at IS NULL/);
          expect(s).toMatch(/company_id/);
          return {
            rows: [
              {
                id: PV_ID,
                contract_id: CONTRACT_ID,
                company_id: 'holding',
                version_no: 1,
                pack_code: 'GENERAL',
                template_id: TPL_ID,
                template_version: 1,
                merged_fields_json: {
                  contract_code: 'HD-PDF-01',
                  employee_full_name: 'Nguyễn Văn A',
                  job_title: 'Nhân viên vận hành',
                  work_location: 'Hà Nội — trụ sở chính',
                  effective_from: '2026-08-01',
                  effective_to: '2027-07-31',
                },
                clauses_snapshot_json: [
                  {
                    code: 'JOB_DUTIES',
                    title_vi: 'Công việc và nhiệm vụ',
                    body_vi:
                      'Người lao động thực hiện công việc theo mô tả vị trí.',
                    clause_group: 'JOB',
                    clause_version: 1,
                    sort_order: 1,
                    mandatory: true,
                  },
                ],
                compensation_snapshot_json: null,
                status: 'issued',
                issued_at: '2026-08-07T00:00:00Z',
                issued_by: 'ceo@xe.vn',
                pdf_artifact_ref: null,
                created_at: '2026-08-07',
                updated_at: '2026-08-07',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    const pdf = await svc.renderPrintVersionPdf(PV_ID, 'main', groupCeoToken());
    expect(pdf.format).toBe('pdf');
    expect(pdf.stub).toBe(false);
    expect(pdf.content_type).toBe('application/pdf');
    expect(pdf.filename).toMatch(/\.pdf$/);
    expect(Buffer.isBuffer(pdf.body)).toBe(true);
    const buf = pdf.body as Buffer;
    expect(buf.subarray(0, 4).toString('utf8')).toBe('%PDF');
    expect(buf.length).toBeGreaterThan(100);
  });

  it('PDF html format: debug fallback text/html from same snapshot', async () => {
    const PV_ID = 'ffffffff-ffff-4fff-8fff-fffffffffff2';
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.hrm_contract_print_versions') &&
          s.includes('id = $1')
        ) {
          return {
            rows: [
              {
                id: PV_ID,
                contract_id: CONTRACT_ID,
                company_id: 'holding',
                version_no: 2,
                pack_code: 'GENERAL',
                template_id: TPL_ID,
                template_version: 1,
                merged_fields_json: {
                  contract_code: 'HD-HTML-02',
                  employee_full_name: 'Trần B',
                },
                clauses_snapshot_json: [
                  {
                    code: 'LEGAL_BASIS',
                    title_vi: 'Căn cứ',
                    body_vi: 'Placeholder',
                    clause_group: 'LEGAL_BASIS',
                    clause_version: 1,
                    sort_order: 0,
                    mandatory: false,
                  },
                ],
                compensation_snapshot_json: null,
                status: 'issued',
                issued_at: '2026-08-07T00:00:00Z',
                issued_by: 'ceo@xe.vn',
                pdf_artifact_ref: null,
                created_at: '2026-08-07',
                updated_at: '2026-08-07',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    const html = await svc.renderPrintVersionPdf(
      PV_ID,
      'main',
      groupCeoToken(),
      undefined,
      'html',
    );
    expect(html.format).toBe('html');
    expect(html.content_type).toMatch(/text\/html/);
    expect(String(html.body)).toContain('HD-HTML-02');
    expect(String(html.body)).toContain('format=html');
  });

  it('PDF on draft version → HRM-CTR-VERSION-NOT-ISSUED', async () => {
    const PV_ID = 'ffffffff-ffff-4fff-8fff-fffffffffff3';
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.hrm_contract_print_versions')) {
          return {
            rows: [
              {
                id: PV_ID,
                contract_id: CONTRACT_ID,
                company_id: 'holding',
                version_no: 1,
                pack_code: 'GENERAL',
                template_id: null,
                template_version: null,
                merged_fields_json: {},
                clauses_snapshot_json: [],
                compensation_snapshot_json: null,
                status: 'draft',
                issued_at: null,
                issued_by: null,
                pdf_artifact_ref: null,
                created_at: '2026-08-07',
                updated_at: '2026-08-07',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.renderPrintVersionPdf(PV_ID, 'main', groupCeoToken()),
    ).rejects.toMatchObject({
      code: HRM_CTR_VERSION_NOT_ISSUED,
    });
  });

  it('DYNAMIC LOCK: CREATE template #9+ with valid format accepts (not closed 8 enum)', async () => {
    const inserted: unknown[][] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
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
          if (s.includes('INSERT INTO public.hrm_contract_templates')) {
            inserted.push(params ?? []);
            return { rows: [] };
          }
          if (
            s.includes('FROM public.hrm_contract_templates') &&
            s.includes('id = $1')
          ) {
            return {
              rows: [
                {
                  id: params?.[0],
                  company_id: 'holding',
                  code: 'XEVN_CUSTOM_SEASONAL_OFFICE',
                  name_vi: 'Mẫu mùa vụ #9',
                  pack_code: 'IT_OFFICE',
                  layout_json: {},
                  keyword_map: {},
                  status: 'draft',
                  version: 1,
                  default_term_type: 'definite',
                  default_duration_months: 12,
                  title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
                  matrix_family: 'XEVN_MATRIX',
                  archived_at: null,
                  created_at: '2026-08-07',
                  updated_at: '2026-08-07',
                },
              ],
            };
          }
          if (
            s.includes('FROM public.hrm_contract_templates') &&
            s.includes('lower(code)')
          ) {
            return { rows: [] };
          }
          if (s.includes('FROM public.hrm_contract_template_clauses')) {
            return { rows: [] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    const created = await svc.createTemplate(
      {
        company_id: 'holding',
        code: 'XEVN_CUSTOM_SEASONAL_OFFICE',
        name_vi: 'Mẫu mùa vụ #9',
        pack_code: 'IT_OFFICE',
        default_term_type: 'definite',
        default_duration_months: 12,
        title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
        matrix_family: 'XEVN_MATRIX',
      },
      groupCeoToken(),
    );
    expect(created.code).toBe('XEVN_CUSTOM_SEASONAL_OFFICE');
    expect(created.template_code).toBe('XEVN_CUSTOM_SEASONAL_OFFICE');
    expect(inserted.length).toBeGreaterThan(0);
  });

  it('CODE-INVALID = bad format only (not «not in starter 8»)', async () => {
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
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.createTemplate(
        {
          company_id: 'holding',
          code: '1BAD',
          name_vi: 'Bad',
          pack_code: 'GENERAL',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_CODE_INVALID });
  });

  it('matrix=xevn filters matrix_family=XEVN_MATRIX (open catalog, not code IN 8)', async () => {
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
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
            s.includes('FROM public.hrm_contract_templates') &&
            s.includes('ORDER BY code')
          ) {
            expect(s).toContain('matrix_family');
            expect(JSON.stringify(params ?? [])).toContain('XEVN_MATRIX');
            return {
              rows: [
                {
                  id: TPL_ID,
                  company_id: 'holding',
                  code: 'XEVN_CUSTOM_EXTRA',
                  name_vi: 'Extra #9',
                  pack_code: 'IT_OFFICE',
                  layout_json: {},
                  keyword_map: {},
                  status: 'active',
                  version: 1,
                  matrix_family: 'XEVN_MATRIX',
                  archived_at: null,
                  created_at: '2026-08-07',
                  updated_at: '2026-08-07',
                },
              ],
            };
          }
          if (s.includes('FROM public.hrm_contract_template_clauses'))
            return { rows: [] };
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    const list = await svc.listTemplates(
      { company_id: 'holding', matrix: 'xevn' },
      groupCeoToken(),
    );
    expect(list.data).toHaveLength(1);
    expect(list.data[0].code).toBe('XEVN_CUSTOM_EXTRA');
  });

  it('ensureSchema DROP closed chk_hrm_ctr_tpl_xevn_code (DYNAMIC LOCK)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('DROP CONSTRAINT IF EXISTS chk_hrm_ctr_tpl_xevn_code'),
      ),
    ).toBe(true);
    expect(
      sqls.every((q) => !q.includes("code IN ('XEVN_PROBATION_OFFICE'")),
    ).toBe(true);
  });
});

describe('CTR template invent KEY CNS (PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01)', () => {
  const activeTpl = {
    id: TPL_ID,
    company_id: 'holding',
    code: 'HDLD_STANDARD',
    name_vi: 'Mẫu chuẩn',
    pack_code: 'GENERAL',
    layout_json: {},
    keyword_map: {},
    status: 'active',
    version: 1,
    archived_at: null,
    created_at: '2026-08-08',
    updated_at: '2026-08-08',
  };

  function schemaOk(sql: string): boolean {
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

  function contractRow() {
    return {
      id: CONTRACT_ID,
      company_id: 'holding',
      employee_id: EMP_ID,
      contract_code: 'HD-1',
      contract_type: 'indefinite',
      start_date: '2026-01-01',
      end_date: null,
      status: 'active',
      notes: null,
      position: 'NV',
      position_key: 'NV',
      department: null,
      work_location: 'HN',
      work_location_scope: null,
      term_type: 'indefinite',
      job_description_text: null,
      probation_days: null,
      probation_end: null,
      license_class: null,
      vehicle_plate: null,
      route_or_region: null,
      pack_code: null,
      template_id: null,
      template_code: null,
      compensation_package_id: null,
      signer_name: null,
      signer_position: null,
      employee_name: 'Nguyen A',
      employee_code: 'NV001',
      employee_email: 'a@xe.vn',
      employee_custom_fields: {},
    };
  }

  it('VAL-CTR-TPL-03: invent template_code when EFF>0 → HRM-CTR-TPL-KEY (≠ CODE-INVALID · ≠ 404)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.employee_contracts ec')) {
          return { rows: [contractRow()] };
        }
        if (s.includes('COUNT(*)') && s.includes('hrm_contract_templates')) {
          return { rows: [{ c: '1' }] };
        }
        if (
          s.includes('FROM public.hrm_contract_templates') &&
          s.includes('lower(code)') &&
          s.includes(`status = 'active'`)
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.previewContract(
        CONTRACT_ID,
        { template_code: 'INVENTED_FAKE_TPL_99' },
        'main',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_KEY });
  });

  it('VAL-CTR-TPL-03: invent template_id when EFF>0 → HRM-CTR-TPL-KEY', async () => {
    const inventId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.employee_contracts ec')) {
          return { rows: [contractRow()] };
        }
        if (s.includes('COUNT(*)') && s.includes('hrm_contract_templates')) {
          return { rows: [{ c: '2' }] };
        }
        if (
          s.includes('FROM public.hrm_contract_templates') &&
          s.includes('id = $1::uuid')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.previewContract(
        CONTRACT_ID,
        { template_id: inventId },
        'main',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_KEY });
  });

  it('VAL-CTR-TPL-05: getTemplateById miss → HRM-CTR-TPL-404 (≠ invent KEY)', async () => {
    const missId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (
          s.includes('FROM public.hrm_contract_templates') &&
          s.includes('id = $1::uuid')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.getTemplateById(missId, 'main', groupCeoToken()),
    ).rejects.toMatchObject({
      code: HRM_CTR_TPL_404,
    });
  });

  it('VAL-CTR-TPL-01: illegal slug → HRM-CTR-TPL-CODE-INVALID (format-only ≠ KEY)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaOk(String(sql))) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.assertTemplateKeysForConsumer({
        companyId: 'holding',
        templateCode: 'bad code!!',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_CODE_INVALID });
  });

  it('VAL-CTR-TPL-04: invent when EFF=0 on print path → HRM-CTR-TPL-NONE (no seed)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.employee_contracts ec')) {
          return { rows: [contractRow()] };
        }
        if (s.includes('COUNT(*)') && s.includes('hrm_contract_templates')) {
          return { rows: [{ c: '0' }] };
        }
        if (s.includes('FROM public.hrm_contract_templates')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.previewContract(
        CONTRACT_ID,
        { template_code: 'INVENTED_WHEN_EMPTY' },
        'main',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_NONE });
  });

  it('assertTemplateKeysForConsumer: EFF=0 soft skip (UF-HRM-02 nullable · U65)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('COUNT(*)') && s.includes('hrm_contract_templates')) {
          return { rows: [{ c: '0' }] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.assertTemplateKeysForConsumer({
        companyId: 'holding',
        templateCode: 'ANY_INVENT_OK_WHEN_EMPTY',
        authorization: groupCeoToken(),
      }),
    ).resolves.toBeUndefined();
  });

  it('assertTemplateKeysForConsumer: invent when EFF>0 → HRM-CTR-TPL-KEY', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('COUNT(*)') && s.includes('hrm_contract_templates')) {
          return { rows: [{ c: '1' }] };
        }
        if (
          s.includes('FROM public.hrm_contract_templates') &&
          s.includes('lower(code)')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.assertTemplateKeysForConsumer({
        companyId: 'holding',
        templateCode: 'NOT_IN_CATALOG_X',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_KEY });
  });

  it('scope_parity invent KEY: group CEO main rollup uses same company filter as list', async () => {
    const queries: string[] = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          queries.push(s);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('COUNT(*)') && s.includes('hrm_contract_templates')) {
            const flat = JSON.stringify(params ?? []);
            expect(flat).toContain('holding');
            return { rows: [{ c: '1' }] };
          }
          if (
            s.includes('FROM public.hrm_contract_templates') &&
            s.includes('lower(code)')
          ) {
            const flat = JSON.stringify(params ?? []);
            expect(flat).toContain('holding');
            expect(s).toMatch(/company_id/);
            return { rows: [] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.assertTemplateKeysForConsumer({
        companyId: 'main',
        templateCode: 'GHOST_TPL',
        authorization: groupCeoToken(),
      }),
    ).rejects.toMatchObject({ code: HRM_CTR_TPL_KEY });
    expect(queries.some((q) => q.includes('hrm_contract_templates'))).toBe(
      true,
    );
  });

  it('constant taxonomy: KEY ≠ 404 ≠ NONE ≠ CODE-INVALID', () => {
    expect(HRM_CTR_TPL_KEY).toBe('HRM-CTR-TPL-KEY');
    expect(HRM_CTR_TPL_KEY).not.toBe(HRM_CTR_TPL_404);
    expect(HRM_CTR_TPL_KEY).not.toBe(HRM_CTR_TPL_NONE);
    expect(HRM_CTR_TPL_KEY).not.toBe(HRM_CTR_TPL_CODE_INVALID);
    expect(activeTpl.status).toBe('active');
  });

  it('AC-PLT-CTR-CL-02: updateClause body_vi on active clause in issued snapshot → 409 CONFLICT', async () => {
    const ISSUED_CODE = 'CL_IS_CLQA3-KMJRGF';
    let updateAttempt = false;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
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
            s.includes('FROM public.hrm_contract_clauses') &&
            s.includes('id = $1')
          ) {
            return {
              rows: [
                {
                  id: CL_ID,
                  company_id: 'holding',
                  code: ISSUED_CODE,
                  title_vi: 'Điều khoản QA-03',
                  body_vi: 'Freeze marker V1 CLQA3-KMJRGF',
                  clause_group: 'JOB',
                  apply_to_packs: ['*'],
                  sort_order: 0,
                  mandatory: false,
                  status: 'active',
                  version: 1,
                  effective_from: null,
                  archived_at: null,
                  created_at: '2026-08-09',
                  updated_at: '2026-08-09',
                  origin: 'member',
                  origin_company_id: null,
                  origin_publish_version: null,
                  lineage_code: null,
                },
              ],
            };
          }
          if (
            s.includes('FROM public.hrm_contract_print_versions') &&
            s.includes('jsonb_array_elements')
          ) {
            expect(params?.[1]).toBe(ISSUED_CODE);
            const companyFilter = JSON.stringify(params?.[0] ?? []);
            expect(companyFilter.toLowerCase()).toContain('holding');
            return { rows: [{ c: '1' }] };
          }
          if (s.includes('UPDATE public.hrm_contract_clauses')) {
            updateAttempt = true;
            return { rows: [] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await expect(
      svc.updateClause(
        CL_ID,
        { body_vi: 'Freeze marker V2 BLOCKED CLQA3-KMJRGF' },
        'main',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_CL_CODE_CONFLICT });
    expect(updateAttempt).toBe(false);
  });

  it('AC-PLT-CTR-CL-02: draft body edit without issued snapshot still updates (200 path)', async () => {
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
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
            s.includes('FROM public.hrm_contract_clauses') &&
            s.includes('id = $1')
          ) {
            return {
              rows: [
                {
                  id: CL_ID,
                  company_id: 'holding',
                  code: 'DRAFT_ONLY_CL',
                  title_vi: 'Draft',
                  body_vi: 'Body V1',
                  clause_group: 'JOB',
                  apply_to_packs: ['*'],
                  sort_order: 0,
                  mandatory: false,
                  status: 'draft',
                  version: 1,
                  effective_from: null,
                  archived_at: null,
                  created_at: '2026-08-09',
                  updated_at: '2026-08-09',
                  origin: 'member',
                  origin_company_id: null,
                  origin_publish_version: null,
                  lineage_code: null,
                },
              ],
            };
          }
          if (
            s.includes('FROM public.hrm_contract_print_versions') &&
            s.includes('jsonb_array_elements')
          ) {
            return { rows: [{ c: '0' }] };
          }
          if (s.includes('UPDATE public.hrm_contract_clauses')) {
            return { rows: [] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    await svc.updateClause(
      CL_ID,
      { body_vi: 'Body V2 draft OK' },
      'main',
      groupCeoToken(),
    );
    expect(
      db.query.mock.calls.some((c) =>
        String(c[0]).includes('UPDATE public.hrm_contract_clauses'),
      ),
    ).toBe(true);
  });
});

describe('PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01 resolveContractDetailLayout', () => {
  const CLAUSE_B = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd2';

  it('uses print_overlay_clause_ids order and returns read-only clause_layout', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.hrm_contract_clauses c') &&
          s.includes('ANY($1::uuid[])')
        ) {
          return {
            rows: [
              {
                id: CL_MAND,
                company_id: 'holding',
                code: 'JOB_DUTIES',
                title_vi: 'Công việc',
                body_vi: 'Nội dung điều khoản',
                clause_group: 'general',
                apply_to_packs: ['*'],
                sort_order: 0,
                mandatory: true,
                status: 'active',
                version: 1,
                effective_from: null,
                archived_at: null,
                origin: null,
                origin_company_id: null,
                origin_publish_version: null,
                lineage_code: null,
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
              },
            ],
          };
        }
        if (
          s.includes('FROM public.employee_contracts ec') &&
          s.includes('ec.id = $1::uuid')
        ) {
          return {
            rows: [
              {
                id: CONTRACT_ID,
                company_id: 'holding',
                employee_id: EMP_ID,
                contract_code: 'HD-001',
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                position: 'Kế toán',
                work_location: 'Hà Nội',
                pack_code: 'GENERAL',
                template_code: 'XEVN_FT_12M_OFFICE',
                print_overlay_clause_ids: JSON.stringify([CL_MAND]),
                employee_name: 'Nguyen A',
                employee_code: 'NV0001',
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_templates')) {
          return {
            rows: [
              {
                id: TPL_ID,
                company_id: 'holding',
                code: 'XEVN_FT_12M_OFFICE',
                name_vi: 'HĐ 12 tháng',
                pack_code: 'GENERAL',
                layout_json: {},
                keyword_map: {},
                status: 'active',
                version: 1,
                default_term_type: 'indefinite',
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_template_clauses')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const svc = new ContractLegalPrintService(db);
    const layout = await svc.resolveContractDetailLayout(
      {
        id: CONTRACT_ID,
        company_id: 'holding',
        employee_id: EMP_ID,
        template_code: 'XEVN_FT_12M_OFFICE',
        pack_code: 'GENERAL',
        print_overlay_clause_ids: [CL_MAND, CLAUSE_B],
      },
      'main',
      groupCeoToken(),
    );

    expect(layout.clause_ids).toEqual([CL_MAND, CLAUSE_B]);
    expect(layout.print_overlay_clause_ids).toEqual([CL_MAND, CLAUSE_B]);
    expect(layout.clause_layout).toHaveLength(1);
    expect(layout.clause_layout[0]).toMatchObject({
      id: CL_MAND,
      code: 'JOB_DUTIES',
      body_vi: 'Nội dung điều khoản',
      mandatory: true,
      sort_order: 0,
    });
    expect(typeof layout.can_issue).toBe('boolean');
    expect(layout.preview_summary?.pack_code).toBeTruthy();
  });
});
