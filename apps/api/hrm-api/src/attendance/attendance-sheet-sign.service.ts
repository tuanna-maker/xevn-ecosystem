/**
 * @CODE-MEMORY
 * Screen:     HRM → Bảng công chờ ký / chốt (UC-BP-ATT-11)
 * UC:         UC-BP-ATT-11
 * BR:         BR-BP-TS-02 · R-SIGN-01
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-11
 * TechSpec:   TECHSPEC_HRM_ENTERPRISE.md §6.4.3–6.4.4
 * Purpose:    F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03 — ký bước WF, close/reopen; scope qua header gate.
 * WorkItem:   PO-HRM-BP-ATT-SIGN-BE-01
 * Coded:      2026-08-05
 * Callers:    attendance.controller.ts
 * Callees:    attendance_sheets · att_timesheet_sign_step (runtime DDL)
 * must_keep:  Không tự closed khi POST sign; NV employee approved trước close evaluator
 * SOLID:      Tách khỏi catalog CRUD AT-14
 * LastVerified: attendance-sheet-scope-parity.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01
 * change_mode: FIX
 * What: ensureAttendanceSheetSchema → shared bootstrap ALTER closed_at/closed_by
 * Why: POST close 500 — legacy attendance_sheets thiếu cột (QA-04 P0-CLOSE-500-SCHEMA)
 * must_keep: close evaluator BR-BP-TS-02; không fake close
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-BP-ATT-SIGN-FE-SUBMIT-01
 * change_mode: ADD
 * What: submitAttendanceSheetForSign — draft|open → submitted (F-ATT-SHEET-01 MVP status gate)
 * Why: FR-UC-BP-ATT-10 funnel · FE Gửi chờ ký · QA blocked without submitted sheets
 * must_keep: scope gate; không bypass sign ladder; full aggregate lines deferred
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * change_mode: ADD
 * What: F-ATT-SHEET-AGG-01 /aggregate + submit invokes AGG; close line_locked; reopen archive lines
 * Why:  R-PAY-F-ATT-LINE — PAY bag SELECT closed+locked hours
 * SRS:  FR-UC-BP-ATT-10/11 · API-ATT-LINE-01 §1–§2 · DATA-ATT-LINE-01 §2
 * must_keep: sign evaluator BR-BP-TS-02 · header/sign schema · soft-delete · cấm silent 0
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { HrmDbService } from '../db/hrm-db.service';
import {
  assertAttendanceSheetHeaderInScope,
  AttendanceSheetHeaderRow,
} from './attendance-sheet-scope';
import { CreateAttendanceSheetSignatureDto } from './dto/create-attendance-sheet-signature.dto';
import { ReopenAttendanceSheetDto } from './dto/reopen-attendance-sheet.dto';
import {
  ensureAttendanceSheetSchema,
  ensureAttTimesheetLineSchema,
} from './attendance-sheet-schema.bootstrap';
import {
  aggregateAttendanceSheetLines,
  archiveAttTimesheetLinesForSheet,
  lockAttTimesheetLinesForSheet,
  type AggregateSheetResult,
} from './att-timesheet-line-aggregate';

const MANDATORY_PERSONAS = ['employee', 'direct_manager', 'hr_admin'] as const;

@Injectable()
export class AttendanceSheetSignService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureAttendanceSheetSchemaLocal() {
    await ensureAttendanceSheetSchema(this.db);
  }

  /** Logical §4.6.1 — runtime until Prisma migration unlock. */
  private async ensureSignStepSchema() {
    await this.ensureAttendanceSheetSchemaLocal();
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_timesheet_sign_step (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        header_id UUID NOT NULL,
        workflow_definition_id TEXT,
        step_code TEXT NOT NULL,
        step_order INT,
        persona_role TEXT NOT NULL,
        wf_task_instance_id TEXT,
        signer_user_id TEXT NOT NULL,
        signer_employee_id UUID,
        outcome TEXT NOT NULL,
        comment TEXT,
        signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        archived_at TIMESTAMPTZ
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS att_timesheet_sign_step_header_step_active_uq
        ON public.att_timesheet_sign_step (header_id, step_code)
        WHERE archived_at IS NULL;
    `);
  }

  private async loadHeaderRow(
    sheetId: string,
  ): Promise<AttendanceSheetHeaderRow | undefined> {
    await this.ensureAttendanceSheetSchemaLocal();
    const peek = await this.db.query(
      `SELECT * FROM public.attendance_sheets WHERE id = $1::uuid LIMIT 1;`,
      [sheetId],
    );
    return peek.rows[0] as AttendanceSheetHeaderRow | undefined;
  }

  async assertHeaderInScope(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ): Promise<AttendanceSheetHeaderRow> {
    const row = await this.loadHeaderRow(sheetId);
    assertAttendanceSheetHeaderInScope(row, companyId, authorization);
    return row;
  }

  async getAttendanceSheetById(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ) {
    return this.assertHeaderInScope(sheetId, companyId, authorization);
  }

  private async listActiveSignSteps(headerId: string) {
    await this.ensureSignStepSchema();
    const res = await this.db.query(
      `SELECT * FROM public.att_timesheet_sign_step
       WHERE header_id = $1::uuid AND archived_at IS NULL
       ORDER BY step_order NULLS LAST, signed_at ASC;`,
      [headerId],
    );
    return res.rows as Array<Record<string, unknown>>;
  }

  private evaluateCanClose(steps: Array<Record<string, unknown>>): {
    can_close: boolean;
    missing_mandatory_roles: string[];
  } {
    if (steps.some((s) => String(s.outcome) === 'rejected')) {
      return {
        can_close: false,
        missing_mandatory_roles: [...MANDATORY_PERSONAS],
      };
    }
    const approvedRoles = new Set(
      steps
        .filter((s) => String(s.outcome) === 'approved')
        .map((s) => String(s.persona_role)),
    );
    const missing = MANDATORY_PERSONAS.filter(
      (role) => !approvedRoles.has(role),
    );
    return {
      can_close: missing.length === 0,
      missing_mandatory_roles: missing,
    };
  }

  async listSignatures(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ) {
    const header = await this.assertHeaderInScope(
      sheetId,
      companyId,
      authorization,
    );
    const steps = await this.listActiveSignSteps(sheetId);
    const { can_close, missing_mandatory_roles } = this.evaluateCanClose(steps);
    return {
      header_id: header.id,
      status: header.status,
      steps: steps.map((s) => ({
        step_code: s.step_code,
        persona_role: s.persona_role,
        outcome: s.outcome,
        signed_at: s.signed_at,
        signer_user_id: s.signer_user_id,
        comment: s.comment ?? null,
      })),
      missing_mandatory_roles,
      can_close,
    };
  }

  async createSignature(
    sheetId: string,
    payload: CreateAttendanceSheetSignatureDto,
    companyId: string,
    authorization?: string,
  ) {
    const header = await this.assertHeaderInScope(
      sheetId,
      companyId,
      authorization,
    );
    if (header.status === 'closed') {
      throw new ApiException(
        'HRM-ATT-SHEET-LOCKED',
        'Sheet is closed',
        HttpStatus.CONFLICT,
      );
    }
    if (header.status !== 'submitted') {
      throw new ApiException(
        'HRM-ATT-SHEET-STATE',
        'Signatures only allowed when sheet status is submitted',
        HttpStatus.CONFLICT,
      );
    }
    if (payload.outcome === 'rejected' && !payload.comment?.trim()) {
      throw new ApiException(
        'HRM-ATT-SIGN-422',
        'Comment required when rejecting',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const jwt = authorization
      ? getVerifiedInternalJwtPayload(authorization)
      : null;
    const signerUserId = String(jwt?.sub ?? 'system');

    await this.ensureSignStepSchema();
    try {
      const res = await this.db.query(
        `INSERT INTO public.att_timesheet_sign_step (
          id, company_id, header_id, workflow_definition_id, step_code, persona_role,
          wf_task_instance_id, signer_user_id, outcome, comment, signed_at
        ) VALUES ($1,$2,$3::uuid,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *;`,
        [
          randomUUID(),
          header.company_id,
          sheetId,
          payload.workflow_definition_id ?? null,
          payload.step_code,
          payload.persona_role,
          payload.wf_task_instance_id ?? null,
          signerUserId,
          payload.outcome,
          payload.comment ?? null,
        ],
      );
      const steps = await this.listActiveSignSteps(sheetId);
      const { can_close } = this.evaluateCanClose(steps);
      const row = res.rows[0];
      return {
        header_id: sheetId,
        step_code: row.step_code,
        outcome: row.outcome,
        signed_at: row.signed_at,
        signer_user_id: row.signer_user_id,
        policy_ready: can_close,
      };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === '23505') {
        throw new ApiException(
          'HRM-ATT-SIGN-DUP',
          'Active sign step already exists for this step_code',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async closeAttendanceSheet(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ) {
    const header = await this.assertHeaderInScope(
      sheetId,
      companyId,
      authorization,
    );
    if (header.status === 'closed') {
      throw new ApiException(
        'HRM-ATT-SHEET-LOCKED',
        'Sheet already closed',
        HttpStatus.CONFLICT,
      );
    }
    if (header.status !== 'submitted') {
      throw new ApiException(
        'HRM-ATT-SHEET-STATE',
        'Only submitted sheets can be closed',
        HttpStatus.CONFLICT,
      );
    }
    const steps = await this.listActiveSignSteps(sheetId);
    const { can_close } = this.evaluateCanClose(steps);
    if (!can_close) {
      throw new ApiException(
        'HRM-ATT-SIGN-INCOMPLETE',
        'Mandatory sign steps incomplete or rejected',
        HttpStatus.CONFLICT,
      );
    }

    const jwt = authorization
      ? getVerifiedInternalJwtPayload(authorization)
      : null;
    const closedBy = String(jwt?.sub ?? 'system');

    const res = await this.db.query(
      `UPDATE public.attendance_sheets SET status = 'closed', closed_at = NOW(), closed_by = $2, updated_at = NOW()
       WHERE id = $1::uuid RETURNING id, status;`,
      [sheetId, closedBy],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-AS-404',
        'Attendance sheet not found',
        HttpStatus.NOT_FOUND,
      );
    }
    // F-ATT-SHEET-02 EXPAND — PAY only trusts closed + line_locked
    const lockedCount = await lockAttTimesheetLinesForSheet(this.db, sheetId);
    return {
      sheet_id: sheetId,
      status: 'closed',
      event: 'timesheet.closed',
      line_locked_count: lockedCount,
    };
  }

  /**
   * F-ATT-SHEET-AGG-01 — explicit rebuild of att_timesheet_line (OPEN-Q2 Option C).
   */
  async aggregateAttendanceSheet(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ): Promise<AggregateSheetResult> {
    const header = await this.assertHeaderInScope(
      sheetId,
      companyId,
      authorization,
    );
    return aggregateAttendanceSheetLines(this.db, header);
  }

  /**
   * F-ATT-SHEET-01 · FR-UC-BP-ATT-10 — draft|open → submitted chờ ký.
   * OPEN-Q2: must invoke AGG before/as status→submitted.
   */
  async submitAttendanceSheetForSign(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ): Promise<{
    sheet_id: string;
    status: string;
    line_count: number;
    warnings?: string[];
  }> {
    const header = await this.assertHeaderInScope(
      sheetId,
      companyId,
      authorization,
    );
    if (header.status === 'closed') {
      throw new ApiException(
        'HRM-ATT-SHEET-LOCKED',
        'Closed sheets cannot be submitted',
        HttpStatus.CONFLICT,
      );
    }
    if (header.status === 'submitted') {
      // Idempotent re-AGG allowed while submitted (rebuild before close).
      const agg = await aggregateAttendanceSheetLines(this.db, header);
      return {
        sheet_id: sheetId,
        status: 'submitted',
        line_count: agg.line_count,
        warnings: agg.warnings,
      };
    }
    if (header.status !== 'draft' && header.status !== 'open') {
      throw new ApiException(
        'HRM-ATT-SHEET-STATE',
        'Only draft or open sheets can be submitted for sign-off',
        HttpStatus.CONFLICT,
      );
    }

    const agg = await aggregateAttendanceSheetLines(this.db, header);

    const res = await this.db.query(
      `UPDATE public.attendance_sheets SET status = 'submitted', updated_at = NOW()
       WHERE id = $1::uuid RETURNING id, status;`,
      [sheetId],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-AS-404',
        'Attendance sheet not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      sheet_id: sheetId,
      status: 'submitted',
      line_count: agg.line_count,
      warnings: agg.warnings,
    };
  }

  async reopenAttendanceSheet(
    sheetId: string,
    _payload: ReopenAttendanceSheetDto,
    companyId: string,
    authorization?: string,
  ) {
    const header = await this.assertHeaderInScope(
      sheetId,
      companyId,
      authorization,
    );
    if (header.status !== 'closed') {
      throw new ApiException(
        'HRM-ATT-SHEET-STATE',
        'Only closed sheets can be reopened',
        HttpStatus.CONFLICT,
      );
    }
    await this.ensureSignStepSchema();
    await this.db.query(
      `UPDATE public.att_timesheet_sign_step SET archived_at = NOW(), updated_at = NOW()
       WHERE header_id = $1::uuid AND archived_at IS NULL;`,
      [sheetId],
    );
    // F-ATT-SHEET-03 — archive lines; next AGG/submit regenerates
    const archivedLines = await archiveAttTimesheetLinesForSheet(
      this.db,
      sheetId,
    );
    const res = await this.db.query(
      `UPDATE public.attendance_sheets SET status = 'submitted', closed_at = NULL, closed_by = NULL, updated_at = NOW()
       WHERE id = $1::uuid RETURNING id, status;`,
      [sheetId],
    );
    return {
      sheet_id: res.rows[0]?.id ?? sheetId,
      status: res.rows[0]?.status ?? 'submitted',
      lines_archived: archivedLines,
    };
  }

  /**
   * F-PAY-ATT-CLOSED-01 — read-only att_timesheet_line for payroll draft preview (no AGG rewrite).
   */
  async listAttendanceSheetLines(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ): Promise<{
    sheet_id: string;
    status: string;
    items: Array<{
      employee_id: string;
      standard_hours: number;
      ot_hours_weighted: number;
      paid_leave_hours: number;
      unpaid_leave_hours: number;
      payable_hours: number;
      work_days: number | null;
      line_locked: boolean;
    }>;
  }> {
    const header = await this.assertHeaderInScope(
      sheetId,
      companyId,
      authorization,
    );
    await this.ensureAttendanceSheetSchemaLocal();
    await ensureAttTimesheetLineSchema(this.db);

    const res = await this.db.query<{
      employee_id: string;
      standard_hours: string;
      ot_hours_weighted: string;
      paid_leave_hours: string;
      unpaid_leave_hours: string;
      payable_hours: string;
      work_days: string | null;
      line_locked: boolean;
    }>(
      `
        SELECT
          employee_id::text AS employee_id,
          standard_hours::text AS standard_hours,
          ot_hours_weighted::text AS ot_hours_weighted,
          paid_leave_hours::text AS paid_leave_hours,
          unpaid_leave_hours::text AS unpaid_leave_hours,
          payable_hours::text AS payable_hours,
          work_days::text AS work_days,
          line_locked
        FROM public.att_timesheet_line
        WHERE header_id = $1::uuid
          AND archived_at IS NULL
        ORDER BY employee_id ASC;
      `,
      [sheetId],
    );

    const toHours = (value: string | null | undefined): number => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    return {
      sheet_id: sheetId,
      status: String(header.status ?? ''),
      items: res.rows.map((row) => ({
        employee_id: row.employee_id,
        standard_hours: toHours(row.standard_hours),
        ot_hours_weighted: toHours(row.ot_hours_weighted),
        paid_leave_hours: toHours(row.paid_leave_hours),
        unpaid_leave_hours: toHours(row.unpaid_leave_hours),
        payable_hours: toHours(row.payable_hours),
        work_days:
          row.work_days != null && row.work_days !== ''
            ? toHours(row.work_days)
            : null,
        line_locked: Boolean(row.line_locked),
      })),
    };
  }
}
