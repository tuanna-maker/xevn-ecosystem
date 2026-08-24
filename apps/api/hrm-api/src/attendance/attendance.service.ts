/**
 * @CODE-MEMORY
 * Screen:     HRM → Bản ghi chấm công / đơn chỉnh sửa
 * UC:         HRM-AT-01 · HRM-AT-02 · HRM-AT-03 · UC-HRM-09
 * BR:         scope ladder · AC empty honesty trên list
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.9 FR-HRM-AT-01 (+ AT-02/AT-03)
 * SRS bước:   AT-01 Diễn biến #7 Lưu · list #4/#5 empty · AT-14 #9–#10 lưới kỳ
 * TechSpec:   docs/hrm/TECHSPEC.md §14.4 liên kết · FR-HRM-AT-01
 * Purpose:    Ghi/list/cập nhật trạng thái attendance_records + update-requests.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    attendance.controller.ts
 * Callees:    HrmDbService · AttendanceEventFanoutService
 * must_keep:  không phá AC-ATT-SHEET; leave module tách LeaveRequestsService
 * SOLID:      Records tách sheets (catalog) và leave
 * LastVerified: attendance.service related specs
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY map Diễn biến AT-01 (không đổi logic)
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01
 * change_mode: FIX
 * What: listUpdateRequests — normalizePayrollListCompanyId trước resolveHrmListScope
 *       (parity leave/listRecords); guardAttendanceMutate cùng ladder slug↔UUID.
 * Why:  QA R1 CO-TMDV — CEO F5 companyId=trsport empty (row UUID); mgr Duyệt 409 scope.
 * must_keep: FE ISO create path; leave approve; expandHrmTextCompanyIds Plane B′; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-MFD-M1-ATT-P0-CFG-BE-01
 * change_mode: ADD
 * What: Geofence assert slug-scoped work_sites; gps_enabled gate via AttendanceConfigService;
 *       removed ensureDefaultWorkSite pilot insert (U65).
 * Why: ADR-HRM-ATTENDANCE-CFG-PERSIST D3
 * must_keep: HRM-ATT-GEO-001 · update-requests U78
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-BE-01
 * change_mode: ADD
 * What: ensureSchema ADD leave_request_id + leave_type_key + partial IX;
 *       GET list/get mapRecord display-ready leave fields (OS 28 — no FE leave join).
 * Why: F-ATT-LEAVE-FUNNEL-03 · DB-01 §3 · AC-ATT-LV-SHEET-01
 * must_keep: J-HRM-06b storm · empty honesty · no AGG line · Option C forbidden
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-BE-02
 * change_mode: FIX
 * What: normalizeAttendanceDateForApi → toLeaveDayKey (pg Date ≠ String.slice "Sat Dec 26")
 * Why: R-ATT-LEAVE-FUNNEL-DATE-EXPAND · AC dates ≠ 1970 / display yyyy-MM-dd
 * must_keep: empty honesty · J-HRM-06b · attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01
 * change_mode: UPGRADE
 * What: CNS-05 — check_in_method=gps ∧ gps_enabled ∧ active>0 ∧ omit lat/lon → HRM-ATT-GEO-REQ;
 *       manual omit coords soft-skip RETAIN; GEO-001 invent OOS RETAIN; empty skip ADR D3;
 *       SITE-UNKNOWN HOLD (no work_site_id assert).
 * Why: BA VAL-ATT-WS-CNS-05 · AC-PLT-ATT-WORKSITE-01* · SA Option B
 * must_keep: HRM-ATT-GEO-001 · no ensureDefaultWorkSite · leave funnel · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01
 * change_mode: ADD
 * What: DROP chk_attendance_status closed ceiling; create/update status ∈ F-ATT-CAT-CODE-EFF
 *       → HRM-ATT-CODE-KEY when EFF>0; empty soft skip; status_label/symbol from catalog
 *       (bootstrap hardcode only EFF=0); typed flags physical only — FORBIDDEN aggregate rewrite.
 * Why: BA VAL-ATT-CODE-CNS-01..10 · SA Option B · DATA ADD att_attendance_code
 * must_keep: att_leave_type / work_sites / work_shifts · sheet/sign · L-ATT-CODE-07 · U65
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  HrmListScopeContext,
  normalizePayrollListCompanyId,
  pushCompanyIdTextColumnFilter,
  resolveHrmOperationsPersistCompanyId,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import { CreateAttendanceUpdateRequestDto } from './dto/create-attendance-update-request.dto';
import { DecideAttendanceUpdateRequestDto } from './dto/decide-attendance-update-request.dto';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { GetAttendanceRecordQueryDto } from './dto/get-attendance-record.query.dto';
import { ListAttendanceRecordsQueryDto } from './dto/list-attendance-records.query.dto';
import { ListAttendanceUpdateRequestsQueryDto } from './dto/list-attendance-update-requests.query.dto';
import { UpdateAttendanceUpdateRequestDto } from './dto/update-attendance-update-request.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';
import { AttendanceConfigService } from './attendance-config.service';
import {
  AttAttendanceCodeService,
  type AttAttendanceCodeDisplayHints,
} from './att-attendance-code.service';
import { toLeaveDayKey } from './leave-attendance-funnel.service';
type AttendanceRecordRow = {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  leave_request_id?: string | null;
  leave_type_key?: string | null;
  employee_code?: string | null;
  employee_name?: string | null;
  department?: string | null;
};

const ATTENDANCE_STATUS_LABELS_VI: Record<string, string> = {
  pending: 'Chờ xử lý',
  present: 'Có mặt',
  absent: 'Vắng',
  leave: 'Nghỉ phép',
};

const ATTENDANCE_LEAVE_TYPE_LABELS_VI: Record<string, string> = {
  annual: 'Phép năm',
  sick: 'Nghỉ ốm',
  maternity: 'Thai sản',
  unpaid: 'Không lương',
  holiday: 'Nghỉ lễ',
  compensatory: 'Nghỉ bù',
  annual_leave: 'Phép năm',
  sick_leave: 'Nghỉ ốm',
  lvt_01: 'Phép năm',
  lvt_02: 'Ốm',
  lvt_03: 'Thai sản',
  lvt_04: 'Không lương',
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
    private readonly attendanceConfig: AttendanceConfigService,
    @Optional() private readonly attAttendanceCode?: AttAttendanceCodeService,
  ) {}
  private resolvePage(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private assertCheckInOutOrder(
    checkIn: string | null | undefined,
    checkOut: string | null | undefined,
  ) {
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
      throw new ApiException(
        'HRM-ATT-DATE-001',
        'attendance_date is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const iso = trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
    if (
      iso === '1970-01-01' ||
      iso.startsWith('0000') ||
      iso === '0001-01-01'
    ) {
      throw new ApiException(
        'HRM-ATT-DATE-001',
        'attendance_date is invalid (epoch or unset)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const parsed = new Date(iso);
    if (!Number.isFinite(parsed.getTime()) || parsed.getUTCFullYear() < 2000) {
      throw new ApiException(
        'HRM-ATT-DATE-001',
        'attendance_date must be a valid calendar date',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /** BR-ATT-DATE-01 — omit invalid stored dates from API (FE shows em dash). */
  private normalizeAttendanceDateForApi(
    date: string | Date | null | undefined,
  ): string | null {
    if (date == null || date === '') return null;
    const iso = toLeaveDayKey(date);
    if (!iso) return null;
    if (iso === '1970-01-01' || iso.startsWith('0000') || iso === '0001-01-01')
      return null;
    const parsed = new Date(`${iso}T00:00:00.000Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.getUTCFullYear() < 2000)
      return null;
    return iso;
  }

  private guardAttendanceMutate(
    resource: { company_id?: string | null } | null | undefined,
    authorization: string | undefined,
    requestedCompanyId: string,
    tenantId: string | undefined,
    codes: { notFound: string; mismatch: string },
  ) {
    // Parity leave AT-12/13 — UUID/slug query → same ladder as list before assert.
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    assertResourceInHrmScope(resource, scope, {
      notFoundCode: codes.notFound,
      mismatchCode: codes.mismatch,
    });
  }

  private async loadAttendanceRecordCompany(
    recordId: string,
  ): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.attendance_records WHERE id = $1::uuid LIMIT 1;`,
      [recordId],
    );
    return res.rows[0] ?? null;
  }

  private async loadUpdateRequestCompany(
    requestId: string,
  ): Promise<{ company_id: string } | null> {
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
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01 — DROP closed status ceiling (L-ATT-CODE-04).
    await this.db.query(`
      ALTER TABLE public.attendance_records
      DROP CONSTRAINT IF EXISTS chk_attendance_status;
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
    // PO-HRM-ATT-LEAVE-FUNNEL-BE-01 — soft FK Option A (DB-01 §3); no CASCADE; no AGG line.
    await this.db.query(`
      ALTER TABLE public.attendance_records
      ADD COLUMN IF NOT EXISTS leave_request_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.attendance_records
      ADD COLUMN IF NOT EXISTS leave_type_key TEXT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_records_leave_request_id
      ON public.attendance_records (leave_request_id)
      WHERE leave_request_id IS NOT NULL;
    `);
    await this.attendanceConfig.ensureWorkSitesSchema();
  }

  private haversineMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  private async assertWithinWorkSite(
    authorization: string | undefined,
    requestedCompanyId: string,
    latitude: number,
    longitude: number,
    tenantId?: string,
  ) {
    const scope = resolveHrmListScope(authorization, requestedCompanyId, {
      tenantId,
    });
    const companyKeys = expandHrmTextCompanyIds(
      scope,
      authorization,
      requestedCompanyId,
    );
    const filters: string[] = ['active = TRUE'];
    const values: unknown[] = [];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    const sites = await this.db.query<{
      name: string;
      latitude: number;
      longitude: number;
      radius_meters: number;
    }>(
      `
        SELECT name, latitude, longitude, radius_meters
        FROM public.attendance_work_sites
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    if (!sites.rows.length) return;
    const ok = sites.rows.some(
      (s) =>
        this.haversineMeters(latitude, longitude, s.latitude, s.longitude) <=
        s.radius_meters,
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

  private async attachEmployeeDisplay(
    row: AttendanceRecordRow,
  ): Promise<AttendanceRecordRow> {
    if (row.employee_name?.trim()) {
      return row;
    }
    const res = await this.db.query<{
      employee_code: string | null;
      employee_name: string | null;
      department: string | null;
    }>(
      `
        SELECT
          employee_code,
          full_name AS employee_name,
          COALESCE(
            NULLIF(TRIM(custom_fields->>'department_label'), ''),
            NULLIF(TRIM(custom_fields->>'department'), '')
          ) AS department
        FROM public.employees
        WHERE id = $1::uuid AND archived_at IS NULL
        LIMIT 1;
      `,
      [row.employee_id],
    );
    const emp = res.rows[0];
    if (!emp) {
      return row;
    }
    return {
      ...row,
      employee_code: emp.employee_code,
      employee_name: emp.employee_name,
      department: emp.department,
    };
  }

  private mapRecord(
    row: AttendanceRecordRow,
    codeHints?: Map<string, AttAttendanceCodeDisplayHints>,
  ) {
    const leaveTypeKey = row.leave_type_key?.trim() || null;
    const leaveTypeLabel = leaveTypeKey
      ? (ATTENDANCE_LEAVE_TYPE_LABELS_VI[leaveTypeKey.toLowerCase()] ??
        leaveTypeKey)
      : null;
    const statusKey = String(row.status ?? '')
      .trim()
      .replace(/-/g, '_')
      .toLowerCase();
    const catalogHints = codeHints?.get(statusKey);
    // OS 28 — catalog symbol/status_label when EFF known; hardcode bootstrap only when EFF=0 map empty.
    const statusLabel =
      catalogHints?.statusLabel ??
      ATTENDANCE_STATUS_LABELS_VI[statusKey] ??
      row.status;
    const symbol = catalogHints?.symbol ?? null;
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      employee_code: row.employee_code?.trim() || null,
      employee_name: row.employee_name?.trim() || null,
      department: row.department?.trim() || null,
      attendance_date: this.normalizeAttendanceDateForApi(row.attendance_date),
      check_in_at: row.check_in_at,
      check_out_at: row.check_out_at,
      status: row.status,
      status_label: statusLabel,
      symbol,
      note: row.note,
      leave_request_id: row.leave_request_id ?? null,
      leave_type_key: leaveTypeKey,
      leave_type: leaveTypeKey,
      leave_type_label:
        row.status === 'leave'
          ? (leaveTypeLabel ?? 'Nghỉ phép')
          : leaveTypeLabel,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async resolveCodeDisplayLookup(
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<Map<string, AttAttendanceCodeDisplayHints> | undefined> {
    if (!this.attAttendanceCode) {
      return undefined;
    }
    try {
      return await this.attAttendanceCode.buildCodeDisplayLookup(
        companyId,
        authorization,
        tenantId,
      );
    } catch {
      return undefined;
    }
  }

  /**
   * F-ATT-CODE-CNS-01 — assert status ∈ EFF when count>0; returns canonical code for persist.
   * Empty EFF → soft skip (U65).
   */
  private async assertAttendanceDayCode(input: {
    companyId: string;
    status: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<string> {
    const raw = String(input.status ?? '').trim() || 'pending';
    if (!this.attAttendanceCode) {
      return raw.replace(/-/g, '_').toLowerCase();
    }
    const hit = await this.attAttendanceCode.assertCodeInEffectiveCatalog({
      companyId: input.companyId,
      code: raw,
      authorization: input.authorization,
      tenantId: input.tenantId,
    });
    return hit?.code ?? raw.replace(/-/g, '_').toLowerCase();
  }

  private toAttendanceUpdateRequestRealtimePayload(
    row: AttendanceUpdateRequestRow,
  ) {
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

  /**
   * @CODE-MEMORY method · FR-HRM-AT-01
   * SRS bước: Diễn biến #7 Lưu thành công — INSERT attendance_records + event
   * TechSpec: FR-HRM-AT-01 · liên kết lưới AT-14
   */
  async createRecord(
    payload: CreateAttendanceRecordDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmOperationsPersistCompanyId(
      authorization,
      payload.company_id,
      { tenantId },
    );
    this.assertValidAttendanceDate(payload.attendance_date);
    const hasFiniteCoords =
      payload.latitude != null &&
      payload.longitude != null &&
      Number.isFinite(Number(payload.latitude)) &&
      Number.isFinite(Number(payload.longitude));
    const gpsOn = await this.attendanceConfig.isGpsGeofenceEnabled(
      authorization,
      payload.company_id,
      tenantId,
    );
    const checkInMethod = payload.check_in_method?.trim().toLowerCase() ?? '';
    // CNS-05: GPS method fail-closed when enforce on + active sites — FORBIDDEN silent 201.
    // Manual / omit method without coords = soft-skip (BR-PLT-ATT-WS-08) — not GEO PASS evidence.
    if (gpsOn && checkInMethod === 'gps' && !hasFiniteCoords) {
      const activeCount = await this.attendanceConfig.countActiveWorkSites(
        payload.company_id,
        authorization,
        tenantId,
      );
      if (activeCount > 0) {
        throw new ApiException(
          'HRM-ATT-GEO-REQ',
          'GPS check-in requires latitude and longitude when geofence is enforced',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (hasFiniteCoords && gpsOn) {
      await this.assertWithinWorkSite(
        authorization,
        payload.company_id,
        Number(payload.latitude),
        Number(payload.longitude),
        tenantId,
      );
    }
    // Thất bại nhánh giờ: Diễn biến #4 — ra trước vào.
    this.assertCheckInOutOrder(payload.check_in_at, payload.check_out_at);
    const status = await this.assertAttendanceDayCode({
      companyId: payload.company_id,
      status: payload.status ?? 'pending',
      authorization,
      tenantId,
    });
    try {
      const res = await this.db.query<AttendanceRecordRow>(
        `
          INSERT INTO public.attendance_records (
            id, company_id, employee_id, attendance_date, check_in_at, check_out_at, status, note, created_by
          ) VALUES ($1, $2::uuid, $3::uuid, $4::date, $5, $6, $7, $8, $9)
          RETURNING
            id, company_id, employee_id, attendance_date, check_in_at, check_out_at,
            status, note, created_by, created_at, updated_at,
            leave_request_id::text AS leave_request_id, leave_type_key;
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

      const created = await this.attachEmployeeDisplay(res.rows[0]);
      await this.db.query(
        `
          INSERT INTO public.attendance_events (id, attendance_record_id, event_type, source, payload)
          VALUES ($1, $2::uuid, 'status_change', $3, $4::jsonb)
        `,
        [
          randomUUID(),
          created.id,
          'hrm-api',
          JSON.stringify({ status: created.status }),
        ],
      );
      // Thành công: Diễn biến #7 — khóa bản ghi ngày công.
      const hints = await this.resolveCodeDisplayLookup(
        payload.company_id,
        authorization,
        tenantId,
      );
      return this.mapRecord(created, hints);
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Cannot create attendance record';
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
    const pageSize = this.resolvePageSize(
      query.page_size ?? query.pageSize,
      20,
    );
    const offset = (page - 1) * pageSize;
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      query.company_id,
    );
    const scope = resolveHrmListScope(
      authorization,
      scopeCompanyId,
      scopeContext,
    );
    const filters: string[] = [];
    const values: unknown[] = [];
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'ar.employee_id');
    let idx = values.length + 1;

    if (query.employee_id) {
      filters.push(`ar.employee_id = $${idx}::uuid`);
      values.push(query.employee_id);
      idx += 1;
    }
    if (query.status) {
      filters.push(`ar.status = $${idx}`);
      values.push(query.status);
      idx += 1;
    }
    if (query.from_date) {
      filters.push(`ar.attendance_date >= $${idx}::date`);
      values.push(query.from_date);
      idx += 1;
    }
    if (query.to_date) {
      filters.push(`ar.attendance_date <= $${idx}::date`);
      values.push(query.to_date);
      idx += 1;
    }

    const whereClause = filters.join(' AND ');
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.attendance_records ar WHERE ${whereClause};`,
      values,
    );
    const dataRes = await this.db.query<AttendanceRecordRow>(
      `
        SELECT
          ar.id, ar.company_id, ar.employee_id, ar.attendance_date, ar.check_in_at, ar.check_out_at,
          ar.status, ar.note, ar.created_by, ar.created_at, ar.updated_at,
          ar.leave_request_id::text AS leave_request_id, ar.leave_type_key,
          e.employee_code,
          e.full_name AS employee_name,
          COALESCE(
            NULLIF(TRIM(e.custom_fields->>'department_label'), ''),
            NULLIF(TRIM(e.custom_fields->>'department'), '')
          ) AS department
        FROM public.attendance_records ar
        LEFT JOIN public.employees e
          ON e.id = ar.employee_id AND e.archived_at IS NULL
        WHERE ${whereClause}
        ORDER BY ar.attendance_date DESC, ar.created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, pageSize, offset],
    );

    const hints = await this.resolveCodeDisplayLookup(
      query.company_id,
      authorization,
      scopeContext?.tenantId,
    );
    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      page,
      page_size: pageSize,
      data: dataRes.rows.map((row) => this.mapRecord(row, hints)),
    };
  }

  async getRecordById(
    recordId: string,
    query: GetAttendanceRecordQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      query.company_id,
    );
    const scope = resolveHrmListScope(
      authorization,
      scopeCompanyId,
      scopeContext,
    );
    const filters: string[] = ['ar.id = $1::uuid'];
    const values: unknown[] = [recordId];
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'ar.employee_id');
    const res = await this.db.query<AttendanceRecordRow>(
      `
        SELECT
          ar.id, ar.company_id, ar.employee_id, ar.attendance_date, ar.check_in_at, ar.check_out_at,
          ar.status, ar.note, ar.created_by, ar.created_at, ar.updated_at,
          ar.leave_request_id::text AS leave_request_id, ar.leave_type_key,
          e.employee_code,
          e.full_name AS employee_name,
          COALESCE(
            NULLIF(TRIM(e.custom_fields->>'department_label'), ''),
            NULLIF(TRIM(e.custom_fields->>'department'), '')
          ) AS department
        FROM public.attendance_records ar
        LEFT JOIN public.employees e
          ON e.id = ar.employee_id AND e.archived_at IS NULL
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-ATT-404',
        'Attendance record not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const hints = await this.resolveCodeDisplayLookup(
      query.company_id,
      authorization,
      scopeContext?.tenantId,
    );
    return this.mapRecord(res.rows[0], hints);
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
    this.guardAttendanceMutate(
      existing,
      authorization,
      requestedCompanyId,
      tenantId,
      {
        notFound: 'HRM-ATT-404',
        mismatch: 'HRM-ATT-409',
      },
    );
    const status = await this.assertAttendanceDayCode({
      companyId: requestedCompanyId,
      status: payload.status,
      authorization,
      tenantId,
    });
    const res = await this.db.query<AttendanceRecordRow>(
      `
        UPDATE public.attendance_records
        SET status = $1, note = COALESCE($2, note), updated_at = NOW()
        WHERE id = $3::uuid
        RETURNING
          id, company_id, employee_id, attendance_date, check_in_at, check_out_at,
          status, note, created_by, created_at, updated_at,
          leave_request_id::text AS leave_request_id, leave_type_key;
      `,
      [status, payload.note?.trim() ?? null, recordId],
    );
    const updated = await this.attachEmployeeDisplay(res.rows[0]!);
    if (!updated?.id) {
      throw new ApiException(
        'HRM-ATT-404',
        'Attendance record not found',
        HttpStatus.NOT_FOUND,
      );
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
        JSON.stringify({ status, note: payload.note ?? null }),
      ],
    );
    const hints = await this.resolveCodeDisplayLookup(
      requestedCompanyId,
      authorization,
      tenantId,
    );
    return this.mapRecord(updated, hints);
  }

  async createUpdateRequest(
    payload: CreateAttendanceUpdateRequestDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmOperationsPersistCompanyId(
      authorization,
      payload.company_id,
      { tenantId },
    );
    this.assertCheckInOutOrder(
      payload.current_check_in,
      payload.current_check_out,
    );
    this.assertCheckInOutOrder(
      payload.requested_check_in,
      payload.requested_check_out,
    );
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
    await this.attendanceFanout.onUpdateRequestCreated(
      this.toAttendanceUpdateRequestRealtimePayload(row),
    );
    return mapped;
  }

  async listUpdateRequests(
    query: ListAttendanceUpdateRequestsQueryDto,
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
    const clauses: string[] = [];
    const values: unknown[] = [];
    if (scope.masterTenantPartition || scope.memberTenantId) {
      pushWorkforceEmployeeScopeFilter(
        clauses,
        values,
        scope,
        'aur.employee_id',
      );
    } else {
      // UUID column — expand slug↔Plane B′ so CEO OU=trsport sees persist UUID rows.
      const companyIds = expandHrmTextCompanyIds(
        scope,
        authorization,
        scopeCompanyId,
      );
      pushCompanyIdTextColumnFilter(clauses, values, companyIds);
      const companyFilterIdx = clauses.length - 1;
      clauses[companyFilterIdx] = clauses[companyFilterIdx].replace(
        /^company_id::text/,
        'aur.company_id::text',
      );
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
    return {
      total: res.rows.length,
      data: res.rows.map((row) => this.mapUpdateRequest(row)),
    };
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
    this.guardAttendanceMutate(
      existing,
      authorization,
      requestedCompanyId,
      tenantId,
      {
        notFound: 'HRM-ATT-REQ-404',
        mismatch: 'HRM-ATT-REQ-409',
      },
    );
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
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance update request not found',
        HttpStatus.NOT_FOUND,
      );
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
    this.guardAttendanceMutate(
      existing,
      authorization,
      requestedCompanyId,
      tenantId,
      {
        notFound: 'HRM-ATT-REQ-404',
        mismatch: 'HRM-ATT-REQ-409',
      },
    );
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
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance update request not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const mapped = this.mapUpdateRequest(updated);
    await this.attendanceFanout.onUpdateRequestDecided(
      'approved',
      this.toAttendanceUpdateRequestRealtimePayload(updated),
    );
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
    this.guardAttendanceMutate(
      existing,
      authorization,
      requestedCompanyId,
      tenantId,
      {
        notFound: 'HRM-ATT-REQ-404',
        mismatch: 'HRM-ATT-REQ-409',
      },
    );
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
      [
        payload.approver_name?.trim() ?? null,
        payload.rejected_reason?.trim() ?? null,
        requestId,
      ],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance update request not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const mapped = this.mapUpdateRequest(updated);
    await this.attendanceFanout.onUpdateRequestDecided(
      'rejected',
      this.toAttendanceUpdateRequestRealtimePayload(updated),
    );
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
    this.guardAttendanceMutate(
      existing,
      authorization,
      requestedCompanyId,
      tenantId,
      {
        notFound: 'HRM-ATT-REQ-404',
        mismatch: 'HRM-ATT-REQ-409',
      },
    );
    const res = await this.db.query<{ id: string }>(
      `DELETE FROM public.attendance_update_requests WHERE id = $1::uuid RETURNING id;`,
      [requestId],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-ATT-REQ-404',
        'Attendance update request not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: requestId };
  }
}
