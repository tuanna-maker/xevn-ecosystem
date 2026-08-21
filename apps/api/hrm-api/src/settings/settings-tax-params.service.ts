/**
 * @CODE-MEMORY
 * Screen:     HRM → Cài đặt → Lương → Thông số thuế (`/settings/company-settings`)
 * UC:         UC-SET-DEF-01 · AC-AMIS-SET-TAX-01
 * BR:         BR-AMIS-SET-DEF-01 · VAL-SET-TAX-01..04
 * SRS:        docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md §2
 * TechSpec:   docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md F-SET-TAX-01
 * DB_DESIGN:  public.hrm_company_settings (EXPAND pay_tax_* keys)
 * API_DESIGN: GET/PUT /api/hrm/settings/company-settings
 * Purpose:    Settings mount for pay_tax_* KV on shared hrm_company_settings — no Nest GTGC const.
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Coded:      2026-08-07
 * Callers:    settings-company-settings.controller · PAY process (readRequired)
 * Callees:    HrmDbService · resolveHrmSettingsCatalogCompanyId
 * FEActions:  Settings thuế → PUT key → F5 GET prefix
 * BEChain:    ensureSchema → shape validate → UPSERT UQ (tenant,company,key)
 * Impact:     Hardcoded GTGC = phá BR-AMIS-SET-DEF-01; CTR keys wiped = phá must_keep
 * must_keep:  CTR/leave keys intact · open pay_tax_* · GET missing → 200 null · payroll_e2e_ready=false
 * SOLID:      Tax KV service shares table with CTR CFG; CTR closed-key assert stays in legal-print
 * LastVerified: docs/qa/evidence/po-hrm-settings-defaults-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-SETTINGS-DEFAULTS-BE-01
 * change_mode: ADD
 * What: Settings GET/PUT company-settings for pay_tax_*; process 412 helper
 * must_keep: resolveHrmSettingsCatalogCompanyId · VAL-SET-TAX · no seed
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_SET_TAX_400_SHAPE,
  HRM_SET_TAX_412_MISSING,
  PAY_TAX_DEPENDENT_DEDUCTION,
  PAY_TAX_FLAGS,
  PAY_TAX_KEY_PREFIX,
  PAY_TAX_PERSONAL_DEDUCTION,
  PAY_TAX_REGIME,
} from './settings-defaults.constants';
import type {
  GetSettingsCompanySettingsQueryDto,
  PutSettingsCompanySettingDto,
} from './dto/settings-defaults.dto';

type SettingRow = {
  id: string;
  company_id: string;
  setting_key: string;
  value_json: Record<string, unknown> | string;
  archived_at: string | null;
  updated_at: string;
  updated_by?: string | null;
};

export type CompanySettingDisplay = {
  id: string | null;
  companyId: string;
  settingKey: string;
  value: Record<string, unknown> | null;
  archivedAt: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  meta?: { cta?: string };
};

@Injectable()
export class SettingsTaxParamsService {
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
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_company_settings_company_key
      ON public.hrm_company_settings (company_id, setting_key)
      WHERE archived_at IS NULL;
    `);
    // FORBIDDEN: CHECK (setting_key IN (...)) closed set
    this.schemaReady = true;
  }

  /** Public for jest ensureSchema assert. */
  async ensureSchemaPublic(): Promise<void> {
    this.schemaReady = false;
    await this.ensureSchema();
  }

  private resolveTenant(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  private resolvePartition(
    authorization: string | undefined,
    tenantId: string | undefined,
    companyId: string,
  ) {
    const tenant =
      (tenantId ?? this.resolveTenant()).trim().toLowerCase() ||
      this.resolveTenant();
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      tenant,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, companyId, {
      tenantId: tenant,
    });
    return { tenant, catalogCompanyId, scope };
  }

  private parseJson(raw: unknown): Record<string, unknown> | null {
    if (raw == null) return null;
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw) as unknown;
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          return p as Record<string, unknown>;
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  private display(
    companyId: string,
    settingKey: string,
    row?: SettingRow | null,
  ): CompanySettingDisplay {
    if (!row) {
      return {
        id: null,
        companyId,
        settingKey,
        value: null,
        archivedAt: null,
        updatedAt: null,
        updatedBy: null,
        meta: {
          cta: `Cấu hình ${settingKey} trong Cài đặt → Lương → Thông số thuế`,
        },
      };
    }
    return {
      id: row.id,
      companyId: row.company_id,
      settingKey: row.setting_key,
      value: this.parseJson(row.value_json),
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by ?? null,
    };
  }

  private isFiniteNonNeg(n: unknown): n is number {
    return typeof n === 'number' && Number.isFinite(n) && n >= 0;
  }

  private normalizeValueObject(raw: unknown): Record<string, unknown> {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new ApiException(
        HRM_SET_TAX_400_SHAPE,
        'value must be a JSON object',
        HttpStatus.BAD_REQUEST,
      );
    }
    return raw as Record<string, unknown>;
  }

  /** VAL-SET-TAX-01/02 — typed shapes for known starters; open registry for other pay_tax_* . */
  validatePayTaxValue(
    settingKey: string,
    raw: unknown,
  ): Record<string, unknown> {
    const key = settingKey.trim();
    if (!key.startsWith(PAY_TAX_KEY_PREFIX)) {
      throw new ApiException(
        HRM_SET_TAX_400_SHAPE,
        `Settings tax mount accepts only ${PAY_TAX_KEY_PREFIX}* keys`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const obj = this.normalizeValueObject(raw);

    if (
      key === PAY_TAX_PERSONAL_DEDUCTION ||
      key === PAY_TAX_DEPENDENT_DEDUCTION
    ) {
      const amount = obj.amount ?? obj.Amount;
      const currency = String(
        obj.currency ?? obj.Currency ?? 'VND',
      ).toUpperCase();
      if (!this.isFiniteNonNeg(amount)) {
        throw new ApiException(
          HRM_SET_TAX_400_SHAPE,
          'amount must be finite number ≥ 0',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (currency !== 'VND') {
        throw new ApiException(
          HRM_SET_TAX_400_SHAPE,
          'currency must be VND for GĐ1 tax deduction keys',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { amount: Number(amount), currency: 'VND' };
    }

    if (key === PAY_TAX_REGIME) {
      const code = String(obj.code ?? obj.Code ?? '').trim();
      if (code !== 'progressive_vn' && code !== 'other') {
        throw new ApiException(
          HRM_SET_TAX_400_SHAPE,
          'regime.code must be progressive_vn|other',
          HttpStatus.BAD_REQUEST,
        );
      }
      const note = obj.note ?? obj.Note;
      const out: Record<string, unknown> = { code };
      if (typeof note === 'string' && note.trim()) out.note = note.trim();
      return out;
    }

    if (key === PAY_TAX_FLAGS) {
      const applyPersonal =
        obj.applyPersonalDeduction ??
        obj.apply_personal_deduction ??
        obj.ApplyPersonalDeduction;
      const applyDependent =
        obj.applyDependentDeduction ??
        obj.apply_dependent_deduction ??
        obj.ApplyDependentDeduction;
      if (
        typeof applyPersonal !== 'boolean' ||
        typeof applyDependent !== 'boolean'
      ) {
        throw new ApiException(
          HRM_SET_TAX_400_SHAPE,
          'pay_tax_flags requires applyPersonalDeduction + applyDependentDeduction booleans',
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        applyPersonalDeduction: applyPersonal,
        applyDependentDeduction: applyDependent,
      };
    }

    // Open registry: object with finite non-neg amounts if present
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'number' && (!Number.isFinite(v) || v < 0)) {
        throw new ApiException(
          HRM_SET_TAX_400_SHAPE,
          `Field ${k} must be finite ≥ 0`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return obj;
  }

  async get(
    query: GetSettingsCompanySettingsQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<CompanySettingDisplay | { items: CompanySettingDisplay[] }> {
    await this.ensureSchema();
    const { catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      query.company_id,
    );
    assertResourceInHrmScope({ company_id: catalogCompanyId }, scope, {
      notFoundCode: 'HRM-SCOPE-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    const prefix = (query.prefix ?? '').trim();
    if (prefix) {
      const filters: string[] = ['archived_at IS NULL', `setting_key LIKE $1`];
      const values: unknown[] = [`${prefix}%`];
      pushCompanyIdFilter(filters, values, [catalogCompanyId]);
      const res = await this.db.query<SettingRow>(
        `SELECT id, company_id, setting_key, value_json, archived_at, updated_at
         FROM public.hrm_company_settings
         WHERE ${filters.join(' AND ')}
         ORDER BY setting_key ASC;`,
        values,
      );
      return {
        items: res.rows.map((r) =>
          this.display(r.company_id, r.setting_key, r),
        ),
      };
    }

    const key = (query.key ?? '').trim();
    if (!key) {
      throw new ApiException(
        'HRM-VAL-001',
        'key or prefix is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const filters: string[] = ['setting_key = $1', 'archived_at IS NULL'];
    const values: unknown[] = [key];
    pushCompanyIdFilter(filters, values, [catalogCompanyId]);
    const res = await this.db.query<SettingRow>(
      `SELECT id, company_id, setting_key, value_json, archived_at, updated_at
       FROM public.hrm_company_settings
       WHERE ${filters.join(' AND ')}
       ORDER BY updated_at DESC LIMIT 1;`,
      values,
    );
    return this.display(catalogCompanyId, key, res.rows[0] ?? null);
  }

  async put(
    body: PutSettingsCompanySettingDto,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ): Promise<CompanySettingDisplay> {
    await this.ensureSchema();
    const settingKey = String(body.settingKey ?? '').trim();
    if (!settingKey) {
      throw new ApiException(
        'HRM-VAL-001',
        'settingKey is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.value === undefined) {
      throw new ApiException(
        'HRM-VAL-001',
        'value is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const value = this.validatePayTaxValue(settingKey, body.value);
    const { tenant, catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      body.companyId,
    );
    assertResourceInHrmScope({ company_id: catalogCompanyId }, scope, {
      notFoundCode: 'HRM-SCOPE-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    const existing = await this.db.query<{ id: string }>(
      `SELECT id FROM public.hrm_company_settings
       WHERE tenant_id = $1 AND company_id = $2 AND setting_key = $3 AND archived_at IS NULL
       LIMIT 1;`,
      [tenant, catalogCompanyId, settingKey],
    );
    if (existing.rows[0]) {
      await this.db.query(
        `UPDATE public.hrm_company_settings
         SET value_json = $1::jsonb, updated_at = NOW()
         WHERE id = $2::uuid;`,
        [JSON.stringify(value), existing.rows[0].id],
      );
    } else {
      await this.db.query(
        `INSERT INTO public.hrm_company_settings
          (id, tenant_id, company_id, setting_key, value_json)
         VALUES ($1::uuid, $2, $3, $4, $5::jsonb);`,
        [
          randomUUID(),
          tenant,
          catalogCompanyId,
          settingKey,
          JSON.stringify(value),
        ],
      );
    }
    void actor;
    const got = await this.get(
      { company_id: catalogCompanyId, key: settingKey },
      authorization,
      tenantId,
    );
    return got as CompanySettingDisplay;
  }

  /**
   * Process consumer — VAL-SET-TAX-04: required key missing → 412 (no Nest const fallback).
   */
  async readRequiredTaxValue(
    companyId: string,
    settingKey: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<Record<string, unknown>> {
    const row = (await this.get(
      { company_id: companyId, key: settingKey },
      authorization,
      tenantId,
    )) as CompanySettingDisplay;
    if (!row.value) {
      throw new ApiException(
        HRM_SET_TAX_412_MISSING,
        `Required tax setting '${settingKey}' is not configured`,
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    return row.value;
  }
}
