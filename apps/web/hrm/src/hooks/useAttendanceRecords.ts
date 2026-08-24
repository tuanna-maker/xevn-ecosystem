/**
 * @CODE-MEMORY
 * Screen: HRM Chấm công → records check-in/out (Clock-In hub consumers)
 * UC: HRM-AT-01 · BR: GPS geofence khi lat+lon có mặt trên POST records
 * SRS: docs/hrm/SRS.md · SRS_VN geofence · by-uc/HRM-AT-01.md · matrix #10 GPS
 * TechSpec: docs/hrm/TECHSPEC.md · CreateAttendanceRecordDto latitude/longitude
 * Purpose: Map UI check-in → Nest createAttendanceRecord; truyền GPS lat/lon khi có.
 * WorkItem: PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
 * Coded: 2026-08-04
 * Callers: GPSAttendance · CheckInOutWidget · QRCodeScanner · FaceIDScanner · AttendanceRecordsTable
 * Callees: createAttendanceRecord · listAttendanceRecords · updateAttendanceStatus
 * must_keep: Manual check-in không bắt lat/lon; Face HOLD; OT/SHEETS không đụng; U65
 * Impact: Thiếu lat/lon trên GPS → silent 201 (R-MFD-M2-CLOCK-GPS-LATLON)
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
 * change_mode: FIX
 * What: CheckInData + buildAttendanceCheckInApiPayload + checkIn forward latitude/longitude
 * Why: QA FAIL — GPS UI coords nhưng POST omit → HRM-ATT-GEO-001 không bao giờ chạy
 * must_keep: manual path omit coords; toast error via toErrorMessage (GEO-001 surface)
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01
 * change_mode: FIX
 * What: toApiAttendanceStatus + updateRecord luôn PATCH status hợp lệ BE (pending|present|absent|leave)
 * Why: R-MFD-M2-ATT-RECORDS-EDIT-STUB — Sửa modal → PATCH /records/:id/status (HRM-AT-03)
 * must_keep: list GET LIVE; Delete không thay Edit; CLOCK/SHEETS/LEAVE/OT; U65; không claim Face/CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-FE
 * change_mode: FIX
 * What: Giữ check_in_at trên AttendanceRecord UI để fallback ngày khi attendance_date non-ISO
 * Why: QA date-crash — list DTO «Tue Aug 04»; edit Dialog cần ISO fallback không throw
 * must_keep: list/updateRecord path; không đụng CLOCK create payload
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE
 * change_mode: FIX
 * What: updateRecord/checkOut/deleteRecord pass currentCompanyId → updateAttendanceStatus mutate scope
 * Why: QA R2 PATCH 409 HRM-ATT-409 — browser x-company-id=main vs OU trsport (parity leave/ATT approve)
 * must_keep: list GET LIVE; DATE harden + edit testids; no Delete as AT-03 PASS; CLOCK/SHEETS/LEAVE/OT
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-ATT-LEAVE-FUNNEL-FE-01
 * change_mode: ADD
 * What: toUiRecord passthrough leave_request_id / leave_type / leave_type_label / status_label from GET records
 * Why: F-ATT-LEAVE-FUNNEL-03 Bản ghi bind display-ready — cấm null hardcode + Option C leave join
 * must_keep: no second GET leave-requests; no poll beyond fetchRecords; J-HRM-06b; attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01
 * change_mode: ADD
 * What: CheckInData + buildAttendanceCheckInApiPayload + checkIn forward check_in_method (gps)
 * Why: R-PLT-ATT-WS-FE-CNS-05 — FE omit method → BE CNS-05 HRM-ATT-GEO-REQ never from UI GPS path
 * must_keep: manual/QR/Face omit method soft-skip RETAIN; lat/lon GPS; soft empty / CTA; no ensureDefault; U65; attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01
 * change_mode: ADD
 * What: toApiAttendanceStatus pass-through Nest open key; updateRecord surface HRM-ATT-CODE-KEY
 * Why: SA Option A — EFF>0 submit Nest code (VAL-CNS-06); closed-4 coerce chỉ soft bootstrap
 * must_keep: list GET LIVE; CLOCK/SHEETS/LEAVE/OT Nest pickers; L1 KEY LIVE; U65; attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02
 * change_mode: FIX
 * What: CheckInData.status + checkIn dùng toApiAttendanceStatus; cấm sole hardcode present khi caller truyền Nest key
 * Why: R-ATT-03D-CNS-STATUS-CODE — GPS EFF>0 → HRM-ATT-CODE-KEY nếu POST present ∉ catalog
 * must_keep: EFF=0 bootstrap present; GEO lat/lon + method=gps; ATT-03d honesty; U65
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { clampHrmPageSize } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import {
  ATT_ATTENDANCE_CODE_KEY_FORMAT,
  HRM_ATT_CODE_KEY_CODE,
} from '@/hooks/useAttAttendanceCodesEffective';
import {
  createAttendanceRecord,
  HrmAttendanceRecord,
  HrmAttendanceStatus,
  HrmEmployeeRecord,
  listAttendanceRecords,
  listEmployees,
  updateAttendanceStatus,
} from '@/integrations/hrmApi';

export interface AttendanceRecord {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; attendance_date: string; check_in_time: string | null; check_out_time: string | null;
  /** Raw Nest check_in_at — date-display fallback when attendance_date is non-ISO (AT-03 edit). */
  check_in_at?: string | null;
  scheduled_hours: number | null; actual_hours: number | null; overtime_hours: number | null; status: string;
  /** BE display-ready status_label (F-ATT-LEAVE-FUNNEL-03). */
  status_label?: string | null;
  attendance_type: string | null; late_minutes: number | null; early_leave_minutes: number | null;
  leave_type: string | null; leave_type_label?: string | null; leave_request_id: string | null;
  check_in_location: string | null;
  check_out_location: string | null; check_in_device: string | null; check_out_device: string | null;
  notes: string | null; approved_by: string | null; approved_at: string | null;
  created_at: string; updated_at: string;
}

