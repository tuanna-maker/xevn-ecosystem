import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { clampHrmPageSize } from '@/lib/hrmDataMode';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import {
  createAttendanceRecord,
  HrmAttendanceRecord,
  listAttendanceRecords,
  updateAttendanceStatus,
} from '@/integrations/hrmApi';

export interface AttendanceRecord {
  id: string; company_id: string; employee_id: string; employee_code: string; employee_name: string;
  department: string | null; attendance_date: string; check_in_time: string | null; check_out_time: string | null;
  scheduled_hours: number | null; actual_hours: number | null; overtime_hours: number | null; status: string;
  attendance_type: string | null; late_minutes: number | null; early_leave_minutes: number | null;
  leave_type: string | null; leave_request_id: string | null; check_in_location: string | null;
  check_out_location: string | null; check_in_device: string | null; check_out_device: string | null;
  notes: string | null; approved_by: string | null; approved_at: string | null;
  created_at: string; updated_at: string;
}

export interface CheckInData {
  employee_id: string; employee_code: string; employee_name: string; department?: string;
  check_in_location?: string; check_in_device?: string; attendance_type?: string; notes?: string;
}

export interface CheckOutData { check_out_location?: string; check_out_device?: string; notes?: string; }

export function buildAttendanceRecordsQuery(companyId: string, fromDate?: string) {
  return {
    company_id: coerceHrmListCompanyId(companyId),
    ...(fromDate ? { from_date: fromDate } : {}),
    page_size: clampHrmPageSize(100),
  };
}

function toTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(11, 16) || null;
  return date.toISOString().slice(11, 16);
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
    employee_code: fallback?.employee_code ?? 'N/A',
    employee_name: fallback?.employee_name ?? 'N/A',
    department: fallback?.department ?? null,
    attendance_date: row.attendance_date,
    check_in_time: checkInTime,
    check_out_time: checkOutTime,
    scheduled_hours: null,
    actual_hours: actualHours,
    overtime_hours: overtimeHours,
    status: row.status,
    attendance_type: fallback?.attendance_type ?? 'normal',
    late_minutes: lateMinutes,
    early_leave_minutes: earlyLeaveMinutes,
    leave_type: null,
    leave_request_id: null,
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
        page_size: dateFilter ? 200 : 500,
      });
      setRecords((response.data ?? []).map((row) => toUiRecord(row)));
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
      const status = lateMinutes > 0 ? 'late' : 'present';
      const checkInIso = new Date(`${today}T${checkInTime}:00`).toISOString();
      const created = await createAttendanceRecord({
        company_id: currentCompanyId,
        employee_id: data.employee_id,
        attendance_date: today,
        check_in_at: checkInIso,
        status: status === 'late' ? 'present' : 'present',
        note: data.notes,
        created_by: user?.id ?? undefined,
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
      const updated = await updateAttendanceStatus(existing.id, {
        status: status === 'early_leave' ? 'present' : (status as 'present' | 'absent' | 'leave' | 'pending'),
        note: data?.notes ? `${existing.notes || ''}\n${data.notes}`.trim() : (existing.notes ?? undefined),
        updated_by: user?.id ?? undefined,
      });
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
      await updateAttendanceStatus(id, {
        status: (updates.status as 'pending' | 'present' | 'absent' | 'leave') ?? 'pending',
        note: updates.notes ?? undefined,
        updated_by: user?.id ?? undefined,
      });
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchRecords(); return true;
    } catch (error: any) {
      toast({ title: t('messages.error'), description: toErrorMessage(error, h('updateError')), variant: 'destructive' }); return false;
    }
  }, [fetchRecords, toast, t, user?.id]);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      await updateAttendanceStatus(id, {
        status: 'absent',
        note: 'Marked absent from HRM web client',
        updated_by: user?.id ?? undefined,
      });
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchRecords(); return true;
    } catch (error: any) {
      const fallback = error instanceof ApiClientError ? error.message : h('deleteError');
      toast({ title: t('messages.error'), description: toErrorMessage(error, fallback), variant: 'destructive' }); return false;
    }
  }, [fetchRecords, toast, t, user?.id]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return { records, isLoading, todayRecord, checkIn, checkOut, updateRecord, deleteRecord, fetchTodayRecord, refetch: fetchRecords };
}
