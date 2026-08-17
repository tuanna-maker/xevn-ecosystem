/**
 * @CODE-MEMORY
 * Screen:     /recruitment → tab Kế hoạch / Định biên
 * UC:         UC-BP-REC-01 · UC-BP-REC-01b
 * BR:         BR-BP-HC-01 · BR-BP-HC-04 · O1 single need_hire
 * SRS:        FR-UC-BP-REC-01 · FR-UC-BP-REC-01b
 * TechSpec:   PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01 F-REC-HC-01/02/05
 * Purpose:    List/create/upsert/submit/spawn định biên qua Nest physical paths;
 *             map months_data → need_hire; post-2xx refetch (F5 AC).
 * WorkItem:   PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    Recruitment.tsx
 * Callees:    list/create/upsert/spawnRecruitmentPlan* · recruitmentPlanHeadcount
 * FE-Actions: | Lưu | create/upsert 2xx → refetch |
 *             | Gửi duyệt | submit-workflow |
 *             | Sinh YCTD | spawn-requests + feedback |
 * Impact:     Dual ns/dx wire = FAIL; spawn không feedback = AC-01b gap
 * must_keep:  XBOS submit-workflow · UF-HRM-12 · REC-03 OUT · U65 · honesty false
 * SOLID:      Hook owns server state; page owns grid editors
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: need_hire cell model; PUT upsert; spawn-requests feedback; catalog keys on write
 * Why: BA O1–O5 · API-01 CONFIRMED · remove ns/dx dual SoT
 * must_keep: list/create/submit-workflow · WF lock toast · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01 (re-dispatch)
 * change_mode: UPGRADE
 * What: allow_override on PUT for O3 qty_drift confirm; overHcWarned toast on approve (O4)
 * Why: BA O3/O4 · BE allow_override · no silent YCTD overwrite
 * must_keep: spawn feedback · serializeMonthsForApi · honesty false
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  createRecruitmentPlan,
  deleteRecruitmentPlan,
  listRecruitmentPlans,
  spawnRecruitmentPlanRequests,
  submitRecruitmentPlanWorkflow,
  updateRecruitmentPlanStatus,
  upsertRecruitmentPlan,
  type HrmRecruitmentPlanDepartmentRow,
  type HrmRecruitmentPlanPositionRow,
  type HrmRecruitmentPlanRow,
  type HrmRecruitmentPlanSpawnResult,
  type HrmRecruitmentPlanWfSubmitResult,
} from '@/integrations/hrmApi';
import {
  detectRecruitmentSpawnMissing,
  isRecruitmentWorkflowLocked,
  RECRUITMENT_WF_LOCKED_HINT_VI,
} from '@/lib/recruitmentWorkflowUi';
import {
  formatSpawnFeedback,
  mapHrmHcErrorToToast,
  parseMonthsData,
  serializeMonthsForApi,
  type HeadcountMonthCell,
} from '@/lib/recruitmentPlanHeadcount';

export type PlanPosition = {
  id: string;
  name: string;
  position_key: string;
  months: HeadcountMonthCell[];
  sort_order: number;
};

export type PlanDepartment = {
  id: string;
  name: string;
  department_key: string;
  positions: PlanPosition[];
  sort_order: number;
};

export interface RecruitmentPlan {
  id: string;
  title: string;
  period: string;
  creator: string;
  createdDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'pending_approval';
  startMonth: number;
  endMonth: number;
  year: number;
  note?: string;
  departments: PlanDepartment[];
  workflowInstanceId: string | null;
}

export type CreatePlanData = {
  title: string;
  startMonth: number;
  endMonth: number;
  year: number;
  note?: string;
  status?: string;
  submitted_by_dept_key?: string;
  /** O3 — required when mutating locked need_hire cells after spawn/approve. */
  allow_override?: boolean;
  departments: Array<{
    name: string;
    department_key?: string;
    positions: Array<{
      name: string;
      position_key?: string;
      months: HeadcountMonthCell[];
    }>;
  }>;
};

