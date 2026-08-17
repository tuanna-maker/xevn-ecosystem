/**
 * @CODE-MEMORY
 * Screen:     Attendance → tab Ca làm việc / cài đặt ca (WorkShift settings)
 * UC:         HRM-AT-01 · UF-HRM chấm công ca
 * SRS:        docs/hrm/SRS.md · chấm công / ca làm việc
 * Purpose:    Hook CRUD danh sách ca làm việc qua listWorkShifts + mutate API;
 *             toast i18n hk.workShift.*; refetch sau create/update/delete/bulk.
 * WorkItem:   PO-UC-TC-W4-FE-ATT-WORKSHIFT-UPDATE-LOOP-01
 * Coded:      2026-08-04
 * Callers:    Attendance.tsx (useWorkShifts)
 * Callees:    listWorkShifts, createWorkShift, updateWorkShift, deleteWorkShift
 * must_keep:  listWorkShifts theo currentCompanyId; enabled gate; U65 no seed
 * SOLID:      Một hook sở hữu fetch + mutate; không helper i18n không ổn định trong deps
 * LastVerified: docs/qa/evidence/po-uc-tc-w4-fe-att-workshift-update-loop-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-ATT-WORKSHIFT-UPDATE-LOOP-01
 * change_mode: FIX
 * What: Bỏ helper `h` tái tạo mỗi render khỏi deps useCallback; dùng trực tiếp t('hk.workShift.*')
 * Why: fetchShifts đổi identity → useEffect vòng lặp Maximum update depth
 * must_keep: CRUD + bulkDelete + refetch; toast i18n; enabled/currentCompanyId trigger
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-SHIFTS-02
 * change_mode: FIX
 * What: Re-verify loop fix — fetchShifts deps chỉ [currentCompanyId, toast, t]; không helper `h`
 * Why: M2 P0-5 must_keep — schedule/OT menu honesty không được regress Maximum update depth
 * must_keep: enabled gate; list LIVE trên Danh sách ca; không invent roster fetch
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Map statusLabelVi FE-derive (parseAtt01WorkShiftDisplay); invalidate effective picker
 *       after CRUD; honesty ≠ catalog alone = ATT-01 DONE · Nest /core 0 · no roster invent.
 * Why: UC-BP-ATT-01 · API-01 F-ATT-CAT-SHIFT-01/02/EFF · BA J-HRM-ATT-01-01/05/06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md
 * must_keep: ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C ·
 *            ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · R-ATT-01-ASSIGN open · Lịch GĐ2-HOLD ·
 *            printable false · PAY OUT · DENY att_leave_hold · U65
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import { parseAtt01WorkShiftDisplay } from '@/lib/attShift01Ring';
import {
  createWorkShift,
  deleteWorkShift,
  listWorkShifts,
  updateWorkShift,
} from '@/integrations/hrmApi';
import { WORK_SHIFTS_EFFECTIVE_QUERY_KEY } from '@/hooks/useWorkShiftsEffective';

export interface WorkShift {
  id: string;
  company_id: string;
  code: string;
  name: string;
  department: string | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  work_hours: number | null;
  coefficient: number | null;
  is_night_shift: boolean | null;
  is_overtime_shift: boolean | null;
  color: string | null;
  status: string;
  /** Display-ready VI — FE-derive when BE omits (R-ATT-01-DISP). */
  statusLabelVi: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkShiftInput {
  code: string;
  name: string;
  department?: string;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  work_hours?: number;
  coefficient?: number;
  is_night_shift?: boolean;
  is_overtime_shift?: boolean;
  color?: string;
  status?: string;
  notes?: string;
}

