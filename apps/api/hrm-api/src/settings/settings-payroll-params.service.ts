/**
 * SoT KV `pay_system_params` trên `hrm_company_settings` —
 * tham số mặc định tính lương (sheet khách «Mặc định và Tham số»).
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  MASTER_TENANT_ID,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';

export const PAY_SYSTEM_PARAMS_KEY = 'pay_system_params' as const;

export type PaySystemTaxBracket = {
  level: number;
  /** Trần bậc (VND); null = bậc cuối «trở lên». */
  upTo: number | null;
  rate: number;
};

export type PaySystemParamsDocument = {
  MINIMUM_WAGE: number;
  STANDARD_WORK_DAYS: number;
  /** Ngày công Tổng đài = số ngày tháng − offset. */
  STANDARD_WORK_DAYS_CC_OFFSET: number;
  /** Ngày công Lái xe tải = số ngày tháng − offset. */
  STANDARD_WORK_DAYS_DRIVER_OFFSET: number;
  STANDARD_WORK_HOURS: number;
  BHXH_BASE: number;
  BHXH_CAP: number;
  BHXH_EMP_RATE: number;
  BHXH_CMP_RATE: number;
  /** Tai nạn LĐ/BNN — công ty đóng (%). */
  TNLD_CMP_RATE: number;
  TNCN_PERSONAL: number;
  TNCN_DEPENDENT: number;
  PAY_DAY: number;
  ADVANCE_DAY: number;
  CUTOFF_DAY: number;
  CC_BASE_SALARY: number;
  CC_CALL_FUND: number;
  DRIVER_KPI_EXPRESS: number;
  DRIVER_MEAL_ALLOWANCE: number;
  TNCN_BRACKETS: PaySystemTaxBracket[];
};