function mapPosition(row: HrmRecruitmentPlanPositionRow): PlanPosition {
  return {
    id: row.id,
    name: row.name,
    position_key: (row.position_key ?? '').trim(),
    months: parseMonthsData(row.months_data),
    sort_order: row.sort_order ?? 0,
  };
}

function mapDepartment(row: HrmRecruitmentPlanDepartmentRow): PlanDepartment {
  return {
    id: row.id,
    name: row.name,
    department_key: (row.department_key ?? '').trim(),
    sort_order: row.sort_order ?? 0,
    positions: (row.positions ?? []).map(mapPosition),
  };
}

function mapRecruitmentPlan(row: HrmRecruitmentPlanRow): RecruitmentPlan {
  const rawStatus = (row.status ?? '').toLowerCase();
  const status: RecruitmentPlan['status'] =
    rawStatus === 'pending_approval' || rawStatus === 'submitted'
      ? 'pending_approval'
      : (['pending', 'approved', 'rejected', 'draft'].includes(rawStatus)
          ? (rawStatus as RecruitmentPlan['status'])
          : 'pending');
  return {
    id: row.id,
    title: row.title,
    period: `T${row.start_month}–T${row.end_month}/${row.year}`,
    creator: row.creator_name ?? '',
    createdDate: row.created_at?.split('T')[0] ?? '',
    status,
    startMonth: row.start_month,
    endMonth: row.end_month,
    year: row.year,
    note: row.note ?? undefined,
    departments: (row.departments ?? []).map(mapDepartment),
    workflowInstanceId: row.workflow_instance_id?.trim() || null,
  };
}

function buildDepartmentsPayload(data: CreatePlanData['departments']) {
  return data.map((dept) => ({
    department_key: (dept.department_key ?? '').trim() || undefined,
    name: dept.name,
    positions: dept.positions.map((pos) => ({
      position_key: (pos.position_key ?? '').trim() || undefined,
      name: pos.name,
      months: serializeMonthsForApi(pos.months),
    })),
  }));
}

