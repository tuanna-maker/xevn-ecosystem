import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  CONTRACT_PACK_DEFAULT,
  HRM_CTR_OVERLAY_400,
} from './contract-legal-print.constants';
import { ContractLegalPrintService } from './contract-legal-print.service';
import { ContractsInsuranceService } from './contracts-insurance.service';

const CONTRACT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const EMP_ID = '11111111-1111-4111-8111-111111111111';
const CLAUSE_A = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';

function groupCeoToken(): string {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

describe('PO-HRM-CTR-CREATE-REDESIGN-BE-01', () => {
  it('listContracts SELECT includes template_code and signed_at display cols', async () => {
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
        if (s.includes('FROM public.employee_contracts ec')) {
          return {
            rows: [
              {
                id: CONTRACT_ID,
                company_id: 'holding',
                employee_id: EMP_ID,
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                template_code: 'XEVN_FT_12M_OFFICE',
                signed_at: '2026-01-02',
                contract_name: 'HĐLĐ 12 tháng',
                work_arrangement: 'full_time',
                salary_ratio_percent: 100,
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
                employee_name: 'Nguyen A',
                employee_code: 'NV001',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    const result = await service.listContracts(
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(result.data[0].template_code).toBe('XEVN_FT_12M_OFFICE');
    expect(result.data[0].signed_at).toBe('2026-01-02');
    const listSql = (db.query as jest.Mock).mock.calls.find((c) =>
      String(c[0]).includes('FROM public.employee_contracts ec'),
    )?.[0] as string;
    expect(listSql).toContain('ec.template_code');
    expect(listSql).toContain('ec.signed_at');
  });

  it('preview uses payload clause_ids order (ephemeral overlay path)', async () => {
    const queries: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        queries.push(String(sql));
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
                pack_code: CONTRACT_PACK_DEFAULT,
                template_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
                template_code: 'XEVN_INDEF_OFFICE',
                compensation_package_id: null,
                print_overlay_clause_ids: null,
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
          return {
            rows: [
              {
                id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
                company_id: 'holding',
                code: 'XEVN_INDEF_OFFICE',
                name_vi: 'Mẫu',
                pack_code: CONTRACT_PACK_DEFAULT,
                layout_json: {},
                keyword_map: {},
                status: 'active',
                version: 1,
                default_term_type: 'indefinite',
                archived_at: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          };
        }
        if (
          s.includes('FROM public.hrm_contract_clauses c') &&
          s.includes('ANY($1::uuid[])')
        ) {
          return {
            rows: [
              {
                id: CLAUSE_A,
                company_id: 'holding',
                code: 'CL_CUSTOM',
                title_vi: 'Điều khoản',
                body_vi: 'Nội dung',
                clause_group: 'general',
                apply_to_packs: [CONTRACT_PACK_DEFAULT],
                mandatory: false,
                status: 'active',
                version: 1,
                effective_from: '2026-01-01',
                archived_at: null,
                origin: 'local',
                origin_company_id: null,
                origin_publish_version: null,
                lineage_code: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          };
        }
        if (s.includes('FROM public.hrm_contract_template_clauses')) {
          return { rows: [] };
        }
        if (s.includes('FROM public.hrm_contract_clauses')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new ContractLegalPrintService(db);
    const preview = await svc.previewContract(
      CONTRACT_ID,
      { template_code: 'XEVN_INDEF_OFFICE', clause_ids: [CLAUSE_A] },
      'main',
      groupCeoToken(),
    );
    expect(preview.clauses).toHaveLength(1);
    expect(preview.clauses[0].code).toBe('CL_CUSTOM');
    expect(queries.some((q) => q.includes('ANY($1::uuid[])'))).toBe(true);
  });

  it('putContractPrintOverlay rejects clause outside pack', async () => {
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
                work_location: null,
                work_location_scope: null,
                term_type: 'indefinite',
                job_description_text: null,
                probation_days: null,
                probation_end: null,
                license_class: null,
                vehicle_plate: null,
                route_or_region: null,
                pack_code: 'DRIVER',
                template_id: null,
                template_code: null,
                compensation_package_id: null,
                print_overlay_clause_ids: null,
                signer_name: null,
                signer_position: null,
                employee_name: 'A',
                employee_code: 'NV001',
                employee_email: null,
                employee_custom_fields: {},
              },
            ],
          };
        }
        if (
          s.includes('FROM public.hrm_contract_clauses c') &&
          s.includes('ANY($1::uuid[])')
        ) {
          return {
            rows: [
              {
                id: CLAUSE_A,
                company_id: 'holding',
                code: 'CL_GENERAL_ONLY',
                title_vi: 'Điều',
                body_vi: 'Body',
                clause_group: 'general',
                apply_to_packs: [CONTRACT_PACK_DEFAULT],
                mandatory: false,
                status: 'active',
                version: 1,
                effective_from: '2026-01-01',
                archived_at: null,
                origin: 'local',
                origin_company_id: null,
                origin_publish_version: null,
                lineage_code: null,
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
      svc.putContractPrintOverlay(
        CONTRACT_ID,
        { clause_ids: [CLAUSE_A] },
        'main',
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_CTR_OVERLAY_400 });
  });
});