/** Nest CreateAttendanceRecordDto.check_in_method — gps path must set for CNS-05 GEO-REQ. */
export type AttendanceCheckInMethod = 'gps' | 'manual' | 'qr' | 'wifi' | 'face';

export interface CheckInData {
  employee_id: string; employee_code: string; employee_name: string; department?: string;
  check_in_location?: string; check_in_device?: string; attendance_type?: string; notes?: string;
  /** GPS / device coords — required for BE geofence (HRM-ATT-GEO-001) */
  latitude?: number;
  longitude?: number;
  /**
   * Punch channel — GPSAttendance must send `gps` so BE can emit HRM-ATT-GEO-REQ when coords omitted.
   * Manual/QR/Face omit → soft-skip RETAIN (BR-PLT-ATT-WS-08).
   */
  check_in_method?: AttendanceCheckInMethod;
  /** Nest att_attendance_code.code — GPS EFF>0 bắt buộc qua picker. */
  status?: string;
}
export function buildAttendanceCheckInApiPayload(input: {
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string;
  status?: string;
  note?: string;
  created_by?: string;
  latitude?: number;
  longitude?: number;
  check_in_method?: AttendanceCheckInMethod;
}): {
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at: string;
  status: string;
  note?: string;
  created_by?: string;
  latitude?: number;
  longitude?: number;
  check_in_method?: AttendanceCheckInMethod;
} {
  const payload: {
    company_id: string;
    employee_id: string;
    attendance_date: string;
    check_in_at: string;
    status: string;
    note?: string;
    created_by?: string;
    latitude?: number;
    longitude?: number;
    check_in_method?: AttendanceCheckInMethod;
  } = {
    company_id: input.company_id,
    employee_id: input.employee_id,
    attendance_date: input.attendance_date,
    check_in_at: input.check_in_at,
    status: toApiAttendanceStatus(input.status ?? 'present'),
  };
  if (input.note !== undefined) payload.note = input.note;
  if (input.created_by !== undefined) payload.created_by = input.created_by;
  if (input.check_in_method) {
    payload.check_in_method = input.check_in_method;
  }
  if (
    typeof input.latitude === 'number' &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === 'number' &&
    Number.isFinite(input.longitude)
  ) {
    payload.latitude = input.latitude;
    payload.longitude = input.longitude;
  }
  return payload;
}

export interface CheckOutData { check_out_location?: string; check_out_device?: string; notes?: string; }

export function buildAttendanceRecordsQuery(companyId: string, fromDate?: string) {
  return {
    company_id: coerceHrmListCompanyId(companyId),
    ...(fromDate ? { from_date: fromDate } : {}),
    page_size: clampHrmPageSize(100),
  };
}

/**
 * Bootstrap closed-4 — dùng khi EFF=0 hoặc soft-alias legacy UI.
 * Khi EFF>0, PATCH status = Nest open key (string); BE assert HRM-ATT-CODE-KEY.
 */
export type ApiAttendanceStatus = 'pending' | 'present' | 'absent' | 'leave';

