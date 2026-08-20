/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công / Settings → Quy tắc quỹ phép (`/attendance/leave-accrual-policies`)
 * UC:         AC-PLT-ATT-LEAVE-BAL-01..01e · FR-UC-BP-ATT-04/05b/09
 * BR:         L-ATT-LVRULE-01..10 · BR-PLT-02/04/05/06 · admin N+1 ≠ consumer invent
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md §3–§7
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md F-ATT-LVRULE-*
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md §2
 * API_DESIGN: F-ATT-LVRULE-01 list · 02 CREATE · 03 PATCH/retire · 04 effective · CNS KEY
 * Purpose:    ensureSchema att_leave_accrual_policy + CRUD/retire + effective resolve +
 *             consumer invent assert HRM-ATT-LVRULE-KEY when active>0.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01
 * Coded:      2026-08-08
 * Callers:    attendance.controller · grant/adjust / gated leave (CNS) later
 * Callees:    HrmDbService · resolveHrmListScope · AttLeaveTypeService (soft FK EFF)
 * FEActions:  Admin CREATE N+1 → F5 list · resolve as_of · invent policy_id → 4xx KEY
 * BEChain:    ensureSchema → scope filter → soft archive · resolve IX · CNS count>0 gate
 * Impact:     Treat admin CREATE as invent KEY = phá L-ATT-LVRULE-01; Settings-sole = phá 02;
 *             claim F-ATT-LEAVE-04 LIVE = phá 08; reopen leave-type L1 = phá 06/10
 * must_keep:  att_leave_type L1 · HRM-LEAVE-TYPE-UNKNOWN · ledger employee_leave_balances ·
 *             ATT-CODE/WS/SHIFT seals · FE HOLDs · engine HOLD · U65 empty [] OK ·
 *             FORBIDDEN hard-delete / mega-EAV / second leave-type / Settings dual-write
 * SOLID:      Rule schema CRUD tách leave TXN / type catalog / accrue engine
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-02
 * change_mode: FIX
 * What: assertLeaveAccrualPolicyForConsumer — malformed policyId (non-UUID) khi active>0 =
 *       invent → throw HRM-ATT-LVRULE-KEY (không để p.id=$n::uuid cast ném 500). Wire lên HTTP
 *       qua controller POST leave-accrual-policies/assert-consumer để Network chứng minh KEY.
 * Why: QC Condition R-PLT-ATT-LVRULE-CNS-WIRE — deterministic 4xx KEY cho consumer surface.
 * must_keep: empty active soft-skip (U65) · orthogonal HRM-ATT-LVRULE-TYPE / HRM-LEAVE-TYPE-UNKNOWN ·
 *            engine HOLD (không claim F-ATT-LEAVE-04 LIVE) · admin CREATE không gọi consumer assert
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01
 * change_mode: ADD
 * What: advance_max_days · advance_cap_percent schema + CRUD DTO/display
 * Why:  DATA-01 §4.2 · R-ATT-04B-CAP-CRUD · ≠ max_balance_days advance semantics
 * must_keep: allow_negative · engine HOLD · ≠ FR-04b DONE
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  normalizePayrollListCompanyId,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { AttLeaveTypeService } from './att-leave-type.service';
import {
  ATT_LEAVE_ACCRUAL_KEY_FORMAT,
  ATT_LEAVE_ACCRUAL_MODE_LABEL_VI,
  ATT_LEAVE_ACCRUAL_MODES,
  ATT_LEAVE_ACCRUAL_POLICY_KIND,
  ATT_LEAVE_ACCRUAL_POLICY_STATUSES,
  ATT_LEAVE_ACCRUAL_STATUS_LABEL_VI,
  ATT_LEAVE_ACCRUAL_UNITS,
  HRM_ATT_LVRULE_404,
  HRM_ATT_LVRULE_CONFLICT,
  HRM_ATT_LVRULE_KEY,
  HRM_ATT_LVRULE_TYPE,
  HRM_PLT_CAT_CODE_INVALID,
  type AttLeaveAccrualMode,
  type AttLeaveAccrualPolicyStatus,
  type AttLeaveAccrualUnit,
} from './att-leave-accrual-policy.constants';
import type {
  CreateAttLeaveAccrualPolicyDto,
  ListAttLeaveAccrualPoliciesQueryDto,
  PatchAttLeaveAccrualPolicyDto,
  ResolveEffectiveAttLeaveAccrualPolicyQueryDto,
} from './dto/att-leave-accrual-policy.dto';

