/**
 * @CODE-MEMORY
 * Screen:     HRM → Bảo hiểm nhân viên (enrollment)
 * UC:         FR-UC-BP-CORE-10 · AC-SI-TL-01..05
 * BR:         enrollment SoT ONE = employee_insurances
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md CORE-10
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-SI-02/03
 * DB_DESIGN:  docs/program/specs/PO-HRM-E2E-LINK-EMP-DB-01.md §2–§3
 * API_DESIGN: F-CORE-SI-02 GET · F-CORE-SI-03 POST …/actions
 * Purpose:    Enrollment CRUD + append-only rate periods; actions close/stop/suspend/change_rate/resume.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-BE-02
 * Coded:      2026-08-06
 * Callers:    employee-insurances.controller.ts
 * Callees:    resolveHrmListScope · insurance-enrollment-bridge · employee_insurances · hrm_insurance_rate_period
 * must_keep:  ONE enrollment SoT; no write AC-SI-TL to records/participants; append period no silent overwrite
 * SOLID:      Service owns schema + action map
 * LastVerified: po-hrm-e2e-link-emp-be-02.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-BE-01
 * change_mode: ADD
 * What: ADD hrm_insurance_rate_period; applyAction append; getById periods[]; status enum expand
 * Why: AC-SI-TL timeline · DB-01 CONFIRMED
 * must_keep: soft FK enrollment_id; U65 no seed; scope_parity list↔get
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-BE-02
 * change_mode: FIX
 * What: bridgeLegacyInsuranceRecordsToEnrollments on list/get/actions — close dual-SoT R-EMP-SI-DUAL-SOT
 * Why: natural contracts-insurance/insurance rows must resolve to enrollment ids for POST …/actions
 * must_keep: ONE enrollment SoT; amounts 0 on bridge (no invent); scope_parity main rollup; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01
 * change_mode: ADD
 * What: create/update type ∈ F-SI-CAT-EFF-01 when count>0 → HRM-INS-TYPE-KEY (VAL-SI-CNS-02)
 * Why: BA GAP BE free-text · AC-PLT-SI-INS-ENR · BR-PLT-SI-INS-06
 * must_keep: ONE enrollment SoT; F-CORE-SI-03 actions; no schema rewrite; U65 empty soft-allow
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02
 * change_mode: FIX
 * What: DTO type open (no IsIn) — assertEnrollmentTypeKey remains sole EFF gate
 * Why: D-PLT-SI-INS-DTO-ISIN · QA-02 SIINSQA2-MSJAJ04X open key ∈ EFF → HRM-VAL-001
 * must_keep: ONE enrollment SoT; F-CORE-SI-03; invent → HRM-INS-TYPE-KEY when EFF>0
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-03
 * change_mode: FIX
 * What: optionalEnrollmentDate — "" / invalid → 400 HRM-VAL-001 before $n::date (create+update)
 * Why: OBS-PLT-SI-INS-EMPTY-DATE · blank ViDateField → 500 HRM-SYS-001 date cast
 * must_keep: open type KEY assert; F-CORE-SI-03; ONE SoT; omit/null still null
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01
 * change_mode: UPGRADE
 * What: PATCH contribution/employer_contribution delta → 400 HRM-CORE-CB-VAL-400 redirect change_rate
 * Why: API-01 §5.2 CORE-SI-PATCH-FAILCLOSED · DENY silent period wipe
 * must_keep: F-CORE-SI-RATE append via actions · period ONE SoT · soft-delete
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { SiInsuranceTypeService } from '../contracts-insurance/si-insurance-type.service';
import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { InsuranceActionDto } from './dto/insurance-action.dto';
import { ListEmployeeInsurancesQueryDto } from './dto/list-employee-insurances.query.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';
import {
  bridgeLegacyInsuranceRecordsToEnrollments,
  ensureEmployeeInsuranceEnrollmentSchema,
} from './insurance-enrollment-bridge';
import { HRM_CORE_CB_VAL_400 } from '../contracts-insurance/compensation-cb-authz';

export type EmployeeInsuranceRow = {
  id: string;
  employee_id: string;
  company_id: string;
  type: string;
  provider: string;
  policy_number: string | null;
  start_date: string | null;
  end_date: string | null;
  contribution: string | number;
  employer_contribution: string | number;
  status: string;
  notes: string | null;
  policy_id: string | null;
  si_number: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InsuranceRatePeriodRow = {
  id: string;
  enrollment_id: string;
  company_id: string;
  effective_from: string;
  effective_to: string | null;
  employee_rate_pct: string | number | null;
  employer_rate_pct: string | number | null;
  employee_amount: string | number | null;
  employer_amount: string | number | null;
  pay_rate_cfg_id: string | null;
  period_status: string;
  action: string | null;
  change_reason: string | null;
  suspend_reason: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export const HRM_SI_ACTION_400 = 'HRM-SI-ACTION-400';

const ENROLLMENT_STATUSES = new Set([
  'active',
  'suspended',
  'stopped',
  'closed',
]);

const ACTION_STATUS_MAP: Record<
  InsuranceActionDto['action'],
  { enrollmentStatus: string | 'keep'; periodStatus: string }
> = {
  close: { enrollmentStatus: 'closed', periodStatus: 'closed' },
  stop: { enrollmentStatus: 'stopped', periodStatus: 'stopped' },
  suspend: { enrollmentStatus: 'suspended', periodStatus: 'suspended' },
  change_rate: { enrollmentStatus: 'keep', periodStatus: 'applying' },
  resume: { enrollmentStatus: 'active', periodStatus: 'applying' },
};

@Injectable()
export class EmployeeInsurancesService {
  constructor(
    private readonly db: HrmDbService,
    @Optional()
    private readonly siInsuranceTypeCatalog?: SiInsuranceTypeService,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  private selectColumns = `
    id, employee_id, company_id, type, provider, policy_number, start_date, end_date,
    contribution, employer_contribution, status, notes,
    policy_id, si_number, archived_at, created_at, updated_at
  `;

  private periodSelect = `
    id, enrollment_id, company_id, effective_from::text, effective_to::text,
    employee_rate_pct, employer_rate_pct, employee_amount, employer_amount,
    pay_rate_cfg_id, period_status, action, change_reason, suspend_reason,
    archived_at, created_at, updated_at
  `;

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

  /** VAL-SI-CNS-02 — when Nest EFF >0, enrollment type must ∈ catalog. */
  private async assertEnrollmentTypeKey(
    companyId: string,
    typeRaw: string | null | undefined,
    authorization?: string,
  ): Promise<string> {
    const code = (typeRaw ?? 'social').trim() || 'social';
    const nestCatalog = this.resolveSiInsuranceTypeCatalog();
    if (!nestCatalog) {
      return code;
    }
    const hit = await nestCatalog.assertInsuranceTypeInEffectiveCatalog({
      companyId,
      insuranceType: code,
      authorization,
      tenantId: masterTenantIdFromEnv() || undefined,
    });
    return hit?.insuranceTypeKey ?? code;
  }

  private async ensureSchema() {
    await ensureEmployeeInsuranceEnrollmentSchema(this.db);
  }

  /** Close dual-SoT: promote natural list records into enrollment before read/action. */
  private async bridgeLegacy(companyIds: string[]) {
    await bridgeLegacyInsuranceRecordsToEnrollments(this.db, companyIds);
  }

  private mapRow(row: EmployeeInsuranceRow) {
    return {
      ...row,
      contribution: Number(row.contribution ?? 0),
      employer_contribution: Number(row.employer_contribution ?? 0),
    };
  }

  private mapPeriod(row: InsuranceRatePeriodRow) {
    return {
      ...row,
      employee_rate_pct:
        row.employee_rate_pct == null ? null : Number(row.employee_rate_pct),
      employer_rate_pct:
        row.employer_rate_pct == null ? null : Number(row.employer_rate_pct),
      employee_amount:
        row.employee_amount == null ? null : Number(row.employee_amount),
      employer_amount:
        row.employer_amount == null ? null : Number(row.employer_amount),
    };
  }

  private async listPeriods(
    enrollmentId: string,
  ): Promise<ReturnType<EmployeeInsurancesService['mapPeriod']>[]> {
    const res = await this.db.query<InsuranceRatePeriodRow>(
      `SELECT ${this.periodSelect}
       FROM public.hrm_insurance_rate_period
       WHERE enrollment_id = $1::uuid AND archived_at IS NULL
       ORDER BY effective_from ASC, created_at ASC;`,
      [enrollmentId],
    );
    return res.rows.map((r) => this.mapPeriod(r));
  }

  private dayBefore(isoDate: string): string {
    const d = new Date(`${isoDate}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) {
      throw new ApiException(
        HRM_SI_ACTION_400,
        'effective_from must be a valid date',
        HttpStatus.BAD_REQUEST,
      );
    }
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  async list(query: ListEmployeeInsurancesQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    await this.bridgeLegacy(scope.companyIds);
    const filters: string[] = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.employee_id) {
      values.push(query.employee_id);
      filters.push(`employee_id = $${values.length}::uuid`);
    }
    const res = await this.db.query<EmployeeInsuranceRow>(
      `SELECT ${this.selectColumns}
       FROM public.employee_insurances
       WHERE ${filters.join(' AND ')}
       ORDER BY created_at DESC;`,
      values,
    );
    const data = res.rows.map((row) => this.mapRow(row));
    return { total: data.length, data };
  }

  async getById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    await this.bridgeLegacy(scope.companyIds);
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<EmployeeInsuranceRow>(
      `SELECT ${this.selectColumns}
       FROM public.employee_insurances
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-EINS-404',
        'Employee insurance not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const enrollment = this.mapRow(row);
    const periods = await this.listPeriods(id);
    return { ...enrollment, periods };
  }

  /**
   * OBS-PLT-SI-INS-EMPTY-DATE — FE may POST start_date/end_date as "".
   * Reject blank/invalid before `$n::date` so callers get 400 HRM-VAL-001 (not 500 SYS).
   */
  private optionalEnrollmentDate(
    raw: string | undefined | null,
    field: 'start_date' | 'end_date',
  ): string | null {
    if (raw == null) return null;
    const trimmed = String(raw).trim();
    if (trimmed === '') {
      throw new ApiException(
        'HRM-VAL-001',
        `${field} must be YYYY-MM-DD (empty string not allowed)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      throw new ApiException(
        'HRM-VAL-001',
        `${field} must be YYYY-MM-DD`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return trimmed;
  }

  async create(payload: CreateEmployeeInsuranceDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const id = randomUUID();
    const status = payload.status ?? 'active';
    if (
      !ENROLLMENT_STATUSES.has(status) &&
      status !== 'pending' &&
      status !== 'expired'
    ) {
      throw new ApiException(
        HRM_SI_ACTION_400,
        `Invalid enrollment status '${status}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const typeKey = await this.assertEnrollmentTypeKey(
      companyId,
      payload.type,
      authorization,
    );
    const startDate = this.optionalEnrollmentDate(
      payload.start_date,
      'start_date',
    );
    const endDate = this.optionalEnrollmentDate(payload.end_date, 'end_date');
    const res = await this.db.query<EmployeeInsuranceRow>(
      `INSERT INTO public.employee_insurances (
        id, employee_id, company_id, type, provider, policy_number, start_date, end_date,
        contribution, employer_contribution, status, notes
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7::date, $8::date, $9, $10, $11, $12
      )
      RETURNING ${this.selectColumns};`,
      [
        id,
        payload.employee_id,
        companyId,
        typeKey,
        payload.provider.trim(),
        payload.policy_number?.trim() ?? null,
        startDate,
        endDate,
        payload.contribution ?? 0,
        payload.employer_contribution ?? 0,
        status,
        payload.notes ?? null,
      ],
    );
    const enrollment = this.mapRow(res.rows[0]);
    // Seed first open period when active (timeline SoT starts here — not silent overwrite later).
    if (status === 'active' && startDate) {
      await this.db.query(
        `
          INSERT INTO public.hrm_insurance_rate_period (
            id, enrollment_id, company_id, effective_from, effective_to,
            employee_amount, employer_amount, period_status, action
          ) VALUES (
            $1::uuid, $2::uuid, $3, $4::date, NULL, $5, $6, 'applying', 'enroll'
          );
        `,
        [
          randomUUID(),
          id,
          companyId,
          startDate,
          payload.contribution ?? 0,
          payload.employer_contribution ?? 0,
        ],
      );
    }
    const periods = await this.listPeriods(id);
    return { ...enrollment, periods };
  }

  async update(
    id: string,
    payload: UpdateEmployeeInsuranceDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getById(id, payload.company_id, authorization);
    const scope = resolveHrmListScope(authorization, payload.company_id);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EINS-404',
      mismatchCode: 'HRM-EINS-409',
    });

    // CORE-SI-PATCH-FAILCLOSED — contribution delta must go through …/actions change_rate (append period).
    const contribDelta =
      (payload.contribution != null &&
        Number(payload.contribution) !== Number(existing.contribution)) ||
      (payload.employer_contribution != null &&
        Number(payload.employer_contribution) !==
          Number(existing.employer_contribution));
    if (contribDelta) {
      throw new ApiException(
        HRM_CORE_CB_VAL_400,
        'Đổi mức đóng BH qua POST …/employee-insurances/:id/actions với action=change_rate — không PATCH contribution trên enrollment',
        HttpStatus.BAD_REQUEST,
        {
          redirect_action: 'change_rate',
          path_hint: `/api/hrm/employee-insurances/${id}/actions`,
        },
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (payload.type != null) {
      const typeKey = await this.assertEnrollmentTypeKey(
        existing.company_id,
        payload.type,
        authorization,
      );
      set('type', typeKey);
    }
    if (payload.provider != null) set('provider', payload.provider.trim());
    if (payload.policy_number !== undefined)
      set('policy_number', payload.policy_number?.trim() ?? null);
    if (payload.start_date !== undefined) {
      set(
        'start_date',
        this.optionalEnrollmentDate(payload.start_date, 'start_date'),
      );
    }
    if (payload.end_date !== undefined) {
      set(
        'end_date',
        this.optionalEnrollmentDate(payload.end_date, 'end_date'),
      );
    }
    // Same-value contribution keys ignored (no denorm write without period append).
    if (payload.status != null) set('status', payload.status);
    if (payload.notes !== undefined) set('notes', payload.notes ?? null);
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(id);
    const res = await this.db.query<EmployeeInsuranceRow>(
      `UPDATE public.employee_insurances SET ${fields.join(', ')}
       WHERE id = $${values.length}::uuid
       RETURNING ${this.selectColumns};`,
      values,
    );
    const enrollment = this.mapRow(res.rows[0]);
    const periods = await this.listPeriods(id);
    return { ...enrollment, periods };
  }

  /**
   * F-CORE-SI-03 — append rate period + map enrollment status (no silent overwrite of history).
   */
  async applyAction(
    id: string,
    payload: InsuranceActionDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getById(id, payload.company_id, authorization);
    const scope = resolveHrmListScope(authorization, payload.company_id);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EINS-404',
      mismatchCode: 'HRM-EINS-409',
    });
    const effectiveFrom = payload.effective_from?.trim();
    if (!effectiveFrom) {
      throw new ApiException(
        HRM_SI_ACTION_400,
        'effective_from is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.action === 'suspend' && !payload.suspend_reason?.trim()) {
      throw new ApiException(
        HRM_SI_ACTION_400,
        'suspend_reason is required for suspend action',
        HttpStatus.BAD_REQUEST,
      );
    }
    const map = ACTION_STATUS_MAP[payload.action];
    let nextEnrollmentStatus = existing.status;
    if (map.enrollmentStatus === 'keep') {
      // change_rate keeps active unless already suspended (does not auto-resume).
      if (existing.status !== 'suspended') {
        nextEnrollmentStatus = 'active';
      }
    } else {
      nextEnrollmentStatus = map.enrollmentStatus;
    }

    const priorCloseTo = this.dayBefore(effectiveFrom);
    await this.db.query(
      `
        UPDATE public.hrm_insurance_rate_period
        SET effective_to = $2::date, updated_at = NOW()
        WHERE enrollment_id = $1::uuid AND effective_to IS NULL AND archived_at IS NULL;
      `,
      [id, priorCloseTo],
    );

    const periodId = randomUUID();
    const employeeAmount =
      payload.employee_amount ??
      (payload.action === 'change_rate' || payload.action === 'resume'
        ? Number(existing.contribution)
        : Number(existing.contribution));
    const employerAmount =
      payload.employer_amount ??
      (payload.action === 'change_rate' || payload.action === 'resume'
        ? Number(existing.employer_contribution)
        : Number(existing.employer_contribution));

    try {
      await this.db.query(
        `
          INSERT INTO public.hrm_insurance_rate_period (
            id, enrollment_id, company_id, effective_from, effective_to,
            employee_rate_pct, employer_rate_pct, employee_amount, employer_amount,
            period_status, action, change_reason, suspend_reason
          ) VALUES (
            $1::uuid, $2::uuid, $3, $4::date, NULL,
            $5, $6, $7, $8,
            $9, $10, $11, $12
          );
        `,
        [
          periodId,
          id,
          existing.company_id,
          effectiveFrom,
          payload.employee_rate_pct ?? null,
          payload.employer_rate_pct ?? null,
          employeeAmount,
          employerAmount,
          map.periodStatus,
          payload.action,
          payload.change_reason?.trim() ?? null,
          payload.suspend_reason?.trim() ?? null,
        ],
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('uq_hrm_insurance_rate_period_open') ||
        msg.includes('duplicate key')
      ) {
        throw new ApiException(
          'HRM-SI-409',
          'Open rate period conflict — close prior period before append',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }

    // Sync denorm current amounts on enrollment for list UX (history SoT = periods).
    const denormEmployee =
      payload.action === 'change_rate' || payload.action === 'resume'
        ? employeeAmount
        : Number(existing.contribution);
    const denormEmployer =
      payload.action === 'change_rate' || payload.action === 'resume'
        ? employerAmount
        : Number(existing.employer_contribution);

    await this.db.query(
      `
        UPDATE public.employee_insurances
        SET status = $2,
            contribution = $3,
            employer_contribution = $4,
            updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [id, nextEnrollmentStatus, denormEmployee, denormEmployer],
    );

    return this.getById(id, payload.company_id, authorization);
  }

  async remove(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.getById(id, companyId, authorization);
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EINS-404',
      mismatchCode: 'HRM-EINS-409',
    });
    // Soft-archive enrollment + open periods (preserve history).
    await this.db.query(
      `UPDATE public.hrm_insurance_rate_period SET archived_at = NOW(), updated_at = NOW()
       WHERE enrollment_id = $1::uuid AND archived_at IS NULL;`,
      [id],
    );
    await this.db.query(
      `UPDATE public.employee_insurances SET archived_at = NOW(), updated_at = NOW() WHERE id = $1::uuid;`,
      [id],
    );
    return { id, archived: true };
  }
}
