/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công — auto quỹ & ca mặc định khi Hoạt động (ATT-12)
 * UC:         FR-UC-BP-ATT-12 · peer FR-UC-BP-CORE-07 R-CORE-07-ATT-12
 * BR:         BR-BP-LC-03 · BR-BP-LC-03-HALF
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-12
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md §4.5–4.8
 * Purpose:    Consumer employee.activated → idempotent grant + activate_default shift bind.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01
 * Coded:      2026-08-10
 * Callers:    AttEmployeeActivatedConsumer · POST enroll-on-activate · PUT shift-assignments
 * Callees:    att_activate_enroll_ledger · employee_leave_balances · att_shift_assignment · LVRULE EFF
 * must_keep:  DENY att_leave_hold · DENY merge buckets · RETAIN PUT tracked-entitlement path · CORE emit-only
 * SOLID:      Tách enroll consumer khỏi employees.service và leave read path
 * LastVerified: po-hrm-mvp-gd1-att-12-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01
 * change_mode: ADD
 * What: F-ATT-LEAVE-BAL enroll-on-activate + R-ATT-12-IDEMPOTENT + F-ATT-SHIFT-02 activate_default
 * Why:  FR-UC-BP-ATT-12 Diễn biến #2 · half-month floor(annual/2) cuối tháng vi-VN
 * must_keep: ATT07/06/05/09 peers · ≠ ATT-12 DONE · ≠ F-ATT-LEAVE-04 periodic
 */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { resolveHrmPersistCompanyIdText } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { EmployeeActivatedRealtimePayload } from '../realtime/hrm-realtime.service';
import { AttLeaveAccrualPolicyService } from './att-leave-accrual-policy.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { AttendanceConfigService } from './attendance-config.service';
import {
  ATT_ACTIVATE_ENROLL_LEDGER_STATUS,
  ATT_SHIFT_ASSIGN_SOURCE_ACTIVATE_DEFAULT,
  HRM_ATT_ENROLL_NOT_ACTIVE,
  HRM_ATT_SHIFT_ASSIGN_DUP,
} from './att-activate-enroll.constants';
import {
  buildActivateEnrollIdempotencyKey,
  calendarYearFromIsoDate,
  computeActivateEnrollEntitledDays,
  parseViEffectiveDateToIso,
} from './att-activate-enroll.util';
import { MVP_LEAVE_BALANCE_TYPES } from './leave-balance.service';
import { pickBestSpecificityRule } from './late-penalty.util';

export type ActivateEnrollResult = {
  enrolled: boolean;
  skipped: boolean;
  idempotencyKey: string;
  balanceYears: number[];
  defaultShiftAssignmentId?: string | null;
};

type EmployeeActivateRow = {
  id: string;
  company_id: string;
  status: string;
  custom_fields: Record<string, unknown> | null;
};

type SpecificityRow = {
  id: string;
  company_id: string;
  department_id: string | null;
  shift_id: string | null;
  archived_at: string | null;
};

@Injectable()
export class AttActivateEnrollService {
  private readonly logger = new Logger(AttActivateEnrollService.name);

  constructor(
    private readonly db: HrmDbService,
    private readonly leaveAccrualPolicy: AttLeaveAccrualPolicyService,
    private readonly attendanceCatalog: AttendanceCatalogService,
    private readonly attendanceConfig: AttendanceConfigService,
  ) {}