type PolicyRow = {
  id: string;
  company_id: string;
  leave_type_key: string;
  version: number;
  effective_from: string;
  effective_to: string | null;
  accrual_mode: string;
  annual_days: string | number;
  unit: string;
  allow_negative: boolean;
  carry_over_expire_rule: string | null;
  carry_cap_days: string | number | null;
  max_balance_days: string | number | null;
  advance_max_days: string | number | null;
  advance_cap_percent: string | number | null;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  leave_type_name_vi?: string | null;
};

export type AttLeaveAccrualPolicyDisplay = {
  id: string;
  companyId: string;
  leaveTypeKey: string;
  leaveTypeNameVi: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  accrualMode: string;
  accrualModeLabel: string;
  annualDays: number;
  unit: string;
  allowNegative: boolean;
  carryOverExpireRule: string | null;
  carryCapDays: number | null;
  maxBalanceDays: number | null;
  advanceMaxDays: number | null;
  advanceCapPercent: number | null;
  metadata: Record<string, unknown> | null;
  status: string;
  statusLabel: string;
  catalogKind: typeof ATT_LEAVE_ACCRUAL_POLICY_KIND;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const SELECT_COLS = `
  p.id, p.company_id, p.leave_type_key, p.version,
  p.effective_from::text AS effective_from,
  p.effective_to::text AS effective_to,
  p.accrual_mode, p.annual_days, p.unit, p.allow_negative,
  p.carry_over_expire_rule, p.carry_cap_days, p.max_balance_days,
  p.advance_max_days, p.advance_cap_percent,
  p.metadata_json, p.status, p.archived_at,
  p.created_at::text AS created_at, p.updated_at::text AS updated_at,
  lt.name_vi AS leave_type_name_vi
`;

const FROM_JOIN = `
  FROM public.att_leave_accrual_policy p
  LEFT JOIN public.att_leave_type lt
    ON lt.company_id = p.company_id
   AND lower(lt.leave_type_key) = lower(p.leave_type_key)
   AND lt.archived_at IS NULL
`;

/** RFC-4122 UUID guard — non-UUID policyId from consumer = invent (not a DB cast 500). */
const POLICY_ID_UUID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class AttLeaveAccrualPolicyService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly attLeaveTypeService?: AttLeaveTypeService,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_leave_accrual_policy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        leave_type_key TEXT NOT NULL,
        version INT NOT NULL DEFAULT 1,
        effective_from DATE NOT NULL,
        effective_to DATE NULL,
        accrual_mode TEXT NOT NULL,
        annual_days NUMERIC(6, 2) NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'day',
        allow_negative BOOLEAN NOT NULL DEFAULT FALSE,
        carry_over_expire_rule TEXT NULL,
        carry_cap_days NUMERIC(6, 2) NULL,
        max_balance_days NUMERIC(6, 2) NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by UUID NULL,
        updated_by UUID NULL
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_leave_accrual_policy_company_key_version_active
        ON public.att_leave_accrual_policy (company_id, lower(leave_type_key), version)
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_leave_accrual_policy_company_status
        ON public.att_leave_accrual_policy (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_leave_accrual_policy_company_key_version
        ON public.att_leave_accrual_policy (company_id, lower(leave_type_key), version DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_leave_accrual_policy_resolve_effective
        ON public.att_leave_accrual_policy (company_id, lower(leave_type_key), effective_from DESC)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_accrual_policy
          DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_dates;
        ALTER TABLE public.att_leave_accrual_policy
          ADD CONSTRAINT chk_att_leave_accrual_policy_dates
          CHECK (effective_to IS NULL OR effective_to > effective_from);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_accrual_policy
          DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_status;
        ALTER TABLE public.att_leave_accrual_policy
          ADD CONSTRAINT chk_att_leave_accrual_policy_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_accrual_policy
          DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_unit;
        ALTER TABLE public.att_leave_accrual_policy
          ADD CONSTRAINT chk_att_leave_accrual_policy_unit
          CHECK (unit IN ('day','hour'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_accrual_policy
          DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_mode_format;
        ALTER TABLE public.att_leave_accrual_policy
          ADD CONSTRAINT chk_att_leave_accrual_policy_mode_format
          CHECK (accrual_mode ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_accrual_policy
          DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_annual_days;
        ALTER TABLE public.att_leave_accrual_policy
          ADD CONSTRAINT chk_att_leave_accrual_policy_annual_days
          CHECK (annual_days >= 0);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_accrual_policy
          DROP CONSTRAINT IF EXISTS chk_att_leave_accrual_policy_caps;
        ALTER TABLE public.att_leave_accrual_policy
          ADD CONSTRAINT chk_att_leave_accrual_policy_caps
          CHECK (
            (carry_cap_days IS NULL OR carry_cap_days >= 0)
            AND (max_balance_days IS NULL OR max_balance_days >= 0)
          );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: closed CHECK leave_type_key IN (…) · Settings dual-write · hard-delete product path
    await this.db.query(`
      ALTER TABLE public.att_leave_accrual_policy
        ADD COLUMN IF NOT EXISTS advance_max_days NUMERIC(6, 2) NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.att_leave_accrual_policy
        ADD COLUMN IF NOT EXISTS advance_cap_percent NUMERIC(5, 2) NULL;
    `);
    this.schemaReady = true;
  }

  private resolveScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    tenantId?: string,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    const companyKeys = expandHrmTextCompanyIds(
      scope,
      authorization,
      requestedCompanyId,
    );
    return { scope, companyKeys, scopeCompanyId };
  }

  private parseMeta(raw: unknown): Record<string, unknown> | null {
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

  private num(v: string | number | null | undefined): number | null {
    if (v == null || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private display(row: PolicyRow): AttLeaveAccrualPolicyDisplay {
    const status = (row.status || 'active') as AttLeaveAccrualPolicyStatus;
    const mode = row.accrual_mode;
    const nameVi =
      (row.leave_type_name_vi && String(row.leave_type_name_vi).trim()) ||
      row.leave_type_key;
    return {
      id: row.id,
      companyId: row.company_id,
      leaveTypeKey: row.leave_type_key,
      leaveTypeNameVi: nameVi,
      version: Number(row.version) || 1,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      accrualMode: mode,
      accrualModeLabel: ATT_LEAVE_ACCRUAL_MODE_LABEL_VI[mode] ?? mode,
      annualDays: this.num(row.annual_days) ?? 0,
      unit: row.unit,
      allowNegative: Boolean(row.allow_negative),
      carryOverExpireRule: row.carry_over_expire_rule,
      carryCapDays: this.num(row.carry_cap_days),
      maxBalanceDays: this.num(row.max_balance_days),
      advanceMaxDays: this.num(row.advance_max_days),
      advanceCapPercent: this.num(row.advance_cap_percent),
      metadata: this.parseMeta(row.metadata_json),
      status,
      statusLabel: ATT_LEAVE_ACCRUAL_STATUS_LABEL_VI[status] ?? status,
      catalogKind: ATT_LEAVE_ACCRUAL_POLICY_KIND,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private assertLeaveTypeKeyFormat(raw: string): string {
    const key = raw.trim().toLowerCase();
    if (!key || !ATT_LEAVE_ACCRUAL_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'leaveTypeKey format invalid — expected ^[a-z][a-z0-9_]*$',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertAccrualMode(raw: string): AttLeaveAccrualMode {
    const mode = raw.trim().toLowerCase();
    if (!ATT_LEAVE_ACCRUAL_KEY_FORMAT.test(mode)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'accrualMode format invalid — expected ^[a-z][a-z0-9_]*$',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(ATT_LEAVE_ACCRUAL_MODES as readonly string[]).includes(mode)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `accrualMode must be one of ${ATT_LEAVE_ACCRUAL_MODES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return mode as AttLeaveAccrualMode;
  }

  private assertUnit(raw: string): AttLeaveAccrualUnit {
    const u = raw.trim().toLowerCase() as AttLeaveAccrualUnit;
    if (!(ATT_LEAVE_ACCRUAL_UNITS as readonly string[]).includes(u)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `unit must be one of ${ATT_LEAVE_ACCRUAL_UNITS.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return u;
  }

  private assertStatus(raw: string): AttLeaveAccrualPolicyStatus {
    const s = raw.trim().toLowerCase() as AttLeaveAccrualPolicyStatus;
    if (!(ATT_LEAVE_ACCRUAL_POLICY_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${ATT_LEAVE_ACCRUAL_POLICY_STATUSES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  private assertIsoDate(raw: string, field: string): string {
    const d = raw.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `${field} must be ISO date YYYY-MM-DD`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return d;
  }

  private todayAsOf(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  /** Alias-aware company filter (JOIN uses `p.company_id`). */
  private pushCompanyFilter(
    filters: string[],
    values: unknown[],
    companyKeys: string[],
    column = 'company_id',
  ): void {
    if (companyKeys.length === 1) {
      values.push(companyKeys[0]);
      filters.push(`${column}::text = $${values.length}`);
      return;
    }
    values.push(companyKeys);
    filters.push(`${column}::text = ANY($${values.length}::text[])`);
  }

  /** Soft FK — leave_type_key ∈ EFF att_leave_type when EFF count >0. */
  private async assertLeaveTypeInEff(input: {
    companyId: string;
    leaveTypeKey: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<void> {
    if (!this.attLeaveTypeService) {
      return;
    }
    const effective = await this.attLeaveTypeService.listEffective(
      { company_id: input.companyId },
      input.authorization,
      { tenantId: input.tenantId },
    );
    if (effective.total === 0) {
      // Cold bootstrap — allow admin CREATE; type catalog empty (U65).
      return;
    }
    const hit = effective.data.find(
      (r) => r.leaveTypeKey.toLowerCase() === input.leaveTypeKey.toLowerCase(),
    );
    if (!hit) {
      throw new ApiException(
        HRM_ATT_LVRULE_TYPE,
        `leave_type_key '${input.leaveTypeKey}' is not in effective att_leave_type catalog (orphan type forbidden on policy admin)`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async nextVersion(
    companyId: string,
    leaveTypeKey: string,
  ): Promise<number> {
    const res = await this.db.query<{ m: string | null }>(
      `SELECT MAX(version)::text AS m
       FROM public.att_leave_accrual_policy
       WHERE company_id = $1 AND lower(leave_type_key) = lower($2)
         AND archived_at IS NULL;`,
      [companyId, leaveTypeKey],
    );
    const max = Number(res.rows[0]?.m ?? 0);
    return (Number.isFinite(max) ? max : 0) + 1;
  }

  /** Service-enforced non-overlapping active windows (DATA-01 · VAL-03). */
  private async assertNoActiveWindowOverlap(input: {
    companyId: string;
    leaveTypeKey: string;
    effectiveFrom: string;
    effectiveTo: string | null;
    excludeId?: string;
  }): Promise<void> {
    const values: unknown[] = [
      input.companyId,
      input.leaveTypeKey,
      input.effectiveFrom,
      input.effectiveTo,
    ];
    let excludeSql = '';
    if (input.excludeId) {
      values.push(input.excludeId);
      excludeSql = ` AND id <> $${values.length}::uuid`;
    }
    const res = await this.db.query<{ id: string }>(
      `SELECT id::text AS id
       FROM public.att_leave_accrual_policy
       WHERE company_id = $1
         AND lower(leave_type_key) = lower($2)
         AND archived_at IS NULL
         AND status = 'active'
         AND effective_from < COALESCE($4::date, '9999-12-31'::date)
         AND COALESCE(effective_to, '9999-12-31'::date) > $3::date
         ${excludeSql}
       LIMIT 1;`,
      values,
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_ATT_LVRULE_CONFLICT,
        `Active accrual policy window overlaps existing policy ${res.rows[0].id}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  /** F-ATT-LVRULE-01 list — default active; include_inactive shows retired. */
  async listPolicies(
    query: ListAttLeaveAccrualPoliciesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: AttLeaveAccrualPolicyDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      tenantId,
    );
    const includeInactive =
      String(query.include_inactive ?? '').toLowerCase() === 'true';
    const filters: string[] = [];
    const values: unknown[] = [];
    this.pushCompanyFilter(filters, values, companyKeys, 'p.company_id');
    if (!includeInactive) {
      filters.push('p.archived_at IS NULL');
      filters.push(`p.status = 'active'`);
    }
    if (query.status?.trim() && includeInactive) {
      values.push(query.status.trim().toLowerCase());
      filters.push(`p.status = $${values.length}`);
    }
    if (query.leave_type_key?.trim()) {
      values.push(query.leave_type_key.trim().toLowerCase());
      filters.push(`lower(p.leave_type_key) = $${values.length}`);
    }
    if (query.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(p.leave_type_key) LIKE $${values.length} OR lower(p.accrual_mode) LIKE $${values.length} OR lower(COALESCE(lt.name_vi,'')) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<PolicyRow>(
      `SELECT ${SELECT_COLS}
       ${FROM_JOIN}
       WHERE ${filters.join(' AND ')}
       ORDER BY p.leave_type_key ASC, p.version DESC, p.effective_from DESC;`,
      values,
    );
    const data = res.rows.map((r) => this.display(r));
    return { total: data.length, data };
  }

  /** F-ATT-LVRULE-01 get-by-id — same scope as list (U19). */
  async getPolicyById(
    policyId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveAccrualPolicyDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<PolicyRow>(
      `SELECT ${SELECT_COLS}
       ${FROM_JOIN}
       WHERE p.id = $1::uuid
       LIMIT 1;`,
      [policyId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_LVRULE_404,
        'Leave accrual policy not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_LVRULE_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row);
  }

  /** F-ATT-LVRULE-04 resolve published policy for type/as-of — 200 empty OK. */
  async resolveEffective(
    query: ResolveEffectiveAttLeaveAccrualPolicyQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: AttLeaveAccrualPolicyDisplay | null }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      tenantId,
    );
    const leaveTypeKey = this.assertLeaveTypeKeyFormat(query.leave_type_key);
    const asOf = query.as_of?.trim()
      ? this.assertIsoDate(query.as_of, 'as_of')
      : this.todayAsOf();
    const filters: string[] = ['p.archived_at IS NULL', `p.status = 'active'`];
    const values: unknown[] = [];
    this.pushCompanyFilter(filters, values, companyKeys, 'p.company_id');
    values.push(leaveTypeKey);
    filters.push(`lower(p.leave_type_key) = $${values.length}`);
    values.push(asOf);
    filters.push(`p.effective_from <= $${values.length}::date`);
    filters.push(
      `(p.effective_to IS NULL OR p.effective_to > $${values.length}::date)`,
    );
    const res = await this.db.query<PolicyRow>(
      `SELECT ${SELECT_COLS}
       ${FROM_JOIN}
       WHERE ${filters.join(' AND ')}
       ORDER BY p.version DESC, p.effective_from DESC
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      return { total: 0, data: null };
    }
    return { total: 1, data: this.display(row) };
  }

  /** Count active policies for type — CNS gate (L-ATT-LVRULE-05/07). */
  async countActivePoliciesForType(input: {
    companyId: string;
    leaveTypeKey: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<number> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      input.authorization,
      input.companyId,
      input.tenantId,
    );
    const key = input.leaveTypeKey.trim().toLowerCase();
    const filters: string[] = ['archived_at IS NULL', `status = 'active'`];
    const values: unknown[] = [];
    this.pushCompanyFilter(filters, values, companyKeys);
    values.push(key);
    filters.push(`lower(leave_type_key) = $${values.length}`);
    const res = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c
       FROM public.att_leave_accrual_policy
       WHERE ${filters.join(' AND ')};`,
      values,
    );
    return Number(res.rows[0]?.c ?? 0);
  }

  /**
   * F-ATT-LVRULE-CNS-01 / VAL-ATT-LVRULE-CNS-01 —
   * When active policy for type >0: invent policyId / ad-hoc mode|days → HRM-ATT-LVRULE-KEY.
   * Empty active = soft skip (U65 · L-ATT-LVRULE-07). Admin CREATE never calls this.
   */
  async assertLeaveAccrualPolicyForConsumer(input: {
    companyId: string;
    leaveTypeKey: string;
    policyId?: string | null;
    accrualMode?: string | null;
    annualDays?: number | null;
    authorization?: string;
    tenantId?: string;
  }): Promise<AttLeaveAccrualPolicyDisplay | null> {
    const leaveTypeKey = input.leaveTypeKey.trim().toLowerCase();
    if (!leaveTypeKey) {
      return null;
    }
    const activeCount = await this.countActivePoliciesForType({
      companyId: input.companyId,
      leaveTypeKey,
      authorization: input.authorization,
      tenantId: input.tenantId,
    });
    if (activeCount === 0) {
      return null;
    }

    const hasPolicyId = Boolean(input.policyId?.trim());
    const hasMode = Boolean(input.accrualMode?.trim());
    const hasDays =
      input.annualDays != null && Number.isFinite(Number(input.annualDays));

    // No rule params on body → soft skip invent (type-only leave path RETAIN).
    if (!hasPolicyId && !hasMode && !hasDays) {
      return null;
    }

    const { companyKeys } = this.resolveScope(
      input.authorization,
      input.companyId,
      input.tenantId,
    );
    const filters: string[] = ['p.archived_at IS NULL', `p.status = 'active'`];
    const values: unknown[] = [];
    this.pushCompanyFilter(filters, values, companyKeys, 'p.company_id');
    values.push(leaveTypeKey);
    filters.push(`lower(p.leave_type_key) = $${values.length}`);

    if (hasPolicyId) {
      const policyId = input.policyId!.trim();
      // Malformed policyId when active>0 = invent → deterministic KEY (avoid ::uuid cast 500).
      if (!POLICY_ID_UUID_FORMAT.test(policyId)) {
        throw new ApiException(
          HRM_ATT_LVRULE_KEY,
          'Accrual policy invent / OOS params forbidden when active policy set >0 — pick published policy',
          HttpStatus.BAD_REQUEST,
        );
      }
      values.push(policyId);
      filters.push(`p.id = $${values.length}::uuid`);
    }
    if (hasMode) {
      values.push(input.accrualMode!.trim().toLowerCase());
      filters.push(`lower(p.accrual_mode) = $${values.length}`);
    }
    if (hasDays) {
      values.push(Number(input.annualDays));
      filters.push(`p.annual_days = $${values.length}::numeric`);
    }

    const res = await this.db.query<PolicyRow>(
      `SELECT ${SELECT_COLS}
       ${FROM_JOIN}
       WHERE ${filters.join(' AND ')}
       ORDER BY p.version DESC
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_LVRULE_KEY,
        'Accrual policy invent / OOS params forbidden when active policy set >0 — pick published policy',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.display(row);
  }

  /** F-ATT-LVRULE-02 admin CREATE open N+1 (≠ consumer invent). */
  async createPolicy(
    body: CreateAttLeaveAccrualPolicyDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveAccrualPolicyDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const leaveTypeKey = this.assertLeaveTypeKeyFormat(body.leaveTypeKey);
    await this.assertLeaveTypeInEff({
      companyId,
      leaveTypeKey,
      authorization,
      tenantId,
    });
    const accrualMode = this.assertAccrualMode(body.accrualMode);
    const unit = body.unit ? this.assertUnit(body.unit) : 'day';
    const annualDays = body.annualDays ?? 0;
    if (annualDays < 0) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'annualDays must be >= 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    const effectiveFrom = this.assertIsoDate(
      body.effectiveFrom,
      'effectiveFrom',
    );
    const effectiveTo =
      body.effectiveTo == null || body.effectiveTo === ''
        ? null
        : this.assertIsoDate(body.effectiveTo, 'effectiveTo');
    if (effectiveTo && effectiveTo <= effectiveFrom) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'effectiveTo must be > effectiveFrom',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const version =
      body.version != null && body.version >= 1
        ? Math.floor(body.version)
        : await this.nextVersion(companyId, leaveTypeKey);

    if (status === 'active') {
      await this.assertNoActiveWindowOverlap({
        companyId,
        leaveTypeKey,
        effectiveFrom,
        effectiveTo,
      });
    }

    const metadataJson =
      body.metadata != null ? JSON.stringify(body.metadata) : null;

    try {
      const inserted = await this.db.query<PolicyRow>(
        `INSERT INTO public.att_leave_accrual_policy (
           id, company_id, leave_type_key, version,
           effective_from, effective_to, accrual_mode, annual_days, unit,
           allow_negative, carry_over_expire_rule, carry_cap_days, max_balance_days,
           advance_max_days, advance_cap_percent,
           metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5::date, $6::date, $7, $8, $9,
           $10, $11, $12, $13, $14, $15, $16::jsonb, $17
         )
         RETURNING id, company_id, leave_type_key, version,
                   effective_from::text AS effective_from,
                   effective_to::text AS effective_to,
                   accrual_mode, annual_days, unit, allow_negative,
                   carry_over_expire_rule, carry_cap_days, max_balance_days,
                   advance_max_days, advance_cap_percent,
                   metadata_json, status, archived_at,
                   created_at::text AS created_at, updated_at::text AS updated_at;`,
        [
          randomUUID(),
          companyId,
          leaveTypeKey,
          version,
          effectiveFrom,
          effectiveTo,
          accrualMode,
          annualDays,
          unit,
          body.allowNegative ?? false,
          body.carryOverExpireRule ?? null,
          body.carryCapDays ?? null,
          body.maxBalanceDays ?? null,
          body.advanceMaxDays ?? null,
          body.advanceCapPercent ?? null,
          metadataJson,
          status,
        ],
      );
      const row = inserted.rows[0];
      // Re-load with type name join for display-ready.
      return this.getPolicyById(row.id, companyId, authorization, tenantId);
    } catch (err: unknown) {
      if (err instanceof ApiException) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      if (
        /uq_att_leave_accrual_policy_company_key_version_active|duplicate key/i.test(
          msg,
        )
      ) {
        throw new ApiException(
          HRM_ATT_LVRULE_CONFLICT,
          `Active policy version ${version} already exists for leave_type_key '${leaveTypeKey}'`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  /** F-ATT-LVRULE-03 PATCH fields (not soft-retire). */
  async patchPolicy(
    policyId: string,
    companyId: string,
    body: PatchAttLeaveAccrualPolicyDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveAccrualPolicyDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<PolicyRow>(
      `SELECT id, company_id, leave_type_key, version,
              effective_from::text AS effective_from,
              effective_to::text AS effective_to,
              accrual_mode, annual_days, unit, allow_negative,
              carry_over_expire_rule, carry_cap_days, max_balance_days,
              metadata_json, status, archived_at,
              created_at::text AS created_at, updated_at::text AS updated_at
       FROM public.att_leave_accrual_policy WHERE id = $1::uuid LIMIT 1;`,
      [policyId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_LVRULE_404,
        'Leave accrual policy not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_LVRULE_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived leave accrual policy',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    const assign = (col: string, value: unknown) => {
      values.push(value);
      sets.push(`${col} = $${values.length}`);
    };

    if (body.accrualMode !== undefined) {
      assign('accrual_mode', this.assertAccrualMode(body.accrualMode));
    }
    if (body.annualDays !== undefined) assign('annual_days', body.annualDays);
    if (body.unit !== undefined) assign('unit', this.assertUnit(body.unit));
    if (body.allowNegative !== undefined) {
      assign('allow_negative', body.allowNegative);
    }
    if (body.carryOverExpireRule !== undefined) {
      assign('carry_over_expire_rule', body.carryOverExpireRule);
    }
    if (body.carryCapDays !== undefined) {
      assign('carry_cap_days', body.carryCapDays);
    }
    if (body.maxBalanceDays !== undefined) {
      assign('max_balance_days', body.maxBalanceDays);
    }
    if (body.advanceMaxDays !== undefined) {
      assign('advance_max_days', body.advanceMaxDays);
    }
    if (body.advanceCapPercent !== undefined) {
      assign('advance_cap_percent', body.advanceCapPercent);
    }
    if (body.effectiveFrom !== undefined) {
      assign(
        'effective_from',
        this.assertIsoDate(body.effectiveFrom, 'effectiveFrom'),
      );
    }
    if (body.effectiveTo !== undefined) {
      const to =
        body.effectiveTo == null || body.effectiveTo === ''
          ? null
          : this.assertIsoDate(body.effectiveTo, 'effectiveTo');
      values.push(to);
      sets.push(`effective_to = $${values.length}::date`);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined) {
      const next = this.assertStatus(body.status);
      assign('status', next);
      if (next === 'retired') {
        sets.push('archived_at = NOW()');
      }
    }

    if (!sets.length) {
      return this.getPolicyById(policyId, companyId, authorization, tenantId);
    }

    const nextFrom =
      body.effectiveFrom !== undefined
        ? this.assertIsoDate(body.effectiveFrom, 'effectiveFrom')
        : row.effective_from;
    const nextTo =
      body.effectiveTo !== undefined
        ? body.effectiveTo == null || body.effectiveTo === ''
          ? null
          : this.assertIsoDate(body.effectiveTo, 'effectiveTo')
        : row.effective_to;
    const nextStatus =
      body.status !== undefined ? this.assertStatus(body.status) : row.status;
    if (nextStatus === 'active') {
      await this.assertNoActiveWindowOverlap({
        companyId: row.company_id,
        leaveTypeKey: row.leave_type_key,
        effectiveFrom: nextFrom,
        effectiveTo: nextTo,
        excludeId: policyId,
      });
    }

    values.push(policyId);
    await this.db.query(
      `UPDATE public.att_leave_accrual_policy
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid;`,
      values,
    );
    return this.getPolicyById(policyId, companyId, authorization, tenantId);
  }

  /** Soft-retire — FORBIDDEN hard-delete (BR-PLT-04 · L-ATT-LVRULE-04). */
  async retirePolicy(
    policyId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveAccrualPolicyDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<PolicyRow>(
      `SELECT id, company_id, leave_type_key, version,
              effective_from::text AS effective_from,
              effective_to::text AS effective_to,
              accrual_mode, annual_days, unit, allow_negative,
              carry_over_expire_rule, carry_cap_days, max_balance_days,
              metadata_json, status, archived_at,
              created_at::text AS created_at, updated_at::text AS updated_at
       FROM public.att_leave_accrual_policy WHERE id = $1::uuid LIMIT 1;`,
      [policyId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_LVRULE_404,
        'Leave accrual policy not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_LVRULE_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.getPolicyById(policyId, companyId, authorization, tenantId);
    }
    await this.db.query(
      `UPDATE public.att_leave_accrual_policy
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid;`,
      [policyId],
    );
    return this.getPolicyById(policyId, companyId, authorization, tenantId);
  }
}
