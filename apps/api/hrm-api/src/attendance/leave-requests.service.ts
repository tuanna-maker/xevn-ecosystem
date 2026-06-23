import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  normalizePayrollListCompanyId,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import type { LeaveRequestRealtimePayload } from '../realtime/hrm-realtime.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListLeaveRequestsQueryDto } from './dto/list-leave-requests.query.dto';

type LeaveRow = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string | null;
  employee_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  department: string | null;
  position: string | null;
  total_days: string;
  handover_to: string | null;
  handover_tasks: string | null;
  approver_employee_id: string | null;
  rejected_reason: string | null;
  attachment_url: string | null;
};

const LEAVE_ATTACHMENT_URL_PATTERN = /^\/api\/hrm\/files\/[a-zA-Z0-9_-]+\/.+$/;

function assertValidLeaveAttachmentUrl(url: string | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }
  if (!LEAVE_ATTACHMENT_URL_PATTERN.test(trimmed)) {
    throw new ApiException(
      'HRM-LEAVE-VAL-ATT',
      'attachment_url must be a relative path under /api/hrm/files/{company_scope}/',
      HttpStatus.BAD_REQUEST,
    );
  }
  return trimmed;
}

@Injectable()
export class LeaveRequestsService {
  constructor(
    private readonly db: HrmDbService,
    private readonly fanout: AttendanceEventFanoutService,
  ) {}

  private async ensureSchema() {
    await this.db.query(`
      ALTER TABLE public.leave_requests
      ADD COLUMN IF NOT EXISTS attachment_url TEXT NULL;
    `);
  }

  private toPayload(row: LeaveRow): LeaveRequestRealtimePayload {
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      employee_code: row.employee_code ?? '',
      employee_name: row.employee_name ?? '',
      leave_type: row.leave_type,
      start_date: row.start_date,
      end_date: row.end_date,
      total_days: Number(row.total_days ?? 1),
      reason: row.reason,
      status: row.status,
      requested_at: row.requested_at,
      reviewed_at: row.reviewed_at,
      reviewed_by: row.reviewed_by,
      rejected_reason: row.rejected_reason,
    };
  }

  async createLeaveRequest(body: CreateLeaveRequestDto) {
    await this.ensureSchema();
    if (body.start_date > body.end_date) {
      throw new ApiException(
        'HRM-LEAVE-VAL-DATES',
        'start_date must be on or before end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    const attachmentUrl = assertValidLeaveAttachmentUrl(body.attachment_url);
    const id = randomUUID();
    const res = await this.db.query<LeaveRow>(
      `
        INSERT INTO public.leave_requests (
          id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
          employee_code, employee_name, department, position, total_days, handover_to, handover_tasks,
          attachment_url, requested_at
        ) VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4, $5::date, $6::date, $7, 'pending',
          $8, $9, $10, $11, $12, $13, $14, $15, NOW()
        )
        RETURNING *;
      `,
      [
        id,
        body.company_id,
        body.employee_id,
        body.leave_type.trim(),
        body.start_date,
        body.end_date,
        body.reason?.trim() ?? null,
        body.employee_code.trim(),
        body.employee_name.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.total_days,
        body.handover_to?.trim() ?? null,
        body.handover_tasks?.trim() ?? null,
        attachmentUrl,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-500', 'Failed to create leave request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const payload = this.toPayload(row);
    await this.fanout.onLeaveRequestCreated(payload);
    return row;
  }

  async listLeaveRequests(
    query: ListLeaveRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const params: unknown[] = [];
    const filters: string[] = [];
    pushWorkforceEmployeeScopeFilter(filters, params, scope, 'lr.employee_id');
    let sql = `SELECT lr.* FROM public.leave_requests lr WHERE ${filters.join(' AND ')}`;
    if (query.status?.trim()) {
      params.push(query.status.trim());
      sql += ` AND lr.status = $${params.length}`;
    }
    if (query.employee_id) {
      params.push(query.employee_id);
      sql += ` AND lr.employee_id = $${params.length}::uuid`;
    }
    if (query.manager_employee_id) {
      params.push(query.manager_employee_id);
      sql += ` AND lr.employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id = $${params.length}::uuid AND e.archived_at IS NULL
      )`;
    }
    sql += ` ORDER BY lr.requested_at DESC LIMIT 200`;
    const res = await this.db.query<LeaveRow>(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  private async loadLeaveRequestCompany(requestId: string): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.leave_requests WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  async approveLeaveRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
    const existing = await this.loadLeaveRequestCompany(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-LEAVE-404',
      mismatchCode: 'HRM-LEAVE-409',
    });
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $2,
            approver_employee_id = COALESCE($3::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId, body.reviewer_name.trim(), body.reviewer_employee_id ?? null],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
    return row;
  }

  async rejectLeaveRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
    const existing = await this.loadLeaveRequestCompany(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-LEAVE-404',
      mismatchCode: 'HRM-LEAVE-409',
    });
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3,
            approver_employee_id = COALESCE($4::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [
        requestId,
        body.reviewer_name.trim(),
        body.rejected_reason?.trim() ?? null,
        body.reviewer_employee_id ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
    return row;
  }
}
