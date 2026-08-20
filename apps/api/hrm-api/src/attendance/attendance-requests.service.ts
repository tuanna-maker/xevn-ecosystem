/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Đơn từ (OT/BT/LE/SC)
 * UC:         HRM-AT-10 · ATT-C4
 * SRS:        docs/hrm/SRS.md · FR-HRM-AT-10 · TECHSPEC §14.4–14.5
 * Purpose:    OT/BT/late-early/shift-change TXN list/create/decide với scope TEXT slug.
 * WorkItem:    PO-MFD-M2-ATT-SCOPE-01
 * must_keep:   U78 update-requests pattern; normalizePayrollListCompanyId on list/decide
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 · PO-MFD-M2-ATT-SCOPE-01 · FIX
 * What: normalizePayrollListCompanyId on OT list/decide/delete; create OT nhận resolvedCompanyId từ controller.
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01
 * change_mode: FIX
 * What: createShiftChangeRequest asserts current_shift/requested_shift ∈ Nest work_shifts
 *       when active>0 → HRM-ATT-SHIFT-KEY (VAL-ATT-SHIFT-CNS-01 · AC-01b).
 * Why: BA Option B deepen · admin≠consumer · empty active skip · no seed
 * must_keep: OT no invent KEY · Settings/shifts REF · ATT-CODE/leave/worksite seals · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
 * change_mode: ADD
 * What: createOvertimeRequest asserts overtime_type ∈ Nest att_ot_type EFF when >0
 *       → HRM-ATT-OT-TYPE-KEY (VAL-ATT-OT-CNS-01 · AC-PLT-ATT-OT-01b); EFF=0 soft-skip.
 * Why: BA+DATA CONFIRMED Option B · admin≠consumer · DTO remain open string · no seed
 * must_keep: approve path no type re-assert · leave/code/worksite/shifts seals · formula HOLD · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01
 * change_mode: ADD
 * What: createOvertimeRequest asserts compensation_type ∈ Nest att_ot_comp_type EFF when >0
 *       → HRM-ATT-OT-COMP-KEY (VAL-ATT-COMP-CNS-01 · AC-PLT-ATT-COMP-01b); EFF=0 soft-skip.
 * Why: BA+DATA CONFIRMED Option B · orthogonal vs overtime_type (att_ot_type SEAL) · no seed
 * must_keep: KEEP overtime_requests.compensation_type TEXT soft key · approve path no re-assert ·
 *            att_ot_type / leave / code / worksite / shifts seals · payroll formula HOLD · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01
 * change_mode: ADD
 * What: approveOvertimeRequest → F-ATT-OT-COMP-ACCRUE when policy ON + comp maps leave;
 *       idempotent replay when OT already approved; ≠ sheet close trigger.
 * Why:  API-01 §4.6/§4.9 · DATA §5.2 · SRS FR-UC-BP-ATT-06 Diễn biến #1
 * must_keep: pending_days hold RETAIN · DENY att_leave_hold · DENY merge buckets
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  type HrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { AttOtTypeService } from './att-ot-type.service';
import { AttOtCompTypeService } from './att-ot-comp-type.service';
import {
  AttOtCompLeavePolicyService,
  type OtCompAccrualResult,
} from './att-ot-comp-leave-policy.service';
import { CreateBusinessTripRequestDto } from './dto/create-business-trip-request.dto';
import { CreateLateEarlyRequestDto } from './dto/create-late-early-request.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
import { CreateShiftChangeRequestDto } from './dto/create-shift-change-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListAttendanceRequestsQueryDto } from './dto/list-attendance-requests.query.dto';

type ScopedRow = { company_id: string };

@Injectable()
export class AttendanceRequestsService {
  constructor(
    private readonly db: HrmDbService,
    /** F-ATT-CAT-SHIFT — optional for legacy specs; production injects AttendanceCatalogService. */
    @Optional() private readonly attendanceCatalog?: AttendanceCatalogService,
    /** F-ATT-CAT-OT — optional for legacy specs; production injects AttOtTypeService. */
    @Optional() private readonly attOtTypeCatalog?: AttOtTypeService,
    /** F-ATT-CAT-OTC — optional for legacy specs; production injects AttOtCompTypeService. */
    @Optional() private readonly attOtCompTypeCatalog?: AttOtCompTypeService,
    /** F-ATT-OT-COMP-POLICY / ACCRUE — optional for legacy specs. */
    @Optional()
    private readonly attOtCompLeavePolicy?: AttOtCompLeavePolicyService,
  ) {}