@Injectable()
export class SettingsPayrollParamsService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_company_settings (
        id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'xevn',
        company_id TEXT NOT NULL,
        setting_key TEXT NOT NULL,
        value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_hrm_company_settings_tenant_co_key UNIQUE (tenant_id, company_id, setting_key)
      );
    `);
    this.schemaReady = true;
  }

  private resolveTenant(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  getDefaults(): PaySystemParamsDocument {
    return {
      MINIMUM_WAGE: 5_310_000,
      STANDARD_WORK_DAYS: 26,
      STANDARD_WORK_DAYS_CC_OFFSET: 4,
      STANDARD_WORK_DAYS_DRIVER_OFFSET: 4,
      STANDARD_WORK_HOURS: 8,
      BHXH_BASE: 2_340_000,
      BHXH_CAP: 46_800_000,
      BHXH_EMP_RATE: 10.5,
      BHXH_CMP_RATE: 17.5,
      TNLD_CMP_RATE: 0.5,
      TNCN_PERSONAL: 11_000_000,
      TNCN_DEPENDENT: 4_400_000,
      PAY_DAY: 10,
      ADVANCE_DAY: 20,
      CUTOFF_DAY: 25,
      CC_BASE_SALARY: 5_000_000,
      CC_CALL_FUND: 500_000,
      DRIVER_KPI_EXPRESS: 2_000_000,
      DRIVER_MEAL_ALLOWANCE: 25_000,
      TNCN_BRACKETS: [
        { level: 1, upTo: 5_000_000, rate: 5 },
        { level: 2, upTo: 10_000_000, rate: 10 },
        { level: 3, upTo: 18_000_000, rate: 15 },
        { level: 4, upTo: 32_000_000, rate: 20 },
        { level: 5, upTo: 52_000_000, rate: 25 },
        { level: 6, upTo: 80_000_000, rate: 30 },
        { level: 7, upTo: null, rate: 35 },
      ],
    };
  }

  private asFiniteNumber(v: unknown, fallback: number): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  }

  private mergeDocument(raw: unknown): PaySystemParamsDocument {
    const defaults = this.getDefaults();
    const src =
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    const bracketsRaw = Array.isArray(src.TNCN_BRACKETS)
      ? src.TNCN_BRACKETS
      : defaults.TNCN_BRACKETS;

    const brackets: PaySystemTaxBracket[] = bracketsRaw.map((b, idx) => {
      const row =
        b && typeof b === 'object' && !Array.isArray(b)
          ? (b as Record<string, unknown>)
          : {};
      const def = defaults.TNCN_BRACKETS[idx] ?? defaults.TNCN_BRACKETS[6]!;
      const upToRaw = row.upTo ?? row.up_to;
      return {
        level: this.asFiniteNumber(row.level, def.level),
        upTo:
          upToRaw == null || upToRaw === ''
            ? null
            : this.asFiniteNumber(upToRaw, def.upTo ?? 0),
        rate: this.asFiniteNumber(row.rate, def.rate),
      };
    });

    return {
      MINIMUM_WAGE: this.asFiniteNumber(src.MINIMUM_WAGE, defaults.MINIMUM_WAGE),
      STANDARD_WORK_DAYS: this.asFiniteNumber(
        src.STANDARD_WORK_DAYS,
        defaults.STANDARD_WORK_DAYS,
      ),
      STANDARD_WORK_DAYS_CC_OFFSET: this.asFiniteNumber(
        src.STANDARD_WORK_DAYS_CC_OFFSET,
        defaults.STANDARD_WORK_DAYS_CC_OFFSET,
      ),
      STANDARD_WORK_DAYS_DRIVER_OFFSET: this.asFiniteNumber(
        src.STANDARD_WORK_DAYS_DRIVER_OFFSET,
        defaults.STANDARD_WORK_DAYS_DRIVER_OFFSET,
      ),
      STANDARD_WORK_HOURS: this.asFiniteNumber(
        src.STANDARD_WORK_HOURS,
        defaults.STANDARD_WORK_HOURS,
      ),
      BHXH_BASE: this.asFiniteNumber(src.BHXH_BASE, defaults.BHXH_BASE),
      BHXH_CAP: this.asFiniteNumber(src.BHXH_CAP, defaults.BHXH_CAP),
      BHXH_EMP_RATE: this.asFiniteNumber(src.BHXH_EMP_RATE, defaults.BHXH_EMP_RATE),
      BHXH_CMP_RATE: this.asFiniteNumber(src.BHXH_CMP_RATE, defaults.BHXH_CMP_RATE),
      TNLD_CMP_RATE: this.asFiniteNumber(src.TNLD_CMP_RATE, defaults.TNLD_CMP_RATE),
      TNCN_PERSONAL: this.asFiniteNumber(src.TNCN_PERSONAL, defaults.TNCN_PERSONAL),
      TNCN_DEPENDENT: this.asFiniteNumber(
        src.TNCN_DEPENDENT,
        defaults.TNCN_DEPENDENT,
      ),
      PAY_DAY: this.asFiniteNumber(src.PAY_DAY, defaults.PAY_DAY),
      ADVANCE_DAY: this.asFiniteNumber(src.ADVANCE_DAY, defaults.ADVANCE_DAY),
      CUTOFF_DAY: this.asFiniteNumber(src.CUTOFF_DAY, defaults.CUTOFF_DAY),
      CC_BASE_SALARY: this.asFiniteNumber(
        src.CC_BASE_SALARY,
        defaults.CC_BASE_SALARY,
      ),
      CC_CALL_FUND: this.asFiniteNumber(src.CC_CALL_FUND, defaults.CC_CALL_FUND),
      DRIVER_KPI_EXPRESS: this.asFiniteNumber(
        src.DRIVER_KPI_EXPRESS,
        defaults.DRIVER_KPI_EXPRESS,
      ),
      DRIVER_MEAL_ALLOWANCE: this.asFiniteNumber(
        src.DRIVER_MEAL_ALLOWANCE,
        defaults.DRIVER_MEAL_ALLOWANCE,
      ),
      TNCN_BRACKETS: brackets.length > 0 ? brackets : defaults.TNCN_BRACKETS,
    };
  }

  private assertDocument(doc: PaySystemParamsDocument): void {
    const checks: Array<[string, number, number, number]> = [
      ['MINIMUM_WAGE', doc.MINIMUM_WAGE, 0, 1e12],
      ['STANDARD_WORK_DAYS', doc.STANDARD_WORK_DAYS, 1, 31],
      ['STANDARD_WORK_DAYS_CC_OFFSET', doc.STANDARD_WORK_DAYS_CC_OFFSET, 0, 28],
      [
        'STANDARD_WORK_DAYS_DRIVER_OFFSET',
        doc.STANDARD_WORK_DAYS_DRIVER_OFFSET,
        0,
        28,
      ],
      ['STANDARD_WORK_HOURS', doc.STANDARD_WORK_HOURS, 1, 24],
      ['BHXH_BASE', doc.BHXH_BASE, 0, 1e12],
      ['BHXH_CAP', doc.BHXH_CAP, 0, 1e12],
      ['BHXH_EMP_RATE', doc.BHXH_EMP_RATE, 0, 100],
      ['BHXH_CMP_RATE', doc.BHXH_CMP_RATE, 0, 100],
      ['TNLD_CMP_RATE', doc.TNLD_CMP_RATE, 0, 100],
      ['TNCN_PERSONAL', doc.TNCN_PERSONAL, 0, 1e12],
      ['TNCN_DEPENDENT', doc.TNCN_DEPENDENT, 0, 1e12],
      ['PAY_DAY', doc.PAY_DAY, 1, 31],
      ['ADVANCE_DAY', doc.ADVANCE_DAY, 1, 31],
      ['CUTOFF_DAY', doc.CUTOFF_DAY, 1, 31],
    ];
    for (const [key, value, min, max] of checks) {
      if (!Number.isFinite(value) || value < min || value > max) {
        throw new ApiException(
          'HRM-PAY-PARAMS-400',
          `${key} phải là số trong khoảng [${min}, ${max}]`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    for (const b of doc.TNCN_BRACKETS) {
      if (!Number.isFinite(b.rate) || b.rate < 0 || b.rate > 100) {
        throw new ApiException(
          'HRM-PAY-PARAMS-400',
          `TNCN bậc ${b.level}: thuế suất không hợp lệ`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  /** Flat numbers for payroll process (bỏ brackets). */
  async getPayrollParams(companyId: string): Promise<Record<string, number>> {
    const doc = await this.getPayrollParamsDocument(companyId);
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(doc)) {
      if (typeof v === 'number') out[k] = v;
    }
    return out;
  }

  async getPayrollParamsDocument(
    companyId: string,
    authorization?: string,
  ): Promise<PaySystemParamsDocument> {
    await this.ensureSchema();
    const tenant = this.resolveTenant();
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      tenant,
      companyId,
    );
    const res = await this.db.query<{ value_json: unknown }>(
      `
        SELECT value_json
        FROM public.hrm_company_settings
        WHERE tenant_id = $1
          AND company_id = $2
          AND setting_key = $3
          AND archived_at IS NULL
        LIMIT 1
      `,
      [tenant, catalogCompanyId, PAY_SYSTEM_PARAMS_KEY],
    );

    if (!res.rows[0]) return this.getDefaults();

    let parsed: unknown = res.rows[0].value_json;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return this.getDefaults();
      }
    }
    return this.mergeDocument(parsed);
  }

  async upsertPayrollParams(
    companyId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ): Promise<PaySystemParamsDocument> {
    await this.ensureSchema();
    const tenant = this.resolveTenant();
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      tenant,
      companyId,
    );
    const current = await this.getPayrollParamsDocument(companyId, authorization);
    const merged = this.mergeDocument({ ...current, ...payload });
    this.assertDocument(merged);

    const existing = await this.db.query<{ id: string }>(
      `
        SELECT id FROM public.hrm_company_settings
        WHERE tenant_id = $1 AND company_id = $2 AND setting_key = $3
        LIMIT 1
      `,
      [tenant, catalogCompanyId, PAY_SYSTEM_PARAMS_KEY],
    );

    if (existing.rows[0]) {
      await this.db.query(
        `
          UPDATE public.hrm_company_settings
          SET value_json = $4::jsonb,
              archived_at = NULL,
              updated_at = NOW()
          WHERE tenant_id = $1 AND company_id = $2 AND setting_key = $3
        `,
        [
          tenant,
          catalogCompanyId,
          PAY_SYSTEM_PARAMS_KEY,
          JSON.stringify(merged),
        ],
      );
    } else {
      await this.db.query(
        `
          INSERT INTO public.hrm_company_settings (
            id, tenant_id, company_id, setting_key, value_json
          ) VALUES ($1, $2, $3, $4, $5::jsonb)
        `,
        [
          randomUUID(),
          tenant,
          catalogCompanyId,
          PAY_SYSTEM_PARAMS_KEY,
          JSON.stringify(merged),
        ],
      );
    }

    return merged;
  }
  }
}
