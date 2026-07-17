/**
 * @CODE-MEMORY
 * Screen:     /attendance — Bảng chấm công · PayrollAttendanceTab
 * UC:          UF-HRM-05 · P-CC-07
 * BR:          BR-ATT-SHEET-01
 * SRS:         docs/hrm/SRS.md (attendance sheets)
 * TechSpec:    docs/hrm/TECHSPEC.md attendance-sheets
 * Purpose:     Load attendance sheets via React Query (stable queryKey).
 *              Stops ×N fetch storm from unstable toast/`h` useCallback deps.
 * WorkItem:    D-HRM-ATT-LEAVE-FETCH-STORM
 * Coded:       2026-07-17
 *
 * Callers:
 *   - pages/Attendance.tsx → useAttendanceSheets({ enabled })
 *   - components/payroll/PayrollAttendanceTab.tsx
 *
 * Callees:
 *   - listAttendanceSheets / createAttendanceSheet / updateAttendanceSheet / deleteAttendanceSheet
 *
 * must_keep:   enabled gate for Attendance tab; Nest API (no Supabase)
 * SOLID:       RQ read + invalidate on write (singleflight per company)
 * LastVerified: apps/web/hrm/src/hooks/useAttendanceSheets.test.ts
 */
import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import {
  createAttendanceSheet,
  deleteAttendanceSheet,
  listAttendanceSheets,
  updateAttendanceSheet,
} from '@/integrations/hrmApi';

export interface AttendanceSheet {
  id: string; company_id: string; name: string; start_date: string; end_date: string;
  attendance_type: string; standard_type: string; department: string | null; positions: string | null;
  status: string; created_by: string | null; notes: string | null; created_at: string; updated_at: string;
}

export interface AttendanceSheetInput {
  name: string; start_date: string; end_date: string; attendance_type?: string; standard_type?: string;
  department?: string; positions?: string; notes?: string;
}

export const ATTENDANCE_SHEETS_QUERY_KEY = 'attendance-sheets' as const;

export function buildAttendanceSheetsQueryKey(
  companyId: string | null | undefined,
): readonly unknown[] {
  return [ATTENDANCE_SHEETS_QUERY_KEY, companyId ?? null] as const;
}

export function useAttendanceSheets(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toastedErrorRef = useRef<unknown>(null);

  const queryKey = buildAttendanceSheetsQueryKey(currentCompanyId);

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<AttendanceSheet[]> => {
      if (!currentCompanyId) return [];
      const res = await listAttendanceSheets(currentCompanyId);
      return (res.data ?? []) as AttendanceSheet[];
    },
    enabled: enabled && !!currentCompanyId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (!query.isError || !query.error) {
      toastedErrorRef.current = null;
      return;
    }
    if (toastedErrorRef.current === query.error) return;
    toastedErrorRef.current = query.error;
    console.error('Error fetching attendance sheets:', query.error);
    toast({
      title: t('messages.error'),
      description: toErrorMessage(query.error, t('hk.attendanceSheet.fetchError')),
      variant: 'destructive',
    });
  }, [query.isError, query.error, toast, t]);

  const invalidateSheets = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [ATTENDANCE_SHEETS_QUERY_KEY] });
  }, [queryClient]);

  const fetchSheets = useCallback(async () => {
    if (!enabled) return;
    await query.refetch();
  }, [enabled, query]);

  const createSheet = useCallback(async (input: AttendanceSheetInput): Promise<AttendanceSheet | null> => {
    if (!currentCompanyId) {
      toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' });
      return null;
    }
    try {
      const created = await createAttendanceSheet({ company_id: currentCompanyId, ...input });
      toast({ title: t('messages.success'), description: t('hk.attendanceSheet.createSuccess') });
      await invalidateSheets();
      return created as AttendanceSheet;
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.attendanceSheet.createError')),
        variant: 'destructive',
      });
      return null;
    }
  }, [currentCompanyId, invalidateSheets, toast, t]);

  const updateSheet = useCallback(async (id: string, updates: Partial<AttendanceSheetInput>): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await updateAttendanceSheet(id, currentCompanyId, updates);
      toast({ title: t('messages.success'), description: t('hk.attendanceSheet.updateSuccess') });
      await invalidateSheets();
      return true;
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.attendanceSheet.updateError')),
        variant: 'destructive',
      });
      return false;
    }
  }, [currentCompanyId, invalidateSheets, toast, t]);

  const deleteSheet = useCallback(async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteAttendanceSheet(id, currentCompanyId);
      toast({ title: t('messages.success'), description: t('hk.attendanceSheet.deleteSuccess') });
      await invalidateSheets();
      return true;
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.attendanceSheet.deleteError')),
        variant: 'destructive',
      });
      return false;
    }
  }, [currentCompanyId, invalidateSheets, toast, t]);

  return {
    sheets: query.data ?? [],
    isLoading: enabled ? query.isLoading : false,
    isFetching: query.isFetching,
    createSheet,
    updateSheet,
    deleteSheet,
    refetch: fetchSheets,
    queryKey,
  };
}
