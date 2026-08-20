/**
 * PO-HRM-SETTINGS-DEFAULTS-BE-01 / BE-02
 * Jest VAL-SET-TAX/SI/POS + scope_parity + POS-05 no emp write + SI-412
 * BE-02: DTO @Allow value · pg Date coerce · SC SAVEPOINT / is_active
 */
import { HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { PutSettingsCompanySettingDto } from './dto/settings-defaults.dto';
import { InsuranceRateCfgService } from './insurance-rate-cfg.service';
import { PositionCompensationPolicyService } from './position-compensation-policy.service';
import { SettingsTaxParamsService } from './settings-tax-params.service';
import {
  HRM_ALLOW_CAT_ORPHAN_CODE,
  HRM_SET_POS_400_KEY,
  HRM_SET_POS_409_ACTIVE,
  HRM_SET_SI_409_HARD_DELETE,
  HRM_SET_SI_409_OVERLAP,
  HRM_SET_SI_412_MISSING,
  HRM_SET_TAX_400_SHAPE,
  HRM_SET_TAX_412_MISSING,
} from './settings-defaults.constants';

const SI_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const POS_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const LINE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

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

function schemaOkDb() {
  return {
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
    withTransaction: jest.fn(
      async (fn: (q: typeof jest.fn) => Promise<unknown>) => {
        const q = jest.fn().mockResolvedValue({ rows: [] });
        return fn(q);
      },
    ),
  } as unknown as HrmDbService;
}

describe('SettingsTaxParamsService (VAL-SET-TAX)', () => {
  it('D-SETDEF-QA-TAX-01 PutSettingsCompanySettingDto.value is whitelisted (@Allow)', () => {
    const dto = plainToInstance(PutSettingsCompanySettingDto, {
      companyId: 'main',
      settingKey: 'pay_tax_personal_deduction_vnd',
      value: { amount: 11000000, currency: 'VND' },
    });
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors).toHaveLength(0);
    expect(dto.value).toEqual({ amount: 11000000, currency: 'VND' });
  });

  it('ensureSchema EXPAND hrm_company_settings — no closed setting_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SettingsTaxParamsService(db);
    await svc.ensureSchemaPublic();
    const joined = sqls.join('\n');
    expect(joined).toMatch(
      /CREATE TABLE IF NOT EXISTS public\.hrm_company_settings/i,
    );
    expect(joined).not.toMatch(/CHECK\s*\(\s*setting_key\s+IN\s*\(/i);
  });

  it('VAL-SET-TAX-01/02 invalid shape / negative → HRM-SET-TAX-400-SHAPE', () => {
    const svc = new SettingsTaxParamsService(schemaOkDb());
    expect(() =>
      svc.validatePayTaxValue('pay_tax_personal_deduction_vnd', {
        amount: -1,
        currency: 'VND',
      }),
    ).toThrow(ApiException);
    try {
      svc.validatePayTaxValue('pay_tax_flags', {
        applyPersonalDeduction: true,
      });
    } catch (e) {
      expect((e as ApiException).code).toBe(HRM_SET_TAX_400_SHAPE);
    }
  });

  it('VAL-SET-TAX-03 missing key GET → 200 value null + meta.cta', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (String(sql).includes('CREATE')) return { rows: [] };
        if (String(sql).includes('FROM public.hrm_company_settings'))
          return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SettingsTaxParamsService(db);
    const got = await svc.get(
      { company_id: 'main', key: 'pay_tax_personal_deduction_vnd' },
      groupCeoToken(),
      'xevn',
    );
    expect(got).toMatchObject({
      settingKey: 'pay_tax_personal_deduction_vnd',
      value: null,
      companyId: 'holding',
    });
    expect((got as { meta?: { cta?: string } }).meta?.cta).toBeTruthy();
  });

  it('VAL-SET-TAX-04 process missing → 412 HRM-SET-TAX-412-MISSING', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (String(sql).includes('CREATE')) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new SettingsTaxParamsService(db);
    await expect(
      svc.readRequiredTaxValue(
        'main',
        'pay_tax_personal_deduction_vnd',
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({
      code: HRM_SET_TAX_412_MISSING,
      status: HttpStatus.PRECONDITION_FAILED,
    });
  });

  it('PUT upsert pay_tax_* uses settings catalog company (main→holding)', async () => {
    const calls: Array<{ sql: string; params?: unknown[] }> = [];
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          calls.push({ sql: String(sql), params });
          if (String(sql).includes('CREATE') || String(sql).includes('INDEX'))
            return { rows: [] };
          if (
            String(sql).includes('SELECT id FROM public.hrm_company_settings')
          )
            return { rows: [] };
          if (String(sql).includes('INSERT INTO public.hrm_company_settings'))
            return { rows: [] };
          if (
            String(sql).includes('FROM public.hrm_company_settings') &&
            String(sql).includes('setting_key')
          ) {
            return {
              rows: [
                {
                  id: SI_ID,
                  company_id: 'holding',
                  setting_key: 'pay_tax_personal_deduction_vnd',
                  value_json: { amount: 11000000, currency: 'VND' },
                  archived_at: null,
                  updated_at: '2026-08-07T00:00:00Z',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new SettingsTaxParamsService(db);
    const row = await svc.put(
      {
        companyId: 'main',
        settingKey: 'pay_tax_personal_deduction_vnd',
        value: { amount: 11000000, currency: 'VND' },
      },
      groupCeoToken(),
      'xevn',
    );
    expect(row.value).toEqual({ amount: 11000000, currency: 'VND' });
    const insert = calls.find((c) =>
      c.sql.includes('INSERT INTO public.hrm_company_settings'),
    );
    expect(insert?.params?.[2]).toBe('holding');
  });
});

describe('InsuranceRateCfgService (VAL-SET-SI)', () => {
  it('ensureSchema ADD pay_insurance_rate_cfg — open type key (no IN closed)', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new InsuranceRateCfgService(db);
    await svc.ensureSchemaPublic();
    const joined = sqls.join('\n');
    expect(joined).toMatch(
      /CREATE TABLE IF NOT EXISTS public\.pay_insurance_rate_cfg/i,
    );
    expect(joined).not.toMatch(/insurance_type_key\s+IN\s*\(/i);
  });

  it('VAL-SET-SI-01 overlap active → HRM-SET-SI-409-OVERLAP', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE') || s.includes('INDEX') || s.includes('DO $$'))
          return { rows: [] };
        if (
          s.includes('FROM public.pay_insurance_rate_cfg') &&
          s.includes("status = 'active'")
        ) {
          return {
            rows: [
              {
                id: SI_ID,
                ou_id: null,
                insurance_type_key: 'BHXH',
                effective_from: '2026-01-01',
                effective_to: null,
                status: 'active',
                archived_at: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new InsuranceRateCfgService(db);
    await expect(
      svc.create(
        {
          companyId: 'main',
          insuranceTypeKey: 'BHXH',
          employeeRatePct: 8,
          employerRatePct: 17.5,
          effectiveFrom: '2026-06-01',
          status: 'active',
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_SET_SI_409_OVERLAP });
  });

  it('D-SETDEF-QA-SI-DATE-01 overlap when pg returns Date objects → 409 (not silent miss)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE') || s.includes('INDEX') || s.includes('DO $$'))
          return { rows: [] };
        if (
          s.includes('FROM public.pay_insurance_rate_cfg') &&
          s.includes("status = 'active'")
        ) {
          return {
            rows: [
              {
                id: SI_ID,
                ou_id: null,
                insurance_type_key: 'BHXH',
                // node-pg date column → Date (local midnight) — String.slice → «Thu Jan 01»
                effective_from: new Date(2026, 0, 1),
                effective_to: null,
                status: 'active',
                archived_at: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new InsuranceRateCfgService(db);
    await expect(
      svc.create(
        {
          companyId: 'main',
          insuranceTypeKey: 'BHXH',
          employeeRatePct: 8,
          employerRatePct: 17.5,
          effectiveFrom: '2026-06-01',
          status: 'active',
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_SET_SI_409_OVERLAP });
  });

  it('D-SETDEF-QA-SI-DATE-01 display + PATCH coerce pg Date → YYYY-MM-DD', async () => {
    const row = {
      id: SI_ID,
      tenant_id: 'xevn',
      company_id: 'holding',
      ou_id: null,
      insurance_type_key: 'BHXH',
      employee_rate_pct: 8,
      employer_rate_pct: 17.5,
      ceiling_amount: null,
      currency: 'VND',
      effective_from: new Date(2026, 0, 1),
      effective_to: null,
      status: 'active',
      version: 1,
      supersedes_id: null,
      notes: null,
      archived_at: null,
      created_at: '2026-08-07T00:00:00Z',
      updated_at: '2026-08-07T00:00:00Z',
      created_by: null,
      updated_by: null,
    };
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE') || s.includes('INDEX') || s.includes('DO $$'))
          return { rows: [] };
        if (
          s.includes('FROM public.pay_insurance_rate_cfg') &&
          s.includes("status = 'active'")
        ) {
          return { rows: [] }; // no overlap on patch
        }
        if (
          s.includes('FROM public.pay_insurance_rate_cfg') &&
          s.includes('id = $1')
        ) {
          return { rows: [row] };
        }
        if (s.includes('UPDATE public.pay_insurance_rate_cfg'))
          return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new InsuranceRateCfgService(db);
    const got = await svc.getById(SI_ID, 'main', groupCeoToken(), 'xevn');
    expect(got.effectiveFrom).toBe('2026-01-01');
    const patched = await svc.patch(
      SI_ID,
      'main',
      { notes: 're-save' },
      groupCeoToken(),
      'xevn',
    );
    expect(patched.effectiveFrom).toBe('2026-01-01');
  });

  it('VAL-SET-SI-03 pickActiveRateForPeriod missing → 412 HRM-SET-SI-412-MISSING', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (
          String(sql).includes('CREATE') ||
          String(sql).includes('INDEX') ||
          String(sql).includes('DO $$')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new InsuranceRateCfgService(db);
    await expect(
      svc.pickActiveRateForPeriod({
        companyId: 'main',
        insuranceTypeKey: 'BHXH',
        periodStart: '2026-08-01',
        periodEnd: '2026-08-31',
        authorization: groupCeoToken(),
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({
      code: HRM_SET_SI_412_MISSING,
      status: HttpStatus.PRECONDITION_FAILED,
    });
  });

  it('VAL-SET-SI-05 hard DELETE → 409', () => {
    const svc = new InsuranceRateCfgService(schemaOkDb());
    expect(() => svc.rejectHardDelete()).toThrow(
      expect.objectContaining({ code: HRM_SET_SI_409_HARD_DELETE }),
    );
  });

  it('scope_parity list ↔ getById same company filter (group CEO main→holding)', async () => {
    const sqls: string[] = [];
    const row = {
      id: SI_ID,
      tenant_id: 'xevn',
      company_id: 'holding',
      ou_id: null,
      insurance_type_key: 'BHXH',
      employee_rate_pct: 8,
      employer_rate_pct: 17.5,
      ceiling_amount: 29800000,
      currency: 'VND',
      effective_from: '2026-01-01',
      effective_to: null,
      status: 'active',
      version: 1,
      supersedes_id: null,
      notes: null,
      archived_at: null,
      created_at: '2026-08-07T00:00:00Z',
      updated_at: '2026-08-07T00:00:00Z',
      created_by: null,
      updated_by: null,
    };
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          sqls.push(s);
          if (
            s.includes('CREATE') ||
            s.includes('INDEX') ||
            s.includes('DO $$')
          )
            return { rows: [] };
          if (s.includes('COUNT(*)')) return { rows: [{ c: '1' }] };
          if (
            s.includes('FROM public.pay_insurance_rate_cfg') &&
            s.includes('ORDER BY')
          ) {
            expect(JSON.stringify(params ?? [])).toMatch(/holding/);
            return { rows: [row] };
          }
          if (
            s.includes('FROM public.pay_insurance_rate_cfg') &&
            s.includes('id = $1')
          ) {
            expect(s).toMatch(/company_id/);
            expect(JSON.stringify(params ?? [])).toMatch(/holding/);
            return { rows: [row] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const svc = new InsuranceRateCfgService(db);
    const list = await svc.list(
      { company_id: 'main' },
      groupCeoToken(),
      'xevn',
    );
    expect(list.items).toHaveLength(1);
    const one = await svc.getById(SI_ID, 'main', groupCeoToken(), 'xevn');
    expect(one.id).toBe(SI_ID);
    expect(one.companyId).toBe('holding');
  });

  it('member CEO cannot read holding-only row (scope 404/409)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (
          String(sql).includes('CREATE') ||
          String(sql).includes('INDEX') ||
          String(sql).includes('DO $$')
        ) {
          return { rows: [] };
        }
        if (String(sql).includes('id = $1')) {
          return {
            rows: [
              {
                id: SI_ID,
                tenant_id: 'xevn',
                company_id: 'holding',
                ou_id: null,
                insurance_type_key: 'BHXH',
                employee_rate_pct: 8,
                employer_rate_pct: 17.5,
                ceiling_amount: null,
                currency: 'VND',
                effective_from: '2026-01-01',
                effective_to: null,
                status: 'active',
                version: 1,
                supersedes_id: null,
                notes: null,
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
    const svc = new InsuranceRateCfgService(db);
    await expect(
      svc.getById(SI_ID, 'main', memberCeoToken(), 'xe-du-lich'),
    ).rejects.toBeInstanceOf(ApiException);
  });
});

describe('PositionCompensationPolicyService (VAL-SET-POS)', () => {
  const catalogs = {
    assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
      code: 'DRIVER',
      label: 'Tài xế',
      status: 'active',
    }),
  };

  it('ensureSchema ADD policy + lines — no closed position_key IN', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        sqls.push(String(sql));
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PositionCompensationPolicyService(db, catalogs as never);
    await svc.ensureSchemaPublic();
    const joined = sqls.join('\n');
    expect(joined).toMatch(/hrm_position_compensation_policy/i);
    expect(joined).toMatch(/hrm_position_compensation_policy_lines/i);
    expect(joined).not.toMatch(/position_key\s+IN\s*\(/i);
  });

  it('VAL-SET-POS-01 bad position_key → HRM-SET-POS-400-KEY', async () => {
    const badCatalogs = {
      assertCodeInEffectiveCatalog: jest
        .fn()
        .mockRejectedValue(
          new ApiException(
            HRM_SET_POS_400_KEY,
            'not in catalog',
            HttpStatus.BAD_REQUEST,
          ),
        ),
    };
    const db = schemaOkDb();
    (db as unknown as { withTransaction: jest.Mock }).withTransaction = jest.fn(
      async (fn: (q: jest.Mock) => Promise<unknown>) => {
        const q = jest.fn().mockResolvedValue({ rows: [{ c: '0' }] });
        return fn(q);
      },
    );
    const svc = new PositionCompensationPolicyService(db, badCatalogs as never);
    await expect(
      svc.create(
        {
          companyId: 'main',
          positionKey: 'FREE_TEXT',
          effectiveFrom: '2026-08-01',
          lines: [],
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_SET_POS_400_KEY });
  });

  it('VAL-SET-POS-02 orphan component → HRM-ALLOW-CAT-ORPHAN-CODE', async () => {
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (
          String(sql).includes('CREATE') ||
          String(sql).includes('INDEX') ||
          String(sql).includes('DO $$')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
      withTransaction: jest.fn(
        async (fn: (q: jest.Mock) => Promise<unknown>) => {
          const q = jest.fn().mockImplementation(async (sql: string) => {
            const s = String(sql);
            sqlLog.push(s);
            if (
              /^SAVEPOINT\s+/i.test(s.trim()) ||
              /^RELEASE\s+SAVEPOINT/i.test(s.trim()) ||
              /^ROLLBACK\s+TO\s+SAVEPOINT/i.test(s.trim())
            ) {
              return { rows: [] };
            }
            if (
              s.includes('hrm_position_compensation_policy') &&
              s.includes("status = 'active'")
            ) {
              return { rows: [] };
            }
            if (
              s.includes('COUNT(*)') &&
              s.includes('hrm_allowance_deduction_types')
            ) {
              return { rows: [{ c: '2' }] };
            }
            if (s.includes('COUNT(*)') && s.includes('salary_components')) {
              expect(s).toMatch(/is_active/);
              expect(s).not.toMatch(/COALESCE\(status/);
              return { rows: [{ c: '0' }] };
            }
            if (
              s.includes('FROM public.hrm_allowance_deduction_types') &&
              s.includes('lower(code)')
            ) {
              return { rows: [] };
            }
            if (
              s.includes('FROM public.salary_components') &&
              s.includes('lower(code)')
            ) {
              expect(s).toMatch(/is_active/);
              return { rows: [] };
            }
            return { rows: [] };
          });
          return fn(q);
        },
      ),
    } as unknown as HrmDbService;
    const svc = new PositionCompensationPolicyService(db, catalogs as never);
    await expect(
      svc.create(
        {
          companyId: 'main',
          positionKey: 'DRIVER',
          effectiveFrom: '2026-08-01',
          lines: [{ componentCode: 'PC_ORPHAN', amount: 100000 }],
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_ALLOW_CAT_ORPHAN_CODE });
    expect(sqlLog.some((s) => /SAVEPOINT\s+pos_sc_/i.test(s))).toBe(true);
  });

  it('D-SETDEF-QA-POS-TX-01 SC probe fail uses SAVEPOINT — orphan still 400 not aborted TX', async () => {
    const sqlLog: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (
          String(sql).includes('CREATE') ||
          String(sql).includes('INDEX') ||
          String(sql).includes('DO $$')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
      withTransaction: jest.fn(
        async (fn: (q: jest.Mock) => Promise<unknown>) => {
          const q = jest.fn().mockImplementation(async (sql: string) => {
            const s = String(sql);
            sqlLog.push(s);
            if (/^SAVEPOINT\s+/i.test(s.trim())) return { rows: [] };
            if (/^ROLLBACK\s+TO\s+SAVEPOINT/i.test(s.trim()))
              return { rows: [] };
            if (/^RELEASE\s+SAVEPOINT/i.test(s.trim())) return { rows: [] };
            if (
              s.includes('hrm_position_compensation_policy') &&
              s.includes("status = 'active'")
            ) {
              return { rows: [] };
            }
            if (
              s.includes('COUNT(*)') &&
              s.includes('hrm_allowance_deduction_types')
            ) {
              return { rows: [{ c: '1' }] };
            }
            if (s.includes('FROM public.salary_components')) {
              throw new Error('column "status" does not exist');
            }
            if (
              s.includes('FROM public.hrm_allowance_deduction_types') &&
              s.includes('lower(code)')
            ) {
              return { rows: [] };
            }
            return { rows: [] };
          });
          return fn(q);
        },
      ),
    } as unknown as HrmDbService;
    const svc = new PositionCompensationPolicyService(db, catalogs as never);
    await expect(
      svc.create(
        {
          companyId: 'main',
          positionKey: 'DRIVER',
          effectiveFrom: '2026-08-01',
          lines: [{ componentCode: 'PC_ORPHAN', amount: 100000 }],
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_ALLOW_CAT_ORPHAN_CODE });
    expect(sqlLog.some((s) => /SAVEPOINT\s+pos_sc_count/i.test(s))).toBe(true);
    expect(
      sqlLog.some((s) => /ROLLBACK\s+TO\s+SAVEPOINT\s+pos_sc_count/i.test(s)),
    ).toBe(true);
  });

  it('VAL-SET-POS-04/SRC-02 resolve never INSERT/UPDATE employee_compensation_*', async () => {
    const sqls: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        sqls.push(s);
        if (s.includes('CREATE') || s.includes('INDEX') || s.includes('DO $$'))
          return { rows: [] };
        if (
          s.includes('FROM public.hrm_position_compensation_policy') &&
          s.includes('position_key')
        ) {
          return {
            rows: [
              {
                id: POS_ID,
                tenant_id: 'xevn',
                company_id: 'holding',
                ou_id: null,
                position_key: 'DRIVER',
                position_label_snapshot: 'Tài xế',
                name_vi: null,
                effective_from: '2026-01-01',
                effective_to: null,
                status: 'active',
                archived_at: null,
                created_at: '2026-08-07T00:00:00Z',
                updated_at: '2026-08-07T00:00:00Z',
                created_by: null,
                updated_by: null,
              },
            ],
          };
        }
        if (s.includes('hrm_position_compensation_policy_lines')) {
          return {
            rows: [
              {
                id: LINE_ID,
                policy_id: POS_ID,
                company_id: 'holding',
                component_code: 'PC_DIEU_XE',
                salary_component_id: null,
                allowance_type_id: null,
                amount: 500000,
                calc_mode: 'fixed',
                currency: 'VND',
                sort_order: 0,
                archived_at: null,
                created_at: '2026-08-07T00:00:00Z',
                updated_at: '2026-08-07T00:00:00Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const spy = jest.spyOn(db, 'query');
    const svc = new PositionCompensationPolicyService(db, catalogs as never);
    const draft = await svc.resolve(
      { company_id: 'main', positionKey: 'DRIVER', asOf: '2026-08-07' },
      groupCeoToken(),
      'xevn',
    );
    expect(draft.policyId).toBe(POS_ID);
    expect(draft.lines[0]?.source).toBe('position_policy');
    expect(draft).not.toHaveProperty('employeePackageId');
    for (const call of spy.mock.calls) {
      const sql = String(call[0] ?? '');
      expect(sql).not.toMatch(/INSERT\s+INTO\s+public\.employee_compensation/i);
      expect(sql).not.toMatch(/UPDATE\s+public\.employee_compensation/i);
    }
  });

  it('resolve no policy → 200 empty + NO_POLICY warning (not 412)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (
          String(sql).includes('CREATE') ||
          String(sql).includes('INDEX') ||
          String(sql).includes('DO $$')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new PositionCompensationPolicyService(db, catalogs as never);
    const draft = await svc.resolve(
      { company_id: 'main', positionKey: 'DRIVER', asOf: '2026-08-07' },
      groupCeoToken(),
      'xevn',
    );
    expect(draft.policyId).toBeNull();
    expect(draft.lines).toEqual([]);
    expect(draft.warnings).toContain('NO_POLICY');
  });

  it('VAL-SET-POS-03 duplicate active header → HRM-SET-POS-409-ACTIVE', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (
          String(sql).includes('CREATE') ||
          String(sql).includes('INDEX') ||
          String(sql).includes('DO $$')
        ) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
      withTransaction: jest.fn(
        async (fn: (q: jest.Mock) => Promise<unknown>) => {
          const q = jest.fn().mockImplementation(async (sql: string) => {
            if (
              String(sql).includes(
                'FROM public.hrm_position_compensation_policy',
              ) &&
              String(sql).includes('active')
            ) {
              return { rows: [{ id: POS_ID }] };
            }
            return { rows: [{ c: '0' }] };
          });
          return fn(q);
        },
      ),
    } as unknown as HrmDbService;
    const svc = new PositionCompensationPolicyService(db, catalogs as never);
    await expect(
      svc.create(
        {
          companyId: 'main',
          positionKey: 'DRIVER',
          effectiveFrom: '2026-08-01',
          status: 'active',
          lines: [],
        },
        groupCeoToken(),
        'xevn',
      ),
    ).rejects.toMatchObject({ code: HRM_SET_POS_409_ACTIVE });
  });
});
