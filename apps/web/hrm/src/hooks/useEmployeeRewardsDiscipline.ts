/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Khen thưởng / kỷ luật
 * UC:         UC-BP-CORE-08 · FR-UC-BP-CORE-08
 * BR:         BR-BP-RD-01 · BR-CORE-RD-AMOUNT-PERIOD · AC-CORE-08-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-08 Diễn biến #1–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md F-CORE-RD-01
 * Purpose:    Hook KT/KL — GET/POST/PATCH rewards* + discipline*; enforce / cancel-enforce;
 *             passthrough status_label · payroll_link_status · period label; toast RD-* via toErrorMessage.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeRewardsDiscipline
 * Callees:    hrmApi list/create/update/delete/enforce/cancel · listPayrollPeriods · empCoreRdRing
 * must_keep:  Physical /employees/:id/rewards* + /discipline* · no Nest /core · no FE invent payslip Net
 * LastVerified: poHrmMvpGd1Core08ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Link DTO fields + enforce/cancel API; create omits status (pending BE); period gate client
 * Why: API-01 CONFIRMED · O1–O3 · J-HRM-CORE-08-01..04
 * must_keep: Soft delete prefer; U65; honesty false; CORE-02 ≠ pillar DONE; note-CRUD ≠ FR-08 DONE
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  cancelEnforceEmployeeDiscipline,
  cancelEnforceEmployeeReward,
  createEmployeeDiscipline,
  createEmployeeReward,
  deleteEmployeeDiscipline,
  deleteEmployeeReward,
  enforceEmployeeDiscipline,
  enforceEmployeeReward,
  listEmployeeDiscipline,
  listEmployeeRewards,
  listPayrollPeriods,
  type HrmPayrollPeriod,
  updateEmployeeDiscipline,
  updateEmployeeReward,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  buildRdMutatePayload,
  isRdPeriodSelectable,
  validateRdAmountPeriodGate,
  type RdPayrollLinkStatus,
} from '@/lib/empCoreRdRing';
import { toast } from 'sonner';

