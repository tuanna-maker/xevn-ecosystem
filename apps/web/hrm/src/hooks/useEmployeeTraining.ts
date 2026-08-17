/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → nhóm HR → tab Đào tạo
 * UC:         UC-HRM-21 · matrix #19 SCR-TAB-TRAINING · HDSD CH06 §6.2
 * BR:         Capability development CRUD trên hồ sơ NV
 * SRS:        docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md §6.2
 * TechSpec:   Nest GET/POST/PATCH/DELETE …/employees/:id/training (hrmApi)
 * Purpose:    Tải danh sách khóa đào tạo theo employee+company; CRUD; thống kê
 *             summary cards từ client (không phụ thuộc stats từ Nest body).
 * WorkItem:   PO-MFD-M3-EMP-TRAINING-FIX-01
 * Coded:      2026-08-04
 * change_mode: FIX
 *
 * Callers:
 *   - components/employee/EmployeeTraining.tsx
 *
 * Callees:
 *   - listEmployeeTraining / createEmployeeTraining / updateEmployeeTraining / deleteEmployeeTraining
 *
 * FE-Actions:
 *   | User action     | Handler          | API                          |
 *   |-----------------|------------------|------------------------------|
 *   | Mở tab Đào tạo  | fetchData        | GET …/training               |
 *   | Thêm / Sửa / Xóa| create/update/del| POST/PATCH/DELETE …/training |
 *
 * Impact:     Thiếu getStats/stats → TypeError stats.completed → tab trắng (matrix #19 BROKEN)
 * must_keep:  LIST #1–6 · CREATE #7 · DETAIL #10–12 · IMPORT #8 · SCOPE #28; không đổi Nest contract
 * SOLID:      Hook chỉ fetch/mutate; computeTrainingStats pure cho UI + unit test
 * LastVerified: useEmployeeTraining.stats.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M3-EMP-TRAINING-FIX-01
 * change_mode: FIX
 * What: Export EMPTY_TRAINING_STATS + computeTrainingStats; getStats luôn trả object đủ field
 *       (completed/inProgress/totalHours/totalCost); không đọc stats từ API body
 * Why: QA RUNTIME matrix #19 — GET training 200 rồi TypeError reading 'completed' (stats undefined)
 * SRS/BR: HDSD CH06 §6.2 Đào tạo · matrix #19 · residual R-MFD-M3-EMP-TRAINING-STATS
 * must_keep: Sibling pattern getStats(); must_keep LIST/CREATE/DETAIL/IMPORT/SCOPE
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import {
  createEmployeeTraining,
  deleteEmployeeTraining,
  listEmployeeTraining,
  updateEmployeeTraining,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';

export interface TrainingItem {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  type: 'internal' | 'external' | 'online' | 'certification';
  category: 'technical' | 'soft-skill' | 'management' | 'compliance' | 'language' | 'other';
  provider: string | null;
  instructor: string | null;
  start_date: string | null;
  end_date: string | null;
  duration: number;
  duration_unit: 'hours' | 'days' | 'weeks' | 'months';
  location: string | null;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  progress: number;
  score: number | null;
  certificate_number: string | null;
  certificate_file_url: string | null;
  cost: number;
  paid_by: 'company' | 'employee' | 'shared';
  description: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingFormData {
  name: string;
  type?: TrainingItem['type'];
  category?: TrainingItem['category'];
  provider?: string;
  instructor?: string;
  start_date?: string;
  end_date?: string;
  duration?: number;
  duration_unit?: TrainingItem['duration_unit'];
  location?: string;
  status?: TrainingItem['status'];
  progress?: number;
  score?: number | null;
  certificate_number?: string;
  certificate_file_url?: string;
  cost?: number;
  paid_by?: TrainingItem['paid_by'];
  description?: string;
  skills?: string[];
}

export interface TrainingStats {
  total: number;
  completed: number;
  inProgress: number;
  planned: number;
  totalHours: number;
  totalCost: number;
}

/** Safe defaults when list empty or stats path missing (matrix #19). */
export const EMPTY_TRAINING_STATS: TrainingStats = {
  total: 0,
  completed: 0,
  inProgress: 0,
  planned: 0,
  totalHours: 0,
  totalCost: 0,
};

function durationToHours(item: Pick<TrainingItem, 'duration' | 'duration_unit'>): number {
  const duration = Number(item.duration) || 0;
  switch (item.duration_unit) {
    case 'days':
      return duration * 8;
    case 'weeks':
      return duration * 40;
    case 'months':
      return duration * 160;
    case 'hours':
    default:
      return duration;
  }
}

/** Pure client-side rollup — Nest list may omit `stats`; never return undefined. */
export function computeTrainingStats(
  trainings: TrainingItem[] | null | undefined,
): TrainingStats {
  const rows = Array.isArray(trainings) ? trainings : [];
  return {
    total: rows.length,
    completed: rows.filter((t) => t.status === 'completed').length,
    inProgress: rows.filter((t) => t.status === 'in-progress').length,
    planned: rows.filter((t) => t.status === 'planned').length,
    totalHours: rows.reduce((sum, t) => sum + durationToHours(t), 0),
    totalCost: rows.reduce((sum, t) => sum + (Number(t.cost) || 0), 0),
  };
}

function mapTraining(row: Record<string, unknown>): TrainingItem {
  return {
    ...(row as unknown as TrainingItem),
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
  };
}

export function useEmployeeTraining(employeeId: string | undefined) {
  const { currentCompanyId } = useAuth();
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setTrainings([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await listEmployeeTraining(employeeId, currentCompanyId);
      setTrainings((result.data ?? []).map(mapTraining));
    } catch (error: unknown) {
      console.error('Error fetching training:', error);
      toast.error(toErrorMessage(error, i18n.t('messages.error', 'Không thể tải đào tạo')));
      setTrainings([]);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const createTraining = async (data: TrainingFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await createEmployeeTraining(employeeId, currentCompanyId, data);
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, i18n.t('messages.error')));
      return false;
    }
  };

  const updateTraining = async (id: string, data: Partial<TrainingFormData>): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await updateEmployeeTraining(employeeId, id, currentCompanyId, data);
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, i18n.t('messages.error')));
      return false;
    }
  };

  const deleteTraining = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await deleteEmployeeTraining(employeeId, id, currentCompanyId);
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, i18n.t('messages.error')));
      return false;
    }
  };

  const getStats = (): TrainingStats => computeTrainingStats(trainings);

  return {
    trainings,
    isLoading,
    refetch: fetchData,
    createTraining,
    updateTraining,
    deleteTraining,
    getStats,
    /** Convenience alias — always defined (never undefined after GET 200). */
    stats: getStats(),
  };
}