/**
 * Map UI / display status → API PATCH status (open catalog).
 * Format-valid Nest keys pass through (wfh, ct, …) — KHÔNG coerce về closed-4.
 * Legacy display aliases (late/early_leave/on_leave) chỉ soft-map khi KHÔNG khớp format
 * hoặc khi caller bootstrap EFF=0 đã resolve sẵn — ở đây: alias vẫn pass-through
 * nếu đúng KEY format (BE KEY quyết định); soft coerce chỉ cho alias không còn là SoT edit.
 */
export function toApiAttendanceStatus(status: string | null | undefined): string {
  const s = (status ?? '').trim().toLowerCase().replace(/-/g, '_');
  if (!s) return 'pending';
  // Nest open catalog — pass through format-valid keys (AC-PLT-ATT-CODE-01 · L-ATT-CODE-FE-02).
  if (ATT_ATTENDANCE_CODE_KEY_FORMAT.test(s)) return s;
  return 'pending';
}

function toTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(11, 16) || null;
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function employeeDisplayFromRecord(emp: HrmEmployeeRecord): Partial<AttendanceRecord> {
  const custom = emp.custom_fields ?? {};
  const department =
    custom.department_label?.trim() ||
    emp.department?.trim() ||
    custom.department?.trim() ||
    null;
  return {
    employee_code: emp.employee_code,
    employee_name: emp.display_name?.trim() || emp.full_name,
    department,
  };
}

async function loadEmployeeDisplayLookup(
  companyId: string,
): Promise<Map<string, Partial<AttendanceRecord>>> {
  const map = new Map<string, Partial<AttendanceRecord>>();
  const pageSize = clampHrmPageSize(500);
  let page = 1;
  for (;;) {
    const res = await listEmployees({ company_id: companyId, page, page_size: pageSize });
    for (const emp of res.data ?? []) {
      map.set(emp.id, employeeDisplayFromRecord(emp));
    }
    if (!res.data?.length || res.data.length < pageSize) break;
    page += 1;
    if (page > 5) break;
  }
  return map;
}

