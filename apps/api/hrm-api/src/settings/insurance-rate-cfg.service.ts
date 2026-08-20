/**
 * @CODE-MEMORY
 * Screen:     HRM → Cài đặt → BH → Tỷ lệ đóng (`/settings/insurance-rate-cfg`)
 * UC:         UC-SET-DEF-02/06 · AC-AMIS-SET-SI-01
 * BR:         BR-AMIS-SET-DEF-02/07 · V-13 · VAL-SET-SI-01..05
 * SRS:        docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md §3
 * TechSpec:   docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md F-SET-SI-01..03
 * DB_DESIGN:  public.pay_insurance_rate_cfg
 * API_DESIGN: GET/POST/PATCH/retire /api/hrm/settings/insurance-rate-cfg
 * Purpose:    Company master SI % + ceiling — ≠ enrollment hrm_insurance_rate_period.
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Coded:      2026-08-07
 * Callers:    insurance-rate-cfg.controller · PAY process pickActiveRateForPeriod
 * Callees:    HrmDbService · resolveHrmSettingsCatalogCompanyId
 * FEActions:  Settings BH → POST version → F5 list
 * BEChain:    ensureSchema → overlap assert → soft retire · process 412
 * Impact:     Silent 0% = phá V-13; hard DELETE = phá snapshot integrity
 * must_keep:  open insurance_type_key · soft-delete · SI-412 · enrollment table untouched
 * SOLID:      SI CFG CRUD tách enrollment timeline service
 * LastVerified: docs/qa/evidence/po-hrm-settings-defaults-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-SETTINGS-DEFAULTS-BE-01
 * change_mode: ADD
 * What: ensureSchema pay_insurance_rate_cfg + CRUD + process pick → 412
 * must_keep: scope_parity · no closed type IN · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-SETTINGS-DEFAULTS-BE-02
 * change_mode: FIX
 * What: coerce pg date → YYYY-MM-DD via toLeaveDayKey (display + assertNoOverlap + toDateOnly)
 * must_keep: cấm String(Date).slice(0,10) → «Thu Jan 01» breaks PATCH + overlap 409
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01
 * change_mode: ADD
 * What: create insurance_type_key ∈ Nest EFF when count>0 (+ eligible_for_rate_cfg) → HRM-INS-TYPE-KEY
 * Why: VAL-SI-CNS-04 · BR-PLT-SI-INS-07 · AC-PLT-SI-INS-RATE
 * must_keep: open format · soft-delete · SI-412 · enrollment untouched · U65 empty soft-allow
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { toLeaveDayKey } from '../attendance/leave-attendance-funnel.service';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { SiInsuranceTypeService } from '../contracts-insurance/si-insurance-type.service';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_SET_SI_404,
  HRM_SET_SI_409_HARD_DELETE,
  HRM_SET_SI_409_OVERLAP,
  HRM_SET_SI_412_MISSING,
  INSURANCE_TYPE_KEY_FORMAT,
  SI_STATUSES,
  type SiStatus,
} from './settings-defaults.constants';
import type {
  CreateInsuranceRateCfgDto,
  ListInsuranceRateCfgQueryDto,
  PatchInsuranceRateCfgDto,
} from './dto/settings-defaults.dto';

type SiRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  ou_id: string | null;
  insurance_type_key: string;
  employee_rate_pct: string | number;
  employer_rate_pct: string | number;
  ceiling_amount: string | number | null;
  currency: string;
  effective_from: string | Date;
  effective_to: string | Date | null;
  status: string;
  version: number;
  supersedes_id: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type InsuranceRateCfgDisplay = {
  id: string;
  companyId: string;
  ouId: string | null;
  insuranceTypeKey: string;
  employeeRatePct: number;
  employerRatePct: number;
  ceilingAmount: number | null;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
  version: number;
  supersedesId: string | null;
  notes: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

@Injectable()
export class InsuranceRateCfgService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional()
    private readonly siInsuranceTypeCatalog?: SiInsuranceTypeService,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  private resolveSiInsuranceTypeCatalog(): SiInsuranceTypeService | undefined {
    if (this.siInsuranceTypeCatalog) {
      return this.siInsuranceTypeCatalog;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      return this.moduleRef.get(SiInsuranceTypeService, { strict: false });
    } catch {
      return undefined;
    }
  }

  /** VAL-SI-CNS-04 — when Nest EFF >0, rate-cfg key ∈ catalog + eligible_for_rate_cfg. */
  private async assertCatalogTypeKey(
    companyId: string,
    typeKey: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<string> {
    const nestCatalog = this.resolveSiInsuranceTypeCatalog();
    if (!nestCatalog) {
      return typeKey;
    }
    const hit = await nestCatalog.assertInsuranceTypeInEffectiveCatalog({
      companyId,
      insuranceType: typeKey,
      authorization,
      tenantId,
      requireEligibleForRateCfg: true,
    });
    return hit?.insuranceTypeKey ?? typeKey;
  }

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_insurance_rate_cfg (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id text NOT NULL DEFAULT 'xevn',
        company_id text NOT NULL,
        ou_id text NULL,
        insurance_type_key text NOT NULL,
        employee_rate_pct numeric(8,4) NOT NULL,
        employer_rate_pct numeric(8,4) NOT NULL,
        ceiling_amount numeric(18,2) NULL,
        currency text NOT NULL DEFAULT 'VND',
        effective_from date NOT NULL,
        effective_to date NULL,
        status text NOT NULL DEFAULT 'active',
        version int NOT NULL DEFAULT 1,
        supersedes_id uuid NULL,
        notes text NULL,
        archived_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        created_by text NULL,
        updated_by text NULL
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_ins_rate_cfg_pick
        ON public.pay_insurance_rate_cfg (company_id, insurance_type_key, effective_from DESC)
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_pay_ins_rate_cfg_ou
        ON public.pay_insurance_rate_cfg (company_id, ou_id, insurance_type_key);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.pay_insurance_rate_cfg
          DROP CONSTRAINT IF EXISTS chk_pay_ins_rate_status;
        ALTER TABLE public.pay_insurance_rate_cfg
          ADD CONSTRAINT chk_pay_ins_rate_status
          CHECK (status IN ('draft','active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.pay_insurance_rate_cfg
          DROP CONSTRAINT IF EXISTS chk_pay_ins_rate_pct;
        ALTER TABLE public.pay_insurance_rate_cfg
          ADD CONSTRAINT chk_pay_ins_rate_pct
          CHECK (employee_rate_pct >= 0 AND employer_rate_pct >= 0);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.pay_insurance_rate_cfg
          DROP CONSTRAINT IF EXISTS chk_pay_ins_rate_dates;
        ALTER TABLE public.pay_insurance_rate_cfg
          ADD CONSTRAINT chk_pay_ins_rate_dates
          CHECK (effective_to IS NULL OR effective_to > effective_from);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: CHECK (insurance_type_key IN ('BHXH','BHYT',...))
    this.schemaReady = true;
  }

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

  /** D-SETDEF-QA-SI-DATE-01 — pg `date` arrives as Date; String(Date).slice ≠ YYYY-MM-DD. */
  private toDateOnly(
    raw: string | Date | undefined | null,
    field: string,
  ): string | null {
    if (raw == null) return null;
    if (typeof raw === 'string' && raw.trim() === '') return null;
    const s = toLeaveDayKey(raw);
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      throw new ApiException(
        'HRM-VAL-001',
        `${field} must be YYYY-MM-DD`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  private pgDateYmd(raw: string | Date | null | undefined): string | null {
    return toLeaveDayKey(raw);
  }

  private assertDateWindow(from: string, to: string | null) {
    if (to != null && to <= from) {
      throw new ApiException(
        'HRM-VAL-001',
        'effectiveTo must be > effectiveFrom',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private assertTypeKey(raw: string): string {
    const key = String(raw ?? '').trim();
    if (!INSURANCE_TYPE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        'HRM-VAL-001',
        'insuranceTypeKey must be an open slug (letter + alnum/_)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private num(v: string | number | null | undefined): number | null {
    if (v == null) return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private display(row: SiRow): InsuranceRateCfgDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      ouId: row.ou_id,
      insuranceTypeKey: row.insurance_type_key,
      employeeRatePct: this.num(row.employee_rate_pct) ?? 0,
      employerRatePct: this.num(row.employer_rate_pct) ?? 0,
      ceilingAmount: this.num(row.ceiling_amount),
      currency: row.currency,
      effectiveFrom: this.pgDateYmd(row.effective_from) ?? '',
      effectiveTo: row.effective_to ? this.pgDateYmd(row.effective_to) : null,
      status: row.status,
      version: row.version,
      supersedesId: row.supersedes_id,
      notes: row.notes,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  private buildCompanyFilters(catalogCompanyId: string): {
    filters: string[];
    values: unknown[];
  } {
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, [catalogCompanyId]);
    return { filters, values };
  }

  private rangesOverlap(
    aFrom: string,
    aTo: string | null,
    bFrom: string,
    bTo: string | null,
  ): boolean {
    const aEnd = aTo ?? '9999-12-31';
    const bEnd = bTo ?? '9999-12-31';
    return aFrom < bEnd && bFrom < aEnd;
  }

  private async assertNoOverlap(args: {
    companyId: string;
    ouId: string | null;
    typeKey: string;
    from: string;
    to: string | null;
    excludeId?: string;
  }): Promise<void> {
    const res = await this.db.query<SiRow>(
      `SELECT id, ou_id, insurance_type_key, effective_from, effective_to, status, archived_at
       FROM public.pay_insurance_rate_cfg
       WHERE company_id = $1
         AND lower(insurance_type_key) = lower($2)
         AND archived_at IS NULL
         AND status = 'active'
         AND coalesce(ou_id, '') = coalesce($3, '');`,
      [args.companyId, args.typeKey, args.ouId],
    );
    for (const row of res.rows) {
      if (args.excludeId && row.id === args.excludeId) continue;
      const from = this.pgDateYmd(row.effective_from) ?? '';
      const to = row.effective_to ? this.pgDateYmd(row.effective_to) : null;
      if (!from) continue;
      if (this.rangesOverlap(args.from, args.to, from, to)) {
        throw new ApiException(
          HRM_SET_SI_409_OVERLAP,
          'Active insurance rate window overlaps existing version',
          HttpStatus.CONFLICT,
          { conflictingId: row.id },
        );
      }
    }
  }

  async list(
    query: ListInsuranceRateCfgQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ items: InsuranceRateCfgDisplay[]; total: number }> {
    await this.ensureSchema();
    const { catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      query.company_id,
    );
    assertResourceInHrmScope({ company_id: catalogCompanyId }, scope, {
      notFoundCode: HRM_SET_SI_404,
      mismatchCode: 'HRM-SCOPE-409',
    });

    const { filters, values } = this.buildCompanyFilters(catalogCompanyId);
    if (query.insurance_type_key?.trim()) {
      values.push(query.insurance_type_key.trim());
      filters.push(`lower(insurance_type_key) = lower($${values.length})`);
    }
    if (query.ou_id !== undefined) {
      const ou = String(query.ou_id ?? '').trim();
      if (ou === '') {
        filters.push(`ou_id IS NULL`);
      } else {
        values.push(ou);
        filters.push(`ou_id = $${values.length}`);
      }
    }
    if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    } else if (!query.include_retired) {
      filters.push(`status <> 'retired'`);
      filters.push(`archived_at IS NULL`);
    }
    if (query.as_of?.trim()) {
      const asOf = this.toDateOnly(query.as_of, 'as_of')!;
      values.push(asOf);
      filters.push(
        `effective_from <= $${values.length}::date AND (effective_to IS NULL OR effective_to > $${values.length}::date)`,
      );
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const countRes = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.pay_insurance_rate_cfg ${where};`,
      values,
    );
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, query.page_size ?? 50));
    const offset = (page - 1) * pageSize;
    const limitIdx = values.length + 1;
    const offsetIdx = values.length + 2;
    const pageValues = [...values, pageSize, offset];
    const res = await this.db.query<SiRow>(
      `SELECT * FROM public.pay_insurance_rate_cfg ${where}
       ORDER BY insurance_type_key ASC, effective_from DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx};`,
      pageValues,
    );
    return {
      items: res.rows.map((r) => this.display(r)),
      total: Number(countRes.rows[0]?.c ?? 0),
    };
  }

  async getById(
    id: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<InsuranceRateCfgDisplay> {
    await this.ensureSchema();
    const { catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      companyId,
    );
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, [catalogCompanyId]);
    const res = await this.db.query<SiRow>(
      `SELECT * FROM public.pay_insurance_rate_cfg
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_SET_SI_404,
        'Insurance rate cfg not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope({ company_id: row.company_id }, scope, {
      notFoundCode: HRM_SET_SI_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row);
  }

  async create(
    body: CreateInsuranceRateCfgDto,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ): Promise<InsuranceRateCfgDisplay> {
    await this.ensureSchema();
    const { tenant, catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      body.companyId,
    );
    assertResourceInHrmScope({ company_id: catalogCompanyId }, scope, {
      notFoundCode: HRM_SET_SI_404,
      mismatchCode: 'HRM-SCOPE-409',
    });

    const typeKey = await this.assertCatalogTypeKey(
      catalogCompanyId,
      this.assertTypeKey(body.insuranceTypeKey),
      authorization,
      tenant,
    );
    const from = this.toDateOnly(body.effectiveFrom, 'effectiveFrom');
    if (!from) {
      throw new ApiException(
        'HRM-VAL-001',
        'effectiveFrom is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const to = this.toDateOnly(body.effectiveTo ?? null, 'effectiveTo');
    this.assertDateWindow(from, to);
    const status = body.status ?? 'active';
    if (!(SI_STATUSES as readonly string[]).includes(status)) {
      throw new ApiException(
        'HRM-VAL-001',
        'status invalid',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isFinite(body.employeeRatePct) || body.employeeRatePct < 0) {
      throw new ApiException(
        'HRM-VAL-001',
        'employeeRatePct must be ≥ 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Number.isFinite(body.employerRatePct) || body.employerRatePct < 0) {
      throw new ApiException(
        'HRM-VAL-001',
        'employerRatePct must be ≥ 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    const ouId = body.ouId?.trim() ? body.ouId.trim() : null;

    if (status === 'active') {
      await this.assertNoOverlap({
        companyId: catalogCompanyId,
        ouId,
        typeKey,
        from,
        to,
      });
    }

    const verRes = await this.db.query<{ v: string }>(
      `SELECT COALESCE(MAX(version), 0)::text AS v
       FROM public.pay_insurance_rate_cfg
       WHERE company_id = $1 AND lower(insurance_type_key) = lower($2)
         AND coalesce(ou_id, '') = coalesce($3, '');`,
      [catalogCompanyId, typeKey, ouId],
    );
    const version = Number(verRes.rows[0]?.v ?? 0) + 1;
    const id = randomUUID();

    if (body.supersedesId && status === 'active') {
      await this.db.query(
        `UPDATE public.pay_insurance_rate_cfg
         SET effective_to = $1::date, updated_at = NOW(), updated_by = $2
         WHERE id = $3::uuid AND company_id = $4 AND archived_at IS NULL
           AND effective_to IS NULL;`,
        [from, actor ?? null, body.supersedesId, catalogCompanyId],
      );
    }

    await this.db.query(
      `INSERT INTO public.pay_insurance_rate_cfg
        (id, tenant_id, company_id, ou_id, insurance_type_key,
         employee_rate_pct, employer_rate_pct, ceiling_amount, currency,
         effective_from, effective_to, status, version, supersedes_id, notes,
         created_by, updated_by)
       VALUES
        ($1::uuid, $2, $3, $4, $5,
         $6, $7, $8, $9,
         $10::date, $11::date, $12, $13, $14::uuid, $15,
         $16, $16);`,
      [
        id,
        tenant,
        catalogCompanyId,
        ouId,
        typeKey,
        body.employeeRatePct,
        body.employerRatePct,
        body.ceilingAmount ?? null,
        (body.currency ?? 'VND').toUpperCase(),
        from,
        to,
        status,
        version,
        body.supersedesId ?? null,
        body.notes ?? null,
        actor ?? null,
      ],
    );
    return this.getById(id, catalogCompanyId, authorization, tenantId);
  }

  async patch(
    id: string,
    companyId: string,
    body: PatchInsuranceRateCfgDto,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ): Promise<InsuranceRateCfgDisplay> {
    await this.ensureSchema();
    if (!body || Object.keys(body).length === 0) {
      throw new ApiException(
        'HRM-VAL-001',
        'Empty PATCH body',
        HttpStatus.BAD_REQUEST,
      );
    }
    const current = await this.getById(id, companyId, authorization, tenantId);
    const { catalogCompanyId } = this.resolvePartition(
      authorization,
      tenantId,
      companyId,
    );

    const from =
      this.toDateOnly(
        body.effectiveFrom ?? current.effectiveFrom,
        'effectiveFrom',
      ) ?? current.effectiveFrom;
    const to =
      body.effectiveTo !== undefined
        ? this.toDateOnly(body.effectiveTo, 'effectiveTo')
        : current.effectiveTo;
    this.assertDateWindow(from, to);
    const status = (body.status ?? current.status) as SiStatus;
    const ouId =
      body.ouId !== undefined
        ? body.ouId?.trim()
          ? body.ouId.trim()
          : null
        : current.ouId;

    if (status === 'active') {
      await this.assertNoOverlap({
        companyId: catalogCompanyId,
        ouId,
        typeKey: current.insuranceTypeKey,
        from,
        to,
        excludeId: id,
      });
    }

    await this.db.query(
      `UPDATE public.pay_insurance_rate_cfg SET
         employee_rate_pct = COALESCE($1, employee_rate_pct),
         employer_rate_pct = COALESCE($2, employer_rate_pct),
         ceiling_amount = CASE WHEN $3::bool THEN $4 ELSE ceiling_amount END,
         currency = COALESCE($5, currency),
         effective_from = $6::date,
         effective_to = $7::date,
         status = $8,
         ou_id = $9,
         notes = CASE WHEN $10::bool THEN $11 ELSE notes END,
         updated_at = NOW(),
         updated_by = $12
       WHERE id = $13::uuid;`,
      [
        body.employeeRatePct ?? null,
        body.employerRatePct ?? null,
        body.ceilingAmount !== undefined,
        body.ceilingAmount ?? null,
        body.currency?.toUpperCase() ?? null,
        from,
        to,
        status,
        ouId,
        body.notes !== undefined,
        body.notes ?? null,
        actor ?? null,
        id,
      ],
    );
    return this.getById(id, companyId, authorization, tenantId);
  }

  async retire(
    id: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ): Promise<{ id: string; status: 'retired' }> {
    await this.getById(id, companyId, authorization, tenantId);
    await this.db.query(
      `UPDATE public.pay_insurance_rate_cfg
       SET status = 'retired', archived_at = NOW(), updated_at = NOW(), updated_by = $1
       WHERE id = $2::uuid;`,
      [actor ?? null, id],
    );
    return { id, status: 'retired' };
  }

  /** Hard DELETE forbidden — VAL-SET-SI-05. */
  rejectHardDelete(): never {
    throw new ApiException(
      HRM_SET_SI_409_HARD_DELETE,
      'Hard DELETE forbidden — use POST …/retire',
      HttpStatus.CONFLICT,
    );
  }

  /**
   * Process pick — VAL-SET-SI-03 / UC-SET-DEF-06 / V-13.
   * OU row wins else company-wide; missing → 412 (cấm silent 0%).
   */
  async pickActiveRateForPeriod(args: {
    companyId: string;
    insuranceTypeKey: string;
    periodStart: string;
    periodEnd: string;
    ouId?: string | null;
    authorization?: string;
    tenantId?: string;
  }): Promise<InsuranceRateCfgDisplay> {
    await this.ensureSchema();
    const { catalogCompanyId } = this.resolvePartition(
      args.authorization,
      args.tenantId,
      args.companyId,
    );
    const typeKey = this.assertTypeKey(args.insuranceTypeKey);
    const start = this.toDateOnly(args.periodStart, 'periodStart')!;
    const end = this.toDateOnly(args.periodEnd, 'periodEnd')!;

    const ou = args.ouId?.trim() ? args.ouId.trim() : null;
    const pick = async (ouFilter: string | null) => {
      const res = await this.db.query<SiRow>(
        `SELECT * FROM public.pay_insurance_rate_cfg
         WHERE company_id = $1
           AND lower(insurance_type_key) = lower($2)
           AND status = 'active'
           AND archived_at IS NULL
           AND coalesce(ou_id, '') = coalesce($3, '')
           AND effective_from <= $4::date
           AND (effective_to IS NULL OR effective_to > $5::date)
         ORDER BY effective_from DESC
         LIMIT 1;`,
        [catalogCompanyId, typeKey, ouFilter, end, start],
      );
      return res.rows[0] ?? null;
    };

    let row: SiRow | null = null;
    if (ou) {
      row = await pick(ou);
    }
    if (!row) {
      row = await pick(null);
    }
    if (!row) {
      throw new ApiException(
        HRM_SET_SI_412_MISSING,
        `No active insurance rate for ${typeKey} in period — configure Settings BH (cấm silent 0%)`,
        HttpStatus.PRECONDITION_FAILED,
        {
          companyId: catalogCompanyId,
          insuranceTypeKey: typeKey,
          periodStart: start,
          periodEnd: end,
        },
      );
    }
    return this.display(row);
  }
}