function toastFromHcError(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return mapHrmHcErrorToToast(error.code, toErrorMessage(error, fallback));
  }
  return toErrorMessage(error, fallback);
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
      setFetchError(toErrorMessage(error, 'Không thể tải định biên / kế hoạch tuyển'));
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
        status: data.status ?? 'draft',
        creator_name: profile?.full_name ?? 'Unknown',
        submitted_by_dept_key: data.submitted_by_dept_key,
        departments: buildDepartmentsPayload(data.departments),
      });
      toast({
        title: h('createSuccess') || t('messages.success'),
        description: 'Đã lưu định biên (Cần tuyển). F5 vẫn còn dữ liệu.',
      });
      await fetchPlans();
      return true;
    } catch (error: unknown) {
      console.error('Error creating recruitment plan:', error);
      toast({
        title: h('createError') || t('messages.error'),
        description: toastFromHcError(error, 'Không thể tạo định biên'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const upsertPlan = async (planId: string, data: CreatePlanData): Promise<boolean> => {
    if (!currentCompanyId) {
      toast({ title: t('messages.error'), description: t('hk.selectCompany'), variant: 'destructive' });
      return false;
    }
    try {
      await upsertRecruitmentPlan(planId, currentCompanyId, {
        company_id: currentCompanyId,
        title: data.title,
        start_month: data.startMonth,
        end_month: data.endMonth,
        year: data.year,
        note: data.note,
        status: data.status,
        submitted_by_dept_key: data.submitted_by_dept_key,
        allow_override: data.allow_override === true,
        departments: buildDepartmentsPayload(data.departments),
      });
      toast({
        title: 'Đã cập nhật định biên',
        description: data.allow_override
          ? 'Đã xác nhận qty_drift — lưới Cần tuyển lưu (2xx). YCTD không bị ghi đè im lặng.'
          : 'Lưới Cần tuyển đã lưu (2xx). F5 vẫn còn.',
      });
      await fetchPlans();
      return true;
    } catch (error: unknown) {
      toast({
        title: h('createError') || t('messages.error'),
        description: toastFromHcError(error, 'Không thể cập nhật định biên'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const updatePlanStatus = async (
    planId: string,
    status: RecruitmentPlan['status'],
    rejectedReason?: string,
    options?: { overHcWarned?: boolean },
  ): Promise<boolean> => {
    if (!currentCompanyId) return false;
    const plan = plans.find((p) => p.id === planId);
    if (plan && isRecruitmentWorkflowLocked(plan.workflowInstanceId, plan.status, 'plan')) {
      toast({
        title: h('statusUpdateError') || 'Lỗi',
        description: RECRUITMENT_WF_LOCKED_HINT_VI,
        variant: 'destructive',
      });
      return false;
    }
    try {
      await updateRecruitmentPlanStatus(planId, currentCompanyId, status, rejectedReason);
      await fetchPlans();
      toast({
        title: h('statusUpdated') || 'Đã cập nhật trạng thái kế hoạch',
        description:
          status === 'approved' && options?.overHcWarned
            ? 'Đã duyệt dù có ô vượt Hiện tại (O4 — warn, không chặn).'
            : undefined,
      });
      return true;
    } catch (error: unknown) {
      toast({
        title: h('statusUpdateError') || 'Lỗi',
        description: toastFromHcError(error, 'Không thể cập nhật trạng thái'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const submitPlanWorkflow = async (
    planId: string,
  ): Promise<{ ok: boolean; spawnMissing: boolean; result?: HrmRecruitmentPlanWfSubmitResult }> => {
    if (!currentCompanyId) return { ok: false, spawnMissing: false };
    try {
      const result = await submitRecruitmentPlanWorkflow(planId, currentCompanyId);
      const spawnMissing = detectRecruitmentSpawnMissing(result);
      await fetchPlans();
      if (spawnMissing) {
        toast({
          title: 'Đã gửi nhưng thiếu instance QT',
          description: 'Chưa tạo được quy trình phê duyệt — kiểm tra mẫu QT kế hoạch trên XBOS.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Đã gửi duyệt định biên',
          description: 'Kế hoạch đã gửi vào Inbox phê duyệt (chuỗi FE — không seed).',
        });
      }
      return { ok: true, spawnMissing, result };
    } catch (error: unknown) {
      toast({
        title: h('statusUpdateError') || 'Lỗi',
        description: toastFromHcError(error, 'Không gửi được quy trình kế hoạch'),
        variant: 'destructive',
      });
      return { ok: false, spawnMissing: false };
    }
  };

  const spawnPlanRequests = async (
    planId: string,
  ): Promise<{ ok: boolean; result?: HrmRecruitmentPlanSpawnResult }> => {
    if (!currentCompanyId) return { ok: false };
    try {
      const result = await spawnRecruitmentPlanRequests(planId, currentCompanyId);
      const feedback = formatSpawnFeedback(result);
      toast({
        title: feedback.title,
        description: feedback.description,
        variant: feedback.variant,
      });
      await fetchPlans();
      return { ok: true, result };
    } catch (error: unknown) {
      toast({
        title: 'Không sinh được YCTD',
        description: toastFromHcError(error, 'Spawn YCTD thất bại'),
        variant: 'destructive',
      });
      return { ok: false };
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
        description: toastFromHcError(error, 'Không thể xóa kế hoạch'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const stats = {
    total: plans.length,
    approved: plans.filter((p) => p.status === 'approved').length,
    pending: plans.filter((p) => p.status === 'pending' || p.status === 'pending_approval').length,
    draft: plans.filter((p) => p.status === 'draft').length,
    rejected: plans.filter((p) => p.status === 'rejected').length,
  };

  return {
    plans,
    loading,
    fetchError,
    stats,
    createPlan,
    upsertPlan,
    updatePlanStatus,
    submitPlanWorkflow,
    spawnPlanRequests,
    deletePlan,
    refetch: fetchPlans,
  };
}