function toUiRecord(row: HrmAttendanceRecord, fallback?: Partial<AttendanceRecord>): AttendanceRecord {
  const checkInTime = toTime(row.check_in_at);
  const checkOutTime = toTime(row.check_out_at);
  const checkInMinutes = checkInTime ? Number(checkInTime.slice(0, 2)) * 60 + Number(checkInTime.slice(3, 5)) : 0;
  const checkOutMinutes = checkOutTime ? Number(checkOutTime.slice(0, 2)) * 60 + Number(checkOutTime.slice(3, 5)) : 0;
  const actualHours = checkInTime && checkOutTime ? Math.round(((checkOutMinutes - checkInMinutes) / 60) * 100) / 100 : null;
  const lateMinutes = checkInTime ? Math.max(0, checkInMinutes - 8 * 60) : 0;
  const earlyLeaveMinutes = checkOutTime ? Math.max(0, 17 * 60 - checkOutMinutes) : 0;
  const overtimeHours = checkOutTime ? Math.round((Math.max(0, checkOutMinutes - 17 * 60) / 60) * 100) / 100 : 0;

  return {
    id: row.id,
    company_id: row.company_id,
    employee_id: row.employee_id,
    employee_code: row.employee_code?.trim() || fallback?.employee_code || 'N/A',
    employee_name: row.employee_name?.trim() || fallback?.employee_name || 'N/A',
    department: (row.department?.trim() || fallback?.department) ?? null,
    attendance_date: row.attendance_date,
    check_in_time: checkInTime,
    check_out_time: checkOutTime,
    check_in_at: row.check_in_at ?? null,
    scheduled_hours: null,
    actual_hours: actualHours,
    overtime_hours: overtimeHours,
    status: row.status,
    status_label: row.status_label?.trim() || null,
    attendance_type: fallback?.attendance_type ?? 'normal',
    late_minutes: lateMinutes,
    early_leave_minutes: earlyLeaveMinutes,
    leave_type: row.leave_type?.trim() || row.leave_type_key?.trim() || null,
    leave_type_label: row.leave_type_label?.trim() || null,
    leave_request_id: row.leave_request_id ?? null,
    check_in_location: fallback?.check_in_location ?? null,
    check_out_location: fallback?.check_out_location ?? null,
    check_in_device: fallback?.check_in_device ?? null,
    check_out_device: fallback?.check_out_device ?? null,
    notes: row.note,
    approved_by: null,
    approved_at: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useAttendanceRecords(dateFilter?: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const { currentCompanyId, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string, opts?: any): string => t(`hk.attendance.${key}`, opts) as string;
  const today = new Date().toISOString().split('T')[0];

  const fetchRecords = useCallback(async () => {
    if (!currentCompanyId) { setRecords([]); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const response = await listAttendanceRecords({
        company_id: currentCompanyId,
        from_date: dateFilter,
        to_date: dateFilter,
        page: 1,
        page_size: clampHrmPageSize(100),
      });
      const rows = response.data ?? [];
      const needsEmployeeLookup = rows.some((row) => !row.employee_name?.trim());
      let employeeLookup: Map<string, Partial<AttendanceRecord>> | undefined;
      if (needsEmployeeLookup) {
        try {
          employeeLookup = await loadEmployeeDisplayLookup(currentCompanyId);
        } catch (lookupError) {
          console.warn('Attendance records: employee lookup fallback failed', lookupError);
        }
      }
      setRecords(
        rows.map((row) => toUiRecord(row, employeeLookup?.get(row.employee_id))),
      );
    } catch (error: any) {
      console.error('Error fetching attendance records:', error);
      toast({ title: t('messages.error'), description: toErrorMessage(error, h('fetchError')), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, dateFilter, toast, t]);

  const fetchTodayRecord = useCallback(async (employeeId: string) => {
    if (!currentCompanyId) return null;
    try {
      const response = await listAttendanceRecords({
        company_id: currentCompanyId,
        employee_id: employeeId,
        from_date: today,
        to_date: today,
        page: 1,
        page_size: 1,
      });
      const mapped = response.data?.[0] ? toUiRecord(response.data[0]) : null;
      setTodayRecord(mapped);
      return mapped;
    } catch (error: any) { console.error('Error fetching today record:', error); return null; }
  }, [currentCompanyId, today]);

  const checkIn = useCallback(async (data: CheckInData): Promise<AttendanceRecord | null> => {
    if (!currentCompanyId) { toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' }); return null; }
    try {
      const now = new Date();
      const checkInTime = now.toTimeString().split(' ')[0].slice(0, 5);
      const existing = await fetchTodayRecord(data.employee_id);
      if (existing?.check_in_time) { toast({ title: t('hk.notice'), description: h('alreadyCheckedIn'), variant: 'destructive' }); return null; }
      const standardStartTime = 8 * 60;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const lateMinutes = Math.max(0, currentMinutes - standardStartTime);
      const explicitStatus = (data.status ?? '').trim();
      const apiStatus = explicitStatus
        ? toApiAttendanceStatus(explicitStatus)
        : toApiAttendanceStatus(lateMinutes > 0 ? 'late' : 'present');
      const checkInIso = new Date(`${today}T${checkInTime}:00`).toISOString();
      const built = buildAttendanceCheckInApiPayload({
          company_id: currentCompanyId,
          employee_id: data.employee_id,
          attendance_date: today,
          check_in_at: checkInIso,
          status: apiStatus,
          note: data.notes,
          created_by: user?.id ?? undefined,
          latitude: data.latitude,
          longitude: data.longitude,
          check_in_method: data.check_in_method,
        });
      const created = await createAttendanceRecord({
        ...built,
        status: built.status as HrmAttendanceStatus,
      });
      const newRecord = toUiRecord(created, {
        employee_code: data.employee_code,
        employee_name: data.employee_name,
        department: data.department ?? null,
        attendance_type: data.attendance_type ?? 'normal',
        check_in_location: data.check_in_location ?? null,
        check_in_device: data.check_in_device ?? 'Web App',
      });
      const lateText = lateMinutes > 0 ? h('checkinLate', { minutes: lateMinutes }) : '';
      toast({ title: h('checkinSuccess'), description: h('checkinDesc', { name: data.employee_name, time: checkInTime }) + lateText });
      await fetchRecords();
      setTodayRecord(newRecord);
      return newRecord;
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast({ title: h('checkinError'), description: toErrorMessage(error, h('checkinErrorDesc')), variant: 'destructive' }); return null;
    }
  }, [currentCompanyId, today, fetchRecords, fetchTodayRecord, toast, t, user?.id]);

  const checkOut = useCallback(async (employeeId: string, data?: CheckOutData): Promise<AttendanceRecord | null> => {
    if (!currentCompanyId) { toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' }); return null; }
    try {
      const existing = await fetchTodayRecord(employeeId);
      if (!existing) { toast({ title: t('messages.error'), description: h('notCheckedIn'), variant: 'destructive' }); return null; }
      if (existing.check_out_time) { toast({ title: t('hk.notice'), description: h('alreadyCheckedOut'), variant: 'destructive' }); return null; }
      const now = new Date();
      const checkOutTime = now.toTimeString().split(' ')[0].slice(0, 5);
      const checkInParts = existing.check_in_time!.split(':');
      const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
      const checkOutMinutes = now.getHours() * 60 + now.getMinutes();
      const actualHours = Math.round((checkOutMinutes - checkInMinutes) / 60 * 100) / 100;
      const standardEndTime = 17 * 60;
      const earlyLeaveMinutes = Math.max(0, standardEndTime - checkOutMinutes);
      const overtimeMinutes = Math.max(0, checkOutMinutes - standardEndTime);
      const overtimeHours = Math.round(overtimeMinutes / 60 * 100) / 100;
      let status = existing.status;
      if (earlyLeaveMinutes > 0 && existing.late_minutes && existing.late_minutes > 0) status = 'late';
      else if (earlyLeaveMinutes > 0) status = 'early_leave';
      const updated = await updateAttendanceStatus(
        existing.id,
        {
          status: status === 'early_leave' ? 'present' : (status as 'present' | 'absent' | 'leave' | 'pending'),
          note: data?.notes ? `${existing.notes || ''}\n${data.notes}`.trim() : (existing.notes ?? undefined),
          updated_by: user?.id ?? undefined,
        },
        currentCompanyId,
      );
      const updatedRecord = toUiRecord(updated, {
        ...existing,
        check_out_location: data?.check_out_location ?? existing.check_out_location,
        check_out_device: data?.check_out_device ?? existing.check_out_device,
      });
      updatedRecord.check_out_time = checkOutTime;
      updatedRecord.actual_hours = actualHours;
      updatedRecord.early_leave_minutes = earlyLeaveMinutes;
      updatedRecord.overtime_hours = overtimeHours;
      updatedRecord.status = status;
      const otText = overtimeHours > 0 ? h('checkoutOT', { hours: overtimeHours }) : '';
      toast({ title: h('checkoutSuccess'), description: h('checkoutDesc', { time: checkOutTime, hours: actualHours }) + otText });
      await fetchRecords();
      setTodayRecord(updatedRecord);
      return updatedRecord;
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast({ title: h('checkoutError'), description: toErrorMessage(error, h('checkoutErrorDesc')), variant: 'destructive' }); return null;
    }
  }, [currentCompanyId, fetchRecords, fetchTodayRecord, toast, t, user?.id]);

  const updateRecord = useCallback(async (id: string, updates: Partial<AttendanceRecord>): Promise<boolean> => {
    try {
      const statusKey = toApiAttendanceStatus(updates.status);
      await updateAttendanceStatus(
        id,
        {
          // Open catalog — cast giữ type HrmAttendanceStatus closed-4 legacy; runtime = Nest code.
          status: statusKey as HrmAttendanceStatus,
          note: updates.notes ?? undefined,
          updated_by: user?.id ?? undefined,
        },
        currentCompanyId ?? undefined,
      );
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchRecords(); return true;
    } catch (error: unknown) {
      const code = (error as { code?: string } | null)?.code;
      const description =
        code === HRM_ATT_CODE_KEY_CODE
          ? t('hk.attendance.attCodeKeyError', {
              defaultValue:
                'Ký hiệu công không thuộc danh mục hiệu lực của đơn vị. Chọn lại mã trong danh sách rồi lưu lại.',
            })
          : toErrorMessage(error, h('updateError'));
      toast({ title: t('messages.error'), description, variant: 'destructive' });
      return false;
    }
  }, [currentCompanyId, fetchRecords, toast, t, user?.id]);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      await updateAttendanceStatus(
        id,
        {
          status: 'absent',
          note: 'Marked absent from HRM web client',
          updated_by: user?.id ?? undefined,
        },
        currentCompanyId ?? undefined,
      );
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchRecords(); return true;
    } catch (error: any) {
      const fallback = error instanceof ApiClientError ? error.message : h('deleteError');
      toast({ title: t('messages.error'), description: toErrorMessage(error, fallback), variant: 'destructive' }); return false;
    }
  }, [currentCompanyId, fetchRecords, toast, t, user?.id]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return { records, isLoading, todayRecord, checkIn, checkOut, updateRecord, deleteRecord, fetchTodayRecord, refetch: fetchRecords };
}
