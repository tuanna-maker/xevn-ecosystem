import { differenceInMonths, format, parseISO } from 'date-fns';
import type { HrmContractRecord, HrmEmployeeRecord, HrmLeaveRequest, HrmRecruitmentCandidate } from '@/integrations/hrmApi';

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

export interface OperationsSummaryReport {
  attendanceRecords: number;
  payrollPeriods: number;
  jobRequisitions: number;
  tasks: number;
  payrollReconciliation?: { draft: number; processed: number; closed: number };
}

function employeeDepartment(emp: HrmEmployeeRecord): string {
  return emp.custom_fields?.department?.trim() || emp.job_title_key?.trim() || 'Khác';
}

function employeeStartDate(emp: HrmEmployeeRecord): string | null {
  return emp.hired_at?.split('T')[0] ?? null;
}

export function buildRecruitmentReportFromApi(
  candidates: HrmRecruitmentCandidate[],
  year: number,
): RecruitmentReport {
  const yearPrefix = `${year}-`;
  const inYear = candidates.filter((c) => c.created_at.startsWith(yearPrefix));
  const hiredCount = candidates.filter((c) => c.status === 'hired').length;
  const rejectedCount = candidates.filter((c) => c.status === 'rejected').length;
  const pendingCount = candidates.filter((c) => !['hired', 'rejected'].includes(c.status)).length;

  const sourceMap = new Map<string, number>();
  candidates.forEach((c) => {
    const s = c.source?.trim() || 'Khác';
    sourceMap.set(s, (sourceMap.get(s) || 0) + 1);
  });

  const stageMap = new Map<string, number>();
  candidates.forEach((c) => {
    stageMap.set(c.status || 'new', (stageMap.get(c.status || 'new') || 0) + 1);
  });

  const monthlyTrend = Array.from({ length: 12 }, (_, m) => {
    const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
    return {
      month: `T${m + 1}`,
      applied: inYear.filter((c) => c.created_at.startsWith(ms)).length,
      hired: inYear.filter((c) => c.status === 'hired' && c.created_at.startsWith(ms)).length,
    };
  });

  return {
    totalCandidates: candidates.length,
    hiredCount,
    rejectedCount,
    pendingCount,
    sourceStats: Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })),
    stageStats: Array.from(stageMap.entries()).map(([stage, count]) => ({ stage, count })),
    monthlyTrend,
    avgTimeToHire: 0,
  };
}

export function buildContractReportFromApi(
  contracts: HrmContractRecord[],
  expiringTotal: number,
  year: number,
  now = new Date(),
): ContractReport {
  const activeContracts = contracts.filter((c) => c.status === 'active').length;
  const expiredContracts = contracts.filter((c) => c.status === 'expired' || c.status === 'terminated').length;
  const today = format(now, 'yyyy-MM-dd');
  const in30Days = format(new Date(now.getTime() + 30 * 86400000), 'yyyy-MM-dd');
  const expiringContracts = contracts.filter(
    (c) => c.status === 'active' && c.end_date >= today && c.end_date <= in30Days,
  ).length;

  const typeMap = new Map<string, number>();
  contracts.forEach((c) => {
    typeMap.set(c.contract_type, (typeMap.get(c.contract_type) || 0) + 1);
  });

  const monthlyExpiring = Array.from({ length: 12 }, (_, m) => {
    const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
    return {
      month: `T${m + 1}`,
      count: contracts.filter((c) => c.end_date?.startsWith(ms)).length,
    };
  });

  const renewalRate = expiredContracts > 0 ? Math.round((0 / expiredContracts) * 100) : 0;

  return {
    totalContracts: contracts.length,
    activeContracts,
    expiredContracts,
    expiringContracts: expiringContracts || expiringTotal,
    typeStats: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
    monthlyExpiring,
    renewalRate,
  };
}

