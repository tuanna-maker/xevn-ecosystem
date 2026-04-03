import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth, differenceInMonths, parseISO } from 'date-fns';

export interface RecruitmentReport {
  totalCandidates: number;
  hiredCount: number;
  rejectedCount: number;
  pendingCount: number;
  sourceStats: { source: string; count: number }[];
  stageStats: { stage: string; count: number }[];
  monthlyTrend: { month: string; applied: number; hired: number }[];
  avgTimeToHire: number;
}

export interface ContractReport {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  expiringContracts: number;
  typeStats: { type: string; count: number }[];
  monthlyExpiring: { month: string; count: number }[];
  renewalRate: number;
}

export interface LeaveReport {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  totalDays: number;
  typeStats: { type: string; count: number; days: number }[];
  departmentStats: { department: string; count: number; days: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export interface TurnoverReport {
  totalActive: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
  avgTenureMonths: number;
  departmentTurnover: { department: string; active: number; left: number; rate: number }[];
  monthlyTrend: { month: string; newHires: number; terminations: number }[];
  tenureDistribution: { range: string; count: number }[];
}

export function useReportsData(year: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [recruitment, setRecruitment] = useState<RecruitmentReport | null>(null);
  const [contracts, setContracts] = useState<ContractReport | null>(null);
  const [leave, setLeave] = useState<LeaveReport | null>(null);
  const [turnover, setTurnover] = useState<TurnoverReport | null>(null);
  const { currentCompanyId } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!currentCompanyId) { setIsLoading(false); return; }
    setIsLoading(true);

    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const now = new Date();

    try {
      // Parallel fetch all data
      const [
        { data: candidates },
        { data: applications },
        { data: empContracts },
        { data: leaveRequests },
        { data: employees },
      ] = await Promise.all([
        supabase.from('candidates').select('id, full_name, stage, source, applied_date').eq('company_id', currentCompanyId),
        supabase.from('candidate_applications').select('id, candidate_id, job_posting_id, stage, applied_date').eq('company_id', currentCompanyId),
        supabase.from('employee_contracts').select('id, contract_type, status, effective_date, expiry_date, renewed_from_id').eq('company_id', currentCompanyId),
        supabase.from('leave_requests').select('id, employee_id, employee_name, leave_type, start_date, total_days, status, department').eq('company_id', currentCompanyId)
          .gte('start_date', yearStart).lte('start_date', yearEnd),
        supabase.from('employees').select('id, department, status, start_date').eq('company_id', currentCompanyId).is('deleted_at', null),
      ]);

      // === RECRUITMENT REPORT ===
      const cands = candidates || [];
      const apps = applications || [];
      const hiredCount = cands.filter(c => c.stage === 'hired').length;
      const rejectedCount = cands.filter(c => c.stage === 'rejected').length;
      const pendingCount = cands.filter(c => !['hired', 'rejected'].includes(c.stage || '')).length;

      const sourceMap = new Map<string, number>();
      cands.forEach(c => {
        const s = c.source || 'Khác';
        sourceMap.set(s, (sourceMap.get(s) || 0) + 1);
      });

      const stageMap = new Map<string, number>();
      cands.forEach(c => {
        const s = c.stage || 'new';
        stageMap.set(s, (stageMap.get(s) || 0) + 1);
      });

      const monthlyRecruitment: { month: string; applied: number; hired: number }[] = [];
      for (let m = 0; m < 12; m++) {
        const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
        const applied = cands.filter(c => c.applied_date?.startsWith(ms)).length;
        const hired = cands.filter(c => c.stage === 'hired' && c.applied_date?.startsWith(ms)).length;
        monthlyRecruitment.push({ month: `T${m + 1}`, applied, hired });
      }

      setRecruitment({
        totalCandidates: cands.length,
        hiredCount, rejectedCount, pendingCount,
        sourceStats: Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })),
        stageStats: Array.from(stageMap.entries()).map(([stage, count]) => ({ stage, count })),
        monthlyTrend: monthlyRecruitment,
        avgTimeToHire: 0,
      });

      // === CONTRACT REPORT ===
      const cts = empContracts || [];
      const activeContracts = cts.filter(c => c.status === 'active').length;
      const expiredContracts = cts.filter(c => c.status === 'expired').length;
      const today = format(now, 'yyyy-MM-dd');
      const in30Days = format(new Date(now.getTime() + 30 * 86400000), 'yyyy-MM-dd');
      const expiringContracts = cts.filter(c => c.status === 'active' && c.expiry_date && c.expiry_date >= today && c.expiry_date <= in30Days).length;

      const typeMap = new Map<string, number>();
      cts.forEach(c => {
        typeMap.set(c.contract_type, (typeMap.get(c.contract_type) || 0) + 1);
      });

      const monthlyExpiring: { month: string; count: number }[] = [];
      for (let m = 0; m < 12; m++) {
        const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
        const count = cts.filter(c => c.expiry_date?.startsWith(ms)).length;
        monthlyExpiring.push({ month: `T${m + 1}`, count });
      }

      const renewed = cts.filter(c => c.renewed_from_id).length;
      const renewalRate = expiredContracts > 0 ? Math.round((renewed / (renewed + expiredContracts)) * 100) : 0;

      setContracts({
        totalContracts: cts.length,
        activeContracts, expiredContracts, expiringContracts,
        typeStats: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
        monthlyExpiring,
        renewalRate,
      });

      // === LEAVE REPORT ===
      const lvs = leaveRequests || [];
      const approvedRequests = lvs.filter(l => l.status === 'approved').length;
      const pendingLv = lvs.filter(l => l.status === 'pending').length;
      const rejectedLv = lvs.filter(l => l.status === 'rejected').length;
      const totalDays = lvs.filter(l => l.status === 'approved').reduce((s, l) => s + (l.total_days || 0), 0);

      const leaveTypeMap = new Map<string, { count: number; days: number }>();
      lvs.forEach(l => {
        const t = l.leave_type || 'other';
        const cur = leaveTypeMap.get(t) || { count: 0, days: 0 };
        cur.count++;
        if (l.status === 'approved') cur.days += l.total_days || 0;
        leaveTypeMap.set(t, cur);
      });

      const leaveDeptMap = new Map<string, { count: number; days: number }>();
      lvs.forEach(l => {
        const d = l.department || 'Khác';
        const cur = leaveDeptMap.get(d) || { count: 0, days: 0 };
        cur.count++;
        if (l.status === 'approved') cur.days += l.total_days || 0;
        leaveDeptMap.set(d, cur);
      });

      const monthlyLeave: { month: string; count: number }[] = [];
      for (let m = 0; m < 12; m++) {
        const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
        monthlyLeave.push({ month: `T${m + 1}`, count: lvs.filter(l => l.start_date?.startsWith(ms)).length });
      }

      setLeave({
        totalRequests: lvs.length,
        approvedRequests, pendingRequests: pendingLv, rejectedRequests: rejectedLv,
        totalDays,
        typeStats: Array.from(leaveTypeMap.entries()).map(([type, s]) => ({ type, ...s })),
        departmentStats: Array.from(leaveDeptMap.entries()).map(([department, s]) => ({ department, ...s })),
        monthlyTrend: monthlyLeave,
      });

      // === TURNOVER REPORT ===
      const emps = employees || [];
      const activeEmps = emps.filter(e => e.status === 'active');
      const newHires = emps.filter(e => e.start_date && e.start_date >= yearStart && e.start_date <= yearEnd).length;

      // Fetch terminated employees for the year
      const { data: allEmps } = await supabase
        .from('employees').select('id, department, status, start_date, deleted_at').eq('company_id', currentCompanyId)
        .not('deleted_at', 'is', null)
        .gte('deleted_at', yearStart).lte('deleted_at', yearEnd);

      const terminated = allEmps || [];
      const terminations = terminated.length;
      const avgHeadcount = activeEmps.length > 0 ? activeEmps.length : 1;
      const turnoverRate = Math.round((terminations / avgHeadcount) * 10000) / 100;

      // Tenure distribution
      const tenures = activeEmps.map(e => {
        if (!e.start_date) return 0;
        return differenceInMonths(now, parseISO(e.start_date));
      });
      const avgTenure = tenures.length > 0 ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length) : 0;

      const tenureBuckets = [
        { range: '< 6 tháng', min: 0, max: 6 },
        { range: '6-12 tháng', min: 6, max: 12 },
        { range: '1-2 năm', min: 12, max: 24 },
        { range: '2-5 năm', min: 24, max: 60 },
        { range: '> 5 năm', min: 60, max: 9999 },
      ];
      const tenureDistribution = tenureBuckets.map(b => ({
        range: b.range,
        count: tenures.filter(t => t >= b.min && t < b.max).length,
      }));

      // Department turnover
      const deptActive = new Map<string, number>();
      activeEmps.forEach(e => {
        const d = e.department || 'Khác';
        deptActive.set(d, (deptActive.get(d) || 0) + 1);
      });
      const deptLeft = new Map<string, number>();
      terminated.forEach(e => {
        const d = e.department || 'Khác';
        deptLeft.set(d, (deptLeft.get(d) || 0) + 1);
      });
      const allDepts = new Set([...deptActive.keys(), ...deptLeft.keys()]);
      const departmentTurnover = Array.from(allDepts).map(d => {
        const active = deptActive.get(d) || 0;
        const left = deptLeft.get(d) || 0;
        return { department: d, active, left, rate: active > 0 ? Math.round((left / active) * 10000) / 100 : 0 };
      });

      // Monthly trend
      const monthlyTurnover: { month: string; newHires: number; terminations: number }[] = [];
      for (let m = 0; m < 12; m++) {
        const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
        monthlyTurnover.push({
          month: `T${m + 1}`,
          newHires: emps.filter(e => e.start_date?.startsWith(ms)).length,
          terminations: terminated.filter(e => (e.deleted_at as string)?.startsWith(ms)).length,
        });
      }

      setTurnover({
        totalActive: activeEmps.length,
        newHires, terminations, turnoverRate,
        avgTenureMonths: avgTenure,
        departmentTurnover, monthlyTrend: monthlyTurnover, tenureDistribution,
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { isLoading, recruitment, contracts, leave, turnover, refetch: fetchAll };
}
