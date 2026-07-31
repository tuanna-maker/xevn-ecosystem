/**
 * @CODE-MEMORY
 * Screen:     /hrm/operations · Công việc vận hành + báo cáo tổng hợp (OP-01..04)
 * UC:         HRM-OP-01 · HRM-OP-02 · HRM-OP-03 · HRM-OP-04
 * BR:         DATA_LINKAGE §6 · G-OP-PLANE-01 (UUID persist + slug wire)
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.45–3.48 · FR-HRM-OP-01..04
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 · docs/hrm/DB_DESIGN_HRM_OPERATIONS.md ·
 *             docs/hrm/API_DESIGN_HRM_OPERATIONS.md
 * Purpose:    CRUD công việc/YCDV trên company_id UUID (Plane B′ map); OP-04 summary đếm
 *             đa bảng — UUID (tasks/SR) + TEXT (payroll/recruitment) + workforce ATT.
 * WorkItem:   D-HRM-OP-DUAL-PLANE-GUARD-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - operations.controller.ts → createTask/listTasks/getSummary/…
 *
 * Callees:
 *   - resolveHrmOperationsPersistCompanyId / pushCompanyIdUuidFilter / resolveHrmListScope
 *   - HrmDbService.query → public.hrm_tasks · public.service_requests (+ cite ATT/Payroll/Rec)
 *
 * BE-Chain:
 *   POST tasks → resolveHrmOperationsPersistCompanyId(slug) → INSERT hrm_tasks.company_id UUID
 *   GET list/summary → resolveHrmListScope → pushCompanyIdUuidFilter (fail-closed LE)
 *   OP-04 getSummary → countByScope mix: company_uuid | company_text | workforce
 *
 * Impact:     Sai plane → LE UUID list/summary trả 0 giả; đếm lệch TEXT vs UUID modules
 * must_keep:  Soft employee_id SR; empty zeros honesty; Fleet TEXT; CO-HC không đụng;
 *             slug→map UUID happy path; U65 no seed
 * SOLID:      Service owns schema ensure + scope; DTO/controller thin
 * LastVerified: operations/be-hrm-op-dual-plane-guard-01.spec.ts · operations.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-OP-DUAL-PLANE-GUARD-01
 * change_mode: ADD
 * What: Document OP-04 UUID vs TEXT module mix; rely on shared HRM-PLANE-409 anti-join LE.
 * Why:  Audit P1 — cấm silent fake 0 khi company_id là XBOS LE UUID.
 * SRS:  FR-HRM-OP-04 #4/#5/#7
 * TechSpec: API_DESIGN_HRM_OPERATIONS §D · DB_DESIGN §3 reports aggregate
 * must_keep: Happy slug path; ATT/Payroll/Recruitment DDL cite; Admin/Fleet GWC
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertHrmMappedCompanyUuidOrThrow,
  assertResourceInHrmScope,
  isHrmMappedCompanyUuid,
  pushCompanyIdFilter,
  pushCompanyIdUuidFilter,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmOperationsPersistCompanyId,
  type HrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { ServiceRequestRealtimePayload } from '../realtime/hrm-realtime.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideServiceRequestDto } from './dto/decide-service-request.dto';
import { ListServiceRequestsQueryDto } from './dto/list-service-requests.query.dto';
import { ListTasksQueryDto } from './dto/list-tasks.query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

type TaskRow = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

type ServiceRequestRow = {
  id: string;
  company_id: string;
  service_type: string;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  request_date: string;
  status: string;
  notes: string | null;
  meal_type: string | null;
  meal_date: string | null;
  meal_quantity: number | null;
  vehicle_purpose: string | null;
  vehicle_destination: string | null;
  vehicle_date: string | null;
  vehicle_time_start: string | null;
  vehicle_time_end: string | null;
  vehicle_passengers: number | null;
  supply_items: unknown;
  supply_urgency: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
};

/** MP-14 mobile parity — `request_type` mirrors canonical `service_type`. */
export type ServiceRequestResponse = ServiceRequestRow & { request_type: string };

export function mapServiceRequestRow(row: ServiceRequestRow): ServiceRequestResponse {
  return { ...row, request_type: row.service_type };
}

@Injectable()
export class OperationsService {
  constructor(
    private readonly db: HrmDbService,
    private readonly fanout: AttendanceEventFanoutService,
  ) {}