export interface EmployeeReward {
  id: string;
  employee_id: string;
  company_id: string;
  reward_date: string;
  reward_type: string;
  reward_type_label?: string | null;
  title: string;
  description: string | null;
  decision_number: string | null;
  amount: number;
  amount_display?: string | null;
  issued_by: string | null;
  status: string;
  status_label?: string | null;
  payroll_link_status?: RdPayrollLinkStatus | string | null;
  payroll_link_status_label?: string | null;
  payroll_period_id?: string | null;
  payroll_period_ref?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDiscipline {
  id: string;
  employee_id: string;
  company_id: string;
  discipline_date: string;
  discipline_type: string;
  discipline_type_label?: string | null;
  title: string;
  description: string | null;
  decision_number: string | null;
  penalty_amount: number;
  penalty_amount_display?: string | null;
  issued_by: string | null;
  effective_from: string | null;
  effective_to: string | null;
  status: string;
  status_label?: string | null;
  payroll_link_status?: RdPayrollLinkStatus | string | null;
  payroll_link_status_label?: string | null;
  payroll_period_id?: string | null;
  payroll_period_ref?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardFormData {
  reward_date: string;
  reward_type: string;
  title: string;
  description: string;
  decision_number: string;
  amount: number;
  issued_by: string;
  notes: string;
  payroll_period_id: string;
}

export interface DisciplineFormData {
  discipline_date: string;
  discipline_type: string;
  title: string;
  description: string;
  decision_number: string;
  penalty_amount: number;
  issued_by: string;
  effective_from: string;
  effective_to: string;
  notes: string;
  payroll_period_id: string;
}

function mapRewardRow(row: Record<string, unknown>): EmployeeReward {
  return {
    id: String(row.id ?? ''),
    employee_id: String(row.employee_id ?? ''),
    company_id: String(row.company_id ?? ''),
    reward_date: String(row.reward_date ?? ''),
    reward_type: String(row.reward_type ?? ''),
    reward_type_label: (row.reward_type_label as string | null | undefined) ?? null,
    title: String(row.title ?? ''),
    description: (row.description as string | null | undefined) ?? null,
    decision_number: (row.decision_number as string | null | undefined) ?? null,
    amount: Number(row.amount ?? 0) || 0,
    amount_display: (row.amount_display as string | null | undefined) ?? null,
    issued_by: (row.issued_by as string | null | undefined) ?? null,
    status: String(row.status ?? 'pending'),
    status_label: (row.status_label as string | null | undefined) ?? null,
    payroll_link_status: (row.payroll_link_status as string | null | undefined) ?? 'none',
    payroll_link_status_label:
      (row.payroll_link_status_label as string | null | undefined) ?? null,
    payroll_period_id: (row.payroll_period_id as string | null | undefined) ?? null,
    payroll_period_ref: (row.payroll_period_ref as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function mapDisciplineRow(row: Record<string, unknown>): EmployeeDiscipline {
  return {
    id: String(row.id ?? ''),
    employee_id: String(row.employee_id ?? ''),
    company_id: String(row.company_id ?? ''),
    discipline_date: String(row.discipline_date ?? ''),
    discipline_type: String(row.discipline_type ?? ''),
    discipline_type_label: (row.discipline_type_label as string | null | undefined) ?? null,
    title: String(row.title ?? ''),
    description: (row.description as string | null | undefined) ?? null,
    decision_number: (row.decision_number as string | null | undefined) ?? null,
    penalty_amount: Number(row.penalty_amount ?? 0) || 0,
    penalty_amount_display: (row.penalty_amount_display as string | null | undefined) ?? null,
    issued_by: (row.issued_by as string | null | undefined) ?? null,
    effective_from: (row.effective_from as string | null | undefined) ?? null,
    effective_to: (row.effective_to as string | null | undefined) ?? null,
    status: String(row.status ?? 'pending'),
    status_label: (row.status_label as string | null | undefined) ?? null,
    payroll_link_status: (row.payroll_link_status as string | null | undefined) ?? 'none',
    payroll_link_status_label:
      (row.payroll_link_status_label as string | null | undefined) ?? null,
    payroll_period_id: (row.payroll_period_id as string | null | undefined) ?? null,
    payroll_period_ref: (row.payroll_period_ref as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export function useEmployeeRewardsDiscipline(employeeId: string) {
  const { currentCompanyId } = useAuth();
  const [rewards, setRewards] = useState<EmployeeReward[]>([]);
  const [disciplines, setDisciplines] = useState<EmployeeDiscipline[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<HrmPayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setRewards([]);
      setDisciplines([]);
      setPayrollPeriods([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rewardRes, disciplineRes, periodRes] = await Promise.all([
        listEmployeeRewards(employeeId, currentCompanyId),
        listEmployeeDiscipline(employeeId, currentCompanyId),
        listPayrollPeriods({ company_id: currentCompanyId }),
      ]);
      setRewards((rewardRes.data ?? []).map((r) => mapRewardRow(r as Record<string, unknown>)));
      setDisciplines(
        (disciplineRes.data ?? []).map((d) => mapDisciplineRow(d as Record<string, unknown>)),
      );
      const periods = periodRes.data ?? [];
      setPayrollPeriods(periods.filter((p) => isRdPeriodSelectable(p.status)));
    } catch (error: unknown) {
      console.error('Error fetching rewards/discipline:', error);
      toast.error(toErrorMessage(error, 'Không thể tải khen thưởng / kỷ luật'));
      setRewards([]);
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const addReward = async (formData: RewardFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const gate = validateRdAmountPeriodGate({
      title: formData.title,
      amount: formData.amount,
      payroll_period_id: formData.payroll_period_id,
    });
    if (gate) {
      toast.error(gate);
      return false;
    }
    if (!formData.reward_date) {
      toast.error('Thiếu ngày khen thưởng (dd/MM/yyyy).');
      return false;
    }
    setMutating(true);
    try {
      const body = buildRdMutatePayload({
        title: formData.title,
        typeKey: formData.reward_type,
        typeField: 'reward_type',
        dateKey: formData.reward_date,
        dateField: 'reward_date',
        amountField: 'amount',
        amount: formData.amount,
        description: formData.description,
        decision_number: formData.decision_number,
        issued_by: formData.issued_by,
        notes: formData.notes,
        payroll_period_id: formData.payroll_period_id,
      });
      await createEmployeeReward(employeeId, currentCompanyId, body);
      toast.success('Đã thêm khen thưởng (Chờ)');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể lưu khen thưởng'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const updateReward = async (
    id: string,
    formData: Partial<RewardFormData>,
  ): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const title = formData.title ?? '';
    const amount = formData.amount ?? 0;
    const periodId = formData.payroll_period_id ?? '';
    const gate = validateRdAmountPeriodGate({
      title,
      amount,
      payroll_period_id: periodId,
    });
    if (gate) {
      toast.error(gate);
      return false;
    }
    setMutating(true);
    try {
      const body = buildRdMutatePayload({
        title,
        typeKey: formData.reward_type ?? 'bonus',
        typeField: 'reward_type',
        dateKey: formData.reward_date ?? '',
        dateField: 'reward_date',
        amountField: 'amount',
        amount,
        description: formData.description,
        decision_number: formData.decision_number,
        issued_by: formData.issued_by,
        notes: formData.notes,
        payroll_period_id: periodId,
      });
      await updateEmployeeReward(employeeId, id, currentCompanyId, body);
      toast.success('Đã cập nhật khen thưởng');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể cập nhật khen thưởng'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const deleteReward = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      await deleteEmployeeReward(employeeId, id, currentCompanyId);
      toast.success('Đã xóa khen thưởng');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể xóa khen thưởng'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const enforceReward = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const row = rewards.find((r) => r.id === id);
    if (row && Number(row.amount) > 0 && !row.payroll_period_id) {
      toast.error(
        'Có số tiền phải gắn kỳ lương trước khi thi hành. Sửa bản ghi rồi thử lại.',
      );
      return false;
    }
    setMutating(true);
    try {
      await enforceEmployeeReward(employeeId, id, currentCompanyId, {
        target_status: 'in_force',
        ...(row?.payroll_period_id
          ? { payroll_period_id: row.payroll_period_id }
          : {}),
      });
      toast.success('Đã thi hành khen thưởng');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể thi hành khen thưởng'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const cancelEnforceReward = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      await cancelEnforceEmployeeReward(employeeId, id, currentCompanyId);
      toast.success('Đã hủy thi hành khen thưởng');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể hủy thi hành khen thưởng'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const addDiscipline = async (formData: DisciplineFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const gate = validateRdAmountPeriodGate({
      title: formData.title,
      amount: formData.penalty_amount,
      payroll_period_id: formData.payroll_period_id,
    });
    if (gate) {
      toast.error(gate);
      return false;
    }
    if (!formData.discipline_date) {
      toast.error('Thiếu ngày kỷ luật (dd/MM/yyyy).');
      return false;
    }
    setMutating(true);
    try {
      const body = buildRdMutatePayload({
        title: formData.title,
        typeKey: formData.discipline_type,
        typeField: 'discipline_type',
        dateKey: formData.discipline_date,
        dateField: 'discipline_date',
        amountField: 'penalty_amount',
        amount: formData.penalty_amount,
        description: formData.description,
        decision_number: formData.decision_number,
        issued_by: formData.issued_by,
        notes: formData.notes,
        payroll_period_id: formData.payroll_period_id,
        effective_from: formData.effective_from,
        effective_to: formData.effective_to,
      });
      await createEmployeeDiscipline(employeeId, currentCompanyId, body);
      toast.success('Đã thêm kỷ luật (Chờ)');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể lưu kỷ luật'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const updateDiscipline = async (
    id: string,
    formData: Partial<DisciplineFormData>,
  ): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const title = formData.title ?? '';
    const amount = formData.penalty_amount ?? 0;
    const periodId = formData.payroll_period_id ?? '';
    const gate = validateRdAmountPeriodGate({
      title,
      amount,
      payroll_period_id: periodId,
    });
    if (gate) {
      toast.error(gate);
      return false;
    }
    setMutating(true);
    try {
      const body = buildRdMutatePayload({
        title,
        typeKey: formData.discipline_type ?? 'warning',
        typeField: 'discipline_type',
        dateKey: formData.discipline_date ?? '',
        dateField: 'discipline_date',
        amountField: 'penalty_amount',
        amount,
        description: formData.description,
        decision_number: formData.decision_number,
        issued_by: formData.issued_by,
        notes: formData.notes,
        payroll_period_id: periodId,
        effective_from: formData.effective_from,
        effective_to: formData.effective_to,
      });
      await updateEmployeeDiscipline(employeeId, id, currentCompanyId, body);
      toast.success('Đã cập nhật kỷ luật');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể cập nhật kỷ luật'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const deleteDiscipline = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      await deleteEmployeeDiscipline(employeeId, id, currentCompanyId);
      toast.success('Đã xóa kỷ luật');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể xóa kỷ luật'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const enforceDiscipline = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const row = disciplines.find((d) => d.id === id);
    if (row && Number(row.penalty_amount) > 0 && !row.payroll_period_id) {
      toast.error(
        'Có số tiền phải gắn kỳ lương trước khi thi hành. Sửa bản ghi rồi thử lại.',
      );
      return false;
    }
    setMutating(true);
    try {
      await enforceEmployeeDiscipline(employeeId, id, currentCompanyId, {
        target_status: 'in_force',
        ...(row?.payroll_period_id
          ? { payroll_period_id: row.payroll_period_id }
          : {}),
      });
      toast.success('Đã thi hành kỷ luật');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể thi hành kỷ luật'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const cancelEnforceDiscipline = async (id: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      await cancelEnforceEmployeeDiscipline(employeeId, id, currentCompanyId);
      toast.success('Đã hủy thi hành kỷ luật');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể hủy thi hành kỷ luật'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const getStats = () => ({
    totalRewards: rewards.length,
    totalRewardAmount: rewards.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    totalDisciplines: disciplines.length,
    totalPenalty: disciplines.reduce((sum, d) => sum + (Number(d.penalty_amount) || 0), 0),
    activeDisciplines: disciplines.filter((d) =>
      ['in_force', 'active', 'executed', 'completed'].includes(
        (d.status ?? '').toLowerCase(),
      ),
    ).length,
  });

  return {
    rewards,
    disciplines,
    payrollPeriods,
    loading,
    mutating,
    addReward,
    updateReward,
    deleteReward,
    enforceReward,
    cancelEnforceReward,
    addDiscipline,
    updateDiscipline,
    deleteDiscipline,
    enforceDiscipline,
    cancelEnforceDiscipline,
    refetch: fetchData,
    getStats,
  };
}
