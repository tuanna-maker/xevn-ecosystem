import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateAttendanceUpdateRequestDto } from './dto/create-attendance-update-request.dto';
import { DecideAttendanceUpdateRequestDto } from './dto/decide-attendance-update-request.dto';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { ListAttendanceRecordsQueryDto } from './dto/list-attendance-records.query.dto';
import { ListAttendanceUpdateRequestsQueryDto } from './dto/list-attendance-update-requests.query.dto';
import { UpdateAttendanceUpdateRequestDto } from './dto/update-attendance-update-request.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';

type AttendanceRecordRow = {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: 'pending' | 'present' | 'absent' | 'leave';
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type AttendanceUpdateRequestRow = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  attendance_date: string;
  update_type: string;
  current_check_in: string | null;
  current_check_out: string | null;
  requested_check_in: string | null;
  requested_check_out: string | null;
  reason: string;
  evidence_url: string | null;
  approver_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class AttendanceService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_records (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        attendance_date DATE NOT NULL,
        check_in_at TIMESTAMPTZ NULL,
        check_out_at TIMESTAMPTZ NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        note TEXT NULL,
        created_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_attendance_status CHECK (status IN ('pending', 'present', 'absent', 'leave'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_attendance_company_employee_date
      ON public.attendance_records (company_id, employee_id, attendance_date);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_company_date
      ON public.attendance_records (company_id, attendance_date DESC);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_events (
        id UUID PRIMARY KEY,
        attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        source TEXT NULL,
        payload JSONB NULL,
        CONSTRAINT chk_attendance_event_type CHECK (event_type IN ('check_in', 'check_out', 'status_change'))
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_update_requests (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        employee_code TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department TEXT NULL,
        position TEXT NULL,
        attendance_date DATE NOT NULL,
        update_type TEXT NOT NULL,
        current_check_in TIMESTAMPTZ NULL,
        current_check_out TIMESTAMPTZ NULL,
        requested_check_in TIMESTAMPTZ NULL,
        requested_check_out TIMESTAMPTZ NULL,
        reason TEXT NOT NULL,
        evidence_url TEXT NULL,
        approver_name TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ NULL,
        rejected_reason TEXT NULL,
        notes TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_attendance_update_request_status CHECK (status IN ('pending', 'approved', 'rejected'))
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_update_requests_company_status
      ON public.attendance_update_requests (company_id, status, created_at DESC);
    `);
  }

  private mapRecord(row: AttendanceRecordRow) {
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      attendance_date: row.attendance_date,
      check_in_at: row.check_in_at,
      check_out_at: row.check_out_at,
      status: row.status,
      note: row.note,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapUpdateRequest(row: AttendanceUpdateRequestRow) {
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      employee_code: row.employee_code,
      employee_name: row.employee_name,
      department: row.department,
      position: row.position,
      attendance_date: row.attendance_date,
      update_type: row.update_type,
      current_check_in: row.current_check_in,
      current_check_out: row.current_check_out,
      requested_check_in: row.requested_check_in,
      requested_check_out: row.requested_check_out,
      reason: row.reason,
      evidence_url: row.evidence_url,
      approver_name: row.approver_name,
      status: row.status,
      approved_at: row.approved_at,
      rejected_reason: row.rejected_reason,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async createRecord(payload: CreateAttendanceRecordDto) {
    await this.ensureSchema();
    const status = payload.status ?? 'pending';
    try {
      const res = await this.db.query<AttendanceRecordRow>(
        `
          INSERT INTO public.attendance_records (
            id, company_id, employee_id, attendance_date, check_in_at, check_out_at, status, note, created_by
          ) VALUES ($1, $2::uuid, $3::uuid, $4::date, $5, $6, $7, $8, $9)
          RETURNING
            id, company_id, employee_id, attendance_date, check_in_at, check_out_at,
            status, note, created_by, created_at, updated_at;
        `,
        [
          randomUUID(),
          payload.company_id,
          payload.employee_id,
          payload.attendance_date,
          payload.check_in_at ?? null,
          payload.check_out_at ?? null,
          status,
          payload.note?.trim() ?? null,
          payload.created_by?.trim() ?? null,
        ],
      );

      const created = res.rows[0];
      await this.db.query(
        `
          INSERT INTO public.attendance_events (id, attendance_record_id, event_type, source, payload)
          VALUES ($1, $2::uuid, 'status_change', $3, $4::jsonb)
        `,
        [randomUUID(), created.id, 'hrm-api', JSON.stringify({ status: created.status })],
      );
      return this.mapRecord(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cannot create attendance record';
      throw new ApiException('HRM-ATT-001', message, HttpStatus.BAD_REQUEST);
    }
  }

  async listRecords(query: ListAttendanceRecordsQueryDto) {
    await this.ensureSchema();
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const offset = (page - 1) * pageSize;
    const filters: string[] = ['company_id = $1::uuid'];
    const values: unknown[] = [query.company_id];
    let idx = 2;

    if (query.employee_id) {
      filters.push(`employee_id = $${idx}::uuid`);
      values.push(query.employee_id);
      idx += 1;
    }
    if (query.status) {
      filters.push(`status = $${idx}`);
      values.push(query.status);
      idx += 1;
    }
    if (query.from_date) {
      filters.push(`attendance_date >= $${idx}::date`);
      values.push(query.from_date);
      idx += 1;
    }
    if (query.to_date) {
      filters.push(`attendance_date <= $${idx}::date`);
      values.push(query.to_date);
      idx += 1;
    }

    const whereClause = filters.join(' AND ');
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.attendance_records WHERE ${whereClause};`,
      values,
    );
    const dataRes = await this.db.query<AttendanceRecordRow>(
      `
        SELECT
          id, company_id, employee_id, attendance_date, check_in_at, check_out_at,
          status, note, created_by, created_at, updated_at
        FROM public.attendance_records
        WHERE ${whereClause}
        ORDER BY attendance_date DESC, created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, pageSize, offset],
    );

    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      page,
      page_size: pageSize,
      data: dataRes.rows.map((row) => this.mapRecord(row)),
    };
  }

  async updateStatus(recordId: string, payload: UpdateAttendanceStatusDto) {
    await this.ensureSchema();
    const res = await this.db.query<AttendanceRecordRow>(
      `
        UPDATE public.attendance_records
        SET status = $1, note = COALESCE($2, note), updated_at = NOW()
        WHERE id = $3::uuid
        RETURNING
          id, company_id, employee_id, attendance_date, check_in_at, check_out_at,
          status, note, created_by, created_at, updated_at;
      `,
      [payload.status, payload.note?.trim() ?? null, recordId],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException('HRM-ATT-404', 'Attendance record not found', HttpStatus.NOT_FOUND);
    }
    await this.db.query(
      `
        INSERT INTO public.attendance_events (id, attendance_record_id, event_type, source, payload)
        VALUES ($1, $2::uuid, 'status_change', $3, $4::jsonb)
      `,
      [
        randomUUID(),
        updated.id,
        payload.updated_by?.trim() ?? 'hrm-api',
        JSON.stringify({ status: payload.status, note: payload.note ?? null }),
      ],
    );
    return this.mapRecord(updated);
  }

  async createUpdateRequest(payload: CreateAttendanceUpdateRequestDto) {
    await this.ensureSchema();
    const res = await this.db.query<AttendanceUpdateRequestRow>(
      `
        INSERT INTO public.attendance_update_requests (
          id, company_id, employee_id, employee_code, employee_name, department, position,
          attendance_date, update_type, current_check_in, current_check_out,
          requested_check_in, requested_check_out, reason, evidence_url, approver_name
        ) VALUES (
          $1, $2::uuid, $3::uuid, $4, $5, $6, $7,
          $8::date, $9, $10, $11,
          $12, $13, $14, $15, $16
        )
        RETURNING *;
      `,
      [
        randomUUID(),
        payload.company_id,
        payload.employee_id,
        payload.employee_code,
        payload.employee_name,
        payload.department?.trim() ?? null,
        payload.position?.trim() ?? null,
        payload.attendance_date,
        payload.update_type,
        payload.current_check_in ?? null,
        payload.current_check_out ?? null,
        payload.requested_check_in ?? null,
        payload.requested_check_out ?? null,
        payload.reason.trim(),
        payload.evidence_url?.trim() ?? null,
        payload.approver_name?.trim() ?? null,
      ],
    );
    return this.mapUpdateRequest(res.rows[0]);
  }

  async listUpdateRequests(query: ListAttendanceUpdateRequestsQueryDto) {
    await this.ensureSchema();
    const clauses = ['company_id = $1::uuid'];
    const values: unknown[] = [query.company_id];
    if (query.status) {
      clauses.push('status = $2');
      values.push(query.status);
    }
    const res = await this.db.query<AttendanceUpdateRequestRow>(
      `
        SELECT * FROM public.attendance_update_requests
        WHERE ${clauses.join(' AND ')}
        ORDER BY created_at DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows.map((row) => this.mapUpdateRequest(row)) };
  }

  async updateUpdateRequest(requestId: string, payload: UpdateAttendanceUpdateRequestDto) {
    await this.ensureSchema();
    const res = await this.db.query<AttendanceUpdateRequestRow>(
      `
        UPDATE public.attendance_update_requests
        SET
          department = COALESCE($1, department),
          position = COALESCE($2, position),
          attendance_date = COALESCE($3::date, attendance_date),
          update_type = COALESCE($4, update_type),
          current_check_in = COALESCE($5, current_check_in),
          current_check_out = COALESCE($6, current_check_out),
          requested_check_in = COALESCE($7, requested_check_in),
          requested_check_out = COALESCE($8, requested_check_out),
          reason = COALESCE($9, reason),
          evidence_url = COALESCE($10, evidence_url),
          approver_name = COALESCE($11, approver_name),
          updated_at = NOW()
        WHERE id = $12::uuid
        RETURNING *;
      `,
      [
        payload.department?.trim() ?? null,
        payload.position?.trim() ?? null,
        payload.attendance_date ?? null,
        payload.update_type?.trim() ?? null,
        payload.current_check_in ?? null,
        payload.current_check_out ?? null,
        payload.requested_check_in ?? null,
        payload.requested_check_out ?? null,
        payload.reason?.trim() ?? null,
        payload.evidence_url?.trim() ?? null,
        payload.approver_name?.trim() ?? null,
        requestId,
      ],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException('HRM-ATT-REQ-404', 'Attendance update request not found', HttpStatus.NOT_FOUND);
    }
    return this.mapUpdateRequest(updated);
  }

  async approveUpdateRequest(requestId: string, payload: DecideAttendanceUpdateRequestDto) {
    await this.ensureSchema();
    const res = await this.db.query<AttendanceUpdateRequestRow>(
      `
        UPDATE public.attendance_update_requests
        SET status = 'approved',
            approver_name = COALESCE($1, approver_name),
            approved_at = NOW(),
            rejected_reason = NULL,
            updated_at = NOW()
        WHERE id = $2::uuid
        RETURNING *;
      `,
      [payload.approver_name?.trim() ?? null, requestId],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException('HRM-ATT-REQ-404', 'Attendance update request not found', HttpStatus.NOT_FOUND);
    }
    return this.mapUpdateRequest(updated);
  }

  async rejectUpdateRequest(requestId: string, payload: DecideAttendanceUpdateRequestDto) {
    await this.ensureSchema();
    const res = await this.db.query<AttendanceUpdateRequestRow>(
      `
        UPDATE public.attendance_update_requests
        SET status = 'rejected',
            approver_name = COALESCE($1, approver_name),
            rejected_reason = $2,
            approved_at = NULL,
            updated_at = NOW()
        WHERE id = $3::uuid
        RETURNING *;
      `,
      [payload.approver_name?.trim() ?? null, payload.rejected_reason?.trim() ?? null, requestId],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException('HRM-ATT-REQ-404', 'Attendance update request not found', HttpStatus.NOT_FOUND);
    }
    return this.mapUpdateRequest(updated);
  }

  async deleteUpdateRequest(requestId: string) {
    await this.ensureSchema();
    const res = await this.db.query<{ id: string }>(
      `DELETE FROM public.attendance_update_requests WHERE id = $1::uuid RETURNING id;`,
      [requestId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-ATT-REQ-404', 'Attendance update request not found', HttpStatus.NOT_FOUND);
    }
    return { id: requestId };
  }
}
