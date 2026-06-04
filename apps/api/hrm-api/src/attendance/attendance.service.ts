import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScopeContext,
  pushCompanyIdFilter,
  resolveHrmOperationsPersistCompanyId,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
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
  constructor(
    private readonly db: HrmDbService,
    private readonly attendanceFanout: AttendanceEventFanoutService,
  ) {}
  private resolvePage(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private assertCheckInOutOrder(checkIn: string | null | undefined, checkOut: string | null | undefined) {
    if (!checkIn?.trim() || !checkOut?.trim()) return;
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    if (b <= a) {
      throw new ApiException(
        'HRM-ATT-VAL-TIME',
        'check_out_at must be after check_in_at',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /** BR-ATT-DATE-01 — reject epoch / 1970 / pre-2000 dates on write. */
  private assertValidAttendanceDate(dateStr: string | undefined) {
    const trimmed = dateStr?.trim();
    if (!trimmed) {
      throw new ApiException('HRM-ATT-DATE-001', 'attendance_date is required', HttpStatus.BAD_REQUEST);
    }
    const iso = trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
    if (iso === '1970-01-01' || iso.startsWith('0000') || iso === '0001-01-01') {
      throw new ApiException(
        'HRM-ATT-DATE-001',
        'attendance_date is invalid (epoch or unset)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const parsed = new Date(iso);
    if (!Number.isFinite(parsed.getTime()) || parsed.getUTCFullYear() < 2000) {
      throw new ApiException('HRM-ATT-DATE-001', 'attendance_date must be a valid calendar date', HttpStatus.BAD_REQUEST);
    }
  }

  /** BR-ATT-DATE-01 — omit invalid stored dates from API (FE shows em dash). */
  private normalizeAttendanceDateForApi(date: string | null | undefined): string | null {
    if (!date) return null;
    const iso = String(date).slice(0, 10);
    if (iso === '1970-01-01' || iso.startsWith('0000') || iso === '0001-01-01') return null;
    const parsed = new Date(iso);
    if (!Number.isFinite(parsed.getTime()) || parsed.getUTCFullYear() < 2000) return null;
    return iso;
  }

  private guardAttendanceMutate(
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

  private async loadAttendanceRecordCompany(recordId: string): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.attendance_records WHERE id = $1::uuid LIMIT 1;`,
      [recordId],
    );
    return res.rows[0] ?? null;
  }

  private async loadUpdateRequestCompany(requestId: string): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.attendance_update_requests WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

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
    await this.db.query(`
      ALTER TABLE public.attendance_records
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.attendance_update_requests
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_work_sites (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        name TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        radius_meters INTEGER NOT NULL DEFAULT 200,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.ensureDefaultWorkSite();
  }

  private async ensureDefaultWorkSite() {
    const exists = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.attendance_work_sites LIMIT 1;`,
    );
    if (Number(exists.rows[0]?.total ?? 0) > 0) return;
    const holdingUuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    await this.db.query(
      `
        INSERT INTO public.attendance_work_sites (id, company_id, name, latitude, longitude, radius_meters)
        VALUES ($1, $2::uuid, 'XeVN HQ Pilot', 21.0285, 105.8542, 500)
        ON CONFLICT DO NOTHING;
      `,
      [randomUUID(), holdingUuid],
    );
  }

  private haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  private async assertWithinWorkSite(companyId: string, latitude: number, longitude: number) {
    const sites = await this.db.query<{
      name: string;
      latitude: number;
      longitude: number;
      radius_meters: number;
    }>(
      `
        SELECT name, latitude, longitude, radius_meters
        FROM public.attendance_work_sites
        WHERE company_id::text = $1::text AND active = TRUE;
      `,
      [companyId],
    );
    if (!sites.rows.length) return;
    const ok = sites.rows.some(
      (s) => this.haversineMeters(latitude, longitude, s.latitude, s.longitude) <= s.radius_meters,
    );
    if (!ok) {
      throw new ApiException(
        'HRM-ATT-GEO-001',
        'Check-in ngoài vùng cho phép',
        HttpStatus.BAD_REQUEST,
        { latitude, longitude },
      );
    }
  }

  private mapRecord(row: AttendanceRecordRow) {
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      attendance_date: this.normalizeAttendanceDateForApi(row.attendance_date),
      check_in_at: row.check_in_at,
      check_out_at: row.check_out_at,
      status: row.status,
      note: row.note,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private toAttendanceUpdateRequestRealtimePayload(row: AttendanceUpdateRequestRow) {
    const m = this.mapUpdateRequest(row);
    return {
      id: m.id,
      company_id: m.company_id,
      employee_id: m.employee_id,
      employee_code: m.employee_code,
      employee_name: m.employee_name,
      status: m.status,
      attendance_date: m.attendance_date ?? '',
      update_type: m.update_type,
      created_at: m.created_at,
      updated_at: m.updated_at,
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
      attendance_date: this.normalizeAttendanceDateForApi(row.attendance_date),
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

  async createRecord(
    payload: CreateAttendanceRecordDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmOperationsPersistCompanyId(authorization, payload.company_id, { tenantId });
    this.assertValidAttendanceDate(payload.attendance_date);
    if (payload.latitude != null && payload.longitude != null) {
      await this.assertWithinWorkSite(companyId, payload.latitude, payload.longitude);
    }
    this.assertCheckInOutOrder(payload.check_in_at, payload.check_out_at);
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
          companyId,
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

  async listRecords(
    query: ListAttendanceRecordsQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size ?? query.pageSize, 20);
    const offset = (page - 1) * pageSize;
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushWorkforceEmployeeScopeFilter(filters, values, scope);
    let idx = values.length + 1;

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

  async updateStatus(
    recordId: string,
    payload: UpdateAttendanceStatusDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadAttendanceRecordCompany(recordId);
    this.guardAttendanceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-ATT-404',
      mismatch: 'HRM-ATT-409',
    });
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

  async createUpdateRequest(
    payload: CreateAttendanceUpdateRequestDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmOperationsPersistCompanyId(authorization, payload.company_id, { tenantId });
    this.assertCheckInOutOrder(payload.current_check_in, payload.current_check_out);
    this.assertCheckInOutOrder(payload.requested_check_in, payload.requested_check_out);
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
        companyId,
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
    const row = res.rows[0];
    const mapped = this.mapUpdateRequest(row);
    await this.attendanceFanout.onUpdateRequestCreated(this.toAttendanceUpdateRequestRealtimePayload(row));
    return mapped;
  }

  async listUpdateRequests(
    query: ListAttendanceUpdateRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, { tenantId });
    const clauses: string[] = [];
    const values: unknown[] = [];
    if (scope.masterTenantPartition || scope.memberTenantId) {
      pushWorkforceEmployeeScopeFilter(clauses, values, scope, 'aur.employee_id');
    } else {
      // attendance_update_requests.company_id is TEXT (ensureSchema migration) — never ::uuid compare.
      pushCompanyIdFilter(clauses, values, scope.companyIds);
      const companyFilterIdx = clauses.length - 1;
      clauses[companyFilterIdx] = clauses[companyFilterIdx].replace(/^company_id/, 'aur.company_id');
    }
    if (query.status) {
      values.push(query.status);
      clauses.push(`aur.status = $${values.length}`);
    }
    if (query.employee_id) {
      values.push(query.employee_id);
      clauses.push(`aur.employee_id = $${values.length}::uuid`);
    }
    if (query.manager_employee_id) {
      values.push(query.manager_employee_id);
      clauses.push(`aur.employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id = $${values.length}::uuid AND e.archived_at IS NULL
      )`);
    }
    const res = await this.db.query<AttendanceUpdateRequestRow>(
      `
        SELECT aur.* FROM public.attendance_update_requests aur
        WHERE ${clauses.join(' AND ')}
        ORDER BY aur.created_at DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows.map((row) => this.mapUpdateRequest(row)) };
  }

  async updateUpdateRequest(
    requestId: string,
    payload: UpdateAttendanceUpdateRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadUpdateRequestCompany(requestId);
    this.guardAttendanceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-ATT-REQ-404',
      mismatch: 'HRM-ATT-REQ-409',
    });
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

  async approveUpdateRequest(
    requestId: string,
    payload: DecideAttendanceUpdateRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadUpdateRequestCompany(requestId);
    this.guardAttendanceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-ATT-REQ-404',
      mismatch: 'HRM-ATT-REQ-409',
    });
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
    const mapped = this.mapUpdateRequest(updated);
    await this.attendanceFanout.onUpdateRequestDecided('approved', this.toAttendanceUpdateRequestRealtimePayload(updated));
    return mapped;
  }

  async rejectUpdateRequest(
    requestId: string,
    payload: DecideAttendanceUpdateRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadUpdateRequestCompany(requestId);
    this.guardAttendanceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-ATT-REQ-404',
      mismatch: 'HRM-ATT-REQ-409',
    });
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
    const mapped = this.mapUpdateRequest(updated);
    await this.attendanceFanout.onUpdateRequestDecided('rejected', this.toAttendanceUpdateRequestRealtimePayload(updated));
    return mapped;
  }

  async deleteUpdateRequest(
    requestId: string,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.loadUpdateRequestCompany(requestId);
    this.guardAttendanceMutate(existing, authorization, requestedCompanyId, tenantId, {
      notFound: 'HRM-ATT-REQ-404',
      mismatch: 'HRM-ATT-REQ-409',
    });
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
