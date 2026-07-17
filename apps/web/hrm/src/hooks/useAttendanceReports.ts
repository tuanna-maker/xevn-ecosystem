/**
 * @CODE-MEMORY
 * Screen:     /attendance — Báo cáo chấm công · Overview reports (optional)
 * UC:         UF-HRM-05 · HRM-OP-04
 * BR:         BR-ATT-REPORT-01
 * SRS:        docs/hrm/SRS.md (attendance reports)
 * TechSpec:   docs/hrm/TECHSPEC.md attendance-records
 * Purpose:    Aggregate monthly attendance/leave via Nest hrm-api (no Supabase).
 *             Fixes D-HRM-RPT-ATT-REF-01 (broken leftover error/data bindings).
 * WorkItem:   P1-HRM-MENU-QA-REPORTS-FIX
 * Coded:      2026-07-17
 *
 * Callers:
 *   - components/attendance/AttendanceReportsTab.tsx
 *
 * Callees:
 *   - listAttendanceRecords / listEmployees / listLeaveRequests
 *
 * must_keep:  Nest API only; company scope via coerceHrmListCompanyId; no 12× month fan-out
 * SOLID:      Pure aggregation after parallel fetch; SRP = attendance report slice
 * LastVerified: apps/web/hrm/src/hooks/useAttendanceReports.test.ts
 */
import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
  listAttendanceRecords,
  listEmployees,
  listLeaveRequests,
  type HrmAttendanceRecord,
  type HrmLeaveRequest,
} from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';

export interface AttendanceSummary {
  totalEmployees: number;
  totalWorkDays: number;
  presentCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  leaveCount: number;
  overtimeHours: number;
  attendanceRate: number;
  lateRate: number;
}

export interface DepartmentAttendance {
  department: string;
  presentCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface EmployeeAttendanceSummary {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string | null;
  workDays: number;
  presentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  leaveDays: number;
  absentDays: number;
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}

export interface DailyAttendance {
  date: string;
  dayLabel: string;
  presentCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
  totalEmployees: number;
}

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  attendanceRate: number;
  lateRate: number;
  leaveRate: number;
}

export interface LeaveTypeSummary {
  leaveType: string;
  count: number;
  totalDays: number;
}

type AttendanceRow = HrmAttendanceRecord & {
  department?: string | null;
  late_minutes?: number | null;
  early_leave_minutes?: number | null;
  overtime_hours?: number | null;
};

function isPresentStatus(status: string): boolean {
  return status === 'present' || status === 'late' || status === 'early_leave';
}

async function listAttendanceRecordsInRange(
  companyId: string,
  fromDate: string,
  toDate: string,
): Promise<AttendanceRow[]> {
  const all: AttendanceRow[] = [];
  let page = 1;
  let total = 0;
  for (;;) {
    const res = await listAttendanceRecords({
      company_id: companyId,
      from_date: fromDate,
      to_date: toDate,
      page,
      page_size: HRM_API_MAX_PAGE_SIZE,
    });
    total = res.total ?? all.length;
    const batch = (res.data ?? []) as AttendanceRow[];
    all.push(...batch);
    if (batch.length === 0 || all.length >= total) break;
    page += 1;
    // Hard cap: avoid runaway fan-out under rate-limit (NFR residual)
    if (page > 50) break;
  }
  return all;
}

function leaveDaysOf(leave: HrmLeaveRequest): number {
  return Number.parseFloat(String(leave.total_days ?? 0)) || 0;
}