  async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL DEFAULT 'annual',
        balance_year INT NOT NULL,
        entitled_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        advanced_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_activate_enroll_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        effective_date DATE NOT NULL,
        idempotency_key TEXT NOT NULL,
        activate_event_ref TEXT NULL,
        grant_applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        policy_snapshot_hash TEXT NULL,
        default_shift_assignment_id UUID NULL,
        ledger_status TEXT NOT NULL DEFAULT 'completed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_att_activate_enroll_ledger_status
          CHECK (ledger_status IN ('completed'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_activate_enroll_ledger_idempotency
      ON public.att_activate_enroll_ledger (idempotency_key);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_activate_enroll_ledger_employee
      ON public.att_activate_enroll_ledger (company_id, employee_id, effective_date);
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_shift_assignment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        shift_id UUID NOT NULL,
        department_id TEXT NULL,
        effective_from DATE NOT NULL,
        effective_to DATE NULL,
        source TEXT NOT NULL DEFAULT 'activate_default',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_shift_assignment_open_activate_default
      ON public.att_shift_assignment (company_id, employee_id)
      WHERE source = 'activate_default'
        AND effective_to IS NULL
        AND archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_shift_assignment_employee_from
      ON public.att_shift_assignment (employee_id, effective_from);
    `);
  }

  /** R-ATT-12-CONSUMER entry — fire-and-forget safe; logs errors without failing CORE activate. */
  async handleEmployeeActivated(payload: EmployeeActivatedRealtimePayload): Promise<void> {
    try {
      await this.enrollOnActivate({
        employeeId: payload.employee_id,
        companyId: payload.company_id,
        effectiveDateDisplay: payload.effective_date,
      });
    } catch (err) {
      this.logger.error(
        `employee.activated enroll failed for ${payload.employee_id}: ${String(err)}`,
      );
    }
  }

  async enrollOnActivate(input: {
    employeeId: string;
    companyId: string;
    effectiveDateDisplay: string;
    activateEventRef?: string | null;
    authorization?: string;
    tenantId?: string;
  }): Promise<ActivateEnrollResult> {
    await this.ensureSchema();
    const effectiveDateIso = parseViEffectiveDateToIso(input.effectiveDateDisplay);
    const idempotencyKey = buildActivateEnrollIdempotencyKey(
      input.companyId,
      input.employeeId,
      effectiveDateIso,
      input.activateEventRef,
    );

    const existingLedger = await this.db.query<{ id: string }>(
      `SELECT id FROM public.att_activate_enroll_ledger WHERE idempotency_key = $1 LIMIT 1;`,
      [idempotencyKey],
    );
    if (existingLedger.rows[0]) {
      return {
        enrolled: false,
        skipped: true,
        idempotencyKey,
        balanceYears: [],
      };
    }

    const employee = await this.loadActiveEmployee(input.employeeId);
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      input.authorization,
      employee.company_id,
      { tenantId: input.tenantId },
    );

    return this.db.withTransaction(async (query) => {
      const ledgerInsert = await query<{ id: string }>(
        `
          INSERT INTO public.att_activate_enroll_ledger (
            company_id, employee_id, effective_date, idempotency_key,
            activate_event_ref, ledger_status
          ) VALUES ($1, $2::uuid, $3::date, $4, $5, $6)
          ON CONFLICT (idempotency_key) DO NOTHING
          RETURNING id;
        `,
        [
          persistCompanyId,
          employee.id,
          effectiveDateIso,
          idempotencyKey,
          input.activateEventRef ?? null,
          ATT_ACTIVATE_ENROLL_LEDGER_STATUS,
        ],
      );
      if (!ledgerInsert.rows[0]) {
        return {
          enrolled: false,
          skipped: true,
          idempotencyKey,
          balanceYears: [],
        };
      }

      const balanceYear = calendarYearFromIsoDate(effectiveDateIso);
      const balanceYears: number[] = [];
      const asOf = effectiveDateIso;

      for (const leaveType of MVP_LEAVE_BALANCE_TYPES) {
        const eff = await this.leaveAccrualPolicy.resolveEffective(
          {
            company_id: persistCompanyId,
            leave_type_key: leaveType,
            as_of: asOf,
          },
          input.authorization,
          input.tenantId,
        );
        if (!eff.data) continue;
        const entitled = computeActivateEnrollEntitledDays(eff.data.annualDays, effectiveDateIso);
        if (entitled <= 0) continue;
        await this.upsertBalanceRow(query, {
          companyId: employee.company_id,
          employeeId: employee.id,
          leaveType,
          balanceYear,
          entitledDays: entitled,
        });
        balanceYears.push(balanceYear);
      }

      let defaultShiftAssignmentId: string | null = null;
      const shiftId = await this.resolveDefaultShiftId(
        persistCompanyId,
        employee,
        input.authorization,
      );
      if (shiftId) {
        defaultShiftAssignmentId = await this.insertActivateDefaultShift(query, {
          companyId: persistCompanyId,
          employeeId: employee.id,
          shiftId,
          departmentId: this.readEmployeeDepartment(employee),
          effectiveFromIso: effectiveDateIso,
        });
      }

      if (defaultShiftAssignmentId) {
        await query(
          `
            UPDATE public.att_activate_enroll_ledger
            SET default_shift_assignment_id = $2::uuid
            WHERE idempotency_key = $1;
          `,
          [idempotencyKey, defaultShiftAssignmentId],
        );
      }

      return {
        enrolled: true,
        skipped: false,
        idempotencyKey,
        balanceYears,
        defaultShiftAssignmentId,
      };
    });
  }

  async upsertActivateDefaultShift(input: {
    employeeId: string;
    companyId: string;
    shiftId: string;
    effectiveFromDisplay: string;
    departmentId?: string | null;
    authorization?: string;
    tenantId?: string;
  }): Promise<{ assignmentId: string; shiftId: string; effectiveFrom: string }> {
    await this.ensureSchema();
    const employee = await this.loadActiveEmployee(input.employeeId);
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      input.authorization,
      input.companyId ?? employee.company_id,
      { tenantId: input.tenantId },
    );
    await this.attendanceCatalog.getWorkShiftById(
      input.shiftId,
      persistCompanyId,
      input.authorization,
    );
    const effectiveFromIso = parseViEffectiveDateToIso(input.effectiveFromDisplay);
    const assignmentId = await this.db.withTransaction((query) =>
      this.insertActivateDefaultShift(query, {
        companyId: persistCompanyId,
        employeeId: employee.id,
        shiftId: input.shiftId,
        departmentId: input.departmentId ?? this.readEmployeeDepartment(employee),
        effectiveFromIso,
      }),
    );
    if (!assignmentId) {
      throw new ApiException(
        HRM_ATT_SHIFT_ASSIGN_DUP,
        'Open activate_default shift assignment already exists for employee',
        HttpStatus.CONFLICT,
      );
    }
    return {
      assignmentId,
      shiftId: input.shiftId,
      effectiveFrom: input.effectiveFromDisplay,
    };
  }

  private async loadActiveEmployee(employeeId: string): Promise<EmployeeActivateRow> {
    const res = await this.db.query<EmployeeActivateRow>(
      `
        SELECT id, company_id, status, custom_fields
        FROM public.employees
        WHERE id = $1::uuid AND archived_at IS NULL
        LIMIT 1;
      `,
      [employeeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-ATT-ENROLL-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    const status = String(row.status ?? '').trim().toLowerCase();
    if (status !== 'active') {
      throw new ApiException(
        HRM_ATT_ENROLL_NOT_ACTIVE,
        'Employee must be active before enroll-on-activate',
        HttpStatus.CONFLICT,
        { status: row.status },
      );
    }
    return row;
  }

  private readEmployeeDepartment(employee: EmployeeActivateRow): string | null {
    const cf = employee.custom_fields ?? {};
    const dep = cf.department ?? cf.department_key ?? cf.department_id;
    if (dep == null || dep === '') return null;
    return String(dep).trim();
  }

  private async upsertBalanceRow(
    query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>,
    input: {
      companyId: string;
      employeeId: string;
      leaveType: string;
      balanceYear: number;
      entitledDays: number;
    },
  ): Promise<void> {
    await query(
      `
        INSERT INTO public.employee_leave_balances (
          company_id, employee_id, leave_type, balance_year,
          entitled_days, used_days, pending_days, updated_at
        ) VALUES (
          $1, $2::uuid, $3, $4,
          $5::numeric, 0, 0, NOW()
        )
        ON CONFLICT (company_id, employee_id, leave_type, balance_year)
        DO UPDATE SET
          entitled_days = EXCLUDED.entitled_days,
          updated_at = NOW();
      `,
      [
        input.companyId,
        input.employeeId,
        input.leaveType,
        input.balanceYear,
        input.entitledDays,
      ],
    );
  }

  private async resolveDefaultShiftId(
    persistCompanyId: string,
    employee: EmployeeActivateRow,
    authorization?: string,
  ): Promise<string | null> {
    const activeCount = await this.attendanceCatalog.countActiveWorkShifts(
      persistCompanyId,
      authorization,
    );
    if (activeCount === 0) return null;

    const departmentId = this.readEmployeeDepartment(employee);
    const specificity = await this.loadSpecificityRows(persistCompanyId);
    const hit = pickBestSpecificityRule(specificity, {
      departmentId,
      shiftId: null,
    });
    if (hit?.shift_id) {
      const shiftKey = String(hit.shift_id).trim();
      const byRule = await this.tryResolveShiftId(shiftKey, persistCompanyId, authorization);
      if (byRule) return byRule;
    }

    const effective = await this.attendanceCatalog.listEffectiveWorkShifts(
      persistCompanyId,
      authorization,
    );
    if (effective.data.length === 0) return null;

    if (departmentId) {
      const deptNorm = departmentId.toLowerCase();
      const deptMatch = effective.data.find(
        (s) => s.department && String(s.department).trim().toLowerCase() === deptNorm,
      );
      if (deptMatch) return deptMatch.id;
    }

    return effective.data[0]?.id ?? null;
  }

  private async loadSpecificityRows(companySlug: string): Promise<SpecificityRow[]> {
    await this.attendanceConfig.ensureLatePenaltySpecificitySchema();
    const res = await this.db.query<SpecificityRow>(
      `
        SELECT id, company_id, department_id, shift_id, archived_at
        FROM public.att_attendance_rule
        WHERE company_id = $1 AND archived_at IS NULL;
      `,
      [companySlug],
    );
    return res.rows;
  }

  private async tryResolveShiftId(
    shiftKey: string,
    companyId: string,
    authorization?: string,
  ): Promise<string | null> {
    const key = shiftKey.trim();
    if (!key) return null;
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRe.test(key)) {
      try {
        const row = await this.attendanceCatalog.getWorkShiftById(key, companyId, authorization);
        return row.id;
      } catch {
        return null;
      }
    }
    const list = await this.attendanceCatalog.listEffectiveWorkShifts(companyId, authorization);
    const hit = list.data.find(
      (s) => s.code.trim().toLowerCase() === key.toLowerCase() || s.id === key,
    );
    return hit?.id ?? null;
  }

  private async insertActivateDefaultShift(
    query: (sql: string, params?: unknown[]) => Promise<{ rows: { id: string }[] }>,
    input: {
      companyId: string;
      employeeId: string;
      shiftId: string;
      departmentId: string | null;
      effectiveFromIso: string;
    },
  ): Promise<string | null> {
    const open = await query(
      `
        SELECT id FROM public.att_shift_assignment
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND source = $3
          AND effective_to IS NULL
          AND archived_at IS NULL
        LIMIT 1;
      `,
      [
        input.companyId,
        input.employeeId,
        ATT_SHIFT_ASSIGN_SOURCE_ACTIVATE_DEFAULT,
      ],
    );
    if (open.rows[0]?.id) {
      return open.rows[0].id;
    }

    try {
      const ins = await query(
        `
          INSERT INTO public.att_shift_assignment (
            company_id, employee_id, shift_id, department_id,
            effective_from, effective_to, source, updated_at
          ) VALUES (
            $1, $2::uuid, $3::uuid, $4,
            $5::date, NULL, $6, NOW()
          )
          RETURNING id;
        `,
        [
          input.companyId,
          input.employeeId,
          input.shiftId,
          input.departmentId,
          input.effectiveFromIso,
          ATT_SHIFT_ASSIGN_SOURCE_ACTIVATE_DEFAULT,
        ],
      );
      return (ins.rows[0] as { id: string } | undefined)?.id ?? null;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === '23505') {
        return null;
      }
      throw err;
    }
  }

  /**
   * F-ATT-SHIFT-02 read — open activate_default row for HCNS profile strip (ATT-12 FE-CONFIRM).
   */
  async getActivateDefaultShiftAssignment(input: {
    employeeId: string;
    companyId: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<{
    assignmentId: string;
    shiftId: string;
    shiftCode: string | null;
    shiftName: string | null;
    effectiveFrom: string;
    source: string;
  } | null> {
    await this.ensureSchema();
    const employee = await this.loadActiveEmployee(input.employeeId);
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      input.authorization,
      input.companyId ?? employee.company_id,
      { tenantId: input.tenantId },
    );
    const res = await this.db.query<{
      assignment_id: string;
      shift_id: string;
      shift_code: string | null;
      shift_name: string | null;
      effective_from: string;
      source: string;
    }>(
      `
        SELECT
          a.id AS assignment_id,
          a.shift_id,
          ws.code AS shift_code,
          ws.name AS shift_name,
          to_char(a.effective_from, 'DD/MM/YYYY') AS effective_from,
          a.source
        FROM public.att_shift_assignment a
        LEFT JOIN public.work_shifts ws ON ws.id = a.shift_id
        WHERE a.company_id = $1
          AND a.employee_id = $2::uuid
          AND a.source = $3
          AND a.effective_to IS NULL
          AND a.archived_at IS NULL
        ORDER BY a.effective_from DESC
        LIMIT 1;
      `,
      [
        persistCompanyId,
        input.employeeId,
        ATT_SHIFT_ASSIGN_SOURCE_ACTIVATE_DEFAULT,
      ],
    );
    const row = res.rows[0];
    if (!row?.assignment_id) {
      return null;
    }
    return {
      assignmentId: row.assignment_id,
      shiftId: row.shift_id,
      shiftCode: row.shift_code,
      shiftName: row.shift_name,
      effectiveFrom: row.effective_from,
      source: row.source,
    };
  }
}