function mapWorkShiftRow(row: Record<string, unknown>): WorkShift {
  const display = parseAtt01WorkShiftDisplay(row);
  return {
    id: String(row.id ?? display.shiftId ?? ''),
    company_id: String(row.company_id ?? ''),
    code: display.code,
    name: display.name,
    department: display.department,
    start_time: display.startTime ?? String(row.start_time ?? ''),
    end_time: display.endTime ?? String(row.end_time ?? ''),
    break_start: row.break_start != null ? String(row.break_start) : null,
    break_end: row.break_end != null ? String(row.break_end) : null,
    work_hours: row.work_hours != null ? Number(row.work_hours) : null,
    coefficient: display.workFactor,
    is_night_shift: row.is_night_shift == null ? null : Boolean(row.is_night_shift),
    is_overtime_shift: row.is_overtime_shift == null ? null : Boolean(row.is_overtime_shift),
    color: row.color != null ? String(row.color) : null,
    status: display.status,
    statusLabelVi: display.statusLabelVi,
    notes: row.notes != null ? String(row.notes) : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export function useWorkShifts(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const invalidateEffectivePicker = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [WORK_SHIFTS_EFFECTIVE_QUERY_KEY] });
  }, [queryClient]);

  const fetchShifts = useCallback(async () => {
    if (!currentCompanyId) {
      setShifts([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await listWorkShifts(currentCompanyId);
      const rows = (res.data ?? []) as Record<string, unknown>[];
      setShifts(rows.map(mapWorkShiftRow));
    } catch (error: unknown) {
      console.error('Error fetching work shifts:', error);
      setShifts([]);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.workShift.fetchError')),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t]);

  const createShift = useCallback(
    async (input: WorkShiftInput): Promise<WorkShift | null> => {
      if (!currentCompanyId) {
        toast({
          title: t('messages.error'),
          description: t('hk.noCompany'),
          variant: 'destructive',
        });
        return null;
      }
      try {
        const data = await createWorkShift({ company_id: currentCompanyId, ...input });
        toast({
          title: t('messages.success'),
          description: t('hk.workShift.createSuccess', { name: input.name }),
        });
        invalidateEffectivePicker();
        await fetchShifts();
        return mapWorkShiftRow(data as Record<string, unknown>);
      } catch (error: unknown) {
        console.error('Error creating work shift:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, t('hk.workShift.createError')),
          variant: 'destructive',
        });
        return null;
      }
    },
    [currentCompanyId, fetchShifts, invalidateEffectivePicker, toast, t],
  );

  const updateShift = useCallback(
    async (id: string, updates: Partial<WorkShiftInput>): Promise<boolean> => {
      if (!currentCompanyId) return false;
      try {
        await updateWorkShift(id, currentCompanyId, updates);
        toast({
          title: t('messages.success'),
          description: t('hk.workShift.updateSuccess'),
        });
        invalidateEffectivePicker();
        await fetchShifts();
        return true;
      } catch (error: unknown) {
        console.error('Error updating work shift:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, t('hk.workShift.updateError')),
          variant: 'destructive',
        });
        return false;
      }
    },
    [currentCompanyId, fetchShifts, invalidateEffectivePicker, toast, t],
  );

  const deleteShift = useCallback(
    async (id: string): Promise<boolean> => {
      if (!currentCompanyId) return false;
      try {
        await deleteWorkShift(id, currentCompanyId);
        toast({
          title: t('messages.success'),
          description: t('hk.workShift.deleteSuccess'),
        });
        invalidateEffectivePicker();
        await fetchShifts();
        return true;
      } catch (error: unknown) {
        console.error('Error deleting work shift:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, t('hk.workShift.deleteError')),
          variant: 'destructive',
        });
        return false;
      }
    },
    [currentCompanyId, fetchShifts, invalidateEffectivePicker, toast, t],
  );

  /** UX-09: bulk delete selected shifts (sequential API; one toast). */
  const bulkDeleteShifts = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (!currentCompanyId || ids.length === 0) return false;
      let failed = 0;
      for (const id of ids) {
        try {
          await deleteWorkShift(id, currentCompanyId);
        } catch (error: unknown) {
          failed += 1;
          console.error('Error bulk-deleting work shift:', id, error);
        }
      }
      invalidateEffectivePicker();
      await fetchShifts();
      if (failed > 0) {
        toast({
          title: t('messages.error'),
          description: t('hk.workShift.bulkDeletePartial', {
            ok: String(ids.length - failed),
            fail: String(failed),
          }),
          variant: 'destructive',
        });
        return failed < ids.length;
      }
      toast({
        title: t('messages.success'),
        description: t('hk.workShift.bulkDeleteSuccess', { count: String(ids.length) }),
      });
      return true;
    },
    [currentCompanyId, fetchShifts, invalidateEffectivePicker, toast, t],
  );

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void fetchShifts();
  }, [fetchShifts, enabled]);

  return {
    shifts,
    isLoading,
    createShift,
    updateShift,
    deleteShift,
    bulkDeleteShifts,
    refetch: fetchShifts,
  };
}