export function useAttendanceReports(year: number, month: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentAttendance[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeAttendanceSummary[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyAttendance[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [leaveTypeStats, setLeaveTypeStats] = useState<LeaveTypeSummary[]>([]);
  const { currentCompanyId } = useAuth();

  const fetchReports = useCallback(async () => {
    if (!currentCompanyId) {
      setIsLoading(false);
      return;
    }

    const companyId = coerceHrmListCompanyId(currentCompanyId);

    try {
      setIsLoading(true);

      const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

      const [records, employeeRes, leaveRes] = await Promise.all([
        listAttendanceRecordsInRange(companyId, startDate, endDate),
        listEmployees({
          company_id: companyId,
          status: 'active',
          page: 1,
          page_size: 1,
        }),
        listLeaveRequests({ company_id: companyId }),
      ]);

      const totalEmployees = employeeRes.total ?? 0;
      const leaves = (leaveRes.data ?? []).filter((l) => {
        const s = l.start_date;
        return s >= startDate && s <= endDate;
      });

      const daysInMonth = eachDayOfInterval({
        start: new Date(year, month - 1, 1),
        end: endOfMonth(new Date(year, month - 1)),
      }).filter((d) => d.getDay() !== 0 && d.getDay() !== 6).length;

      const totalWorkDays = totalEmployees * daysInMonth;
      const presentCount = records.filter((r) => isPresentStatus(r.status)).length;
      const lateCount = records.filter(
        (r) => r.status === 'late' || (r.late_minutes != null && r.late_minutes > 0),
      ).length;
      const earlyLeaveCount = records.filter(
        (r) => r.status === 'early_leave' || (r.early_leave_minutes != null && r.early_leave_minutes > 0),
      ).length;
      const leaveCount = leaves.reduce((sum, l) => sum + leaveDaysOf(l), 0);
      const absentCount = Math.max(
        0,
        records.filter((r) => r.status === 'absent').length,
      );
      const overtimeHours = records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

      setSummary({
        totalEmployees,
        totalWorkDays,
        presentCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        leaveCount,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        attendanceRate:
          totalWorkDays > 0 ? Math.round((presentCount / totalWorkDays) * 10000) / 100 : 0,
        lateRate: presentCount > 0 ? Math.round((lateCount / presentCount) * 10000) / 100 : 0,
      });

      const deptMap = new Map<
        string,
        { present: number; late: number; leave: number; absent: number; total: number }
      >();
      records.forEach((r) => {
        const dept = r.department || 'Không có phòng ban';
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { present: 0, late: 0, leave: 0, absent: 0, total: 0 });
        }
        const stats = deptMap.get(dept)!;
        stats.total++;
        if (isPresentStatus(r.status)) stats.present++;
        if (r.status === 'late' || (r.late_minutes != null && r.late_minutes > 0)) stats.late++;
        if (r.status === 'leave') stats.leave++;
        if (r.status === 'absent') stats.absent++;
      });

      setDepartmentStats(
        Array.from(deptMap.entries()).map(([dept, stats]) => ({
          department: dept,
          presentCount: stats.present,
          lateCount: stats.late,
          leaveCount: stats.leave,
          absentCount: stats.absent,
          attendanceRate:
            stats.total > 0 ? Math.round((stats.present / stats.total) * 10000) / 100 : 0,
        })),
      );

      // Employee detail: only IDs seen in records (avoid full-directory dump)
      const empMap = new Map<
        string,
        {
          code: string;
          name: string;
          department: string | null;
          workDays: number;
          present: number;
          late: number;
          earlyLeave: number;
          lateMinutes: number;
          earlyLeaveMinutes: number;
          overtime: number;
        }
      >();

      records.forEach((r) => {
        if (!empMap.has(r.employee_id)) {
          empMap.set(r.employee_id, {
            code: r.employee_id.slice(0, 8),
            name: r.employee_id.slice(0, 8),
            department: r.department ?? null,
            workDays: daysInMonth,
            present: 0,
            late: 0,
            earlyLeave: 0,
            lateMinutes: 0,
            earlyLeaveMinutes: 0,
            overtime: 0,
          });
        }
        const emp = empMap.get(r.employee_id)!;
        if (isPresentStatus(r.status)) emp.present++;
        if (r.status === 'late' || (r.late_minutes != null && r.late_minutes > 0)) {
          emp.late++;
          emp.lateMinutes += r.late_minutes || 0;
        }
        if (r.status === 'early_leave' || (r.early_leave_minutes != null && r.early_leave_minutes > 0)) {
          emp.earlyLeave++;
          emp.earlyLeaveMinutes += r.early_leave_minutes || 0;
        }
        emp.overtime += r.overtime_hours || 0;
      });

      const empLeaveMap = new Map<string, number>();
      leaves.forEach((l) => {
        empLeaveMap.set(l.employee_id, (empLeaveMap.get(l.employee_id) || 0) + leaveDaysOf(l));
      });

      setEmployeeStats(
        Array.from(empMap.entries()).map(([id, stats]) => {
          const leaveDays = empLeaveMap.get(id) || 0;
          const absentDays = Math.max(0, stats.workDays - stats.present - leaveDays);
          return {
            employeeId: id,
            employeeCode: stats.code,
            employeeName: stats.name,
            department: stats.department,
            workDays: stats.workDays,
            presentDays: stats.present,
            lateDays: stats.late,
            earlyLeaveDays: stats.earlyLeave,
            leaveDays,
            absentDays,
            totalLateMinutes: stats.lateMinutes,
            totalEarlyLeaveMinutes: stats.earlyLeaveMinutes,
            totalOvertimeHours: Math.round(stats.overtime * 100) / 100,
            attendanceRate:
              stats.workDays > 0 ? Math.round((stats.present / stats.workDays) * 10000) / 100 : 0,
          };
        }),
      );

      const dailyMap = new Map<string, { present: number; late: number; leave: number; absent: number }>();
      const allDays = eachDayOfInterval({
        start: new Date(year, month - 1, 1),
        end: endOfMonth(new Date(year, month - 1)),
      });
      allDays.forEach((day) => {
        dailyMap.set(format(day, 'yyyy-MM-dd'), { present: 0, late: 0, leave: 0, absent: 0 });
      });
      records.forEach((r) => {
        const stats = dailyMap.get(r.attendance_date);
        if (!stats) return;
        if (isPresentStatus(r.status)) stats.present++;
        if (r.status === 'late' || (r.late_minutes != null && r.late_minutes > 0)) stats.late++;
        if (r.status === 'leave') stats.leave++;
        if (r.status === 'absent') stats.absent++;
      });

      const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      setDailyStats(
        Array.from(dailyMap.entries()).map(([date, stats]) => {
          const d = parseISO(date);
          return {
            date,
            dayLabel: `${dayLabels[d.getDay()]} ${format(d, 'dd')}`,
            presentCount: stats.present,
            lateCount: stats.late,
            leaveCount: stats.leave,
            absentCount: stats.absent,
            totalEmployees,
          };
        }),
      );

      const leaveTypeMap = new Map<string, { count: number; days: number }>();
      leaves.forEach((l) => {
        const type = l.leave_type || 'Khác';
        const cur = leaveTypeMap.get(type) || { count: 0, days: 0 };
        cur.count++;
        cur.days += leaveDaysOf(l);
        leaveTypeMap.set(type, cur);
      });
      setLeaveTypeStats(
        Array.from(leaveTypeMap.entries()).map(([type, stats]) => ({
          leaveType: type,
          count: stats.count,
          totalDays: stats.days,
        })),
      );

      // Single-month trend point only (no 12× API fan-out / 429 risk)
      const trendTotal = records.length;
      const trendPresent = presentCount;
      setMonthlyTrend([
        {
          month: format(new Date(year, month - 1, 1), 'yyyy-MM'),
          monthLabel: `T${month}`,
          attendanceRate: trendTotal > 0 ? Math.round((trendPresent / trendTotal) * 10000) / 100 : 0,
          lateRate: trendPresent > 0 ? Math.round((lateCount / trendPresent) * 10000) / 100 : 0,
          leaveRate: 0,
        },
      ]);
    } catch (error) {
      console.error('Error fetching attendance reports:', error);
      setSummary(null);
      setDepartmentStats([]);
      setEmployeeStats([]);
      setDailyStats([]);
      setMonthlyTrend([]);
      setLeaveTypeStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, year, month]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  return {
    isLoading,
    summary,
    departmentStats,
    employeeStats,
    dailyStats,
    monthlyTrend,
    leaveTypeStats,
    refetch: fetchReports,
  };
}
