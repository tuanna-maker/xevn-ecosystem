/**
 * @CODE-MEMORY
 * Screen:     HRM → Cài đặt → PC theo vị trí (`/settings/position-compensation-policies`)
 * UC:         UC-SET-DEF-04/05 · AC-AMIS-SET-POS-01/02
 * BR:         BR-AMIS-SET-DEF-04/05/07/08 · BR-AMIS-PAY-SRC-02 · BR-PLT-02
 * SRS:        docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md §4
 * TechSpec:   docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md F-SET-POS-01..05
 * DB_DESIGN:  hrm_position_compensation_policy(+lines)
 * API_DESIGN: CRUD + GET …/resolve (read-only)
 * Purpose:    Position→PC prefill matrix — resolve NEVER writes emp C&B (SRC-02).
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Coded:      2026-08-07
 * Callers:    position-compensation-policy.controller · hire C&B UI (draft only)
 * Callees:    HrmDbService · SettingsCatalogsService.assertCodeInEffectiveCatalog · dual SoT PC/SC
 * FEActions:  Map vị trí → Lưu policy → resolve prefill → C&B confirm riêng
 * BEChain:    ensureSchema → TX header+lines · orphan assert · resolve SELECT only
 * Impact:     POS-05 INSERT emp = phá SRC-02; orphan free-text = phá BR-PLT-02
 * must_keep:  resolve read-only · soft-delete · HRM-ALLOW-CAT-ORPHAN-CODE · payroll_e2e_ready=false
 * SOLID:      Policy service owns prefill draft; emp C&B mutate stays EmployeeCompensationService
 * LastVerified: docs/qa/evidence/po-hrm-settings-defaults-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-SETTINGS-DEFAULTS-BE-01
 * change_mode: ADD
 * What: ensureSchema policy+lines + CRUD TX + resolve no emp write
 * must_keep: scope_parity list↔get↔resolve · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-SETTINGS-DEFAULTS-BE-02
 * change_mode: FIX
 * What: assertComponentCodes — SC probe uses is_active/archived_at (not status) + SAVEPOINT;
 *       display/toDateOnly coerce pg Date via toLeaveDayKey
 * must_keep: HRM-ALLOW-CAT-ORPHAN-CODE 400 not aborted-TX 500 · resolve read-only
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
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
import { HrmDbQueryFn, HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  HRM_ALLOW_CAT_ORPHAN_CODE,
  HRM_SET_POS_400_KEY,
  HRM_SET_POS_404,
  HRM_SET_POS_409_ACTIVE,
  HRM_SET_POS_409_LINE,
  JOB_TITLES_CATALOG_KEY,
  POS_CALC_MODES,
  POS_STATUSES,
  type PosCalcMode,
  type PosStatus,
} from './settings-defaults.constants';
import type {
  CreatePositionCompensationPolicyDto,
  ListPositionCompensationPoliciesQueryDto,
  PatchPositionCompensationPolicyDto,
  PositionPolicyLineDto,
  ResolvePositionCompensationQueryDto,
} from './dto/settings-defaults.dto';

type PolicyRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  ou_id: string | null;
  position_key: string;
  position_label_snapshot: string | null;
  name_vi: string | null;
  effective_from: string | Date;
  effective_to: string | Date | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

type LineRow = {
  id: string;
  policy_id: string;
  company_id: string;
  component_code: string;
  salary_component_id: string | null;
  allowance_type_id: string | null;
  amount: string | number;
  calc_mode: string;
  currency: string;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  component_name_vi?: string | null;
};

export type PositionPolicyLineDisplay = {
  id: string;
  policyId: string;
  componentCode: string;
  salaryComponentId: string | null;
  allowanceTypeId: string | null;
  amount: number;
  calcMode: string;
  currency: string;
  sortOrder: number;
  archivedAt: string | null;
  componentNameVi?: string | null;
};

export type PositionPolicyDisplay = {
  id: string;
  companyId: string;
  ouId: string | null;
  positionKey: string;
  positionLabelSnapshot: string | null;
  nameVi: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
  archivedAt: string | null;
  lines: PositionPolicyLineDisplay[];
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type PrefillLine = {
  componentCode: string;
  amount: number;
  calcMode: string;
  currency: string;
  salaryComponentId?: string | null;
  allowanceTypeId?: string | null;
  source: 'position_policy';
};

export type PositionPrefillDraft = {
  companyId: string;
  ouId: string | null;
  positionKey: string;
  asOf: string;
  policyId: string | null;
  policyStatus: string | null;
  lines: PrefillLine[];
  warnings: string[];
};

@Injectable()
export class PositionCompensationPolicyService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_position_compensation_policy (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id text NOT NULL DEFAULT 'xevn',
        company_id text NOT NULL,
        ou_id text NULL,
        position_key text NOT NULL,
        position_label_snapshot text NULL,
        name_vi text NULL,
        effective_from date NOT NULL,
        effective_to date NULL,
        status text NOT NULL DEFAULT 'active',
        archived_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        created_by text NULL,
        updated_by text NULL
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_pos_comp_policy_active
        ON public.hrm_position_compensation_policy
          (company_id, coalesce(ou_id, ''), lower(position_key))
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_pos_comp_policy_company_pos
        ON public.hrm_position_compensation_policy (company_id, position_key);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_position_compensation_policy
          DROP CONSTRAINT IF EXISTS chk_hrm_pos_comp_status;
        ALTER TABLE public.hrm_position_compensation_policy
          ADD CONSTRAINT chk_hrm_pos_comp_status
          CHECK (status IN ('draft','active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_position_compensation_policy
          DROP CONSTRAINT IF EXISTS chk_hrm_pos_comp_dates;
        ALTER TABLE public.hrm_position_compensation_policy
          ADD CONSTRAINT chk_hrm_pos_comp_dates
          CHECK (effective_to IS NULL OR effective_to > effective_from);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_position_compensation_policy_lines (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        policy_id uuid NOT NULL REFERENCES public.hrm_position_compensation_policy(id),
        company_id text NOT NULL,
        component_code text NOT NULL,
        salary_component_id uuid NULL,
        allowance_type_id uuid NULL,
        amount numeric(18,2) NOT NULL DEFAULT 0,
        calc_mode text NOT NULL DEFAULT 'fixed',
        currency text NOT NULL DEFAULT 'VND',
        sort_order int NOT NULL DEFAULT 0,
        archived_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_pos_comp_line_code_active
        ON public.hrm_position_compensation_policy_lines (policy_id, lower(component_code))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_pos_comp_line_company_code
        ON public.hrm_position_compensation_policy_lines (company_id, lower(component_code))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_position_compensation_policy_lines
          DROP CONSTRAINT IF EXISTS chk_hrm_pos_comp_line_calc;
        ALTER TABLE public.hrm_position_compensation_policy_lines
          ADD CONSTRAINT chk_hrm_pos_comp_line_calc
          CHECK (calc_mode IN ('fixed','formula','rate'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
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
    const tenant = (tenantId ?? this.resolveTenant()).trim().toLowerCase() || this.resolveTenant();
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(authorization, tenant, companyId);
    const scope = resolveHrmListScope(authorization, companyId, { tenantId: tenant });
    return { tenant, catalogCompanyId, scope };
  }

  /** D-SETDEF-QA-SI-DATE-01 class — pg date as Date object. */
  private toDateOnly(raw: string | Date | undefined | null, field: string): string | null {
    if (raw == null) return null;
    if (typeof raw === 'string' && raw.trim() === '') return null;
    const s = toLeaveDayKey(raw);
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      throw new ApiException('HRM-VAL-001', `${field} must be YYYY-MM-DD`, HttpStatus.BAD_REQUEST);
    }
    return s;
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

  private num(v: string | number | null | undefined): number {
    const n = typeof v === 'number' ? v : Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  private displayLine(row: LineRow): PositionPolicyLineDisplay {
    return {
      id: row.id,
      policyId: row.policy_id,
      componentCode: row.component_code,
      salaryComponentId: row.salary_component_id,
      allowanceTypeId: row.allowance_type_id,
      amount: this.num(row.amount),
      calcMode: row.calc_mode,
      currency: row.currency,
      sortOrder: row.sort_order,
      archivedAt: row.archived_at,
      componentNameVi: row.component_name_vi ?? null,
    };
  }

  private displayPolicy(row: PolicyRow, lines: LineRow[]): PositionPolicyDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      ouId: row.ou_id,
      positionKey: row.position_key,
      positionLabelSnapshot: row.position_label_snapshot,
      nameVi: row.name_vi,
      effectiveFrom: toLeaveDayKey(row.effective_from) ?? '',
      effectiveTo: row.effective_to ? toLeaveDayKey(row.effective_to) : null,
      status: row.status,
      archivedAt: row.archived_at,
      lines: lines.map((l) => this.displayLine(l)),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  private async loadLines(policyId: string, query: HrmDbQueryFn = this.db.query.bind(this.db)): Promise<LineRow[]> {
    const res = await query<LineRow>(
      `SELECT l.*,
              COALESCE(pc.name_vi, sc.name) AS component_name_vi
       FROM public.hrm_position_compensation_policy_lines l
       LEFT JOIN public.hrm_allowance_deduction_types pc
         ON pc.id = l.allowance_type_id AND pc.archived_at IS NULL
       LEFT JOIN public.salary_components sc
         ON sc.id = l.salary_component_id
       WHERE l.policy_id = $1::uuid AND l.archived_at IS NULL
       ORDER BY l.sort_order ASC, l.component_code ASC;`,
      [policyId],
    );
    return res.rows;
  }

  private async assertPositionKey(
    tenant: string,
    catalogCompanyId: string,
    positionKey: string,
  ): Promise<{ code: string; label: string }> {
    const key = positionKey.trim();
    if (!key) {
      throw new ApiException(HRM_SET_POS_400_KEY, 'positionKey is required', HttpStatus.BAD_REQUEST);
    }
    if (!this.settingsCatalogs) {
      throw new ApiException(
        HRM_SET_POS_400_KEY,
        'Settings catalogs unavailable — cannot validate positionKey',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: tenant,
      companyId: catalogCompanyId,
      catalogKey: JOB_TITLES_CATALOG_KEY,
      code: key,
      errorCode: HRM_SET_POS_400_KEY,
      errorMessage: `positionKey '${key}' not in job_titles catalog`,
    });
    return { code: hit.code, label: hit.label || hit.code };
  }

  /**
   * Optional salary_components probe inside outer create/patch TX.
   * D-SETDEF-QA-POS-TX-01: wrong column `status` (SoT = is_active + archived_at) aborts PG TX;
   * JS `.catch` alone does not unabort — SAVEPOINT required (peer D-ALLOW-CAT-QA-01).
   */
  private async countActiveSalaryComponents(
    query: HrmDbQueryFn,
    companyId: string,
  ): Promise<number> {
    const sp = 'pos_sc_count';
    await query(`SAVEPOINT ${sp};`);
    try {
      const res = await query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM public.salary_components
         WHERE company_id = $1
           AND archived_at IS NULL
           AND COALESCE(is_active, TRUE) = TRUE;`,
        [companyId],
      );
      await query(`RELEASE SAVEPOINT ${sp};`);
      return Number(res.rows[0]?.c ?? 0);
    } catch {
      try {
        await query(`ROLLBACK TO SAVEPOINT ${sp};`);
      } catch {
        // Outer TX already doomed or stub
      }
      return 0;
    }
  }

  private async findActiveSalaryComponentId(
    query: HrmDbQueryFn,
    companyId: string,
    code: string,
  ): Promise<string | null> {
    const sp = 'pos_sc_by_code';
    await query(`SAVEPOINT ${sp};`);
    try {
      const res = await query<{ id: string }>(
        `SELECT id FROM public.salary_components
         WHERE company_id = $1 AND lower(code) = lower($2)
           AND archived_at IS NULL
           AND COALESCE(is_active, TRUE) = TRUE
         LIMIT 1;`,
        [companyId, code],
      );
      await query(`RELEASE SAVEPOINT ${sp};`);
      return res.rows[0]?.id ?? null;
    } catch {
      try {
        await query(`ROLLBACK TO SAVEPOINT ${sp};`);
      } catch {
        // ignore
      }
      return null;
    }
  }

  private async assertComponentCodes(
    companyId: string,
    lines: PositionPolicyLineDto[],
    query: HrmDbQueryFn,
  ): Promise<
    Array<
      PositionPolicyLineDto & {
        salaryComponentId: string | null;
        allowanceTypeId: string | null;
      }
    >
  > {
    const codes = lines.map((l) => l.componentCode.trim());
    const uniq = new Set(codes.map((c) => c.toLowerCase()));
    if (uniq.size !== codes.length) {
      throw new ApiException(
        HRM_SET_POS_409_LINE,
        'Duplicate componentCode on policy lines',
        HttpStatus.CONFLICT,
      );
    }

    const pcCount = await query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.hrm_allowance_deduction_types
       WHERE company_id = $1 AND archived_at IS NULL AND status = 'active';`,
      [companyId],
    );
    const scCount = await this.countActiveSalaryComponents(query, companyId);
    const catalogNonEmpty =
      Number(pcCount.rows[0]?.c ?? 0) + scCount > 0;

    const out: Array<
      PositionPolicyLineDto & { salaryComponentId: string | null; allowanceTypeId: string | null }
    > = [];

    for (const line of lines) {
      const code = line.componentCode.trim();
      if (!code) {
        throw new ApiException('HRM-VAL-001', 'componentCode required', HttpStatus.BAD_REQUEST);
      }
      if (!Number.isFinite(line.amount) || line.amount < 0) {
        throw new ApiException('HRM-VAL-001', 'amount must be ≥ 0', HttpStatus.BAD_REQUEST);
      }
      const calcMode = (line.calcMode ?? 'fixed') as PosCalcMode;
      if (!(POS_CALC_MODES as readonly string[]).includes(calcMode)) {
        throw new ApiException('HRM-VAL-001', 'calcMode invalid', HttpStatus.BAD_REQUEST);
      }

      let allowanceTypeId: string | null = line.allowanceTypeId ?? null;
      let salaryComponentId: string | null = line.salaryComponentId ?? null;

      const pc = await query<{ id: string }>(
        `SELECT id FROM public.hrm_allowance_deduction_types
         WHERE company_id = $1 AND lower(code) = lower($2)
           AND archived_at IS NULL AND status = 'active'
         LIMIT 1;`,
        [companyId, code],
      );
      const scId = await this.findActiveSalaryComponentId(query, companyId, code);

      if (catalogNonEmpty && !pc.rows[0] && !scId) {
        throw new ApiException(
          HRM_ALLOW_CAT_ORPHAN_CODE,
          `component_code '${code}' not in active PC/SC catalog`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!allowanceTypeId && pc.rows[0]) allowanceTypeId = pc.rows[0].id;
      if (!salaryComponentId && scId) salaryComponentId = scId;

      out.push({
        ...line,
        componentCode: code,
        calcMode,
        salaryComponentId,
        allowanceTypeId,
      });
    }
    return out;
  }

  private async assertNoActiveDup(
    companyId: string,
    ouId: string | null,
    positionKey: string,
    excludeId?: string,
    query: HrmDbQueryFn = this.db.query.bind(this.db),
  ) {
    const res = await query<{ id: string }>(
      `SELECT id FROM public.hrm_position_compensation_policy
       WHERE company_id = $1
         AND coalesce(ou_id, '') = coalesce($2, '')
         AND lower(position_key) = lower($3)
         AND archived_at IS NULL
         AND status = 'active'
         ${excludeId ? 'AND id <> $4::uuid' : ''}
       LIMIT 1;`,
      excludeId ? [companyId, ouId, positionKey, excludeId] : [companyId, ouId, positionKey],
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_SET_POS_409_ACTIVE,
        'Active position compensation policy already exists for this scope',
        HttpStatus.CONFLICT,
        { conflictingId: res.rows[0].id },
      );
    }
  }

  async list(
    query: ListPositionCompensationPoliciesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ items: PositionPolicyDisplay[] }> {
    await this.ensureSchema();
    const { catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      query.company_id,
    );
    assertResourceInHrmScope({ company_id: catalogCompanyId }, scope, {
      notFoundCode: HRM_SET_POS_404,
      mismatchCode: 'HRM-SCOPE-409',
    });

    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, [catalogCompanyId]);
    if (query.position_key?.trim()) {
      values.push(query.position_key.trim());
      filters.push(`lower(position_key) = lower($${values.length})`);
    }
    if (query.ou_id !== undefined) {
      const ou = String(query.ou_id ?? '').trim();
      if (ou === '') filters.push(`ou_id IS NULL`);
      else {
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

    const res = await this.db.query<PolicyRow>(
      `SELECT * FROM public.hrm_position_compensation_policy
       WHERE ${filters.join(' AND ')}
       ORDER BY position_key ASC, effective_from DESC;`,
      values,
    );
    const items: PositionPolicyDisplay[] = [];
    for (const row of res.rows) {
      const lines = await this.loadLines(row.id);
      items.push(this.displayPolicy(row, lines));
    }
    return { items };
  }

  async getById(
    id: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<PositionPolicyDisplay> {
    await this.ensureSchema();
    const { catalogCompanyId, scope } = this.resolvePartition(authorization, tenantId, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, [catalogCompanyId]);
    const res = await this.db.query<PolicyRow>(
      `SELECT * FROM public.hrm_position_compensation_policy
       WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_SET_POS_404, 'Position compensation policy not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope({ company_id: row.company_id }, scope, {
      notFoundCode: HRM_SET_POS_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    const lines = await this.loadLines(row.id);
    return this.displayPolicy(row, lines);
  }

  async create(
    body: CreatePositionCompensationPolicyDto,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ): Promise<PositionPolicyDisplay> {
    await this.ensureSchema();
    const { tenant, catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      body.companyId,
    );
    assertResourceInHrmScope({ company_id: catalogCompanyId }, scope, {
      notFoundCode: HRM_SET_POS_404,
      mismatchCode: 'HRM-SCOPE-409',
    });

    const pos = await this.assertPositionKey(tenant, catalogCompanyId, body.positionKey);
    const from = this.toDateOnly(body.effectiveFrom, 'effectiveFrom');
    if (!from) {
      throw new ApiException('HRM-VAL-001', 'effectiveFrom is required', HttpStatus.BAD_REQUEST);
    }
    const to = this.toDateOnly(body.effectiveTo ?? null, 'effectiveTo');
    this.assertDateWindow(from, to);
    const status = (body.status ?? 'active') as PosStatus;
    if (!(POS_STATUSES as readonly string[]).includes(status)) {
      throw new ApiException('HRM-VAL-001', 'status invalid', HttpStatus.BAD_REQUEST);
    }
    const ouId = body.ouId?.trim() ? body.ouId.trim() : null;
    const linesIn = body.lines ?? [];

    return this.db.withTransaction(async (query) => {
      if (status === 'active') {
        await this.assertNoActiveDup(catalogCompanyId, ouId, pos.code, undefined, query);
      }
      const resolvedLines = await this.assertComponentCodes(catalogCompanyId, linesIn, query);
      const id = randomUUID();
      await query(
        `INSERT INTO public.hrm_position_compensation_policy
          (id, tenant_id, company_id, ou_id, position_key, position_label_snapshot,
           name_vi, effective_from, effective_to, status, created_by, updated_by)
         VALUES
          ($1::uuid, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10, $11, $11);`,
        [
          id,
          tenant,
          catalogCompanyId,
          ouId,
          pos.code,
          pos.label,
          body.nameVi ?? null,
          from,
          to,
          status,
          actor ?? null,
        ],
      );
      let sort = 0;
      for (const line of resolvedLines) {
        await query(
          `INSERT INTO public.hrm_position_compensation_policy_lines
            (id, policy_id, company_id, component_code, salary_component_id, allowance_type_id,
             amount, calc_mode, currency, sort_order)
           VALUES
            ($1::uuid, $2::uuid, $3, $4, $5::uuid, $6::uuid, $7, $8, $9, $10);`,
          [
            randomUUID(),
            id,
            catalogCompanyId,
            line.componentCode,
            line.salaryComponentId,
            line.allowanceTypeId,
            line.amount,
            line.calcMode ?? 'fixed',
            (line.currency ?? 'VND').toUpperCase(),
            line.sortOrder ?? sort++,
          ],
        );
      }
      const header = await query<PolicyRow>(
        `SELECT * FROM public.hrm_position_compensation_policy WHERE id = $1::uuid;`,
        [id],
      );
      const lines = await this.loadLines(id, query);
      return this.displayPolicy(header.rows[0]!, lines);
    });
  }

  async patch(
    id: string,
    companyId: string,
    body: PatchPositionCompensationPolicyDto,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ): Promise<PositionPolicyDisplay> {
    await this.ensureSchema();
    if (!body || Object.keys(body).length === 0) {
      throw new ApiException('HRM-VAL-001', 'Empty PATCH body', HttpStatus.BAD_REQUEST);
    }
    const current = await this.getById(id, companyId, authorization, tenantId);
    const { tenant, catalogCompanyId } = this.resolvePartition(authorization, tenantId, companyId);

    let positionKey = current.positionKey;
    let positionLabel = current.positionLabelSnapshot;
    if (body.positionKey && body.positionKey.trim() !== current.positionKey) {
      const pos = await this.assertPositionKey(tenant, catalogCompanyId, body.positionKey);
      positionKey = pos.code;
      positionLabel = pos.label;
    }
    const from =
      this.toDateOnly(body.effectiveFrom ?? current.effectiveFrom, 'effectiveFrom') ??
      current.effectiveFrom;
    const to =
      body.effectiveTo !== undefined
        ? this.toDateOnly(body.effectiveTo, 'effectiveTo')
        : current.effectiveTo;
    this.assertDateWindow(from, to);
    const status = (body.status ?? current.status) as PosStatus;
    const ouId =
      body.ouId !== undefined ? (body.ouId?.trim() ? body.ouId.trim() : null) : current.ouId;

    return this.db.withTransaction(async (query) => {
      if (status === 'active') {
        await this.assertNoActiveDup(catalogCompanyId, ouId, positionKey, id, query);
      }
      await query(
        `UPDATE public.hrm_position_compensation_policy SET
           ou_id = $1,
           position_key = $2,
           position_label_snapshot = $3,
           name_vi = CASE WHEN $4::bool THEN $5 ELSE name_vi END,
           effective_from = $6::date,
           effective_to = $7::date,
           status = $8,
           updated_at = NOW(),
           updated_by = $9
         WHERE id = $10::uuid;`,
        [
          ouId,
          positionKey,
          positionLabel,
          body.nameVi !== undefined,
          body.nameVi ?? null,
          from,
          to,
          status,
          actor ?? null,
          id,
        ],
      );

      if (body.lines !== undefined) {
        const resolved = await this.assertComponentCodes(catalogCompanyId, body.lines, query);
        await query(
          `UPDATE public.hrm_position_compensation_policy_lines
           SET archived_at = NOW(), updated_at = NOW()
           WHERE policy_id = $1::uuid AND archived_at IS NULL;`,
          [id],
        );
        let sort = 0;
        for (const line of resolved) {
          await query(
            `INSERT INTO public.hrm_position_compensation_policy_lines
              (id, policy_id, company_id, component_code, salary_component_id, allowance_type_id,
               amount, calc_mode, currency, sort_order)
             VALUES
              ($1::uuid, $2::uuid, $3, $4, $5::uuid, $6::uuid, $7, $8, $9, $10);`,
            [
              randomUUID(),
              id,
              catalogCompanyId,
              line.componentCode,
              line.salaryComponentId,
              line.allowanceTypeId,
              line.amount,
              line.calcMode ?? 'fixed',
              (line.currency ?? 'VND').toUpperCase(),
              line.sortOrder ?? sort++,
            ],
          );
        }
      }

      const header = await query<PolicyRow>(
        `SELECT * FROM public.hrm_position_compensation_policy WHERE id = $1::uuid;`,
        [id],
      );
      const lines = await this.loadLines(id, query);
      return this.displayPolicy(header.rows[0]!, lines);
    });
  }

  async retire(
    id: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
    actor?: string,
  ): Promise<{ id: string; status: 'retired' }> {
    await this.getById(id, companyId, authorization, tenantId);
    await this.db.withTransaction(async (query) => {
      await query(
        `UPDATE public.hrm_position_compensation_policy
         SET status = 'retired', archived_at = NOW(), updated_at = NOW(), updated_by = $1
         WHERE id = $2::uuid;`,
        [actor ?? null, id],
      );
      await query(
        `UPDATE public.hrm_position_compensation_policy_lines
         SET archived_at = NOW(), updated_at = NOW()
         WHERE policy_id = $1::uuid AND archived_at IS NULL;`,
        [id],
      );
    });
    return { id, status: 'retired' };
  }

  /**
   * F-SET-POS-05 — read-only prefill draft.
   * FORBIDDEN: INSERT/UPDATE employee_compensation_* (VAL-SET-POS-04 · SRC-02).
   */
  async resolve(
    query: ResolvePositionCompensationQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<PositionPrefillDraft> {
    await this.ensureSchema();
    const { tenant, catalogCompanyId, scope } = this.resolvePartition(
      authorization,
      tenantId,
      query.company_id,
    );
    assertResourceInHrmScope({ company_id: catalogCompanyId }, scope, {
      notFoundCode: HRM_SET_POS_404,
      mismatchCode: 'HRM-SCOPE-409',
    });

    const pos = await this.assertPositionKey(tenant, catalogCompanyId, query.positionKey);
    const asOf =
      this.toDateOnly(query.asOf ?? new Date().toISOString().slice(0, 10), 'asOf') ??
      new Date().toISOString().slice(0, 10);
    const ouId = query.ouId?.trim() ? query.ouId.trim() : null;

    const pick = async (ouFilter: string | null) => {
      const res = await this.db.query<PolicyRow>(
        `SELECT * FROM public.hrm_position_compensation_policy
         WHERE company_id = $1
           AND lower(position_key) = lower($2)
           AND status = 'active'
           AND archived_at IS NULL
           AND coalesce(ou_id, '') = coalesce($3, '')
           AND effective_from <= $4::date
           AND (effective_to IS NULL OR effective_to > $4::date)
         ORDER BY effective_from DESC
         LIMIT 1;`,
        [catalogCompanyId, pos.code, ouFilter, asOf],
      );
      return res.rows[0] ?? null;
    };

    let header: PolicyRow | null = null;
    if (ouId) header = await pick(ouId);
    if (!header) header = await pick(null);

    if (!header) {
      return {
        companyId: catalogCompanyId,
        ouId,
        positionKey: pos.code,
        asOf,
        policyId: null,
        policyStatus: null,
        lines: [],
        warnings: ['NO_POLICY'],
      };
    }

    const lineRows = await this.loadLines(header.id);
    const warnings: string[] = [];
    const lines: PrefillLine[] = [];
    for (const lr of lineRows) {
      // Warn if PC retired (optional soft check)
      if (lr.allowance_type_id) {
        const pc = await this.db.query<{ status: string }>(
          `SELECT status FROM public.hrm_allowance_deduction_types WHERE id = $1::uuid LIMIT 1;`,
          [lr.allowance_type_id],
        );
        if (pc.rows[0]?.status === 'retired') {
          warnings.push(`RETIRED_PC:${lr.component_code}`);
          continue;
        }
      }
      lines.push({
        componentCode: lr.component_code,
        amount: this.num(lr.amount),
        calcMode: lr.calc_mode,
        currency: lr.currency,
        salaryComponentId: lr.salary_component_id,
        allowanceTypeId: lr.allowance_type_id,
        source: 'position_policy',
      });
    }

    // SRC-02: employeeId may only produce suggest-only hints — never write
    void query.employeeId;

    return {
      companyId: catalogCompanyId,
      ouId,
      positionKey: pos.code,
      asOf,
      policyId: header.id,
      policyStatus: header.status,
      lines,
      warnings,
    };
  }
}