  async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.overtime_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        overtime_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_hours NUMERIC NOT NULL DEFAULT 0,
        overtime_type TEXT NOT NULL DEFAULT 'weekday',
        coefficient NUMERIC DEFAULT 1.5,
        reason TEXT NOT NULL,
        compensation_type TEXT DEFAULT 'salary',
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        actual_hours NUMERIC,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.business_trip_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        destination TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days NUMERIC NOT NULL DEFAULT 1,
        purpose TEXT NOT NULL,
        transportation TEXT DEFAULT 'company_car',
        accommodation TEXT,
        estimated_cost NUMERIC DEFAULT 0,
        advance_amount NUMERIC DEFAULT 0,
        companions TEXT,
        contact_info TEXT,
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        actual_cost NUMERIC,
        expense_report_url TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.late_early_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        request_date DATE NOT NULL,
        request_type TEXT NOT NULL DEFAULT 'late',
        late_time TIME,
        late_minutes INTEGER DEFAULT 0,
        early_time TIME,
        early_minutes INTEGER DEFAULT 0,
        reason TEXT NOT NULL,
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.shift_change_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT,
        position TEXT,
        change_date DATE NOT NULL,
        change_type TEXT NOT NULL DEFAULT 'change',
        current_shift TEXT NOT NULL,
        current_shift_time TEXT,
        requested_shift TEXT NOT NULL,
        requested_shift_time TEXT,
        swap_with_employee_id UUID,
        swap_with_employee_name TEXT,
        swap_with_employee_code TEXT,
        reason TEXT NOT NULL,
        approver_id UUID,
        approver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private buildListSql(
    table: string,
    alias: string,
    scope: HrmListScope,
    query: ListAttendanceRequestsQueryDto,
  ): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const filters: string[] = [];
    if (scope.masterTenantPartition || scope.memberTenantId) {
      pushWorkforceEmployeeScopeFilter(
        filters,
        params,
        scope,
        `${alias}.employee_id`,
      );
    } else {
      pushCompanyIdFilter(filters, params, scope.companyIds);
    }
    let sql = `SELECT ${alias}.* FROM public.${table} ${alias} WHERE ${filters.join(' AND ')}`;
    if (query.status?.trim()) {
      params.push(query.status.trim());
      sql += ` AND ${alias}.status = $${params.length}`;
    }
    if (query.employee_id) {
      params.push(query.employee_id);
      sql += ` AND ${alias}.employee_id = $${params.length}::uuid`;
    }
    sql += ` ORDER BY ${alias}.created_at DESC LIMIT 200`;
    return { sql, params };
  }

  private async loadCompanyId(
    table: string,
    requestId: string,
  ): Promise<ScopedRow | null> {
    const res = await this.db.query<ScopedRow>(
      `SELECT company_id FROM public.${table} WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  private async decideRequest(
    table: string,
    requestId: string,
    decision: 'approved' | 'rejected',
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    const existing = await this.loadCompanyId(table, requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ATT-REQ-404',
      mismatchCode: 'HRM-ATT-REQ-409',
    });
    const res = await this.db.query(
      `
        UPDATE public.${table}
        SET status = $2,
            approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
            rejected_reason = $3,
            approver_name = COALESCE($4, approver_name),
            updated_at = NOW()
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [
        requestId,
        decision,
        decision === 'rejected' ? (body.rejected_reason?.trim() ?? null) : null,
        body.reviewer_name.trim(),
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance request not found or not pending',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  private async deleteRequest(
    table: string,
    requestId: string,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    const existing = await this.loadCompanyId(table, requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-ATT-REQ-404',
      mismatchCode: 'HRM-ATT-REQ-409',
    });
    const res = await this.db.query(
      `DELETE FROM public.${table} WHERE id = $1::uuid RETURNING id;`,
      [requestId],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance request not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: requestId, deleted: true };
  }

  async listOvertimeRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      query.company_id,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    const { sql, params } = this.buildListSql(
      'overtime_requests',
      'ot',
      scope,
      query,
    );
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createOvertimeRequest(
    body: CreateOvertimeRequestDto,
    authorization?: string,
    resolvedCompanyId?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.company_id ?? resolvedCompanyId,
    );
    // VAL-ATT-OT-CNS-01 — invent KEY when Nest EFF>0; skip when empty (01c · U65).
    let overtimeType = body.overtime_type.trim();
    let coefficient = body.coefficient ?? 1.5;
    if (this.attOtTypeCatalog) {
      const hit = await this.attOtTypeCatalog.assertOtTypeInEffectiveCatalog({
        companyId,
        overtimeType: body.overtime_type,
        authorization,
      });
      if (hit) {
        overtimeType = hit.code;
        if (body.coefficient === undefined) {
          coefficient = hit.defaultCoeff;
        }
      }
    }
    // VAL-ATT-COMP-CNS-01 — compensation_type invent KEY when Nest EFF>0; skip empty (01c · U65).
    // KEEP overtime_requests.compensation_type TEXT soft key; orthogonal vs overtime_type.
    let compensationType = body.compensation_type?.trim() || 'salary';
    if (this.attOtCompTypeCatalog) {
      const compHit =
        await this.attOtCompTypeCatalog.assertCompTypeInEffectiveCatalog({
          companyId,
          compensationType,
          authorization,
        });
      if (compHit) {
        compensationType = compHit.code;
      }
    }
    const id = randomUUID();
    const res = await this.db.query(
      `
        INSERT INTO public.overtime_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          overtime_date, start_time, end_time, total_hours, overtime_type, coefficient,
          reason, compensation_type, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8::date, $9::time, $10::time, $11, $12, $13,
          $14, $15, $16, 'pending'
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.employee_id,
        body.employee_code.trim(),
        body.employee_name.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.overtime_date,
        body.start_time,
        body.end_time,
        body.total_hours,
        overtimeType,
        coefficient,
        body.reason.trim(),
        compensationType,
        body.approver_name?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-OT-500',
        'Failed to create overtime request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return row;
  }

  async approveOvertimeRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    const loaded = await this.db.query(
      `
        SELECT id, company_id, employee_id, status, total_hours, compensation_type, overtime_date
        FROM public.overtime_requests
        WHERE id = $1::uuid
        LIMIT 1;
      `,
      [requestId],
    );
    const before = loaded.rows[0] as
      | {
          id: string;
          company_id: string;
          employee_id: string;
          status: string;
          total_hours: string | number;
          compensation_type: string | null;
          overtime_date: string | Date | null;
        }
      | undefined;
    if (!before) {
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance request not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope({ company_id: before.company_id }, scope, {
      notFoundCode: 'HRM-ATT-REQ-404',
      mismatchCode: 'HRM-ATT-REQ-409',
    });

    let row = before;
    let accrual: OtCompAccrualResult | null | undefined;

    if (before.status === 'approved') {
      accrual = this.attOtCompLeavePolicy
        ? await this.attOtCompLeavePolicy.accrueOnApprovedOvertime(before)
        : null;
      return this.mapOvertimeApproveResponse(row, accrual);
    }

    if (before.status !== 'pending') {
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance request not found or not pending',
        HttpStatus.NOT_FOUND,
      );
    }

    row = (await this.decideRequest(
      'overtime_requests',
      requestId,
      'approved',
      body,
      companyId,
      authorization,
      tenantId,
    )) as typeof before;

    if (this.attOtCompLeavePolicy) {
      accrual = await this.attOtCompLeavePolicy.accrueOnApprovedOvertime({
        ...row,
        status: 'approved',
      });
    }

    return this.mapOvertimeApproveResponse(row, accrual);
  }

  private mapOvertimeApproveResponse(
    row: Record<string, unknown>,
    accrual?: OtCompAccrualResult | null,
  ) {
    if (!accrual) {
      return row;
    }
    return {
      ...row,
      accrual: {
        credited_days: accrual.credited_days,
        balance_year: accrual.balance_year,
        ledger_id: accrual.ledger_id,
        idempotent_replay: accrual.idempotent_replay,
      },
    };
  }

  rejectOvertimeRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest(
      'overtime_requests',
      requestId,
      'rejected',
      body,
      companyId,
      authorization,
      tenantId,
    );
  }

  deleteOvertimeRequest(
    requestId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.deleteRequest(
      'overtime_requests',
      requestId,
      companyId,
      authorization,
      tenantId,
    );
  }

  async listBusinessTripRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const { sql, params } = this.buildListSql(
      'business_trip_requests',
      'bt',
      scope,
      query,
    );
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createBusinessTripRequest(
    body: CreateBusinessTripRequestDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    if (body.start_date > body.end_date) {
      throw new ApiException(
        'HRM-BT-VAL-DATES',
        'start_date must be on or before end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.company_id,
    );
    const id = randomUUID();
    const res = await this.db.query(
      `
        INSERT INTO public.business_trip_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          destination, start_date, end_date, total_days, purpose, transportation, accommodation,
          estimated_cost, advance_amount, companions, contact_info, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8, $9::date, $10::date, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, 'pending'
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.employee_id,
        body.employee_code.trim(),
        body.employee_name.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.destination.trim(),
        body.start_date,
        body.end_date,
        body.total_days,
        body.purpose.trim(),
        body.transportation?.trim() ?? 'company_car',
        body.accommodation?.trim() ?? null,
        body.estimated_cost ?? 0,
        body.advance_amount ?? 0,
        body.companions?.trim() ?? null,
        body.contact_info?.trim() ?? null,
        body.approver_name?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-BT-500',
        'Failed to create business trip request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return row;
  }

  approveBusinessTripRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest(
      'business_trip_requests',
      requestId,
      'approved',
      body,
      companyId,
      authorization,
      tenantId,
    );
  }

  rejectBusinessTripRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest(
      'business_trip_requests',
      requestId,
      'rejected',
      body,
      companyId,
      authorization,
      tenantId,
    );
  }

  deleteBusinessTripRequest(
    requestId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.deleteRequest(
      'business_trip_requests',
      requestId,
      companyId,
      authorization,
      tenantId,
    );
  }

  async listLateEarlyRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const { sql, params } = this.buildListSql(
      'late_early_requests',
      'le',
      scope,
      query,
    );
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createLateEarlyRequest(
    body: CreateLateEarlyRequestDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.company_id,
    );
    const id = randomUUID();
    const res = await this.db.query(
      `
        INSERT INTO public.late_early_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          request_date, request_type, late_time, late_minutes, early_time, early_minutes,
          reason, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8::date, $9, $10::time, $11, $12::time, $13,
          $14, $15, 'pending'
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.employee_id,
        body.employee_code.trim(),
        body.employee_name.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.request_date,
        body.request_type.trim(),
        body.late_time ?? null,
        body.late_minutes ?? 0,
        body.early_time ?? null,
        body.early_minutes ?? 0,
        body.reason.trim(),
        body.approver_name?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-LE-500',
        'Failed to create late/early request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return row;
  }

  approveLateEarlyRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest(
      'late_early_requests',
      requestId,
      'approved',
      body,
      companyId,
      authorization,
      tenantId,
    );
  }

  rejectLateEarlyRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest(
      'late_early_requests',
      requestId,
      'rejected',
      body,
      companyId,
      authorization,
      tenantId,
    );
  }

  deleteLateEarlyRequest(
    requestId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.deleteRequest(
      'late_early_requests',
      requestId,
      companyId,
      authorization,
      tenantId,
    );
  }

  async listShiftChangeRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const { sql, params } = this.buildListSql(
      'shift_change_requests',
      'sc',
      scope,
      query,
    );
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createShiftChangeRequest(
    body: CreateShiftChangeRequestDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.company_id,
    );
    // VAL-ATT-SHIFT-CNS-01 — invent KEY when Nest active>0; skip when empty (01c · U65).
    if (this.attendanceCatalog) {
      await this.attendanceCatalog.assertShiftKeysForConsumer({
        companyId,
        currentShift: body.current_shift,
        requestedShift: body.requested_shift,
        authorization,
      });
    }
    const id = randomUUID();
    const res = await this.db.query(
      `
        INSERT INTO public.shift_change_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          change_date, change_type, current_shift, current_shift_time, requested_shift,
          requested_shift_time, swap_with_employee_id, swap_with_employee_name,
          swap_with_employee_code, reason, approver_name, status
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6, $7,
          $8::date, $9, $10, $11, $12,
          $13, $14::uuid, $15, $16,
          $17, $18, 'pending'
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.employee_id,
        body.employee_code.trim(),
        body.employee_name.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.change_date,
        body.change_type.trim(),
        body.current_shift.trim(),
        body.current_shift_time?.trim() ?? null,
        body.requested_shift.trim(),
        body.requested_shift_time?.trim() ?? null,
        body.swap_with_employee_id ?? null,
        body.swap_with_employee_name?.trim() ?? null,
        body.swap_with_employee_code?.trim() ?? null,
        body.reason.trim(),
        body.approver_name?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-SC-500',
        'Failed to create shift change request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return row;
  }

  approveShiftChangeRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest(
      'shift_change_requests',
      requestId,
      'approved',
      body,
      companyId,
      authorization,
      tenantId,
    );
  }

  rejectShiftChangeRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest(
      'shift_change_requests',
      requestId,
      'rejected',
      body,
      companyId,
      authorization,
      tenantId,
    );
  }

  deleteShiftChangeRequest(
    requestId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.deleteRequest(
      'shift_change_requests',
      requestId,
      companyId,
      authorization,
      tenantId,
    );
  }
}
