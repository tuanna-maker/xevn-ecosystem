import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MonthData { ns: number; dx: number; }
interface PlanPosition { id: string; name: string; months: MonthData[]; sort_order: number; }
interface PlanDepartment { id: string; name: string; positions: PlanPosition[]; sort_order: number; }

export interface RecruitmentPlan {
  id: string; title: string; period: string; creator: string; createdDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft'; startMonth: number; endMonth: number;
  year: number; note?: string; departments: PlanDepartment[];
}

interface CreatePlanData {
  title: string; startMonth: number; endMonth: number; year: number; note?: string; status?: string;
  departments: { name: string; positions: { name: string; months: MonthData[]; }[]; }[];
}

export function useRecruitmentPlans() {
  const [plans, setPlans] = useState<RecruitmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentCompanyId, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.recruitmentPlan.${key}`) as string;

  const fetchPlans = useCallback(async () => {
    if (!currentCompanyId) { setPlans([]); setLoading(false); return; }
    try {
      setLoading(true);
      const { data: plansData, error: plansError } = await supabase.from('recruitment_plans').select('*').eq('company_id', currentCompanyId).order('created_at', { ascending: false });
      if (plansError) throw plansError;
      const planIds = plansData?.map(p => p.id) || [];
      let departmentsData: any[] = []; let positionsData: any[] = [];
      if (planIds.length > 0) {
        const { data: depts, error: deptsError } = await supabase.from('recruitment_plan_departments').select('*').in('plan_id', planIds).order('sort_order', { ascending: true });
        if (deptsError) throw deptsError; departmentsData = depts || [];
        const deptIds = departmentsData.map(d => d.id);
        if (deptIds.length > 0) {
          const { data: positions, error: posError } = await supabase.from('recruitment_plan_positions').select('*').in('department_id', deptIds).order('sort_order', { ascending: true });
          if (posError) throw posError; positionsData = positions || [];
        }
      }
      const formattedPlans: RecruitmentPlan[] = (plansData || []).map(plan => {
        const planDepts = departmentsData.filter(d => d.plan_id === plan.id);
        const departments: PlanDepartment[] = planDepts.map(dept => ({
          id: dept.id, name: dept.name, sort_order: dept.sort_order || 0,
          positions: positionsData.filter(p => p.department_id === dept.id).map(pos => ({
            id: pos.id, name: pos.name, months: (pos.months_data as MonthData[]) || [], sort_order: pos.sort_order || 0,
          })),
        }));
        const startMonth = plan.start_month || 1; const endMonth = plan.end_month || 12; const year = plan.year || new Date().getFullYear();
        return {
          id: plan.id, title: plan.title,
          period: `${String(startMonth).padStart(2, '0')}/${year} - ${String(endMonth).padStart(2, '0')}/${year}`,
          creator: plan.creator_name || 'Unknown', createdDate: new Date(plan.created_at).toLocaleDateString('vi-VN'),
          status: plan.status as RecruitmentPlan['status'], startMonth, endMonth, year, note: plan.note || undefined, departments,
        };
      });
      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching recruitment plans:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setLoading(false); }
  }, [currentCompanyId, toast, t]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const createPlan = async (data: CreatePlanData): Promise<boolean> => {
    if (!currentCompanyId) { toast({ title: t('messages.error'), description: t('hk.selectCompany'), variant: 'destructive' }); return false; }
    try {
      const { data: newPlan, error: planError } = await supabase.from('recruitment_plans').insert({
        company_id: currentCompanyId, title: data.title, start_month: data.startMonth, end_month: data.endMonth,
        year: data.year, note: data.note || null, status: data.status || 'pending', creator_name: profile?.full_name || 'Unknown',
      }).select().single();
      if (planError) throw planError;
      for (let i = 0; i < data.departments.length; i++) {
        const dept = data.departments[i];
        const { data: newDept, error: deptError } = await supabase.from('recruitment_plan_departments').insert({ plan_id: newPlan.id, company_id: currentCompanyId, name: dept.name, sort_order: i }).select().single();
        if (deptError) throw deptError;
        const positionsToInsert = dept.positions.map((pos, idx) => ({ department_id: newDept.id, company_id: currentCompanyId, name: pos.name, months_data: JSON.parse(JSON.stringify(pos.months)), sort_order: idx }));
        if (positionsToInsert.length > 0) { const { error: posError } = await supabase.from('recruitment_plan_positions').insert(positionsToInsert); if (posError) throw posError; }
      }
      toast({ title: t('messages.success'), description: h('createSuccess') });
      await fetchPlans(); return true;
    } catch (error) {
      console.error('Error creating recruitment plan:', error);
      toast({ title: t('messages.error'), description: h('createError'), variant: 'destructive' }); return false;
    }
  };

  const updatePlanStatus = async (planId: string, status: RecruitmentPlan['status']): Promise<boolean> => {
    try {
      const { error } = await supabase.from('recruitment_plans').update({ status }).eq('id', planId);
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('updateSuccess') });
      await fetchPlans(); return true;
    } catch (error) {
      toast({ title: t('messages.error'), description: h('updateError'), variant: 'destructive' }); return false;
    }
  };

  const deletePlan = async (planId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('recruitment_plans').delete().eq('id', planId);
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('deleteSuccess') });
      await fetchPlans(); return true;
    } catch (error) {
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  const stats = { total: plans.length, approved: plans.filter(p => p.status === 'approved').length, pending: plans.filter(p => p.status === 'pending').length, draft: plans.filter(p => p.status === 'draft').length, rejected: plans.filter(p => p.status === 'rejected').length };

  return { plans, loading, stats, createPlan, updatePlanStatus, deletePlan, refetch: fetchPlans };
}