  /**
   * Fail-closed when wire `company_id` is a UUID outside Plane B′ map (XBOS LE).
   * Slugs (`holding`/`main`/…) pass through — map happens on persist / UUID filter.
   */
  private assertOperationsCompanyWire(requestedCompanyId: string): void {
    const trimmed = requestedCompanyId.trim();
    // UUID shape but not mapped → LE / unknown; reject before list/summary counts.
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)) {
      if (!isHrmMappedCompanyUuid(trimmed)) {
        assertHrmMappedCompanyUuidOrThrow(trimmed);
      }
    }
  }

  private toServiceRequestRealtimePayload(row: ServiceRequestRow): ServiceRequestRealtimePayload {
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      employee_code: row.employee_code,
      service_type: row.service_type,
      request_date: row.request_date,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      approved_by: row.approved_by,
      approved_at: row.approved_at,
      rejected_reason: row.rejected_reason,
    };
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_tasks (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        title TEXT NOT NULL,
        description TEXT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        due_date DATE NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_task_priority CHECK (priority IN ('low', 'medium', 'high')),
        CONSTRAINT chk_hrm_task_status CHECK (status IN ('todo', 'in_progress', 'done', 'blocked'))
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.service_requests (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        service_type TEXT NOT NULL,
        employee_id UUID NULL,
        employee_name TEXT NOT NULL,
        employee_code TEXT NULL,
        department TEXT NULL,
        request_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT NULL,
        meal_type TEXT NULL,
        meal_date DATE NULL,
        meal_quantity INT NULL,
        vehicle_purpose TEXT NULL,
        vehicle_destination TEXT NULL,
        vehicle_date DATE NULL,
        vehicle_time_start TEXT NULL,
        vehicle_time_end TEXT NULL,
        vehicle_passengers INT NULL,
        supply_items JSONB NULL,
        supply_urgency TEXT NULL,
        approved_by TEXT NULL,
        approved_at TIMESTAMPTZ NULL,
        rejected_reason TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_service_requests_company_status
      ON public.service_requests (company_id, status, created_at DESC);
    `);
  }

  async createTask(payload: CreateTaskDto, authorization?: string, tenantId?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmOperationsPersistCompanyId(authorization, payload.company_id, { tenantId });
    const res = await this.db.query<TaskRow>(
      `INSERT INTO public.hrm_tasks
        (id, company_id, title, description, priority, status, due_date)
       VALUES ($1, $2::uuid, $3, $4, $5, 'todo', $6::date)
       RETURNING id, company_id, title, description, priority, status, due_date, created_at, updated_at;`,
      [randomUUID(), companyId, payload.title.trim(), payload.description?.trim() ?? null, payload.priority, payload.due_date ?? null],
    );
    return res.rows[0];
  }

  async listTasks(query: ListTasksQueryDto, authorization?: string, tenantId?: string) {
    await this.ensureSchema();
    this.assertOperationsCompanyWire(query.company_id);
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdUuidFilter(filters, values, scope.companyIds);
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const offset = (page - 1) * pageSize;
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.hrm_tasks ${whereClause};`,
      values,
    );
    const listValues = [...values, pageSize, offset];
    const res = await this.db.query<TaskRow>(
      `SELECT id, company_id, title, description, priority, status, due_date, created_at, updated_at
       FROM public.hrm_tasks
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${listValues.length - 1} OFFSET $${listValues.length};`,
      listValues,
    );
    return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
  }

  private guardUuidResourceMutate(
    resource: { company_id?: string | null } | null | undefined,
    authorization: string | undefined,
    requestedCompanyId: string,
    tenantId: string | undefined,
    codes: { notFound: string; mismatch: string },
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
    assertResourceInHrmScope(resource, scope, {
      notFoundCode: codes.notFound,
      mismatchCode: codes.mismatch,
    });
  }

  private async loadTaskCompanyRow(taskId: string): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.hrm_tasks WHERE id = $1::uuid LIMIT 1;`,
      [taskId],
    );
    return res.rows[0] ?? null;
  }

  private async loadServiceRequestCompanyRow(requestId: string): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.service_requests WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  async updateTaskStatus(
    taskId: string,
    payload: UpdateTaskStatusDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadTaskCompanyRow(taskId);
    this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-OPS-404',
      mismatch: 'HRM-OPS-409',
    });
    const res = await this.db.query<TaskRow>(
      `UPDATE public.hrm_tasks
       SET status = $1, updated_at = NOW()
       WHERE id = $2::uuid
       RETURNING id, company_id, title, description, priority, status, due_date, created_at, updated_at;`,
      [payload.status, taskId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-OPS-404', 'Task not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  async createServiceRequest(payload: CreateServiceRequestDto, authorization?: string, tenantId?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmOperationsPersistCompanyId(authorization, payload.company_id, { tenantId });
    const res = await this.db.query<ServiceRequestRow>(
      `
        INSERT INTO public.service_requests (
          id, company_id, service_type, employee_id, employee_name, employee_code, department,
          request_date, status, notes, meal_type, meal_date, meal_quantity,
          vehicle_purpose, vehicle_destination, vehicle_date, vehicle_time_start, vehicle_time_end,
          vehicle_passengers, supply_items, supply_urgency
        ) VALUES (
          $1, $2::uuid, $3, $4::uuid, $5, $6, $7,
          $8::date, 'pending', $9, $10, $11::date, $12,
          $13, $14, $15::date, $16, $17,
          $18, $19::jsonb, $20
        )
        RETURNING *;
      `,
      [
        randomUUID(),
        companyId,
        payload.service_type.trim(),
        payload.employee_id ?? null,
        payload.employee_name.trim(),
        payload.employee_code?.trim() ?? null,
        payload.department?.trim() ?? null,
        payload.request_date,
        payload.notes?.trim() ?? null,
        payload.meal_type?.trim() ?? null,
        payload.meal_date ?? null,
        payload.meal_quantity ? Number(payload.meal_quantity) : null,
        payload.vehicle_purpose?.trim() ?? null,
        payload.vehicle_destination?.trim() ?? null,
        payload.vehicle_date ?? null,
        payload.vehicle_time_start?.trim() ?? null,
        payload.vehicle_time_end?.trim() ?? null,
        payload.vehicle_passengers ? Number(payload.vehicle_passengers) : null,
        payload.supply_items ?? null,
        payload.supply_urgency?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-OPS-500', 'Failed to create service request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.fanout.onServiceRequestCreated(this.toServiceRequestRealtimePayload(row));
    return mapServiceRequestRow(row);
  }

  async listServiceRequests(query: ListServiceRequestsQueryDto, authorization?: string, tenantId?: string) {
    await this.ensureSchema();
    this.assertOperationsCompanyWire(query.company_id);
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const clauses: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdUuidFilter(clauses, values, scope.companyIds);
    if (query.service_type) {
      values.push(query.service_type);
      clauses.push(`service_type = $${values.length}`);
    }
    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const res = await this.db.query<ServiceRequestRow>(
      `
        SELECT * FROM public.service_requests
        ${whereClause}
        ORDER BY created_at DESC;
      `,
      values,
    );
    return res.rows.map(mapServiceRequestRow);
  }

  async updateServiceRequest(
    requestId: string,
    payload: UpdateServiceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadServiceRequestCompanyRow(requestId);
    this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-SVC-404',
      mismatch: 'HRM-SVC-409',
    });
    const res = await this.db.query<ServiceRequestRow>(
      `
        UPDATE public.service_requests
        SET
          status = COALESCE($1, status),
          notes = COALESCE($2, notes),
          meal_type = COALESCE($3, meal_type),
          meal_date = COALESCE($4::date, meal_date),
          meal_quantity = COALESCE($5, meal_quantity),
          vehicle_purpose = COALESCE($6, vehicle_purpose),
          vehicle_destination = COALESCE($7, vehicle_destination),
          vehicle_date = COALESCE($8::date, vehicle_date),
          vehicle_time_start = COALESCE($9, vehicle_time_start),
          vehicle_time_end = COALESCE($10, vehicle_time_end),
          vehicle_passengers = COALESCE($11, vehicle_passengers),
          supply_items = COALESCE($12::jsonb, supply_items),
          supply_urgency = COALESCE($13, supply_urgency),
          updated_at = NOW()
        WHERE id = $14::uuid
        RETURNING *;
      `,
      [
        payload.status?.trim() ?? null,
        payload.notes?.trim() ?? null,
        payload.meal_type?.trim() ?? null,
        payload.meal_date ?? null,
        payload.meal_quantity ? Number(payload.meal_quantity) : null,
        payload.vehicle_purpose?.trim() ?? null,
        payload.vehicle_destination?.trim() ?? null,
        payload.vehicle_date ?? null,
        payload.vehicle_time_start?.trim() ?? null,
        payload.vehicle_time_end?.trim() ?? null,
        payload.vehicle_passengers ? Number(payload.vehicle_passengers) : null,
        payload.supply_items ?? null,
        payload.supply_urgency?.trim() ?? null,
        requestId,
      ],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-SVC-404', 'Service request not found', HttpStatus.NOT_FOUND);
    }
    return mapServiceRequestRow(res.rows[0]);
  }

  async deleteServiceRequest(
    requestId: string,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadServiceRequestCompanyRow(requestId);
    this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-SVC-404',
      mismatch: 'HRM-SVC-409',
    });
    const res = await this.db.query<{ id: string }>(
      `DELETE FROM public.service_requests WHERE id = $1::uuid RETURNING id;`,
      [requestId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-SVC-404', 'Service request not found', HttpStatus.NOT_FOUND);
    }
    return { id: requestId };
  }

  async approveServiceRequest(
    requestId: string,
    payload: DecideServiceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadServiceRequestCompanyRow(requestId);
    this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-SVC-404',
      mismatch: 'HRM-SVC-409',
    });
    const res = await this.db.query<ServiceRequestRow>(
      `
        UPDATE public.service_requests
        SET status = 'approved',
            approved_by = COALESCE($1, approved_by),
            approved_at = NOW(),
            rejected_reason = NULL,
            updated_at = NOW()
        WHERE id = $2::uuid
        RETURNING *;
      `,
      [payload.approved_by?.trim() ?? null, requestId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-SVC-404', 'Service request not found', HttpStatus.NOT_FOUND);
    }
    const row = res.rows[0];
    await this.fanout.onServiceRequestDecided('approved', this.toServiceRequestRealtimePayload(row));
    return mapServiceRequestRow(row);
  }

  async rejectServiceRequest(
    requestId: string,
    payload: DecideServiceRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadServiceRequestCompanyRow(requestId);
    this.guardUuidResourceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-SVC-404',
      mismatch: 'HRM-SVC-409',
    });
    const res = await this.db.query<ServiceRequestRow>(
      `
        UPDATE public.service_requests
        SET status = 'rejected',
            rejected_reason = $1,
            approved_by = COALESCE($2, approved_by),
            approved_at = NULL,
            updated_at = NOW()
        WHERE id = $3::uuid
        RETURNING *;
      `,
      [payload.rejected_reason?.trim() ?? null, payload.approved_by?.trim() ?? null, requestId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-SVC-404', 'Service request not found', HttpStatus.NOT_FOUND);
    }
    const row = res.rows[0];
    await this.fanout.onServiceRequestDecided('rejected', this.toServiceRequestRealtimePayload(row));
    return mapServiceRequestRow(row);
  }

  private async countByScope(
    table: string,
    scope: HrmListScope,
    /** OP-04 plane mix: UUID tasks/SR · TEXT payroll/recruitment · workforce ATT (cite pairs). */
    mode: 'company_text' | 'company_uuid' | 'workforce',
  ): Promise<number> {
    const filters: string[] = [];
    const values: unknown[] = [];
    if (mode === 'workforce') {
      pushWorkforceEmployeeScopeFilter(filters, values, scope);
    } else if (mode === 'company_uuid') {
      // Xử lý: UUID filter fail-closed nếu scope wire là LE ∉ map (HRM-PLANE-409) — không fake 0.
      pushCompanyIdUuidFilter(filters, values, scope.companyIds);
    } else {
      pushCompanyIdFilter(filters, values, scope.companyIds);
    }
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.${table} ${whereClause};`,
      values,
    );
    return Number(res.rows[0]?.total ?? 0);
  }

  async getSummary(requestedCompanyId: string, authorization?: string, tenantId?: string) {
    await this.ensureSchema();
    // OP-04: reject LE UUID wire before mixed-plane counts (no silent fake 0).
    this.assertOperationsCompanyWire(requestedCompanyId);
    const scope = resolveHrmListScope(authorization, requestedCompanyId, { tenantId });
    const [attendance, payroll, recruitment, tasks, serviceRequests] = await Promise.all([
      this.countByScope('attendance_records', scope, 'workforce'),
      this.countByScope('payroll_periods', scope, 'company_text'),
      this.countByScope('job_requisitions', scope, 'company_text'),
      this.countByScope('hrm_tasks', scope, 'company_uuid'),
      this.countByScope('service_requests', scope, 'company_uuid'),
    ]);
    return {
      attendance_records: attendance,
      payroll_periods: payroll,
      job_requisitions: recruitment,
      tasks,
      service_requests: serviceRequests,
    };
  }
}
