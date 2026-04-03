import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
      let query = supabase.from('attendance_records').select('*').eq('company_id', currentCompanyId).order('attendance_date', { ascending: false }).order('check_in_time', { ascending: false });
      if (dateFilter) query = query.eq('attendance_date', dateFilter);
      else query = query.limit(500);
      const { data, error } = await query;
      if (error) throw error;
      setRecords((data as AttendanceRecord[]) || []);
    } catch (error: any) {
      console.error('Error fetching attendance records:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, dateFilter, toast, t]);

  const fetchTodayRecord = useCallback(async (employeeId: string) => {
    if (!currentCompanyId) return null;
    try {
      const { data, error } = await supabase.from('attendance_records').select('*').eq('company_id', currentCompanyId).eq('employee_id', employeeId).eq('attendance_date', today).maybeSingle();
      if (error) throw error;
      setTodayRecord(data as AttendanceRecord | null);
      return data as AttendanceRecord | null;
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
      const { data: newRecord, error } = await supabase.from('attendance_records').insert({
        company_id: currentCompanyId, employee_id: data.employee_id, employee_code: data.employee_code,
        employee_name: data.employee_name, department: data.department || null, attendance_date: today,
        check_in_time: checkInTime, status, attendance_type: data.attendance_type || 'normal',
        late_minutes: lateMinutes, check_in_location: data.check_in_location || null,
        check_in_device: data.check_in_device || 'Web App', notes: data.notes || null,
      }).select().single();
      if (error) throw error;
      const lateText = lateMinutes > 0 ? h('checkinLate', { minutes: lateMinutes }) : '';
      toast({ title: h('checkinSuccess'), description: h('checkinDesc', { name: data.employee_name, time: checkInTime }) + lateText });
      await fetchRecords();
      setTodayRecord(newRecord as AttendanceRecord);
      return newRecord as AttendanceRecord;
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast({ title: h('checkinError'), description: error.message || h('checkinErrorDesc'), variant: 'destructive' }); return null;
    }
  }, [currentCompanyId, today, fetchRecords, fetchTodayRecord, toast, t]);

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
      const updateData = {
        check_out_time: checkOutTime, actual_hours: actualHours, early_leave_minutes: earlyLeaveMinutes,
        overtime_hours: overtimeHours, status, check_out_location: data?.check_out_location || null,
        check_out_device: data?.check_out_device || 'Web App',
        notes: data?.notes ? `${existing.notes || ''}\n${data.notes}`.trim() : existing.notes,
      };
      const { data: updatedRecord, error } = await supabase.from('attendance_records').update(updateData).eq('id', existing.id).select().single();
      if (error) throw error;
      const otText = overtimeHours > 0 ? h('checkoutOT', { hours: overtimeHours }) : '';
      toast({ title: h('checkoutSuccess'), description: h('checkoutDesc', { time: checkOutTime, hours: actualHours }) + otText });
      await fetchRecords();
      setTodayRecord(updatedRecord as AttendanceRecord);
      return updatedRecord as AttendanceRecord;
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast({ title: h('checkoutError'), description: error.message || h('checkoutErrorDesc'), variant: 'destructive' }); return null;
    }
  }, [currentCompanyId, fetchRecords, fetchTodayRecord, toast, t]);

  const updateRecord = useCallback(async (id: string, updates: Partial<AttendanceRecord>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('attendance_records').update(updates).eq('id', id);
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchRecords(); return true;
    } catch (error: any) {
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' }); return false;
    }
  }, [fetchRecords, toast, t]);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('attendance_records').delete().eq('id', id);
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('deleteSuccess') });
      await fetchRecords(); return true;
    } catch (error: any) {
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  }, [fetchRecords, toast, t]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return { records, isLoading, todayRecord, checkIn, checkOut, updateRecord, deleteRecord, fetchTodayRecord, refetch: fetchRecords };
}