export function buildLeaveReportFromApi(leaves: HrmLeaveRequest[], year: number): LeaveReport {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const lvs = leaves.filter((l) => l.start_date >= yearStart && l.start_date <= yearEnd);
  const approvedRequests = lvs.filter((l) => l.status === 'approved').length;
  const pendingLv = lvs.filter((l) => l.status === 'pending').length;
  const rejectedLv = lvs.filter((l) => l.status === 'rejected').length;
  const totalDays = lvs
    .filter((l) => l.status === 'approved')
    .reduce((s, l) => s + (Number.parseFloat(l.total_days) || 0), 0);

  const leaveTypeMap = new Map<string, { count: number; days: number }>();
  lvs.forEach((l) => {
    const t = l.leave_type || 'other';
    const cur = leaveTypeMap.get(t) || { count: 0, days: 0 };
    cur.count++;
    if (l.status === 'approved') cur.days += Number.parseFloat(l.total_days) || 0;
    leaveTypeMap.set(t, cur);
  });

  const leaveDeptMap = new Map<string, { count: number; days: number }>();
  lvs.forEach((l) => {
    const d = l.department?.trim() || 'Khác';
    const cur = leaveDeptMap.get(d) || { count: 0, days: 0 };
    cur.count++;
    if (l.status === 'approved') cur.days += Number.parseFloat(l.total_days) || 0;
    leaveDeptMap.set(d, cur);
  });

  const monthlyTrend = Array.from({ length: 12 }, (_, m) => {
    const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
    return { month: `T${m + 1}`, count: lvs.filter((l) => l.start_date.startsWith(ms)).length };
  });

  return {
    totalRequests: lvs.length,
    approvedRequests,
    pendingRequests: pendingLv,
    rejectedRequests: rejectedLv,
    totalDays,
    typeStats: Array.from(leaveTypeMap.entries()).map(([type, s]) => ({ type, ...s })),
    departmentStats: Array.from(leaveDeptMap.entries()).map(([department, s]) => ({ department, ...s })),
    monthlyTrend,
  };
}

export function buildTurnoverReportFromApi(
  employees: HrmEmployeeRecord[],
  year: number,
  now = new Date(),
): TurnoverReport {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const activeEmps = employees.filter((e) => e.status === 'active' && !e.archived_at);
  const archivedInYear = employees.filter((e) => {
    if (!e.archived_at) return false;
    const d = e.archived_at.split('T')[0];
    return d >= yearStart && d <= yearEnd;
  });
  const newHires = employees.filter((e) => {
    const sd = employeeStartDate(e);
    return sd != null && sd >= yearStart && sd <= yearEnd;
  }).length;
  const terminations = archivedInYear.length;
  const avgHeadcount = activeEmps.length > 0 ? activeEmps.length : 1;
  const turnoverRate = Math.round((terminations / avgHeadcount) * 10000) / 100;

  const tenures = activeEmps.map((e) => {
    const sd = employeeStartDate(e);
    if (!sd) return 0;
    return differenceInMonths(now, parseISO(sd));
  });
  const avgTenure = tenures.length > 0 ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length) : 0;

  const tenureBuckets = [
    { range: '< 6 tháng', min: 0, max: 6 },
    { range: '6-12 tháng', min: 6, max: 12 },
    { range: '1-2 năm', min: 12, max: 24 },
    { range: '2-5 năm', min: 24, max: 60 },
    { range: '> 5 năm', min: 60, max: 9999 },
  ];
  const tenureDistribution = tenureBuckets.map((b) => ({
    range: b.range,
    count: tenures.filter((t) => t >= b.min && t < b.max).length,
  }));

  const deptActive = new Map<string, number>();
  activeEmps.forEach((e) => {
    const d = employeeDepartment(e);
    deptActive.set(d, (deptActive.get(d) || 0) + 1);
  });
  const deptLeft = new Map<string, number>();
  archivedInYear.forEach((e) => {
    const d = employeeDepartment(e);
    deptLeft.set(d, (deptLeft.get(d) || 0) + 1);
  });
  const allDepts = new Set([...deptActive.keys(), ...deptLeft.keys()]);
  const departmentTurnover = Array.from(allDepts).map((d) => {
    const active = deptActive.get(d) || 0;
    const left = deptLeft.get(d) || 0;
    return { department: d, active, left, rate: active > 0 ? Math.round((left / active) * 10000) / 100 : 0 };
  });

  const monthlyTrend = Array.from({ length: 12 }, (_, m) => {
    const ms = `${year}-${String(m + 1).padStart(2, '0')}`;
    return {
      month: `T${m + 1}`,
      newHires: employees.filter((e) => employeeStartDate(e)?.startsWith(ms)).length,
      terminations: archivedInYear.filter((e) => e.archived_at?.startsWith(ms)).length,
    };
  });

  return {
    totalActive: activeEmps.length,
    newHires,
    terminations,
    turnoverRate,
    avgTenureMonths: avgTenure,
    departmentTurnover,
    monthlyTrend,
    tenureDistribution,
  };
}

export function mapOperationsSummaryReport(summary: {
  attendance_records: number;
  payroll_periods: number;
  job_requisitions: number;
  tasks: number;
}): OperationsSummaryReport {
  return {
    attendanceRecords: summary.attendance_records,
    payrollPeriods: summary.payroll_periods,
    jobRequisitions: summary.job_requisitions,
    tasks: summary.tasks,
  };
}
