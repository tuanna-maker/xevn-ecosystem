import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import {
  createRecruitmentPlan,
  deleteRecruitmentPlan,
  listRecruitmentPlans,
  updateRecruitmentPlanStatus,
  type HrmRecruitmentPlanDepartmentRow,
  type HrmRecruitmentPlanPositionRow,
  type HrmRecruitmentPlanRow,
} from '@/integrations/hrmApi';

interface MonthData {
  ns: number;
  dx: number;
}
interface PlanPosition {
  id: string;
  name: string;
  months: MonthData[];
  sort_order: number;
}
interface PlanDepartment {
  id: string;
  name: string;
  positions: PlanPosition[];
  sort_order: number;
}

export interface RecruitmentPlan {
  id: string;
  title: string;
  period: string;
  creator: string;
  createdDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  startMonth: number;
  endMonth: number;
  year: number;
  note?: string;
  departments: PlanDepartment[];
}

interface CreatePlanData {
  title: string;
  startMonth: number;
  endMonth: number;
  year: number;
  note?: string;
  status?: string;
  departments: { name: string; positions: { name: string; months: MonthData[] }[] }[];
}

function parseMonthsData(raw: unknown): MonthData[] {
  if (Array.isArray(raw)) {
    return raw.map((m) => ({
      ns: Number((m as MonthData).ns ?? 0),
      dx: Number((m as MonthData).dx ?? 0),
    }));
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parseMonthsData(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

function mapPosition(row: HrmRecruitmentPlanPositionRow): PlanPosition {
  return {
    id: row.id,
    name: row.name,
    months: parseMonthsData(row.months_data),
    sort_order: row.sort_order ?? 0,
  };
}

function mapDepartment(row: HrmRecruitmentPlanDepartmentRow): PlanDepartment {
  return {
    id: row.id,
    name: row.name,
    sort_order: row.sort_order ?? 0,
    positions: (row.positions ?? []).map(mapPosition),
  };
}

function mapRecruitmentPlan(row: HrmRecruitmentPlanRow): RecruitmentPlan {
  const status = row.status as RecruitmentPlan['status'];
  const safeStatus: RecruitmentPlan['status'] = ['pending', 'approved', 'rejected', 'draft'].includes(
    status,
  )
    ? status
    : 'pending';
  return {
    id: row.id,
    title: row.title,
    period: `T${row.start_month}–T${row.end_month}/${row.year}`,
    creator: row.creator_name ?? '',
    createdDate: row.created_at?.split('T')[0] ?? '',
    status: safeStatus,
    startMonth: row.start_month,
    endMonth: row.end_month,
    year: row.year,
    note: row.note ?? undefined,
    departments: (row.departments ?? []).map(mapDepartment),
  };
}

export function useRecruitmentPlans() {
  const [plans, setPlans] = useState<RecruitmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { currentCompanyId, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.recruitmentPlan.${key}`) as string;

  const fetchPlans = useCallback(async () => {
    if (!currentCompanyId) {
      setPlans([]);
      setFetchError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const response = await listRecruitmentPlans(currentCompanyId);
      setPlans((response.data ?? []).map(mapRecruitmentPlan));
    } catch (error: unknown) {
      console.error('Error fetching recruitment plans:', error);
      setPlans([]);
      setFetchError(toErrorMessage(error, 'Không thể tải kế hoạch tuyển dụng'));
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const createPlan = async (data: CreatePlanData): Promise<boolean> => {
    if (!currentCompanyId) {
      toast({ title: t('messages.error'), description: t('hk.selectCompany'), variant: 'destructive' });
      return false;
    }
    try {
      await createRecruitmentPlan({
        company_id: currentCompanyId,
        title: data.title,
        start_month: data.startMonth,
        end_month: data.endMonth,
        year: data.year,
        note: data.note,
        status: data.status ?? 'pending',
        creator_name: profile?.full_name ?? 'Unknown',
        departments: data.departments.map((dept) => ({
          name: dept.name,
          positions: dept.positions.map((pos) => ({ name: pos.name, months: pos.months })),
        })),
      });
      toast({ title: h('createSuccess') || t('messages.success') });
      await fetchPlans();
      return true;
    } catch (error: unknown) {
      console.error('Error creating recruitment plan:', error);
      toast({
        title: h('createError') || t('messages.error'),
        description: toErrorMessage(error, 'Không thể tạo kế hoạch'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const updatePlanStatus = async (
    planId: string,
    status: RecruitmentPlan['status'],
  ): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await updateRecruitmentPlanStatus(planId, currentCompanyId, status);
      await fetchPlans();
      toast({ title: h('statusUpdated') || 'Đã cập nhật trạng thái kế hoạch' });
      return true;
    } catch (error: unknown) {
      toast({
        title: h('statusUpdateError') || 'Lỗi',
        description: toErrorMessage(error, 'Không thể cập nhật trạng thái'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const deletePlan = async (planId: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteRecruitmentPlan(planId, currentCompanyId);
      toast({ title: h('deleteSuccess') || t('messages.success') });
      await fetchPlans();
      return true;
    } catch (error: unknown) {
      toast({
        title: h('deleteError') || t('messages.error'),
        description: toErrorMessage(error, 'Không thể xóa kế hoạch'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const stats = {
    total: plans.length,
    approved: plans.filter((p) => p.status === 'approved').length,
    pending: plans.filter((p) => p.status === 'pending').length,
    draft: plans.filter((p) => p.status === 'draft').length,
    rejected: plans.filter((p) => p.status === 'rejected').length,
  };

  return {
    plans,
    loading,
    fetchError,
    stats,
    createPlan,
    updatePlanStatus,
    deletePlan,
    refetch: fetchPlans,
  };
}
