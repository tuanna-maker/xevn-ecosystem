import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  type HrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateBusinessTripRequestDto } from './dto/create-business-trip-request.dto';
import { CreateLateEarlyRequestDto } from './dto/create-late-early-request.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
import { CreateShiftChangeRequestDto } from './dto/create-shift-change-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListAttendanceRequestsQueryDto } from './dto/list-attendance-requests.query.dto';

type ScopedRow = { company_id: string };

@Injectable()
export class AttendanceRequestsService {
  constructor(private readonly db: HrmDbService) {}

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
      pushWorkforceEmployeeScopeFilter(filters, params, scope, `${alias}.employee_id`);
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

  private async loadCompanyId(table: string, requestId: string): Promise<ScopedRow | null> {
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
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
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
        decision === 'rejected' ? body.rejected_reason?.trim() ?? null : null,
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
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
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
      throw new ApiException('HRM-ATT-REQ-404', 'Attendance request not found', HttpStatus.NOT_FOUND);
    }
    return { id: requestId, deleted: true };
  }

  async listOvertimeRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const { sql, params } = this.buildListSql('overtime_requests', 'ot', scope, query);
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createOvertimeRequest(body: CreateOvertimeRequestDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.company_id);
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
        body.overtime_type.trim(),
        body.coefficient ?? 1.5,
        body.reason.trim(),
        body.compensation_type?.trim() ?? 'salary',
        body.approver_name?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-OT-500', 'Failed to create overtime request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return row;
  }

  approveOvertimeRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest('overtime_requests', requestId, 'approved', body, companyId, authorization, tenantId);
  }

  rejectOvertimeRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest('overtime_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
  }

  deleteOvertimeRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string) {
    return this.deleteRequest('overtime_requests', requestId, companyId, authorization, tenantId);
  }

  async listBusinessTripRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const { sql, params } = this.buildListSql('business_trip_requests', 'bt', scope, query);
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createBusinessTripRequest(body: CreateBusinessTripRequestDto, authorization?: string) {
    await this.ensureSchema();
    if (body.start_date > body.end_date) {
      throw new ApiException(
        'HRM-BT-VAL-DATES',
        'start_date must be on or before end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.company_id);
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
      throw new ApiException('HRM-BT-500', 'Failed to create business trip request', HttpStatus.INTERNAL_SERVER_ERROR);
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
    return this.decideRequest('business_trip_requests', requestId, 'approved', body, companyId, authorization, tenantId);
  }

  rejectBusinessTripRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest('business_trip_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
  }

  deleteBusinessTripRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string) {
    return this.deleteRequest('business_trip_requests', requestId, companyId, authorization, tenantId);
  }

  async listLateEarlyRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const { sql, params } = this.buildListSql('late_early_requests', 'le', scope, query);
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createLateEarlyRequest(body: CreateLateEarlyRequestDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.company_id);
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
      throw new ApiException('HRM-LE-500', 'Failed to create late/early request', HttpStatus.INTERNAL_SERVER_ERROR);
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
    return this.decideRequest('late_early_requests', requestId, 'approved', body, companyId, authorization, tenantId);
  }

  rejectLateEarlyRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest('late_early_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
  }

  deleteLateEarlyRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string) {
    return this.deleteRequest('late_early_requests', requestId, companyId, authorization, tenantId);
  }

  async listShiftChangeRequests(
    query: ListAttendanceRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const { sql, params } = this.buildListSql('shift_change_requests', 'sc', scope, query);
    const res = await this.db.query(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  async createShiftChangeRequest(body: CreateShiftChangeRequestDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.company_id);
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
      throw new ApiException('HRM-SC-500', 'Failed to create shift change request', HttpStatus.INTERNAL_SERVER_ERROR);
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
    return this.decideRequest('shift_change_requests', requestId, 'approved', body, companyId, authorization, tenantId);
  }

  rejectShiftChangeRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.decideRequest('shift_change_requests', requestId, 'rejected', body, companyId, authorization, tenantId);
  }

  deleteShiftChangeRequest(requestId: string, companyId: string, authorization?: string, tenantId?: string) {
    return this.deleteRequest('shift_change_requests', requestId, companyId, authorization, tenantId);
  }
}
