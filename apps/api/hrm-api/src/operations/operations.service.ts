import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
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

@Injectable()
export class OperationsService {
  constructor(private readonly db: HrmDbService) {}

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

  async createTask(payload: CreateTaskDto) {
    await this.ensureSchema();
    const res = await this.db.query<TaskRow>(
      `INSERT INTO public.hrm_tasks
        (id, company_id, title, description, priority, status, due_date)
       VALUES ($1, $2::uuid, $3, $4, $5, 'todo', $6::date)
       RETURNING id, company_id, title, description, priority, status, due_date, created_at, updated_at;`,
      [randomUUID(), payload.company_id, payload.title.trim(), payload.description?.trim() ?? null, payload.priority, payload.due_date ?? null],
    );
    return res.rows[0];
  }

  async listTasks(query: ListTasksQueryDto) {
    await this.ensureSchema();
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const offset = (page - 1) * pageSize;
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.hrm_tasks WHERE company_id = $1::uuid;`,
      [query.company_id],
    );
    const res = await this.db.query<TaskRow>(
      `SELECT id, company_id, title, description, priority, status, due_date, created_at, updated_at
       FROM public.hrm_tasks
       WHERE company_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3;`,
      [query.company_id, pageSize, offset],
    );
    return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
  }

  async updateTaskStatus(taskId: string, payload: UpdateTaskStatusDto) {
    await this.ensureSchema();
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

  async createServiceRequest(payload: CreateServiceRequestDto) {
    await this.ensureSchema();
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
        payload.company_id,
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
    return res.rows[0];
  }

  async listServiceRequests(query: ListServiceRequestsQueryDto) {
    await this.ensureSchema();
    const values: unknown[] = [query.company_id];
    const clauses = ['company_id = $1::uuid'];
    if (query.service_type) {
      clauses.push('service_type = $2');
      values.push(query.service_type);
    }
    const res = await this.db.query<ServiceRequestRow>(
      `
        SELECT * FROM public.service_requests
        WHERE ${clauses.join(' AND ')}
        ORDER BY created_at DESC;
      `,
      values,
    );
    return res.rows;
  }

  async updateServiceRequest(requestId: string, payload: UpdateServiceRequestDto) {
    await this.ensureSchema();
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
    return res.rows[0];
  }

  async deleteServiceRequest(requestId: string) {
    await this.ensureSchema();
    const res = await this.db.query<{ id: string }>(
      `DELETE FROM public.service_requests WHERE id = $1::uuid RETURNING id;`,
      [requestId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-SVC-404', 'Service request not found', HttpStatus.NOT_FOUND);
    }
    return { id: requestId };
  }

  async approveServiceRequest(requestId: string, payload: DecideServiceRequestDto) {
    await this.ensureSchema();
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
    return res.rows[0];
  }

  async rejectServiceRequest(requestId: string, payload: DecideServiceRequestDto) {
    await this.ensureSchema();
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
    return res.rows[0];
  }

  async getSummary(companyId: string) {
    await this.ensureSchema();
    const [attendance, payroll, recruitment, tasks, serviceRequests] = await Promise.all([
      this.db.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.attendance_records WHERE company_id = $1::uuid;`, [companyId]),
      this.db.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.payroll_periods WHERE company_id = $1::uuid;`, [companyId]),
      this.db.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.job_requisitions WHERE company_id = $1::uuid;`, [companyId]),
      this.db.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.hrm_tasks WHERE company_id = $1::uuid;`, [companyId]),
      this.db.query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM public.service_requests WHERE company_id = $1::uuid;`, [companyId]),
    ]);
    return {
      attendance_records: Number(attendance.rows[0]?.total ?? 0),
      payroll_periods: Number(payroll.rows[0]?.total ?? 0),
      job_requisitions: Number(recruitment.rows[0]?.total ?? 0),
      tasks: Number(tasks.rows[0]?.total ?? 0),
      service_requests: Number(serviceRequests.rows[0]?.total ?? 0),
    };
  }
}
